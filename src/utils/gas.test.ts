import { expect, test } from 'vitest';
import { estimateGasUsd } from './gas';

test('estimateGasUsd handles large values', async () => {
  const provider = { getFeeData: async () => ({ gasPrice: 1_000_000_000n }) } as any;
  const gasUnits = (BigInt(Number.MAX_SAFE_INTEGER) + 1n) * 10n;
  const usd = await estimateGasUsd({ provider, gasUnits, ethUsd: 2000 });
  expect(usd).toBeGreaterThan(0);
});
