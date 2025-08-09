import { describe, it, expect } from "vitest";
import { asReserveSnapshot, isBigintStr } from "../../src/workers/guards";

describe("worker guards", () => {
  it("maps reserve snapshot", () => {
    const snap = asReserveSnapshot({
      pair:"0x".padEnd(42,"a"), reserve0:"123", reserve1:"456", blockNumber: 10
    });
    expect(snap.reserve0).toBe("123");
  });

  it("fast bigint check", () => {
    expect(isBigintStr("999")).toBe(true);
    expect(isBigintStr("9a9")).toBe(false);
  });
});
