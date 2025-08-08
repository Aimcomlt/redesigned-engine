/**
 * Result returned by swap simulation functions.
 */
export interface SimResult {
  /** Whether the swap passes the configured slippage guard */
  ok: boolean;
  /** Expected profit in output token terms */
  expectedProfit: number;
}
