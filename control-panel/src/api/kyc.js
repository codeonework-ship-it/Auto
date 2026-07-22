import client from './client';

// KYC review service (marketplace/identity). Reviews buyer/seller verification submissions.
export const kycApi = {
  async list(params = {}) {
    const { data } = await client.get('/kyc/submissions', { params });
    return data;
  },
  async get(id) {
    const { data } = await client.get(`/kyc/submissions/${id}`);
    return data;
  },
  async approve(id, note) {
    const { data } = await client.post(`/kyc/submissions/${id}/approve`, { note });
    return data;
  },
  async reject(id, reason) {
    const { data } = await client.post(`/kyc/submissions/${id}/reject`, { reason });
    return data;
  },
};

export default kycApi;
