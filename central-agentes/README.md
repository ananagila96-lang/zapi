# Central Flashinho — MVP

Central própria de agentes, separada do runtime do WhatsApp.

## Objetivo

Permitir o fluxo:

`Proprietária -> Flashinho Coordenador -> Central -> funcionários especializados -> relatório ao Coordenador`

Cada funcionário terá identidade, instruções, conversa persistente e tarefas próprias. A Central usa a API da OpenAI; ela não tenta criar chats nativos na barra lateral do ChatGPT.

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

🟡 MVP em implementação. A conexão real com OpenAI depende de `OPENAI_API_KEY` configurada fora do GitHub.
