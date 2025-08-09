type ExecParams = {
  routeCalldata: `0x${string}`;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  deadline: number;
  dryRun?: boolean;
};

export type ExecResult = { ok: boolean; txHash?: `0x${string}`; error?: string };

export interface Relay {
  sendPrivateTx(params: ExecParams): Promise<ExecResult>;
}

export async function executeWithRelay(relay: Relay, p: ExecParams): Promise<ExecResult> {
  if (Date.now()/1000 > p.deadline) return { ok: false, error: "deadline passed" };
  // slippage guard is enforced in calldata minOut; ensure caller set it
  return relay.sendPrivateTx(p);
}
