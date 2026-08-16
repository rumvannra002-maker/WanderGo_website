import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Gates /admin/*. Anyone can browse the public site, but only a signed-in
// account with role "admin" can reach the dashboard. A logged-in "user"
// account is redirected home the same as a logged-out visitor — signing up
// no longer grants dashboard access by itself; an existing admin has to
// promote the account from Admin > Users. Firestore rules enforce the same
// role check server-side; this is just the client-side redirect for a
// clean UX.
export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}>
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
