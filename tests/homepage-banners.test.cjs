const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}) {
  const mod = {exports:{}};
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/api/homepage-banners', file), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code, {module:mod, exports:mod.exports, URL, console:{warn(){}}, require:id=>imports[id]});
  return mod.exports;
}
const model = load('model.ts');
const base = 'https://api.cocktaildesign.ru';
const slide = id => ({id, title:`Баннер ${id}`, desktopImage:{url:`/uploads/${id}.webp`},mobileImage:{url:`/uploads/${id}-m.webp`},href:'/catalog',isActive:true});
test('CMS order, active toggle, desktop/mobile assets and link are preserved', () => {
  const result = model.normalizeBanners([slide(3),{...slide(2),isActive:false},slide(1)],[],base);
  assert.equal(JSON.stringify(result.map(s=>s.id)), '[3,1]');
  assert.equal(result[0].desktopUrl,base+'/uploads/3.webp');
  assert.equal(result[0].mobileUrl,base+'/uploads/3-m.webp');
  assert.equal(result[0].href,'/catalog');
});
test('empty/disabled sliders stay hidden; missing CMS data uses bundled banners', () => {
  const fallback=model.DEFAULT_HERO_BANNERS;
  assert.equal(model.normalizeBanners(undefined,fallback,base),fallback);
  assert.equal(model.normalizeBanners(null,fallback,base),fallback);
  assert.equal(model.normalizeBanners([],fallback,base).length,0);
  assert.equal(model.normalizeBanners([{...slide(1),isActive:false}],fallback,base).length,0);
});
test('incomplete media cannot crash the page or inject foreign image URLs', () => {
  const fallback=model.DEFAULT_HERO_BANNERS;
  assert.equal(model.normalizeBanners([{...slide(1),mobileImage:null}],fallback,base),fallback);
  assert.equal(model.normalizeBanners([{...slide(1),desktopImage:{url:'https://foreign.test/a.png'}}],fallback,base),fallback);
  assert.equal(model.normalizeBanners([slide(1),null],fallback,base).length,1);
});
test('banner destinations accept site paths or HTTPS and reject unsafe schemes', () => {
  for(const href of ['javascript:alert(1)','data:text/html,x','//evil.test','/\\evil.test','https://site.test/a b','']) assert.equal(model.safeBannerHref(href),undefined);
  for(const href of ['/catalog','/catalog?a=1#x','https://cocktaildesign.ru/school']) assert.equal(model.safeBannerHref(href),href);
});
test('CMS outage keeps current hero and promo artwork; CMS remains editable', async () => {
  const loader=fetchStrapi=>load('index.ts',{'../strapi/client':{fetchStrapi,getStrapiUrl:()=>base},'./model':model});
  const unavailable=await loader(async()=>{throw new Error('offline')}).getHomepageBanners();
  assert.equal(unavailable.hero.length,3);assert.equal(unavailable.promo.length,2);
  const result=await loader(async(route,params)=>{
    assert.equal(route,'/api/homepage');
    assert.equal(params['populate[heroBanners][populate]'],'*');
    assert.equal(params['populate[promoBanners][populate]'],'*');
    return {data:{heroBanners:[slide(2)],promoBanners:[]}};
  }).getHomepageBanners();
  assert.equal(result.hero[0].id,2);assert.equal(result.promo.length,0);
});
test('responsive banner sizes use only real CMS media while keeping original artwork and destinations', () => {
  const source = {...slide(7), mobileImage:{url:'/uploads/mobile.webp',width:640,formats:{
    small:{url:'/uploads/mobile-small.webp',width:400},
    thumbnail:{url:'/uploads/mobile-thumbnail.webp',width:125},
    foreign:{url:'https://foreign.test/other.webp',width:500},
    invalid:{url:'/uploads/no-width.webp',width:0},
  }}};
  const snapshot=JSON.stringify(source);
  const result=model.normalizeBanners([source],[],base)[0];
  assert.equal(result.mobileSrcSet,`${base}/uploads/mobile-thumbnail.webp 125w, ${base}/uploads/mobile-small.webp 400w, ${base}/uploads/mobile.webp 640w`);
  assert.equal(result.mobileUrl,base+'/uploads/mobile.webp');
  assert.equal(result.desktopSrcSet,undefined);
  assert.equal(result.href,'/catalog');
  assert.equal(JSON.stringify(source),snapshot);
});

test('editorial banners use a single responsive photo and preserve plain text; legacy banners stay image-only', () => {
  const source={...slide(9),useTextLayout:true,heading:' Новинки\nинвентаря ',description:'Описание',buttonLabel:'Смотреть',note:'Условия',productImage:{url:'/uploads/product.webp',width:1000,height:800,formats:{small:{url:'/uploads/product-small.webp',width:500}}}};
  const before=JSON.stringify(source),out=model.normalizeBanners([source,slide(8)],[],base);
  assert.equal(out[0].editorial.heading,'Новинки\nинвентаря');
  assert.equal(out[0].desktopUrl,out[0].mobileUrl);
  assert.equal(out[0].desktopUrl,base+'/uploads/product.webp');
  assert.equal(out[0].desktopSrcSet,out[0].mobileSrcSet);
  assert.equal(out[1].editorial,undefined);
  assert.equal(JSON.stringify(source),before);
});
test('incomplete editorial publication fails safely; optional text and no-link banners are supported', () => {
 const source={...slide(1),useTextLayout:true,heading:'Заголовок',buttonLabel:'В каталог',productImage:{url:'/uploads/photo.webp'}};
 for(const change of [{heading:''},{productImage:null},{buttonLabel:''}]) assert.equal(model.normalizeBanners([{...source,...change}],model.DEFAULT_HERO_BANNERS,base),model.DEFAULT_HERO_BANNERS);
 const out=model.normalizeBanners([{...source,href:'',buttonLabel:''}],[],base)[0];
 assert.equal(out.href,undefined);assert.equal(out.editorial.note,'');
 assert.equal(model.normalizeBanners([{...source,isActive:false}],model.DEFAULT_HERO_BANNERS,base).length,0);
});
