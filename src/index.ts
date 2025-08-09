import { normalizeStartup } from './core/context';
import { runLoop } from './core/strategy';
import { loadConfig } from './utils/config';
import { startChainWS } from './chain/wsClient';
import { wireEventBuffering, onBlockTick } from './core/loop';
import { eventBus } from './core/bus';

async function start() {
  wireEventBuffering();
  const wsUrl = process.env.WS_RPC;
  if (!wsUrl) {
    throw new Error('WS_RPC environment variable is not defined');
  }
  const stopWS = startChainWS({ wsUrl, shards: 2 });

  eventBus.on("block", async () => {
    try { await onBlockTick(); } catch (e) { eventBus.emit("log", { level: "error", msg: String(e) }); }
  });

  const raw = await loadConfig();
  const ctx = normalizeStartup(raw);
  await runLoop(ctx);
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
