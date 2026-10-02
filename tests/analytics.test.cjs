const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}, mocks = {}) {
  const module = {exports:{}};
  const source = fs.readFileSync(path.resolve(__dirname,'../src',file),'utf8');
  const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,URL,URLSearchParams,process:{env:{}},...globals,require:id=>{
    if (id in mocks) return mocks[id];
    if (id==='react/jsx-runtime') return require(id);
    throw new Error('Unmocked dependency '+id);
  }});
  return module.exports;
}
const ID='11111111-1111-4111-a111-111111111111';
function environment({origin='https://cocktaildesign.ru',enabled='true',storageError=false,trackerError=false}={}) {
  const calls=[],scripts=[],storage=new Map();
  const window={location:{origin,href:origin+'/catalog?secret=hidden#private'},localStorage:{
    getItem:k=>{if(storageError)throw Error('denied');return storage.get(k)??null;},
    setItem:(k,v)=>{if(storageError)throw Error('quota');storage.set(k,v);},
  }};
  const globals={window,document:{createElement:()=>({}),head:{appendChild:s=>scripts.push(s)},title:'Каталог',referrer:'https://example.org/path?email=private'},process:{env:{NEXT_PUBLIC_SITE_URL:origin,NEXT_PUBLIC_ANALYTICS_ENABLED:enabled}}};
  const api=load('lib/analytics/metrika.ts',globals);
  api.startMetrika();
  if(window.ym) window.ym=(...args)=>{if(trackerError)throw Error('blocked');calls.push(args);};
  return {api,calls,scripts,storage,window,globals};
}
test('analytics is off without both explicit flag and exact final HTTPS domain',()=>{
  for(const config of [{enabled:undefined},{enabled:'false'},{origin:'https://new.cocktaildesign.ru'},{origin:'http://cocktaildesign.ru'},{origin:'https://cocktaildesign.ru.evil.test'}]) {
    if(config.enabled===undefined && 'enabled' in config)config.enabled='';
    const x=environment(config);x.api.trackPage();x.api.trackAcceptedOrder(ID);
    assert.equal(x.scripts.length,0);assert.equal(x.calls.length,0);
  }
  const {analyticsAllowed}=load('lib/analytics/metrika.ts');
  assert.equal(analyticsAllowed('https://cocktaildesign.ru','true','http://localhost:3000'),false);
});
test('page views follow SPA paths once; URL query/hash and referrer query are omitted',()=>{
  const x=environment();x.api.startMetrika();assert.equal(x.scripts.length,1);
  x.api.trackPage();x.api.trackPage();assert.equal(x.calls.length,1);
  assert.equal(x.calls[0][2],'https://cocktaildesign.ru/catalog');
  assert.equal(x.calls[0][3].referer,'https://example.org/path');
  x.window.location.href='https://cocktaildesign.ru/checkout/success?order=customer-order';
  x.api.trackPage();assert.equal(x.calls.length,2);
  assert.equal(x.calls[1][2],'https://cocktaildesign.ru/checkout/success');
  assert.ok(x.calls.every(c=>c[1]==='hit'));
});
test('campaign attribution keeps only standard UTM labels on the store origin',()=>{
  const {analyticsUrl}=load('lib/analytics/metrika.ts');
  assert.equal(analyticsUrl('https://cocktaildesign.ru/?utm_source=sape&utm_campaign=launch&email=private&order=42#secret',true),
    'https://cocktaildesign.ru/?utm_source=sape&utm_campaign=launch');
  assert.equal(analyticsUrl('https://example.org/?utm_source=private',true),'https://example.org/');
  assert.equal(analyticsUrl('https://cocktaildesign.ru/?utm_source='+ 'a'.repeat(201),true),'https://cocktaildesign.ru/');
});

test('accepted-order goal deduplicates API replays and contains no order/customer/revenue data',()=>{
  const x=environment();
  x.api.trackAcceptedOrder(ID);x.api.trackAcceptedOrder(ID);
  for(const bad of [null,undefined,123,'','customer@email.test'])x.api.trackAcceptedOrder(bad);
  assert.deepEqual(x.calls,[[49125430,'reachGoal','new_shop_order_created']]);
  const reloaded=load('lib/analytics/metrika.ts',x.globals);reloaded.trackAcceptedOrder(ID);
  assert.equal(x.calls.length,1);
});
test('blocked analytics and unavailable/corrupt storage never throw or stop session deduplication',()=>{
  for(const config of [{storageError:true},{trackerError:true},{}]) {
    const x=environment(config);x.storage.set('cd:analytics:orders:v1','not json');
    assert.doesNotThrow(()=>{x.api.trackAcceptedOrder(ID);x.api.trackAcceptedOrder(ID);x.api.trackPage();});
    assert.ok(x.calls.filter(c=>c[1]==='reachGoal').length<=1);
  }
});

