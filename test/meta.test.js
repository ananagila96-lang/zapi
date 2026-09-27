import {test} from 'node:test';
import assert from 'node:assert/strict';
import {metaAdapter} from '../src/meta.js';
import {openStore} from '../src/store.js';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('conector Meta monta envio e processa recebimento e status',async()=>{
 const calls=[],messages=[],statuses=[];
 const adapter=metaAdapter({phoneId:'123456',version:'v23.0',token:'test-token',onMessage:m=>messages.push(m),onStatus:(...s)=>statuses.push(s),fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({messages:[{id:'wamid.test'}]})};}});
 await adapter.connect();assert.equal(adapter.status().state,'connected');
 assert.equal(await adapter.send('5561999999999','teste'),'wamid.test');
 assert.equal(calls[1].url,'https://graph.facebook.com/v23.0/123456/messages');assert.equal(JSON.parse(calls[1].options.body).text.body,'teste');
 adapter.receive({messages:[{id:'in-1',from:'5561999999999',timestamp:'1700000000',text:{body:'oi'}}],statuses:[{id:'wamid.test',status:'delivered'}]});
 assert.equal(messages[0].text,'oi');assert.deepEqual(statuses[0],['wamid.test','delivered']);
});
test('SQLite mantém deduplicação e separação de conexões após reiniciar',()=>{
 const dir=mkdtempSync(join(tmpdir(),'zap-test-'));let db=openStore(join(dir,'db.sqlite'));
 try{
  db.addInstance('principal','qr');db.addMessage('principal',{id:'1',text:'oi'});db.addMessage('principal',{id:'1',text:'duplicada'});db.addMessage('outro',{id:'1',text:'outro'});
  db.begin('principal','request-id','hash');db.finish('principal','request-id',{id:'1'});db.close();db=openStore(join(dir,'db.sqlite'));
  assert.equal(db.messages('principal').length,1);assert.equal(db.messages('outro')[0].text,'outro');assert.equal(db.request('principal','request-id').hash,'hash');assert.equal(db.instances().length,1);
 }finally{db.close();rmSync(dir,{recursive:true});}
});
