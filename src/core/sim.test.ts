import { expect, test } from 'vitest';
import { simulateSwap, simulateRoute } from './sim';
import type { V2SwapParams } from './v2';
import type { V3SwapParams } from './v3';

test('simulateSwap handles zero liquidity', () => {
  const params: V2SwapParams = {
    quote: {
      token0: 'A',
      token1: 'B',
      reserve0: 0n,
      reserve1: 1n,
      price0: 1,
      price1: 1
    },
    amountIn: 100n,
    slippageBps: 100,
    feeBps: 30
  };
  const res = simulateSwap(params);
  expect(res.ok).toBe(false);
  expect(res.expectedProfit).toBe(0);
});

test('simulateSwap marks negative profit as not ok', () => {
  const params: V2SwapParams = {
    quote: {
      token0: 'A',
      token1: 'B',
      reserve0: 1000n,
      reserve1: 1000n,
      price0: 2,
      price1: 0.5
    },
    amountIn: 100n,
    slippageBps: 10000,
    feeBps: 30
  };
  const res = simulateSwap(params);
  expect(res.ok).toBe(false);
  expect(res.expectedProfit).toBeLessThan(0);
});

test('simulateRoute aggregates swap results', () => {
  const swap1: V2SwapParams = {
    quote: {
      token0: 'A',
      token1: 'B',
      reserve0: 1000n,
      reserve1: 1000n,
      price0: 2,
      price1: 0.5
    },
    amountIn: 100n,
    slippageBps: 10000,
    feeBps: 30
  };
  const swap2: V3SwapParams = {
    quote: {
      token0: 'B',
      token1: 'C',
      sqrtPriceX96: 1n,
      tick: 0,
      fee: 0,
      price: 0.5
    },
    amountIn: 100n,
    slippageBps: 10000
  };

  const r1 = simulateSwap(swap1);
  const r2 = simulateSwap(swap2);
  const route = simulateRoute([swap1, swap2]);
  expect(route.expectedProfit).toBeCloseTo(r1.expectedProfit + r2.expectedProfit, 6);
  expect(route.ok).toBe(false);
});
