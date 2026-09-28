import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflowUrl = new URL('../../.github/workflows/email-project-backup.yml', import.meta.url);

test('workflow de backup protege segredos e envia aos destinatários oficiais', async () => {
  const workflow = await readFile(workflowUrl, 'utf8');

  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /strontika@gmail\.com,ananagilafs@gmail\.com/);
  assert.match(workflow, /secrets\.BACKUP_SMTP_PASSWORD/);
  assert.match(workflow, /secrets\.BACKUP_SMTP_USERNAME/);
  assert.match(workflow, /upload-artifact@v4/);
  assert.match(workflow, /ATUALIZACAO\.txt/);
  assert.match(workflow, /'\.env'/);
  assert.match(workflow, /'\*\*\/\.env'/);
  assert.doesNotMatch(workflow, /password:\s*[^$\n]/);
});
