const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, imports = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, URLSearchParams,
    require: id => { assert.ok(id in imports, id); return imports[id]; } });
  return mod.exports;
}
const gallery = load('lib/catalog/variant-gallery.ts');
const photo = (src, variantId = null) => ({ src, alt: src, variantId });
const variant = (id, color, images, price) => ({ id, moyskladId: 'ms-' + id, code: 'SKU-' + id,
  name: 'Product ' + color, images, price, priceOld: price + 100,
  characteristics: [{ name: 'Выбор цвета', value: color }] });
const yellow = variant('yellow', 'Желтый', [], 260);
const red = variant('red', 'Красный', [photo('/red.webp')], 300);
const product = { id: 'parent', moyskladId: 'ms-parent', name: 'Product', slug: 'item', code: 'BASE',
  price: 400, priceOld: 500, images: [photo('/yellow.webp')], badges: [], engravingEnabled: false, discountExcluded: false };

test('variant photo takes priority; missing variant photo falls back to parent without mutating images', () => {
  const images = Object.freeze([photo('/parent.webp'), photo('/red.webp', 'red')]);
  assert.equal(gallery.variantGalleryIndex(images, 'red'), 1);
  assert.equal(gallery.variantGalleryIndex(images, 'yellow'), 0);
  assert.equal(gallery.variantGalleryIndex(images, null), 0);
});

test('missing own and parent photos never select a different variant photo', () => {
  assert.equal(gallery.variantGalleryIndex([photo('/red.webp', 'red')], 'yellow'), -1);
  assert.equal(gallery.variantGalleryIndex([], null), -1);
});

function harness(input = product, requested = '', variants = [yellow, red], media = {}) {
  const slots = []; let cursor = 0, tree, params = new URLSearchParams(requested);
  const noop = () => null;
  const Gallery = noop, Purchase = () => null;
  const hooks = {
    useState: initial => { const slot = cursor++; if (!(slot in slots)) slots[slot] = initial;
      return [slots[slot], value => { slots[slot] = value; }]; },
    useRef: initial => { const slot = cursor++; return slots[slot] ??= { current: initial }; },
    useMemo: fn => fn(), useEffect: noop, // URL/effect synchronization is checked in the real browser.
  };
  const Selector = load('app/catalog/product/[slug]/VariantSelector.tsx', {
    react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'), 'next/image': noop, 'next/link': noop,
    'next/navigation': { useSearchParams: () => params, useRouter: () => ({ replace: url => { params = new URLSearchParams(url); } }) },
    '@/components/icons/ArrowRightIcon': noop, '@/components/ui/copy-button/CopyButton': noop,
    '@/shared/ui/product-badges/ProductBadges': noop, '@/lib/catalog/color-order': load('lib/catalog/color-order.ts'),
    '@/lib/catalog/variant-gallery': gallery, '@/lib/catalog/bundle-display': { productBundleCards: () => [] },
    './ScrollToDescriptionButton': noop, './ProductGallery': Gallery, './ProductPurchaseControls': Purchase,
    './ProductPage.module.css': {},
  }).default;
  function all(node) { return Array.isArray(node) ? node.flatMap(all) : node && typeof node === 'object' ? [node, ...all(node.props?.children)] : []; }
  const find = predicate => { const node = all(tree).find(predicate); assert.ok(node); return node; };
  const render = () => { cursor = 0; tree = Selector({ product: input, variants, specifications: [], colorMap: {}, ...media }); };
  render();
  return {
    get gallery() { return find(node => node.type === Gallery).props; },
    get galleryKey() { return find(node => node.type === Gallery).key; },
    get purchase() { return find(node => node.type === Purchase).props; },
    get image() { return this.gallery.images[this.gallery.activeIndex]?.src; },
    get selected() { return find(node => node.props?.['aria-pressed'] === true).props['aria-label']; },
    get urlVariant() { return params.get('variant'); },
    select(color) { find(node => node.props?.['aria-label'] === color).props.onClick(); render(); },
    thumbnail(index) { this.gallery.onImageChange(index); render(); },
  };
}

