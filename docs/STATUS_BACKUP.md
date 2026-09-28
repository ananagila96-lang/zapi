# Estado operacional — Backup por e-mail

🔵 DECISÃO VIGENTE: após atualização integrada à `main`, gerar ZIP do projeto e tentar enviar para `strontika@gmail.com` e `ananagilafs@gmail.com`.

✅ IMPLEMENTADO: workflow, artifact por 30 dias, relatório `ATUALIZACAO.txt`, exclusão de `.env`, `.git`, `node_modules` e ZIPs anteriores.

⚠️ NÃO TESTADO: envio SMTP real e recebimento pelos dois destinatários.

⛔ BLOQUEADO: configuração dos GitHub Actions Secrets do Gmail/remetente. A conexão GitHub disponível ao Coordenador não expõe nem permite gravar repository secrets.

Próximo passo: a proprietária configura os cinco secrets documentados em `docs/BACKUP_EMAIL.md`; em seguida o workflow pode ser disparado manualmente para teste real.
