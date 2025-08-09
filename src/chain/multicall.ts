// Stub: replace with your multicall implementation
import { setPoolState } from "./state";

export async function batchSnapshot(addresses: string[]) {
  if (!addresses.length) return;
  // TODO: real multicall to fetch reserves/slot0
  for (const a of addresses) {
    // placeholders; replace with actual on-chain reads
    setPoolState(a, { reserve0: 1_000_000n, reserve1: 1_000_000n, block: 0n });
  }
}
