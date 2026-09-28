import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Store } from '../src/store.js';
import { Central } from '../src/central.js';

test('contrata funcionário e persiste definição', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'central-'));
  const central = new Central(new Store(path.join(dir, 'db.json')));
  const agent = await central.hire({
    name: 'Marketing', role: 'Marketing', mission: 'Crescer produto', systemPrompt: 'Você cuida de marketing.'
  });
  assert.equal(agent.id, 'marketing');
  assert.equal((await central.store.listAgents()).length, 1);
});

test('tarefa fica bloqueada sem OPENAI_API_KEY', async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const dir = await mkdtemp(path.join(os.tmpdir(), 'central-'));
  const central = new Central(new Store(path.join(dir, 'db.json')));
  await central.hire({ name: 'Dev', role: 'Dev', mission: 'Código', systemPrompt: 'Desenvolva.' });
  const task = await central.assign('dev', 'Faça um teste');
  assert.equal(task.status, 'BLOCKED');
  if (previous) process.env.OPENAI_API_KEY = previous;
});
