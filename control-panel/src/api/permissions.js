import client from './client';

// Backend response envelope { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// Permissions service (identity RBAC — RoleAdminController, /api/v1/permissions).
// Permissions are `resource:action` codes: [{ id, code, description }].
export const permissionsApi = {
  async list(params = {}) {
    return unwrap(await client.get('/permissions', { params }));
  },
};

export default permissionsApi;
