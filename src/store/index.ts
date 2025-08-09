import { configureStore } from '@reduxjs/toolkit';
import executionReducer from './executionSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    execution: executionReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
