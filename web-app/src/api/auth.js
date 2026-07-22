import client from './client';

/*
 * Auth service — identity bounded context (/api/v1).
 * The backend wraps every response in { success, data, timestamp }, so we unwrap
 * `.data.data` here and callers receive the inner payload directly.
 *   login/register -> { accessToken, refreshToken, tokenType, expiresIn }
 *   me             -> { id, email, username, displayName, status, roles, permissions }
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials).then(unwrap),
  register: (payload) => client.post('/auth/register', payload).then(unwrap),
  // No server-side logout endpoint (stateless JWT) — clearing the token is sufficient.
  logout: () => Promise.resolve(),
  me: () => client.get('/auth/me').then(unwrap),
  refresh: () => client.post('/auth/refresh').then(unwrap),
};

export default authApi;
