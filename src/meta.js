export function metaAdapter({phoneId,token,version,onMessage,onStatus,fetcher=fetch}){
 let state='not_configured';
 const configured=Boolean(token && /^v\d+\.\d+$/.test(version||'') && /^\d+$/.test(phoneId||''));
 async function request(path,body){
  if(!configured)throw new Error('Meta não configurada');
  const response=await fetcher(`https://graph.facebook.com/${version}/${phoneId}${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(!response.ok){state='error';throw new Error(`Meta recusou operação (código ${result.error?.code||response.status})`);}
  return result;
 }
 return {
  status:()=>({state,qr:null}),
  connect:async()=>{await request('?fields=id');state='connected';},
  send:async(phone,text)=>{const r=await request('/messages',{messaging_product:'whatsapp',to:phone,type:'text',text:{body:text}});if(!r.messages?.[0]?.id)throw new Error('Resposta Meta sem ID');return r.messages[0].id;},
  receive:value=>{
   for(const m of value.messages||[]){if(!m.id)continue;const t=Number(m.timestamp);onMessage({id:m.id,from:m.from,text:m.text?.body||`[${m.type||'evento'}]`,receivedAt:Number.isFinite(t)&&t>0?new Date(t*1000).toISOString():new Date().toISOString()});}
   for(const s of value.statuses||[])if(s.id)onStatus(s.id,s.status);
  },
  close:()=>{state='disconnected';}
 };
}
