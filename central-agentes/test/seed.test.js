import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';

const exec = promisify(execFile);

test('cadastra Byte, Plug, Crash e Hype uma só vez', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'central-seed-'));
  const file = path.join(dir, 'agents.json');
  const env = { ...process.env, CENTRAL_DATA_FILE: file };
  const script = new URL('../src/seed.js', import.meta.url).pathname;

  await exec(process.execPath, [script], { env });
  await exec(process.execPath, [script], { env });
  const data = JSON.parse(await readFile(file, 'utf8'));

  assert.deepEqual(data.agents.map(({ id }) => id), ['byte', 'plug', 'crash', 'hype']);
  assert.ok(data.agents.every((agent) => agent.role && agent.mission && agent.systemPrompt && agent.conversationId === null));
});
