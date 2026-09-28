# Backup automático por e-mail

Após cada `push` integrado à `main`, o workflow `.github/workflows/email-project-backup.yml` cria um ZIP do projeto, salva-o como artifact por 30 dias e tenta enviá-lo para:

- strontika@gmail.com
- ananagilafs@gmail.com

## Gmail como remetente

Configuração recomendada para Gmail SMTP:

- `BACKUP_SMTP_SERVER`: `smtp.gmail.com`
- `BACKUP_SMTP_PORT`: `465`
- `BACKUP_SMTP_USERNAME`: endereço Gmail remetente
- `BACKUP_SMTP_PASSWORD`: senha de app do Google (não usar a senha normal da conta)
- `BACKUP_EMAIL_FROM`: endereço Gmail remetente

Todos esses valores devem ser cadastrados em **GitHub Actions Secrets**. Nunca versionar credenciais.

## Segurança do ZIP

O workflow exclui `.git`, `node_modules`, arquivos `.env` e ZIPs anteriores.

## Estado de validação

A existência deste workflow não comprova entrega de e-mail. O teste real só pode ser marcado como PASSOU após os secrets serem configurados e ambos os destinatários confirmarem recebimento do ZIP.
