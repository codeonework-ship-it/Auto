import client from './client';

// Generic Masters service (adminops context).
// Each master is addressed by its `resource` path segment, e.g. /masters/vehicle-makes.
export const mastersApi = {
  async list(resource, params = {}) {
    const { data } = await client.get(`/masters/${resource}`, { params });
    return data;
  },
  async get(resource, id) {
    const { data } = await client.get(`/masters/${resource}/${id}`);
    return data;
  },
  async create(resource, payload) {
    const { data } = await client.post(`/masters/${resource}`, payload);
    return data;
  },
  async update(resource, id, payload) {
    const { data } = await client.put(`/masters/${resource}/${id}`, payload);
    return data;
  },
  async remove(resource, id) {
    const { data } = await client.delete(`/masters/${resource}/${id}`);
    return data;
  },
};

export default mastersApi;
