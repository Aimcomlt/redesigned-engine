import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z
  .object({
    RPC_URL: z.string().url(),
    PRIVATE_KEY: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
    CHAIN_ID: z.coerce.number().int().positive().default(1),
    MIN_PROFIT_USD: z.coerce.number().nonnegative(),
    SLIPPAGE_BPS: z.coerce.number().int().nonnegative(),
    AUTH_TOKEN: z.string().optional(),
    EXEC_ENABLED: z.enum(['0', '1']).optional(),
    WS_RPC: z.string().url().optional(),
    BUNDLE_SIGNER_KEY: z
      .string()
      .regex(/^0x[0-9a-fA-F]{64}$/)
      .optional(),
  })
  .refine(env => env.EXEC_ENABLED !== '1' || env.WS_RPC, {
    message: 'WS_RPC is required when EXEC_ENABLED=1',
    path: ['WS_RPC'],
  })
  .refine(env => env.EXEC_ENABLED !== '1' || env.BUNDLE_SIGNER_KEY, {
    message: 'BUNDLE_SIGNER_KEY is required when EXEC_ENABLED=1',
    path: ['BUNDLE_SIGNER_KEY'],
  });

export type Config = {
  rpcUrl: string;
  privateKey: string;
  chainId: number;
  minProfitUsd: number;
  slippageBps: number;
  authToken?: string;
  execEnabled: boolean;
  wsRpc?: string;
  bundleSignerKey?: string;
};

export async function loadConfig(): Promise<Config> {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid environment variables: ${msg}`);
  }
  const env = parsed.data;
  return {
    rpcUrl: env.RPC_URL,
    privateKey: env.PRIVATE_KEY,
    chainId: env.CHAIN_ID,
    minProfitUsd: env.MIN_PROFIT_USD,
    slippageBps: env.SLIPPAGE_BPS,
    authToken: env.AUTH_TOKEN,
    execEnabled: env.EXEC_ENABLED === '1',
    wsRpc: env.WS_RPC,
    bundleSignerKey: env.BUNDLE_SIGNER_KEY
  };
}
