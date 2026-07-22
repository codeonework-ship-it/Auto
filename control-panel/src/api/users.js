import client from './client';
import { crudFactory } from './crudFactory';

// User management service (identity context).
export const usersApi = {
  ...crudFactory('/users'),

  // Assign roles to a user.
  async setRoles(userId, roleIds) {
    const { data } = await client.put(`/users/${userId}/roles`, { roleIds });
    return data;
  },

  // Enable / disable / suspend an account.
  async setStatus(userId, status) {
    const { data } = await client.patch(`/users/${userId}/status`, { status });
    return data;
  },
};

export default usersApi;
