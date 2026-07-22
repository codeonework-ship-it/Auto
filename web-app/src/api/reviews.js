import client from './client';

/*
 * Reviews & comments service — engagement bounded context.
 * Commenting requires an authenticated (signed-up) user.
 */
export const reviewsApi = {
  listForPost: (postId, params) =>
    client.get(`/posts/${postId}/reviews`, { params }).then((r) => r.data),
  addReview: (postId, payload) =>
    client.post(`/posts/${postId}/reviews`, payload).then((r) => r.data),
  addComment: (reviewId, payload) =>
    client.post(`/reviews/${reviewId}/comments`, payload).then((r) => r.data),
  report: (reviewId, payload) =>
    client.post(`/reviews/${reviewId}/report`, payload).then((r) => r.data),
};

export default reviewsApi;
