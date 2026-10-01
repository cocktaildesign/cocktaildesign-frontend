const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function queries(fetchStrapi) {
  const mod = {exports:{}};
  const source = fs.readFileSync(path.resolve(__dirname,'../src/lib/api/catalog/queries.ts'),'utf8');
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const imports = {
    '@/lib/api/strapi/client': {fetchStrapi},
    '@/lib/api/strapi/media': {getStrapiMediaUrl: url=>url},
    './mappers': {mapProductPreview:item=>item},
  };
  vm.runInNewContext(js,{module:mod,exports:mod.exports,require:id=>{
    assert.ok(id in imports,`Unexpected dependency ${id}`); return imports[id];
  }});
  return mod.exports;
}

test('home previews keep order, prices, variants and full-section links; catalogue pagination is unaffected', async () => {
  const calls=[];
  const all = Array.from({length:120},(_,i)=>({id:String(i),price:490+i,variants:[{id:'v'+i,price:900+i,priceOld:0}]}));
  const api = queries(async (url,params)=>{
    calls.push({url,params});
    if (url==='/api/homepage') return {data:{collectionAfterShortcuts:{slug:'novinki',selectionMode:'new'},saleCollectionAfterTelegram:{slug:'sale',selectionMode:'discount'}}};
    const slug=url.match(/^\/api\/catalog\/collection\/([^/]+)\/products$/)?.[1];
    assert.ok(slug);
    const limit=Number(params.limit),offset=Number(params.offset);
    return {collection:{id:'1',slug,title:'Подборка',selectionMode:slug==='sale'?'discount':'new'},items:all.slice(offset,offset+limit),total:all.length,limit,offset,hasMore:offset+limit<all.length};
  });
  const home=await api.getHomepageCollectionsFromStrapi();
  for (const slot of [home.collectionAfterShortcuts,home.saleCollectionAfterTelegram]) {
    assert.ok(slot.products.length>=8 && slot.products.length<=16,'small useful homepage preview');
    assert.equal(JSON.stringify(slot.products),JSON.stringify(all.slice(0,slot.products.length)));
    assert.equal(slot.viewAllHref,`/catalog/collection/${slot.slug}`);
  }
  const page=await api.getCollectionProductsFromStrapi({slug:'novinki',limit:50,offset:50});
  assert.equal(page.items.length,50);
  assert.equal(page.total,120);
  assert.equal(page.hasMore,true);
  assert.equal(page.items[0].id,'50');
  assert.equal(calls.at(-1).params.limit,'50');
});

test('one unavailable collection does not hide other home shelves; non-sale collection cannot populate sale slot', async () => {
  const api=queries(async (url)=>{
    if (url==='/api/homepage') return {data:{collectionAfterShortcuts:{slug:'broken'},collectionAfterKnowledge:{slug:'ok'},saleCollectionAfterTelegram:{slug:'not-sale',selectionMode:'manual'}}};
    if(url==='/api/catalog/collection/broken/products') throw new Error('Unavailable');
    assert.equal(url,'/api/catalog/collection/ok/products');
    return {collection:{id:'1',title:'Работает',slug:'ok',selectionMode:'manual'},items:[],total:0,limit:12,offset:0,hasMore:false};
  });
  const home=await api.getHomepageCollectionsFromStrapi();
  assert.equal(home.collectionAfterShortcuts,null);
  assert.equal(home.saleCollectionAfterTelegram,null);
  assert.equal(home.collectionAfterKnowledge.title,'Работает');
});
