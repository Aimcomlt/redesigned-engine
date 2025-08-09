import { type Provider, parseUnits } from 'ethers';
import { getV2Quote } from './v2';
import { getV3Quote } from './v3';
import { estimateGasUsd } from '../utils/gas';
import { fromQ96 } from '../utils/fixed';
import type { TokenInfo } from '../utils/prices';
import { engineEvents } from '../utils/hooks';

export interface VenueConfig {
  /** Human readable venue identifier */
  name: string;
  /** AMM type to query */
  type: 'v2' | 'v3';
  /** Pair or pool address */
  address: string;
}

export interface CandidateParams {
  /** JSON-RPC provider used for on-chain data */
  provider: Provider;
  /** Venues to query for quotes */
  venues: VenueConfig[];
  /** Amount of token0 to trade, in smallest units */
  amountIn: bigint;
  /** Token0 info (used for decimals) */
  token0: TokenInfo;
  /** Token1 info (used for USD conversion) */
  token1: TokenInfo;
  /** Slippage tolerance in basis points */
  slippageBps: number;
  /** Gas units the transaction is expected to consume */
  gasUnits: bigint;
  /** Current ETH price in USD */
  ethUsd: number;
  /** Minimum profit in USD for a candidate to be returned */
  minProfitUsd: number;
}

export interface Candidate {
  /** Venue to purchase token0 */
  buy: string;
  /** Venue to sell token0 */
  sell: string;
  /** Expected profit in USD after fees, slippage and gas */
  profitUsd: number;
}

/**
 * Fetches quotes from multiple venues and computes expected arbitrage profit
 * between every pair of venues. Returned candidates are filtered by the
 * provided minimum profit threshold.
 */
export async function fetchCandidates({
  provider,
  venues,
  amountIn,
  token0,
  token1,
  slippageBps,
  gasUnits,
  ethUsd,
  minProfitUsd
}: CandidateParams): Promise<Candidate[]> {
  const priceScale = 10n ** BigInt(token1.decimals);
  const amountScale = 10n ** BigInt(token0.decimals);
  const slipBps = BigInt(slippageBps);
  const baseBps = 10_000n;

  const quotes = await Promise.all(
    venues.map(async (v) => {
      if (v.type === 'v2') {
        const q = await getV2Quote(provider, v.address);
        return { venue: v.name, price: parseUnits(q.price0.toString(), token1.decimals) };
      }
      const q = await getV3Quote(provider, v.address);
      return { venue: v.name, price: parseUnits(q.price.toString(), token1.decimals) };
    })
  );

  const gasUsd = await estimateGasUsd({ provider, gasUnits, ethUsd });
  const token1Usd = fromQ96(token1.priceUsd);

  const candidates: Candidate[] = [];
  for (let i = 0; i < quotes.length; i++) {
    for (let j = 0; j < quotes.length; j++) {
      if (i === j) continue;
      const buyPrice = (quotes[i].price * (baseBps + slipBps)) / baseBps;
      const sellPrice = (quotes[j].price * (baseBps - slipBps)) / baseBps;
      const profitToken1 = ((sellPrice - buyPrice) * amountIn) / amountScale;
      const whole = profitToken1 / priceScale;
      const frac = profitToken1 % priceScale;
      const profitToken1Num = Number(whole) + Number(frac) / Number(priceScale);
      const profitUsd = profitToken1Num * token1Usd - gasUsd;
      if (profitUsd >= minProfitUsd) {
        candidates.push({
          buy: quotes[i].venue,
          sell: quotes[j].venue,
          profitUsd
        });
      }
    }
  }

  engineEvents.emit('candidates', candidates);
  return candidates;
}

export default { fetchCandidates };
