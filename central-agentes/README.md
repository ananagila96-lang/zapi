# Central Flashinho — MVP

Central própria de agentes, separada do runtime do WhatsApp.

## Objetivo

`Proprietária -> Flashinho Coordenador -> Central -> funcionários especializados -> relatório ao Coordenador`

Cada funcionário tem identidade, instruções, conversa persistente e tarefas próprias. A Central usa a API da OpenAI; a Conversation da API não aparece automaticamente dentro de um Projeto do ChatGPT.

## Funcionários definidos

| Nome | Cargo | Fronteira |
| --- | --- | --- |
| Byte | Arquitetura & Desenvolvimento | Código e arquitetura dentro da tarefa recebida |
| Plug | APIs & Integrações | APIs, webhooks, OAuth e contratos entre serviços |
| Crash | QA & Testes | Validação e evidência independente |
| Hype | Marketing & Growth | Propostas de aquisição e campanhas, sem publicar ou gastar |

A fonte dos prompts completos é `agents.json`. Todos respondem ao Flashinho Coordenador, consultam o estado atual do projeto e não mudam estratégia, produto ou prioridades por conta própria. O Coordenador não é duplicado como funcionário.

## Cadastro

No diretório `central-agentes`, rode `npm run seed` para cadastrar os quatro no arquivo apontado por `CENTRAL_DATA_FILE` (padrão: `./data/central-agentes.json`). O comando é idempotente: preserva funcionários já existentes e suas conversas. `npm start -- agents` lista os cadastros.

O cadastro local e os prompts estão definidos no GitHub. Para executarem tarefas com a OpenAI, o ambiente da Central precisa de `OPENAI_API_KEY`. Não confundir este cadastro com quatro chats nativos dentro do Projeto do ChatGPT; a criação desses chats precisa ser verificada separadamente na interface.

## MVP

1. Criar/listar funcionários.
2. Guardar cargo, missão e prompt de sistema.
3. Criar tarefas para um funcionário.
4. Manter `conversation_id` persistente por funcionário quando a API estiver conectada.
5. Executar tarefa pela OpenAI e registrar resposta/evidência.
6. Entregar resultado ao Coordenador.

## Segurança

- `OPENAI_API_KEY` somente em variável de ambiente/secret.
- Nunca versionar chave, token ou credencial.
- Sem chave, a Central funciona em modo estrutural e marca execução como `BLOQUEADO`.

## Estado

🟡 Os quatro funcionários estão definidos em código na branch do MVP. O cadastro em um ambiente persistente, a conexão real com OpenAI e a criação dos chats nativos no Projeto ChatGPT ainda dependem de execução e verificação próprias.
