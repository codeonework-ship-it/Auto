import client from './client';

/*
 * Community service — groups (communities) and social follows.
 * The backend wraps responses in { success, data, timestamp }; we unwrap `.data.data`.
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const communityApi = {
  // ---- groups ----
  listGroups: () => client.get('/community/groups').then(unwrap),
  myGroups: () => client.get('/community/groups/mine').then(unwrap),
  getGroup: (slug) => client.get(`/community/groups/${slug}`).then(unwrap),
  createGroup: (payload) => client.post('/community/groups', payload).then(unwrap),
  join: (id) => client.post(`/community/groups/${id}/join`).then(unwrap),
  leave: (id) => client.delete(`/community/groups/${id}/leave`).then(unwrap),

  // ---- follows ----
  follow: (targetUserId) =>
    client.post('/community/follows', { targetUserId }).then(unwrap),
  unfollow: (targetUserId) =>
    client.delete(`/community/follows/${targetUserId}`).then(unwrap),
  following: () => client.get('/community/follows/following').then(unwrap),
  followers: () => client.get('/community/follows/followers').then(unwrap),
};

export default communityApi;
