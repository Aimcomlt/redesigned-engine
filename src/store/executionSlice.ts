import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ExecutionState {
  enabled: boolean;
  slippageBps: number;
  gasCeiling: number;
  minProfitUsd: number;
}

const initialState: ExecutionState = {
  enabled: import.meta.env.VITE_EXECUTION_ENABLED === 'true',
  slippageBps: Number(import.meta.env.VITE_SLIPPAGE_BPS ?? 0),
  gasCeiling: Number(import.meta.env.VITE_GAS_CEILING ?? 0),
  minProfitUsd: Number(import.meta.env.VITE_MIN_PROFIT_USD ?? 0),
};

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    setEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
    setParams(
      state,
      action: PayloadAction<
        Partial<Pick<ExecutionState, 'slippageBps' | 'gasCeiling' | 'minProfitUsd'>>
      >
    ) {
      const { slippageBps, gasCeiling, minProfitUsd } = action.payload;
      if (slippageBps !== undefined) state.slippageBps = slippageBps;
      if (gasCeiling !== undefined) state.gasCeiling = gasCeiling;
      if (minProfitUsd !== undefined) state.minProfitUsd = minProfitUsd;
    },
  },
});

export const { setEnabled, setParams } = executionSlice.actions;
export default executionSlice.reducer;
