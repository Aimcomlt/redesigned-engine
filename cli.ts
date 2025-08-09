#!/usr/bin/env ts-node
import { JsonRpcProvider } from 'ethers';
import dotenv from 'dotenv';
import { toQ96 } from './src/utils/fixed';
import { buildCandidates, simulateCandidate } from './src/core/arbitrage';
import type { VenueConfig } from './src/core/candidates';

dotenv.config();

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

async function main() {
  const rpc = getArg('rpc') ?? getEnv('RPC_URL') ?? 'http://localhost:8545';
  const provider = new JsonRpcProvider(rpc);

  const venuesJson = getArg('venues') ?? getEnv('VENUES') ?? '[]';
  const venues: VenueConfig[] = JSON.parse(venuesJson);

  const amountInStr = getArg('amount-in') ?? getEnv('AMOUNT_IN') ?? '0';
  const amountIn = BigInt(amountInStr);

  const token0Decimals = Number(getArg('token0-decimals') ?? getEnv('TOKEN0_DECIMALS') ?? '18');
  const token0Price = BigInt(getArg('token0-price-usd') ?? getEnv('TOKEN0_PRICE_USD') ?? '0');
  const token0Address = getArg('token0-address') ?? getEnv('TOKEN0_ADDRESS') ?? '0x0000000000000000000000000000000000000000';
  const token1Decimals = Number(getArg('token1-decimals') ?? getEnv('TOKEN1_DECIMALS') ?? '18');
  const token1Price = BigInt(getArg('token1-price-usd') ?? getEnv('TOKEN1_PRICE_USD') ?? '0');
  const token1Address = getArg('token1-address') ?? getEnv('TOKEN1_ADDRESS') ?? '0x0000000000000000000000000000000000000000';

  const slippageBps = Number(getArg('slippage-bps') ?? getEnv('SLIPPAGE_BPS') ?? '0');
  const gasUnits = BigInt(getArg('gas-units') ?? getEnv('GAS_UNITS') ?? '0');
  const ethUsd = Number(getArg('eth-usd') ?? getEnv('ETH_USD') ?? '0');
  const minProfitUsd = Number(getArg('min-profit-usd') ?? getEnv('MIN_PROFIT_USD') ?? '0');

  const token0 = { address: token0Address, decimals: token0Decimals, priceUsd: toQ96(token0Price) };
  const token1 = { address: token1Address, decimals: token1Decimals, priceUsd: toQ96(token1Price) };

  const candidates = await buildCandidates({
    provider,
    venues,
    amountIn,
    token0,
    token1,
    slippageBps,
    gasUnits,
    ethUsd,
    minProfitUsd
  });

  console.log('candidates:', candidates);

  for (const c of candidates) {
    const sim = await simulateCandidate({
      candidate: c,
      provider,
      venues,
      amountIn,
      token0,
      token1,
      slippageBps,
      gasUnits,
      ethUsd
    });
    console.log('simulation:', sim);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
