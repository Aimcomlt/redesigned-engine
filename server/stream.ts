import type { Request, Response } from "express";
import { eventBus } from "@/core/bus";
import { activeSseClients } from "@/utils/metrics";

const HEARTBEAT_MS = 15_000;

export function stream(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // flush headers to establish SSE with client
  res.flushHeaders?.();

  activeSseClients.inc();

  const push = (type: string, data: unknown) =>
    res.write(`event: ${type}\ndata:${JSON.stringify(data)}\n\n`);

  const onCand = (c: any) => push("candidate", c);
  const onLog = (m: any) => push("log", m);
  const onBlock = (b: any) => push("block", b);

  const hb = setInterval(() => push("heartbeat", Date.now()), HEARTBEAT_MS);

  eventBus.on("candidate", onCand);
  eventBus.on("log", onLog);
  eventBus.on("block", onBlock);

  req.on("close", () => {
    clearInterval(hb);
    eventBus.off("candidate", onCand);
    eventBus.off("log", onLog);
    eventBus.off("block", onBlock);
    activeSseClients.dec();
  });
}
