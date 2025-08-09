import type { ZodType } from 'zod';

export interface Validator<T> {
  parse(data: unknown): T;
  safeParse(
    data: unknown
  ): { success: true; data: T } | { success: false; error: string };
}

export function zodAdapter<T>(schema: ZodType<T>): Validator<T> {
  return {
    parse(data: unknown) {
      const result = schema.safeParse(data);
      if (result.success) return result.data;
      const message = result.error.errors.map((e) => e.message).join(', ');
      throw new Error(message);
    },
    safeParse(data: unknown) {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      }
      const message = result.error.errors.map((e) => e.message).join(', ');
      return { success: false, error: message };
    },
  };
}
/**
 * Currently only Zod is supported. If other validators are requested
 * through the `VALIDATOR` env variable, fall back to the Zod adapter.
 */
export function createValidator<T>(schema: unknown): Validator<T> {
  switch (process.env.VALIDATOR) {
    case 'valibot':
    case 'yup':
    default:
      return zodAdapter<T>(schema as ZodType<T>);
  }
}

