import { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export interface ParsedRequest<T> extends Request {
  parsed: T;
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.format() });
      return;
    }
    (req as ParsedRequest<T>).parsed = result.data;
    next();
  };
}
