import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import authApi from '../api/auth';
import { setToken, getToken } from '../api/client';

/*
 * AuthContext — holds the current user, roles, and JWT.
 * login/register store the JWT via the axios client helpers; logout clears it.
 * Wire real behavior once the identity backend endpoints are live.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: if a token exists, try to load the current user.
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        setToken(null);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    // Expected shape: { token, user }
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    setToken(null);
    setUser(null);
  }, []);

  const roles = user?.roles || [];
  const hasRole = useCallback((role) => roles.includes(role), [roles]);

  const value = useMemo(
    () => ({
      user,
      roles,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      hasRole,
    }),
    [user, roles, loading, login, register, logout, hasRole],
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
