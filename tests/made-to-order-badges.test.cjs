const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const CATEGORY = 'ms-f2905fa8';
const uuid = number => `00000000-0000-0000-0000-${String(number).padStart(12, '0')}`;
const parent = uuid(1), variant = uuid(2), ordinary = uuid(3);
const sourceRoot = path.resolve(__dirname, '../src/shared/ui/product-badges');

function load(file, imports = {}, globals = {}) {
  const mod = { exports: {} };
  const source = fs.readFileSync(path.join(sourceRoot, file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: file,
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, URL, URLSearchParams, AbortSignal,
    ...globals, require: name => {
      if (name in imports) return imports[name];
      if (name.startsWith('react')) return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    } });
  return mod.exports;
}

const policy = load('made-to-order.ts');
const availability = load('availability.ts');
const row = id => ({ moyskladId: id, category: { slug: CATEGORY } });
const page = (data, total = data.length, number = 1) => ({ data,
  meta: { pagination: { page: number, pageSize: 100, total, pageCount: Math.ceil(total / 100) } } });
const response = value => ({ ok: true, json: async () => value });
const badge = (id, label) => ({ id, label, backgroundColor: '#000000', textColor: '#ffffff' });
const labels = badges => Array.from(badges, item => item.label);

test('made-to-order membership reads every page and requests only the verified category and IDs', async () => {
  const requests = [];
  const all = Array.from({ length: 103 }, (_, index) => row(uuid(index + 1)));
  const result = await policy.loadMadeToOrderProductIds('https://api.example.test/api', async (url, options) => {
    requests.push({ url, options });
    const number = Number(url.searchParams.get('pagination[page]'));
    return response(page(all.slice((number - 1) * 100, number * 100), all.length, number));
  });
  assert.deepEqual(Array.from(result), all.map(item => item.moyskladId));
  assert.equal(requests.length, 2);
  for (const { url, options } of requests) {
    assert.equal(url.pathname, '/api/moysklad-products');
    assert.equal(url.searchParams.get('filters[category][slug][$eq]'), CATEGORY);
    assert.equal(url.searchParams.get('populate[category][fields][0]'), 'slug');
    assert.equal(url.searchParams.get('fields[0]'), 'moyskladId');
    assert.equal(url.searchParams.get('sort[0]'), 'id:asc');
    assert.equal(options.method, undefined, 'Only default GET is used');
    assert.equal(options.signal, requests[0].options.signal, 'The deadline covers the complete snapshot');
  }
});

test('empty membership is a valid complete snapshot and wrapped product/category data is supported', async () => {
  const empty = await policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => response(page([])));
  assert.equal(empty.size, 0);
  const wrapped = { attributes: { moyskladId: parent, category: { data: { attributes: { slug: CATEGORY } } } } };
  const result = await policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => response(page([wrapped])));
  assert.deepEqual(Array.from(result), [parent]);
});

test('malformed, incomplete, duplicate or foreign-category membership is rejected atomically', async () => {
  const invalid = [
    null, {}, { data: [] }, page([row(parent)], 2),
    page([row(parent), row(parent)]), page([{ moyskladId: parent }]),
    page([{ moyskladId: parent, category: { slug: 'other-category' } }]),
    page([row('not-a-uuid')]), page([row(parent)], -1),
    { ...page([row(parent)]), meta: { pagination: { page: 1, pageSize: 50, total: 1 } } },
    { ...page([row(parent)]), meta: { pagination: { page: 2, pageSize: 100, total: 1 } } },
  ];
  for (const payload of invalid) {
    await assert.rejects(policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => response(payload)), /badge_policy_/);
  }
  const first = Array.from({ length: 100 }, (_, index) => row(uuid(index + 1)));
  for (const second of [page([row(uuid(101))], 101, 2), page([row(parent), row(uuid(102))], 102, 2)]) {
    let request = 0;
    await assert.rejects(policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => response(++request === 1 ? page(first, 102) : second)), /badge_policy_/);
  }
});

