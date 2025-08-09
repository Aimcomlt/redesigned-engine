import type { Relay } from "../submit";

export class FlashbotsRelay implements Relay {
  constructor(private opts: { rpcUrl: string; bundleSignerKey: string }) {}
  async sendPrivateTx(p: Parameters<Relay["sendPrivateTx"]>[0]) {
    // TODO: integrate with your Flashbots/builder SDK.
    // This is a stub. Return an ok=false with message for now.
    return { ok: false, error: "Flashbots integration not yet configured" };
  }
}
