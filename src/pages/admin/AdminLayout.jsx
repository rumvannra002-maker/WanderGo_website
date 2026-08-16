import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Map,
  Package,
  CalendarCheck,
  MessageSquare,
  Users,
  Home,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TowerSkyline from '../../components/TowerSkyline';
import './admin.css';

const links = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutGrid },
  { to: '/admin/destinations', label: 'Destinations', icon: Map },
  { to: '/admin/packages', label: 'Packages', icon: Package },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Do you want to log out?')) {
      await logout();
      navigate('/');
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <TowerSkyline variant="mark" color="var(--cream)" />
          <div>
            <strong>Angkor Trails</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {links.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <span>Signed in as</span>
            <strong title={user?.email}>{user?.displayName || user?.email?.split('@')[0]}</strong>
          </div>
          <NavLink to="/" className="admin-nav-link admin-nav-link--muted">
            <Home size={18} />
            <span>View Store</span>
          </NavLink>
          <button type="button" className="admin-nav-link admin-nav-link--danger" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
