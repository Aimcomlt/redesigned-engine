import { describe, it, expect } from "vitest";
import { runLoop } from "../../src/core/strategy";
import { normalizeStartup } from "../../src/core/context";

describe("loop perf (sanity)", () => {
  it("runs a couple of iterations quickly", async () => {
    const ctx = normalizeStartup({
      venues:[{name:"UniV2",type:"v2",address:"0x".padEnd(42,"0")}],
      token0:{address:"0x".padEnd(42,"1"),symbol:"T0",decimals:18},
      token1:{address:"0x".padEnd(42,"2"),symbol:"T1",decimals:18},
      amountIn:"1000000000000000000",
      slippageBps:50, gasUnits:"180000", ethUsd:3000, minProfitUsd:5
    });
    const start = Date.now();
    const p = runLoop(ctx);
    setTimeout(() => { (p as any).return?.(); }, 600); // stop after ~600ms
    await p.catch(()=>{});
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
