# FLASHINHO STATE

> Fonte operacional de continuidade entre chats. Atualize após mudanças relevantes.

## Projeto

- Nome: Zapi
- Repositório: `ananagila96-lang/zapi`
- Branch principal: `main`
- Estado do handoff: `ATIVO`

## Confirmado

- O repositório possui aplicação Node.js, scripts, documentação e testes.
- O protocolo de continuidade do Flashinho foi adicionado ao projeto.

## Decisões vigentes

- GitHub é a fonte técnica da verdade.
- O projeto não deve ser reiniciado em um chat novo.
- Um novo chat deve ler os arquivos Flashinho antes de agir.
- Secrets nunca entram no handoff.

## Histórico recente

- Criado `FLASHINHO.md` com regras de identidade operacional, retomada e handoff.

## Falhou

- Nada registrado nesta versão do mecanismo.

## Bloqueado

- A troca automática de uma conversa do ChatGPT para outra não é controlável pelo código deste repositório. O mecanismo transfere o estado; a abertura do novo chat continua sendo feita pela interface do ChatGPT.

## Não testado

- Script de geração do handoff ainda precisa ser executado após sua criação.

## Próxima ação

Criar e testar `scripts/flashinho-handoff.js`, adicionar `npm run handoff` e validar que o texto gerado contém identidade, estado, decisões, próxima ação e instrução de retomada.

## Evidências

- `FLASHINHO.md`
- `FLASHINHO_STATE.md`
- `FLASHINHO_DECISIONS.md`
- `scripts/flashinho-handoff.js`

## Última atualização

2026-09-28
