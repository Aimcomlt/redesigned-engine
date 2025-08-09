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
  constructor(private opts: { rpcUrl: string; bundleSignerKey: string }) {}

  async sendPrivateTx(
    p: Parameters<Relay["sendPrivateTx"]>[0]
  ): Promise<ExecResult> {
    try {
      // Initialize provider & signer
      const provider = new JsonRpcProvider(this.opts.rpcUrl);
      const signer = new Wallet(this.opts.bundleSignerKey, provider);

      const txRequest = {
        to: signer.address,
        data: p.routeCalldata,
        maxFeePerGas: p.maxFeePerGas,
        maxPriorityFeePerGas: p.maxPriorityFeePerGas,
      } as const;

      // Sign and send the transaction as a private tx via Flashbots relay.
      const signed = await signer.signTransaction(txRequest);
      const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_sendRawTransaction",
        params: [signed],
      };

      const signature = await signer.signMessage(
        Buffer.from(JSON.stringify(body))
      );

      const res = await fetch(this.opts.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Flashbots-Signature": `${signer.address}:${signature}`,
        },
        body: JSON.stringify(body),
      });

      const json: any = await res.json();
      if (json.error) return { ok: false, error: json.error.message };
      return { ok: true, txHash: json.result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, error: msg };
    }
  }
}

