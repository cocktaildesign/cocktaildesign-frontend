const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const pilot = require('../src/lib/catalog/product-video-pilot.json');
const published = require('../src/lib/catalog/product-videos.json');
function load(file, imports) {
  const mod = {exports:{}};
  const source = fs.readFileSync(path.join(__dirname, '../src', file),'utf8');
  const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{module:mod,exports:mod.exports,require:id=>{assert.ok(id in imports,id);return imports[id];}});
  return mod.exports;
}
const {getPilotProductVideos, getProductVideos} = load('lib/catalog/product-videos.ts',{
  './product-video-pilot.json':pilot, './product-videos.json':published,
});
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
test('initial gallery preserves every photo before all video thumbnails, without video source or player',()=>{
  const html=renderToStaticMarkup(React.createElement(Gallery,{images:[{src:'/photo-1.webp',alt:'First'},{src:'/photo-2.webp',alt:'Second'},{src:'/photo-3.webp',alt:'Third'}],activeIndex:0,onImageChange:()=>{},videos:pilot[0].videos}));
  assert.equal(html.includes('<video'),false);
  assert.equal(html.includes('.mp4'),false);
  assert.ok(html.indexOf('Показать фото 1')<html.indexOf('Смотреть Короткий'));
  assert.ok(html.indexOf('Показать фото 1')<html.indexOf('Показать фото 2'));
  assert.ok(html.indexOf('Показать фото 2')<html.indexOf('Показать фото 3'));
  assert.ok(html.indexOf('Показать фото 3')<html.indexOf('Смотреть Короткий'));
  assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
});

test('reviewed selection keeps one exact clip for each of the fourteen requested SKUs',()=>{
  const selected = {
    EcoGrnshEucalpts:'ecogrnsheucalpts-4-e18a1744ff6a',
    ShKor:'shkor-3-25407a20153b',
    'BagNl20/30-100':'bagnl20-30-100-1-ab1eb8bba500',
    StrawGlsBlck:'strawglsblck-1-b57cbddace29',
    MixRtm:'mixrtm-3-6504869766a5',
    MldHex1:'mldhex1-1-d53d3f1cdb6b',
    ClspinsCl:'clspinscl-1-0197b72329eb',
    MnSrgCDExdMoon:'mnsrgcdexdmoon-2-8c9d69a9f11c',
    WdSpoonMini:'wdspoonmini-1-043f31765db2',
    SpCDDoom:'spcddoom-2-664c7aa4cf9e',
    LeafBl100:'leafbl100-2-e01b5844ee5d',
    'JigAsh60/90':'jigash60-90-2-fae946a1429e',
    Scls0001:'scls0001-1-7ad6cf49cc92',
    GlsJf:'glsjf-2-36dc39431be8',
  };
  assert.equal(published.length,14);
  assert.deepEqual(
    Object.fromEntries(published.map(p=>[p.variant?.code ?? p.code,p.videos.map(v=>v.id)])),
    Object.fromEntries(Object.entries(selected).map(([sku,id])=>[sku,[id]])),
  );
  assert.equal(published.filter(p=>p.variant).length,7);
  const ids = published.flatMap(p=>p.videos.map(v=>v.id));
  assert.equal(ids.length,14);
  assert.equal(new Set(ids).size,14);
  for(const entry of published) {
    entry.videos.forEach(video=>{
      assert.match(video.src,/^\/product-videos\/[a-z0-9-]+-[0-9a-f]{12}\.mp4$/);
      assert.match(video.poster,/^\/product-videos\/[a-z0-9-]+-[0-9a-f]{12}\.webp$/);
      assert.match(video.thumbnail,/^\/product-videos\/[a-z0-9-]+-[0-9a-f]{12}\.webp$/);
      assert.ok(video.duration>0 && video.width>0 && video.height>0);
    });
  }
});

test('new product and variant videos require both parent and selected-variant UUID and SKU',()=>{
  for(const entry of published) {
    const base={moyskladId:entry.moyskladId,code:entry.code,isSampleSale:false};
    const variants=entry.variant ? [{id:'current-strapi-id',...entry.variant}] : [];
    const result=getProductVideos(base,variants,false);
    const selected=entry.variant ? result.variantVideos['current-strapi-id'] : result.videos;
    assert.deepEqual(Array.from(selected,v=>v.id),entry.videos.map(v=>v.id));
    for(const altered of [{...base,moyskladId:'other-parent'},{...base,code:'other-parent-sku'},{...base,isSampleSale:true}]) {
      const denied=getProductVideos(altered,variants,false);
      assert.equal(denied.videos.length,0);
      assert.equal(Object.keys(denied.variantVideos).length,0);
    }
    if(entry.variant) {
      assert.equal(result.videos.length,0);
      assert.equal(getProductVideos(base,[],false).videos.length,0);
      for(const variant of [{...variants[0],moyskladId:'other-variant'},{...variants[0],code:'other-variant-sku'}]) {
        assert.equal(Object.keys(getProductVideos(base,[variant],false).variantVideos).length,0);
      }
      const neighbour={id:'neighbour',moyskladId:'other-variant',code:'other-sku'};
      assert.equal(getProductVideos(base,[...variants,neighbour],false).variantVideos.neighbour,undefined);
    } else {
      assert.equal(getProductVideos(base,[{id:'new-variant',...base}],false).videos.length,0);
    }
  }
});

test('publishing the new registry does not reactivate the five hidden legacy products',()=>{
  for(const entry of pilot) {
    const result=getProductVideos({...entry,isSampleSale:false},[],false);
    assert.equal(result.videos.length,0);
    assert.equal(Object.keys(result.variantVideos).length,0);
  }
});

test('video selection preserves photo index and returning to a photo removes the player',()=>{
  let selectedVideo=null;
  const changes=[];
  const Player=()=>null;
  const InteractiveGallery=load('app/catalog/product/[slug]/ProductGallery.tsx',{
    react:{useState:()=>[selectedVideo,value=>{selectedVideo=value;}]},
    'react/jsx-runtime':require('react/jsx-runtime'), 'next/image':()=>null,
    './ProductPage.module.css':{}, './ProductVideoPlayer':Player,
  }).default;
  const images=[{src:'/one.webp',alt:'One'},{src:'/two.webp',alt:'Two'}];
  const clips=pilot.find(p=>p.code==='StCDVrs').videos;
  const all=node=>Array.isArray(node)?node.flatMap(all):node && typeof node==='object'?[node,...all(node.props?.children)]:[];
  const render=()=>all(InteractiveGallery({images,activeIndex:1,onImageChange:i=>changes.push(i),videos:clips}));
  for(const clip of clips) {
    const button=render().find(n=>n.type==='button' && n.props['aria-label']?.startsWith(`Смотреть ${clip.label}`));
    button.props.onClick();
    assert.equal(render().find(n=>n.type===Player).props.video.id,clip.id);
    assert.deepEqual(changes,[]);
  }
  render().find(n=>n.type==='button' && n.props['aria-label']==='Показать фото 2').props.onClick();
  assert.deepEqual(changes,[1]);
  assert.equal(render().some(n=>n.type===Player),false);
});
test('ordinary photo-only gallery and empty/invalid photo index remain usable',()=>{
  const html=renderToStaticMarkup(React.createElement(Gallery,{images:[],activeIndex:99,onImageChange:()=>{}}));
  assert.match(html,/product-placeholder.webp/);
  assert.equal(html.includes('Смотреть'),false);
  assert.equal(html.includes('<video'),false);
});
