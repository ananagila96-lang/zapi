import crypto from 'node:crypto';
import { runAgent } from './openai.js';

const cleanId = (value) => value.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');

export class Central {
  constructor(store) {
    this.store = store;
  }

  async hire({ name, role, mission, systemPrompt }) {
    if (!name || !role || !mission || !systemPrompt) throw new Error('invalid_agent');
    return this.store.createAgent({
      id: cleanId(name), name, role, mission, systemPrompt,
      conversationId: null,
      createdAt: new Date().toISOString()
    });
  }

  async assign(agentId, instruction) {
    const agent = await this.store.getAgent(agentId);
    if (!agent) throw new Error('agent_not_found');
    if (!instruction?.trim()) throw new Error('invalid_instruction');

    const task = await this.store.createTask({
      id: crypto.randomUUID(), agentId, instruction,
      status: process.env.OPENAI_API_KEY ? 'RUNNING' : 'BLOCKED',
      createdAt: new Date().toISOString(), result: null, evidence: null
    });

    if (!process.env.OPENAI_API_KEY) {
      return this.store.updateTask(task.id, {
        status: 'BLOCKED', evidence: 'OPENAI_API_KEY não configurada fora do GitHub.'
      });
    }

    try {
      const result = await runAgent({ agent, task });
      if (!agent.conversationId) await this.store.updateAgent(agentId, { conversationId: result.conversationId });
      return this.store.updateTask(task.id, {
        status: 'CONFIRMED', result: result.text,
        evidence: { responseId: result.responseId, conversationId: result.conversationId }
      });
    } catch (error) {
      return this.store.updateTask(task.id, { status: 'FAILED', evidence: error.message });
    }
  }
}
