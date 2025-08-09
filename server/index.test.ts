import { expect, expectTypeOf, test } from 'vitest';
import { buildSimulateParams } from './index';
import type { Candidate } from '../src/core/candidates';
import type { CandidateParamsInput } from './schemas';
import type { SimulateCandidateParams } from '../src/core/arbitrage';

test('buildSimulateParams returns SimulateCandidateParams', () => {
  const body: CandidateParamsInput = {
    providerUrl: 'http://localhost:8545',
    venues: [],
    amountIn: '1',
    token0: { address: '0x0000000000000000000000000000000000000001', decimals: 18, priceUsd: '1' },
    token1: { address: '0x0000000000000000000000000000000000000002', decimals: 6, priceUsd: '1' },
    slippageBps: 0,
    gasUnits: '21000',
    ethUsd: 1000,
    minProfitUsd: 0,
  };
  const candidate: Candidate = { buy: 'A', sell: 'B', profitUsd: 0 };
  const params = buildSimulateParams(body, candidate);
  expect(params.candidate).toEqual(candidate);
  expect((params as any).minProfitUsd).toBeUndefined();
  expectTypeOf(params).toEqualTypeOf<SimulateCandidateParams>();
});
