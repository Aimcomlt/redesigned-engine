import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ExecutionState {
  enabled: boolean;
  slippageBps: number;
  gasCeiling: number;
  minProfitUsd: number;
}

const initialState: ExecutionState = {
  enabled: process.env.REACT_APP_EXECUTION_ENABLED === 'true',
  slippageBps: Number(process.env.REACT_APP_SLIPPAGE_BPS ?? 0),
  gasCeiling: Number(process.env.REACT_APP_GAS_CEILING ?? 0),
  minProfitUsd: Number(process.env.REACT_APP_MIN_PROFIT_USD ?? 0),
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
