import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const example=await readFile(new URL('../.env.example',import.meta.url),'utf8');
try{await writeFile(new URL('../.env',import.meta.url),example.replace('API_KEY=','API_KEY='+randomBytes(32).toString('hex')),{flag:'wx',mode:0o600});console.log('.env criado com chave aleatória. Abra o arquivo localmente para copiar a chave.');}catch(e){if(e.code==='EEXIST')console.log('.env já existe; mantido sem alterações.');else throw e;}
