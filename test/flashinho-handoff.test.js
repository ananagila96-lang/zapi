import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installer = path.join(repoRoot, 'scripts', 'install-flashinho-handoff.js');

async function makeTarget() {
  const target = await mkdtemp(path.join(os.tmpdir(), 'flashinho-handoff-'));
  await writeFile(
    path.join(target, 'package.json'),
    JSON.stringify({ name: 'fixture-project', version: '1.0.0', scripts: { test: 'node --test' } }, null, 2),
    'utf8',
  );
  return target;
}

test('instala protocolo de handoff sem destruir scripts existentes', async () => {
  const target = await makeTarget();
  await execFileAsync(process.execPath, [installer, '--target', target, '--project', 'Fixture', '--repo', 'owner/fixture', '--branch', 'main']);

  const state = await readFile(path.join(target, 'FLASHINHO_STATE.md'), 'utf8');
  const protocol = await readFile(path.join(target, 'FLASHINHO.md'), 'utf8');
  const decisions = await readFile(path.join(target, 'FLASHINHO_DECISIONS.md'), 'utf8');
  const handoffScript = await readFile(path.join(target, 'scripts', 'flashinho-handoff.js'), 'utf8');
  const pkg = JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8'));

  assert.match(state, /Nome: `Fixture`/);
  assert.match(state, /Repositório: `owner\/fixture`/);
  assert.match(protocol, /O chat não é a fonte da verdade/);
  assert.match(decisions, /Sem reinício implícito/);
  assert.match(handoffScript, /FLASHINHO HANDOFF v1/);
  assert.equal(pkg.scripts.test, 'node --test');
  assert.equal(pkg.scripts.handoff, 'node scripts/flashinho-handoff.js');

  const { stdout } = await execFileAsync(process.execPath, [path.join(target, 'scripts', 'flashinho-handoff.js')], { cwd: target });
  assert.match(stdout, /FLASHINHO HANDOFF v1/);
  assert.match(stdout, /ESTADO ATUAL/);
  assert.match(stdout, /DECISÕES VIGENTES/);
  assert.match(stdout, /COMANDO DE RETOMADA/);
});

test('não sobrescreve arquivos Flashinho existentes sem --force', async () => {
  const target = await makeTarget();
  const statePath = path.join(target, 'FLASHINHO_STATE.md');
  await writeFile(statePath, 'ESTADO PERSONALIZADO\n', 'utf8');

  await execFileAsync(process.execPath, [installer, '--target', target, '--project', 'Fixture', '--repo', 'owner/fixture']);

  assert.equal(await readFile(statePath, 'utf8'), 'ESTADO PERSONALIZADO\n');
});
