import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pools', label: 'Pools' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/strategies', label: 'Strategies' },
  { to: '/settings', label: 'Settings' },
  { to: '/logs', label: 'Logs' },
];

export default function SidebarNav() {
  const open = useAppStore((s) => s.sidebarOpen);
  return (
    <aside
      className={`${open ? 'block' : 'hidden'} bg-gray-900 text-white w-64 min-h-screen`}
    >
      <nav className="p-4 space-y-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `block p-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
