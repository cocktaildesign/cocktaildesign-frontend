const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ts=require('typescript');
const root=path.resolve(__dirname,'../..');
const cache=new Map();
function load(relative){
  let filename=path.resolve(root,relative);
  if(!path.extname(filename)) filename+=fs.existsSync(filename+'.ts')?'.ts':'.tsx';
  if(cache.has(filename))return cache.get(filename);
  if(filename.endsWith('.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
  const module={exports:{}};cache.set(filename,module.exports);
  const script=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{
    module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,
  }}).outputText;
  // Same realm as ExcelJS: its row setter uses instanceof Array.
  const scopedRequire=id=>{
      if(id.startsWith('@/'))return load('src/'+id.slice(2));
      if(id.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(filename),id)));
      assert(['react','react/jsx-runtime','next/link','next/server','exceljs'].includes(id),'Unexpected import '+id);
      return require(id);
    };
  new Function('module','exports','console','process','fetch','require',script)(module,module.exports,console,{env:{}},
    ()=>{throw new Error('Network forbidden in quote tests');},scopedRequire);
  cache.set(filename,module.exports);return module.exports;
}
const item=(code,price,quantity=1,discountExcluded=false)=>({id:code,code,name:code,price,priceOld:0,
  quantity,discountExcluded,slug:'fixture-'+code,imageUrl:null,engraving:false});
const items=[
  {...item('SMPLJig008',870,1,true),name:'Джиггер Mr. Slim 45/60 мл. (уцененный)'},
  {...item('SMPLTn18',200,1,true),name:'Щипцы для льда 18 см. (уцененный)'},
  {...item('ShKorAsh',3590),name:'Шейкер-бостон с утяжелителями Koriko «Пепел» CD Концепт 850 мл.'},
  {...item('ShСPaisley',2990),name:'Шейкер коблер Paisley 500 мл.'},
  {...item('ShBosChaplin',3200),name:'Шейкер бостон с утяжелителями Chaplin 820 мл.'},
];
const tiers=[[10000,5],[25000,8],[50000,12],[100000,16],[200000,20]].map(([minAmount,percent],id)=>({id,minAmount,percent}));
function snapshot(items,type='',discount=0){
  const totals=load('src/lib/cart/cartTotals').calculateCartTotals(items,tiers,{promoType:type,promoDiscount:discount,
    promoReplacesVolumeDiscount:['percent','startup'].includes(type)});
  const pricing={volumeDiscount:totals.activeVolumeDiscount,promoDiscount:totals.activePromoDiscount,promoType:type,
    promoCode:type?'ПРИМЕР':'',bonusMessage:type==='inventory'?'Подарок к заказу':type==='startup'?'Бонусы по акции СТАРТАП':''};
  return {totals,pricing,quote:load('src/lib/cart/cartQuote').buildCartQuote(items,pricing)};
}
module.exports={load,item,items,tiers,snapshot,root};
