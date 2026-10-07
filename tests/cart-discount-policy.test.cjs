const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root=path.resolve(__dirname,'..');
const item=(code,price,discountExcluded=false)=>({id:code,code,name:code,price,priceOld:price+100,quantity:2,
  imageUrl:null,slug:code,engraving:true,discountExcluded});
function load(file,globals={}) {
  const module={exports:{}};
  const script=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
  }).outputText;
  const context=vm.createContext({module,exports:module.exports,process:{env:{NEXT_PUBLIC_API_URL:'http://127.0.0.1:3006/api'}},
    URLSearchParams,AbortController,console,require:id=>{
      assert(['zustand','zustand/middleware'].includes(id),'Blocked dependency '+id);return require(id);
    },...globals});
  vm.runInContext(script,context,{timeout:1000});return module.exports;
}
const lineKey=code=>JSON.stringify([code,code,code]);
function oldCart(type='fixed') {
  const saved={state:{items:[item('REG',1000),item('SALE',500)],promoType:type,promoCode:'SAVED',promoDiscount:100,
    promoReplacesVolumeDiscount:type==='percent',promoBonusMessage:''},version:0};
  const memory=new Map([['cocktaildesign:cart',JSON.stringify(saved)]]);
  const localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
  return load('src/lib/cart/cartStore.ts',{localStorage}).useCartStore;
}
test('restores an old cart, updates only policy, preserves money promo and user selections',()=>{
  const store=oldCart();const before=JSON.parse(JSON.stringify(store.getState().items));
  store.getState().toggleSelected(lineKey('SALE'));
  store.getState().applyDiscountPolicy({REG:false,SALE:true});
  const state=store.getState();
  assert.equal(state.items[1].discountExcluded,true);assert.equal(state.promoDiscount,100);assert.equal(state.promoCode,'SAVED');
  assert.deepEqual(JSON.parse(JSON.stringify(state.selectedIds)),[lineKey('SALE')]);
  assert.deepEqual(JSON.parse(JSON.stringify(state.items)),before.map(p=>({...p,discountExcluded:p.code==='SALE'})));
});
test('invalidates stale percent preview, but unchanged policy preserves the promo',()=>{
  const store=oldCart('percent');store.getState().applyDiscountPolicy({REG:false,SALE:false});
  assert.equal(store.getState().promoCode,'SAVED');
  store.getState().applyDiscountPolicy({REG:false,SALE:true});
  assert.equal(store.getState().promoCode,'');assert.equal(store.getState().promoDiscount,0);
});
test('policy refresh batches requests, checks all returned flags and never posts',async()=>{
  const calls=[];
  const {fetchCartDiscountPolicy}=load('src/lib/cart/discountPolicy.ts',{fetch:async(url,options)=>{
    assert.equal(options.method,undefined);assert.equal(options.cache,'no-store');
    const codes=JSON.parse(new URL(url).searchParams.get('codes'));calls.push(codes);
    return {ok:true,json:async()=>({items:codes.map(code=>({code,discountExcluded:code==='SALE'}))})};
  }});
  const codes=['SALE',...Array.from({length:53},(_,i)=>'C'+i)];
  const result=await fetchCartDiscountPolicy(codes,new AbortController().signal);
  assert.deepEqual(calls.map(c=>c.length),[25,25,4]);assert.equal(Object.keys(result).length,54);assert(result.SALE);
});
test('missing products, malformed flags and network failures cannot silently keep stale eligibility',async()=>{
  for(const response of [{ok:false},{ok:true,json:async()=>({items:[]})},{ok:true,json:async()=>({items:[{code:'SALE',discountExcluded:'true'}]})}]){
    const {fetchCartDiscountPolicy}=load('src/lib/cart/discountPolicy.ts',{fetch:async()=>response});
    await assert.rejects(fetchCartDiscountPolicy(['SALE'],new AbortController().signal));
  }
  const {fetchCartDiscountPolicy}=load('src/lib/cart/discountPolicy.ts',{fetch:async()=>{throw Error('offline');}});
  await assert.rejects(fetchCartDiscountPolicy(['SALE'],new AbortController().signal));
});

test('engraving toggles one saved row without changing quantities, discounts, promos or selection',()=>{
  for(const type of ['', 'fixed','percent','inventory','startup']) {
    const store=oldCart(type);store.getState().toggleSelected(lineKey('REG'));
    const before=JSON.parse(JSON.stringify(store.getState()));
    store.getState().setEngraving(lineKey('SALE'),false);
    const after=JSON.parse(JSON.stringify(store.getState()));
    assert.deepEqual(after,{...before,items:before.items.map(p=>p.id==='SALE'?{...p,engraving:false}:p)});
    store.getState().setEngraving(lineKey('SALE'),true);
    assert.deepEqual(JSON.parse(JSON.stringify(store.getState())),before);
    const identity=store.getState();
    store.getState().setEngraving(lineKey('MISSING'),true);store.getState().setEngraving(lineKey('SALE'),true);
    assert.equal(store.getState(),identity);
  }
});

test('engraving state survives reloading an old saved cart',()=>{
  const memory=new Map([['cocktaildesign:cart',JSON.stringify({state:{items:[item('OLD',100)]},version:0})]]);
  const localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const store=load('src/lib/cart/cartStore.ts',{localStorage}).useCartStore;
  store.getState().setEngraving(lineKey('OLD'),false);
  const restored=load('src/lib/cart/cartStore.ts',{localStorage}).useCartStore;
  assert.equal(restored.getState().items[0].engraving,false);
  assert.equal(restored.getState().items[0].quantity,2);
});

test('optional engraving flags share the same requests and never block older API discount responses',async()=>{
  for(const value of [true,false,undefined,'invalid']) {
    let calls=0,flags;
    const {fetchCartDiscountPolicy}=load('src/lib/cart/discountPolicy.ts',{fetch:async()=>{
      calls++;return {ok:true,json:async()=>({items:[{code:'REG',discountExcluded:false,engravingEnabled:value}]})};
    }});
    const discounts=await fetchCartDiscountPolicy(['REG'],new AbortController().signal,v=>{flags=v;});
    assert.equal(discounts.REG,false);assert.equal(calls,1);
    assert.deepEqual(JSON.parse(JSON.stringify(flags)),typeof value==='boolean'?{REG:value}:{});
  }
});
