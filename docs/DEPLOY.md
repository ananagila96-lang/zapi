# Instalar o piloto

## Local

Node.js 24, `npm ci`, `npm run setup`, `npm start`. O `.env` permanece no computador. O serviço fica disponível somente em http://127.0.0.1:3000 por padrão.

## VPS com Docker Compose

Requisitos: Linux com Docker/Compose instalados, disco persistente e acesso administrativo. Para teste de poucos números, começar com 2 GB de RAM é uma hipótese de dimensionamento; medir uso antes de aumentar conexões.

```bash
git clone https://github.com/ananagila96-lang/zapi.git
cd zapi
cp .env.example .env
chmod 600 .env
```

Preencha `API_KEY` com uma chave aleatória longa, usando um gerador confiável ou `openssl rand -hex 32`. Nunca deixe vazia. Preencha as credenciais Meta somente se usar esse conector.

```bash
docker compose up -d --build api
docker compose logs --tail=50 api
```

A porta 3000 é publicada apenas no loopback do servidor. Para acesso local via túnel:

```bash
ssh -L 3000:127.0.0.1:3000 usuario@IP_DO_SERVIDOR
```

Abra http://127.0.0.1:3000 no seu computador. Para QR em uso próprio, esse túnel evita expor o painel.

## HTTPS e webhook Meta

Aponte um subdomínio para o IP do servidor. No `.env`, preencha `DOMAIN=zap.seudominio.com`. Libere portas 80/443 e execute:

```bash
docker compose --profile https up -d --build
```

Caddy solicitará o certificado. A emissão depende de DNS, portas e disponibilidade da autoridade certificadora. O callback Meta será `https://zap.seudominio.com/webhooks/meta`.

O painel público contém apenas a interface; dados, QR e operações exigem a API_KEY. Ainda assim, em implantação pública recomenda-se restringir `/api/*` a VPN/IP administrativo no proxy. Deixe `/webhooks/meta` acessível à Meta com validação de assinatura ativa. Não exponha este piloto como serviço de revenda.

## Dados e backup

Os dados persistem no volume `zap_data`. Não execute `docker compose down -v`, pois isso apaga os volumes. Backups devem ser feitos com o serviço parado para manter sessões e SQLite consistentes:

```bash
docker compose stop api
mkdir -p backups
chmod 700 backups
docker compose cp api:/app/data ./backups/data
chmod -R go-rwx backups
```

Guarde o backup em local protegido/criptografado fora do servidor e reinicie com `docker compose start api`. Para restaurar, pare o serviço, preserve uma cópia do estado atual, copie o diretório de volta e ajuste o proprietário para o usuário `node` do contêiner. Teste restauração antes de depender do backup em operação.

## Atualizações

```bash
git pull --ff-only
docker compose up -d --build api
```

Faça backup antes de atualizar. Reabra o painel e reconecte cada instância. Monitore espaço do volume, RAM, reinícios e status das conexões. A configuração Docker foi preparada, mas precisa ser executada e validada no servidor alvo.
