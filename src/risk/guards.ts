export interface GuardContext {
  /** Current gas price in wei */
  gasPrice: bigint;
  /** Maximum allowed gas price in wei */
  maxGasPrice: bigint;
  /** Reserve of token0 in the pool */
  reserve0: bigint;
  /** Reserve of token1 in the pool */
  reserve1: bigint;
  /** Minimum acceptable reserve for each token */
  minLiquidity: bigint;
  /** Block number the quote was produced at */
  blockTag: number;
  /** Latest block number from the provider */
  currentBlock: number;
  /** Maximum allowed difference between currentBlock and blockTag */
  maxBlockTagDrift: number;
}

/**
 * Checks a set of risk guards related to transaction execution.
 *
 * @param ctx - Context containing runtime information and limits
 * @returns An array of messages for each successful check
 * @throws Error if any guard condition is violated
 */
export function checkGuards(ctx: GuardContext): string[] {
  const messages: string[] = [];

  if (ctx.gasPrice > ctx.maxGasPrice) {
    throw new Error(`Gas price ${ctx.gasPrice} exceeds max ${ctx.maxGasPrice}`);
  }
  messages.push('gas price within limit');

  if (ctx.reserve0 < ctx.minLiquidity || ctx.reserve1 < ctx.minLiquidity) {
    throw new Error(
      `Pool liquidity below threshold ${ctx.minLiquidity}: ` +
        `(${ctx.reserve0}, ${ctx.reserve1})`
    );
  }
  messages.push('pool liquidity sufficient');

  const drift = Math.abs(ctx.currentBlock - ctx.blockTag);
  if (drift > ctx.maxBlockTagDrift) {
    throw new Error(
      `Block tag drift ${drift} exceeds max ${ctx.maxBlockTagDrift}`
    );
  }
  messages.push('block tag drift within limit');

  return messages;
}

export default { checkGuards };
