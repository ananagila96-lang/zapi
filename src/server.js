import http from 'node:http';
import {timingSafeEqual,createHmac,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const same=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);};
async function readBody(req,limit=16384){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(new Error('Corpo muito grande'),{status:413});chunks.push(chunk);}return Buffer.concat(chunks);}
function json(raw){try{return JSON.parse(raw);}catch{throw Object.assign(new Error('JSON inválido'),{status:400});}}
export function createServer({key,manager,store,meta={}}){
 if(!key||key.length<32)throw new Error('API_KEY precisa ter pelo menos 32 caracteres');
 const busy=new Set(),lastSend=new Map();
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'");
  const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(req.method==='GET'&&['/','/app.js','/style.css'].includes(url.pathname)){
    const file=url.pathname==='/'?'index.html':url.pathname.slice(1);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');return res.end(await readFile(new URL(`../public/${file}`,import.meta.url)));
   }
   if(req.method==='GET'&&url.pathname==='/health')return reply(200,{ok:true});
   if(url.pathname==='/webhooks/meta'){
    if(!meta.verifyToken||!meta.appSecret)return reply(503,{error:'Webhook não configurado'});
    if(req.method==='GET'){
     if(url.searchParams.get('hub.mode')!=='subscribe'||!same(url.searchParams.get('hub.verify_token'),meta.verifyToken))return reply(403,{error:'Verificação negada'});
     res.setHeader('Content-Type','text/plain');return res.end(url.searchParams.get('hub.challenge')||'');
    }
    if(req.method==='POST'){
     const raw=await readBody(req,1048576);const expected='sha256='+createHmac('sha256',meta.appSecret).update(raw).digest('hex');
     if(!same(req.headers['x-hub-signature-256'],expected))return reply(401,{error:'Assinatura inválida'});
     const body=json(raw);if(body?.object!=='whatsapp_business_account')return reply(400,{error:'Evento inválido'});
     manager.receive(body);return reply(200,{ok:true});
    }
    return reply(405,{error:'Método inválido'});
   }
   if(!same(req.headers.authorization,`Bearer ${key}`))return reply(401,{error:'Acesso negado'});
   if(url.pathname==='/api/instances'){
    if(req.method==='GET')return reply(200,{instances:manager.list()});
    if(req.method==='POST'){
     const body=json(await readBody(req));try{manager.create(body);}catch(e){return reply(400,{error:e.message});}return reply(201,{ok:true});
    }
   }
   const match=/^\/api\/instances\/([a-z][a-z0-9-]{0,31})\/(status|messages|connect|send)$/.exec(url.pathname);
   if(!match)return reply(404,{error:'Rota não encontrada'});
   const [,instance,action]=match;const adapter=manager.get(instance);if(!adapter)return reply(404,{error:'Número não encontrado'});
   if(req.method==='GET'&&action==='status')return reply(200,adapter.status());
   if(req.method==='GET'&&action==='messages')return reply(200,{messages:store.messages(instance)});
   if(req.method==='POST'&&action==='connect'){await adapter.connect();return reply(202,{ok:true});}
   if(req.method==='POST'&&action==='send'){
    if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,{error:'Use application/json'});
    const body=json(await readBody(req));
    if(!/^\d{10,15}$/.test(body?.phone||'')||typeof body?.text!=='string'||!body.text.trim()||body.text.length>4000)return reply(400,{error:'Informe telefone com DDI e texto de até 4000 caracteres'});
    const id=req.headers['idempotency-key'];if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(id))return reply(400,{error:'Informe Idempotency-Key (8 a 100 caracteres)'});
    const hash=createHash('sha256').update(JSON.stringify([body.phone,body.text])).digest('hex');
    const previous=store.request(instance,id);
    if(previous){if(previous.hash!==hash)return reply(409,{error:'Chave já usada com outra mensagem'});if(previous.result)return reply(200,JSON.parse(previous.result));return reply(409,{error:'Envio pendente ou resultado incerto. Confira a conversa antes de tentar outra chave.'});}
    if(adapter.status().state!=='connected')return reply(409,{error:'WhatsApp desconectado'});
    if(busy.has(instance)||Date.now()-(lastSend.get(instance)||0)<3000)return reply(429,{error:'Aguarde antes de enviar novamente'});
    busy.add(instance);lastSend.set(instance,Date.now());
    try{
     store.begin(instance,id,hash);
     const messageId=await adapter.send(body.phone,body.text);
     const result={id:messageId,status:'accepted'};
     store.addMessage(instance,{id:messageId,from:body.phone,text:body.text,direction:'out',status:'accepted'});
     store.finish(instance,id,result);return reply(200,result);
    }finally{busy.delete(instance);}
   }
   reply(405,{error:'Método inválido'});
  }catch(error){if(!res.headersSent)reply(error.status||500,{error:error.status?error.message:'Falha na operação. Verifique a conexão; não repita envios sem conferir o histórico.'});else res.end();}
 });
 server.requestTimeout=30000;server.headersTimeout=15000;
 return server;
}
