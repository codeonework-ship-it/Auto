import client, { TOKEN_KEY } from './client';

// Auth service — talks to the identity bounded context.
export const authApi = {
  // POST /auth/login -> { token, user, roles, permissions }
  async login(credentials) {
    const { data } = await client.post('/auth/login', credentials);
    if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  // GET /auth/me -> current admin profile with roles + permissions
  async me() {
    const { data } = await client.get('/auth/me');
    return data;
  },

  async logout() {
    try {
      await client.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

export default authApi;
