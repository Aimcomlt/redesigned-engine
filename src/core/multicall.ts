import { Contract, type Provider } from 'ethers';

// ABI for the original Multicall contract's aggregate method
const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)'
];

// Known Multicall contract addresses on popular networks
const MULTICALL_ADDRESS: Record<number, string> = {
  1: '0x5ba1e12693dc8f9c48aad8770482f4739beed696', // Ethereum
  5: '0x77d7e4a05a970818a318ceb8b68e4da0790b41d0', // Goerli
  10: '0x5ba1e12693dc8f9c48aad8770482f4739beed696', // Optimism
  56: '0x1ee38d535d541c55c9dae27b12edf090c608e6fb', // BSC
  137: '0x275617327c958bD06b5D6b871E7f491D76113dd8', // Polygon
  42161: '0x5ba1e12693dc8f9c48aad8770482f4739beed696', // Arbitrum
  8453: '0xca11bde05977b3631167028862be2a173976ca11'  // Base
};

/**
 * A single call executed via Multicall.
 * `decode` should transform the returned bytes into the desired value.
 */
export interface MulticallRequest<T = unknown> {
  target: string;
  callData: string;
  decode: (returnData: string) => T;
}

/**
 * Executes many read-only calls in a single RPC request using the on-chain
 * Multicall contract. Results are decoded using the caller supplied decode
 * functions, allowing callers (e.g. adapter quote requests) to easily obtain
 * structured return data.
 */
export async function call<T = unknown>(
  data: MulticallRequest<T>[],
  provider: Provider
): Promise<T[]> {
  const network = await provider.getNetwork();
  const address = MULTICALL_ADDRESS[Number(network.chainId)];

  if (!address) {
    throw new Error(`Multicall contract not deployed for chain ${network.chainId}`);
  }

  const multicall = new Contract(address, MULTICALL_ABI, provider);
  const [, returnData]: [bigint, string[]] = await multicall.aggregate(
    data.map((d) => [d.target, d.callData])
  );

  return returnData.map((bytes, i) => data[i].decode(bytes));
}

export default { call };

