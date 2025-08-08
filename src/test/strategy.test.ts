import { expect, test } from 'vitest';
import { buildStrategy } from '../core/strategy';

test('buildStrategy returns strategy when profitable', () => {
  const strat = buildStrategy({
    buyVenue: 'A',
    sellVenue: 'B',
    buyPrice: 100,
    sellPrice: 105,
    amount: 1,
    gasUsd: 1
  });
  expect(strat).not.toBeNull();
  expect(strat?.steps).toHaveLength(2);
  expect(strat?.expectedProfit).toBeCloseTo(4);
});

test('buildStrategy returns null when not profitable', () => {
  const strat = buildStrategy({
    buyVenue: 'A',
    sellVenue: 'B',
    buyPrice: 100,
    sellPrice: 99,
    amount: 1
  });
  expect(strat).toBeNull();
});
