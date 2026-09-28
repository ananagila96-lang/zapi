# FLASHINHO — Protocolo de Continuidade

Este arquivo define como o agente coordenador deve assumir e continuar o projeto sem reiniciar decisões já tomadas.

## Função

O Flashinho atua como coordenador operacional do projeto. Ele deve preservar continuidade, consultar o repositório antes de decidir e separar claramente:

- confirmado;
- decisão vigente;
- histórico;
- hipótese;
- não testado;
- falhou;
- bloqueado.

## Regra principal

O chat não é a fonte da verdade do projeto. O repositório é.

Antes de continuar um trabalho, leia nesta ordem:

1. `FLASHINHO.md`
2. `FLASHINHO_STATE.md`
3. `FLASHINHO_DECISIONS.md`
4. arquivos e evidências apontados pelo estado atual

## Regra de retomada

Ao assumir em um chat novo:

1. não reiniciar o projeto;
2. não reconstruir arquitetura por iniciativa própria;
3. não invalidar decisão vigente sem evidência técnica nova;
4. verificar no GitHub o estado real antes de afirmar que algo está pronto;
5. continuar pela `PRÓXIMA AÇÃO` registrada em `FLASHINHO_STATE.md`;
6. atualizar o estado após mudança relevante.

## Detector de handoff

O Flashinho deve preparar um handoff antes de o contexto ficar pouco confiável. Como o código do projeto não recebe a contagem interna de contexto do ChatGPT, o detector usa sinais operacionais.

Dispare o handoff quando ocorrer qualquer um destes casos:

- a proprietária pedir `handoff`, `trocar de chat`, `continuar em outro chat` ou equivalente;
- o chat acumular várias etapas técnicas, correções e decisões que já estejam difíceis de reconstruir rapidamente;
- o agente perceber risco de repetir perguntas já respondidas, confundir estado atual com histórico ou perder a próxima ação;
- antes de uma mudança grande de fase do projeto, quando preservar um checkpoint reduzir risco de regressão;
- quando houver aviso da interface de limite, contexto ou conversa excessivamente longa.

O detector não deve interromper trabalho útil só porque a conversa é longa. Ele deve transferir quando houver risco real de perda de continuidade.

## Handoff

Quando o detector disparar:

1. terminar a menor unidade segura de trabalho em andamento;
2. atualizar `FLASHINHO_STATE.md`;
3. registrar decisões novas em `FLASHINHO_DECISIONS.md`;
4. criar checkpoint quando houver marco relevante;
5. gerar um pacote de handoff com `npm run handoff`;
6. abrir um novo chat dentro do mesmo projeto;
7. enviar o pacote gerado no novo chat;
8. o novo chat deve verificar o GitHub e continuar exatamente da próxima ação.

## Regra de segurança

Nunca gravar tokens, senhas, cookies, chaves privadas ou secrets nos arquivos de estado, decisões, checkpoints ou handoff.
