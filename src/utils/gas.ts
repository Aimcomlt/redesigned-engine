import { type Provider } from 'ethers';

export interface EstimateGasUsdParams {
  /** Provider for accessing network fee data */
  provider: Provider;
  /** Number of gas units the transaction is expected to consume */
  gasUnits: bigint;
  /** Current ETH price in USD for normalization */
  ethUsd: number;
}

/**
 * Estimates the USD cost of executing a transaction by fetching
 * current gas fee information from the provider and converting the
 * expected gas usage into a USD value.
 */
export async function estimateGasUsd(
  { provider, gasUnits, ethUsd }: EstimateGasUsdParams
): Promise<number> {
  const { maxFeePerGas, gasPrice } = await provider.getFeeData();
  const priceWei = maxFeePerGas ?? gasPrice;
  if (!priceWei) {
    throw new Error('Gas price data not available');
  }
  const wei = priceWei * gasUnits;
  const ether = wei / 1_000000000000000000n;
  const remainder = wei % 1_000000000000000000n;
  const ethAsNumber = Number(ether) + Number(remainder) / 1e18;
  return ethAsNumber * ethUsd;
}
