import reg from "./registry.json" assert { type: "json" };
import regMainnet from "./registry.mainnet.json" assert { type: "json" };

export function loadRegistry(chain: string) {
  if (chain === "mainnet") return regMainnet as any;
  return reg as any;
}
