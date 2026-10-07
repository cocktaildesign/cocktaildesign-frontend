const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(file,globals={}) {
  const module={exports:{}};
  const script=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
  }).outputText;
  vm.runInNewContext(script,{module,exports:module.exports,process:{env:{}},...globals,require:id=>{
    if(id==='./discountTiers')return load('src/lib/cart/discountTiers.ts');
    assert(['react','zustand','zustand/middleware'].includes(id),'Unexpected dependency '+id);
    return require(id);
  }},{timeout:1000});return module.exports;
}
const {calculateCartTotals}=load('src/lib/cart/cartTotals.ts');
const tiers=[[10000,5],[25000,8],[50000,12],[100000,16],[200000,20]].map(([minAmount,percent],id)=>({id,minAmount,percent}));
const item=(code,price,discountExcluded=false,quantity=1)=>({id:code,code,name:code,slug:code,price,priceOld:price+100,
  discountExcluded,quantity,imageUrl:null,engraving:false});
const promo=(type='',amount=0)=>({promoType:type,promoDiscount:amount,promoReplacesVolumeDiscount:['percent','startup'].includes(type)});
const mixed=[item('REG',10000),item('SALE',5000,true)];
const scenarios=[
  ['below threshold',[item('REG',9999)],promo(),9999,0,0],
  ['regular goods',[item('REG',10000)],promo(),9500,500,0],
  ['mixed cart',mixed,promo(),14500,500,0],
  ['sample sale only',[item('SALE',15000,true)],promo(),15000,0,0],
  ['manually excluded',[item('LIMITED',15000,true)],promo(),15000,0,0],
  ['money 1000 on sample sale',[item('SALE',15000,true)],promo('fixed',1000),14000,0,1000],
  ['money 3000 on mixed cart',mixed,promo('fixed',3000),11500,500,3000],
  ['money capped by remaining amount',mixed,promo('fixed',30000),0,500,14500],
  ['percent wins',mixed,promo('percent',1000),14000,0,1000],
  ['volume beats percent',mixed,promo('percent',200),14500,500,0],
  ['equal discounts choose promo',mixed,promo('percent',500),14500,0,500],
  ['startup with eligible goods',mixed,promo('startup',2000),13000,0,2000],
  ['startup with no eligible goods',[item('SALE',15000,true)],promo('startup',0),15000,0,0],
  ['inventory gift preserves volume',mixed,promo('inventory',0),14500,500,0],
  ['all excluded but count toward tier',[item('REG',1000),item('SALE',24000,true)],promo(),24920,80,0],
  ['round percentage to rubles',[item('REG',10011),item('SALE',9,true)],promo(),9519,501,0],
  ['quantity and variants',[item('VARIANT',6000,false,2),item('BUNDLE',2000)],promo(),13300,700,0],
  ['empty cart',[],promo(),0,0,0],
];
for(const [name,items,code,final,volume,money] of scenarios) test(name,()=>{
  const result=calculateCartTotals(items,tiers,code);
  assert.equal(result.finalPrice,final);assert.equal(result.activeVolumeDiscount,volume);assert.equal(result.activePromoDiscount,money);
});
test('every threshold: before, at and after; unchanged full basket tier rule',()=>{
  for(const [index,tier] of tiers.entries()) for(const delta of [-1,0,1]) {
    const amount=tier.minAmount+delta;
    const percent=delta<0?(tiers[index-1]?.percent??0):tier.percent;
    const result=calculateCartTotals([item('REG',amount)],tiers,promo());
    assert.equal(result.activeVolumeDiscount,Math.round(amount*percent/100));
    assert.equal(result.finalPrice,amount-Math.round(amount*percent/100));
  }
});
test('old price saving is informational and is not subtracted twice',()=>{
  const result=calculateCartTotals([{...item('SALE',400,true,30),priceOld:900}],tiers,promo());
  assert.equal(result.totalSavings,15000);assert.equal(result.totalPrice,12000);assert.equal(result.totalQuantity,30);assert.equal(result.finalPrice,12000);
});
test('quantity, removal and selection use the existing persisted-cart actions',()=>{
  const storage=new Map();
  const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
  const store=load('src/lib/cart/cartStore.ts',{localStorage}).useCartStore;
  const totals=()=>calculateCartTotals(store.getState().items,tiers,store.getState());
  const key=code=>{const i=store.getState().items.find(i=>i.code===code);return JSON.stringify([i.slug,i.id,i.code]);};
  store.getState().addItem(mixed[0]);store.getState().addItem(mixed[1]);
  store.getState().setPromo({code:'MONEY',type:'fixed',discount:1000});assert.equal(totals().finalPrice,13500);
  store.getState().toggleSelected(key('REG'));assert.equal(totals().finalPrice,13500,'checkboxes select removal/export, not order scope');
  store.getState().updateQuantity(key('SALE'),2);assert.equal(store.getState().promoCode,'');assert.equal(totals().finalPrice,19500);
  store.getState().setPromo({code:'PERCENT',type:'percent',discount:1000,replacesVolumeDiscount:true});
  store.getState().removeSelected();assert.equal(totals().finalPrice,10000);assert.equal(store.getState().promoDiscount,0);
  store.getState().removeItem(key('SALE'));assert.equal(totals().finalPrice,0);
});
