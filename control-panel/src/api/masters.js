import client from './client';

// Backend response envelope { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// Generic Masters service (adminops — MasterController, /api/v1/masters).
// Every simple master is { id, name, active }; writes accept { name, active } only.
export const mastersApi = {
  // GET /masters -> [resourceKey] — the master resource keys the backend actually serves.
  async resources() {
    return unwrap(await client.get('/masters'));
  },

  // GET /masters/{resource} -> [{ id, name, active }]
  async list(resource, params = {}) {
    return unwrap(await client.get(`/masters/${resource}`, { params }));
  },

  // POST /masters/{resource} { name, active }
  async create(resource, payload) {
    return unwrap(await client.post(`/masters/${resource}`, payload));
  },

  // PUT /masters/{resource}/{id} { name, active }
  async update(resource, id, payload) {
    return unwrap(await client.put(`/masters/${resource}/${id}`, payload));
  },

  // PATCH /masters/{resource}/{id}/toggle — flip the active flag.
  async toggle(resource, id) {
    return unwrap(await client.patch(`/masters/${resource}/${id}/toggle`));
  },

  // DELETE /masters/{resource}/{id}
  async remove(resource, id) {
    return unwrap(await client.delete(`/masters/${resource}/${id}`));
  },
};

export default mastersApi;
