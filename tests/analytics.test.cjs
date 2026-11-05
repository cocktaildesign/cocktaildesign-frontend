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
const PURCHASE={currency:'RUB',revenue:2250.99,products:[{id:'Jig25/40',name:'Джиггер 25/40 мл',price:900.45,quantity:2},{id:'SALE',name:'Уценка',price:450,quantity:1}]};
const plain=value=>JSON.parse(JSON.stringify(value));
const PRODUCT={id:'7',productId:'7',variantId:null,code:'SKU/7',name:'Товар',price:950,priceOld:1000,
  slug:'test-product',quantity:2,engraving:false,discountExcluded:false,imageUrl:null};
function cartEnvironment(options) {
 const x=environment(options);
 const cart=load('lib/cart/cartStore.ts',{...x.globals,localStorage:x.window.localStorage},{
  'zustand':require('zustand'),'zustand/middleware':require('zustand/middleware'),'@/lib/analytics/metrika':x.api});
 return {...x,store:cart.useCartStore,key:cart.cartLineKey};
}
const actions=x=>plain((x.window.dataLayer??[]).filter(e=>e.event==='cd_product_action').map(e=>{
 const action=['detail','add','remove'].find(k=>e.ecommerce[k]);
 return [action,e.ecommerce[action].products[0].id,e.ecommerce[action].products[0].quantity];
}));
function environment({origin='https://cocktaildesign.ru',enabled='true',storageError=false,trackerError=false,legacyCookie=false,legacyStorage=false,cookieError=false}={}) {
  const calls=[],scripts=[],storage=new Map(),cookies=new Map(),listeners=new Map();
  if(legacyCookie)cookies.set('cd_ym_optout','1');if(legacyStorage)storage.set('cd_ym_optout','1');
  const window={location:{origin,href:origin+'/catalog?secret=hidden#private'},localStorage:{
    getItem:k=>{if(storageError)throw Error('denied');return storage.get(k)??null;},
    setItem:(k,v)=>{if(storageError)throw Error('quota');storage.set(k,v);},
    removeItem:k=>{if(storageError)throw Error('denied');storage.delete(k);},
  },addEventListener:(name,cb)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(cb);},removeEventListener:(name,cb)=>listeners.get(name)?.delete(cb),dispatchEvent:event=>{for(const cb of listeners.get(event.type)||[])cb(event);}};
  const document={createElement:()=>({remove(){const i=scripts.indexOf(this);if(i>=0)scripts.splice(i,1);}}),head:{appendChild:s=>scripts.push(s)},getElementById:id=>scripts.find(s=>s.id===id),title:'Каталог',referrer:'https://example.org/path?email=private',visibilityState:'visible',addEventListener:window.addEventListener,removeEventListener:window.removeEventListener,
    get cookie(){if(cookieError)throw Error('denied');return [...cookies].map(([k,v])=>k+'='+v).join('; ');},set cookie(value){if(cookieError)throw Error('denied');const [pair]=value.split(';');const [k,v]=pair.split('=');if(value.includes('Max-Age=0'))cookies.delete(k);else cookies.set(k,v);}};
  const globals={window,document,Event,process:{env:{NEXT_PUBLIC_SITE_URL:origin,NEXT_PUBLIC_ANALYTICS_ENABLED:enabled}}};
  const api=load('lib/analytics/metrika.ts',globals);
  api.startMetrika();
  if(window.ym) window.ym=(...args)=>{if(trackerError)throw Error('blocked');calls.push(args);};
  return {api,calls,scripts,storage,cookies,window,globals,listeners};
}

test('cart emits actual add/remove deltas, preserves literal variant SKU, ignores missing/unchanged rows',()=>{
 const x=cartEnvironment(),s=x.store.getState(),k=x.key(PRODUCT);
 s.addItem(PRODUCT);s.addItem({...PRODUCT,quantity:1});s.updateQuantity(k,5);s.updateQuantity(k,4);
 s.updateQuantity(k,4);s.updateQuantity('absent',2);s.removeItem('absent');
 const variant={...PRODUCT,variantId:'7',slug:'other',code:'SKU\\7',quantity:3};
 s.addItem(variant);s.updateQuantity(k,0);s.removeItem(x.key(variant));
 assert.deepEqual(actions(x),[['add','SKU/7',2],['add','SKU/7',1],['add','SKU/7',2],['remove','SKU/7',1],
  ['add','SKU\\7',3],['remove','SKU/7',4],['remove','SKU\\7',3]]);
 assert.equal(x.store.getState().items.length,0);
});

