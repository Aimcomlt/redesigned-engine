import { expect, test } from 'vitest';
import { CandidatesInput, SimulateInput } from './schemas';

const validPayload = {
  providerUrl: 'https://example.com',
  venues: [
    { name: 'A', type: 'v2', address: '0x'.concat('1'.repeat(40)) },
    { name: 'B', type: 'v3', address: '0x'.concat('2'.repeat(40)) }
  ],
  amountIn: '1000',
  token0: { decimals: 18, priceUsd: '2000' },
  token1: { decimals: 6, priceUsd: '1' },
  slippageBps: 100,
  gasUnits: '21000',
  ethUsd: 2000,
  minProfitUsd: 1
};

test('CandidatesInput accepts valid payload', () => {
  const result = CandidatesInput.safeParse(validPayload);
  expect(result.success).toBe(true);
});

test('CandidatesInput rejects invalid address and missing fields', () => {
  const invalidPayload: any = {
    venues: [{ name: 'A', type: 'v2', address: '0x123' }],
    amountIn: '1000',
    token0: { decimals: 18, priceUsd: '2000' },
    token1: { decimals: 6, priceUsd: '1' },
    slippageBps: 100,
    gasUnits: '21000',
    ethUsd: 2000
    // providerUrl missing
  };

  const result = CandidatesInput.safeParse(invalidPayload);

  expect(result.success).toBe(false);
  expect(result.error?.issues.some(i => i.path.join('.') === 'providerUrl')).toBe(true);
  expect(result.error?.issues.some(i => i.path.join('.') === 'venues.0.address')).toBe(true);
});

const validSimulatePayload = {
  candidate: { buy: 'A', sell: 'B', profitUsd: 1 },
  params: validPayload
};

test('SimulateInput accepts valid candidate', () => {
  const result = SimulateInput.safeParse(validSimulatePayload);
  expect(result.success).toBe(true);
});

test('SimulateInput rejects non-string venues', () => {
  const invalidPayload: any = {
    candidate: { buy: 123, sell: 456, profitUsd: 1 },
    params: validPayload
  };

  const result = SimulateInput.safeParse(invalidPayload);
  expect(result.success).toBe(false);
  expect(result.error?.issues.some(i => i.path.join('.') === 'candidate.buy')).toBe(true);
  expect(result.error?.issues.some(i => i.path.join('.') === 'candidate.sell')).toBe(true);
});

