import http from 'node:http';
import { Store } from './store.js';
import { Central } from './central.js';

const central = new Central(new Store());
const port = Number(process.env.CENTRAL_PORT || 8787);
const apiKey = process.env.CENTRAL_API_KEY;

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function authorized(req) {
  if (!apiKey) return false;
  return req.headers.authorization === `Bearer ${apiKey}`;
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/health') {
        return json(res, 200, {
          status: 'ok',
          openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
          apiProtected: Boolean(apiKey)
        });
      }

      if (!authorized(req)) return json(res, 401, { error: 'unauthorized' });

      if (req.method === 'GET' && req.url === '/agents') {
        return json(res, 200, await central.store.listAgents());
      }

      if (req.method === 'POST' && req.url === '/agents') {
        return json(res, 201, await central.hire(await body(req)));
      }

      if (req.method === 'GET' && req.url === '/tasks') {
        return json(res, 200, await central.store.listTasks());
      }

      const assign = req.url?.match(/^\/agents\/([^/]+)\/tasks$/);
      if (req.method === 'POST' && assign) {
        const payload = await body(req);
        return json(res, 202, await central.assign(decodeURIComponent(assign[1]), payload.instruction));
      }

      return json(res, 404, { error: 'not_found' });
    } catch (error) {
      const status = ['agent_not_found'].includes(error.message) ? 404 : 400;
      return json(res, status, { error: error.message });
    }
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  createServer().listen(port, () => console.log(`Central Flashinho HTTP :${port}`));
}
