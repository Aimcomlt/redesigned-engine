import { Contract, type Provider } from 'ethers';
import invariant from 'tiny-invariant';

const POOL_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function fee() view returns (uint24)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

export interface V3Quote {
  token0: string;
  token1: string;
  sqrtPriceX96: bigint;
  tick: number;
  fee: number;
  price: number;
}

/**
 * Fetches current price and state for a Uniswap V3 pool.
 * Price is expressed as token1 per token0 adjusted for the pool fee.
 */
export async function getV3Quote(
  provider: Provider,
  pool: string
): Promise<V3Quote> {
  const contract = new Contract(pool, POOL_ABI, provider);
  const [token0, token1, fee, slot0] = await Promise.all([
    contract.token0() as Promise<string>,
    contract.token1() as Promise<string>,
    contract.fee() as Promise<number>,
    contract.slot0() as Promise<[
      bigint,
      number,
      number,
      number,
      number,
      number,
      boolean
    ]>
  ]);

  const [sqrtPriceX96, tick] = slot0;

  invariant(sqrtPriceX96 > 0n, 'Pool has no liquidity');

  const priceBeforeFee = Number(
    (sqrtPriceX96 * sqrtPriceX96) / (1n << 192n)
  );
  const price = priceBeforeFee * (1 - fee / 1_000_000);

  return { token0, token1, sqrtPriceX96, tick, fee, price };
}

export default { getV3Quote };