test('yellow → red → yellow repeatedly resets photo and keeps purchase identity and price aligned', () => {
  const h = harness();
  for (let i = 0; i < 3; i++) {
    for (const [v, image] of [[red, '/red.webp'], [yellow, '/yellow.webp']]) {
      h.select(v.characteristics[0].value);
      assert.equal(h.image, image); assert.equal(h.selected, v.characteristics[0].value);
      assert.equal(h.purchase.variantId, v.id); assert.equal(h.purchase.code, v.code);
      assert.equal(h.purchase.price, v.price); assert.equal(h.purchase.imageUrl, image);
      assert.equal(h.urlVariant, v.id);
    }
  }
});

test('variant video follows only its exact selected variant and switching remounts the gallery', () => {
  const clip = { id:'red-review', src:'/red.mp4', poster:'/red.webp', thumbnail:'/red-thumb.webp',
    label:'Обзор', duration:5, width:960, height:960 };
  const h = harness(product, 'variant=red', [yellow, red], {
    videos:[{...clip,id:'parent-review'}], variantVideos:{red:[clip]},
  });
  const redKey = h.galleryKey;
  assert.equal(h.gallery.videos[0].id, clip.id);
  h.thumbnail(0);
  assert.equal(h.purchase.variantId, 'red');
  assert.equal(h.gallery.videos[0].id, clip.id);
  h.select('Желтый');
  assert.equal(h.gallery.videos.length, 0);
  assert.notEqual(h.galleryKey, redKey);
  assert.equal(h.purchase.code, yellow.code);
  assert.equal(h.purchase.imageUrl, '/yellow.webp');
  h.select('Красный');
  assert.equal(h.galleryKey, redKey);
  assert.equal(h.gallery.videos[0].id, clip.id);
  assert.equal(h.purchase.code, red.code);
  assert.equal(h.purchase.imageUrl, '/red.webp');
});

test('direct variant and SKU links choose their matching image or parent fallback', () => {
  for (const [query, expected] of [['variant=yellow', '/yellow.webp'], ['sku=SKU-yellow', '/yellow.webp'], ['variant=red', '/red.webp']]) {
    assert.equal(harness(product, query).image, expected);
  }
});

test('thumbnail selection still changes the variant; parent thumbnail preserves selected variant', () => {
  const h = harness(); h.thumbnail(1);
  assert.equal(h.purchase.variantId, 'red'); assert.equal(h.image, '/red.webp');
  h.thumbnail(0); assert.equal(h.purchase.variantId, 'red'); assert.equal(h.image, '/yellow.webp');
  h.select('Красный'); assert.equal(h.image, '/red.webp');
});

test('variant without any usable photo uses placeholder index and no incorrect cart image', () => {
  const h = harness({ ...product, images: [] }, 'variant=red');
  h.select('Желтый'); assert.equal(h.gallery.activeIndex, -1);
  assert.equal(h.purchase.imageUrl, null); assert.equal(h.purchase.variantId, 'yellow');
});

test('gallery renders placeholder rather than another variant when active photo is unavailable', () => {
  const Gallery = load('app/catalog/product/[slug]/ProductGallery.tsx', {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': ({ src, alt }) => React.createElement('img', { src, alt }),
    './ProductVideoPlayer': () => null, './ProductPage.module.css': { __esModule: true, default: { productGalleryMain: 'main-photo' } },
  }).default;
  const html = renderToStaticMarkup(React.createElement(Gallery, { images: [photo('/red.webp')], activeIndex: -1, onImageChange: () => {} }));
  assert.match(html, /class="main-photo"><img src="\/images\/catalog\/product-placeholder.webp"/);
  assert.equal(html.includes('aria-pressed="true"'), false);
});
