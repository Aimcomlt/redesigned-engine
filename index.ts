/**
 * Placeholder application entry point.
 * Implementation will be added later.
 */
export function main(): void {
  // TODO: implement application logic
}

export {
  getV2Quote,
  simulateV2Swap,
  submitV2Swap,
  quoteOutV2
} from './src/core/v2';
export {
  getV3Quote,
  simulateV3Swap,
  submitV3Swap
} from './src/core/v3';
export { fetchCandidates } from './src/core/candidates';
export { buildCandidates, simulateCandidate } from './src/core/arbitrage';
export { buildStrategy } from './src/core/strategy';
export {
  checkSlippage,
  calcMinOut,
  computeSlippageAdjustedOut,
  DEFAULT_SLIPPAGE_BPS,
  DEFAULT_SLIPPAGE
} from './src/risk/slippage';
export { checkGuards } from './src/risk/guards';
export { logger, withTrade } from './src/utils/logger';
export {
  successCounter,
  failureCounter,
  gasCounter,
  register as metricsRegistry
} from './src/utils/metrics';
export default main;
