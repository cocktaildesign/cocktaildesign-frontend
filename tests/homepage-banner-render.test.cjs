const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const src = path.resolve(__dirname, '../src');

function loader(index = 0) {
  const cache = new Map();
  function load(relative) {
    const file = path.resolve(src, relative);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = {exports:{}};
    cache.set(file, mod);
    const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {
      compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
      fileName:file,
    }).outputText;
    vm.runInNewContext(code,{module:mod,exports:mod.exports,URL,require:id=>{
      if (id.endsWith('.module.css')) return new Proxy({}, {get:(_,name)=>name === '__esModule' ? false : String(name)});
      if (id === './useCarousel') return {__esModule:true,default:()=>({index,rotating:false,interactions:{},select(){},previous(){},next(){}})};
      if (id === 'next/link') return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
      if (id === 'next/image') return {__esModule:true,default:props=>React.createElement('img',props)};
      if (id.startsWith('.') || id.startsWith('@/')) {
        const base = id.startsWith('@/') ? path.join(src,id.slice(2)) : path.resolve(path.dirname(file),id);
        const target = ['.tsx','.ts'].map(ext=>base+ext).find(candidate=>fs.existsSync(candidate));
        assert.ok(target,`Missing source dependency ${id}`);
        return load(path.relative(src,target));
      }
      return require(id);
    }});
    return mod.exports;
  }
  return load;
}

test('StartUp renders editable text with separate CTA and copy button; hidden slides are inert',()=>{
  const load=loader(1);
  const {DEFAULT_HERO_BANNERS}=load('lib/api/homepage-banners/model.ts');
  const Slider=load('components/ui/slider/Slider.tsx').default;
  const html=renderToStaticMarkup(React.createElement(Slider,{images:DEFAULT_HERO_BANNERS}));
  assert.match(html,/<div class="slide" aria-hidden="true" inert="">/);
  const anchors=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(anchors.length,4);
  assert.ok(anchors.every(([, ,body])=>!body.includes('<button')),'Buttons must not be nested in links');
  assert.match(html,/<a class="cta" href="\/discounts#startup">Условия акции<span aria-hidden="true"> →<\/span><\/a>/);
  assert.match(html,/aria-label="Скопировать: Промокод"/);
  assert.match(html,/<strong>STARTCD20<\/strong>/);
  assert.match(html,/<span class="offer">−20%<\/span>/);
});

test('StartUp renders other CMS notes literally and omits the copy button for non-code notes',()=>{
  const load=loader();
  const {DEFAULT_HERO_BANNERS}=load('lib/api/homepage-banners/model.ts');
  const Banner=load('components/ui/slider/StartupBannerContent.tsx').default;
  for(const note of ['Промокод startcd20','Промокод STARTCD20 и подарок','Текст из CMS <условия>']) {
    const banner={...DEFAULT_HERO_BANNERS[0],href:undefined,editorial:{...DEFAULT_HERO_BANNERS[0].editorial,note}};
    const html=renderToStaticMarkup(React.createElement(Banner,{banner,priority:false}));
    assert.doesNotMatch(html,/<button|<a\b/);
    assert.ok(html.includes(note.replaceAll('<','&lt;').replaceAll('>','&gt;')));
  }
});

test('StartUp uses full-width responsive image sizes with matching media-gated preloads',()=>{
  const load=loader();
  const {DEFAULT_HERO_BANNERS}=load('lib/api/homepage-banners/model.ts');
  const Banner=load('components/ui/slider/StartupBannerContent.tsx').default;
  const Preloads=load('sections/home/01-hero-section/BannerPreloads.tsx').default;
  const banner={...DEFAULT_HERO_BANNERS[0],desktopSrcSet:'/full.webp 1932w',mobileSrcSet:'/full.webp 1932w'};
  for(const mobile of [false,true]) {
    const html=renderToStaticMarkup(React.createElement(Banner,{banner,mobile,priority:true}));
    assert.match(html,/<source media="[^"]+" srcSet="\/full.webp 1932w" sizes="100vw"/);
    assert.match(html,/<img src="data:image\//);
    assert.match(html,/loading="eager" fetchPriority="high"/);
    assert.ok(html.includes(mobile ? 'media="(max-width: 600px)"' : 'media="not all and (max-width: 600px)"'));
  }
  const html=renderToStaticMarkup(React.createElement(Preloads,{banners:[banner]}));
  assert.equal((html.match(/imageSizes="100vw"/g)||[]).length,2);
  assert.match(html,/media="not all and \(max-width: 600px\)"/);
  assert.match(html,/media="\(max-width: 600px\)"/);
});
