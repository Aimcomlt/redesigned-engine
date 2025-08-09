import { vParse, CandidatesInput } from "../shared/validation/valibot-schemas";

export type ReadyToken = { address: `0x${string}`; symbol: string; decimals: number; q: bigint };
export type ReadyVenue = { name: string; type: "v2"|"v3"; address: `0x${string}` };

export type StrategyCtx = {
  chainId: number;
  venues: ReadyVenue[];
  t0: ReadyToken;
  t1: ReadyToken;
  amountIn: bigint;
  slippageBps: number;
  gasUnits: bigint;
  ethUsd: number;
  minProfitUsd: number;
};

export function normalizeStartup(rawInput: unknown, chainId = 1): StrategyCtx {
  const cfg = vParse<typeof CandidatesInput>(CandidatesInput, rawInput); // validate ONCE
  const toLower = (a: string) => (a.toLowerCase() as `0x${string}`);
  const t0q = 10n ** BigInt(cfg.token0.decimals);
  const t1q = 10n ** BigInt(cfg.token1.decimals);

  return {
    chainId,
    venues: cfg.venues.map(v => ({ ...v, address: toLower(v.address) })),
    t0: { ...cfg.token0, address: toLower(cfg.token0.address), q: t0q },
    t1: { ...cfg.token1, address: toLower(cfg.token1.address), q: t1q },
    amountIn: BigInt(cfg.amountIn),
    slippageBps: cfg.slippageBps,
    gasUnits: BigInt(cfg.gasUnits),
    ethUsd: cfg.ethUsd,
    minProfitUsd: cfg.minProfitUsd,
  };
}
