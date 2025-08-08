import { Contract, type Provider } from 'ethers';
import invariant from 'tiny-invariant';
import { checkSlippage } from '../risk/slippage';
import type { SimResult } from './sim';

const POOL_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function fee() view returns (uint24)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

export interface V3Quote {
  token0: string;
  token1: string;
  sqrtPriceX96: bigint;
  tick: number;
  fee: number;
  price: number;
}

/**
 * Fetches current price and state for a Uniswap V3 pool.
 * Price is expressed as token1 per token0 adjusted for the pool fee.
 */
export async function getV3Quote(
  provider: Provider,
  pool: string
): Promise<V3Quote> {
  const contract = new Contract(pool, POOL_ABI, provider);
  const [token0, token1, fee, slot0] = await Promise.all([
    contract.token0() as Promise<string>,
    contract.token1() as Promise<string>,
    contract.fee() as Promise<number>,
    contract.slot0() as Promise<[
      bigint,
      number,
      number,
      number,
      number,
      number,
      boolean
    ]>
  ]);

  const [sqrtPriceX96, tick] = slot0;

  invariant(sqrtPriceX96 > 0n, 'Pool has no liquidity');

  const priceBeforeFee = Number(
    (sqrtPriceX96 * sqrtPriceX96) / (1n << 192n)
  );
  const price = priceBeforeFee * (1 - fee / 1_000_000);

  return { token0, token1, sqrtPriceX96, tick, fee, price };
}

export default { getV3Quote };

export interface V3SwapParams {
  /** Quote information for the pool */
  quote: V3Quote;
  /** Amount of token0 to swap */
  amountIn: bigint;
  /** Maximum allowed slippage in basis points */
  slippageBps: number;
}

/**
 * Simulates a swap on a V3 pool by shifting the current tick based on
 * the input amount. This provides a simplified model of price impact
 * and applies a slippage guard.
 */
export function simulateV3Swap({
  quote,
  amountIn,
  slippageBps
}: V3SwapParams): SimResult {
  const price = Math.pow(1.0001, quote.tick) * (1 - quote.fee / 1_000_000);
  const deltaTicks = Math.floor(Number(amountIn) / 1e6);
  const newTick = quote.tick + deltaTicks;
  const executionPrice =
    Math.pow(1.0001, newTick) * (1 - quote.fee / 1_000_000);
  const amountOut = Number(amountIn) * executionPrice;
  const ok = checkSlippage(price, executionPrice, slippageBps);
  const idealOut = Number(amountIn) * price;
  const expectedProfit = amountOut - idealOut;
  return { ok, expectedProfit };
}

export { simulateV3Swap };
