import { object, string, number, literal, union, refine, size, create } from "superstruct";

export const Address = refine(string(), "Address", v => /^0x[a-fA-F0-9]{40}$/.test(v));
export const Hex = refine(string(), "Hex", v => /^0x[0-9a-fA-F]*$/.test(v));
export const BigintString = refine(string(), "BigintString", v => /^\d+$/.test(v));

export const ReserveSnapshot = object({
  pair: Address,
  reserve0: BigintString,
  reserve1: BigintString,
  blockNumber: number(),
});

export const Slot0 = object({
  sqrtPriceX96: BigintString,
  tick: number(),
  observationIndex: number(),
});

export const FeeData = object({
  baseFeePerGas: BigintString,
  maxFeePerGas: BigintString,
  maxPriorityFeePerGas: BigintString,
});

export const VenueReady = object({
  name: size(string(), 1, 64),
  type: union([literal("v2"), literal("v3")]),
  address: Address,
});

// Throwing creators (fast)
export const asReserveSnapshot = (v: unknown) => create(v, ReserveSnapshot);
export const asSlot0 = (v: unknown) => create(v, Slot0);
export const asFeeData = (v: unknown) => create(v, FeeData);
export const asVenueReady = (v: unknown) => create(v, VenueReady);

// Inlined hot checks
export const isBigintStr = (s: unknown): s is string => typeof s === "string" && /^\d+$/.test(s);
export const isAddr = (s: unknown): s is string => typeof s === "string" && /^0x[a-fA-F0-9]{40}$/.test(s);
