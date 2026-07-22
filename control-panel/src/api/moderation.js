import client from './client';

// Moderation service (engagement/adminops) — handles reported posts, comments, listings.
export const moderationApi = {
  async listReports(params = {}) {
    const { data } = await client.get('/moderation/reports', { params });
    return data;
  },
  async listQueue(type, params = {}) {
    const { data } = await client.get(`/moderation/queue/${type}`, { params });
    return data;
  },
  async approve(id) {
    const { data } = await client.post(`/moderation/items/${id}/approve`);
    return data;
  },
  async reject(id, reason) {
    const { data } = await client.post(`/moderation/items/${id}/reject`, { reason });
    return data;
  },
  async takedown(id, reason) {
    const { data } = await client.post(`/moderation/items/${id}/takedown`, { reason });
    return data;
  },
};

export default moderationApi;
