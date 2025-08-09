import { normalizeStartup } from './core/context';
import { runLoop } from './core/strategy';
import { loadConfig } from './utils/config';

async function start() {
  const raw = await loadConfig();
  const ctx = normalizeStartup(raw);
  await runLoop(ctx);
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
