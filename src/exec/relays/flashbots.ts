import type { Relay, ExecResult } from "../submit";
import { JsonRpcProvider, Wallet } from "ethers";

/**
 * Relay for sending transactions through Flashbots/builder.
 *
 * The relay requires a JSON-RPC endpoint and a bundle signer key. Both should
 * point to a Flashbots/builder compatible endpoint. Failures are caught and
 * returned as { ok: false, error } so that callers can handle them gracefully
 * without throwing.
 */
export class FlashbotsRelay implements Relay {
  private provider: JsonRpcProvider;
  private signer: Wallet;

  constructor(private opts: { rpcUrl: string; bundleSignerKey: string }) {
    this.provider = new JsonRpcProvider(opts.rpcUrl);
    this.signer = new Wallet(opts.bundleSignerKey, this.provider);
  }

  async sendPrivateTx(
    p: Parameters<Relay["sendPrivateTx"]>[0]
  ): Promise<ExecResult> {
    try {
      const txRequest = {
        to: this.signer.address,
        data: p.routeCalldata,
        maxFeePerGas: p.maxFeePerGas,
        maxPriorityFeePerGas: p.maxPriorityFeePerGas,
      } as const;

      // Sign and send the transaction as a private tx via Flashbots relay.
      const signed = await this.signer.signTransaction(txRequest);
      const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_sendRawTransaction",
        params: [signed],
      };

      const signature = await this.signer.signMessage(
        Buffer.from(JSON.stringify(body))
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      let res: Response;
      try {
        res = await fetch(this.opts.rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Flashbots-Signature": `${this.signer.address}:${signature}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.error?.message || res.statusText;
          return { ok: false, error: msg };
        } catch {
          return { ok: false, error: res.statusText };
        }
      }

      try {
        const json: any = await res.json();
        if (json.error) return { ok: false, error: json.error.message };
        return { ok: true, txHash: json.result };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: msg };
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { ok: false, error: "timeout" };
      }
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, error: msg };
    }
  }
}

