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
HTTP API
The server exposes HTTP endpoints for candidate discovery, simulation, execution, and streaming updates.

### `POST /api/candidates`
Returns a list of potential arbitrage trades.

**Payload**

```json
{
  "providerUrl": "https://rpc.example",
  "venues": [{ "name": "uniV2", "type": "v2", "address": "0x..." }],
  "amountIn": "1000000000000000000",
  "token0": { "decimals": 18, "priceUsd": "1000000000000000000" },
  "token1": { "decimals": 18, "priceUsd": "1000000000000000000" },
  "slippageBps": 50,
  "gasUnits": "200000",
  "ethUsd": 3200,
  "minProfitUsd": 5
}
```

**Example**

```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -d '{"providerUrl":"https://rpc.example","venues":[{"name":"uniV2","type":"v2","address":"0x..."}],"amountIn":"1000000000000000000","token0":{"decimals":18,"priceUsd":"1000000000000000000"},"token1":{"decimals":18,"priceUsd":"1000000000000000000"},"slippageBps":50,"gasUnits":"200000","ethUsd":3200,"minProfitUsd":5}'
```

### `POST /api/simulate`
Simulates profit for a specific candidate.

**Payload**

```json
{
  "candidate": { "buy": "0x...", "sell": "0x...", "profitUsd": 0 },
  "params": { /* same fields as /api/candidates */ }
}
```

**Example**

```bash
curl -X POST http://localhost:3001/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"candidate":{"buy":"0x...","sell":"0x...","profitUsd":0},"params":{"providerUrl":"https://rpc.example","venues":[{"name":"uniV2","type":"v2","address":"0x..."}],"amountIn":"1000000000000000000","token0":{"decimals":18,"priceUsd":"1000000000000000000"},"token1":{"decimals":18,"priceUsd":"1000000000000000000"},"slippageBps":50,"gasUnits":"200000","ethUsd":3200,"minProfitUsd":5}}'
```

### `POST /api/execute`
Runs the engine with the provided parameters. Requires an `Authorization: Bearer` token.

**Example**

```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"providerUrl":"https://rpc.example","venues":[{"name":"uniV2","type":"v2","address":"0x..."}],"amountIn":"1000000000000000000","token0":{"decimals":18,"priceUsd":"1000000000000000000"},"token1":{"decimals":18,"priceUsd":"1000000000000000000"},"slippageBps":50,"gasUnits":"200000","ethUsd":3200,"minProfitUsd":5}'
```

### `GET /api/stream`
Server-Sent Events stream providing live `block`, `quote`, `candidates`, and periodic `heartbeat` messages.

```bash
curl -N http://localhost:3001/api/stream
```

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

React App
Commands and configuration for the front-end.

### Scripts

```bash
npm start    # start dev server at http://localhost:3000
npm run build# create production bundle
npm test     # run unit tests
```

### Environment Variables
Non‑secret variables prefixed with `VITE_` are exposed to the browser. Example `.env.client`:

```
VITE_API_URL=http://localhost:3001
VITE_SLIPPAGE_BPS=50
VITE_GAS_CEILING=300000
VITE_MIN_PROFIT_USD=10
```

### Execution Modes
- **Development** – `npm start` launches a hot‑reloading dev server.
- **Production** – `npm run build` outputs static assets served by Docker Nginx image.
- **Tests** – `npm test` runs the Vitest suite.

### State Management
The client uses [Redux Toolkit](https://redux-toolkit.js.org/) for global state. Slices live in `src/store` and are combined in `src/store/index.ts`. The store is provided to the component tree via React Redux's `<Provider>`, so components interact with state through `useDispatch` and `useSelector`. When running `npm start`, you can inspect and modify state using the Redux DevTools browser extension.

Docker Deployment
Build and run the stack with Docker Compose:

```bash
docker compose up --build
```

This starts the API, React frontend, and optional Prometheus/Grafana services. Secrets such as RPC keys or private keys belong in `.env.server` and remain only on the server container. Client `.env.client` should never contain sensitive values.

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

Validation & Types
Shared request and response schemas live in `src/shared/validation` and are
consumed by both the client and the server. Types are derived from these Zod
schemas using `z.infer`, so updating a schema automatically updates the
corresponding TypeScript types used in API calls and Express handlers.

To add a field:
1. Edit the relevant schema in `src/shared/validation/schemas.ts`.
2. Types such as `TCandidatesInput` and `TSimulateInput` will update
   automatically.
3. To try another validation library, implement a new adapter in
   `src/shared/validation/adapters.ts` and set `VALIDATOR` to `valibot` or
   `yup`.

Validation executes on the server via middleware, preventing secrets from being
validated in the browser or leaked to logs.
