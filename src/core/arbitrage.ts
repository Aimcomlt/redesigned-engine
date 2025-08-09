import { type Provider, parseUnits } from 'ethers';
import { fetchCandidates, type Candidate, type CandidateParams, type VenueConfig } from './candidates';
import { getV2Quote } from './v2';
import { getV3Quote } from './v3';
import { fromQ96 } from '../utils/fixed';
import { estimateGasUsd } from '../utils/gas';
import type { TokenInfo } from '../utils/prices';

/**
 * Builds arbitrage candidates using the same logic as {@link fetchCandidates}.
 * This function provides a semantic alias for CLI usage.
 */
export async function buildCandidates(params: CandidateParams): Promise<Candidate[]> {
  return fetchCandidates(params);
}

export interface SimulateCandidateParams {
  /** Candidate to simulate */
  candidate: Candidate;
  /** Provider for fetching fresh quotes */
  provider: Provider;
  /** Venue configurations so addresses/types can be resolved */
  venues: VenueConfig[];
  /** Amount of token0 to trade */
  amountIn: bigint;
  /** Token0 info */
  token0: TokenInfo;
  /** Token1 info */
  token1: TokenInfo;
  /** Slippage tolerance in bps */
  slippageBps: number;
  /** Gas units expected */
  gasUnits: bigint;
  /** Current ETH price in USD */
  ethUsd: number;
}

/**
 * Recomputes the expected profit for a candidate using fresh pool quotes.
 * This provides a lightweight simulation used by the CLI to verify results.
 */
export async function simulateCandidate({
  candidate,
  provider,
  venues,
  amountIn,
  token0,
  token1,
  slippageBps,
  gasUnits,
  ethUsd
}: SimulateCandidateParams): Promise<{ buy: string; sell: string; profitUsd: number }> {
  const buyConfig = venues.find((v) => v.name === candidate.buy);
  const sellConfig = venues.find((v) => v.name === candidate.sell);
  if (!buyConfig || !sellConfig) {
    throw new Error('Candidate venues not found in configuration');
  }

  const [buyQuote, sellQuote] = await Promise.all([
    buyConfig.type === 'v2' ? getV2Quote(provider, buyConfig.address) : getV3Quote(provider, buyConfig.address),
    sellConfig.type === 'v2' ? getV2Quote(provider, sellConfig.address) : getV3Quote(provider, sellConfig.address)
  ]);

  const buyPriceNum = 'price0' in buyQuote ? buyQuote.price0 : buyQuote.price;
  const sellPriceNum = 'price0' in sellQuote ? sellQuote.price0 : sellQuote.price;

  const priceScale = 10n ** BigInt(token1.decimals);
  const amountScale = 10n ** BigInt(token0.decimals);
  const slipBps = BigInt(slippageBps);
  const baseBps = 10_000n;

  const buyPrice = parseUnits(buyPriceNum.toString(), token1.decimals);
  const sellPrice = parseUnits(sellPriceNum.toString(), token1.decimals);

  const buyAdj = (buyPrice * (baseBps + slipBps)) / baseBps;
  const sellAdj = (sellPrice * (baseBps - slipBps)) / baseBps;
  const profitToken1 = ((sellAdj - buyAdj) * amountIn) / amountScale;

  const whole = profitToken1 / priceScale;
  const frac = profitToken1 % priceScale;
  const profitToken1Num = Number(whole) + Number(frac) / Number(priceScale);

  const token1Usd = fromQ96(token1.priceUsd);
  const gasUsd = await estimateGasUsd({ provider, gasUnits, ethUsd });
  const profitUsd = profitToken1Num * token1Usd - gasUsd;

  return { buy: candidate.buy, sell: candidate.sell, profitUsd };
}

export default { buildCandidates, simulateCandidate };
