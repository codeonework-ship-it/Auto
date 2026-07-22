import client from './client';

// Backend wraps every response as { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// User management service (identity context — UserAdminController, /api/v1/users).
export const usersApi = {
  // GET /users -> [{ id, email, username, status, roles[] }]
  async list(params = {}) {
    return unwrap(await client.get('/users', { params }));
  },

  // PUT /users/{id}/roles { roleCodes } — replace the user's role set.
  async setRoles(userId, roleCodes) {
    return unwrap(await client.put(`/users/${userId}/roles`, { roleCodes }));
  },

  // PATCH /users/{id}/status { status } — ACTIVE | SUSPENDED | BANNED | PENDING.
  async setStatus(userId, status) {
    return unwrap(await client.patch(`/users/${userId}/status`, { status }));
  },
};

export default usersApi;
