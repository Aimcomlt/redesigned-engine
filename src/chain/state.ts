type V2State = { reserve0: bigint; reserve1: bigint; block: bigint };
type V3State = { sqrtPriceX96: bigint; tick: number; block: bigint };
export type PoolState = V2State | V3State;

const state = new Map<string, PoolState>();
const touched = new Set<string>();

export function markTouched(addresses: string[]) {
  addresses.forEach((a) => touched.add(a.toLowerCase()));
}
export function drainTouched(): string[] {
  const list = Array.from(touched.values());
  touched.clear();
  return list;
}
export function setPoolState(addr: string, s: PoolState) {
  state.set(addr.toLowerCase(), s);
}
export function getPoolState(addr: string): PoolState | undefined {
  return state.get(addr.toLowerCase());
}
export function allStates() {
  return Array.from(state.entries());
}
