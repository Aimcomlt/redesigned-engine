/**
 * Checks whether the execution price stays within the allowed
 * slippage tolerance relative to the expected price.
 *
 * @param expected - Reference price before executing the swap
 * @param actual - Observed execution price
 * @param slippageBps - Allowed slippage in basis points
 * @returns true if the price difference is within tolerance
 */
export function checkSlippage(
  expected: number,
  actual: number,
  slippageBps: number
): boolean {
  const tolerance = slippageBps / 10_000;
  const diff = Math.abs(actual - expected) / expected;
  return diff <= tolerance;
}

export default { checkSlippage };
