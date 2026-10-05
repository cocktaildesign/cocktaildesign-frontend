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
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, URLSearchParams,
    require: id => { assert.ok(id in imports, id); return imports[id]; } });
  return mod.exports;
}
const order = load('lib/catalog/color-order.ts');
const { sortColorVariants } = order;
const { homeProductCard } = load('lib/catalog/home-product-card.ts', { './color-order': order });
const variant = (id, color, price = 700, group = 'Выбор цвета') => ({
  id, moyskladId: 'ms-' + id, name: 'Ложка (' + color + ')', code: id,
  price, priceOld: 0, characteristics: color ? [{ name: group, value: color }] : [],
  images: [{ src: '/' + id + '.webp', alt: color }],
});
const silver = variant('SpSil', 'Серебро', 500), gold = variant('SpGold', 'Золото');
const copper = variant('SpCop', 'Медь'), black = variant('SpBl', 'Черный');
const ids = list => Array.from(list, item => item.id);
const product = (variants, extra = {}) => ({
  id: 'parent', moyskladId: 'parent-ms', name: 'Ложка', slug: 'spoon', code: 'Sp',
  price: 900, priceOld: 1000, images: ['/parent.webp'], imageUrl: '/parent.webp',
  imageSrcSets: { '/SpSil.webp': 'silver-small 500w', '/parent.webp': 'parent-small 500w' },
  variants, engravingEnabled: true, discountExcluded: false, badges: [], ...extra,
});

test('all input permutations produce silver, gold, copper, black without changing identities or money', () => {
  function permutations(xs) { return xs.length ? xs.flatMap((x, i) => permutations(xs.filter((_, j) => i !== j)).map(rest => [x, ...rest])) : [[]]; }
  for (const input of permutations([silver, gold, copper, black])) {
    const before = JSON.stringify(input);
    const sorted = sortColorVariants(Object.freeze(input));
    assert.deepEqual(ids(sorted), ['SpSil', 'SpGold', 'SpCop', 'SpBl']);
    assert.equal(JSON.stringify(input), before);
    assert.equal(sorted[0], silver); assert.equal(sorted[1], gold);
  }
});

test('aliases share a priority, accented black is recognised and other colours sort in Russian', () => {
  const values = ['Синий', 'чёрный', 'Медь', ' Золотой ', ' серебристый ', 'Белый', 'Красный'];
  assert.deepEqual(ids(sortColorVariants(values.map((v, i) => variant(String(i), v)))), ['4', '3', '2', '1', '5', '6', '0']);
  assert.deepEqual(ids(sortColorVariants([variant('a', 'silver'), variant('b', 'Серебро'), variant('c', 'Серебряный')])), ['a', 'b', 'c']);
});

test('missing silver does not fabricate an option; empty and non-colour groups stay intact', () => {
  assert.deepEqual(ids(sortColorVariants([black, copper, gold])), ['SpGold', 'SpCop', 'SpBl']);
  assert.deepEqual(ids(sortColorVariants([])), []);
  const sizes = [variant('l', '50 см', 900, 'Размер'), variant('s', '20 см', 400, 'Размер')];
  assert.deepEqual(ids(sortColorVariants(sizes)), ['l', 's']);
  assert.deepEqual(ids(sortColorVariants([black, sizes[0], silver, sizes[1]])), ['SpSil', 'l', 'SpBl', 's']);
});

test('multiple sizes of the same colour retain their original relative order and all characteristics', () => {
  const a = variant('a', 'Серебро'), b = variant('b', 'Серебро');
  a.characteristics.push({name: 'Объём', value: '50 мл'});
  b.characteristics.push({name: 'Объём', value: '25 мл'});
  const result = sortColorVariants([gold, a, b]);
  assert.deepEqual(ids(result), ['a', 'b', 'SpGold']);
  assert.equal(result[0], a); assert.equal(result[1], b);
});

test('home card uses the default colour photo, price, link and stock identity as a unit', () => {
  const input = product([copper, black, silver, gold]);
  const before = JSON.stringify(input), result = homeProductCard(input);
  assert.equal(result.preferredVariantId, silver.id);
  assert.equal(result.price, 500); assert.equal(result.priceOld, 0);
  assert.equal(result.imageUrl, '/SpSil.webp'); assert.equal(result.images[0], '/SpSil.webp');
  assert.equal(result.imageSrcSets['/SpSil.webp'], input.imageSrcSets['/SpSil.webp']);
  assert.equal(result.badgeMoyskladId, silver.moyskladId);
  assert.equal(JSON.stringify(input), before);
});

