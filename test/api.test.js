import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {createServer} from '../src/server.js';
import {openStore} from '../src/store.js';
const key='a'.repeat(64);
test('API: isolamento, autenticação, duplicação, validação e assinatura Meta',async()=>{
 const store=openStore(':memory:');let sends=0,state='disconnected',events=0;
 const adapter={status:()=>({state,qr:'secret'}),connect:async()=>{},send:async()=>{sends++;return 'test-id';}};
 const manager={list:()=>[],get:id=>id==='principal'?adapter:undefined,receive:()=>events++,create:()=>{}};
 const server=createServer({key,store,manager,meta:{appSecret:'secret',verifyToken:'verify'}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const headers={Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':'request-0001'};
 const send=body=>fetch(base+'/api/instances/principal/send',{method:'POST',headers,body:JSON.stringify(body)});
 try{
  assert.equal((await fetch(base+'/api/instances/principal/status')).status,401);
  assert.equal((await fetch(base+'/api/instances/other/messages',{headers})).status,404);
  assert.equal((await send({phone:'../invalid',text:'oi'})).status,400);
  assert.equal((await send({phone:'5561999999999',text:'oi'})).status,409);
  state='connected';assert.equal((await send({phone:'5561999999999',text:'oi'})).status,200);
  assert.equal((await send({phone:'5561999999999',text:'oi'})).status,200);assert.equal(sends,1);
  assert.equal((await send({phone:'5561999999999',text:'outro texto'})).status,409);
  headers['Idempotency-Key']='request-0002';assert.equal((await send({phone:'5561999999999',text:'oi'})).status,429);
  assert.equal((await fetch(base+'/api/instances/principal/send',{method:'POST',headers,body:'{'})).status,400);
  assert.equal((await fetch(base+'/webhooks/meta?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=123')).status,403);
  assert.equal(await (await fetch(base+'/webhooks/meta?hub.mode=subscribe&hub.verify_token=verify&hub.challenge=123')).text(),'123');
  const body=JSON.stringify({object:'whatsapp_business_account',entry:[]});
  assert.equal((await fetch(base+'/webhooks/meta',{method:'POST',body})).status,401);
  const signature='sha256='+createHmac('sha256','secret').update(body).digest('hex');
  assert.equal((await fetch(base+'/webhooks/meta',{method:'POST',body,headers:{'x-hub-signature-256':signature}})).status,200);assert.equal(events,1);
  assert.equal(store.messages('principal').length,1);assert.equal(store.messages('other').length,0);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));store.close();}
});
test('recusa chave curta',()=>assert.throws(()=>createServer({key:'short'})));
