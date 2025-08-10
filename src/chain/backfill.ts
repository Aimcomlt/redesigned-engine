import type { Address, Hex } from "viem";
import { mkHttpClient } from "./providers";

type Log = { address: Address; topics: Hex[]; data: Hex; blockNumber: bigint };

export async function backfillLogs(opts: {
  fromBlock: bigint;
  toBlock: bigint;
  addresses: Address[];
  topics: Hex[][];
  httpIndex?: number;
}): Promise<Log[]> {
  const client = mkHttpClient(opts.httpIndex ?? 0);
  const res = await client.getLogs({
    address: opts.addresses,
    fromBlock: opts.fromBlock,
    toBlock: opts.toBlock,
    topics: opts.topics as any
  });
  return res as unknown as Log[];
}
