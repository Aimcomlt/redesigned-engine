export function shardAddresses<T extends string>(addrs: T[], nShards: number): T[][] {
  const shards: T[][] = Array.from({ length: nShards }, () => []);
  addrs.forEach((a, i) => shards[i % nShards].push(a));
  return shards;
}
