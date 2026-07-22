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

// Vehicle catalog master (make -> model -> variant). Hierarchical, so it has dedicated
// endpoints beyond the generic { name, active } shape. Makes themselves are also reachable
// through the generic mastersApi under resource "vehicle-makes".
export const vehicleCatalogApi = {
  // GET /masters/vehicle-makes -> [{ id, name, kind, active }]
  async listMakes() {
    return unwrap(await client.get('/masters/vehicle-makes'));
  },
  // POST /masters/vehicle-makes { name, kind, active }
  async createMake(payload) {
    return unwrap(await client.post('/masters/vehicle-makes', payload));
  },
  // PUT /masters/vehicle-makes/{id} { name, kind, active }
  async updateMake(id, payload) {
    return unwrap(await client.put(`/masters/vehicle-makes/${id}`, payload));
  },
  // PATCH /masters/vehicle-makes/{id}/toggle
  async toggleMake(id) {
    return unwrap(await client.patch(`/masters/vehicle-makes/${id}/toggle`));
  },
  // DELETE /masters/vehicle-makes/{id}
  async removeMake(id) {
    return unwrap(await client.delete(`/masters/vehicle-makes/${id}`));
  },

  // GET /masters/vehicle-makes/{makeId}/models -> [{ id, makeId, name, active }]
  async listModels(makeId) {
    return unwrap(await client.get(`/masters/vehicle-makes/${makeId}/models`));
  },
  // POST /masters/vehicle-models { makeId, name, active }
  async createModel(payload) {
    return unwrap(await client.post('/masters/vehicle-models', payload));
  },
  // PUT /masters/vehicle-models/{id} { makeId, name, active }
  async updateModel(id, payload) {
    return unwrap(await client.put(`/masters/vehicle-models/${id}`, payload));
  },
  // DELETE /masters/vehicle-models/{id}
  async removeModel(id) {
    return unwrap(await client.delete(`/masters/vehicle-models/${id}`));
  },

  // GET /masters/vehicle-models/{modelId}/variants -> [{ id, modelId, name, active }]
  async listVariants(modelId) {
    return unwrap(await client.get(`/masters/vehicle-models/${modelId}/variants`));
  },
  // POST /masters/vehicle-variants { modelId, name, active }
  async createVariant(payload) {
    return unwrap(await client.post('/masters/vehicle-variants', payload));
  },
  // PUT /masters/vehicle-variants/{id} { modelId, name, active }
  async updateVariant(id, payload) {
    return unwrap(await client.put(`/masters/vehicle-variants/${id}`, payload));
  },
  // DELETE /masters/vehicle-variants/{id}
  async removeVariant(id) {
    return unwrap(await client.delete(`/masters/vehicle-variants/${id}`));
  },
};

// Cities master ({ id, name, country, active }). Reachable through the generic mastersApi
// under resource "cities"; these named helpers exist for clarity/reuse.
export const citiesApi = {
  async list() {
    return unwrap(await client.get('/masters/cities'));
  },
  async create(payload) {
    return unwrap(await client.post('/masters/cities', payload));
  },
  async update(id, payload) {
    return unwrap(await client.put(`/masters/cities/${id}`, payload));
  },
  async toggle(id) {
    return unwrap(await client.patch(`/masters/cities/${id}/toggle`));
  },
  async remove(id) {
    return unwrap(await client.delete(`/masters/cities/${id}`));
  },
};

// Currencies master ({ id, code, name, active }). Also reachable through the generic
// mastersApi under resource "currencies".
export const currenciesApi = {
  async list() {
    return unwrap(await client.get('/masters/currencies'));
  },
  async create(payload) {
    return unwrap(await client.post('/masters/currencies', payload));
  },
  async update(id, payload) {
    return unwrap(await client.put(`/masters/currencies/${id}`, payload));
  },
  async toggle(id) {
    return unwrap(await client.patch(`/masters/currencies/${id}/toggle`));
  },
  async remove(id) {
    return unwrap(await client.delete(`/masters/currencies/${id}`));
  },
};

export default mastersApi;
