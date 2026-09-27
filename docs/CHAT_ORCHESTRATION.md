# Ponte de orquestração de chats

## Objetivo
Permitir que o Flashinho Coordenador envie uma lista de especialistas (`nome + prompt`) e o sistema crie uma conversa isolada para cada um, já inicializada com seu prompt.

Fluxo desejado:

`Proprietária -> Flashinho Coordenador -> Orquestrador -> N conversas -> N prompts`

## Confirmado
A OpenAI Conversations API documenta `POST /v1/conversations`, aceita itens iniciais e devolve um identificador durável da conversa. O adaptador `OpenAIConversationAdapter` implementa esse caminho.

## Limite atual
Não foi encontrado na documentação pública oficial um endpoint que permita a uma aplicação externa criar um novo chat dentro de um ChatGPT Project da conta pessoal e fazê-lo aparecer na interface do ChatGPT. Por isso `ChatGPTProjectAdapter` falha explicitamente com `UNSUPPORTED`.

Isso é intencional: uma Conversation da API não deve ser apresentada como se fosse um chat criado dentro do produto ChatGPT.

## Arquitetura
`createSpecialistChats()` não conhece o provedor. Ele recebe um adaptador com `create({ name, prompt })`.

Hoje:
- `OpenAIConversationAdapter`: suportado pela API e implementado.
- `ChatGPTProjectAdapter`: bloqueado até existir mecanismo oficial/documentado.

Se a OpenAI disponibilizar criação programática de chats em Projects, somente o adaptador precisa ser implementado; o coordenador e os contratos de especialistas permanecem iguais.

## Segurança
Nunca grave `OPENAI_API_KEY` no repositório. A chave deve entrar somente por secret/environment variable no ambiente de execução.

## Evidência
Os testes automatizados validam:
1. uma conversa por especialista;
2. preservação de nome e prompt;
3. payload da Conversations API;
4. falha explícita do adaptador de ChatGPT Projects enquanto não suportado.

A integração real com OpenAI exige credencial do titular e não é executada no GitHub sem secret configurado.
