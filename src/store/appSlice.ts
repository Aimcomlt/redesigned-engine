import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  sidebarOpen: boolean;
}

const initialState: AppState = {
  sidebarOpen: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleSidebar } = appSlice.actions;
export default appSlice.reducer;
