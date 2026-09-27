const el=id=>document.getElementById(id);
let key='',timer,refreshing=false;
const pending=new Map();
const notice=text=>{el('notice').textContent=text;};
async function api(path,body,extra={}){const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json',...extra},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok){const e=new Error(data.error);e.status=r.status;throw e;}return data;}
const path=action=>'instances/'+el('instance').value+'/'+action;
async function refresh(){
 if(refreshing||!key)return;refreshing=true;
 try{
  const list=await api('instances');const selected=el('instance').value;
  el('instance').replaceChildren(...list.instances.map(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=`${i.id} · ${i.provider} · ${i.state}`;return o;}));
  if(list.instances.some(i=>i.id===selected))el('instance').value=selected;
  const current=el('instance').value;if(!current)return;
  const s=await api(path('status'));if(el('instance').value!==current)return;
  el('status').textContent='Estado: '+s.state;el('qr').hidden=!s.qr;if(s.qr)el('qr').src=s.qr;else el('qr').removeAttribute('src');
  const m=await api(path('messages'));if(el('instance').value!==current)return;
  el('messages').textContent=m.messages.map(x=>`${x.receivedAt} · ${x.direction==='out'?'Enviada':'Recebida'} · ${x.status}\n${x.from}: ${x.text}`).join('\n\n');
 }catch(e){if(e.status===401){clearInterval(timer);key='';el('qr').hidden=true;el('messages').textContent='';}notice(e.message);}finally{refreshing=false;}
}
el('enter').onclick=()=>{key=el('key').value;el('key').value='';clearInterval(timer);notice('Carregando...');refresh();timer=setInterval(refresh,4000);};
el('instance').onchange=()=>{el('qr').hidden=true;el('messages').textContent='';refresh();};
el('connect').onclick=async()=>{el('connect').disabled=true;try{await api(path('connect'),{});notice('Conexão solicitada. Na Meta, isso verifica credenciais; confirme também o webhook.');await refresh();}catch(e){notice(e.message);}finally{el('connect').disabled=false;}};
el('create').onclick=async()=>{try{await api('instances',{id:el('name').value,provider:el('provider').value,phoneId:el('phoneId').value});notice('Conexão cadastrada.');await refresh();}catch(e){notice(e.message);}};
el('send').onclick=async()=>{
 el('send').disabled=true;const body={phone:el('phone').value,text:el('text').value};const fingerprint=JSON.stringify([el('instance').value,body]);
 if(!pending.has(fingerprint))pending.set(fingerprint,crypto.randomUUID());
 try{await api(path('send'),body,{'Idempotency-Key':pending.get(fingerprint)});pending.delete(fingerprint);el('text').value='';notice('Envio aceito. Confira o histórico para status de entrega quando disponível.');await refresh();}catch(e){notice(e.message);}finally{el('send').disabled=false;}
};
