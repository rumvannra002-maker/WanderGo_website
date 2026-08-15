import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gates /admin/*. Anyone can browse the public site, but only a signed-in
// account (see AuthContext — every signup is an Admin/User) can reach the
// dashboard. Firestore rules enforce this server-side too; this is just the
// client-side redirect for a clean UX.
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}>
        Loading…
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
