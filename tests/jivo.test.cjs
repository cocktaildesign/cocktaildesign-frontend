const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const moduleScope = { exports: {} };
vm.runInNewContext(ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/lib/chat/jivo.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, { module: moduleScope, exports: moduleScope.exports, Set });
const { shouldLoadJivo } = moduleScope.exports;

test('the existing live channel is restricted to the storefront hosts', () => {
  assert.equal(shouldLoadJivo('cocktaildesign.ru'), true);
  assert.equal(shouldLoadJivo('www.cocktaildesign.ru'), true);
  for (const hostname of ['cocktail-design.ru', 'new.cocktaildesign.ru', 'api.cocktaildesign.ru', 'cocktaildesign.ru.example.com', '']) {
    assert.equal(shouldLoadJivo(hostname), false, hostname);
    assert.equal(shouldLoadJivo(hostname, true), false, hostname);
  }
});

test('local previews cannot connect to live operators without an explicit opt-in', () => {
  for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
    assert.equal(shouldLoadJivo(hostname), false, hostname);
    assert.equal(shouldLoadJivo(hostname, true), true, hostname);
  }
  assert.equal(shouldLoadJivo('192.168.1.10', true), false);
});
