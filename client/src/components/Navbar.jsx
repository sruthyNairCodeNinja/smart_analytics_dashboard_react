import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-factory-500 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-factory-700">⚙ Smart Factory</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/machines" className={linkClass}>Machines</NavLink>
            <NavLink to="/alerts" className={linkClass}>Alerts</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {user?.name} <span className="text-slate-300">·</span>{' '}
            <span className="capitalize">{isAdmin ? 'admin' : 'viewer'}</span>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
