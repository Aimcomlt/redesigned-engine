import type { CandidateParams, Candidate } from './src/core/candidates';
import {
  buildCandidates as buildArbCandidates,
  simulateCandidate as simulateArbCandidate
} from './src/core/arbitrage';
import { checkSlippage as slippageGuard } from './src/risk/slippage';
import { logger } from './src/utils/logger';
import { Contract } from 'ethers';

/**
 * Simple readiness check ensuring token allowances are configured.
 * In the real engine this would query ERC20 allowances for the wallet.
 */
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)'
];

async function checkAllowances(params: CandidateParams): Promise<boolean> {
  try {
    const owner = await params.provider.getSigner().getAddress();
    const token0 = params.token0.address;
    const token1 = params.token1.address;

    if (!token0 || !token1) {
      logger.error('token addresses missing');
      return false;
    }

    const token0Contract = new Contract(token0, ERC20_ABI, params.provider);
    const token1Contract = new Contract(token1, ERC20_ABI, params.provider);

    for (const venue of params.venues) {
      const [allow0, allow1] = await Promise.all([
        token0Contract.allowance(owner, venue.address) as Promise<bigint>,
        token1Contract.allowance(owner, venue.address) as Promise<bigint>
      ]);

      if (allow0 < params.amountIn) {
        logger.error(`insufficient allowance for token0 spender ${venue.address}`);
        return false;
      }

      if (allow1 < params.amountIn) {
        logger.error(`insufficient allowance for token1 spender ${venue.address}`);
        return false;
      }
    }

    return true;
  } catch (err) {
    logger.error({ err }, 'failed to check allowances');
    return false;
  }
}

/**
 * Performs a light simulation with a tiny trade size to make sure
 * the candidate still looks profitable right before execution.
 */
async function canaryRun(
  candidate: Candidate,
  params: CandidateParams
): Promise<boolean> {
  try {
    await simulateArbCandidate({
      candidate,
      provider: params.provider,
      venues: params.venues,
      amountIn: 1n,
      token0: params.token0,
      token1: params.token1,
      slippageBps: params.slippageBps,
      gasUnits: params.gasUnits,
      ethUsd: params.ethUsd
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Emits an alert through the logger. In a production system this would
 * forward to an external alerting/monitoring service.
 */
function alert(message: string, error?: unknown) {
  logger.error({ err: error }, message);
}

/**
 * Application entry point: build candidates, simulate them with fresh quotes
 * and execute the profitable ones. The function performs several readiness
 * checks such as token allowances, a slippage guard and a canary simulation
 * before attempting execution.
 */
export async function main(params: CandidateParams): Promise<void> {
  const candidates = await buildArbCandidates(params);

  for (const candidate of candidates) {
    const sim = await simulateArbCandidate({
      candidate,
      provider: params.provider,
      venues: params.venues,
      amountIn: params.amountIn,
      token0: params.token0,
      token1: params.token1,
      slippageBps: params.slippageBps,
      gasUnits: params.gasUnits,
      ethUsd: params.ethUsd
    });

    // Slippage guard – ensure profit hasn't deteriorated excessively
    const withinSlip = slippageGuard(
      candidate.profitUsd,
      sim.profitUsd,
      params.slippageBps
    );
    if (!withinSlip) {
      alert('slippage guard triggered for candidate');
      continue;
    }

    if (!(await checkAllowances(params))) {
      alert('token allowances not ready');
      continue;
    }

    if (!(await canaryRun(candidate, params))) {
      alert('canary run failed');
      continue;
    }

    // Execute the trade – in this simplified implementation we simply log it.
    logger.info(
      `Executing arbitrage buy ${candidate.buy} sell ${candidate.sell} ` +
        `expected profit ${sim.profitUsd.toFixed(2)} USD`
    );
  }
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
export { checkAllowances };
export default main;
