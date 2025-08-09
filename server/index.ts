import express from "express";
import { json } from "body-parser";
import { validateBody } from "./middleware/validate";
import { vSafe, CandidatesInput, SimulateInput, ExecuteInput, SettingsInput } from "../src/shared/validation/valibot-schemas";
import { fetchCandidates } from "../src/core/candidates";
import { simulateCandidate } from "../src/core/arbitrage";
import { executeTrade } from "../src/core/execute";
import { saveSettings } from "../src/core/settings";

const app = express();
app.use(json());

app.post("/api/candidates", validateBody(v => vSafe(CandidatesInput, v)), async (req, res) => {
  // @ts-expect-error injected
  res.json(await fetchCandidates(req.parsed));
});

app.post("/api/simulate", validateBody(v => vSafe(SimulateInput, v)), async (req, res) => {
  // @ts-expect-error injected
  res.json(await simulateCandidate(req.parsed));
});

app.post("/api/execute", validateBody(v => vSafe(ExecuteInput, v)), async (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${process.env.AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  // @ts-expect-error injected
  res.json(await executeTrade(req.parsed));
});

app.post("/api/settings", validateBody(v => vSafe(SettingsInput, v)), async (req, res) => {
  // @ts-expect-error injected
  res.json(await saveSettings(req.parsed));
});

export default app;
