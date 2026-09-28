import { readFile } from 'node:fs/promises';
import process from 'node:process';

const files = [
  ['PROTOCOLO', 'FLASHINHO.md'],
  ['ESTADO ATUAL', 'FLASHINHO_STATE.md'],
  ['DECISÕES VIGENTES', 'FLASHINHO_DECISIONS.md'],
];

async function readRequired(path) {
  try {
    return await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  } catch (error) {
    console.error(`[handoff] Não foi possível ler ${path}: ${error.message}`);
    process.exitCode = 1;
    return null;
  }
}

const sections = [];
for (const [title, path] of files) {
  const content = await readRequired(path);
  if (content === null) process.exit(1);
  sections.push(`## ${title}\n\n${content.trim()}`);
}

const handoff = `# FLASHINHO HANDOFF v1\n\nVocê está assumindo a continuidade de um projeto já em andamento.\n\nREGRAS DE ASSUNÇÃO:\n1. Não reinicie o projeto.\n2. Não refaça arquitetura por iniciativa própria.\n3. Use o GitHub como fonte técnica da verdade.\n4. Leia o estado e as decisões abaixo.\n5. Verifique no repositório as evidências citadas.\n6. Continue exatamente da PRÓXIMA AÇÃO registrada no estado, salvo evidência técnica nova.\n7. Nunca exponha nem peça para registrar secrets no handoff.\n\n${sections.join('\n\n---\n\n')}\n\n---\n\n## COMANDO DE RETOMADA\n\nAssuma o projeto a partir deste handoff. Primeiro confira o repositório e os arquivos citados. Depois informe em poucas linhas: (a) estado confirmado, (b) bloqueios reais e (c) próxima ação. Em seguida, continue o trabalho sem recomeçar o projeto.\n`;

process.stdout.write(handoff);