test('bulk removal records each removed quantity; hydration, policy, engraving, promo and checkout clear are silent',()=>{
 const x=cartEnvironment(),s=x.store.getState();s.addItem(PRODUCT);s.addItem({...PRODUCT,id:'8',code:'BUNDLE',quantity:4});
 x.window.dataLayer.length=0;
 s.setEngraving(x.key(PRODUCT),true);s.applyDiscountPolicy({'SKU/7':true});
 s.setPromo({code:'TEST',type:'fixed',discount:50});s.clearPromo();s.selectAll();s.clearSelected();
 assert.deepEqual(actions(x),[]);
 x.store.persist.rehydrate();assert.deepEqual(actions(x),[]);
 s.selectAll();s.removeSelected();s.removeSelected();
 assert.deepEqual(actions(x),[['remove','SKU/7',2],['remove','BUNDLE',4]]);
 s.addItem(PRODUCT);x.window.dataLayer.length=0;s.clearCart();assert.deepEqual(actions(x),[]);
});

test('disabled/foreign analytics does not alter shopping or replay suppressed cart actions on enabling',()=>{
 for(const options of [{legacyStorage:true},{legacyCookie:true},{origin:'https://new.cocktaildesign.ru'},{enabled:'false'}]) {
  const x=cartEnvironment(options);x.api.trackProductAction('detail',PRODUCT);x.store.getState().addItem(PRODUCT);
  x.store.getState().updateQuantity(x.key(PRODUCT),5);
  assert.equal(x.store.getState().items[0].quantity,5);assert.deepEqual(actions(x),[]);
  x.api.setAnalyticsEnabled(true);assert.deepEqual(actions(x),[]);
 }
});

test('SDK/container/storage failures never escape an analytics call or prevent a cart mutation',()=>{
 const x=cartEnvironment();Object.defineProperty(x.window,'dataLayer',{get(){throw Error('blocked');},configurable:true});
 assert.doesNotThrow(()=>x.store.getState().addItem(PRODUCT));
 assert.equal(x.store.getState().items[0].quantity,2);
 assert.doesNotThrow(()=>x.store.getState().updateQuantity(x.key(PRODUCT),4));
 assert.equal(x.store.getState().items[0].quantity,4);
 const y=environment({storageError:true});assert.doesNotThrow(()=>y.api.trackProductAction('detail',PRODUCT));
 assert.deepEqual(actions(y),[]);
 const z=cartEnvironment();z.window.dataLayer.push=()=>{throw Error('SDK unavailable');};
 assert.doesNotThrow(()=>z.store.getState().addItem(PRODUCT));assert.equal(z.store.getState().items.length,1);
});

test('commerce payload uses an allowlist, rejects malformed data, and bounds only its own non-purchase queue',()=>{
 const x=environment();x.api.trackProductAction('detail',{...PRODUCT,phone:'secret',comment:'private',engravingFile:'upload'});
 assert.deepEqual(plain(x.window.dataLayer[0]),{event:'cd_product_action',ecommerce:{currencyCode:'RUB',detail:{products:[
  {id:'SKU/7',name:'Товар',price:950,quantity:1}]}}});
 for(const value of [{code:''},{code:'x'.repeat(256)},{name:'x'.repeat(1001)},{price:NaN},{price:-1}]) {
  x.api.trackProductAction('add',{...PRODUCT,...value});
 }
 for(const quantity of [0,-1,NaN,Infinity,1.5])x.api.trackProductAction('add',PRODUCT,quantity);
 assert.equal(x.window.dataLayer.length,1);
 x.window.dataLayer.push({event:'other_integration'});x.api.trackAcceptedOrder(ID,PURCHASE);
 for(let i=0;i<150;i++)x.api.trackProductAction('add',PRODUCT,1);
 assert.equal(actions(x).length,100);assert.equal(x.window.dataLayer.length,102);
 assert.ok(x.window.dataLayer.every(e=>JSON.stringify(e).length<8192));
 x.api.setAnalyticsEnabled(false);
 assert.deepEqual(plain(x.window.dataLayer),[{event:'other_integration'}]);
});

