const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/catalog/bundle-display.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { module: mod, exports: mod.exports, encodeURIComponent });
const { productComposition, productDisplaySpecifications, bundleComponentHref } = mod.exports;
const product = () => ({ hideBundleContents: false, bundleItems: [], composition: [], specifications: [
  { id: '1', label: 'Тип товара', value: 'Набор' },
  { id: '2', label: 'Комплектация', value: 'Старый предмет; Второй предмет' },
  { id: '3', label: 'Комплектация', value: 'Третий предмет' },
] });
test('CRM composition replaces legacy presentation without mutating saved text', () => {
  const p = product(); p.bundleItems = [{ id: 'a', name: 'Джиггер (Серебро)', quantity: 2,
    componentProduct: { id: '10', slug: 'jigger', variantId: '84' } }];
  const before = JSON.stringify(p), lines = productComposition(p);
  assert.equal(lines.length, 1); assert.equal(lines[0].quantity, 2);
  assert.equal(lines[0].href, '/catalog/product/jigger?variant=84');
  assert.equal(productDisplaySpecifications(p).length, 1); assert.equal(JSON.stringify(p), before);
});
test('editorial hide switch hides automatic and legacy composition together', () => {
  const p = product(); p.hideBundleContents = true;
  p.bundleItems = [{ id: '1', name: 'Гейзер', quantity: 1 }];
  assert.equal(productComposition(p).length, 0);
  assert.equal(productDisplaySpecifications(p)[0].label, 'Тип товара');
});
test('legacy rows become one vertical list with no lost entries', () => {
  const p = product(), lines = productComposition(p);
  assert.equal(lines.length, 3); assert.equal(lines[2].name, 'Третий предмет');
  assert(lines.every(x => x.quantity === null && x.href === null));
});
test('unavailable shop component remains a named line with its actual quantity', () => {
  const p = product(); p.bundleItems = [{ id: '1', name: 'Запасная деталь', quantity: 3, componentProduct: null }];
  assert.equal(productComposition(p)[0].href, null); assert.equal(productComposition(p)[0].quantity, 3);
});
test('ordinary product remains unchanged; plain component URL has no variant', () => {
  const p = product(); p.specifications = p.specifications.slice(0, 1);
  assert.equal(productComposition(p).length, 0);
  assert.equal(productDisplaySpecifications(p)[0], p.specifications[0]);
  assert.equal(bundleComponentHref({ slug: 'spoon', variantId: null }), '/catalog/product/spoon');
});
