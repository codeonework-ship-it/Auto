import client from './client';

/*
 * Marketplace service — marketplace bounded context (buy/sell listings, offers).
 * The backend wraps responses in { success, data, timestamp }; we unwrap `.data.data`.
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const marketplaceApi = {
  list: (params) => client.get('/marketplace/listings', { params }).then(unwrap),
  mine: () => client.get('/marketplace/listings/mine').then(unwrap),
  get: (id) => client.get(`/marketplace/listings/${id}`).then(unwrap),
  create: (payload) => client.post('/marketplace/listings', payload).then(unwrap),
  update: (id, payload) => client.put(`/marketplace/listings/${id}`, payload).then(unwrap),
  approve: (id) => client.post(`/marketplace/listings/${id}/approve`).then(unwrap),
  reject: (id, payload) => client.post(`/marketplace/listings/${id}/reject`, payload).then(unwrap),
  makeOffer: (id, payload) => client.post(`/marketplace/listings/${id}/offers`, payload).then(unwrap),
  listOffers: (id) => client.get(`/marketplace/listings/${id}/offers`).then(unwrap),
};

export default marketplaceApi;
