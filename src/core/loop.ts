import { eventBus } from "./bus";
import { markTouched, drainTouched } from "../chain/state";
import { batchSnapshot } from "../chain/multicall";
// import { computeCandidates, simulate } from "../core/strategyParts"; // your pure math pieces
// import type { StrategyCtx } from "./context";

export function wireEventBuffering() {
  eventBus.on("v2:sync", (logs: any[]) => {
    const addrs = logs.map((l) => l.address);
    markTouched(addrs);
  });
  eventBus.on("v2:swap", (logs: any[]) => markTouched(logs.map((l) => l.address)));
  eventBus.on("v3:swap", (logs: any[]) => markTouched(logs.map((l) => l.address)));
}

export async function onBlockTick(/*ctx: StrategyCtx*/) {
  const touched = drainTouched();
  await batchSnapshot(touched);
  // const candidates = computeCandidates(ctx, /* read state */);
  // const winners = candidates.filter(...); // slippage & gas
  // winners.forEach((w) => eventBus.emit("candidate", w));
}
