const el=id=>document.getElementById(id);
let key='',timer;
async function api(path,body){const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw new Error(data.error);return data;}
async function refresh(){try{const s=await api('status');el('status').textContent='Conexão: '+s.state;el('qr').hidden=!s.qr;if(s.qr)el('qr').src=s.qr;else el('qr').removeAttribute('src');const m=await api('messages');el('messages').textContent=m.messages.map(x=>`${x.from}: ${x.text}`).join('\n');}catch(e){clearInterval(timer);el('qr').hidden=true;el('messages').textContent='';el('status').textContent=e.message;}}
el('enter').onclick=()=>{key=el('key').value;el('key').value='';clearInterval(timer);refresh();timer=setInterval(refresh,4000);};
el('connect').onclick=async()=>{try{await api('connect',{});await refresh();}catch(e){el('status').textContent=e.message;}};
el('send').onclick=async()=>{el('send').disabled=true;try{await api('send',{phone:el('phone').value,text:el('text').value});el('text').value='';el('status').textContent='Envio aceito pelo conector; entrega ao destinatário ainda não confirmada.';}catch(e){el('status').textContent=e.message;}finally{el('send').disabled=false;}};
