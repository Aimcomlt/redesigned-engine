import request from 'supertest';
import { describe, expect, test, beforeEach, vi } from 'vitest';

import {
  candidatesResponseSchema,
  simulateResponseSchema,
  executeResponseSchema,
} from '../schemas';

const baseParams = {
  providerUrl: 'http://localhost:8545',
  venues: [
    {
      name: 'V1',
      type: 'v2',
      address: '0x0000000000000000000000000000000000000001',
    },
    {
      name: 'V2',
      type: 'v2',
      address: '0x0000000000000000000000000000000000000002',
    },
  ],
  amountIn: '1',
  token0: {
    address: '0x00000000000000000000000000000000000000aa',
    decimals: 18,
    priceUsd: '1',
  },
  token1: {
    address: '0x00000000000000000000000000000000000000bb',
    decimals: 6,
    priceUsd: '1',
  },
  slippageBps: 0,
  gasUnits: '21000',
  ethUsd: 1000,
  minProfitUsd: 0,
};

const execParams = {
  routeCalldata: '0x',
  maxFeePerGas: '1',
  maxPriorityFeePerGas: '1',
  deadline: Math.floor(Date.now() / 1000) + 60,
  dryRun: true,
};

describe('API endpoints', () => {
  let app: any;

  beforeEach(async () => {
    vi.resetModules();
    delete process.env.EXEC_ENABLED;
    vi.doMock('../../src/core/candidates', () => {
      const fetchCandidates = vi.fn(async () => [
        { buy: 'A', sell: 'B', profitUsd: 1 },
      ]);
      return { __esModule: true, fetchCandidates, default: { fetchCandidates } };
    });
    vi.doMock('../../src/core/arbitrage', () => {
      const simulateCandidate = vi.fn(async () => ({
        buy: 'A',
        sell: 'B',
        profitUsd: 1,
      }));
      return { __esModule: true, simulateCandidate, default: { simulateCandidate } };
    });
    vi.doMock('../../index', () => ({
      __esModule: true,
      default: vi.fn(async () => {}),
    }));
    ({ default: app } = await import('../index'));
  });

  test('POST /api/candidates returns candidates list', async () => {
    const res = await request(app).post('/api/candidates').send(baseParams);
    expect(res.status).toBe(200);
    const parsed = candidatesResponseSchema.parse(res.body);
    expect(parsed.candidates[0]).toMatchObject({ buy: 'A', sell: 'B', profitUsd: 1 });
  });

  test('POST /api/simulate returns simulation result', async () => {
    const candidate = { buy: 'A', sell: 'B', profitUsd: 1 };
    const res = await request(app)
      .post('/api/simulate')
      .send({ candidate, params: baseParams });
    expect(res.status).toBe(200);
    const parsed = simulateResponseSchema.parse(res.body);
    expect(parsed).toMatchObject(candidate);
  });

  test('POST /api/execute returns 403 when disabled', async () => {
    const res = await request(app).post('/api/execute').send(execParams);
    expect(res.status).toBe(403);
  });

  test('POST /api/execute processes request when enabled', async () => {
    vi.resetModules();
    vi.doMock('../../src/core/candidates', () => {
      const fetchCandidates = vi.fn(async () => []);
      return { __esModule: true, fetchCandidates, default: { fetchCandidates } };
    });
    vi.doMock('../../src/core/arbitrage', () => {
      const simulateCandidate = vi.fn(async () => ({}));
      return { __esModule: true, simulateCandidate, default: { simulateCandidate } };
    });
    vi.doMock('../../index', () => ({ __esModule: true, default: vi.fn(async () => {}) }));
    process.env.EXEC_ENABLED = '1';
    ({ default: app } = await import('../index'));
    const res = await request(app).post('/api/execute').send(execParams);
    expect(res.status).toBe(500);
    const parsed = executeResponseSchema.parse(res.body);
    expect(parsed.ok).toBe(false);
  });
});

