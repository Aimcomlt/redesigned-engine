import { expect, test } from 'vitest';
import { quoteOutV2, simulateV2Swap } from './v2';

test('quoteOutV2 handles large reserves and inputs', () => {
  const reserve0 = 10n ** 24n;
  const reserve1 = 5n * 10n ** 24n;
  const amountIn = 10n ** 22n;
  const out = quoteOutV2(reserve0, reserve1, amountIn, 30);
  const feeFactor = 10_000n - 30n;
  const amountInWithFee = (amountIn * feeFactor) / 10_000n;
  const expected =
    (amountInWithFee * reserve1) / (reserve0 + amountInWithFee);
  expect(out).toBe(expected);
});

test('simulateV2Swap maintains precision with large values', () => {
  const reserve0 = 10n ** 24n;
  const reserve1 = 5n * 10n ** 24n;
  const feeBps = 30;
  const feeFactor = 10_000n - BigInt(feeBps);
  const price0 =
    Number((reserve1 * feeFactor * 1_000_000n) / (reserve0 * 10_000n)) /
    1_000_000;
  const price1 =
    Number((reserve0 * feeFactor * 1_000_000n) / (reserve1 * 10_000n)) /
    1_000_000;
  const quote = { token0: 'A', token1: 'B', reserve0, reserve1, price0, price1 };
  const amountIn = 10n ** 18n;
  const res = simulateV2Swap({ quote, amountIn, slippageBps: 50_00, feeBps });
  const amountInWithFee = (amountIn * feeFactor) / 10_000n;
  const k = reserve0 * reserve1;
  const newReserve0 = reserve0 + amountInWithFee;
  const newReserve1 = k / newReserve0;
  const amountOut = reserve1 - newReserve1;
  const price0Scaled = BigInt(Math.round(price0 * 1_000_000));
  const idealOut = (amountIn * price0Scaled) / 1_000_000n;
  const expectedProfit = Number(amountOut - idealOut);
  expect(res.expectedProfit).toBeCloseTo(expectedProfit, 0);
  expect(res.ok).toBe(true);
});
