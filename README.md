# Minha Zap API — v0.2.0

Piloto independente de integração WhatsApp: QR Code não oficial e conector Meta Cloud API. Sem vínculo com a Z-API. Código desenvolvido para testes de uso próprio, **não pronto para revenda ou operação crítica**.

## Incluído

- Painel com cadastro e seleção de conexões (limite inicial: cinco).
- QR Code pelo Baileys ou credenciais da Meta por número.
- Envio individual de texto; histórico SQLite persistente, separado por conexão.
- Chave administrativa, limitação de envio por conexão e idempotência persistente.
- Webhook Meta com verificação GET e assinatura HMAC-SHA256 no POST.
- Recebimento e status de entrega/leitura da Meta no histórico.
- Sessões QR persistentes e tentativas limitadas de reconexão.
- Instalação local, Docker Compose, proxy HTTPS opcional e testes no GitHub Actions.

## Começar no Windows

Instale Git e Node.js 24. No PowerShell:

```powershell
git clone https://github.com/ananagila96-lang/zapi.git
cd zapi
npm ci
npm run setup
notepad .env
npm start
```

O setup cria `.env` com uma chave aleatória, sem sobrescrever configurações existentes. Copie o valor de `API_KEY` localmente e abra **http://127.0.0.1:3000**. Informe a chave no painel. Selecione `principal`, clique em Conectar e leia o QR pelo WhatsApp → Aparelhos conectados. Use um número de teste.

`npm test` executa os testes automatizados. Nenhum teste envia mensagens reais.

**Atualização da v0.1.0:** a sessão antiga era `data/session`; a nova usa `data/sessions/principal`. Com o processo parado, mova a pasta antiga para a nova se precisar reaproveitar o pareamento. Troque `SESSION_DIR` por `DATA_DIR=./data` no `.env`. As rotas da API mudaram nesta versão.

## Meta oficial

O conector está implementado, mas só funciona depois do cadastro e das credenciais do titular na Meta. Siga [docs/META.md](docs/META.md). Não envie senhas, tokens, sessões ou QR Codes para o GitHub.

## API

Todas as rotas `/api/*` exigem `Authorization: Bearer SUA_API_KEY`. A chave é administrativa e dá acesso a todos os números — não entregue a clientes.

| Método | Rota | Função |
|---|---|---|
| GET | `/health` | Servidor ativo, sem dados sensíveis |
| GET | `/api/instances` | Listar conexões |
| POST | `/api/instances` | Criar: `{ "id": "atendimento", "provider": "qr" }` |
| GET | `/api/instances/atendimento/status` | Estado e QR |
| POST | `/api/instances/atendimento/connect` | Iniciar QR ou verificar credenciais Meta |
| GET | `/api/instances/atendimento/messages` | Histórico recente |
| POST | `/api/instances/atendimento/send` | Enviar texto |
| GET/POST | `/webhooks/meta` | Verificação/eventos Meta, protegidos por segredo e assinatura |

Para criar uma conexão Meta, use `provider: "meta"` e `phoneId` com o ID fornecido pela Meta. Nesta versão todas usam o token do mesmo titular configurado no servidor.

Envio: corpo `{ "phone": "5561999999999", "text": "Olá" }`, `Content-Type: application/json` e cabeçalho `Idempotency-Key` único (8–100 letras, dígitos, `_` ou `-`). Repetir a mesma chave e o mesmo corpo devolve o resultado anterior sem reenviar. Uma operação incerta fica bloqueada nessa chave: confira a conversa antes de tentar outra. O painel mantém a chave de uma tentativa falha em memória; recarregar a página perde essa associação.

Resposta `accepted` não prova entrega. Status posteriores da Meta aparecem quando o webhook chega; o conector QR ainda não acompanha confirmações de entrega/leitura. Não há fila durável de reenvios.

## Servidor / GitHub

GitHub guarda o código. **GitHub Pages não executa este servidor.** Veja [docs/DEPLOY.md](docs/DEPLOY.md) para Docker e HTTPS. Para funcionar 24h é necessário servidor/computador ligado e disco persistente.

## Proteção e limites

- `.env`, `data/` e `node_modules/` são excluídos do Git e do contexto Docker.
- Padrão local: `127.0.0.1`. Publicação exige HTTPS e proteção do acesso administrativo.
- Histórico mantido por 30 dias (`RETENTION_DAYS`); limpeza ao iniciar e diariamente. Metadados de idempotência são mantidos sem expiração nesta versão para evitar reenvios após reinício.
- Sessões e SQLite ficam no disco **sem criptografia da aplicação**. Proteja servidor, disco e backups. Não compartilhe o volume de dados.
- QR é não oficial, sujeito a bloqueios e mudanças no WhatsApp. Baileys fixado em `7.0.0-rc14`, pré-lançamento. Sessões em arquivos destinam-se ao piloto.
- Sem contas de clientes, cobrança, isolamento por usuário, templates Meta, mídia, IA, campanhas ou garantia de disponibilidade.
- O limite configurável não garante capacidade: medir consumo real antes de aumentar.
- Após reiniciar, clique em Conectar para cada conexão. Para `logged_out`, pare o serviço e remova **somente a pasta da sessão específica** antes de parear novamente. Isso não remove o histórico.

## Verificação realizada

Testes automatizados de autenticação, assinatura Meta, validação, idempotência, separação de histórico e persistência após reabertura do SQLite; montagem de envio Meta com transporte simulado. Dependências instaladas e importação do Baileys verificada.

**Ainda pendente:** pareamento real, troca de mensagens com número real, credenciais/webhook Meta reais, carga com cinco números e execução Docker num servidor. Não foi contratado nem publicado servidor.
