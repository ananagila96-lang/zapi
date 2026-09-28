import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class Store {
  constructor(file = process.env.CENTRAL_DATA_FILE || './data/central-agentes.json') {
    this.file = file;
  }

  async read() {
    try {
      return JSON.parse(await readFile(this.file, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return { agents: [], tasks: [] };
    }
  }

  async write(data) {
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(data, null, 2));
  }

  async createAgent(agent) {
    const data = await this.read();
    if (data.agents.some((item) => item.id === agent.id)) throw new Error('agent_exists');
    data.agents.push(agent);
    await this.write(data);
    return agent;
  }

  async listAgents() {
    return (await this.read()).agents;
  }

  async getAgent(id) {
    return (await this.read()).agents.find((item) => item.id === id) || null;
  }

  async updateAgent(id, patch) {
    const data = await this.read();
    const index = data.agents.findIndex((item) => item.id === id);
    if (index < 0) return null;
    data.agents[index] = { ...data.agents[index], ...patch };
    await this.write(data);
    return data.agents[index];
  }

  async createTask(task) {
    const data = await this.read();
    data.tasks.push(task);
    await this.write(data);
    return task;
  }

  async updateTask(id, patch) {
    const data = await this.read();
    const index = data.tasks.findIndex((item) => item.id === id);
    if (index < 0) return null;
    data.tasks[index] = { ...data.tasks[index], ...patch };
    await this.write(data);
    return data.tasks[index];
  }

  async listTasks() {
    return (await this.read()).tasks;
  }
}
