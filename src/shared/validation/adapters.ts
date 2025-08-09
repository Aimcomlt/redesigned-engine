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

export function valibotAdapter<T>(_schema: unknown): Validator<T> {
  throw new Error('valibot adapter not implemented');
}

export function yupAdapter<T>(_schema: unknown): Validator<T> {
  throw new Error('yup adapter not implemented');
}

export function createValidator<T>(schema: unknown): Validator<T> {
  switch (process.env.VALIDATOR) {
    case 'valibot':
      return valibotAdapter<T>(schema);
    case 'yup':
      return yupAdapter<T>(schema);
    default:
      return zodAdapter<T>(schema as ZodType<T>);
  }
}

