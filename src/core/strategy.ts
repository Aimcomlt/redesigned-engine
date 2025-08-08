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
