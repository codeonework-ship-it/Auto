import client from './client';

/*
 * Posts service — catalog bounded context (car & bike posts).
 * Image upload uses multipart/form-data (up to 20 images per post).
 */
export const postsApi = {
  list: (params) => client.get('/posts', { params }).then((r) => r.data),
  get: (id) => client.get(`/posts/${id}`).then((r) => r.data),
  create: (payload) => client.post('/posts', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/posts/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/posts/${id}`).then((r) => r.data),

  // Upload images for a post; `files` is a FileList/array of File.
  uploadImages: (postId, files, onUploadProgress) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('images', f));
    return client
      .post(`/posts/${postId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then((r) => r.data);
  },
};

export default postsApi;
