import type { Request, Response } from "express";
import { eventBus } from "../src/core/bus";

export function stream(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // flush headers to establish SSE with client
  res.flushHeaders?.();

  const push = (type: string, data: unknown) =>
    res.write(`event: ${type}\ndata:${JSON.stringify(data)}\n\n`);

  const onCand = (c: any) => push("candidate", c);
  const onLog = (m: any) => push("log", m);

  eventBus.on("candidate", onCand);
  eventBus.on("log", onLog);

  req.on("close", () => {
    eventBus.off("candidate", onCand);
    eventBus.off("log", onLog);
  });
}
