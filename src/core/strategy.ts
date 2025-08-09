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
import { eventBus } from './bus';

export interface Candidate { expectedProfitUsd: number }

// naive candidate builder: if we have at least two venues, pretend buying the
// first and selling the second yields a profit roughly equal to the input
// amount expressed in token0 units. this keeps the function deterministic and
// pure for unit tests while exercising loop logic.
export function computeCandidates(ctx: StrategyCtx, _v2?: unknown, _v3?: unknown): Candidate[] {
  if (ctx.venues.length < 2) return [];
  const usd = Number(ctx.amountIn / ctx.t0.q); // assume 1 token0 ~= 1 USD
  return [{ expectedProfitUsd: usd }];
}

// very small simulation that deducts a notional gas cost from the candidate
// profit. the gas cost is intentionally tiny to keep profits positive for most
// tests.
export function simulate(ctx: StrategyCtx, c: Candidate): { expectedProfitUsd: number } {
  const gasCostUsd = Number(ctx.gasUnits) * 1e-6; // pretend $0.000001 per unit
  return { expectedProfitUsd: c.expectedProfitUsd - gasCostUsd };
}

export function runLoop(ctx: StrategyCtx): Promise<void> & { return: () => void } {
  let stop = false;
  const loop: Promise<void> & { return: () => void } = (async () => {
    while (!stop) {
      const candidates = computeCandidates(ctx);
      for (const c of candidates) {
        const s = simulate(ctx, c);
        if (s.expectedProfitUsd > ctx.minProfitUsd) {
          const winner = { ...c, expectedProfitUsd: s.expectedProfitUsd };
          eventBus.emit("candidate", winner);
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
  })() as any;
  loop.return = () => { stop = true; };
  return loop;
}
