import client from './client';

/*
 * Travel service — travel bounded context (blog posts + tours/tour-guide).
 * The backend wraps responses in { success, data, timestamp }; we unwrap `.data.data`.
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const travelApi = {
  // Travel blog posts
  listPosts: (params) => client.get('/travel/posts', { params }).then(unwrap),
  myPosts: () => client.get('/travel/posts/mine').then(unwrap),
  getPost: (slug) => client.get(`/travel/posts/${slug}`).then(unwrap),
  createPost: (payload) => client.post('/travel/posts', payload).then(unwrap),
  publishPost: (id) => client.post(`/travel/posts/${id}/publish`).then(unwrap),

  // Tours / tour guide
  listTours: (params) => client.get('/travel/tours', { params }).then(unwrap),
  getTour: (id) => client.get(`/travel/tours/${id}`).then(unwrap),
  createTour: (payload) => client.post('/travel/tours', payload).then(unwrap),
};

export default travelApi;
