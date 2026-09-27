import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../src/server.js';
const key='a'.repeat(64);
test('API protege QR, valida destinatário e bloqueia envio desconectado',async()=>{
 let sends=0,state='disconnected';
 const server=createServer({key,adapter:{status:()=>({state,qr:'secret'}),messages:()=>[],connect:async()=>{},send:async()=>{sends++;return 'test-id';}}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const headers={Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 try {
  assert.equal((await fetch(base+'/api/status')).status,401);
  assert.equal((await fetch(base+'/api/messages',{headers:{Authorization:'Bearer wrong'}})).status,401);
  const send=body=>fetch(base+'/api/send',{method:'POST',headers,body:JSON.stringify(body)});
  assert.equal((await send({phone:'../invalid',text:'oi'})).status,400);
  assert.equal((await send({phone:'5561999999999',text:'oi'})).status,409);
  state='connected';
  assert.equal((await send({phone:'5561999999999',text:'oi'})).status,200);
  assert.equal((await send({phone:'5561999999999',text:'oi'})).status,429);
  assert.equal(sends,1);
  assert.equal((await fetch(base+'/api/send',{method:'POST',headers,body:'{'})).status,400);
 } finally {server.closeAllConnections();await new Promise(r=>server.close(r));}
});
test('recusa chave ausente ou curta',()=>{assert.throws(()=>createServer({key:'short',adapter:{}}));});
