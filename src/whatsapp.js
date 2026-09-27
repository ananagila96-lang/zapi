import makeWASocket, {useMultiFileAuthState, DisconnectReason} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import {mkdir} from 'node:fs/promises';

// Protótipo de um número. Arquivos de sessão nunca devem entrar no Git.
export function whatsappAdapter(dir, onMessage=()=>{}) {
  let socket, starting=false, state='disconnected', qr=null, timer, stopped=false, attempts=0;
  const inbox=[];
  const seen=new Set();
  const logger=pino({level:'silent'});
  const connect=async()=>{
    if(stopped || starting || socket || timer)return;
    starting=true; state='connecting';
    try {
      await mkdir(dir,{recursive:true,mode:0o700});
      const {state:auth,saveCreds}=await useMultiFileAuthState(dir);
      const current=makeWASocket({auth,logger,markOnlineOnConnect:false,syncFullHistory:false});
      socket=current;
      current.ev.on('creds.update',()=>saveCreds().catch(()=>{state='storage_error';}));
      current.ev.on('connection.update',async(update)=>{
        if(socket!==current || stopped)return;
        if(update.qr){
          const image=await QRCode.toDataURL(update.qr);
          if(socket===current && state!=='connected'){qr=image;state='qr';}
        }
        if(update.connection==='open'){state='connected';qr=null;attempts=0;}
        if(update.connection==='close'){
          socket=null;qr=null;
          const code=update.lastDisconnect?.error?.output?.statusCode;
          if(code===DisconnectReason.loggedOut){state='logged_out';return;}
          state='disconnected';
          if(attempts++<5)timer=setTimeout(()=>{timer=null;connect().catch(()=>{});},Math.min(30000,2000*2**attempts));
        }
      });
      current.ev.on('messages.upsert',({messages,type})=>{
        if(type!=='notify')return;
        for(const m of messages){
          if(m.key.fromMe || !m.key.id || seen.has(m.key.id))continue;
          seen.add(m.key.id);if(seen.size>1000)seen.delete(seen.values().next().value);
          const record={id:m.key.id,from:m.key.remoteJid,text:m.message?.conversation||m.message?.extendedTextMessage?.text||'[mídia ou evento]',receivedAt:new Date().toISOString()};
          try {onMessage(record);}catch{state='storage_error';}
          inbox.push(record);
          if(inbox.length>100)inbox.shift();
        }
      });
    }catch(error){state='error';socket=null;throw error;}finally{starting=false;}
  };
  return {
    connect,
    status:()=>({state,qr}),messages:()=>inbox.slice(),
    send:async(phone,text)=>{if(state!=='connected'||!socket)throw new Error('disconnected');const r=await socket.sendMessage(`${phone}@s.whatsapp.net`,{text});return r?.key?.id;},
    close:()=>{stopped=true;clearTimeout(timer);socket?.end(new Error('Encerramento'));socket=null;qr=null;state='disconnected';}
  };
}
