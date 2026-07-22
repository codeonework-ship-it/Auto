import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

/*
 * Route guard. Redirects unauthenticated users to /login (preserving intended
 * destination). Optionally enforces a required role via the `roles` prop.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.some((r) => hasRole(r))) {
    // Authenticated but lacks the required role.
    return <Navigate to="/" replace />;
  }

  return children;
}
