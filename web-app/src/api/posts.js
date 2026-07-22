import client from './client';

/*
 * Posts service — catalog bounded context (car & bike posts).
 * The backend wraps responses in { success, data, timestamp }; we unwrap `.data.data`.
 * Image upload uses multipart/form-data with the field name `files` (up to 20 per post).
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const postsApi = {
  // params: { kind, make, model } — all optional; make/model are UUID strings (server-side filters).
  list: (params) => client.get('/posts', { params }).then(unwrap),
  mine: () => client.get('/posts/mine').then(unwrap),
  get: (slug) => client.get(`/posts/${slug}`).then(unwrap),
  create: (payload) => client.post('/posts', payload).then(unwrap),
  update: (id, payload) => client.put(`/posts/${id}`, payload).then(unwrap),
  publish: (id) => client.post(`/posts/${id}/publish`).then(unwrap),
  remove: (id) => client.delete(`/posts/${id}`).then((r) => r.data),

  // Upload images for a post; `files` is a FileList/array of File.
  uploadImages: (postId, files, onUploadProgress) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    return client
      .post(`/posts/${postId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then(unwrap);
  },
};

export default postsApi;
