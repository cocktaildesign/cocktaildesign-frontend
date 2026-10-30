const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const {webcrypto}=require('node:crypto');
const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/cart/checkoutKey.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const items=[{code:'Jig25/40',quantity:2,engraving:false}];
function disk(){const rows=new Map();return {getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v),rows};}
function tab(storage,locks){let state={items,checkoutKey:''};const store={getState:()=>state,setState:v=>{state={...state,...v};storage.setItem('cocktaildesign:cart',JSON.stringify({state}));}};
 const module={exports:{}};vm.runInNewContext(source,{module,exports:module.exports,require:n=>{assert.equal(n,'./cartStore');return {useCartStore:store};},localStorage:storage,crypto:webcrypto,navigator:{locks}});
 return {...module.exports,store};}
test('lost response and page reload reuse the same persisted opaque key, without buyer data',async()=>{
 const d=disk(),a=tab(d);const key=await a.getCheckoutKey();assert.match(key,/^[\da-f-]{36}$/);assert.equal(await tab(d).getCheckoutKey(),key);
 assert.deepEqual(Object.keys(JSON.parse(d.getItem('cocktaildesign:cart')).state),['items','checkoutKey']);
 a.store.setState({items:[{...items[0],quantity:3}]});assert.equal(await a.getCheckoutKey(),key,'Do not blindly create another order after an uncertain response');
});
test('two tabs acquire one key under Web Locks; existing engraving key is retained',async()=>{
 const d=disk();let tail=Promise.resolve();const locks={request:(_,fn)=>{const next=tail.then(fn);tail=next;return next;}};
 const a=tab(d,locks),b=tab(d,locks);const [x,y]=await Promise.all([a.getCheckoutKey('engraving-order-key'),b.getCheckoutKey()]);assert.equal(x,y);assert.equal(x,'engraving-order-key');
});
test('after confirmed checkout clears the cart, a new purchase gets a new key',async()=>{
 const d=disk(),a=tab(d);const old=await a.getCheckoutKey();a.store.setState({items:[],checkoutKey:''});a.store.setState({items});assert.notEqual(await a.getCheckoutKey(),old);
});
test('storage denial retains in-memory key for retries instead of blocking checkout',async()=>{
 let state={items,checkoutKey:''};const module={exports:{}};vm.runInNewContext(source,{module,exports:module.exports,require:()=>({useCartStore:{getState:()=>state,setState:v=>Object.assign(state,v)}}),localStorage:{getItem(){throw Error('blocked');}},crypto:webcrypto,navigator:{}});
 const key=await module.exports.getCheckoutKey();assert.equal(await module.exports.getCheckoutKey(),key);
});
