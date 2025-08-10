import { expect, test } from 'vitest';
import { estimateGasUsd } from './gas';

const provider = { getFeeData: async () => ({ gasPrice: 1_000_000_000n }) } as any;
const ethUsd = 2000;

test.each([
  (BigInt(Number.MAX_SAFE_INTEGER) + 1n) * 10n,
  2n ** 100n,
])('estimateGasUsd matches expected value for gas units %s', async (gasUnits) => {
  const usd = await estimateGasUsd({ provider, gasUnits, ethUsd });
  const wei = 1_000_000_000n * gasUnits;
  const expected = (
    Number(wei / 1_000_000_000_000_000_000n) +
    Number(wei % 1_000_000_000_000_000_000n) / 1e18
  ) * ethUsd;
  expect(usd).toBeCloseTo(expected);
});
