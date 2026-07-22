import client from './client';

/*
 * Marketplace service — marketplace bounded context (buy/sell listings, KYC).
 */
export const marketplaceApi = {
  listListings: (params) => client.get('/listings', { params }).then((r) => r.data),
  getListing: (id) => client.get(`/listings/${id}`).then((r) => r.data),
  createListing: (payload) => client.post('/listings', payload).then((r) => r.data),
  updateListing: (id, payload) => client.put(`/listings/${id}`, payload).then((r) => r.data),
  contactSeller: (id, payload) =>
    client.post(`/listings/${id}/contact`, payload).then((r) => r.data),

  // KYC (buyer/seller verification).
  submitKyc: (payload) => client.post('/kyc/submit', payload).then((r) => r.data),
  kycStatus: () => client.get('/kyc/status').then((r) => r.data),
};

export default marketplaceApi;
