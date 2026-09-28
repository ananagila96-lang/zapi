const BASE_URL = 'https://api.openai.com/v1';

async function request(path, body) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('missing_openai_api_key');

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`openai_${response.status}:${data?.error?.message || 'request_failed'}`);
  return data;
}

export async function createConversation() {
  return request('/conversations', {});
}

export async function runAgent({ agent, task }) {
  let conversationId = agent.conversationId;
  if (!conversationId) conversationId = (await createConversation()).id;

  const response = await request('/responses', {
    model: process.env.OPENAI_MODEL || 'gpt-5.6',
    conversation: conversationId,
    instructions: agent.systemPrompt,
    input: task.instruction
  });

  const text = (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .join('\n');

  return { conversationId, responseId: response.id, text };
}
