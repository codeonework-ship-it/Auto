import client from './client';
import { crudFactory } from './crudFactory';

// Roles service (RBAC).
export const rolesApi = {
  ...crudFactory('/roles'),

  // Replace the permission set attached to a role.
  async setPermissions(roleId, permissionIds) {
    const { data } = await client.put(`/roles/${roleId}/permissions`, {
      permissionIds,
    });
    return data;
  },
};

export default rolesApi;
