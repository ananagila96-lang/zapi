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

const handoff = `# FLASHINHO HANDOFF v1

Você está assumindo a continuidade de um projeto já em andamento.

REGRAS DE ASSUNÇÃO:
1. Não reinicie o projeto.
2. Não refaça arquitetura por iniciativa própria.
3. Use o GitHub como fonte técnica da verdade.
4. Leia o estado e as decisões abaixo.
5. Verifique no repositório as evidências citadas.
6. Continue exatamente da PRÓXIMA AÇÃO registrada no estado, salvo evidência técnica nova.
7. Nunca exponha nem peça para registrar secrets no handoff.

${sections.join('\n\n---\n\n')}

---

## COMANDO DE RETOMADA

Assuma o projeto a partir deste handoff. Primeiro confira o repositório e os arquivos citados. Depois informe em poucas linhas: (a) estado confirmado, (b) bloqueios reais e (c) próxima ação. Em seguida, continue o trabalho sem recomeçar o projeto.
`;

process.stdout.write(handoff);
