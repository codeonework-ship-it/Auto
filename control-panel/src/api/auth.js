import client, { TOKEN_KEY } from './client';

// Auth service — talks to the identity bounded context.
// Backend wraps responses as { success, data, timestamp }; we unwrap `.data.data`.
//   login -> { accessToken, refreshToken, tokenType, expiresIn }
//   me    -> { id, email, username, displayName, status, roles, permissions }
const unwrap = (r) => r.data?.data ?? r.data;

export const authApi = {
  async login(credentials) {
    const tokens = await client.post('/auth/login', credentials).then(unwrap);
    if (tokens?.accessToken) localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    return tokens;
  },

  // GET /auth/me -> current admin profile with roles + permissions
  me: () => client.get('/auth/me').then(unwrap),

  async logout() {
    // Stateless JWT — no server endpoint; clearing the token is sufficient.
    localStorage.removeItem(TOKEN_KEY);
  },
};

export default authApi;
