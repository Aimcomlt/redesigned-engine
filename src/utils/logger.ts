import pino from 'pino';

export interface TradeContext {
  /** Unique identifier for the trade */
  tradeId: string;
  /** Block number the trade was executed in */
  blockNumber: number;
  /** Profit realized from the trade */
  profit: number;
}

/**
 * Base logger instance configured with trade-specific fields. Use
 * `withTrade` to create a child logger bound to a particular trade.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    tradeId: undefined,
    blockNumber: undefined,
    profit: undefined
  }
});

/**
 * Returns a child logger pre-populated with the trade context so all
 * log entries include the tradeId, block number, and profit fields.
 */
export function withTrade(context: TradeContext) {
  return logger.child(context);
}
