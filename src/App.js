import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { AppStoreProvider } from './store/useAppStore';
import Dashboard from './pages/Dashboard';
import Pools from './pages/Pools';
import Simulator from './pages/Simulator';
import Strategies from './pages/Strategies';
import Settings from './pages/Settings';
import Logs from './pages/Logs';

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/pools">Pools</Link></li>
          <li><Link to="/simulator">Simulator</Link></li>
          <li><Link to="/strategies">Strategies</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/logs">Logs</Link></li>
        </ul>
      </nav>
    </aside>
  );
}

function Header() {
  return (
    <header className="header">
      <h1>Arbitrage Engine</h1>
    </header>
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
