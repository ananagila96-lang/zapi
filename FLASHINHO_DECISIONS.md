# FLASHINHO DECISIONS

Registro das decisões vigentes que devem sobreviver à troca de chats.

## D-001 — Fonte da verdade

**Status:** vigente  
**Decisão:** o GitHub é a fonte técnica da verdade do projeto. Conversas servem como interface de trabalho, não como armazenamento definitivo do estado.

## D-002 — Continuidade entre chats

**Status:** vigente  
**Decisão:** todo chat novo deve ler `FLASHINHO.md`, `FLASHINHO_STATE.md` e este arquivo antes de modificar o projeto.

## D-003 — Sem reinício implícito

**Status:** vigente  
**Decisão:** troca de chat não autoriza refazer arquitetura, recriar projeto, substituir decisões anteriores ou descartar trabalho existente.

## D-004 — Handoff explícito

**Status:** vigente  
**Decisão:** quando o contexto ficar grande ou confuso, o agente deve atualizar o estado e gerar um pacote de handoff contendo o mínimo suficiente para o próximo chat continuar.

## D-005 — Segurança

**Status:** vigente  
**Decisão:** handoffs, estados e checkpoints nunca podem conter tokens, senhas, secrets, cookies ou credenciais privadas.

## D-006 — Verificação antes de continuar

**Status:** vigente  
**Decisão:** ao assumir o projeto, o novo chat deve conferir as evidências no GitHub e continuar da próxima ação registrada, em vez de confiar cegamente no texto do chat anterior.
