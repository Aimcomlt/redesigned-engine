import { expect, expectTypeOf, test, beforeAll } from 'vitest';
import { JsonRpcProvider } from 'ethers';
import type { Candidate } from '@/core/candidates';
import type { CandidateParamsInput } from './schemas';
import type { SimulateCandidateParams } from '@/core/arbitrage';

let buildSimulateParams: (body: CandidateParamsInput, candidate: Candidate) => SimulateCandidateParams;

beforeAll(async () => {
  process.env.AUTH_TOKEN = 'secret';
  ({ buildSimulateParams } = await import('./index'));
});

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
  expect(params.provider).toBeInstanceOf(JsonRpcProvider);
  expect(params.venues).toEqual(body.venues);
  expect(params.amountIn).toBe(BigInt(body.amountIn));
  expect(params.token0).toEqual({ ...body.token0, priceUsd: BigInt(body.token0.priceUsd) });
  expect(params.token1).toEqual({ ...body.token1, priceUsd: BigInt(body.token1.priceUsd) });
  expect(params.slippageBps).toBe(body.slippageBps);
  expect(params.gasUnits).toBe(BigInt(body.gasUnits));
  expect(params.ethUsd).toBe(body.ethUsd);
  expect((params as any).minProfitUsd).toBeUndefined();
  expectTypeOf(params).toEqualTypeOf<SimulateCandidateParams>();
});

