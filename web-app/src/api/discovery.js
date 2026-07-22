import client from './client';

/*
 * Discovery service — global search + unified feed across posts, travel and marketplace.
 * Both endpoints are public reads. The backend wraps responses in { success, data, timestamp };
 * we unwrap `.data.data`. A hit is { type, id, title, subtitle, url }.
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const discoveryApi = {
  // type is optional: one of 'POST' | 'TRAVEL' | 'LISTING' (omit for all).
  search: (q, type) => client.get('/search', { params: { q, type: type || undefined } }).then(unwrap),
  feed: () => client.get('/feed').then(unwrap),
};

export default discoveryApi;