test('membership HTTP, transport and invalid JSON errors reject rather than masquerading as an empty category', async () => {
  await assert.rejects(policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => ({ ok: false })), /badge_policy_unavailable/);
  await assert.rejects(policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => { throw new Error('offline'); }), /offline/);
  await assert.rejects(policy.loadMadeToOrderProductIds('https://api.example.test/api', async () => ({ ok: true, json: async () => { throw new Error('invalid-json'); } })), /invalid-json/);
});

test('only made-to-order policy suppresses automatic and both manual availability labels, preserving all other badges', () => {
  const manual = [badge(10, 'Нет в наличии'), badge(11, ' ЖДЁМ   ПОСТАВКУ '), badge(12, 'Рекомендуем'), badge(13, 'Под заказ')];
  for (const state of [true, false, undefined]) {
    assert.deepEqual(labels(availability.visibleAvailabilityBadges(manual, state, true)), ['Рекомендуем', 'Под заказ']);
    const before = availability.reconcileAvailabilityBadges(manual, state);
    const expected = state === true ? [availability.AUTOMATIC_AVAILABILITY_BADGE, ...before] : before;
    assert.deepEqual(labels(availability.visibleAvailabilityBadges(manual, state, false)), labels(expected));
  }
  assert.deepEqual(labels(manual), ['Нет в наличии', ' ЖДЁМ   ПОСТАВКУ ', 'Рекомендуем', 'Под заказ']);
});

test('ordinary badge rendering retains automatic priority and all five manual badges alongside sale and novelty', () => {
  const css = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
  const Component = load('ProductBadges.tsx', {
    './availability': availability, './useAvailability': { useAvailability: () => ({ unavailable: true, suppressAvailabilityBadge: false }) },
    './ProductBadges.module.css': css,
  }).default;
  const html = renderToStaticMarkup(React.createElement(Component, {
    moyskladId: ordinary, isNew: true, noveltyBadgeColor: '#000000', isSampleSale: true,
    badges: Array.from({ length: 5 }, (_, index) => badge(index + 1, `Badge ${index + 1}`)),
  }));
  assert.ok(html.indexOf('ЖДЕМ ПОСТАВКУ') < html.indexOf('УЦЕНКА'));
  assert.ok(html.indexOf('УЦЕНКА') < html.indexOf('НОВИНКА'));
  for (let index = 1; index <= 5; index++) assert.match(html, new RegExp(`Badge ${index}`));
});

function hookHarness() {
  let now = 1_800_000_000_000;
  let externalStore;
  let requests = [];
  const timers = new Map();
  let nextTimer = 1;
  let stock = () => response({ states: { [parent]: false, [variant]: true, [ordinary]: true } });
  let membership = () => response(page([row(parent)]));
  const hookedPolicy = load('made-to-order.ts', {}, { fetch: async url => {
    requests.push(new URL(url).pathname); return membership();
  } });
  const hook = load('useAvailability.ts', {
    react: { useSyncExternalStore: (subscribe, getSnapshot, getServerSnapshot) => {
      externalStore = { subscribe, getSnapshot, getServerSnapshot }; return getSnapshot();
    } },
    './availability': availability, './made-to-order': hookedPolicy,
  }, {
    process: { env: { NEXT_PUBLIC_API_URL: 'https://api.example.test/api/' } },
    Date: class extends Date { static now() { return now; } },
    setInterval: (callback, interval) => { const id = nextTimer++; timers.set(id, { callback, interval }); return id; },
    clearInterval: id => timers.delete(id),
    fetch: async url => {
      const parsed = new URL(url); requests.push(parsed.pathname);
      return parsed.pathname.endsWith('/availability') ? stock() : membership();
    },
  });
  hook.useAvailability();
  const flush = async () => { await new Promise(resolve => setImmediate(resolve)); };
  return {
    read: (id, parentId) => hook.useAvailability(id, parentId),
    subscribe: callback => externalStore.subscribe(callback),
    get serverSnapshot() { return externalStore.getServerSnapshot(); },
    get requests() { return requests; }, get timers() { return timers; },
    stock: next => { stock = next; }, membership: next => { membership = next; }, flush,
    advance: async milliseconds => { now += milliseconds; for (const timer of timers.values()) timer.callback(); await flush(); },
  };
}

