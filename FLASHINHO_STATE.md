# FLASHINHO STATE

> Fonte operacional de continuidade entre chats. Atualize após mudanças relevantes.

## Projeto

- Nome: Zapi
- Repositório: `ananagila96-lang/zapi`
- Branch principal: `main`
- Estado do handoff: `ATIVO E TESTADO`

## Confirmado

- O repositório possui aplicação Node.js, scripts, documentação e testes.
- O protocolo de continuidade do Flashinho foi adicionado ao projeto.
- `scripts/flashinho-handoff.js` gera um pacote de continuidade com protocolo, estado, decisões e comando de retomada.
- `npm run handoff` foi adicionado ao `package.json`.
- O gerador foi validado em execução local com as seções obrigatórias.
- Existe convenção para checkpoints em `checkpoints/README.md`.
- O protocolo contém regras de disparo quando houver risco de perda de contexto.

## Decisões vigentes

- GitHub é a fonte técnica da verdade.
- O projeto não deve ser reiniciado em um chat novo.
- Um novo chat deve ler os arquivos Flashinho antes de agir.
- Secrets nunca entram no handoff.
- O detector de handoff usa sinais operacionais, porque o projeto não recebe a contagem interna de contexto do ChatGPT.

## Histórico recente

- Criado `FLASHINHO.md` com regras de identidade operacional, retomada, detector e handoff.
- Criado `FLASHINHO_DECISIONS.md`.
- Criado `scripts/flashinho-handoff.js`.
- Adicionado script npm `handoff`.
- Criada convenção de checkpoints.
- Gerador executado e validado.

## Falhou

- O clone direto do GitHub pelo ambiente de teste não funcionou por indisponibilidade de DNS externo nesse ambiente; a validação foi refeita executando o mesmo script recuperado do repositório.

## Bloqueado

- A criação/abertura automática de uma nova conversa do ChatGPT não é controlável pelo código deste repositório. O mecanismo automatiza a preservação e reconstrução do estado; a interface ainda precisa abrir o novo chat.

## Não testado

- Primeiro handoff real entre dois chats do projeto ainda não foi realizado.

## Próxima ação

No próximo momento em que este chat precisar ser trocado, atualizar este estado, gerar o handoff e executar o primeiro teste real de retomada em outro chat do mesmo projeto.

## Evidências

- `FLASHINHO.md`
- `FLASHINHO_STATE.md`
- `FLASHINHO_DECISIONS.md`
- `scripts/flashinho-handoff.js`
- `checkpoints/README.md`
- `package.json`

## Última atualização

2026-09-28
