import { Contract, type Provider } from 'ethers';
import invariant from 'tiny-invariant';
import { checkSlippage } from '../risk/slippage';
import type { SimResult } from './sim';

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
];

export interface V2Quote {
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  price0: number;
  price1: number;
}

/**
 * Fetches reserve and price data for a Uniswap V2-style pair.
 * Prices are expressed as token1 per token0 and token0 per token1,
 * adjusted for the provided fee in basis points.
 */
export async function getV2Quote(
  provider: Provider,
  pair: string,
  feeBps = 30
): Promise<V2Quote> {
  const contract = new Contract(pair, PAIR_ABI, provider);
  const [token0, token1, reserves] = await Promise.all([
    contract.token0() as Promise<string>,
    contract.token1() as Promise<string>,
    contract.getReserves() as Promise<[bigint, bigint, bigint]>
  ]);

  const [reserve0, reserve1] = reserves;

  invariant(reserve0 > 0n && reserve1 > 0n, 'Pool has no liquidity');

  const fee = 1 - feeBps / 10_000;
  const price0 = (Number(reserve1) / Number(reserve0)) * fee;
  const price1 = (Number(reserve0) / Number(reserve1)) * fee;

  return { token0, token1, reserve0, reserve1, price0, price1 };
}

export default { getV2Quote };

export interface V2SwapParams {
  /** Quote information for the pool */
  quote: V2Quote;
  /** Amount of token0 to swap */
  amountIn: bigint;
  /** Maximum allowed slippage in basis points */
  slippageBps: number;
  /** Pool fee in basis points */
  feeBps?: number;
}

/**
 * Simulates a swap on a V2-style pool using the constant product
 * formula. The function models price impact based on current
 * reserves and applies a slippage guard.
 */
export function simulateV2Swap({
  quote,
  amountIn,
  slippageBps,
  feeBps = 30
}: V2SwapParams): SimResult {
  const feeFactor = 10_000n - BigInt(feeBps);
  const amountInWithFee = (amountIn * feeFactor) / 10_000n;
  const k = quote.reserve0 * quote.reserve1;
  const newReserve0 = quote.reserve0 + amountInWithFee;
  const newReserve1 = k / newReserve0;
  const amountOut = quote.reserve1 - newReserve1;
  const executionPrice = Number(amountOut) / Number(amountIn);
  const ok = checkSlippage(quote.price0, executionPrice, slippageBps);
  const idealOut = Number(amountIn) * quote.price0;
  const expectedProfit = Number(amountOut) - idealOut;
  return { ok, expectedProfit };
}

export { simulateV2Swap };

