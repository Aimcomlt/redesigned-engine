import ExecutionToggle from './ExecutionToggle';
import { useAppStore } from '../store/useAppStore';

export default function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  return (
    <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <button className="mr-4" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>
      <h1 className="text-xl font-bold flex-1">Arbitrage Engine</h1>
      <ExecutionToggle />
    </header>
  );
}
