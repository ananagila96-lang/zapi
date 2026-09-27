import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export function createServer({key, adapter}) {
  if (!key || key.length < 32) throw new Error('API_KEY precisa ter pelo menos 32 caracteres');
  const token = Buffer.from(`Bearer ${key}`);
  let busy = false;
  let lastSend = 0;
  return http.createServer(async (req,res) => {
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'");
    const reply = (status,body) => {res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
    try {
      const url = new URL(req.url,'http://localhost');
      if(req.method==='GET' && ['/','/app.js','/style.css'].includes(url.pathname)) {
        const file = url.pathname==='/' ? 'index.html' : url.pathname.slice(1);
        res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
        return res.end(await readFile(new URL(`../public/${file}`,import.meta.url)));
      }
      if(req.method==='GET' && url.pathname==='/health') return reply(200,{ok:true});
      const auth=Buffer.from(req.headers.authorization||'');
      if(auth.length!==token.length || !timingSafeEqual(auth,token)) return reply(401,{error:'Acesso negado'});
      if(req.method==='GET' && url.pathname==='/api/status') return reply(200,adapter.status());
      if(req.method==='GET' && url.pathname==='/api/messages') return reply(200,{messages:adapter.messages()});
      if(req.method==='POST' && url.pathname==='/api/connect') {await adapter.connect();return reply(202,{ok:true});}
      if(req.method==='POST' && url.pathname==='/api/send') {
        if(!req.headers['content-type']?.startsWith('application/json')) return reply(415,{error:'Use application/json'});
        let data='';
        for await(const chunk of req) {data+=chunk;if(Buffer.byteLength(data)>16384)return reply(413,{error:'Corpo muito grande'});}
        let body;try {body=JSON.parse(data);}catch{return reply(400,{error:'JSON inválido'});}
        if(!/^\d{10,15}$/.test(body?.phone||'') || typeof body?.text!=='string' || !body.text.trim() || body.text.length>4000) return reply(400,{error:'Informe telefone com DDI, só números, e texto de até 4000 caracteres'});
        if(adapter.status().state!=='connected') return reply(409,{error:'WhatsApp desconectado'});
        if(busy || Date.now()-lastSend<3000)return reply(429,{error:'Aguarde antes de enviar novamente'});
        busy=true;lastSend=Date.now();
        try {return reply(200,{id:await adapter.send(body.phone,body.text)});}finally{busy=false;}
      }
      reply(404,{error:'Rota não encontrada'});
    } catch {if(!res.headersSent)reply(500,{error:'Falha na operação. Confira a conexão e os logs locais.'});else res.end();}
  });
}
