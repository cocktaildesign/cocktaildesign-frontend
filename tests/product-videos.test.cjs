const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const pilot = require('../src/lib/catalog/product-video-pilot.json');
function load(file, imports) {
  const mod = {exports:{}};
  const source = fs.readFileSync(path.join(__dirname, '../src', file),'utf8');
  const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{module:mod,exports:mod.exports,require:id=>{assert.ok(id in imports,id);return imports[id];}});
  return mod.exports;
}
const {getPilotProductVideos} = load('lib/catalog/product-videos.ts',{'./product-video-pilot.json':pilot});
const product = {...pilot[0],isSampleSale:false};
test('pilot requires enablement and exact UUID + SKU; excludes sale and variants',()=>{
  assert.equal(getPilotProductVideos(product,0,false).length,0);
  assert.equal(getPilotProductVideos(product,0,true).length,1);
  assert.equal(getPilotProductVideos({...product,moyskladId:'other'},0,true).length,0);
  assert.equal(getPilotProductVideos({...product,code:'other'},0,true).length,0);
  assert.equal(getPilotProductVideos({...product,isSampleSale:true},0,true).length,0);
  assert.equal(getPilotProductVideos(product,1,true).length,0);
});
test('exactly five unique products; same-product short and full Virus cuts',()=>{
  assert.equal(pilot.length,5);
  assert.equal(new Set(pilot.map(p=>p.moyskladId)).size,5);
  assert.equal(new Set(pilot.map(p=>p.code)).size,5);
  assert.deepEqual(pilot.find(p=>p.code==='StCDVrs').videos.map(v=>v.id),['virus-short','virus']);
  for(const p of pilot)for(const v of p.videos){
    assert.match(v.src,/^\/product-videos\/[a-z-]+-[0-9a-f]{12}\.mp4$/);
    assert.match(v.poster,/^\/product-videos\/[a-z-]+-[0-9a-f]{12}\.webp$/);
    assert.ok(v.duration>0 && v.duration<35);
  }
});
const Gallery = load('app/catalog/product/[slug]/ProductGallery.tsx',{
  'react':React,'react/jsx-runtime':require('react/jsx-runtime'),
  'next/image':({src,alt})=>React.createElement('img',{src,alt}),
  './ProductPage.module.css':{},
  './ProductVideoPlayer':()=>{throw Error('video player mounted before selection');},
}).default;
test('initial gallery renders first photo and video thumbnail second, without video source or player',()=>{
  const html=renderToStaticMarkup(React.createElement(Gallery,{images:[{src:'/photo-1.webp',alt:'First'},{src:'/photo-2.webp',alt:'Second'}],activeIndex:0,onImageChange:()=>{},videos:pilot[0].videos}));
  assert.equal(html.includes('<video'),false);
  assert.equal(html.includes('.mp4'),false);
  assert.ok(html.indexOf('Показать фото 1')<html.indexOf('Смотреть Короткий'));
  assert.ok(html.indexOf('Смотреть Короткий')<html.indexOf('Показать фото 2'));
  assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
});
test('ordinary photo-only gallery and empty/invalid photo index remain usable',()=>{
  const html=renderToStaticMarkup(React.createElement(Gallery,{images:[],activeIndex:99,onImageChange:()=>{}}));
  assert.match(html,/product-placeholder.webp/);
  assert.equal(html.includes('Смотреть'),false);
  assert.equal(html.includes('<video'),false);
});
