import { create } from 'zustand';

interface ExecutionState {
  /** Whether execution is currently enabled */
  enabled: boolean;
  /** Slippage tolerance in basis points */
  slippageBps: number;
  /** Maximum allowed gas price (gas ceiling) */
  gasCeiling: number;
  /** Minimum profit threshold in USD */
  minProfitUsd: number;
  /** Enable or disable execution */
  setEnabled: (enabled: boolean) => void;
  /** Update execution parameters */
  setParams: (params: Partial<Pick<ExecutionState, 'slippageBps' | 'gasCeiling' | 'minProfitUsd'>>) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  enabled: false,
  slippageBps: Number(process.env.REACT_APP_SLIPPAGE_BPS ?? 0),
  gasCeiling: Number(process.env.REACT_APP_GAS_CEILING ?? 0),
  minProfitUsd: Number(process.env.REACT_APP_MIN_PROFIT_USD ?? 0),
  setEnabled: (enabled) => set({ enabled }),
  setParams: (params) => set(params),
}));

export default useExecutionStore;
