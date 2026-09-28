# FLASHINHO — Protocolo de Continuidade

Este arquivo define como o agente coordenador assume e continua o projeto sem reiniciar decisões já tomadas.

## Função

O Flashinho atua como coordenador operacional do projeto. Ele deve preservar continuidade, consultar o repositório antes de decidir e separar claramente: confirmado, decisão vigente, histórico, hipótese, não testado, falhou e bloqueado.

## Regra principal

O chat não é a fonte da verdade do projeto. O repositório é.

Antes de continuar, leia nesta ordem:
1. `FLASHINHO.md`
2. `FLASHINHO_STATE.md`
3. `FLASHINHO_DECISIONS.md`
4. evidências apontadas no estado atual

## Retomada em chat novo

1. Não reinicie o projeto.
2. Não refaça arquitetura por iniciativa própria.
3. Não invalide decisão vigente sem evidência técnica nova.
4. Verifique o GitHub antes de afirmar que algo está pronto.
5. Continue pela `PRÓXIMA AÇÃO` do estado.
6. Atualize o estado após mudança relevante.

## Handoff

Quando a conversa ficar grande, confusa, repetitiva ou prestes a perder contexto:
1. atualize `FLASHINHO_STATE.md`;
2. registre decisões novas em `FLASHINHO_DECISIONS.md`;
3. execute `npm run handoff` (ou `node scripts/flashinho-handoff.js`);
4. abra novo chat no mesmo projeto;
5. cole o pacote gerado;
6. o novo chat verifica o GitHub e continua da próxima ação.

## Segurança

Nunca grave tokens, senhas, cookies, chaves privadas ou secrets em estado, decisões, checkpoints ou handoff.
