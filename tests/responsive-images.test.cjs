const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}) {
  const mod = {exports:{}};
  const js = ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src',file),'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
  }).outputText;
  vm.runInNewContext(js,{module:mod,exports:mod.exports,require:id=>{
    assert.ok(id in imports,`Unexpected dependency ${id}`); return imports[id];
  }});
  return mod.exports;
}
const responsive = load('lib/api/strapi/responsive-image.ts');
const resolve = url => 'https://media.example.test'+url;
const media = {
  url:'/original.webp',width:1200,
  formats:{large:{url:'/large.webp',width:1000},small:{url:'/small.webp',width:500}},
};
test('home boundary preserves displayed prices, selected variant and stock identity while dropping unused galleries',()=>{
  const {homeProductCard}=load('lib/catalog/home-product-card.ts');
  const product={id:'p',slug:'slug',name:'Product',price:450,priceOld:760,moyskladId:'parent',images:['/selected.webp'],imageUrl:'/selected.webp',preferredVariantId:'v',isSampleSale:true,badges:[{label:'Sale'}],variants:[{id:'v',moyskladId:'variant',images:[{src:'/extra.webp'}]}],imageSrcSets:{'/selected.webp':'selected 500w, selected-large 1000w','/extra.webp':'extra 500w, extra-large 1000w'}};
  const home=homeProductCard(product);
  for(const key of ['id','slug','name','price','priceOld','images','imageUrl','preferredVariantId','isSampleSale','badges']) assert.equal(home[key],product[key]);
  assert.equal(home.badgeMoyskladId,'variant');
  assert.equal(home.imageSrcSets['/selected.webp'],product.imageSrcSets['/selected.webp']);
  assert.equal(home.imageSrcSets['/extra.webp'],undefined);
  assert.equal(home.variants,undefined);
  assert.equal(homeProductCard({...product,preferredVariantId:undefined}).badgeMoyskladId,'parent');
  assert.equal(product.variants[0].images[0].src,'/extra.webp');
});
test('responsive candidates use actual CMS widths and URLs, in ascending order',()=>{
  assert.equal(responsive.mediaSrcSet(media,resolve),
    'https://media.example.test/small.webp 500w, https://media.example.test/large.webp 1000w, https://media.example.test/original.webp 1200w');
  assert.equal(responsive.mediaSrcSet({...media,width:1000},resolve),
    'https://media.example.test/small.webp 500w, https://media.example.test/original.webp 1000w');
});
test('missing formats, unknown sizes and invalid candidates retain the original image fallback',()=>{
  for(const file of [null,undefined,{}, {url:'/x'}, {url:'/x',width:500},
    {formats:{a:null,b:{url:'/x',width:0},c:{url:'/y',width:-5}}},
    {formats:{a:{url:'/a b',width:500},b:{url:'/a,b',width:1000}}}]) {
    assert.equal(responsive.mediaSrcSet(file,resolve),undefined);
  }
  assert.equal(responsive.mediaSrcSet(media,()=>undefined),undefined);
});
test('responsive mapping keeps product/variant images, money and selection flags attached to the same product',()=>{
  const api=load('lib/api/catalog/mappers.ts',{
    '@/lib/api/strapi/media':{getStrapiMediaUrl:resolve},
    '@/lib/api/strapi/responsive-image':responsive,
  });
  const variant={id:2,name:'Variant',moyskladId:'v2',price:450,priceOld:760,code:'V',image:[{...media,url:'/variant.webp',formats:{small:{url:'/variant-small.webp',width:500},large:{url:'/variant-large.webp',width:1000}}}]};
  const source={id:1,attributes:{name:'Product',slug:'product',moyskladId:'p1',price:900,priceOld:1200,code:'P',discountExcluded:true,engravingEnabled:true,isSampleSale:true,image:[media],variants:[variant]}};
  const result=api.mapProductPreview(source);
  assert.ok(result);
  assert.equal(result.price,900);assert.equal(result.priceOld,1200);
  assert.equal(result.discountExcluded,true);assert.equal(result.isSampleSale,true);
  assert.equal(result.imageUrl,resolve('/large.webp'));
  assert.ok(result.imageSrcSets[result.imageUrl].includes('/small.webp 500w'));
  assert.equal(result.variants[0].price,450);
  const vi=result.variants[0].images[0];
  assert.equal(vi.src,resolve('/variant-large.webp'));
  assert.ok(result.imageSrcSets[vi.src].includes('/variant-small.webp 500w'));
  assert.ok(!result.imageSrcSets[vi.src].includes('/small.webp'));
});
