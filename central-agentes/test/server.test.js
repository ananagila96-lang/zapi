import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

process.env.CENTRAL_API_KEY = 'test-central-key';
const { createServer } = await import('../src/server.js');

async function withServer(fn) {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try { await fn(`http://127.0.0.1:${port}`); }
  finally { server.close(); await once(server, 'close'); }
}

test('health responde sem expor segredo', async () => {
  await withServer(async (url) => {
    const response = await fetch(`${url}/health`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.apiProtected, true);
    assert.equal('apiKey' in data, false);
  });
});

test('rotas operacionais exigem bearer token', async () => {
  await withServer(async (url) => {
    const denied = await fetch(`${url}/agents`);
    assert.equal(denied.status, 401);

    const allowed = await fetch(`${url}/agents`, {
      headers: { authorization: 'Bearer test-central-key' }
    });
    assert.equal(allowed.status, 200);
    assert.ok(Array.isArray(await allowed.json()));
  });
});