test('product page emits once per displayed SKU, never for quantity/price rerenders or a Strict Mode effect replay',()=>{
 const x=environment();let effects=[],refs=[],cursor=0;
 const react={...require('react'),useState:value=>[value,()=>{}],useRef:value=>refs[cursor++]??(refs[cursor-1]={current:value}),
  useEffect:effect=>effects.push(effect)};
 const stub=()=>null,mocks={'react':react,'next/link':stub,'./ProductPage.module.css':{default:{}},
  '@/lib/cart/cartStore':{cartLineKey:item=>JSON.stringify([item.slug,item.id,item.code]),useCartStore:select=>select({items:[]})},
  '@/lib/analytics/metrika':x.api};
 for(const name of ['@/components/ui/quantity/QuantityControl','@/components/ui/engraving/EngravingToggle',
  '@/components/icons/CartIcon','@/components/icons/ArrowRightIcon','@/components/ui/favorites/FavoriteButton',
  '@/components/icons/product-page/CdekIcon','@/components/icons/product-page/FreeDeliveryIcon'])mocks[name]=stub;
 const Component=load('app/catalog/product/[slug]/ProductPurchaseControls.tsx',x.globals,mocks).default;
 const render=props=>{cursor=0;effects=[];Component({...PRODUCT,engravingEnabled:true,...props});for(const run of effects){run();run();}};
 render({});render({price:900});render({variantId:'8',code:'VARIANT'});render({});
 assert.deepEqual(actions(x),[['detail','SKU/7',1],['detail','VARIANT',1],['detail','SKU/7',1]]);
 refs=[];render({});assert.equal(actions(x).length,4,'A genuinely new page mount counts as a new view');
});
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

test('legacy opt-out in either store prevents initial script, page hit and order goal',()=>{
  for(const config of [{legacyCookie:true},{legacyStorage:true},{cookieError:true},{storageError:true}]) {
    const x=environment(config);x.api.trackPage();x.api.trackAcceptedOrder(ID);
    assert.equal(x.scripts.length,0);assert.equal(x.calls.length,0);assert.equal(x.window.disableYaCounter49125430,true);
  }
});

test('live opt-out destroys counter, blocks later navigation/orders and preserves cart storage',()=>{
  const x=environment();x.storage.set('cart','keep');x.cookies.set('_ym_uid','old');x.cookies.set('session','keep');
  assert.equal(x.api.setAnalyticsEnabled(false).saved,true);
  assert.equal(x.api.analyticsStatus(),'disabled');assert.equal(x.window.disableYaCounter49125430,true);
  const count=x.calls.length;x.api.trackPage();x.api.trackAcceptedOrder(ID);assert.equal(x.calls.length,count);
  assert.equal(x.calls.filter(c=>c[1]==='destruct').length,1);
  assert.equal(x.storage.get('cart'),'keep');assert.equal(x.cookies.get('session'),'keep');assert.equal(x.cookies.has('_ym_uid'),false);
  assert.equal(x.storage.get('cd_ym_optout'),'1');assert.equal(x.cookies.get('cd_ym_optout'),'1');
  const reloaded=load('lib/analytics/metrika.ts',x.globals);reloaded.syncMetrika();assert.equal(x.calls.length,count);
  assert.equal(x.api.setAnalyticsEnabled(true).saved,true);assert.equal(x.api.analyticsStatus(),'enabled');
  assert.equal(x.scripts.length,1);assert.equal(x.calls.filter(c=>c[1]==='init').length,1);
  assert.equal(x.storage.has('cd_ym_optout'),false);assert.equal(x.cookies.has('cd_ym_optout'),false);
});

test('opt-out while script is loading cancels queued init/hit/goal and checks again on load',()=>{
  const x=environment();delete x.window.ym; x.window.cdMetrikaStarted=false;x.api.startMetrika();
  x.api.trackPage();x.api.trackAcceptedOrder(ID);assert.ok(x.window.ym.a.length>=2);
  x.api.setAnalyticsEnabled(false);assert.equal(x.window.ym.a.length,0);x.scripts[0].onload();assert.equal(x.window.ym.a.length,0);
  assert.equal(x.window.disableYaCounter49125430,true);
});