test('explicit promotional variant survives colour sorting and home card projection', () => {
  const saleGold = { ...gold, price: 600, priceOld: 900 };
  const input = product([saleGold, silver], { preferredVariantId: gold.id,
    price: 600, priceOld: 900, images: ['/SpGold.webp'], imageUrl: '/SpGold.webp' });
  const result = homeProductCard(input);
  assert.equal(result.preferredVariantId, gold.id); assert.equal(result.price, 600);
  assert.equal(result.images[0], '/SpGold.webp'); assert.equal(result.badgeMoyskladId, gold.moyskladId);
});

test('plain, sample-sale and non-colour products retain their displayed fields', () => {
  for (const variants of [[], [variant('size', '25 мл', 800, 'Объём')]]) {
    const input = product(variants, { isSampleSale: true, discountExcluded: true });
    const result = homeProductCard(input);
    for (const key of ['price', 'priceOld', 'imageUrl', 'images', 'preferredVariantId', 'isSampleSale']) assert.equal(result[key], input[key]);
  }
});

function detail(requestedId) {
  const noop = () => null;
  const imports = {
    'react': React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': noop, 'next/link': noop,
    'next/navigation': { useRouter: () => ({replace: noop}), useSearchParams: () => new URLSearchParams(requestedId ? {variant: requestedId} : {}) },
    '@/components/icons/ArrowRightIcon': noop, '@/components/ui/copy-button/CopyButton': noop,
    '@/shared/ui/product-badges/ProductBadges': noop, '@/lib/catalog/color-order': order,
    './ProductComposition': noop, './ScrollToDescriptionButton': noop,
    './ProductGallery': ({images, activeIndex}) => React.createElement('output', {'data-image': images[activeIndex]?.src}),
    './ProductPurchaseControls': props => React.createElement('output', {'data-purchase': JSON.stringify(props)}),
    './ProductPage.module.css': new Proxy({}, {get: (_, key) => String(key)}),
  };
  return load('app/catalog/product/[slug]/VariantSelector.tsx', imports).default;
}
test('detail selects silver with matching photo, SKU, price and cart ID by default', () => {
  const html = renderToStaticMarkup(React.createElement(detail(), {
    product: product([], {images: []}), variants: [copper, black, silver, gold], specifications: [], colorMap: {},
  }));
  assert.ok(html.indexOf('title="Серебро"') < html.indexOf('title="Золото"'));
  assert.match(html, /aria-pressed="true" aria-label="Серебро"/);
  assert.match(html, /data-image="\/SpSil.webp"/);
  assert.match(html, /&quot;productId&quot;:&quot;SpSil&quot;/);
  assert.match(html, /&quot;price&quot;:500/);
});
test('explicit variant URLs keep their selected colour and purchase data; stale URLs use silver', () => {
  for (const [requestedId, selected] of [[gold.id, gold], ['missing', silver]]) {
    const html = renderToStaticMarkup(React.createElement(detail(requestedId), {
      product: product([], {images: []}), variants: [copper, gold, silver], specifications: [], colorMap: {},
    }));
    assert.ok(html.includes('data-image="/' + selected.id + '.webp"'));
    assert.ok(html.includes('&quot;productId&quot;:&quot;' + selected.id + '&quot;'));
    assert.ok(html.includes('aria-pressed="true" aria-label="' + selected.characteristics[0].value + '"'));
  }
});

test('catalogue renders sorted swatches while preserving the selected promotional variant', () => {
  const noop = () => null;
  const imports = {
    'react': React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': ({src}) => React.createElement('img', {src}),
    'next/link': ({href, children}) => React.createElement('a', {href}, children),
    '@/components/icons/ArrowRightIcon': noop,
    '@/components/ui/quantity/QuantityControl': noop,
    '@/components/ui/engraving/EngravingToggle': noop,
    '@/components/ui/favorites/FavoriteButton': noop,
    '@/shared/ui/product-badges/ProductBadges': noop,
    '@/lib/cart/cartStore': {useCartStore: selector => selector({items: [], addItem: noop, removeItem: noop})},
    '@/lib/catalog/color-order': order,
    './ProductCard.module.css': {default: new Proxy({}, {get: (_, key) => String(key)})},
  };
  const Card = load('app/catalog/product-card/ProductCard.tsx', imports).default;
  for (const selected of [undefined, gold.id]) {
    const html = renderToStaticMarkup(React.createElement(Card, {
      product: product([copper, black, silver, gold], {preferredVariantId: selected}), colorMap: {},
    }));
    const positions = ['Серебро', 'Золото', 'Медь', 'Черный'].map(c => html.indexOf('title="' + c + '"'));
    assert.ok(positions.every((p, i) => p >= 0 && (i === 0 || p > positions[i - 1])));
    assert.ok(html.includes('href="/catalog/product/spoon?variant=' + (selected ?? silver.id) + '"'));
    assert.ok(html.includes('src="/' + (selected ?? silver.id) + '.webp"'));
    assert.ok(html.includes(selected ? '700 ₽' : '500 ₽'));
  }
});
