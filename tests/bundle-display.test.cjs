const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/catalog/bundle-display.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { module: mod, exports: mod.exports, encodeURIComponent });
const { productBundleCards, productDisplaySpecifications, bundleComponentHref } = mod.exports;
const product = () => ({ hideBundleContents: false, bundleItems: [], composition: [], specifications: [
  { id: '1', label: 'Тип товара', value: 'Набор' },
  { id: '2', label: 'Комплектация', value: 'Старый предмет; Второй предмет' },
  { id: '3', label: 'Комплектация', value: 'Третий предмет' },
] });
test('bundle cards preserve exact variant and quantity without mutating saved text', () => {
  const p = product(); p.bundleItems = [{ id: 'a', name: 'Джиггер (Серебро)', quantity: 2,
    componentProduct: { id: '10', slug: 'jigger', variantId: '84' } }];
  const before = JSON.stringify(p), lines = productBundleCards(p);
  assert.equal(lines.length, 1); assert.equal(lines[0].quantity, 2);
  assert.equal(bundleComponentHref(lines[0].componentProduct), '/catalog/product/jigger?variant=84');
  assert.equal(productDisplaySpecifications(p).length, 1); assert.equal(JSON.stringify(p), before);
});
test('editorial hide switch suppresses cards even if stale API items remain', () => {
  const p = product(); p.hideBundleContents = true;
  p.bundleItems = [{ id: '1', name: 'Гейзер', quantity: 1, componentProduct: {slug:'geyser'} }];
  assert.equal(productBundleCards(p).length, 0);
  assert.equal(productDisplaySpecifications(p)[0].label, 'Тип товара');
});
test('legacy composition does not create a redundant section or empty anchor', () => {
  const p = product(); p.composition = ['Ручное описание состава'];
  const before = JSON.stringify(p);
  assert.equal(productBundleCards(p).length, 0);
  assert.equal(JSON.stringify(p), before);
});
test('unavailable shop component does not create an unpurchasable card', () => {
  const p = product(); p.bundleItems = [{ id: '1', name: 'Запасная деталь', quantity: 3, componentProduct: null }];
  assert.equal(productBundleCards(p).length, 0);
  assert.equal(p.bundleItems[0].quantity, 3);
});
test('ordinary product remains unchanged; plain component URL has no variant', () => {
  const p = product(); p.specifications = p.specifications.slice(0, 1);
  assert.equal(productBundleCards(p).length, 0);
  assert.equal(productDisplaySpecifications(p)[0], p.specifications[0]);
  assert.equal(bundleComponentHref({ slug: 'spoon', variantId: null }), '/catalog/product/spoon');
});
