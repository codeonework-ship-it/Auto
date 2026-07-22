import client from './client';

/*
 * Notifications service — notifications bounded context.
 * The backend wraps responses in { success, data, timestamp }; we unwrap `.data.data`.
 * Every route is authenticated and scoped to the calling user's own notifications.
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const notificationsApi = {
  list: () => client.get('/notifications').then(unwrap),
  unreadCount: () => client.get('/notifications/unread-count').then(unwrap),
  markRead: (id) => client.patch(`/notifications/${id}/read`).then(unwrap),
  markAllRead: () => client.patch('/notifications/read-all').then(unwrap),
};

export default notificationsApi;
