import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

// Route guard — requires authentication and, optionally, a role/permission.
export default function ProtectedRoute({ children, role, permission }) {
  const { isAuthenticated, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended destination for post-login redirect.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roleOk = role ? hasRole(role) : true;
  const permOk = permission ? hasPermission(permission) : true;

  if (!roleOk || !permOk) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
