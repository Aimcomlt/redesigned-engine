/**
 * 2^96 scaling factor used for Q64.96 fixed-point numbers.
 */
export const Q96 = 1n << 96n;

/**
 * Converts an integer to Q64.96 fixed-point format by multiplying by 2^96.
 */
export function toQ96(value: bigint | number): bigint {
  return BigInt(value) * Q96;
}

/**
 * Converts a Q64.96 fixed-point value back to a JavaScript number by dividing
 * by 2^96.
 */
export function fromQ96(value: bigint): number {
  return Number(value) / Number(Q96);
}

/**
 * Multiplies two Q64.96 values returning a Q64.96 result.
 */
export function mulQ64x96(a: bigint, b: bigint): bigint {
  return (a * b) / Q96;
}

/**
 * Divides two Q64.96 values returning a Q64.96 result.
 */
export function divQ64x96(a: bigint, b: bigint): bigint {
  return (a * Q96) / b;
}
