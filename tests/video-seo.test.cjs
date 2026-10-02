const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const mod = { exports: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/seo', file), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, URL,
    require: id => {
      if (id in mocks) return mocks[id];
      throw new Error(`Unexpected dependency ${id}`);
    } });
  return mod.exports;
}
const verified = require('../src/lib/seo/verified-videos.json');
const policy = load('policy.ts');
const knowledge = load('knowledge.ts', { './policy': policy });
const { videoJsonLd } = load('video.ts', { './policy': policy, './knowledge': knowledge, './verified-videos.json': { default: verified } });
const item = {
  slug: 'video', title: 'Видео', description: 'Первая строка.\nВторая строка.',
  embedUrl: Object.keys(verified)[0], coverSrc: 'https://api.cocktaildesign.ru/uploads/cover.webp',
  date: '2026-09-30', duration: '00:00',
};

test('video metadata follows visible CMS content, verified source date and canonical domain', () => {
  const data = videoJsonLd(item, 'https://cocktaildesign.ru');
  assert.equal(data['@type'], 'VideoObject');
  assert.equal(data.name, item.title);
  assert.equal(data.description, 'Первая строка. Вторая строка.');
  assert.equal(data.thumbnailUrl[0], item.coverSrc);
  assert.equal(data.embedUrl, item.embedUrl);
  assert.equal(data.uploadDate, verified[item.embedUrl].uploadDate);
  assert.notEqual(data.uploadDate.slice(0, 10), item.date);
  assert.equal(data.duration, verified[item.embedUrl].duration);
  assert.equal(data.mainEntityOfPage, 'https://cocktaildesign.ru/knowledge/videos/video');
  assert.equal(data['@id'], `${data.mainEntityOfPage}#video`);
  for (const key of ['contentUrl', 'author', 'interactionStatistic', 'source', 'verifiedOn']) assert.equal(data[key], undefined);
  const edited = videoJsonLd({...item, title:'Новое название', description:'Изменённое описание'}, 'https://new.cocktaildesign.ru');
  assert.equal(edited.name,'Новое название');
  assert.equal(edited.description,'Изменённое описание');
  assert.ok(edited.url.startsWith('https://new.cocktaildesign.ru/'));
});

test('unverified or replaced players and absent or unsafe thumbnails omit markup', () => {
  for (const embedUrl of ['https://vk.com/video_ext.php?oid=-1&id=2', `${item.embedUrl}-replaced`, '', 'javascript:alert(1)', '__proto__']) {
    assert.equal(videoJsonLd({...item,embedUrl}, 'https://cocktaildesign.ru'), undefined);
  }
  for (const coverSrc of ['', '/test-cover.png', 'javascript:alert(1)', 'data:image/png;base64,a']) {
    assert.equal(videoJsonLd({...item,coverSrc}, 'https://cocktaildesign.ru'), undefined);
  }
  assert.equal(videoJsonLd({...item,title:' '}, 'https://cocktaildesign.ru'), undefined);
});

test('verified source records have real player IDs, dates with zones and positive durations', () => {
  for (const [embedUrl, proof] of Object.entries(verified)) {
    assert.match(embedUrl, /^https:\/\/rutube\.ru\/play\/embed\/[a-f0-9]{32}$/);
    assert.equal(proof.source, embedUrl.replace('/play/embed/', '/video/') + '/');
    assert.match(proof.uploadDate, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    assert.ok(Number.isFinite(Date.parse(proof.uploadDate)));
    assert.ok(Date.parse(proof.uploadDate) < Date.parse(proof.verifiedOn));
    assert.match(proof.duration, /^PT(?:[1-9]\d*H)?(?:[1-9]\d*M)?(?:[1-9]\d*S)?$/);
    assert.notEqual(proof.duration, 'PT');
  }
});

test('CMS text cannot break out of the JSON-LD script', () => {
  const title = '</script><script>alert(1)</script>';
  const data = videoJsonLd({...item,title}, 'https://cocktaildesign.ru');
  const serialized = policy.serializeJsonLd(data);
  assert.equal(serialized.includes('<'),false);
  assert.equal(JSON.parse(serialized).name,title);
});
