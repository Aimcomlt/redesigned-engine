import { z } from 'zod';
import {
  CandidateSchema,
  CandidatesInput,
  SimulateInput,
  TCandidatesInput,
} from '../src/shared/validation';

export const candidateSchema = CandidateSchema;

export const candidatesRequestSchema = CandidatesInput;
export const candidatesResponseSchema = z.object({
  candidates: z.array(candidateSchema),
});

export const simulateRequestSchema = SimulateInput;
export const simulateResponseSchema = candidateSchema;

export const executeRequestSchema = CandidatesInput;
export const executeResponseSchema = z.object({ ok: z.boolean() });

export type CandidateInput = z.infer<typeof candidateSchema>;
export type CandidateParamsInput = TCandidatesInput;
export type CandidatesRequest = z.infer<typeof candidatesRequestSchema>;
export type CandidatesResponse = z.infer<typeof candidatesResponseSchema>;
export type SimulateRequest = z.infer<typeof simulateRequestSchema>;
export type SimulateResponse = z.infer<typeof simulateResponseSchema>;
export type ExecuteRequest = z.infer<typeof executeRequestSchema>;
export type ExecuteResponse = z.infer<typeof executeResponseSchema>;
