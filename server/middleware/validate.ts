import { RequestHandler } from "express";

export const validateBody = <T>(safe: (v: unknown) => { success: boolean; data?: T; error?: string }): RequestHandler =>
  (req, res, next) => {
    const r = safe(req.body);
    if (!r.success) return res.status(400).json({ error: r.error || "Invalid payload" });
    // @ts-expect-error attach parsed
    req.parsed = r.data as T;
    next();
  };
