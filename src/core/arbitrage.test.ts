import { afterEach, expect, test, vi } from 'vitest';
import { buildCandidates, simulateCandidate } from './arbitrage';
import * as v2 from './v2';
import * as v3 from './v3';
import { toQ96 } from '../utils/fixed';

const provider = {
  getFeeData: async () => ({ gasPrice: 1n * 10n ** 9n })
} as any;

afterEach(() => {
  vi.restoreAllMocks();
});

test('simulateCandidate recomputes profit', async () => {
  vi.spyOn(v2, 'getV2Quote').mockResolvedValue({
    token0: '',
    token1: '',
    reserve0: 0n,
    reserve1: 0n,
    price0: 100,
    price1: 0
  });
  vi.spyOn(v3, 'getV3Quote').mockResolvedValue({
    token0: '',
    token1: '',
    sqrtPriceX96: 0n,
    tick: 0,
    fee: 0,
    price: 105
  });

  const venues = [
    { name: 'A', type: 'v2' as const, address: '0x1' },
    { name: 'B', type: 'v3' as const, address: '0x2' }
  ];

  const params = {
    provider,
    venues,
    amountIn: 1n * 10n ** 18n,
    token0: { address: '0x0000000000000000000000000000000000000001', decimals: 18, priceUsd: toQ96(2000) },
    token1: { address: '0x0000000000000000000000000000000000000002', decimals: 6, priceUsd: toQ96(1) },
    slippageBps: 0,
    gasUnits: 100000n,
    ethUsd: 2000,
    minProfitUsd: 1
  };

  const candidates = await buildCandidates(params);
  expect(candidates).toHaveLength(1);

  const sim = await simulateCandidate({
    candidate: candidates[0],
    provider,
    venues,
    amountIn: params.amountIn,
    token0: params.token0,
    token1: params.token1,
    slippageBps: params.slippageBps,
    gasUnits: params.gasUnits,
    ethUsd: params.ethUsd
  });

  expect(sim.profitUsd).toBeCloseTo(candidates[0].profitUsd, 2);
});

test('simulateCandidate handles amountIn larger than Number.MAX_SAFE_INTEGER', async () => {
  vi.spyOn(v2, 'getV2Quote').mockResolvedValue({
    token0: '',
    token1: '',
    reserve0: 0n,
    reserve1: 0n,
    price0: 100,
    price1: 0
  });
  vi.spyOn(v3, 'getV3Quote').mockResolvedValue({
    token0: '',
    token1: '',
    sqrtPriceX96: 0n,
    tick: 0,
    fee: 0,
    price: 105
  });

  const venues = [
    { name: 'A', type: 'v2' as const, address: '0x1' },
    { name: 'B', type: 'v3' as const, address: '0x2' }
  ];

  const amountIn = (BigInt(Number.MAX_SAFE_INTEGER) + 1n) * 10n ** 18n;
  const params = {
    provider,
    venues,
    amountIn,
    token0: { address: '0x0000000000000000000000000000000000000001', decimals: 18, priceUsd: toQ96(2000) },
    token1: { address: '0x0000000000000000000000000000000000000002', decimals: 6, priceUsd: toQ96(1) },
    slippageBps: 0,
    gasUnits: 100000n,
    ethUsd: 2000,
    minProfitUsd: 1
  };

  const candidates = await buildCandidates(params);
  expect(candidates).toHaveLength(1);

  const sim = await simulateCandidate({
    candidate: candidates[0],
    provider,
    venues,
    amountIn,
    token0: params.token0,
    token1: params.token1,
    slippageBps: params.slippageBps,
    gasUnits: params.gasUnits,
    ethUsd: params.ethUsd
  });

  expect(Number.isFinite(sim.profitUsd)).toBe(true);
});
