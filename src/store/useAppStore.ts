import React from 'react';
import { createStore, type StoreApi } from 'zustand';
import { useStore } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const createAppStore = () =>
  createStore<AppState>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  }));

const AppStoreContext = React.createContext<StoreApi<AppState> | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = React.useRef<StoreApi<AppState>>();
  if (!storeRef.current) {
    storeRef.current = createAppStore();
  }
  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: AppState) => T): T {
  const store = React.useContext(AppStoreContext);
  if (!store) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return useStore(store, selector);
}
