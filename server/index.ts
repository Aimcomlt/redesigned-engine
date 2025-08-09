import express from "express";
import { json } from "body-parser";
import { JsonRpcProvider } from "ethers";
import { validateBody } from "./middleware/validate";
import { fetchCandidates } from "../src/core/candidates";
import { simulateCandidate, type SimulateCandidateParams } from "../src/core/arbitrage";
import { executeTrade } from "../src/core/execute";
import { saveSettings } from "../src/core/settings";
import type { CandidateParamsInput, CandidatesRequest, SimulateRequest, ExecuteRequest } from "./schemas";
import { candidatesRequestSchema, simulateRequestSchema, executeRequestSchema } from "./schemas";
import type { Candidate } from "../src/core/candidates";

const wrap = <T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { message: string } } }) => (v: unknown) => {
  const r = schema.safeParse(v);
  return r.success ? { success: true, data: r.data as T } : { success: false, error: r.error?.message };
};

const app = express();
app.use(json());

app.post("/api/candidates", validateBody(wrap<CandidatesRequest>(candidatesRequestSchema)), async (req, res) => {
  // @ts-expect-error injected
  const body = req.parsed;
  const provider = new JsonRpcProvider(body.providerUrl);
  const params = {
    provider,
    venues: body.venues,
    amountIn: BigInt(body.amountIn),
    token0: { address: body.token0.address, decimals: body.token0.decimals, priceUsd: BigInt(body.token0.priceUsd) },
    token1: { address: body.token1.address, decimals: body.token1.decimals, priceUsd: BigInt(body.token1.priceUsd) },
    slippageBps: body.slippageBps,
    gasUnits: BigInt(body.gasUnits),
    ethUsd: body.ethUsd,
    minProfitUsd: body.minProfitUsd,
  };
  const list = await fetchCandidates(params as any);
  res.json({ candidates: list });
});

app.post("/api/simulate", validateBody(wrap<SimulateRequest>(simulateRequestSchema)), async (req, res) => {
  // @ts-expect-error injected
  res.json(await simulateCandidate(req.parsed));
});

app.post("/api/execute", validateBody(wrap<ExecuteRequest>(executeRequestSchema)), async (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${process.env.AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  // @ts-expect-error injected
  res.json(await executeTrade(req.parsed));
});

app.post("/api/settings", async (req, res) => {
  res.json(await saveSettings(req.body));
});

export function buildSimulateParams(body: CandidateParamsInput, candidate: Candidate): SimulateCandidateParams {
  const provider = new JsonRpcProvider(body.providerUrl);
  return {
    candidate,
    provider,
    venues: body.venues,
    amountIn: BigInt(body.amountIn),
    token0: { address: body.token0.address, decimals: body.token0.decimals, priceUsd: BigInt(body.token0.priceUsd) },
    token1: { address: body.token1.address, decimals: body.token1.decimals, priceUsd: BigInt(body.token1.priceUsd) },
    slippageBps: body.slippageBps,
    gasUnits: BigInt(body.gasUnits),
    ethUsd: body.ethUsd,
  };
}

export default app;
