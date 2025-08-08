import { fetchCandidates } from './candidates';
import * as v2 from './v2';
import * as v3 from './v3';
import { q98 } from '../utils/fixed';

const provider = {
  getFeeData: async () => ({ gasPrice: 1n * 10n ** 9n })
} as any;

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetchCandidates computes profit and filters by minProfitUsd', async () => {
  jest.spyOn(v2, 'getV2Quote').mockResolvedValue({
    token0: '',
    token1: '',
    reserve0: 0n,
    reserve1: 0n,
    price0: 100,
    price1: 0
  });
  jest.spyOn(v3, 'getV3Quote').mockResolvedValue({
    token0: '',
    token1: '',
    sqrtPriceX96: 0n,
    tick: 0,
    fee: 0,
    price: 105
  });

  const candidates = await fetchCandidates({
    provider,
    venues: [
      { name: 'A', type: 'v2', address: '0x1' },
      { name: 'B', type: 'v3', address: '0x2' }
    ],
    amountIn: 1n * 10n ** 18n,
    token0: { decimals: 18, priceUsd: q98(2000) },
    token1: { decimals: 6, priceUsd: q98(1) },
    slippageBps: 0,
    gasUnits: 100000n,
    ethUsd: 2000,
    minProfitUsd: 1
  });

  expect(candidates).toHaveLength(1);
  expect(candidates[0].buy).toBe('A');
  expect(candidates[0].sell).toBe('B');
  expect(candidates[0].profitUsd).toBeCloseTo(4.8, 2);
});

test('returns empty array when profit below threshold', async () => {
  jest.spyOn(v2, 'getV2Quote').mockResolvedValue({
    token0: '',
    token1: '',
    reserve0: 0n,
    reserve1: 0n,
    price0: 100,
    price1: 0
  });
  jest.spyOn(v3, 'getV3Quote').mockResolvedValue({
    token0: '',
    token1: '',
    sqrtPriceX96: 0n,
    tick: 0,
    fee: 0,
    price: 100.5
  });

  const candidates = await fetchCandidates({
    provider,
    venues: [
      { name: 'A', type: 'v2', address: '0x1' },
      { name: 'B', type: 'v3', address: '0x2' }
    ],
    amountIn: 1n * 10n ** 18n,
    token0: { decimals: 18, priceUsd: q98(2000) },
    token1: { decimals: 6, priceUsd: q98(1) },
    slippageBps: 0,
    gasUnits: 100000n,
    ethUsd: 2000,
    minProfitUsd: 1
  });

  expect(candidates).toHaveLength(0);
});
