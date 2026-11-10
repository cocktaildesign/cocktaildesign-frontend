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
  assert.equal(articleVideo(clip).embedUrl,undefined);
  const p = articleVideo(clip,'https://vk.ru/video_ext.php?oid=-72675133&id=456240684&hash=fixture&autoplay=1');
  assert.equal(p.externalUrl,clip);
  assert.equal(new URL(p.embedUrl).searchParams.get('hash'),'fixture');
  assert.equal(new URL(p.embedUrl).searchParams.get('autoplay'),'0');
});
test('untrusted URLs, wrong IDs and duplicate player identity parameters cannot create an iframe',()=>{
  for(const bad of ['javascript:alert(1)','//vk.ru/clip-1_2','https://vk.ru.evil.test/clip-1_2','https://evil.test/clip-1_2','https://x:y@vk.ru/clip-1_2']) assert.equal(articleVideo(bad),undefined);
  for(const bad of ['https://evil.test/video_ext.php?oid=-72675133&id=456240684','https://vk.ru/video_ext.php?oid=-72675133&id=3','https://vk.ru/video_ext.php?oid=-72675133&id=456240684&id=3',clip]) assert.equal(articleVideo(clip,bad).embedUrl,undefined);
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
