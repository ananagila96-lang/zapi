import {join} from 'node:path';
import {whatsappAdapter} from './whatsapp.js';
import {metaAdapter} from './meta.js';
export function createManager({store,dir,max=5,meta={}}){
 const adapters=new Map();
 function attach(row){
  const onMessage=m=>store.addMessage(row.id,m);
  const adapter=row.provider==='meta'?metaAdapter({phoneId:row.phone_id,token:meta.token,version:meta.version,onMessage,onStatus:(id,status)=>store.status(row.id,id,status)}):whatsappAdapter(join(dir,'sessions',row.id),onMessage);
  adapters.set(row.id,{...row,adapter});
 }
 for(const row of store.instances())attach(row);
 return {
  list:()=>[...adapters.values()].map(({id,provider,adapter})=>({id,provider,state:adapter.status().state})),
  get:id=>adapters.get(id)?.adapter,
  create:({id,provider='qr',phoneId})=>{
   if(!/^[a-z][a-z0-9-]{0,31}$/.test(id||''))throw new Error('Nome inválido: use letras minúsculas, números e hífen');
   if(!['qr','meta'].includes(provider))throw new Error('Provedor inválido');
   if(adapters.has(id))throw new Error('Nome já cadastrado');
   if(adapters.size>=max)throw new Error('Limite de números atingido');
   if(provider==='meta'&&(!/^\d{5,30}$/.test(phoneId||'')||[...adapters.values()].some(r=>r.phone_id===phoneId)))throw new Error('Phone Number ID inválido ou já cadastrado');
   store.addInstance(id,provider,phoneId);attach({id,provider,phone_id:phoneId});
  },
  receive:body=>{for(const entry of body.entry||[])for(const change of entry.changes||[]){const value=change.value;for(const row of adapters.values())if(row.provider==='meta'&&row.phone_id===value?.metadata?.phone_number_id)row.adapter.receive(value);}},
  close:()=>{for(const row of adapters.values())row.adapter.close();}
 };
}
