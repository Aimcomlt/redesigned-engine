import { Contract, type Provider, Wallet } from 'ethers';
import invariant from 'tiny-invariant';
import { BPS_PER_UNIT } from '../risk/slippage';
import { getV3Router } from '../utils/router';
import { engineEvents } from '../utils/hooks';
import { Q96, fromQ96, fromBigInt } from '../utils/fixed';
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

  const priceX96 = (sqrtPriceX96 * sqrtPriceX96) / Q96;
  const feeFactor = 1_000_000n - BigInt(fee);
  const priceWithFeeX96 = (priceX96 * feeFactor) / 1_000_000n;
  const price = fromQ96(priceWithFeeX96);

  const quote = { token0, token1, sqrtPriceX96, tick, fee, price };
  engineEvents.emit('quote', { type: 'v3', pool, quote });
  return quote;
}

export default { getV3Quote };

const WAD = 10n ** 18n;

function pow1_0001(tick: bigint): bigint {
  const base = (10001n * WAD) / 10000n;
  let result = WAD;
  let b = base;
  let e = tick < 0n ? -tick : tick;
  while (e > 0n) {
    if (e & 1n) result = (result * b) / WAD;
    b = (b * b) / WAD;
    e >>= 1n;
  }
  if (tick < 0n) {
    result = (WAD * WAD) / result;
  }
  return result;
}

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
  const feeFactor = 1_000_000n - BigInt(quote.fee);
  const priceWad = (pow1_0001(BigInt(quote.tick)) * feeFactor) / 1_000_000n;
  const deltaTicks = amountIn / 1_000_000n;
  const newPriceWad =
    (pow1_0001(BigInt(quote.tick) + deltaTicks) * feeFactor) / 1_000_000n;
  const amountOut = (amountIn * newPriceWad) / WAD;
  const idealOut = (amountIn * priceWad) / WAD;
  const diffPrice =
    priceWad > newPriceWad ? priceWad - newPriceWad : newPriceWad - priceWad;
  const ok = diffPrice * BPS_PER_UNIT <= priceWad * BigInt(slippageBps);
  const expectedProfit = fromBigInt(amountOut - idealOut);
  return { ok, expectedProfit };
}

export interface SubmitV3SwapParams {
  /** Wallet used to sign and send the transaction */
  wallet: Wallet;
  /** Input token address */
  tokenIn: string;
  /** Output token address */
  tokenOut: string;
  /** Pool fee tier */
  fee: number;
  /** Recipient of the output tokens */
  recipient: string;
  /** Amount of tokenIn to swap */
  amountIn: bigint;
  /** Minimum acceptable output */
  amountOutMinimum: bigint;
  /** Unix timestamp after which the tx is invalid */
  deadline: number;
  /** Optional price limit */
  sqrtPriceLimitX96?: bigint;
  /** Maximum fee per gas (EIP-1559) */
  maxFeePerGas: bigint;
  /** Maximum priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas: bigint;
}

/**
 * Executes a swap on a Uniswap V3 pool using the router contract.
 * The transaction requires a deadline, minimum output amount, and
 * explicit EIP-1559 fee parameters.
 */
export async function submitV3Swap({
  wallet,
  tokenIn,
  tokenOut,
  fee,
  recipient,
  amountIn,
  amountOutMinimum,
  deadline,
  sqrtPriceLimitX96 = 0n,
  maxFeePerGas,
  maxPriorityFeePerGas
}: SubmitV3SwapParams): Promise<string> {
  invariant(deadline > Math.floor(Date.now() / 1000), 'deadline must be in the future');
  invariant(amountOutMinimum > 0n, 'amountOutMinimum must be greater than zero');

  const router = getV3Router(wallet);
  const params = {
    tokenIn,
    tokenOut,
    fee,
    recipient,
    deadline,
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96
  };
  const tx = await router.exactInputSingle(params, {
    maxFeePerGas,
    maxPriorityFeePerGas
  });
  await tx.wait();
  return tx.hash;
}
