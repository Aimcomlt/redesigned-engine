import { createPublicClient, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";
import reg from "./registry.json" assert { type: "json" };
import { setPoolState } from "./state";

const V2_ABI = parseAbi([
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
]);

const V3_ABI = parseAbi([
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)"
]);

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL ?? "https://cloudflare-eth.com")
});

type Meta = { addr: string; type: "v2" | "v3" };

/**
 * Batch fetches pool state for the provided addresses using the Multicall
 * contract. Errors are retried up to `retries` times.
 */
export async function batchSnapshot(addresses: string[], retries = 2) {
  if (!addresses.length) return;

  const v2Set = new Set(reg.v2Pools.map((a) => a.toLowerCase()));
  const v3Set = new Set(reg.v3Pools.map((a) => a.toLowerCase()));

  const calls: any[] = [];
  const meta: Meta[] = [];

  for (const a of addresses) {
    const addr = a as `0x${string}`;
    const lower = a.toLowerCase();
    if (v2Set.has(lower)) {
      calls.push({ address: addr, abi: V2_ABI, functionName: "getReserves" });
      meta.push({ addr: a, type: "v2" });
    } else if (v3Set.has(lower)) {
      calls.push({ address: addr, abi: V3_ABI, functionName: "slot0" });
      meta.push({ addr: a, type: "v3" });
    }
  }

  if (!calls.length) return;

  try {
    const block = await client.getBlockNumber();
    const results = await client.multicall({ contracts: calls, allowFailure: true });
    const failed: string[] = [];

    results.forEach((r: any, i: number) => {
      const { addr, type } = meta[i];
      if (r.status !== "success") {
        failed.push(addr);
        return;
      }

      if (type === "v2") {
        const [reserve0, reserve1] = r.result as [bigint, bigint, bigint];
        setPoolState(addr, { reserve0, reserve1, block });
      } else {
        const [sqrtPriceX96, tick] = r.result as [bigint, number];
        setPoolState(addr, { sqrtPriceX96, tick: Number(tick), block });
      }
    });

    if (failed.length && retries > 0) await batchSnapshot(failed, retries - 1);
  } catch (err) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 250));
      await batchSnapshot(addresses, retries - 1);
    } else {
      console.error("batchSnapshot failed", err);
    }
  }
}
