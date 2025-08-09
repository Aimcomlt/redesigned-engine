import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { AppStoreProvider } from './store/useAppStore';
import Dashboard from './pages/Dashboard';
import Pools from './pages/Pools';
import Simulator from './pages/Simulator';
import Strategies from './pages/Strategies';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';

function Layout() {
  return (
    <div className="flex">
      <SidebarNav />
      <div className="flex-1">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pools" element={<Pools />} />
              <Route path="simulator" element={<Simulator />} />
              <Route path="strategies" element={<Strategies />} />
              <Route path="settings" element={<Settings />} />
              <Route path="logs" element={<Logs />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </QueryClientProvider>
  );
}

export default App;