// Run the actual checkout submit handler with isolated hooks and fetch.
// Any unexpected endpoint/dependency fails; no live API or network is available.
function checkout({buyer='individual',promo='',responses=[{ok:true,body:{ok:true,orderId:ID,orderName:'TEST'}}],trackerError=false}={}) {
  const x=environment({trackerError});const requests=[],navigation=[];let clears=0,stateIndex=0;
  const states=['',buyer,'TEST-PHONE','TEST-CONTACT','TEST-ADDRESS','TEST-COMMENT','TEST-NAME','TEST-COMPANY','TEST-INN','idle',{}];
  const items=[{id:'a',code:'NORMAL',name:'Normal',slug:'a',price:1000,quantity:2,engraving:true,discountExcluded:false},{id:'b',code:'SALE',name:'Sale',slug:'b',price:450,quantity:1,engraving:false,discountExcluded:true}];
  const cart={items,hasHydrated:true,promoCode:promo?'TEST':'',promoDiscount:100,promoType:promo,promoReplacesVolumeDiscount:['percent','startup'].includes(promo),clearCart:()=>clears++};
  const mocks={
    'react':{useEffect:()=>{},useRef:value=>({current:value}),useState:()=>[states[stateIndex++],()=>{}]},
    'next/navigation':{useRouter:()=>({replace:url=>navigation.push(url)})},'next/link':{default:'a'},
    '@/lib/cart/cartStore':{useCartStore:select=>select(cart)},
    '@/lib/cart/discountTiers':{useDiscountTiers:()=>({tiers:[],isLoading:false})},
    '@/lib/cart/cartTotals':{calculateCartTotals:()=>({currentTier:{percent:5},activeVolumeDiscount:100,activePromoDiscount:promo?100:0,finalPrice:promo?2250:2350})},
    '@/lib/cart/useCartDiscountPolicy':{useCartDiscountPolicy:()=>({ready:true})},
    '@/lib/cart/discountPolicy':{CART_API_BASE:'http://isolated.invalid/api'},
    '@/lib/cart/engraving':{ENGRAVING_PRICE_NOTE:'Manager calculates'},
    '@/components/engraving-files/EngravingFiles':{default:'files'},
    '@/lib/cart/engravingFiles':{useEngravingFiles:Object.assign(select=>select({files:[]}),{getState:()=>({files:[],orderKey:''})}),reconcileEngravingFiles:async()=>true},
    '@/lib/analytics/metrika':x.api,
    '../cart/cart-summary/DiscountPolicyNotice':{default:'notice'},'./Checkout.module.css':{default:{}},
    '@/components/icons/payment-tabs/PersonIcon':{default:'icon'},'@/components/icons/payment-tabs/OrganizationIcon':{default:'icon'},
  };
  const globals={...x.globals,crypto:{randomUUID:()=>ID},fetch:async(url,options)=>{
    assert.equal(url,'http://isolated.invalid/api/orders');requests.push(options);
    const response=responses.shift();if(response instanceof Error)throw response;
    return {ok:response.ok,json:async()=>response.body};
  }};
  const Component=load('app/checkout/CheckoutClient.tsx',globals,mocks).default;
  const buttons=[];function walk(node){if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(walk);return;}if(node.type==='button')buttons.push(node);walk(node.props?.children);}
  walk(Component());const button=buttons.find(b=>b.props.children==='Оформить заказ');assert.ok(button);
  return {...x,requests,navigation,submit:button.props.onClick,clears:()=>clears};
}
test('checkout preserves order payload and completion for both buyers and all promo types with blocked analytics',async()=>{
  for(const buyer of ['individual','legal']) for(const promo of ['', 'fixed','percent','inventory','startup']) {
    const x=checkout({buyer,promo,trackerError:true});await x.submit();await x.submit();
    assert.equal(x.requests.length,1);assert.equal(x.clears(),1);
    assert.deepEqual(x.navigation,['/checkout/success?order=TEST']);
    const body=JSON.parse(x.requests[0].body);assert.equal(body.buyerType,buyer);
    assert.equal(body.items[0].engraving,true);assert.equal(body.items[1].discountExcluded,true);
    assert.equal(body.items[1].price,450);assert.equal(body.items[0].quantity,2);
    assert.equal(body.promoCode,promo?'TEST':undefined);
    assert.equal(body.fullName,buyer==='individual'?'TEST-NAME':undefined);
    assert.equal(body.contactName,buyer==='legal'?'TEST-COMPANY':undefined);
  }
});
test('failed/unknown orders never count; retry keeps idempotency key and counts only confirmed success',async()=>{
  for(const failure of [new Error('timeout'),{ok:false,body:{ok:false,error:'order_status_unknown'}},{ok:true,body:{ok:false}}]) {
    const x=checkout({responses:[failure,{ok:true,body:{ok:true,orderId:ID,orderName:'TEST'}}]});
    await x.submit();assert.equal(x.clears(),0);assert.equal(x.navigation.length,0);assert.equal(x.calls.length,0);
    await x.submit();assert.equal(x.clears(),1);assert.equal(x.calls.length,1);
    assert.equal(x.requests[0].headers['Idempotency-Key'],x.requests[1].headers['Idempotency-Key']);
  }
});
