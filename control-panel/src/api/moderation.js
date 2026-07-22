import client from './client';

// Backend response envelope { success, data, timestamp } — unwrap to the payload.
const unwrap = (r) => r.data?.data ?? r.data;

// Moderation service (moderation context — ModerationController, /api/v1/moderation).
export const moderationApi = {
  // GET /moderation/reports?status= -> [{ id, reporterId, subjectType, subjectId,
  //   reasonId, details, status, createdAt }]. status ∈ OPEN | REVIEWING | RESOLVED | DISMISSED.
  async listReports(params = {}) {
    return unwrap(await client.get('/moderation/reports', { params }));
  },

  // PATCH /moderation/reports/{id} { status } — triage a report.
  async setReportStatus(id, status) {
    return unwrap(await client.patch(`/moderation/reports/${id}`, { status }));
  },

  // PATCH /moderation/comments/{id}/status { status } — VISIBLE | HIDDEN | FLAGGED.
  async setCommentStatus(id, status) {
    return unwrap(await client.patch(`/moderation/comments/${id}/status`, { status }));
  },

  // PATCH /moderation/reviews/{id}/status { status } — VISIBLE | HIDDEN | FLAGGED.
  async setReviewStatus(id, status) {
    return unwrap(await client.patch(`/moderation/reviews/${id}/status`, { status }));
  },
};

export default moderationApi;
