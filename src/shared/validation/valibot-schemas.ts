import {
  object, string, number, array, union, literal, regex,
  minValue, maxValue, boolean, optional, record, safeParse, parse
} from "valibot";

export const Address = string([regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")]);
export const BigintString = string([regex(/^\d+$/, "Expected bigint as string")]);
export const HexBytes = string([regex(/^0x[0-9a-fA-F]*$/, "Invalid hex bytes")]);

export const Token = object({
  address: Address,
  symbol: string(),
  decimals: number([minValue(0), maxValue(255)]),
});

export const Venue = object({
  name: string(),
  type: union([literal("v2"), literal("v3")]),
  address: Address
});

export const CandidatesInput = object({
  venues: array(Venue, [minValue(1)]),
  token0: Token,
  token1: Token,
  amountIn: BigintString,
  slippageBps: number([minValue(0), maxValue(2000)]),
  gasUnits: BigintString,
  ethUsd: number([minValue(0.000001)]),
  minProfitUsd: number([minValue(0.01)]),
  tag: optional(string())
});

export const CandidateShape = object({
  buy: string(),
  sell: string(),
  amountIn: BigintString,
  expectedOut: BigintString,
  gasUsd: number([minValue(0)]),
  profitUsd: number(),
  meta: optional(record(string(), union([string(), number(), boolean()])))
});

export const SimulateInput = object({ candidate: CandidateShape });

export const ExecuteInput = object({
  routeCalldata: HexBytes,
  maxFeePerGas: BigintString,
  maxPriorityFeePerGas: BigintString,
  deadline: number([minValue(0)]),
  dryRun: optional(boolean())
});

export const SettingsInput = object({
  chainId: number([minValue(1)]),
  rpcUrl: string(),
  minProfitUsd: number([minValue(0.01)]),
  slippageBps: number([minValue(0), maxValue(2000)]),
  gasUnits: BigintString,
});

export function vParse<T>(schema: any, v: unknown): T { return parse(schema, v) as T; }
export function vSafe<T>(schema: any, v: unknown): { success: true; data: T } | { success: false; error: string } {
  const r = safeParse(schema, v);
  return r.success ? { success: true, data: r.output as T } : {
    success: false,
    error: r.issues.map(i => `${i.path?.join(".") ?? ""} ${i.message}`).join("; ")
  };
}

