const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const mod = {exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/knowledge/reading.ts'),'utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText, {module:mod,exports:mod.exports,URL});
const {readingBlocks,readingContents,safeReadingHref}=mod.exports;
const text=(content,id='x')=>({type:'text',id,content});

test('imported Markdown, paragraphs and numbered instructions preserve order and doses',()=>{
  const out=readingBlocks([text('### **Пивной гарниш**\n\n*Ингредиенты:*\n- Пиво — 400 г\n- Агар — 4 г'),text('1. Смешать'),text('2. Кипятить 30 секунд'),text('4. Охладить'),text('Обычный абзац\r\nЕще строка')],'beer');
  assert.equal(out[0].content,'Пивной гарниш');
  assert.equal(out[1].type,'label');
  assert.equal(out[2].items.join('|'),'Пиво — 400 г|Агар — 4 г');
  assert.equal(out[3].items.length,2);assert.equal(out[3].start,1);
  assert.equal(out[4].start,4);
  assert.equal(out[5].content,'Обычный абзац');assert.equal(out[6].content,'Еще строка');
});
test('only identical photos within one consecutive run are deduplicated; captions, alternatives and later occurrences survive',()=>{
  const im={type:'image',id:'1',src:'/one.jpg',alt:'Glass',width:500,height:700};
  const out=readingBlocks([im,{...im,id:'2'},{...im,id:'3',caption:'Side view'},text('Next step'),im],'photos');
  assert.equal(out[0].images.length,2);assert.equal(out[0].images[1].caption,'Side view');
  assert.equal(out[2].images.length,1);assert.equal(out[2].images[0].height,700);
});
test('WOM description becomes navigable instructions and recipes without mixing recipes',()=>{
  const input='Сборка устройства\nУстановите колбу\nВставьте колбу.\nРецепты лецитиновой пены\nПена Юдзу\nИнгредиенты:\nВода — 150 мл\nЛецитин — 2,5 г\nПриготовление\nСмешайте воду.\nТемпература жидкости\nКомнатная.';
  const out=readingBlocks([text(input)],'letsitinovaya-vozdushnaya-pena-retsepty-i-tekhnologiya');
  assert.equal(readingContents(out).length,3);
  const list=out.find(x=>x.type==='list');assert.equal(list.items.join('|'),'Вода — 150 мл|Лецитин — 2,5 г');
  assert.equal(out.find(x=>x.content==='Смешайте воду.').type,'text');
  assert.equal(new Set(out.filter(x=>x.type==='heading').map(x=>x.id)).size,5);
  assert.equal(readingBlocks([text(input)],'unrelated').filter(x=>x.type==='heading').length,0);
});
test('source headings remain searchable and short materials do not get an empty contents block',()=>{
  const out=readingBlocks([{type:'heading',id:'x',level:2,content:'### **Техника 1**'},text('Описание')],'article');
  assert.equal(out[0].content,'Техника 1');assert.equal(readingContents(out).length,0);
});
test('links cannot turn imported content into executable or protocol-relative URLs',()=>{
  for(const bad of ['javascript:alert(1)','data:text/html,test','//evil.example','/\\evil.example','/\nevil','https://user:secret@example.com']) assert.equal(safeReadingHref(bad),undefined,bad);
  assert.equal(safeReadingHref('/catalog/ms-test'),'/catalog/ms-test');
  assert.equal(safeReadingHref('https://example.com/recipes?q=1'),'https://example.com/recipes?q=1');
  assert.equal(safeReadingHref('mailto:hello@example.com'),'mailto:hello@example.com');
  const out=readingBlocks([text('<script>alert(1)</script>')],'example');
  assert.equal(out[0].content,'<script>alert(1)</script>'); // Passed only as a React text node.
});
