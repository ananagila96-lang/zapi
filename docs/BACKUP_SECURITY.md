# Segurança

O workflow não deve conter credenciais literais. Autenticação do remetente fica em GitHub Actions Secrets. O pacote de backup exclui arquivos de ambiente, metadados Git, dependências instaladas e backups anteriores. Qualquer novo arquivo que possa conter credenciais deve ser avaliado antes de entrar no pacote.
