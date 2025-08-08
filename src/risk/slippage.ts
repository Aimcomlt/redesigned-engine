/**
 * Checks whether the execution price stays within the allowed
 * slippage tolerance relative to the expected price.
 *
 * @param expected - Reference price before executing the swap
 * @param actual - Observed execution price
 * @param slippageBps - Allowed slippage in basis points
 * @returns true if the price difference is within tolerance
 */
export const BPS_PER_UNIT = 10_000n;

export const DEFAULT_SLIPPAGE_BPS = 50;
export const DEFAULT_SLIPPAGE = DEFAULT_SLIPPAGE_BPS / 10_000;

export function checkSlippage(
  expected: number,
  actual: number,
  slippageBps: number
): boolean {
  const tolerance = slippageBps / 10_000;
  const diff = Math.abs(actual - expected) / expected;
  return diff <= tolerance;
}

export function calcMinOut(amount: bigint, slippageBps: number): bigint {
  const factor = BPS_PER_UNIT - BigInt(slippageBps);
  return (amount * factor) / BPS_PER_UNIT;
}

export function computeSlippageAdjustedOut(
  amount: bigint,
  slippageBps: number
): bigint {
  return calcMinOut(amount, slippageBps);
}

export default {
  checkSlippage,
  calcMinOut,
  computeSlippageAdjustedOut,
  DEFAULT_SLIPPAGE_BPS,
  DEFAULT_SLIPPAGE
};
