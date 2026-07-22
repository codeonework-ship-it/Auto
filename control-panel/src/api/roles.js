import client from './client';

// Backend response envelope { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// Roles service (identity RBAC — RoleAdminController, /api/v1/roles).
export const rolesApi = {
  // GET /roles -> [{ id, code, name, description, permissions[] }]
  async list(params = {}) {
    return unwrap(await client.get('/roles', { params }));
  },

  // PUT /roles/{roleId}/permissions { permissionCodes } — replace the role's permission set.
  async setPermissions(roleId, permissionCodes) {
    return unwrap(
      await client.put(`/roles/${roleId}/permissions`, { permissionCodes })
    );
  },
};

export default rolesApi;
