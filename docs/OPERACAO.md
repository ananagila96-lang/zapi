# Operação do piloto

Este arquivo separa estado confirmado, pendências e critérios para promover o piloto.

## Estado confirmado

- Código-fonte e testes automatizados ficam neste repositório.
- API administrativa exige `API_KEY` com pelo menos 32 caracteres.
- Há adaptadores QR (Baileys) e Meta Cloud API.
- Histórico e idempotência usam SQLite persistente.
- GitHub Actions executa a suíte automatizada a cada alteração coberta pelo workflow.

## Não considerar concluído sem evidência

Os itens abaixo exigem teste real e não podem ser inferidos apenas de testes simulados:

- pareamento QR com um número de teste;
- envio e recebimento de mensagem real;
- reconexão após reinício;
- credenciais e webhook Meta reais;
- execução Docker em host com disco persistente;
- carga com múltiplas conexões.

## Gate de validação real

1. Subir a aplicação em ambiente controlado com `.env` fora do Git.
2. Confirmar `GET /health`.
3. Parear somente um número de teste via QR.
4. Confirmar estado `connected`.
5. Enviar uma mensagem para outro número controlado e conferir o recebimento antes de repetir qualquer envio incerto.
6. Confirmar entrada no histórico da instância correta.
7. Reiniciar o processo e validar recuperação da sessão e persistência do histórico.
8. Só depois ampliar para mais conexões ou Meta.

## Segurança operacional

Nunca versionar API keys, tokens Meta, `APP_SECRET`, sessões do WhatsApp, QR Codes ou banco de dados real. O QR/Baileys é um conector não oficial e deve permanecer restrito ao piloto até que os riscos operacionais sejam aceitos explicitamente.

## Critério de promoção

O piloto só pode ser chamado de validado quando os testes automatizados estiverem verdes **e** o gate de validação real acima tiver evidências registradas sem segredos.