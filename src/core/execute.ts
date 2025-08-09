import { FlashbotsRelay } from "../exec/relays/flashbots";
import { executeWithRelay } from "../exec/submit";
import type { Relay, ExecResult } from "../exec/submit";

/**
 * Execute a trade via the configured Flashbots relay.
 *
 * RPC URL and bundle signer key are read from environment variables
 * `FLASHBOTS_RPC_URL` and `FLASHBOTS_SIGNER_KEY` respectively. Errors from the
 * relay are captured and returned so callers can handle them without throwing.
 */
export async function executeTrade(
  p: Parameters<Relay["sendPrivateTx"]>[0]
): Promise<ExecResult> {
  const rpcUrl = process.env.FLASHBOTS_RPC_URL || "";
  const bundleSignerKey = process.env.FLASHBOTS_SIGNER_KEY || "";
  const relay = new FlashbotsRelay({ rpcUrl, bundleSignerKey });

  try {
    return await executeWithRelay(relay, p);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

