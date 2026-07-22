import client from './client';

// Builds a standard REST CRUD service bound to a resource path.
// e.g. crudFactory('/users') -> { list, get, create, update, remove }
export function crudFactory(resource) {
  return {
    async list(params = {}) {
      const { data } = await client.get(resource, { params });
      return data;
    },
    async get(id) {
      const { data } = await client.get(`${resource}/${id}`);
      return data;
    },
    async create(payload) {
      const { data } = await client.post(resource, payload);
      return data;
    },
    async update(id, payload) {
      const { data } = await client.put(`${resource}/${id}`, payload);
      return data;
    },
    async remove(id) {
      const { data } = await client.delete(`${resource}/${id}`);
      return data;
    },
  };
}

export default crudFactory;
