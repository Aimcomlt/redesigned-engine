import express, { Request, Response } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { JsonRpcProvider } from 'ethers';
import process from 'node:process';
import { engineEvents } from '../src/utils/hooks';
import {
  candidatesRequestSchema,
  candidatesResponseSchema,
  simulateRequestSchema,
  simulateResponseSchema,
  executeRequestSchema,
  executeResponseSchema,
  CandidateParamsInput,
  CandidatesRequest,
  SimulateRequest,
  ExecuteRequest,
} from './schemas';
import { validateBody, ParsedRequest } from './middleware/validate';
import {
  fetchCandidates,
  type Candidate,
  type CandidateParams
} from '../src/core/candidates';
import {
  simulateCandidate,
  type SimulateCandidateParams
} from '../src/core/arbitrage';
import main from '../index';

const app = express();
app.use(cors());
app.use(json());

// Stream of connected SSE clients
const clients = new Set<Response>();

function broadcast(event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(message);
  }
}

// Wire engine hooks to SSE broadcast
engineEvents.on('block', (block) => broadcast('block', { number: block }));
engineEvents.on('quote', (quote) => broadcast('quote', quote));
engineEvents.on('candidates', (candidates) =>
  broadcast('candidates', candidates)
);

// Heartbeat interval in ms
const HEARTBEAT_MS = 15000;

function toParams(body: CandidateParamsInput): CandidateParams {
  return {
    provider: new JsonRpcProvider(body.providerUrl),
    venues: body.venues,
    amountIn: BigInt(body.amountIn),
    token0: { ...body.token0, priceUsd: BigInt(body.token0.priceUsd) },
    token1: { ...body.token1, priceUsd: BigInt(body.token1.priceUsd) },
    slippageBps: body.slippageBps,
    gasUnits: BigInt(body.gasUnits),
    ethUsd: body.ethUsd,
    minProfitUsd: body.minProfitUsd,
  };
}

export function buildSimulateParams(
  body: CandidateParamsInput,
  candidate: Candidate
): SimulateCandidateParams {
  const { minProfitUsd: _ignored, ...rest } = toParams(body);
  return { ...rest, candidate };
}

app.post('/api/candidates', validateBody<CandidatesRequest>(candidatesRequestSchema), async (req: ParsedRequest<CandidatesRequest>, res: Response) => {
  const params = toParams(req.parsed);
  const candidates = await fetchCandidates(params);
  const out = candidatesResponseSchema.parse({ candidates });
  res.json(out);
});

app.post('/api/simulate', validateBody<SimulateRequest>(simulateRequestSchema), async (req: ParsedRequest<SimulateRequest>, res: Response) => {
  const { candidate: candidateInput, params: body } = req.parsed;
  const candidate: Candidate = candidateInput;
  const params = buildSimulateParams(body, candidate);
  const result = await simulateCandidate(params);
  const out = simulateResponseSchema.parse(result);
  res.json(out);
});

app.post('/api/execute', validateBody<ExecuteRequest>(executeRequestSchema), async (req: ParsedRequest<ExecuteRequest>, res: Response) => {
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${process.env.AUTH_TOKEN}`) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const params = toParams(req.parsed);
  await main(params);
  const out = executeResponseSchema.parse({ ok: true });
  res.json(out);
});

app.get('/api/stream', (req: Request, res: Response) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  res.flushHeaders();
  clients.add(res);

  // send heartbeat to keep connection alive
  const hb = setInterval(() => {
    res.write('event: heartbeat\ndata: {}\n\n');
  }, HEARTBEAT_MS);

  req.on('close', () => {
    clearInterval(hb);
    clients.delete(res);
  });
});

// Listen to new blocks and emit via engine hooks
if (process.env.RPC_URL) {
  const streamProvider = new JsonRpcProvider(process.env.RPC_URL);
  streamProvider.on('block', (b: number) => engineEvents.emit('block', b));
}

export function start() {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  start();
}

export default app;
