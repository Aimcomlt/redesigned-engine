import type { Request, Response } from "express";
import { vSafe, ExecuteInput } from "../../src/shared/validation/valibot-schemas";
import { executeWithRelay } from "../../src/exec/submit";
import { FlashbotsRelay } from "../../src/exec/relays/flashbots";

const EXEC_ENABLED = process.env.EXEC_ENABLED === "1";

export async function execute(req: Request, res: Response) {
  if (!EXEC_ENABLED) return res.status(403).json({ error: "execution disabled" });

  const r = vSafe(ExecuteInput, req.body);
  if (!r.success) return res.status(400).json({ error: r.error });

  const relay = new FlashbotsRelay({
    rpcUrl: process.env.WS_RPC || "",
    bundleSignerKey: process.env.BUNDLE_SIGNER_KEY || ""
  });

  const out = await executeWithRelay(relay, {
    ...r.data,
    maxFeePerGas: BigInt(r.data.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(r.data.maxPriorityFeePerGas)
  } as any);

  res.status(out.ok ? 200 : 500).json(out);
}
