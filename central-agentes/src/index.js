import { Store } from './store.js';
import { Central } from './central.js';

const central = new Central(new Store());
const [command, ...args] = process.argv.slice(2);

try {
  if (command === 'hire') {
    const [name, role, mission, systemPrompt] = args;
    console.log(JSON.stringify(await central.hire({ name, role, mission, systemPrompt }), null, 2));
  } else if (command === 'agents') {
    console.log(JSON.stringify(await central.store.listAgents(), null, 2));
  } else if (command === 'assign') {
    const [agentId, ...instruction] = args;
    console.log(JSON.stringify(await central.assign(agentId, instruction.join(' ')), null, 2));
  } else if (command === 'tasks') {
    console.log(JSON.stringify(await central.store.listTasks(), null, 2));
  } else {
    console.log('Central Flashinho');
    console.log('Comandos: hire <nome> <cargo> <missão> <prompt> | agents | assign <id> <tarefa> | tasks');
  }
} catch (error) {
  console.error(JSON.stringify({ status: 'FAILED', error: error.message }));
  process.exitCode = 1;
}
