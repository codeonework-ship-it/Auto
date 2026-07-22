import client from './client';

// Backend response envelope { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// KYC review service (kyc context — KycController, /api/v1/kyc). Reviewer endpoints require kyc:review.
export const kycApi = {
  // GET /kyc?status= -> [{ id, userId, kycType, legalName, documentType, documentNumber,
  //   phone, addressLine, city, country, status, reviewerId, reviewNotes, submittedAt, ... }]
  async list(params = {}) {
    return unwrap(await client.get('/kyc', { params }));
  },

  // GET /kyc/{id} — full submission detail.
  async get(id) {
    return unwrap(await client.get(`/kyc/${id}`));
  },

  // POST /kyc/{id}/approve
  async approve(id) {
    return unwrap(await client.post(`/kyc/${id}/approve`));
  },

  // POST /kyc/{id}/reject { notes }
  async reject(id, notes) {
    return unwrap(await client.post(`/kyc/${id}/reject`, { notes }));
  },
};

export default kycApi;
