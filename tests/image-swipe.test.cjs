const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src', file), 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require: id => {
    assert.ok(id in imports, `Unexpected dependency ${id}`); return imports[id];
  } });
  return mod.exports;
}

const swipe = load('lib/catalog/image-swipe.ts');

test('short taps keep navigation; horizontal intent blocks accidental clicks before image commit distance', () => {
  const gesture = swipe.createImageSwipe();
  gesture.begin(1, 100, 100);
  assert.equal(gesture.end(1, 89, 100), 0);
  assert.equal(gesture.shouldBlockClick(1), false);
  gesture.begin(2, 100, 100);
  assert.equal(gesture.end(2, 88, 100), 0);
  assert.equal(gesture.shouldBlockClick(1), true);
  assert.equal(gesture.shouldBlockClick(1), false, 'Only the drag-associated click is consumed');
  gesture.begin(3, 100, 100);
  assert.equal(gesture.end(3, 69, 100), 0);
  gesture.begin(4, 100, 100);
  assert.equal(gesture.end(4, 68, 100), 1);
});

test('one completed gesture advances one image; unrelated pointer IDs and repeated up events do nothing', () => {
  const gesture = swipe.createImageSwipe();
  gesture.begin(8, 200, 100);
  gesture.move(99, 0, 100);
  assert.equal(gesture.end(99, 0, 100), 0);
  gesture.move(8, 180, 100); gesture.move(8, 120, 100); gesture.move(8, 0, 100);
  assert.equal(gesture.end(8, 0, 100), 1);
  assert.equal(gesture.end(8, 0, 100), 0);
  gesture.begin(9, 100, 100);
  assert.equal(gesture.end(9, 150, 100), -1);
});

test('vertical or ambiguous diagonal intent never turns into an image swipe later in the same drag', () => {
  const gesture = swipe.createImageSwipe();
  gesture.begin(1, 0, 0); gesture.move(1, 4, 20);
  assert.equal(gesture.end(1, -100, 30), 0);
  gesture.begin(2, 0, 0); gesture.move(2, 18, 12);
  assert.equal(gesture.end(2, 100, 20), 0, 'Exactly 1.5x is not confident horizontal intent');
  gesture.begin(3, 0, 0); gesture.move(3, 20, 1);
  assert.equal(gesture.end(3, 40, 60), 0, 'Final movement must remain horizontal');
});

test('cancellation and a second pointer cannot complete the first gesture; the next tap and keyboard still work', () => {
  const gesture = swipe.createImageSwipe();
  gesture.begin(1, 100, 100); gesture.move(1, 60, 100); gesture.cancel();
  assert.equal(gesture.end(1, 0, 100), 0);
  assert.equal(gesture.shouldBlockClick(0), false, 'Keyboard activation is never captured');
  assert.equal(gesture.shouldBlockClick(1), true);
  gesture.begin(2, 100, 100); gesture.move(2, 20, 100); gesture.end(2, 20, 100);
  // Some browsers emit no click after dragging, leaving the guard unconsumed.
  gesture.resetClickGuard();
  assert.equal(gesture.shouldBlockClick(1), false);
  gesture.begin(3, 100, 100); gesture.end(3, 100, 100);
  assert.equal(gesture.shouldBlockClick(1), false);
});

test('preview navigation wraps both ways and safely handles an empty or single-image gallery', () => {
  assert.equal(swipe.nextPreviewImage(3, 4, 1), 0);
  assert.equal(swipe.nextPreviewImage(0, 4, -1), 3);
  assert.equal(swipe.nextPreviewImage(1, 4, -1), 0);
  for (const count of [0, 1]) for (const direction of [-1, 1]) {
    assert.equal(swipe.nextPreviewImage(0, count, direction), 0);
  }
});

test('a selected variant photo outside the preview limit stays first and reachable without mutating source photos', () => {
  const images = Object.freeze(['/a', '/b', '/c', '/d']);
  assert.equal(swipe.variantPreviewImages(images, '/b', 4), images);
  assert.equal(swipe.variantPreviewImages(images, null, 4), images);
  const next = swipe.variantPreviewImages(images, '/selected', 4);
  assert.deepEqual(Array.from(next), ['/selected', '/a', '/b', '/c']);
  assert.equal(next[swipe.nextPreviewImage(3, next.length, 1)], '/selected');
  assert.deepEqual(Array.from(images), ['/a', '/b', '/c', '/d']);
});

