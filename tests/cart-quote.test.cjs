const test=require('node:test');
const assert=require('node:assert/strict');
const ExcelJS=require('exceljs');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {NextRequest}=require('next/server');
const {load,item,items,tiers,snapshot}=require('./helpers/quote.cjs');
const {buildCartQuote,NO_QUOTE_DISCOUNTS}=load('src/lib/cart/cartQuote');
const post=load('src/app/api/cart-export/route').POST;
function request(body,contentType='application/json'){
  return new NextRequest('http://offline.invalid/api/cart-export',{method:'POST',headers:{'Content-Type':contentType},body:typeof body==='string'?body:JSON.stringify(body)});
}
async function exported(body){
  const response=await post(request(body));assert.equal(response.status,200);
  const book=new ExcelJS.Workbook();await book.xlsx.load(Buffer.from(await response.arrayBuffer()));return book.worksheets[0];
}
function total(sheet){let result;sheet.eachRow(row=>{if(row.getCell(1).value==='Итого к оплате')result=row.getCell(7).value;});return result;}

test('office example: two sample-sale rows keep price; 5% applies to other three',()=>{
  const {quote}=snapshot(items);
  assert.equal(quote.finalCents,1036100);
  assert.deepEqual(Array.from(quote.rows,r=>r.discountCents),[0,0,17950,14950,16000]);
  assert.deepEqual(Array.from(quote.rows,r=>r.unitFinalCents),[87000,20000,341050,284050,304000]);
});
for(const [name,type,discount,expected] of [['volume','',0,10361],['fixed 1000','fixed',1000,9361],
  ['fixed 3000','fixed',3000,7361],['percent','percent',978,9872],['weak percent','percent',98,10361],
  ['startup','startup',1956,8894],['gift','inventory',0,10361],['capped fixed','fixed',10850,0]]){
  test(name+': calculator, quote, XLSX and printed HTML match',async()=>{
    const {totals,pricing,quote}=snapshot(items,type,discount);
    assert.equal(totals.finalPrice,expected);assert.equal(quote.finalCents,expected*100);
    assert.equal(quote.rows.reduce((s,r)=>s+r.finalCents,0)-quote.fixedCents,quote.finalCents);
    const sheet=await exported({items,pricing});assert.equal(total(sheet),expected);
    assert.equal(sheet.getCell('D7').value,0);assert.equal(sheet.getCell('E7').value,870);
    const html=renderToStaticMarkup(React.createElement(load('src/app/cart/cart-print/CartPrint').default,{quote,notice:''}));
    assert.ok(html.includes(new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2}).format(expected)));
    assert.ok(html.includes('Стоимость со скидкой'));
  });
}
test('only excluded goods accept fixed money but no percentage allocation',()=>{
  const sale=[item('SALE',400,30,true),item('MANUAL',15,2,true)];
  const {quote}=snapshot(sale,'fixed',3000);
  assert.equal(quote.finalCents,903000);assert.ok(quote.rows.every(r=>r.discountCents===0));
  assert.throws(()=>buildCartQuote(sale,{...NO_QUOTE_DISCOUNTS,volumeDiscount:1}));
});
test('cent remainder and per-unit fractions are explicit and never alter the cart total',()=>{
  const {quote,totals}=snapshot([item('V',3333.33,3),item('REG',0.03)]);
  assert.equal(quote.finalCents,Math.round(totals.finalPrice*100));
  assert.equal(quote.rows.reduce((sum,r)=>sum+r.discountCents,0),50000);
  assert.equal(quote.hasRoundedUnits,true);
  assert.ok(quote.rows.every(r=>r.finalCents>=0&&r.discountCents<=r.lineCents));
});
test('all tier boundaries, exclusions, quantities and promo types reconcile',()=>{
  let cases=0;
  for(const tier of tiers)for(const delta of [-1,0,1])for(const excluded of [false,true])for(const qty of [1,3,17]){
    const cart=[item('VARIANT',Math.round((tier.minAmount+delta)/qty*100)/100,qty,excluded),item('SALE',1.99,2,true)];
    const eligible=excluded?0:cart[0].price*qty;
    for(const [type,amount] of [['',0],['fixed',1000],['fixed',3000],['fixed',1000000],['percent',Math.round(eligible*.1)],['startup',Math.round(eligible*.2)],['inventory',0]]){
      const {quote,totals}=snapshot(cart,type,amount);
      assert.equal(quote.finalCents,Math.round(totals.finalPrice*100));
      assert.equal(quote.rows.reduce((s,r)=>s+r.finalCents,0)-quote.fixedCents,quote.finalCents);
      assert.equal(quote.rows[1].discountCents,0);cases++;
    }
  }assert.equal(cases,630);
});
test('old product savings are not subtracted twice; engraving and codes survive',async()=>{
  const cart=[{...item('VARIANT',10000),priceOld:15000,engraving:true}];
  const {pricing}=snapshot(cart);const sheet=await exported({items:cart,pricing});
  assert.equal(total(sheet),9500);assert.equal(sheet.getCell('C7').value,10000);
  assert.equal(sheet.getCell('B7').value,'VARIANT');assert.match(sheet.getCell('A7').value.text,/Гравировка/);
  assert.match(sheet.getCell('A7').value.text,/стоимость отдельно/);
  const note=load('src/lib/cart/engraving').ENGRAVING_PRICE_NOTE;
  assert.ok(JSON.stringify(sheet.model).includes(note));
  const quote=snapshot(cart).quote;
  const html=renderToStaticMarkup(React.createElement(load('src/app/cart/cart-print/CartPrint').default,{quote,notice:''}));
  assert.ok(html.includes(note));
});
test('older open tabs can still export the existing items-only contract',async()=>{
  const sheet=await exported({items:items.map(({discountExcluded,...rest})=>rest)});assert.equal(total(sheet),10850);
});
test('bad payloads, contradictory discounts and discounts on excluded goods are rejected',async()=>{
  const pricing=snapshot(items).pricing;
  for(const body of [null,{items:'bad'},{items:[{...items[0],quantity:0}]},{items:[{...items[0],price:-1}]},
    {items,pricing:{...pricing,volumeDiscount:-1}},{items,pricing:{...pricing,promoDiscount:50,promoType:'percent'}},
    {items:[items[0]],pricing},{items,pricing:{...pricing,promoType:'unknown'}},
    {items,pricing:{...pricing,promoDiscount:100000,promoType:'fixed'}},
    {items:[{...items[0],discountExcluded:undefined}],pricing},
    {items:Array(1001).fill(items[0])},'{'])assert.equal((await post(request(body))).status,400);
  assert.equal((await post(request('{}','text/plain'))).status,415);
});
test('formula injection remains escaped and spreadsheet is numeric with landscape printing',async()=>{
  const cart=[{...item('=CODE',10000),name:'=HYPERLINK("bad")'}];const {pricing}=snapshot(cart);
  const sheet=await exported({items:cart,pricing});
  assert.ok(sheet.getCell('A7').value.text.startsWith("'="));assert.equal(sheet.getCell('B7').value,"'=CODE");
  assert.equal(sheet.getCell('C7').numFmt,'#,##0.00');assert.equal(typeof sheet.getCell('G7').value,'number');
  assert.equal(sheet.pageSetup.orientation,'landscape');assert.equal(sheet.pageSetup.fitToWidth,1);
  assert.equal(sheet.pageSetup.printTitlesRow,'6:6');
});
test('native print before readiness shows a notice, not an undiscounted quote',()=>{
  const html=renderToStaticMarkup(React.createElement(load('src/app/cart/cart-print/CartPrint').default,{quote:null,notice:'Проверяем скидки'}));
  assert.ok(html.includes('Проверяем скидки'));assert.ok(!html.includes('<table'));
});
