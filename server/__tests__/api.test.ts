import request from 'supertest';
import { describe, expect, test, beforeEach, vi } from 'vitest';

vi.mock('../../src/core/candidates', () => ({
  fetchCandidates: vi.fn(async () => [
    { buy: 'A', sell: 'B', profitUsd: 1 },
  ]),
}));

vi.mock('../../src/core/arbitrage', () => ({
  simulateCandidate: vi.fn(async () => ({
    buy: 'A',
    sell: 'B',
    profitUsd: 1,
  })),
}));

vi.mock('../../index', () => ({
  __esModule: true,
  default: vi.fn(async () => {}),
}));

import app from '../index';
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
  token0: { decimals: 18, priceUsd: '1' },
  token1: { decimals: 6, priceUsd: '1' },
  slippageBps: 0,
  gasUnits: '21000',
  ethUsd: 1000,
  minProfitUsd: 0,
};

describe('API endpoints', () => {
  beforeEach(() => {
    process.env.AUTH_TOKEN = 'secret';
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

  test('POST /api/execute requires authentication', async () => {
    const res = await request(app).post('/api/execute').send(baseParams);
    expect(res.status).toBe(401);
  });

  test('POST /api/execute succeeds with valid token', async () => {
    const res = await request(app)
      .post('/api/execute')
      .set('Authorization', 'Bearer secret')
      .send(baseParams);
    expect(res.status).toBe(200);
    const parsed = executeResponseSchema.parse(res.body);
    expect(parsed.ok).toBe(true);
  });
});