test('all card subscribers share requests and cache; selected variants inherit the parent exception without changing stock', async () => {
  const h = hookHarness();
  let notifications = 0;
  const stopA = h.subscribe(() => notifications++), stopB = h.subscribe(() => notifications++);
  await h.flush();
  assert.deepEqual(h.requests, ['/api/catalog/availability', '/api/moysklad-products']);
  assert.equal(h.timers.size, 1);
  assert.equal(h.read(variant, parent).unavailable, true);
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, true);
  assert.equal(h.read(parent).suppressAvailabilityBadge, true);
  assert.equal(h.read(ordinary).suppressAvailabilityBadge, false);
  assert.equal(h.read(ordinary).unavailable, true);
  assert.equal(Object.keys(h.serverSnapshot.states).length, 0);
  assert.equal(h.serverSnapshot.madeToOrder.size, 0);
  await h.advance(59_999);
  assert.equal(h.requests.length, 2);
  await h.advance(1);
  assert.equal(h.requests.length, 3);
  await h.advance(240_000);
  assert.equal(h.requests.filter(url => url.endsWith('/moysklad-products')).length, 2);
  assert.ok(notifications >= 2);
  stopA(); assert.equal(h.timers.size, 1);
  stopB(); assert.equal(h.timers.size, 0);
});

test('initial publication waits for membership, preventing a transient wrong badge while requests resolve', async () => {
  const h = hookHarness();
  let resolvePolicy;
  h.membership(() => new Promise(resolve => { resolvePolicy = resolve; }));
  const stop = h.subscribe(() => {});
  await h.flush();
  assert.equal(h.read(variant, parent).unavailable, undefined);
  resolvePolicy(response(page([row(parent)])));
  await h.flush();
  assert.equal(h.read(variant, parent).unavailable, true);
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, true);
  stop();
});

test('failed category refresh retains known policy while ordinary stock updates, then a complete empty snapshot clears it', async () => {
  const h = hookHarness(); const stop = h.subscribe(() => {}); await h.flush();
  h.membership(() => { throw new Error('category offline'); });
  h.stock(() => response({ states: { [variant]: true, [ordinary]: false } }));
  await h.advance(300_000);
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, true);
  assert.equal(h.read(ordinary).unavailable, false);
  h.membership(() => response(page([])));
  await h.advance(60_000);
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, false);
  stop();
});

test('first category failure does not disable ordinary stock badges and retries without waiting five minutes', async () => {
  const h = hookHarness(); h.membership(() => ({ ok: false }));
  const stop = h.subscribe(() => {}); await h.flush();
  assert.equal(h.read(ordinary).unavailable, true);
  h.membership(() => response(page([row(parent)])));
  await h.advance(60_000);
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, true);
  stop();
});

test('malformed availability JSON must not discard a successful category refresh or cache its missing publication', async () => {
  const h = hookHarness();
  h.stock(() => ({ ok: true, json: async () => { throw new Error('truncated stock response'); } }));
  const stop = h.subscribe(() => {}); await h.flush();
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, true);
  assert.equal(h.read(ordinary).unavailable, undefined);
  h.stock(() => response({ states: { [variant]: true, [ordinary]: true } }));
  await h.advance(60_000);
  assert.equal(h.read(variant, parent).suppressAvailabilityBadge, true);
  assert.equal(h.read(ordinary).unavailable, true);
  stop();
});
