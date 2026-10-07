const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, localStorage) {
  const module = {exports:{}};
  const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require,localStorage,console});
  return module.exports;
}
const plain = v => JSON.parse(JSON.stringify(v));
const row = (slug, code, id='65') => ({id,slug,code,name:code,price:950,priceOld:1000,imageUrl:null,quantity:2,engraving:true,discountExcluded:false});
function storage(entries={}) {
 const memory = new Map(Object.entries(entries));
 return {getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
}
test('legacy cart stays intact; variant and ordinary product with the same ID are independent',()=>{
 const original = row('strainer','StJShellBl');
 const saved = {items:[original],promoCode:'KEEP',promoDiscount:100,promoType:'fixed',promoBonusMessage:'gift',promoReplacesVolumeDiscount:false};
 const disk=storage({'cocktaildesign:cart':JSON.stringify({state:saved,version:0})});
 const {useCartStore:store,cartLineKey:key}=load('src/lib/cart/cartStore.ts',disk);
 assert.deepEqual(plain(store.getState().items),saved.items);
 assert.equal(store.getState().promoCode,'KEEP');
 const jigger={...row('jigger','JigV25\\40'),productId:'65',variantId:null,price:600};
 store.getState().addItem(jigger);
 assert.equal(store.getState().items.length,2);
 store.getState().updateQuantity(key(jigger),3);
 store.getState().setEngraving(key(jigger),false);
 assert.equal(store.getState().items[0].quantity,2);assert.equal(store.getState().items[0].engraving,true);
 assert.equal(store.getState().items[1].quantity,3);assert.equal(store.getState().items[1].engraving,false);
 store.getState().toggleSelected(key(jigger));store.getState().removeSelected();
 assert.deepEqual(plain(store.getState().items),[original]);
 const restored=load('src/lib/cart/cartStore.ts',disk).useCartStore;
 assert.deepEqual(plain(restored.getState().items),[original]);
});
test('adding the same variant merges a legacy row without confusing literal SKUs or other colors',()=>{
 const {useCartStore:store,cartLineKey:key}=load('src/lib/cart/cartStore.ts',storage());
 const first=row('same-parent','JigV25/40');store.getState().addItem(first);
 store.getState().addItem({...first,productId:'1456',variantId:'65',quantity:1});
 assert.equal(store.getState().items.length,1);assert.equal(store.getState().items[0].quantity,3);
 assert.equal(store.getState().items[0].productId,'1456');
 const slash=row('same-parent','JigV25\\40');store.getState().addItem(slash);
 const gold=row('same-parent','gold','66');store.getState().addItem(gold);
 assert.equal(store.getState().items.length,3);
 store.getState().removeItem(key(gold));assert.equal(store.getState().items.length,2);
});
test('links keep explicit variants and resolve old cart colors by literal SKU, never by ambiguous ID',()=>{
 const {cartProductHref:href}=load('src/lib/cart/cartStore.ts',storage());
 assert.equal(href({...row('spoon','Gold','102'),variantId:'102'}),'/catalog/product/spoon?variant=102');
 assert.equal(href(row('spoon','JigV25/40')),'/catalog/product/spoon?sku=JigV25%2F40');
 assert.equal(href({...row('jigger','JigV25\\40'),variantId:null}),'/catalog/product/jigger');
});
test('favorites preserve old records and resolve only explicit choices; parent and variant numbers do not collide',()=>{
 const disk=storage({'cocktaildesign:favorites':JSON.stringify({state:{ids:{65:true,102:true}},version:0})});
 const {useFavoritesStore:store}=load('src/lib/favorites/favoritesStore.ts',disk);
 store.getState().save({productId:'1456',slug:'strainer',variantId:'65'});
 store.getState().save({productId:'65',slug:'jigger',variantId:null});
 assert.deepEqual(Object.keys(store.getState().ids).sort(),['102','65','product:1456','product:65']);
 store.getState().resolveLegacy('102',{productId:'200',slug:'spoon',variantId:'102'});
 assert.equal(store.getState().ids['65'],true,'ambiguous old record retained');
 store.getState().toggle('product:65');assert.equal(store.getState().ids['product:1456'],true);
 const restored=load('src/lib/favorites/favoritesStore.ts',disk).useFavoritesStore;
 assert.equal(restored.getState().references['product:200'].variantId,'102');
 assert.equal(restored.getState().ids['65'],true);
});
test('legacy index keeps both possible products rather than silently choosing a coincident ID',()=>{
 const {indexLegacyFavorites}=load('src/lib/favorites/legacy.ts');
 const index=indexLegacyFavorites([{id:'65',name:'Jigger',slug:'jigger',variants:[]},
  {id:'1456',name:'Strainer',slug:'strainer',variants:[{id:'65',name:'Black strainer'}]},
  {id:'200',name:'Spoon',slug:'spoon',variants:[{id:'102',name:'Gold spoon'}]}]);
 assert.equal(index['65'].length,2);assert.equal(index['102'].length,1);
 assert.equal(index['102'][0].productId,'200');assert.equal(index['102'][0].variantId,'102');
});

test('legacy recovery endpoint validates IDs, shares public GET work, and retries failures without losing data',async()=>{
 const filename='src/app/api/legacy-favorites/route.ts';
 const code=ts.transpileModule(fs.readFileSync(path.join(root,filename),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const {indexLegacyFavorites}=load('src/lib/favorites/legacy.ts');
 let reads=0,fail=true;
 const module={exports:{}};
 const imports={
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status??200})}},
  '@/lib/api/strapi/client':{fetchStrapi:async path=>{assert.equal(path,'/api/catalog/categories-flat');reads++;if(fail)throw Error('offline');return [{slug:'root',parentId:null}];}},
  '@/lib/api/catalog/queries':{getProductsByCategorySlugFromStrapi:async params=>{
   assert.equal(params.categorySlug,'root');assert.equal(params.limit,100);
   return {items:[{id:'200',name:'Spoon',slug:'spoon',variants:[{id:'102',name:'Gold'}]}],hasMore:false};
  }},
  '@/lib/favorites/legacy':{indexLegacyFavorites},
 };
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>{assert(imports[id],id);return imports[id];},Date});
 const get=ids=>module.exports.GET({nextUrl:new URL('http://local/api/legacy-favorites?ids='+encodeURIComponent(ids))});
 assert.equal((await get('wrong')).status,400);assert.equal(reads,0);
 assert.equal((await get('102')).status,503);fail=false;
 const both=await Promise.all([get('102'),get('102')]);
 assert.equal(reads,2,'one shared rebuild after the failed read');
 assert.equal(both[0].body.candidates['102'][0].productId,'200');
 assert.equal((await get('999')).body.candidates['999'].length,0);assert.equal(reads,2,'warm index reused');
});
