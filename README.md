redesigned-engine
Overview
redesigned-engine is a TypeScript-powered arbitrage engine designed to locate, simulate, and execute profitable trades across decentralized exchanges (DEXs).
It provides modular building blocks for fetching quotes, calculating arbitrage candidates, applying risk guards, and logging metrics—usable via CLI or as a library.

Features
Multi‑venue quote aggregation – Supports Uniswap V2/V3 style pools.

Candidate builder & simulator – Identify potential trades and recompute expected profit with fresh data.

Risk controls – Slippage checks, allowance readiness, and “canary” test trades.

Metrics & logging – Pino-based logging plus Prometheus counters for success/failure/gas usage.

TypeScript-first design – Ships with typings and strict compile options.

Getting Started
Prerequisites
Node.js 18+

npm, pnpm, or yarn

Installation
git clone <repo-url>
cd redesigned-engine
npm install           # or pnpm install / yarn install
Environment Variables
Copy .env and populate as needed:

Variable	Description
RPC_URL	Ethereum JSON‑RPC endpoint
PRIVATE_KEY	Wallet private key used for execution
CHAIN_ID	Target chain ID
MIN_PROFIT_USD	Minimum USD profit required to trade
SLIPPAGE_BPS	Slippage tolerance in basis points
Usage
CLI
Run simple candidate discovery & simulation:

npx ts-node cli.ts \
  --rpc=https://rpc.example \
  --venues='[{"name":"uniV2","type":"v2","address":"0x..."},{"name":"uniV3","type":"v3","address":"0x..."}]' \
  --amount-in=1000000000000000000 \
  --token0-decimals=18 --token1-decimals=18 \
  --token0-price-usd=1000000000000000000 \
  --token1-price-usd=1000000000000000000 \
  --slippage-bps=50 --gas-units=200000 --eth-usd=3200 \
  --min-profit-usd=5
Outputs candidate list followed by lightweight simulation results.

Library
import { main, buildCandidates, simulateCandidate } from './index';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider(process.env.RPC_URL!);
const venues = [{ name: 'uniV2', type: 'v2', address: '0x...' }];

await main({
  provider,
  venues,
  amountIn: 1_000_000n,
  token0: { decimals: 18, priceUsd: BigInt(1e18) },
  token1: { decimals: 18, priceUsd: BigInt(1e18) },
  slippageBps: 50,
  gasUnits: 200_000n,
  ethUsd: 3200,
  minProfitUsd: 5
});
Streaming API
The server exposes a Server-Sent Events endpoint at `/api/stream`.
It broadcasts:

* `block` – new block numbers from the connected chain
* `quote` – latest price quotes used by the engine
* `candidates` – recomputed arbitrage candidates
* `heartbeat` – keep-alive message every 15s

Clients should reconnect when the connection closes. Browsers using
`EventSource` do this automatically and will resume listening after a
disconnect.

```js
const stream = new EventSource('http://localhost:3001/api/stream');
stream.addEventListener('heartbeat', () => {
  // heartbeat received – connection alive
});
stream.addEventListener('block', (e) => {
  console.log('new block', JSON.parse(e.data));
});
```

Testing
npm test          # runs Vitest suite
Project Structure
├─ index.ts             # Library entry: main workflow and exports
├─ cli.ts               # Command-line interface
├─ src/
│  ├─ core/             # Arbitrage logic (candidates, simulation, strategies, AMM integrations)
│  ├─ risk/             # Slippage & guard checks
│  ├─ utils/            # Logging, metrics, fixed-point helpers
│  └─ test/             # Unit tests
Contributing
Fork & branch.

Ensure tests pass and code compiles (npm test).

Submit a pull request with a clear description.

License
Distributed under the MIT License. See LICENSE (if present) for details.
