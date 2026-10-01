const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(name, imports) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/api/knowledge', name), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require: id => {
    assert.ok(id in imports, `Unexpected import ${id}`); return imports[id];
  }});
  return mod.exports;
}
const mappers = load('mappers.ts', {
  '@/lib/api/strapi': { getStrapiMediaUrl: url => url },
  '@/lib/api/strapi/responsive-image': load('../strapi/responsive-image.ts', {}),
});

test('content images retain real aspect ratios and only existing resized sources, with a legacy fallback', () => {
  const block={__component:'blocks.image-block',id:7,alt:'Strainer',image:{url:'/original.jpg',width:1200,height:1600,formats:{small:{url:'/small.jpg',width:500}}}};
  const [image]=mappers.mapKnowledgeBlocks([block]);
  assert.equal(image.src,'/original.jpg');assert.equal(image.width,1200);assert.equal(image.height,1600);
  assert.equal(image.srcSet,'/small.jpg 500w, /original.jpg 1200w');
  for(const data of [{url:'/legacy.jpg'},{url:'/legacy.jpg',width:400},{url:'/legacy.jpg',width:Infinity,height:1}]) {
    const [legacy]=mappers.mapKnowledgeBlocks([{...block,image:data}]);
    assert.equal(legacy.src,'/legacy.jpg');assert.equal(legacy.width,undefined);assert.equal(legacy.height,undefined);
    assert.equal(legacy.srcSet,undefined);
  }
  assert.equal(mappers.mapKnowledgeBlocks([{...block,image:null}]).length,0);
});
test('knowledge follows API pagination and retains topic/format filters on every page', async () => {
  const calls = [];
  const rows = Array.from({length: 136}, (_,id) => ({id, title: `Item ${id}`, format:'article', tab:'education'}));
  const queries = load('queries.ts', {
    '@/lib/api/strapi': { getStrapiMediaUrl: url => url, fetchStrapi: async (url, params) => {
      calls.push({url, params});
      const page = Number(params['pagination[page]']);
      return { data:rows.slice((page-1)*100,page*100), meta:{pagination:{page,pageCount:2,total:136}} };
    }}, './mappers': mappers,
  });
  const result = await queries.getKnowledgeItemsFromStrapi('education','article');
  assert.equal(result.length,136);
  assert.equal(new Set(result.map(x=>x.id)).size,136);
  assert.equal(calls.length,2);
  for (const {url,params} of calls) {
    assert.equal(url,'/api/knowledge-items');
    assert.equal(params['filters[tab][$eq]'],'education');
    assert.equal(params['filters[format][$eq]'],'article');
    assert.equal(params['pagination[pageSize]'],'100');
    assert.equal(params['sort[1]'],'id:asc');
  }
});
test('empty knowledge list and older responses without pagination finish after one request', async () => {
  for (const response of [{data:[],meta:{pagination:{pageCount:0}}},{data:[]}]) {
    let calls=0;
    const queries=load('queries.ts',{'@/lib/api/strapi':{fetchStrapi:async()=>{calls++;return response;}},'./mappers':mappers});
    assert.equal((await queries.getKnowledgeItemsFromStrapi(null,null)).length,0);
    assert.equal(calls,1);
  }
});
test('video resources preserve source links and descriptions without turning other blocks into links', () => {
  const base={id:1,title:'Lesson',slug:'lesson',tab:'education',format:'video',embedUrl:'https://rutube.ru/play/embed/example',description:'Full source text'};
  assert.equal(mappers.mapKnowledgeVideoDetail({...base,embedUrl:null}),null);
  assert.equal(mappers.mapKnowledgeVideoDetail(base).links.length,0);
  const result=mappers.mapKnowledgeVideoDetail({...base,blocks:[
    {__component:'blocks.text-block',id:3,content:'Source text'},
    {__component:'blocks.link-block',id:4,title:'Recipes',url:'https://example.com/recipes',description:'Download'},
  ]});
  assert.equal(result.description,base.description);
  assert.deepEqual(JSON.parse(JSON.stringify(result.links)),[{id:'4',title:'Recipes',url:'https://example.com/recipes',description:'Download'}]);
});
