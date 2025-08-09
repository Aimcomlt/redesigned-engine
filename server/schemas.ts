import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string(),
  type: z.enum(['v2', 'v3']),
  address: z.string(),
});

export const tokenInfoSchema = z.object({
  decimals: z.number(),
  priceUsd: z.string(),
});

export const candidateSchema = z.object({
  buy: z.string(),
  sell: z.string(),
  profitUsd: z.number(),
});

export const candidateParamsSchema = z.object({
  providerUrl: z.string().url(),
  venues: z.array(venueSchema),
  amountIn: z.string(),
  token0: tokenInfoSchema,
  token1: tokenInfoSchema,
  slippageBps: z.number(),
  gasUnits: z.string(),
  ethUsd: z.number(),
  minProfitUsd: z.number().optional().default(0),
});

export const candidatesRequestSchema = candidateParamsSchema;
export const candidatesResponseSchema = z.object({
  candidates: z.array(candidateSchema),
});

export const simulateRequestSchema = z.object({
  candidate: candidateSchema,
  params: candidateParamsSchema,
});
export const simulateResponseSchema = candidateSchema;

export const executeRequestSchema = candidateParamsSchema;
export const executeResponseSchema = z.object({ ok: z.boolean() });

export type VenueInput = z.infer<typeof venueSchema>;
export type TokenInfoInput = z.infer<typeof tokenInfoSchema>;
export type CandidateInput = z.infer<typeof candidateSchema>;
export type CandidateParamsInput = z.infer<typeof candidateParamsSchema>;
export type CandidatesRequest = z.infer<typeof candidatesRequestSchema>;
export type CandidatesResponse = z.infer<typeof candidatesResponseSchema>;
export type SimulateRequest = z.infer<typeof simulateRequestSchema>;
export type SimulateResponse = z.infer<typeof simulateResponseSchema>;
export type ExecuteRequest = z.infer<typeof executeRequestSchema>;
export type ExecuteResponse = z.infer<typeof executeResponseSchema>;
