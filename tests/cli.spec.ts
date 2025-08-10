import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.resolve(__dirname, "..", "cli.ts");
const tsxPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx"
);

describe("cli", () => {
  it("handles invalid venues JSON gracefully", () => {
    const result = spawnSync(
      tsxPath,
      [cliPath, "--rpc=http://localhost:8545", "--venues=["],
      { encoding: "utf-8" }
    );
    expect(result.status).not.toBe(0);
    expect((result.stderr ?? "") + (result.stdout ?? "")).toContain("Invalid venues JSON");
  });
});
