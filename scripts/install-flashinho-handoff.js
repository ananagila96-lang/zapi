import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(here, '../templates/flashinho');

function parseArgs(argv) {
  const args = { target: process.cwd(), project: null, repo: null, branch: 'main', force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--force') args.force = true;
    else if (value === '--target') args.target = argv[++i];
    else if (value === '--project') args.project = argv[++i];
    else if (value === '--repo') args.repo = argv[++i];
    else if (value === '--branch') args.branch = argv[++i];
    else if (value === '--help' || value === '-h') {
      console.log('Uso: node scripts/install-flashinho-handoff.js --target <pasta> --project <nome> --repo <owner/repo> [--branch main] [--force]');
      process.exit(0);
    } else {
      throw new Error(`Argumento desconhecido: ${value}`);
    }
  }
  return args;
}

async function exists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function replaceVars(text, config) {
  return text
    .replaceAll('{{PROJECT_NAME}}', config.project)
    .replaceAll('{{REPOSITORY}}', config.repo)
    .replaceAll('{{DEFAULT_BRANCH}}', config.branch)
    .replaceAll('{{DATE}}', new Date().toISOString().slice(0, 10));
}

async function writeFromTemplate(relativePath, config) {
  const source = path.join(templateRoot, relativePath);
  const destination = path.join(config.target, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });

  if ((await exists(destination)) && !config.force) {
    console.log(`[skip] ${relativePath} já existe`);
    return 'skipped';
  }

  if (relativePath.endsWith('.md')) {
    const text = await readFile(source, 'utf8');
    await writeFile(destination, replaceVars(text, config), 'utf8');
  } else {
    await copyFile(source, destination);
  }
  console.log(`[ok] ${relativePath}`);
  return 'written';
}

async function addPackageScript(config) {
  const packagePath = path.join(config.target, 'package.json');
  if (!(await exists(packagePath))) {
    console.log('[info] package.json não encontrado; use: node scripts/flashinho-handoff.js');
    return;
  }

  const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
  pkg.scripts ??= {};
  if (pkg.scripts.handoff && !config.force) {
    console.log('[skip] package.json já possui scripts.handoff');
    return;
  }
  pkg.scripts.handoff = 'node scripts/flashinho-handoff.js';
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  console.log('[ok] package.json -> npm run handoff');
}

const args = parseArgs(process.argv.slice(2));
args.target = path.resolve(args.target);
args.project ||= path.basename(args.target);
args.repo ||= 'PREENCHER_OWNER/PREENCHER_REPO';

await mkdir(args.target, { recursive: true });
for (const file of ['FLASHINHO.md', 'FLASHINHO_STATE.md', 'FLASHINHO_DECISIONS.md', 'scripts/flashinho-handoff.js']) {
  await writeFromTemplate(file, args);
}
await mkdir(path.join(args.target, 'checkpoints'), { recursive: true });
await writeFile(path.join(args.target, 'checkpoints', '.gitkeep'), '', { flag: args.force ? 'w' : 'a' });
await addPackageScript(args);

console.log('\nFlashinho Handoff instalado. Próximo passo: revise FLASHINHO_STATE.md e execute npm run handoff (ou node scripts/flashinho-handoff.js).');
