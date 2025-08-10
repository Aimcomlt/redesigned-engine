import { describe, it, expect, vi } from "vitest";
import http from "node:http";
import { FlashbotsRelay } from "@/exec/relays/flashbots";

describe("FlashbotsRelay", () => {
  it("times out on slow relay", async () => {
    vi.useFakeTimers();

    const server = http.createServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ result: "0x1" }));
      }, 15_000);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    const relay = new FlashbotsRelay({
      rpcUrl: `http://127.0.0.1:${port}`,
      bundleSignerKey: "0x" + "11".repeat(32),
    });
    (relay as any).signer = {
      address: "0x" + "22".repeat(20),
      signTransaction: async () => "0xsigned",
      signMessage: async () => "0xsignature",
    };

    const promise = relay.sendPrivateTx({
      routeCalldata: "0x",
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      deadline: Math.floor(Date.now() / 1000) + 60,
    });

    await vi.advanceTimersByTimeAsync(10_000);
    const result = await promise;
    expect(result).toEqual({ ok: false, error: "timeout" });

    await new Promise<void>((resolve) => server.close(() => resolve()));
    vi.useRealTimers();
  });
});

