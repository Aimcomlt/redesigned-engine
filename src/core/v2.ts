import { Contract, type Provider } from 'ethers';
import invariant from 'tiny-invariant';

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
];

export interface V2Quote {
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  price0: number;
  price1: number;
}

/**
 * Fetches reserve and price data for a Uniswap V2-style pair.
 * Prices are expressed as token1 per token0 and token0 per token1,
 * adjusted for the provided fee in basis points.
 */
export async function getV2Quote(
  provider: Provider,
  pair: string,
  feeBps = 30
): Promise<V2Quote> {
  const contract = new Contract(pair, PAIR_ABI, provider);
  const [token0, token1, reserves] = await Promise.all([
    contract.token0() as Promise<string>,
    contract.token1() as Promise<string>,
    contract.getReserves() as Promise<[bigint, bigint, bigint]>
  ]);

  const [reserve0, reserve1] = reserves;

  invariant(reserve0 > 0n && reserve1 > 0n, 'Pool has no liquidity');

  const fee = 1 - feeBps / 10_000;
  const price0 = (Number(reserve1) / Number(reserve0)) * fee;
  const price1 = (Number(reserve0) / Number(reserve1)) * fee;

  return { token0, token1, reserve0, reserve1, price0, price1 };
}

export default { getV2Quote };

