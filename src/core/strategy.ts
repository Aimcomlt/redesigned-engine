export interface StrategyStep {
  venue: string;
  action: 'buy' | 'sell';
}

export interface Strategy {
  steps: StrategyStep[];
  expectedProfit: number;
}

export interface BuildStrategyParams {
  buyVenue: string;
  sellVenue: string;
  buyPrice: number;
  sellPrice: number;
  amount: number;
  gasUsd?: number;
}

/**
 * Builds a simple two-leg arbitrage strategy if profitable.
 * Returns null when the expected profit after gas is non-positive.
 */
export function buildStrategy({
  buyVenue,
  sellVenue,
  buyPrice,
  sellPrice,
  amount,
  gasUsd = 0
}: BuildStrategyParams): Strategy | null {
  const profit = (sellPrice - buyPrice) * amount - gasUsd;
  if (profit <= 0) return null;
  return {
    steps: [
      { venue: buyVenue, action: 'buy' },
      { venue: sellVenue, action: 'sell' }
    ],
    expectedProfit: profit
  };
}

import type { StrategyCtx } from './context';

interface Candidate { expectedProfitUsd: number }

function computeCandidates(_ctx: StrategyCtx, _v2?: unknown, _v3?: unknown): Candidate[] {
  return [];
}

function simulate(_ctx: StrategyCtx, c: Candidate): { expectedProfitUsd: number } {
  return { expectedProfitUsd: c.expectedProfitUsd };
}

export function runLoop(ctx: StrategyCtx): Promise<void> & { return: () => void } {
  let stop = false;
  const loop: Promise<void> & { return: () => void } = (async () => {
    while (!stop) {
      const candidates = computeCandidates(ctx);
      const profitable: Candidate[] = [];
      for (const c of candidates) {
        const s = simulate(ctx, c);
        if (s.expectedProfitUsd > ctx.minProfitUsd) profitable.push({ ...c });
      }
      await new Promise(r => setTimeout(r, 200));
    }
  })() as any;
  loop.return = () => { stop = true; };
  return loop;
}
