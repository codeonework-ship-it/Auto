import { useAuth } from '../context/AuthContext';

// Permission-gated rendering.
// Usage:
//   <Can permission="user:manage">...</Can>
//   <Can permission={['a', 'b']} role="ADMIN" fallback={<Denied/>}>...</Can>
export default function Can({ permission, role, children, fallback = null }) {
  const { hasPermission, hasRole } = useAuth();

  const permOk = permission ? hasPermission(permission) : true;
  const roleOk = role ? hasRole(role) : true;

  return permOk && roleOk ? <>{children}</> : fallback;
}
