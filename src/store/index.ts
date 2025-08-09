import { configureStore } from '@reduxjs/toolkit';
import executionReducer from './executionSlice';

export const store = configureStore({
  reducer: {
    execution: executionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
