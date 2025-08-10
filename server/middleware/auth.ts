import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";

const AUTH_TOKEN = process.env.AUTH_TOKEN || "";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const provided = req.headers.authorization ?? "";
  const expected = `Bearer ${AUTH_TOKEN}`;
  const authorized =
    AUTH_TOKEN &&
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

  if (!authorized) {
    return res.status(401).json({ error: "unauthorized" });
  }

  next();
}
