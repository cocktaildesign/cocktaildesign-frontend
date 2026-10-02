const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/knowledge/home-preview.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { module: mod, exports: mod.exports });
const { homeKnowledgePreviews } = mod.exports;

test('homepage data reduction preserves all four tabs, including rare formats after many recent videos', () => {
  const items = ['video','video','article','video','video','video','video','article','article','video','material','article','article','material','material','material','material']
    .map((format, id) => Object.freeze({ id, format, title: `Title ${id}`, slug: `item-${id}`, coverSrc: `/${id}.webp` }));
  const before = JSON.stringify(items);
  const selected = homeKnowledgePreviews(items);
  for (const format of ['all','video','article','material']) {
    const visible = list => list.filter(item => format === 'all' || item.format === format).slice(0, 4);
    assert.deepEqual(visible(selected), visible(items), format);
  }
  assert.equal(selected.length, 12);
  assert.ok(selected.every(item => items.includes(item)), 'metadata and object identity are preserved');
  assert.equal(JSON.stringify(items), before);
});

test('short or empty CMS selections are preserved without filling them with unrelated content', () => {
  for (const items of [[], [{ id: 1, format: 'material' }], [{ id: 1, format: 'article' }, { id: 2, format: 'video' }]]) {
    assert.deepEqual(homeKnowledgePreviews(items), items);
  }
});
