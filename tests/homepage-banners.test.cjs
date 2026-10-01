const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}) {
  const mod = {exports:{}};
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/api/homepage-banners', file), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
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
test('CMS outage preserves both existing sliders; homepage query requests both media pairs', async () => {
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
