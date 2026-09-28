import { readFile } from 'node:fs/promises';
import { Store } from './store.js';
import { Central } from './central.js';

const definitions = JSON.parse(await readFile(new URL('../agents.json', import.meta.url), 'utf8'));
const central = new Central(new Store());

for (const definition of definitions) {
  const id = definition.name.toLowerCase();
  if (await central.store.getAgent(id)) {
    console.log(`EXISTS ${id}`);
    continue;
  }
  await central.hire(definition);
  console.log(`CREATED ${id}`);
}
