import client from './client';
import { crudFactory } from './crudFactory';

// Posts service (catalog context) — car/bike posts. Admin uses read + status controls.
export const postsApi = {
  ...crudFactory('/posts'),

  async setStatus(id, status) {
    const { data } = await client.patch(`/posts/${id}/status`, { status });
    return data;
  },

  async listListings(params = {}) {
    const { data } = await client.get('/marketplace/listings', { params });
    return data;
  },

  async approveListing(id) {
    const { data } = await client.post(`/marketplace/listings/${id}/approve`);
    return data;
  },

  async rejectListing(id, reason) {
    const { data } = await client.post(`/marketplace/listings/${id}/reject`, {
      reason,
    });
    return data;
  },
};

export default postsApi;
