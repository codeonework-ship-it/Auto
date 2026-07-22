import client from './client';

/*
 * Engagement service — reviews, comments and reporting (engagement bounded context).
 * Reads are public; writing requires an authenticated (signed-up) member.
 * Endpoints are keyed by the post's UUID (not its slug).
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const engagementApi = {
  listReviews: (postId) => client.get(`/posts/${postId}/reviews`).then(unwrap),
  // Public review-tag master (id, name, active) — used to tag a review.
  listTags: () => client.get('/masters/review-tags').then(unwrap),
  // payload: { rating, body, tagIds?: string[] }
  addReview: (postId, payload) => client.post(`/posts/${postId}/reviews`, payload).then(unwrap),
  listComments: (postId) => client.get(`/posts/${postId}/comments`).then(unwrap),
  addComment: (postId, payload) => client.post(`/posts/${postId}/comments`, payload).then(unwrap),
  // payload: { subjectType: 'REVIEW'|'COMMENT'|'POST'..., subjectId, reasonId?, details? }
  report: (payload) => client.post('/reports', payload).then(unwrap),
};

// Backwards-compatible alias
export const reviewsApi = engagementApi;
export default engagementApi;
