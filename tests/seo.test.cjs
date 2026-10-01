const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const mod = { exports: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../src', file), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, URLSearchParams, URL, process,
    require: id => {
      if (id in mocks) return mocks[id];
      if (id === 'react/jsx-runtime') return require(id);
      throw new Error(`Unexpected dependency ${id}`);
    } });
  return mod.exports;
}
const policy = load('lib/seo/policy.ts');
const { productJsonLd, offerAvailability } = load('lib/seo/product.ts');

test('legacy redirects have no chains, loops or pattern characters', () => {
  const routes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/lib/seo/legacy-redirects.json'), 'utf8'));
  for (const [source, destination] of Object.entries(routes)) {
    assert.ok(source.startsWith('/') && !source.startsWith('//'));
    assert.ok(destination.startsWith('/') && !destination.startsWith('//'));
    assert.equal(/[():*?+]/.test(source), false, source);
    assert.equal(routes[destination], undefined, source);
  }
});

test('indexing requires explicit approval AND the final HTTPS origin', () => {
  for (const site of ['https://new.cocktaildesign.ru', 'http://cocktaildesign.ru', 'http://localhost:3000', 'https://cocktaildesign.ru.evil.test']) {
    assert.equal(policy.canIndex(site, 'true'), false);
  }
  for (const flag of [undefined, '', 'false', 'TRUE']) assert.equal(policy.canIndex('https://cocktaildesign.ru', flag), false);
  assert.equal(policy.canIndex('https://cocktaildesign.ru/', 'true'), true);
  assert.equal(policy.robotsPolicy(false).googleBot.index, false);
});

test('pagination validates hostile/duplicate input and keeps filter context', () => {
  for (const value of ['0', '-1', '2abc', '1.5', '999999', ['2', '3'], '']) assert.equal(policy.pageNumber(value), null);
  assert.equal(policy.pageNumber(undefined), 1);
  assert.equal(policy.pageNumber('2'), 2);
  assert.equal(policy.listingHref('/catalog/x', 1), '/catalog/x');
  assert.equal(policy.listingHref('/catalog/collection/new', 3, 'ms-123', true), '/catalog/collection/new?category=ms-123&showAll=true&page=3');
  assert.equal(policy.withQuery('/catalog/product/ms-1', { variant: 'v1', utm_source: 'email', x: ['1','2'] }), '/catalog/product/ms-1?variant=v1&utm_source=email&x=1&x=2');
});

test('titles are not double branded and descriptions retain words', () => {
  assert.equal(policy.cleanPageTitle('Скидки — CocktailDesign — Cocktail Design'), 'Скидки');
  assert.equal(policy.descriptionText('  Описание\n\nс пробелами  '), 'Описание с пробелами');
  assert.equal(policy.descriptionText('Длинное описание товара для бара', 25), 'Длинное описание товара…');
});

test('structured data cannot terminate its script tag', () => {
  const data = { name: '</script><script>alert(1)</script>' };
  const serialized = policy.serializeJsonLd(data);
  assert.equal(serialized.includes('<'), false);
  assert.deepEqual(JSON.parse(serialized), data);
});

const product = { moyskladId: 'p1', slug: 'ms-p1', name: 'Стрейнер Koriko', code: 'Koriko', price: 450,
  description: 'Описание', images: [{src:'https://test/p.webp'}], badges: [], specifications: [] };
test('stock follows confirmed CRM state; unknown never claims available; no invented brand or condition', () => {
  const manual = [{label:'Нет в наличии'}];
  assert.equal(offerAvailability('p1', {p1:false}, manual), 'https://schema.org/InStock');
  assert.equal(offerAvailability('p1', {p1:true}), 'https://schema.org/OutOfStock');
  assert.equal(offerAvailability('p1', {}, manual), 'https://schema.org/OutOfStock');
  const data = productJsonLd(product, [], {}, 'https://test');
  assert.equal(data.brand, undefined);
  assert.equal(data.offers.availability, undefined);
  assert.equal(data.offers.itemCondition, undefined);
  assert.equal(data.offers.price, 450);
  assert.equal(productJsonLd({...product, price: 0}, [], {}, 'https://test').offers, undefined);
});

test('variant prices and stock are independent; zero parent price never hides valid offers', () => {
  const variants = [
    {id:'11', moyskladId:'v1', name:'Красный', code:'RED', price:700, images:[]},
    {id:'12', moyskladId:'v2', name:'Синий', code:'BLUE', price:900, images:[{src:'https://test/blue.webp'}]},
  ];
  const data = productJsonLd({...product, price:0}, variants, {v1:true,v2:false}, 'https://test');
  assert.equal(data['@type'], 'ProductGroup');
  assert.equal(data.hasVariant[0].offers.price, 700);
  assert.equal(data.hasVariant[0].offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(data.hasVariant[1].offers.price, 900);
  assert.equal(data.hasVariant[1].offers.url, 'https://test/catalog/product/ms-p1?variant=12');
  assert.equal(data.hasVariant[1].image[0], 'https://test/blue.webp');
});

test('page two requests the second batch and an empty out-of-range page is not a duplicate page one', async () => {
  let request;
  const api = { getProductsByCategorySlugFromStrapi: async params => { request=params; return {items:[{id:'51'}], hasMore:true}; } };
  const mocks = {'@/lib/api/catalog':api, '@/lib/api/catalog/index':{getColorMap:async()=>({})}, './ProductGridClient':{default:'Grid'}, 'next/navigation':{notFound:()=>{throw Error('404');}}};
  const grid = load('app/catalog/product-grid/ProductGrid.tsx', mocks).default;
  const element = await grid({categorySlug:'cat', page:2});
  assert.equal(request.offset, 50);
  assert.equal(element.props.initialPage, 2);
  assert.match(element.key, /page:2$/);
  api.getProductsByCategorySlugFromStrapi = async () => ({items:[],hasMore:false});
  await assert.rejects(grid({categorySlug:'cat', page:3}), /404/);
  assert.equal((await grid({categorySlug:'cat', page:1})).props.initialProducts.length, 0);
});

test('sitemap excludes broken and redirected paths, includes collections and deduplicates canonical products', async () => {
  const api = {
    getCatalogTreeFromStrapi: async () => [{slug:'cat',children:[{slug:'child'},{slug:'sample'}]}],
    getProductsByCategorySlugFromStrapi: async () => ({items:[{slug:'ms-p1'}],hasMore:false}),
    getCollectionProductsFromStrapi: async () => ({items:[{slug:'ms-p1'},{slug:'ms-p2'}],hasMore:false}),
  };
  const sitemap = load('app/sitemap.ts', {'@/lib/api/catalog':api, '@/lib/seo/site':{siteUrl:'https://test'},
    '@/lib/api/knowledge':{getKnowledgeItemsFromStrapi:async()=>[]}, '@/lib/seo/collections':{getSitemapCollectionSlugs:async()=>['new']},
    '@/lib/catalog/sample-sale':{SAMPLE_SALE_CATEGORY_SLUG:'sample'}}).default;
  const urls = (await sitemap()).map(row=>row.url);
  assert.equal(urls.some(url=>url.endsWith('/help') || url.endsWith('/sample')), false);
  assert.equal(urls.filter(url=>url.endsWith('/ms-p1')).length, 1);
  assert.ok(urls.includes('https://test/catalog/collection/new'));
  assert.ok(urls.includes('https://test/catalog/product/ms-p2'));
});
