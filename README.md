# Minha Zap API — v0.1.0

Protótipo independente, sem vínculo com a Z-API ou a Meta. API e painel local para **um número**, usando conexão não oficial por QR Code com Baileys. Não é uma plataforma comercial pronta.

## O que já existe

- Painel para conectar por QR e consultar status.
- Envio individual de texto, com validação e intervalo mínimo de 3 segundos.
- Últimas 100 mensagens recebidas em memória (apagadas ao reiniciar).
- Autenticação Bearer em todas as rotas com dados, incluindo QR.
- Sessão persistida localmente; até 5 tentativas de reconexão com espera progressiva.
- Testes de autenticação, validação, estado da conexão e limitação de envio.

## Rodar no Windows / PowerShell

Instale Node.js 24 e Git. Depois:

```powershell
git clone https://github.com/ananagila96-lang/zapi.git
cd zapi
npm ci
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
notepad .env
```

Cole o valor gerado depois de `API_KEY=`. Não compartilhe essa chave. Salve e rode:

```powershell
npm test
npm start
```

Abra http://127.0.0.1:3000, informe a chave, clique em Entrar e em Conectar WhatsApp. No celular, abra Aparelhos conectados e leia o QR. Comece com um número de teste.

O painel mantém a chave só em memória, sem armazenamento no navegador. Após reiniciar o servidor, clique novamente em Conectar para reutilizar a sessão salva. Se o estado for `logged_out`, pare o servidor e remova **somente** `data/session` antes de conectar novamente (isso exige novo pareamento).

## API

Todas as rotas `/api/*` exigem `Authorization: Bearer SUA_CHAVE`.

| Método | Rota | Função |
|---|---|---|
| GET | `/health` | Servidor ativo, sem dados do WhatsApp |
| GET | `/api/status` | Estado e QR atual |
| POST | `/api/connect` | Iniciar conexão |
| GET | `/api/messages` | Últimas mensagens da sessão do servidor |
| POST | `/api/send` | JSON com `phone` (DDI + número, só dígitos) e `text` |

O retorno do envio confirma aceitação pelo conector, não entrega/leitura pelo destinatário. Não há reenvio automático: em caso de timeout, verifique a conversa antes de repetir.

## GitHub e hospedagem

GitHub guarda e versiona o código. **GitHub Pages não executa este servidor Node.js.** Rodar 24h exige computador ligado ou servidor com disco persistente. O padrão escuta só em 127.0.0.1. Não exponha diretamente na internet; antes disso configure HTTPS, proxy e restrições de acesso.

Nunca envie `.env`, `data/` ou QR Codes ao GitHub. O repositório é público; credenciais e sessões ficam fora dele. Faça backup protegido da sessão apenas em ambiente confiável. A sessão equivale a acesso à conta.

## E a Meta?

Esta versão usa **WhatsApp Web não oficial**, não Cloud API. Não precisa de aplicativo Meta para o pareamento por QR, mas isso não significa aprovação da Meta: existe risco de bloqueio e quebra da integração.

Para uma versão oficial, implementar outro conector com:

1. Portfólio empresarial Meta, aplicativo com WhatsApp e conta WhatsApp Business.
2. Número de teste fornecido pela Meta; depois registro do número real.
3. Credenciais com permissões apropriadas, mantidas apenas no servidor.
4. Webhook HTTPS com verificação e validação de assinatura.
5. Envio pela Cloud API, tratamento de status, modelos e regras de mensagens.
6. Para cadastrar empresas clientes, avaliar Embedded Signup, revisão de aplicativo e permissões exigidas pela Meta.

O conector oficial **ainda não está implementado**. Referências: https://developers.facebook.com/docs/whatsapp/cloud-api/ e https://github.com/fbsamples/whatsapp-api-examples .

## Limitações / próxima etapa

- Um número e uma chave administrativa; sem isolamento entre clientes.
- Sem cobrança, IA, webhooks externos, mídias ou histórico durável.
- `useMultiFileAuthState` é utilizado apenas como solução de protótipo; produção exige armazenamento de credenciais adequado, controle de concorrência e recuperação de falhas.
- Baileys está fixado em 7.0.0-rc14 (pré-lançamento); validar compatibilidade com conta real antes de uso operacional.
- Testes locais usam conector simulado: pareamento real, recebimento, envio e reconexão após reinício ainda precisam ser verificados com o titular do número.
- Não usar campanhas ou disparos em massa neste protótipo.
