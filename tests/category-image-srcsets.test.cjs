const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}, globals = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, URL, AbortSignal, ...globals,
    require: id => { assert.ok(id in imports, id); return imports[id]; } });
  return mod.exports;
}
const responsive = load('lib/api/strapi/responsive-image.ts');
const resolve = value => value ? 'https://media.example.test' + value : undefined;
function getter(fetch) {
  return load('lib/api/catalog/category-image-srcsets.ts', {
    '@/lib/api/strapi/client': { getStrapiUrl: () => 'https://media.example.test' },
    '@/lib/api/strapi/media': { getStrapiMediaUrl: resolve },
    '@/lib/api/strapi/responsive-image': responsive,
  }, { fetch }).getCategoryImageSrcSets;
}
const photo = { url: '/photo.webp', width: 1000, formats: { small: { url: '/small.webp', width: 500 } } };
const category = { id: '10', slug: 'glasses', name: 'Бокалы', imageSrc: resolve('/photo.webp'), productsCount: 12 };

test('only requested visible tiles get actual sizes for their currently selected CMS photo', async () => {
  const before = JSON.stringify(category);
  const result = await getter(async (url, options) => {
    assert.equal(url.pathname, '/api/moysklad-categories');
    assert.equal(url.searchParams.get('filters[slug][$in][0]'), 'glasses');
    assert.equal(url.searchParams.get('pagination[pageSize]'), '1');
    assert.equal(options.next.revalidate, 60);
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ data: [
      { slug: 'hidden', image: photo }, { slug: 'glasses', image: photo },
    ] }) };
  })([category]);
  assert.equal(result.glasses, resolve('/small.webp') + ' 500w, ' + resolve('/photo.webp') + ' 1000w');
  assert.equal(result.hidden, undefined);
  assert.equal(JSON.stringify(category), before);
});

test('replaced images, absent formats and malformed data retain original tile fallback', async () => {
  for (const data of [null, {}, [], [{ slug: 'glasses', image: { ...photo, url: '/new-photo.webp' } }],
    [{ slug: 'glasses', image: { url: '/photo.webp', width: 1000 } }], [null]]) {
    const result = await getter(async () => ({ ok: true, json: async () => ({ data }) }))([category]);
    assert.deepEqual(Object.keys(result), []);
  }
});

test('empty tiles skip metadata; timeout, denied API and invalid JSON preserve homepage rendering', async () => {
  const skip = getter(() => assert.fail('Empty tiles must not request metadata'));
  assert.deepEqual(Object.keys(await skip([])), []);
  assert.deepEqual(Object.keys(await skip([{ ...category, imageSrc: null }])), []);
  for (const fetch of [async () => { throw new Error('timeout'); }, async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } })]) {
    assert.deepEqual(Object.keys(await getter(fetch)([category])), []);
  }
});