function product(variants = [], extra = {}) {
  return { id: 'parent', moyskladId: 'parent-ms', slug: 'item', name: 'Product', code: 'BASE',
    price: 1000, priceOld: 1200, images: ['/a.webp', '/b.webp', '/c.webp', '/d.webp'], imageUrl: '/a.webp',
    imageSrcSets: {}, variants, engravingEnabled: false, discountExcluded: true, badges: [],
    isNew: false, noveltyBadgeColor: '#000000', isSampleSale: false, ...extra };
}
function variant(id, image, price = 700) {
  return { id, moyskladId: `ms-${id}`, name: `Product ${id}`, code: `SKU-${id}`, price, priceOld: price + 100,
    characteristics: [{ name: 'Выбор ручки', value: id }], images: [{ src: image }] };
}

function cardHarness(input) {
  const slots = [];
  let cursor = 0, tree;
  const added = [];
  const captures = [];
  const noop = () => null;
  const hooks = {
    useState: initial => {
      const slot = cursor++;
      if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial;
      return [slots[slot], value => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; }];
    },
    useRef: initial => { const slot = cursor++; return slots[slot] ??= { current: initial }; },
    useMemo: fn => fn(),
    useLayoutEffect: () => {}, // DOM width measurement is verified in browser, not this event harness.
  };
  const Card = load('app/catalog/product-card/ProductCard.tsx', {
    react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': noop, 'next/link': noop,
    '@/components/icons/ArrowRightIcon': noop, '@/components/ui/quantity/QuantityControl': noop,
    '@/components/ui/engraving/EngravingToggle': noop, '@/components/ui/favorites/FavoriteButton': noop,
    '@/shared/ui/product-badges/ProductBadges': noop,
    '@/lib/catalog/color-order': load('lib/catalog/color-order.ts'), '@/lib/catalog/image-swipe': swipe,
    '@/lib/cart/cartStore': { cartLineKey: item => JSON.stringify([item.id, item.slug, item.code]),
      useCartStore: selector => selector({ items: [], addItem: item => added.push(item), removeItem: noop }) },
    './ProductCard.module.css': { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) },
  }).default;
  function all(node) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(all);
    return [node, ...all(node.props?.children)];
  }
  function find(predicate) { const result = all(tree).find(predicate); assert.ok(result, 'Expected element'); return result; }
  function render() { cursor = 0; tree = Card({ product: input, colorMap: {} }); return tree; }
  render();
  const event = (extra = {}) => ({
    pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: 100, clientY: 100,
    target: { closest: () => null }, currentTarget: { setPointerCapture: id => captures.push(id),
      getBoundingClientRect: () => ({ left: 0, width: 200 }) }, ...extra,
  });
  return {
    render, find, captures, added, event,
    get thumb() { return find(node => typeof node.props?.onPointerMove === 'function'); },
    get link() { return find(node => typeof node.props?.onClickCapture === 'function'); },
    get src() { return find(node => typeof node.props?.src === 'string').props.src; },
    down(extra) { const e = event(extra); this.link.props.onPointerDownCapture(e); this.thumb.props.onPointerDown(e); render(); },
    move(extra) { this.thumb.props.onPointerMove(event(extra)); render(); },
    up(extra) { this.thumb.props.onPointerUp(event(extra)); render(); },
    click(detail = 1) { let prevented = false, stopped = false;
      this.link.props.onClickCapture({ detail, preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
      return { prevented, stopped }; },
    swipeLeft() { this.down(); this.move({ clientX: 50 }); this.up({ clientX: 30 }); },
  };
}

test('real ProductCard handlers swipe once, suppress drag navigation, preserve next tap and keyboard activation', () => {
  const h = cardHarness(product());
  assert.equal(h.src, '/a.webp');
  h.swipeLeft(); assert.equal(h.src, '/b.webp');
  assert.deepEqual(h.click(), { prevented: true, stopped: true });
  h.down(); h.up(); assert.deepEqual(h.click(), { prevented: false, stopped: false });
  h.swipeLeft(); assert.equal(h.src, '/c.webp');
  assert.deepEqual(h.click(0), { prevented: false, stopped: false });
  h.down(); h.up(); assert.deepEqual(h.click(), { prevented: false, stopped: false });
  assert.equal(h.link.props.href, '/catalog/product/item');
});

test('ProductCard ignores favorite gestures, one-image drags, non-primary contact and canceled gestures', () => {
  const h = cardHarness(product());
  h.down({ target: { closest: () => ({ tagName: 'BUTTON' }) } });
  h.move({ clientX: 10 }); h.up({ clientX: 10 });
  assert.equal(h.src, '/a.webp'); assert.equal(h.captures.length, 0);
  assert.deepEqual(h.click(), { prevented: false, stopped: false });
  h.down(); h.move({ clientX: 50 }); h.down({ pointerId: 2, isPrimary: false }); h.up({ clientX: 10 });
  assert.equal(h.src, '/a.webp');
  h.down(); h.move({ clientX: 50 }); h.thumb.props.onPointerCancel(); h.up({ clientX: 10 });
  assert.equal(h.src, '/a.webp');
  h.down(); h.move({ clientX: 50 }); h.thumb.props.onLostPointerCapture(); h.up({ clientX: 10 });
  assert.equal(h.src, '/a.webp');
  const single = cardHarness(product([], { images: ['/single.webp'], imageUrl: '/single.webp' }));
  single.swipeLeft(); assert.equal(single.src, '/single.webp'); assert.equal(single.captures.length, 0);
  assert.deepEqual(single.click(), { prevented: false, stopped: false });
});

test('real mouse hover still previews and resets; touch/pen movement and leave do not act as hover', () => {
  const h = cardHarness(product());
  h.move({ pointerType: 'mouse', clientX: 180 }); assert.equal(h.src, '/d.webp');
  h.thumb.props.onPointerLeave(h.event({ pointerType: 'mouse' })); h.render(); assert.equal(h.src, '/a.webp');
  h.move({ pointerType: 'pen', clientX: 180 }); assert.equal(h.src, '/a.webp');
  h.swipeLeft(); assert.equal(h.src, '/b.webp');
  h.thumb.props.onPointerLeave(h.event()); h.render(); assert.equal(h.src, '/b.webp');
  h.down({ pointerType: 'pen' }); h.move({ pointerType: 'pen', clientX: 40 }); h.up({ pointerType: 'pen', clientX: 40 });
  assert.equal(h.src, '/c.webp');
});

test('keyboard arrows work only on the photo link itself; child controls and modifier shortcuts are preserved', () => {
  const h = cardHarness(product());
  const link = {};
  let prevented = 0;
  const e = { target: link, currentTarget: link, key: 'ArrowRight', preventDefault: () => prevented++ };
  h.link.props.onKeyDown(e); h.render(); assert.equal(h.src, '/b.webp'); assert.equal(prevented, 1);
  h.link.props.onKeyDown({ ...e, target: {} }); h.render(); assert.equal(h.src, '/b.webp');
  h.link.props.onKeyDown({ ...e, altKey: true }); h.render(); assert.equal(h.src, '/b.webp');
  h.link.props.onKeyDown({ ...e, key: 'Enter' }); assert.equal(prevented, 1);
  h.link.props.onKeyDown({ ...e, key: 'ArrowLeft' }); h.render(); assert.equal(h.src, '/a.webp');
});

test('swiping a variant keeps its SKU, price, cart identity and href; changing variant restores its own photo', () => {
  const selected = variant('Classic', '/classic.webp', 700), next = variant('Fancy', '/fancy.webp', 900);
  const input = product([selected, next]); const before = JSON.stringify(input);
  const h = cardHarness(input);
  assert.equal(h.src, '/classic.webp', 'Selected photo outside the original first four stays visible');
  h.swipeLeft(); assert.equal(h.src, '/a.webp');
  assert.equal(h.link.props.href, '/catalog/product/item?variant=Classic');
  h.find(node => node.type === 'button' && node.props?.children === 'В корзину').props.onClick();
  assert.equal(h.added[0].id, 'Classic'); assert.equal(h.added[0].variantId, 'Classic');
  assert.equal(h.added[0].code, 'SKU-Classic'); assert.equal(h.added[0].price, 700);
  assert.equal(h.added[0].productId, 'parent'); assert.equal(h.added[0].discountExcluded, true);
  const option = h.find(node => node.type === 'button' && node.props?.children === 'Fancy' && typeof node.props.onClick === 'function');
  option.props.onClick(); h.render(); assert.equal(h.src, '/fancy.webp');
  assert.equal(h.link.props.href, '/catalog/product/item?variant=Fancy');
  for (let index = 0; index < 4; index++) h.swipeLeft();
  assert.equal(h.src, '/fancy.webp', 'Selected variant photo is reachable again after a complete loop');
  assert.equal(JSON.stringify(input), before);
});
