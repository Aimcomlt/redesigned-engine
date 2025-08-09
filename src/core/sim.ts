/**
 * Result returned by swap simulation functions.
 */
export interface SimResult {
  /** Whether the swap passes the configured slippage guard */
  ok: boolean;
  /** Expected profit in output token terms */
  expectedProfit: number;
}

import type { V2SwapParams } from './v2';
import { simulateV2Swap } from './v2';
import type { V3SwapParams } from './v3';
import { simulateV3Swap } from './v3';

export type SwapParams = V2SwapParams | V3SwapParams;

function isV2(params: SwapParams): params is V2SwapParams {
  // V2 quotes contain reserve information
  return 'reserve0' in (params as any).quote;
}

function isV3(params: SwapParams): params is V3SwapParams {
  // V3 quotes include the sqrtPriceX96 field
  return 'sqrtPriceX96' in (params as any).quote;
}

/**
 * Simulates a swap on either a V2 or V3 pool and performs basic
 * sanity checks such as liquidity and profit validation.
 */
export function simulateSwap(params: SwapParams): SimResult {
  if (isV2(params)) {
    const { quote } = params;
    if (quote.reserve0 === 0n || quote.reserve1 === 0n) {
      return { ok: false, expectedProfit: 0 };
    }
    const res = simulateV2Swap(params);
    if (!res.ok || res.expectedProfit <= 0) {
      return { ...res, ok: false };
    }
    return res;
  }

  if (isV3(params)) {
    const { quote } = params;
    if (quote.sqrtPriceX96 === 0n) {
      return { ok: false, expectedProfit: 0 };
    }
    const res = simulateV3Swap(params);
    if (!res.ok || res.expectedProfit <= 0) {
      return { ...res, ok: false };
    }
    return res;
  }

  return { ok: false, expectedProfit: 0 };
}

/**
 * Runs simulation over an array of swaps. The route is considered OK
 * only if all individual swaps succeed and yield positive profit.
 */
export function simulateRoute(swaps: SwapParams[]): SimResult {
  let ok = true;
  let expectedProfit = 0;
  for (const swap of swaps) {
    const res = simulateSwap(swap);
    ok &&= res.ok;
    expectedProfit += res.expectedProfit;
  }
  return { ok, expectedProfit };
}

export default { simulateSwap, simulateRoute };
