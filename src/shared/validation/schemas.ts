import { z } from 'zod';

export const Address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const BigintString = z.string().regex(/^\d+$/);

export const TokenSchema = z.object({
  decimals: z.number(),
  priceUsd: BigintString,
});

export const VenueSchema = z.object({
  name: z.string(),
  type: z.enum(['v2', 'v3']),
  address: Address,
});

export const CandidatesInput = z.object({
  providerUrl: z.string().url(),
  venues: z.array(VenueSchema),
  amountIn: BigintString,
  token0: TokenSchema,
  token1: TokenSchema,
  slippageBps: z.number(),
  gasUnits: BigintString,
  ethUsd: z.number(),
  minProfitUsd: z.number().optional().default(0),
});

export const SimulateInput = z.object({
  candidate: z.object({
    buy: BigintString,
    sell: BigintString,
    profitUsd: z.number(),
  }),
  params: CandidatesInput,
});

export type TCandidatesInput = z.infer<typeof CandidatesInput>;
export type TSimulateInput = z.infer<typeof SimulateInput>;

