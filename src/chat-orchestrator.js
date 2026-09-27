const OPENAI_CONVERSATIONS_URL = 'https://api.openai.com/v1/conversations';

export class OpenAIConversationAdapter {
  constructor({ apiKey, fetchImpl = globalThis.fetch } = {}) {
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
  }

  async create({ name, prompt }) {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is required');
    if (!name?.trim() || !prompt?.trim()) throw new Error('name and prompt are required');

    const response = await this.fetchImpl(OPENAI_CONVERSATIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: { agent_name: name.slice(0, 64), source: 'zapi-orchestrator' },
        items: [{ type: 'message', role: 'user', content: prompt }],
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`OpenAI Conversations API failed (${response.status}): ${body?.error?.message || 'unknown error'}`);
    return { id: body.id, provider: 'openai-api', name };
  }
}

export class ChatGPTProjectAdapter {
  async create() {
    throw new Error('UNSUPPORTED: no documented public API currently creates a chat inside a ChatGPT Project');
  }
}

export async function createSpecialistChats({ specialists, adapter }) {
  if (!Array.isArray(specialists) || specialists.length === 0) throw new Error('specialists must be a non-empty array');
  if (!adapter?.create) throw new Error('adapter.create is required');

  const results = [];
  for (const specialist of specialists) {
    const name = specialist?.name?.trim();
    const prompt = specialist?.prompt?.trim();
    if (!name || !prompt) throw new Error('each specialist requires name and prompt');
    results.push(await adapter.create({ name, prompt }));
  }
  return results;
}