test('unsaved tab choice survives focus; persisted refusal from another tab stops counter',()=>{
  const x=environment({storageError:true,cookieError:true});const dispose=x.api.subscribeAnalytics(()=>{});
  assert.equal(x.api.setAnalyticsEnabled(false).saved,false);x.window.dispatchEvent(new Event('focus'));
  assert.equal(x.api.analyticsStatus(),'disabled');assert.equal(x.scripts.length,0);dispose();
  const y=environment();let changes=0;const remove=y.api.subscribeAnalytics(()=>changes++);
  y.storage.set('cd_ym_optout','1');y.window.dispatchEvent(Object.assign(new Event('storage'),{key:'cd_ym_optout'}));
  assert.equal(y.api.analyticsStatus(),'disabled');assert.equal(changes,1);assert.equal(y.window.cdMetrikaStarted,false);remove();
  for(const listeners of y.listeners.values())assert.equal(listeners.size,0);
});

test('footer setting cannot activate analytics on preliminary domain',()=>{
  const x=environment({origin:'https://new.cocktaildesign.ru'});assert.equal(x.api.setAnalyticsEnabled(true).saved,false);
  assert.equal(x.api.analyticsStatus(),'unavailable');assert.equal(x.scripts.length,0);assert.equal(x.calls.length,0);
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
  const states=['','',buyer,'TEST-PHONE','TEST-CONTACT','TEST-ADDRESS','TEST-COMMENT','TEST-NAME','TEST-COMPANY','TEST-INN','idle',{}];
  const items=[{id:'a',code:'NORMAL',name:'Normal',slug:'a',price:1000,quantity:2,engraving:true,discountExcluded:false},{id:'b',code:'SALE',name:'Sale',slug:'b',price:450,quantity:1,engraving:false,discountExcluded:true}];
  const cart={items,hasHydrated:true,promoCode:promo?'TEST':'',promoDiscount:100,promoType:promo,promoReplacesVolumeDiscount:['percent','startup'].includes(promo),clearCart:()=>clears++};
  const mocks={
    'react':{useEffect:()=>{},useRef:value=>({current:value}),useState:()=>[states[stateIndex++],()=>{}]},
    'next/navigation':{useRouter:()=>({replace:url=>navigation.push(url)})},'next/link':{default:'a'},
    '@/lib/cart/cartStore':{cartLineKey:i=>JSON.stringify([i.slug,i.id,i.code]),useCartStore:select=>select(cart)},
    '@/lib/cart/discountTiers':{useDiscountTiers:()=>({tiers:[],isLoading:false})},
    '@/lib/cart/cartTotals':{calculateCartTotals:()=>({currentTier:{percent:5},activeVolumeDiscount:100,activePromoDiscount:promo?100:0,finalPrice:promo?2250:2350})},
    '@/lib/cart/useCartDiscountPolicy':{useCartDiscountPolicy:()=>({ready:true})},
    '@/lib/cart/discountPolicy':{CART_API_BASE:'http://isolated.invalid/api'},
    '@/lib/cart/checkoutKey':{getCheckoutKey:async()=>ID},
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

test('durably accepted local order clears cart and shows receipt even without CRM confirmation',async()=>{
 const x=checkout({responses:[{ok:true,body:{ok:true,accepted:true,crmConfirmed:false,journalId:ID,orderId:ID,orderName:'CD-42'}}]});
 await x.submit();assert.equal(x.clears(),1);assert.deepEqual(x.navigation,['/checkout/success?order=CD-42&received=1']);assert.equal(x.calls.length,1);
});

test('commerce is configured on the existing counter and uses only server receipt fields',()=>{
 const x=environment();x.window.cdMetrikaStarted=false;x.api.startMetrika();
 assert.equal(x.calls.find(c=>c[1]==='init')[2].ecommerce,'dataLayer');x.calls.length=0;
 x.api.trackAcceptedOrder(ID,{...PURCHASE,phone:'PRIVATE',address:'PRIVATE',products:PURCHASE.products.map(p=>({...p,customer:'PRIVATE'}))});
 assert.deepEqual(plain(x.window.dataLayer),[{event:'cd_order_accepted',ecommerce:{currencyCode:'RUB',purchase:{actionField:{id:ID,revenue:2250.99},products:PURCHASE.products}}}]);
 assert.deepEqual(x.calls,[[49125430,'reachGoal','new_shop_order_created']]);
 assert(!JSON.stringify(x.window.dataLayer).includes('PRIVATE'));
 x.api.trackAcceptedOrder(ID,PURCHASE);assert.equal(x.window.dataLayer.length,1);
 const reloaded=load('lib/analytics/metrika.ts',x.globals);reloaded.trackAcceptedOrder(ID,PURCHASE);
 assert.equal(x.window.dataLayer.length,1);
});

test('commerce and existing goal deduplicate independently; an old response never fabricates revenue',()=>{
 const x=environment();x.api.trackAcceptedOrder(ID);assert.equal(x.window.dataLayer.length,0);
 x.api.trackAcceptedOrder(ID,PURCHASE);assert.equal(x.window.dataLayer.length,1);assert.equal(x.calls.length,1);
});

test('invalid commerce data is ignored without breaking the existing accepted-order goal',()=>{
 const bad=[undefined,null,{}, {...PURCHASE,currency:'USD'},{...PURCHASE,revenue:NaN},{...PURCHASE,revenue:-1},
  {...PURCHASE,products:[]},{...PURCHASE,products:[null]},
  ...[{id:''},{price:Infinity},{quantity:1.5},{name:null}].map(p=>({...PURCHASE,products:[{...PURCHASE.products[0],...p}]}))];
 for(const value of bad){const x=environment();x.api.trackAcceptedOrder(ID,value);assert.equal(x.window.dataLayer.length,0);assert.equal(x.calls.length,1);}
});

test('commerce obeys opt-out/domain guard; disabling while loading removes queued purchases',()=>{
 for(const config of [{legacyCookie:true},{legacyStorage:true},{origin:'https://new.cocktaildesign.ru'},{enabled:'false'}]) {
  const x=environment(config);x.api.trackAcceptedOrder(ID,PURCHASE);assert.equal(x.window.dataLayer?.length??0,0);
 }
 const x=environment();x.api.trackAcceptedOrder(ID,PURCHASE);assert.equal(x.window.dataLayer.length,1);
 x.api.setAnalyticsEnabled(false);assert.equal(x.window.dataLayer.length,0);
 x.api.trackAcceptedOrder(ID,PURCHASE);assert.equal(x.window.dataLayer.length,0);
 x.scripts[0].onload();assert.equal(x.window.disableYaCounter49125430,true);
 const y=environment();Object.freeze(y.window.dataLayer);assert.doesNotThrow(()=>y.api.setAnalyticsEnabled(false));
});

test('checkout sends server purchase after acceptance, including CRM outage, and never submits a second order',async()=>{
 for(const confirmed of [true,false]) {
  const x=checkout({responses:[{ok:true,body:{ok:true,accepted:true,crmConfirmed:confirmed,journalId:ID,orderId:'22222222-2222-4222-a222-222222222222',orderName:'CD-42',analytics:PURCHASE}}]});
  await x.submit();await x.submit();assert.equal(x.requests.length,1);assert.equal(x.clears(),1);
  assert.equal(x.window.dataLayer.length,1);assert.equal(x.window.dataLayer[0].ecommerce.purchase.actionField.id,ID);
  assert.equal(x.window.dataLayer[0].ecommerce.purchase.actionField.revenue,2250.99,'No estimated cart total');
  assert.deepEqual(plain(x.window.dataLayer[0].ecommerce.purchase.products),PURCHASE.products);
 }
});

test('analytics blocked or throwing cannot prevent successful checkout, even with purchase metadata',async()=>{
 const x=checkout({trackerError:true,responses:[{ok:true,body:{ok:true,orderId:ID,orderName:'TEST',analytics:PURCHASE}}]});
 x.window.dataLayer.push=()=>{throw Error('blocked');};
 await x.submit();assert.equal(x.clears(),1);assert.deepEqual(x.navigation,['/checkout/success?order=TEST']);
});
