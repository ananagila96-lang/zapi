# FLASHINHO STATE

> Fonte operacional de continuidade entre chats. Atualize após mudanças relevantes.

## Projeto

- Nome: Zapi
- Repositório: `ananagila96-lang/zapi`
- Branch principal: `main`
- Estado do handoff: `ATIVO, TESTADO E REUTILIZÁVEL`

## Confirmado

- O repositório possui aplicação Node.js, scripts, documentação e testes.
- O protocolo de continuidade do Flashinho foi adicionado ao projeto.
- `scripts/flashinho-handoff.js` gera um pacote de continuidade com protocolo, estado, decisões e comando de retomada.
- `npm run handoff` foi adicionado ao `package.json`.
- Existe convenção para checkpoints em `checkpoints/README.md`.
- O protocolo contém regras de disparo quando houver risco de perda de contexto.
- Foi criado um template reutilizável em `templates/flashinho/`.
- Foi criado `scripts/install-flashinho-handoff.js` para instalar o mecanismo em outro projeto.
- O instalador preserva arquivos existentes por padrão e só sobrescreve com `--force`.
- O instalador preserva scripts existentes do `package.json` e adiciona apenas `scripts.handoff`.
- `npm run flashinho:install` expõe o instalador neste repositório.
- Testes automatizados cobrem instalação, geração do handoff e proteção contra sobrescrita acidental.

## Decisões vigentes

- GitHub é a fonte técnica da verdade.
- O projeto não deve ser reiniciado em um chat novo.
- Um novo chat deve ler os arquivos Flashinho antes de agir.
- Secrets nunca entram no handoff.
- O detector de handoff usa sinais operacionais, porque o projeto não recebe a contagem interna de contexto do ChatGPT.
- O mecanismo deve ser reutilizável em outros projetos sem exigir recriação manual.

## Histórico recente

- Criado `FLASHINHO.md` com regras de identidade operacional, retomada, detector e handoff.
- Criado `FLASHINHO_DECISIONS.md`.
- Criado `scripts/flashinho-handoff.js`.
- Adicionado script npm `handoff`.
- Criada convenção de checkpoints.
- Criado template universal em `templates/flashinho/`.
- Criado instalador universal `scripts/install-flashinho-handoff.js`.
- Adicionado teste `test/flashinho-handoff.test.js`.
- Alterações universais isoladas na branch `flashinho/handoff-standard-v1`.

## Falhou

- O clone direto do GitHub pelo ambiente de teste não funcionou por indisponibilidade de DNS externo nesse ambiente; a validação anterior foi refeita com o conteúdo recuperado do repositório.

## Bloqueado

- A criação/abertura automática de uma nova conversa do ChatGPT não é controlável pelo código deste repositório. O mecanismo automatiza preservação e reconstrução do estado; a interface ainda precisa abrir o novo chat.

## Não testado

- Primeiro handoff real entre dois chats do projeto ainda não foi realizado.
- A execução do novo teste automatizado ainda depende do CI da branch/PR.

## Próxima ação

Abrir PR da branch `flashinho/handoff-standard-v1` para `main`, acompanhar o CI e, se os testes passarem, integrar o padrão reutilizável.

## Evidências

- `FLASHINHO.md`
- `FLASHINHO_STATE.md`
- `FLASHINHO_DECISIONS.md`
- `scripts/flashinho-handoff.js`
- `scripts/install-flashinho-handoff.js`
- `templates/flashinho/`
- `test/flashinho-handoff.test.js`
- `checkpoints/README.md`
- `package.json`

## Última atualização

2026-09-28
