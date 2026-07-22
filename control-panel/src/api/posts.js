import client from './client';

// Backend response envelope { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// Catalog posts (PostController, /api/v1/posts) + marketplace listing approvals
// (ListingController, /api/v1/marketplace/listings). Used by the moderation & approval screens.
export const postsApi = {
  // GET /posts?kind= -> [{ id, kind, title, slug, status, authorId, publishedAt, updatedAt,
  //   imageCount, coverUrl }]  (published posts only).
  async list(params = {}) {
    return unwrap(await client.get('/posts', { params }));
  },

  // POST /posts/{id}/publish
  async publish(id) {
    return unwrap(await client.post(`/posts/${id}/publish`));
  },

  // DELETE /posts/{id} — moderator take-down (requires post:moderate).
  async remove(id) {
    return unwrap(await client.delete(`/posts/${id}`));
  },

  // ---- marketplace listings ----

  // GET /marketplace/listings -> ACTIVE listings only [{ id, sellerId, title, priceAmount,
  //   currency, cityId, status, updatedAt }]. There is NO "list pending" endpoint.
  async listListings(params = {}) {
    return unwrap(await client.get('/marketplace/listings', { params }));
  },

  // POST /marketplace/listings/{id}/approve
  async approveListing(id) {
    return unwrap(await client.post(`/marketplace/listings/${id}/approve`));
  },

  // POST /marketplace/listings/{id}/reject { reason }
  async rejectListing(id, reason) {
    return unwrap(await client.post(`/marketplace/listings/${id}/reject`, { reason }));
  },
};

export default postsApi;
