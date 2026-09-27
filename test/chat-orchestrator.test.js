import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatGPTProjectAdapter, OpenAIConversationAdapter, createSpecialistChats } from '../src/chat-orchestrator.js';

test('creates one isolated conversation per specialist and preserves prompts', async () => {
  const calls = [];
  const adapter = { async create(input) { calls.push(input); return { id: `conv_${calls.length}`, ...input }; } };
  const specialists = [
    { name: 'Marketing', prompt: 'Você é o especialista de Marketing.' },
    { name: 'QA', prompt: 'Você é o especialista de QA.' },
  ];

  const result = await createSpecialistChats({ specialists, adapter });
  assert.equal(result.length, 2);
  assert.deepEqual(calls, specialists);
});

test('OpenAI adapter sends initial prompt to Conversations API', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, async json() { return { id: 'conv_123' }; } };
  };
  const adapter = new OpenAIConversationAdapter({ apiKey: 'test-only', fetchImpl });
  const result = await adapter.create({ name: 'Marketing', prompt: 'PROMPT-MKT' });
  const body = JSON.parse(request.options.body);

  assert.equal(request.url, 'https://api.openai.com/v1/conversations');
  assert.equal(request.options.method, 'POST');
  assert.equal(body.metadata.agent_name, 'Marketing');
  assert.equal(body.items[0].content, 'PROMPT-MKT');
  assert.equal(result.id, 'conv_123');
});

test('ChatGPT Project adapter fails explicitly instead of pretending it created a project chat', async () => {
  const adapter = new ChatGPTProjectAdapter();
  await assert.rejects(() => adapter.create({ name: 'Marketing', prompt: 'x' }), /UNSUPPORTED/);
});
