import client from './client';

/*
 * Travel service — travel bounded context (blog posts, tours/tour-guide).
 */
export const travelApi = {
  listPosts: (params) => client.get('/travel/posts', { params }).then((r) => r.data),
  getPost: (id) => client.get(`/travel/posts/${id}`).then((r) => r.data),
  createPost: (payload) => client.post('/travel/posts', payload).then((r) => r.data),

  listTours: (params) => client.get('/travel/tours', { params }).then((r) => r.data),
  getTour: (id) => client.get(`/travel/tours/${id}`).then((r) => r.data),
  listGuides: (params) => client.get('/travel/guides', { params }).then((r) => r.data),
};

export default travelApi;
