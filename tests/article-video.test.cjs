const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const mod = {exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/knowledge/article-video.ts'),'utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText, {module:mod,exports:mod.exports,URL});
const {articleVideo,articleVideoBody} = mod.exports;
const clip = 'https://vk.ru/clip-72675133_456240684';

test('clip links stay external until a matching explicit player URL exists',()=>{
  const other = 'https://vk.ru/clip-72675133_999';
  assert.equal(articleVideo(other).embedUrl,undefined);
  assert.equal(articleVideo(other).local,undefined);
  const p = articleVideo(other,'https://vk.ru/video_ext.php?oid=-72675133&id=999&hash=fixture&autoplay=1');
  assert.equal(p.externalUrl,other);
  assert.equal(new URL(p.embedUrl).searchParams.get('hash'),'fixture');
  assert.equal(new URL(p.embedUrl).searchParams.get('autoplay'),'0');
});

test('only the three matching owner-provided clips use local media with a retained VK fallback',()=>{
  const clips = [['456240684','honey'],['456240664','isomalt'],['456240651','perfume']];
  for (const [id,name] of clips) {
    const url = `https://vk.ru/clip-72675133_${id}`;
    const video = articleVideo(url);
    assert.equal(video.externalUrl,url);
    assert.equal(video.embedUrl,undefined);
    assert.ok(video.local.src.startsWith(`/videos/knowledge/${name}-`));
    assert.ok(fs.existsSync(path.join(__dirname,'../public',video.local.src)));
    assert.ok(fs.existsSync(path.join(__dirname,'../public',video.local.poster)));
    assert.ok(fs.statSync(path.join(__dirname,'../public',video.local.src)).size < 5_000_000);
    assert.equal(articleVideo(`https://vk.com/clip-72675133_${id}?tracking=1`).local.src,video.local.src);
    assert.equal(articleVideo(`https://vk.ru/clip-111_${id}`).local,undefined);
  }
});
test('untrusted URLs, wrong IDs and duplicate player identity parameters cannot create an iframe',()=>{
  const unmapped = 'https://vk.ru/clip-72675133_999';
  for(const bad of ['javascript:alert(1)','//vk.ru/clip-1_2','https://vk.ru.evil.test/clip-1_2','https://evil.test/clip-1_2','https://x:y@vk.ru/clip-1_2']) assert.equal(articleVideo(bad),undefined);
  for(const bad of ['https://evil.test/video_ext.php?oid=-72675133&id=999','https://vk.ru/video_ext.php?oid=-72675133&id=3','https://vk.ru/video_ext.php?oid=-72675133&id=999&id=3',unmapped]) assert.equal(articleVideo(unmapped,bad).embedUrl,undefined);
  assert.equal(articleVideo(null),undefined);
});
test('only the opening exact cover and matching video link move; source records, ingredients and later photos survive',()=>{
  const blocks = [
    {type:'text',id:'a',content:'Описание'},
    {type:'image',id:'b',src:'/honey.webp',caption:'Готовая подача'},
    {type:'link',id:'c',url:clip,title:'Ролик'},
    {type:'link',id:'d',url:'https://vk.ru/clip-1_2',title:'Другой ролик'},
    {type:'heading',id:'e',level:2,content:'Что понадобится'},
    {type:'list',id:'f',ordered:false,items:['Мука: 100 г.','Мёд: 50 г.']},
    {type:'image',id:'g',src:'/honey.webp',caption:'Ещё один ракурс'},
  ];
  const before=JSON.stringify(blocks);
  const out=articleVideoBody(blocks,'/honey.webp',articleVideo(clip));
  assert.equal(out.poster.caption,'Готовая подача');
  assert.equal(out.blocks.map(x=>x.id).join(','),'a,d,e,f,g');
  assert.equal(JSON.stringify(blocks),before);
  assert.equal(articleVideoBody(blocks,'/honey.webp').blocks,blocks);
});
