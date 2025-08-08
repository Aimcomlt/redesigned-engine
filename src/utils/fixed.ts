export const Q96 = 1n << 96n;

/**
 * Converts an integer value to Q64.96 fixed-point format.
 * This is referenced as `q98` to provide a short helper
 * for working with Q64.96 numbers.
 */
export function q98(value: bigint | number): bigint {
  return BigInt(value) * Q96;
}

/**
 * Converts a Q64.96 value back to a JavaScript number.
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
