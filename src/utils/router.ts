import { Contract, type Signer } from 'ethers';

// Mainnet addresses for Uniswap routers
export const V2_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const V3_ROUTER_ADDRESS = '0x68b3465833FB72A70eCDF485E0e4C7bD8665Fc45';

// Minimal ABIs with only the swap methods we use
const V2_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)'
];

const V3_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)'
];

export function getV2Router(signer: Signer): Contract {
  return new Contract(V2_ROUTER_ADDRESS, V2_ROUTER_ABI, signer);
}

export function getV3Router(signer: Signer): Contract {
  return new Contract(V3_ROUTER_ADDRESS, V3_ROUTER_ABI, signer);
}

