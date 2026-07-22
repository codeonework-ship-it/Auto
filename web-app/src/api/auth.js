import client from './client';

/*
 * Auth service stubs — identity bounded context.
 * Endpoints are placeholders matching the backend REST contract under /api/v1.
 */
export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials).then((r) => r.data),
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
  refresh: () => client.post('/auth/refresh').then((r) => r.data),
};

export default authApi;
