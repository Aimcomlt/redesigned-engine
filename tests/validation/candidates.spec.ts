import { describe, it, expect } from "vitest";
import { CandidatesInput, vParse, vSafe } from "../../src/shared/validation/valibot-schemas";

describe("CandidatesInput", () => {
  it("accepts a valid payload", () => {
    const payload = {
      venues:[{name:"UniV2",type:"v2",address:"0x".padEnd(42,"0")}],
      token0:{address:"0x".padEnd(42,"1"),symbol:"T0",decimals:18},
      token1:{address:"0x".padEnd(42,"2"),symbol:"T1",decimals:18},
      amountIn:"1000000000000000000",
      slippageBps:50, gasUnits:"180000", ethUsd:3000, minProfitUsd:5
    } as const;
    const parsed = vParse<typeof payload>(CandidatesInput, payload);
    expect(parsed.venues.length).toBe(1);
  });

  it("rejects bad address", () => {
    const bad = {
      venues:[{name:"UniV2",type:"v2",address:"0x".padEnd(42,"0")}],
      token0:{address:"123",symbol:"T0",decimals:18},
      token1:{address:"0x".padEnd(42,"2"),symbol:"T1",decimals:18},
      amountIn:"1000000000000000000",
      slippageBps:50, gasUnits:"180000", ethUsd:3000, minProfitUsd:5
    };
    const r = vSafe(CandidatesInput, bad);
    expect(r.success).toBe(false);
  });
});
