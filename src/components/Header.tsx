import ExecutionToggle from './ExecutionToggle';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../store/appSlice';
import type { AppDispatch } from '../store';

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const handleToggle = () => {
    dispatch(toggleSidebar());
  };
  return (
    <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <button className="mr-4" onClick={handleToggle} aria-label="Toggle sidebar">
        ☰
      </button>
      <h1 className="text-xl font-bold flex-1">Arbitrage Engine</h1>
      <ExecutionToggle />
    </header>
  );
}
