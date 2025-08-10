import type { Request, Response } from "express";
import { timingSafeEqual } from "crypto";
import { vSafe, ExecuteInput } from "../../src/shared/validation/valibot-schemas";
import { executeWithRelay } from "../../src/exec/submit";
import { FlashbotsRelay } from "../../src/exec/relays/flashbots";

const EXEC_ENABLED = process.env.EXEC_ENABLED === "1";
const AUTH_TOKEN = process.env.AUTH_TOKEN || "";

let relay: FlashbotsRelay;
function getRelay(): FlashbotsRelay {
  if (!relay) {
    relay = new FlashbotsRelay({
      rpcUrl: process.env.WS_RPC || "",
      bundleSignerKey: process.env.BUNDLE_SIGNER_KEY || "",
    });
  }
  return relay;
}

export async function execute(req: Request, res: Response) {
  if (!EXEC_ENABLED) return res.status(403).json({ error: "execution disabled" });

  const provided = req.headers.authorization ?? "";
  const expected = `Bearer ${AUTH_TOKEN}`;
  const authorized =
    AUTH_TOKEN &&
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

  if (!authorized) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const r = vSafe(ExecuteInput, req.body);
  if (!r.success) return res.status(400).json({ error: r.error });

  let rel: FlashbotsRelay;
  try {
    rel = getRelay();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }

  const out = await executeWithRelay(rel, {
    ...r.data,
    maxFeePerGas: BigInt(r.data.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(r.data.maxPriorityFeePerGas)
  } as any);

  res.status(out.ok ? 200 : 500).json(out);
}
