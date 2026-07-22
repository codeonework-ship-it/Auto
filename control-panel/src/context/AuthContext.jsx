import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import authApi from '../api/auth';
import { TOKEN_KEY } from '../api/client';

// AuthContext holds the current admin user together with their roles and permissions.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hydrate the session on first mount if a token already exists.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((data) => {
        setUser(data ?? null);
        setRoles(data?.roles ?? []);
        setPermissions(data?.permissions ?? []);
      })
      .catch(() => {
        setUser(null);
        setRoles([]);
        setPermissions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    await authApi.login(credentials); // stores the JWT
    const me = await authApi.me();    // profile incl. roles + permissions
    setUser(me ?? null);
    setRoles(me?.roles ?? []);
    setPermissions(me?.permissions ?? []);
    return me;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setRoles([]);
    setPermissions([]);
  }, []);

  // Permission check — SUPER_ADMIN implicitly holds every permission.
  const hasPermission = useCallback(
    (perm) => {
      if (!perm) return true;
      if (roles.includes('SUPER_ADMIN')) return true;
      const needed = Array.isArray(perm) ? perm : [perm];
      return needed.some((p) => permissions.includes(p));
    },
    [roles, permissions]
  );

  const hasRole = useCallback(
    (role) => {
      const needed = Array.isArray(role) ? role : [role];
      return needed.some((r) => roles.includes(r));
    },
    [roles]
  );

  const value = useMemo(
    () => ({
      user,
      roles,
      permissions,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission,
      hasRole,
    }),
    [user, roles, permissions, loading, login, logout, hasPermission, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
