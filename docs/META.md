# Ativar o conector oficial da Meta

## Dados necessários do titular

1. Portfólio empresarial, aplicativo com WhatsApp e conta WhatsApp Business.
2. Número de teste da Meta para validar antes de registrar um número real.
3. Phone Number ID, token com permissões para mensagens e App Secret.
4. Versão Graph API suportada indicada no painel/documentação do aplicativo.
5. Endereço HTTPS público apontando para este servidor.

As exigências de verificação, revisão e elegibilidade dependem da conta e do uso. Este código não faz cadastro, registro de número ou revisão automaticamente e não substitui essas etapas.

## Configurar localmente no servidor

Preencha no `.env`:

```dotenv
META_ACCESS_TOKEN=token_da_meta
META_GRAPH_VERSION=versao_do_seu_aplicativo
META_APP_SECRET=segredo_do_aplicativo
META_VERIFY_TOKEN=segredo_aleatorio_escolhido_por_voce
```

A versão precisa ter formato `vN.N`; não use o texto de exemplo. Use um token de teste inicialmente e depois configure a credencial adequada com permissões e ciclo de renovação. Não publique valores reais.

Reinicie o servidor. No painel Minha Zap API, cadastre uma conexão do tipo Meta com o Phone Number ID e clique em Conectar / verificar credenciais. Estado `connected` comprova a consulta de credenciais, **não** a assinatura do webhook ou a disponibilidade de envio do número.

## Receber mensagens

No painel Meta, configure callback `https://SEU_DOMINIO/webhooks/meta` e o mesmo valor de `META_VERIFY_TOKEN`. Assine o campo `messages` e a conta correspondente conforme a configuração do aplicativo.

O servidor verifica o desafio GET e a assinatura `x-hub-signature-256` de cada POST com `META_APP_SECRET`. Eventos de Phone Number IDs não cadastrados são ignorados. Reentregas com o mesmo ID de mensagem são deduplicadas no SQLite.

Envie uma mensagem ao número de teste pelo telefone autorizado. Confirme o recebimento no histórico; depois responda pelo painel. Texto livre depende da janela de atendimento da Meta. Para iniciar conversas fora dessa janela, normalmente são necessários modelos aprovados, ainda não implementados aqui. Custos, limites e políticas seguem a conta Meta.

## Para cadastrar empresas clientes

Este piloto usa um único token administrativo Meta no servidor. Revenda exige outra etapa: credenciais por empresa, acesso separado por usuário, onboarding/Embedded Signup, avaliação das permissões e revisão exigidas, medição de uso e cobrança. Não entregar a chave administrativa aos clientes.

Referências oficiais consultadas:
- https://www.postman.com/meta/whatsapp-business-platform/folder/o48mro7/messages
- https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/
- https://github.com/fbsamples/whatsapp-api-examples
