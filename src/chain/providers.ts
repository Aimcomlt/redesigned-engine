import { createPublicClient, http, webSocket } from "viem";
import { mainnet, arbitrum, polygon, optimism, bsc } from "viem/chains";

const CHAINS = { mainnet, arbitrum, polygon, optimism, bsc } as const;
type ChainKey = keyof typeof CHAINS;
const CHAIN_KEY = (process.env.CHAIN as ChainKey) || "mainnet";
export const CHAIN = CHAINS[CHAIN_KEY];

const PID = process.env.INFURA_PROJECT_ID!;
const PID_FALL = process.env.INFURA_PROJECT_ID_FALLBACK || PID;

const WS_ENDPOINTS = [
  `wss://${CHAIN_KEY}.infura.io/ws/v3/${PID}`,
  `wss://${CHAIN_KEY}.infura.io/ws/v3/${PID_FALL}`
];
const HTTP_ENDPOINTS = [
  `https://${CHAIN_KEY}.infura.io/v3/${PID}`,
  `https://${CHAIN_KEY}.infura.io/v3/${PID_FALL}`
];

export function mkWsClient(i = 0) {
  return createPublicClient({ chain: CHAIN, transport: webSocket(WS_ENDPOINTS[i % WS_ENDPOINTS.length]) });
}
export function mkHttpClient(i = 0) {
  return createPublicClient({ chain: CHAIN, transport: http(HTTP_ENDPOINTS[i % HTTP_ENDPOINTS.length]) });
}
