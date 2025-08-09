import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { JsonRpcProvider } from 'ethers';
import process from 'node:process';
import {
  candidatesRequestSchema,
  candidatesResponseSchema,
  simulateRequestSchema,
  simulateResponseSchema,
  executeRequestSchema,
  executeResponseSchema,
  CandidateParamsInput,
} from './schemas';
import { fetchCandidates } from '../src/core/candidates';
import { simulateCandidate } from '../src/core/arbitrage';
import main from '../index';

const app = express();
app.use(cors());
app.use(express.json());

function validate(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.format() });
      return;
    }
    (req as any).data = result.data;
    next();
  };
}

function toParams(body: CandidateParamsInput) {
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

app.post('/api/candidates', validate(candidatesRequestSchema), async (req: Request, res: Response) => {
  const params = toParams((req as any).data);
  const candidates = await fetchCandidates(params);
  const out = candidatesResponseSchema.parse({ candidates });
  res.json(out);
});

app.post('/api/simulate', validate(simulateRequestSchema), async (req: Request, res: Response) => {
  const { candidate, params: body } = (req as any).data;
  const params = { ...toParams(body), candidate } as any;
  const result = await simulateCandidate(params);
  const out = simulateResponseSchema.parse(result);
  res.json(out);
});

app.post('/api/execute', validate(executeRequestSchema), async (req: Request, res: Response) => {
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${process.env.AUTH_TOKEN}`) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const params = toParams((req as any).data);
  await main(params);
  const out = executeResponseSchema.parse({ ok: true });
  res.json(out);
});

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
