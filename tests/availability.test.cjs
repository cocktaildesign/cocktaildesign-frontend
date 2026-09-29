const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const file=path.resolve(__dirname,'../src/shared/ui/product-badges/availability.ts'),moduleObj={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:moduleObj,exports:moduleObj.exports});
const {reconcileAvailabilityBadges:reconcile,parseAvailabilityStates:parse}=moduleObj.exports;
const badges=[{id:1,label:'Нет в наличии'},{id:2,label:'Рекомендуем'},{id:3,label:' НЕТ   В НАЛИЧИИ '}];
test('confirmed CRM state overrides only manual unavailable badge; unknown preserves all assignments',()=>{
 assert.equal(reconcile(badges,undefined),badges);
 for(const state of [true,false])assert.deepEqual(Array.from(reconcile(badges,state),b=>b.id),[2]);
 assert.equal(badges.length,3);
});
test('malformed responses are rejected, explicit disabled empty state is accepted',()=>{
 const id='00000000-0000-0000-0000-000000000001';
 assert.equal(parse({states:{[id]:true}})[id],true);assert.equal(parse({states:{[id]:false}})[id],false);
 for(const data of [null,[],{}, {states:[]},{states:{x:true}},{states:{[id]:0}},{states:{[id]:null}}])assert.equal(parse(data),null);
 assert.equal(Object.keys(parse({states:{}})).length,0);
});
