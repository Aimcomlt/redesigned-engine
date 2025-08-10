import type { Request, Response } from "express";
import { executeWithRelay } from "../../src/exec/submit";
import { FlashbotsRelay } from "../../src/exec/relays/flashbots";

const EXEC_ENABLED = process.env.EXEC_ENABLED === "1";
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

  // @ts-expect-error injected by validateBody middleware
  const body = req.parsed as any;

  let rel: FlashbotsRelay;
  try {
    rel = getRelay();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }

  const out = await executeWithRelay(rel, {
    ...body,
    maxFeePerGas: BigInt(body.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(body.maxPriorityFeePerGas),
  } as any);

  res.status(out.ok ? 200 : 500).json(out);
}
