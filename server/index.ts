import express from "express";
import cors from "cors";
import { JsonRpcProvider } from "ethers";
import rateLimit from "express-rate-limit";
import { validateBody } from "./middleware/validate";
import { requireAuth } from "./middleware/auth";
import { fetchCandidates } from "@/core/candidates";
import { simulateCandidate, type SimulateCandidateParams } from "@/core/arbitrage";
import { saveSettings } from "@/core/settings";
import { logger } from "@/utils/logger";
import type {
  CandidateParamsInput,
  CandidatesRequest,
  SimulateRequest,
  SettingsRequest,
} from "./schemas";
import {
  candidatesRequestSchema,
  simulateRequestSchema,
  settingsRequestSchema,
} from "./schemas";
import type { Candidate } from "@/core/candidates";
import { stream } from "./stream";
import { execute } from "./routes/execute";
import { vSafe, ExecuteInput } from "@/shared/validation/valibot-schemas";
import { register } from "@/utils/metrics";

interface CachedProvider {
  provider: JsonRpcProvider;
  lastUsed: number;
}

const providerCache = new Map<string, CachedProvider>();

const PROVIDER_TTL_MS = Number(process.env.PROVIDER_TTL_MS ?? 5 * 60 * 1000);

const cleanupProviders = () => {
  const now = Date.now();
  for (const [key, { provider, lastUsed }] of providerCache) {
    if (now - lastUsed > PROVIDER_TTL_MS) {
      providerCache.delete(key);
      provider.destroy();
    }
  }
};

export const getProvider = (url: string): JsonRpcProvider => {
  cleanupProviders();
  const cached = providerCache.get(url);
  const now = Date.now();
  if (cached) {
    cached.lastUsed = now;
    return cached.provider;
  }
  const provider = new JsonRpcProvider(url);
  providerCache.set(url, { provider, lastUsed: now });
  return provider;
};

export const destroyProviders = () => {
  cleanupProviders();
  for (const { provider } of providerCache.values()) {
    provider.destroy();
  }
  providerCache.clear();
};

process.on("SIGINT", destroyProviders);
process.on("SIGTERM", destroyProviders);
process.on("exit", destroyProviders);

const requireEnv = (name: string) => {
  const v = process.env[name];
  if (!v) {
    logger.error(`Missing required environment variable ${name}`);
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
app.use(cors({ origin: ["http://localhost:3000"] }));
app.use(express.json({ limit: "1mb" }));

// Request/response logging
app.use((req, res, next) => {
  const start = Date.now();
  logger.info({ method: req.method, url: req.originalUrl }, "request received");
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      { method: req.method, url: req.originalUrl, status: res.statusCode, duration },
      "request completed"
    );
  });
  next();
});

// Global rate limiter
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
  })
);

// Health check endpoint
app.get("/healthz", async (_req, res) => {
  try {
    const url = process.env.RPC_URL;
    if (url) {
      await getProvider(url).getBlockNumber();
    }
    res.send("ok");
  } catch {
    res.status(500).send("error");
  }
});

// Server-Sent Events stream for candidates and logs
app.get("/api/stream", requireAuth, stream);

// Expose metrics for Prometheus scraping
app.get("/metrics", requireAuth, async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.post("/api/candidates", requireAuth, validateBody(wrap<CandidatesRequest>(candidatesRequestSchema)), async (req, res) => {
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

app.post("/api/simulate", requireAuth, validateBody(wrap<SimulateRequest>(simulateRequestSchema)), async (req, res) => {
  // @ts-expect-error injected
  const params = buildSimulateParams(req.parsed.params, req.parsed.candidate);
  res.json(await simulateCandidate(params));
});

app.post("/api/execute", requireAuth, validateBody((v) => vSafe(ExecuteInput, v)), execute);

app.post(
  "/api/settings",
  requireAuth,
  validateBody(wrap<SettingsRequest>(settingsRequestSchema)),
  async (req, res) => {
    // @ts-expect-error injected
    const body = req.parsed;
    res.json(await saveSettings(body));
  }
);

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
