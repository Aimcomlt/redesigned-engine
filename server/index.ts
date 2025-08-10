import express from "express";
import { JsonRpcProvider } from "ethers";
import { validateBody } from "./middleware/validate";
import { fetchCandidates } from "../src/core/candidates";
import { simulateCandidate, type SimulateCandidateParams } from "../src/core/arbitrage";
import { saveSettings } from "../src/core/settings";
import type { CandidateParamsInput, CandidatesRequest, SimulateRequest } from "./schemas";
import { candidatesRequestSchema, simulateRequestSchema } from "./schemas";
import type { Candidate } from "../src/core/candidates";
import { stream } from "./stream";
import { execute } from "./routes/execute";
import { register } from "../src/utils/metrics";

const providerCache = new Map<string, JsonRpcProvider>();
const getProvider = (url: string): JsonRpcProvider => {
  let provider = providerCache.get(url);
  if (!provider) {
    provider = new JsonRpcProvider(url);
    providerCache.set(url, provider);
  }
  return provider;
};

const destroyProviders = () => {
  for (const provider of providerCache.values()) {
    provider.destroy();
  }
};

process.on("SIGINT", destroyProviders);
process.on("SIGTERM", destroyProviders);
process.on("exit", destroyProviders);

const requireEnv = (name: string) => {
  const v = process.env[name];
  if (!v) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variable ${name}`);
    process.exit(1);
  }
  return v;
};

requireEnv("AUTH_TOKEN");
if (process.env.EXEC_ENABLED === "1") {
  requireEnv("WS_RPC");
  requireEnv("BUNDLE_SIGNER_KEY");
}

const wrap = <T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { message: string } } }) => (v: unknown) => {
  const r = schema.safeParse(v);
  return r.success ? { success: true, data: r.data as T } : { success: false, error: r.error?.message };
};

const app = express();
app.use(express.json());

// Server-Sent Events stream for candidates and logs
app.get("/api/stream", stream);

// Expose metrics for Prometheus scraping
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.post("/api/candidates", validateBody(wrap<CandidatesRequest>(candidatesRequestSchema)), async (req, res) => {
  // @ts-expect-error injected
  const body = req.parsed;
  const provider = getProvider(body.providerUrl);
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
  const params = buildSimulateParams(req.parsed.params, req.parsed.candidate);
  res.json(await simulateCandidate(params));
});

app.post("/api/execute", execute);

app.post("/api/settings", async (req, res) => {
  res.json(await saveSettings(req.body));
});

export function buildSimulateParams(body: CandidateParamsInput, candidate: Candidate): SimulateCandidateParams {
  const provider = getProvider(body.providerUrl);
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
