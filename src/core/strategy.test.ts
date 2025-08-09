import { describe, expect, test } from 'vitest';
import { computeCandidates, simulate, runLoop } from './strategy';
import { normalizeStartup } from './context';
import { eventBus } from './bus';

describe('strategy helpers', () => {
  const base = {
    venues:[
      {name:'A', type:'v2', address:'0x1'.padEnd(42,'0')},
      {name:'B', type:'v2', address:'0x2'.padEnd(42,'0')}
    ],
    token0:{address:'0x1'.padEnd(42,'1'), symbol:'T0', decimals:18},
    token1:{address:'0x2'.padEnd(42,'2'), symbol:'T1', decimals:18},
    amountIn:'1000000000000000000',
    slippageBps:0,
    gasUnits:'100',
    ethUsd:2000,
    minProfitUsd:0.5
  };

  test('computeCandidates derives profit from amountIn', () => {
    const ctx = normalizeStartup(base);
    const cands = computeCandidates(ctx);
    expect(cands).toEqual([{ expectedProfitUsd: 1 }]);
  });

  test('simulate subtracts a small gas cost', () => {
    const ctx = normalizeStartup(base);
    const cand = { expectedProfitUsd: 1 };
    const res = simulate(ctx, cand);
    expect(res.expectedProfitUsd).toBeCloseTo(0.9999, 4);
  });

  test('runLoop emits profitable candidates', async () => {
    const ctx = normalizeStartup(base);
    const loop = runLoop(ctx);
    const emitted = await new Promise<any>(resolve => {
      eventBus.once('candidate', c => resolve(c));
    });
    loop.return();
    await loop;
    expect(emitted.expectedProfitUsd).toBeGreaterThan(ctx.minProfitUsd);
  });
});

