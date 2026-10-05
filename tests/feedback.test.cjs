const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const requestId = '3a2ac9f5-c259-420c-bf85-88d6ed9780a1';
const payload = { requestId, message: 'Проверка', email: '', page: '/support/feedback', consent: {accepted:true, version:'2026-10-05'} };
function load(fetch) {
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/feedback.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, fetch, URL, AbortSignal,
    require(name) { assert.equal(name, './api/strapi/client'); return { getStrapiUrl: () => 'https://isolated-api.example.test/' }; },
  });
  return module.exports.sendFeedback;
}
test('form helper posts only to configured API and accepts matching saved acknowledgement', async () => {
  const send = load(async (url, options) => {
    assert.equal(String(url), 'https://isolated-api.example.test/api/feedback');
    assert.equal(options.method, 'POST'); assert.equal(options.credentials, 'omit');
    assert.deepEqual(JSON.parse(options.body), payload); assert(options.signal);
    return new Response(JSON.stringify({ ok: true, requestId }), { status: 201 });
  });
  await send(payload);
});
test('network timeout, server failure and mismatched acknowledgement never report success', async () => {
  for (const response of [new Response(JSON.stringify({ ok: true, requestId: 'wrong' })),
    new Response(JSON.stringify({ ok: false }), { status: 503 }), new Response('<html>proxy error</html>', { status: 502 })]) {
    await assert.rejects(load(async () => response)(payload));
  }
  await assert.rejects(load(async () => { throw new Error('private network error'); })(payload), /текст сохранён/);
});
test('rate limit has a useful retry explanation', async () => {
  await assert.rejects(load(async () => new Response('{}', { status: 429 }))(payload), /10 минут/);
});
