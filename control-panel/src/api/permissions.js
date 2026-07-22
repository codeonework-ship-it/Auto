import { crudFactory } from './crudFactory';

// Permissions service (RBAC). Permissions are `resource:action` strings.
export const permissionsApi = crudFactory('/permissions');

export default permissionsApi;
