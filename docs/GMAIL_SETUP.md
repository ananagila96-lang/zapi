# Autorizar Gmail para o backup do Zapi

O workflow usa SMTP seguro do Gmail. Não use a senha normal da conta.

## Pré-requisito
Ative a verificação em duas etapas da Conta Google do Gmail remetente e crie uma **senha de app** para o GitHub Actions, quando essa opção estiver disponível na conta.

## GitHub Actions Secrets
No repositório `ananagila96-lang/zapi`, abra **Settings → Secrets and variables → Actions → New repository secret** e cadastre:

- `BACKUP_SMTP_SERVER` = `smtp.gmail.com`
- `BACKUP_SMTP_PORT` = `465`
- `BACKUP_SMTP_USERNAME` = e-mail Gmail remetente
- `BACKUP_SMTP_PASSWORD` = senha de app criada no Google
- `BACKUP_EMAIL_FROM` = mesmo e-mail Gmail remetente

Não cole a senha de app em commits, issues, README ou chats.

Depois da configuração, execute manualmente o workflow **Enviar backup do projeto por e-mail** em Actions para validar o envio.
