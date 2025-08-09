import { fromQ96 } from './fixed';

export interface TokenInfo {
  /** ERC20 contract address */
  address?: string;
  /** Number of decimals the token uses */
  decimals: number;
  /** USD price per whole token encoded as Q64.96 */
  priceUsd: bigint;
}

/**
 * Converts a raw token amount to a USD value using the token price.
 */
export function toUsd(tokenAmount: bigint, token: TokenInfo): number {
  const amount = Number(tokenAmount) / 10 ** token.decimals;
  const price = fromQ96(token.priceUsd);
  return amount * price;
}
