import { createPublicClient, webSocket, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { eventBus } from '../core/bus';
import { shardAddresses } from './shard';
import reg from './registry.json' assert { type: 'json' };

const V2_SYNC = parseAbiItem('event Sync(uint112 reserve0, uint112 reserve1)');
const V2_SWAP = parseAbiItem('event Swap(address,address,uint256,uint256,uint256,uint256,address)');
const V3_SWAP = parseAbiItem('event Swap(address,address,int256,int256,uint160,uint128,int24)');

type WatchHandle = { unwatch: () => void };

function backoff(ms: number, cap = 15000) {
  return Math.min(ms * 2, cap);
}

export function startChainWS(opts: { wsUrl: string; shards?: number }): () => void {
  const shards = Math.max(1, opts.shards ?? 2);
  let delay = 500;
  let closed = false;
  let stops: (() => void)[] = [];

  const start = () => {
    const client = createPublicClient({ chain: mainnet, transport: webSocket(opts.wsUrl) });

    // Blocks
    const unwatchBlock = client.watchBlocks({
      onBlock: (b) => eventBus.emit('block', b.number),
      onError: (e) => eventBus.emit('ws:error', String(e))
    });

    // Sharded pool subscriptions
    const v2Shards = shardAddresses(reg.v2Pools, shards);
    const v3Shards = shardAddresses(reg.v3Pools, shards);

    const unwatches: (() => void)[] = [];

    v2Shards.forEach((addresses) => {
      const u1 = client.watchEvent({ address: addresses, event: V2_SYNC, onLogs: (logs) => eventBus.emit('v2:sync', logs) });
      const u2 = client.watchEvent({ address: addresses, event: V2_SWAP, onLogs: (logs) => eventBus.emit('v2:swap', logs) });
      unwatches.push(u1, u2);
    });

    v3Shards.forEach((addresses) => {
      const u = client.watchEvent({ address: addresses, event: V3_SWAP, onLogs: (logs) => eventBus.emit('v3:swap', logs) });
      unwatches.push(u);
    });

    const stop = () => { unwatchBlock(); unwatches.forEach((u) => u()); };
    stops.push(stop);

    client.transport.value?.on?.('close', () => {
      if (closed) return;
      stop();
      setTimeout(start, delay);
      delay = backoff(delay);
    });
  };

  start();

  return () => { closed = true; stops.splice(0).forEach((s) => s()); };
}
