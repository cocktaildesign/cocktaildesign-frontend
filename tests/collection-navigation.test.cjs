const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

const categories = [{id:'1', slug:'bar', name:'Барный инвентарь', children:[
  {id:'2', slug:'shakers', name:'Шейкеры', children:[]},
]}];

function load(items = categories) {
  const module = {exports:{}};
  const filename = path.resolve(__dirname, '../src/app/catalog/collection/[slug]/page.tsx');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2020, jsx:ts.JsxEmit.ReactJSX, esModuleInterop:true},
    fileName:filename,
  }).outputText;
  vm.runInNewContext(code, {module, exports:module.exports, require(id) {
    if (id === '@/lib/api/catalog') return {
      getCollectionProductsFromStrapi: async ({slug}) => ({collection:{title:'Подборка', slug, description:'Описание'}}),
      getCollectionCategoriesTreeFromStrapi: async () => items,
    };
    if (id === '@/lib/seo/policy') return {
      pageNumber: p => p === undefined ? 1 : /^[1-9]\d*$/.test(p) ? Number(p) : null,
    };
    if (id === '@/lib/seo/metadata') return {};
    if (id === 'next/navigation') return {notFound() { throw new Error('not found'); }};
    if (id.endsWith('.module.css')) return new Proxy({}, {get:(_,key) => key === '__esModule' ? false : String(key)});
    if (id === 'next/link') return {__esModule:true, default:'a'};
    if (id.endsWith('/ProductGrid')) return {__esModule:true, default:'product-grid'};
    if (id.endsWith('/CatalogSidebar')) return {__esModule:true, default:'catalog-sidebar'};
    if (id.endsWith('/CollectionMobileCategoryDrillDown')) return {__esModule:true, default:'category-tiles'};
    if (id.startsWith('@/')) return {__esModule:true, default:'layout-stub'};
    return require(id);
  }});
  return query => module.exports.default({params:Promise.resolve({slug:'novinki'}), searchParams:Promise.resolve(query)});
}

function find(element, type) {
  if (!React.isValidElement(element)) return undefined;
  if (element.type === type) return element;
  return React.Children.toArray(element.props.children).map(child => find(child, type)).find(Boolean);
}

for (const query of [{}, {showAll:'true'}, {showAll:'false'}]) {
  test(`collection entry serves products without requiring category selection: ${JSON.stringify(query)}`, async () => {
    const tree = await load()(query);
    assert.equal(find(tree, 'product-grid').props.collectionSlug, 'novinki');
    assert.equal(find(tree, 'product-grid').props.filterCategorySlug, undefined);
    assert.equal(find(tree, 'details').props.open, undefined);
    assert.equal(find(find(tree, 'details'), 'product-grid'), undefined, 'products must stay outside the closed category disclosure');
  });
}

test('parent and leaf filters retain the collection and keep products accessible', async () => {
  for (const category of ['bar', 'shakers']) {
    const tree = await load()({category});
    assert.equal(find(tree, 'product-grid').props.collectionSlug, 'novinki');
    assert.equal(find(tree, 'product-grid').props.filterCategorySlug, category);
    assert.equal(find(tree, 'catalog-sidebar').props.activeSlug, category);
    assert.equal(find(tree, 'category-tiles').props.collectionSlug, 'novinki');
    assert.ok(find(tree, 'category-tiles').props.categories.length);
  }
});

test('unknown or removed category resets filtering instead of producing a false empty collection', async () => {
  const tree = await load()({category:'removed'});
  assert.equal(find(tree, 'product-grid').props.filterCategorySlug, undefined);
  assert.equal(find(tree, 'catalog-sidebar').props.activeSlug, '');
});

test('pagination preserves a valid filter and rejects invalid page numbers', async () => {
  const tree = await load()({category:'shakers', page:'2', showAll:'true'});
  assert.equal(find(tree, 'product-grid').props.page, 2);
  assert.equal(find(tree, 'product-grid').props.filterCategorySlug, 'shakers');
  await assert.rejects(load()({page:'-1'}), /not found/);
});

test('collections without a category tree still render the product list', async () => {
  const tree = await load([])({});
  assert.equal(find(tree, 'details'), undefined);
  assert.ok(find(tree, 'product-grid'));
});
