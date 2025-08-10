import { parseAbiItem, type Address, type Hex } from "viem";
import { mkWsClient } from "./providers";
import { eventBus } from "../core/bus";
import { loadRegistry } from "./loadRegistry";
import { backfillLogs } from "./backfill";

const reg = loadRegistry(process.env.CHAIN || "mainnet");
const V2_SYNC = parseAbiItem("event Sync(uint112 reserve0, uint112 reserve1)");
const V2_SWAP = parseAbiItem("event Swap(address,address,uint256,uint256,uint256,uint256,address)");
const V3_SWAP = parseAbiItem("event Swap(address,address,int256,int256,uint160,uint128,int24)");

const BACKFILL_BLOCKS = Number(process.env.BACKFILL_BLOCKS || 6);

export function startChainWS(): () => void {
  let wsIndex = 0;
  let stopFns: (() => void)[] = [];
  let lastBlock: bigint = 0n;
  let stopped = false;

  const v2Pairs = [
    ...(reg.uniswapV2?.pairs.map((p: any) => p.pair) || []),
    ...(reg.sushiV2?.pairs.map((p: any) => p.pair) || [])
  ] as Address[];
  const v3Pools = (reg.uniswapV3?.pools.map((p: any) => p.pool) || []) as Address[];

  const start = () => {
    const client = mkWsClient(wsIndex++);

    const unwatchBlocks = client.watchBlocks({
      onBlock: (b) => {
        lastBlock = b.number;
        eventBus.emit("block", b.number);
      },
      onError: (e) => eventBus.emit("ws:error", String(e))
    });

    stopFns.push(unwatchBlocks);

    const u1 = v2Pairs.length ? client.watchEvent({ address: v2Pairs, event: V2_SYNC, onLogs: (logs) => eventBus.emit("v2:sync", logs) }) : () => {};
    const u2 = v2Pairs.length ? client.watchEvent({ address: v2Pairs, event: V2_SWAP, onLogs: (logs) => eventBus.emit("v2:swap", logs) }) : () => {};
    const u3 = v3Pools.length ? client.watchEvent({ address: v3Pools, event: V3_SWAP, onLogs: (logs) => eventBus.emit("v3:swap", logs) }) : () => {};

    stopFns.push(u1, u2, u3);

    client.transport.value?.on?.("close", async () => {
      if (stopped) return;
      stopFns.splice(0).forEach((s) => s());

      // Backfill missed logs before resubscribing
      if (lastBlock > 0n && BACKFILL_BLOCKS > 0) {
        try {
          const from = lastBlock - BigInt(BACKFILL_BLOCKS);
          const to = lastBlock;
          const topicsV2 = [[V2_SYNC.topic, V2_SWAP.topic].filter(Boolean) as Hex[]];
          const topicsV3 = [[V3_SWAP.topic].filter(Boolean) as Hex[]];

          const v2 = await backfillLogs({ fromBlock: from, toBlock: to, addresses: v2Pairs, topics: topicsV2, httpIndex: wsIndex });
          const v3 = await backfillLogs({ fromBlock: from, toBlock: to, addresses: v3Pools, topics: topicsV3, httpIndex: wsIndex });

          if (v2.length) eventBus.emit("v2:sync", v2.filter((l) => l.topics[0] === V2_SYNC.topic));
          if (v2.length) eventBus.emit("v2:swap", v2.filter((l) => l.topics[0] === V2_SWAP.topic));
          if (v3.length) eventBus.emit("v3:swap", v3);
        } catch (e) {
          eventBus.emit("log", { level: "warn", msg: `backfill failed: ${String(e)}` });
        }
      }

      setTimeout(start, 800); // jitter/retry
    });
  };

  start();

  return () => {
    stopped = true;
    stopFns.splice(0).forEach((s) => s());
  };
}
