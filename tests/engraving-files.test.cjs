const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function fixture(handler,saved){
 const memory=new Map(saved?[['cocktaildesign:engraving-files',JSON.stringify({state:saved,version:0})]]:[]),requests=[],cache=new Map();
 const globals={console,File,Blob,Uint8Array,Array,crypto:crypto.webcrypto,AbortController,setTimeout,clearTimeout,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},
 process:{env:{NEXT_PUBLIC_API_URL:'http://isolated.invalid/api'}},fetch:async(url,opts)=>{assert(url.startsWith('http://isolated.invalid/api/engraving-files'));requests.push({url,opts});return handler(url,opts);}};
 function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext('(function(require,module,exports){'+js+'\n})',globals)(id=>{if(['zustand','zustand/middleware'].includes(id))return require(id);assert(id.startsWith('.'));return load(path.resolve(path.dirname(file),id+'.ts'));},module,module.exports);return module.exports;}
 return {...load('src/lib/cart/engravingFiles.ts'),cart:load('src/lib/cart/cartStore.ts').useCartStore,requests,memory};
}
const pause=()=>new Promise(resolve=>setImmediate(resolve));
const pdf=()=>new File(['%PDF-1.7\n%%EOF'],'Логотип.pdf',{type:'application/pdf'});
test('uploads independently, stores only metadata, reconciles after navigation and clears with accepted cart',async()=>{
 const rows=[];const x=fixture(async(url,opts)=>{
  if(opts.method==='PUT'){const row={id:url.split('/').at(-1),size:opts.body.size};rows.push(row);return {ok:true,json:async()=>({ok:true,file:row})};}
  return {ok:true,json:async()=>({ok:true,files:rows})};
 });
 assert.equal(x.uploadEngravingFile(pdf()),null);assert.equal(x.useEngravingFiles.getState().files[0].status,'uploading');await pause();
 assert.equal(x.useEngravingFiles.getState().files[0].status,'ready');assert(await x.reconcileEngravingFiles());
 const saved=JSON.parse(x.memory.get('cocktaildesign:engraving-files'));assert.equal(saved.state.files[0].name,'Логотип.pdf');assert(!JSON.stringify(saved).includes('%PDF'));
 assert.equal(saved.state.token.length,64);x.cart.getState().addItem({id:'test',engraving:true,quantity:1});x.cart.getState().clearCart();assert.equal(x.useEngravingFiles.getState().files.length,0);
});
test('network error retains a failed upload until explicit continue-without-file; missing saved files cannot pass checkout',async()=>{
 const x=fixture(async()=>{throw Error('offline');});x.uploadEngravingFile(pdf());await pause();
 const row=x.useEngravingFiles.getState().files[0];assert.equal(row.status,'error');assert.equal(await x.reconcileEngravingFiles(),false);
 assert.equal(x.useEngravingFiles.getState().files.length,1);assert(await x.removeEngravingFile(row.id));assert.equal(x.useEngravingFiles.getState().files.length,0);
 const y=fixture(async()=>({ok:true,json:async()=>({ok:true,files:[]})}),{token:'a'.repeat(64),files:[{id:crypto.randomUUID(),name:'old.pdf',size:1,status:'ready'}],note:'',orderKey:''});
 assert.equal(await y.reconcileEngravingFiles(),false);assert.equal(y.useEngravingFiles.getState().files[0].status,'error');
});
test('bad format/size and fourth file are blocked locally; reload of an interrupted upload is explicit',async()=>{
 const x=fixture(async(url,opts)=>({ok:true,json:async()=>({ok:true,file:{id:url.split('/').at(-1)}})}));
 assert(x.uploadEngravingFile(new File(['bad'],'bad.exe')));assert(x.uploadEngravingFile(new File([new Uint8Array(10*1024*1024+1)],'large.pdf')));assert.equal(x.requests.length,0);
 for(let i=0;i<3;i++)assert.equal(x.uploadEngravingFile(pdf()),null);assert(x.uploadEngravingFile(pdf()));await pause();assert.equal(x.requests.length,3);
 const y=fixture(async()=>{throw Error('unused');},{token:'a'.repeat(64),files:[{id:crypto.randomUUID(),name:'pending.pdf',size:1,status:'uploading'}],note:'',orderKey:''});
 assert.equal(y.useEngravingFiles.getState().files[0].status,'error');assert(y.useEngravingFiles.getState().hydrated);
});
