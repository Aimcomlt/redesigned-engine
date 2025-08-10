import { createPublicClient, http, getAddress } from "viem";
import { mainnet } from "viem/chains";
import fs from "node:fs";
import tokens from "@/chain/tokens.mainnet.json" assert { type: "json" };

const client = createPublicClient({ chain: mainnet, transport: http(process.env.HTTP_RPC || `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`) });

// ABIs (minimal)
const V2_FACTORY = [{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}] as const;
const V3_FACTORY = [{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}] as const;

const UNI_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f" as `0x${string}`;
const SUSHI_V2_FACTORY = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac" as `0x${string}`;
const UNI_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984" as `0x${string}`;

const V3_FEES = [500, 3000, 10000] as const;

// choose your pairs here
const PAIRS = [
  ["WETH","USDC"],
  ["WETH","DAI"],
  ["WBTC","WETH"]
] as const;

async function v2GetPair(factory:`0x${string}`, a:`0x${string}`, b:`0x${string}`){
  return client.readContract({ address: factory, abi: V2_FACTORY, functionName: "getPair", args: [a, b] }) as Promise<`0x${string}`>;
}
async function v3GetPool(factory:`0x${string}`, a:`0x${string}`, b:`0x${string}`, fee:number){
  return client.readContract({ address: factory, abi: V3_FACTORY, functionName: "getPool", args: [a, b, fee] }) as Promise<`0x${string}`>;
}
const isZero = (a:`0x${string}`) => a === "0x0000000000000000000000000000000000000000";

(async () => {
  const v2PairsUni:any[] = [];
  const v2PairsSushi:any[] = [];
  const v3Pools:any[] = [];

  for (const [X,Y] of PAIRS){
    const ax = getAddress(tokens[X as keyof typeof tokens]) as `0x${string}`;
    const ay = getAddress(tokens[Y as keyof typeof tokens]) as `0x${string}`;

    // sort addresses for V2 getPair (factory expects tokenA, tokenB without order constraints but deterministic)
    const [a,b] = ax.toLowerCase() < ay.toLowerCase() ? [ax,ay] : [ay,ax];

    const u2 = await v2GetPair(UNI_V2_FACTORY, a, b);
    if (!isZero(u2)) v2PairsUni.push({ symbol: `${X}/${Y}`, pair: u2 });

    const s2 = await v2GetPair(SUSHI_V2_FACTORY, a, b);
    if (!isZero(s2)) v2PairsSushi.push({ symbol: `${X}/${Y}`, pair: s2 });

    for (const fee of V3_FEES){
      const p = await v3GetPool(UNI_V3_FACTORY, ax, ay, fee);
      if (!isZero(p)) v3Pools.push({ symbol: `${X}/${Y} ${fee/100}%`, pool: p });
    }
  }

  const registry = {
    uniswapV2: { factory: UNI_V2_FACTORY, router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", pairs: v2PairsUni },
    sushiV2:   { factory: SUSHI_V2_FACTORY, router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", pairs: v2PairsSushi },
    uniswapV3: { factory: UNI_V3_FACTORY, router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", pools: v3Pools },
    curve:     { addressProvider: "0x0000000022D53366457F9d5E68Ec105046FC4383", pools: [] }
  };

  fs.writeFileSync("src/chain/registry.mainnet.json", JSON.stringify(registry, null, 2));
  console.log("✅ registry.mainnet.json updated");
})();
