import client from './client';

/*
 * KYC service — buyer/seller identity verification.
 * Text fields only; the backend accepts no document uploads (project safety rules).
 */
const unwrap = (r) => r.data?.data ?? r.data;

export const kycApi = {
  // Submit the caller's own KYC profile (one per BUYER/SELLER type).
  submit: (payload) => client.post('/kyc', payload).then(unwrap),
  // The caller's own KYC profiles.
  myProfiles: () => client.get('/kyc/me').then(unwrap),
  // Update an existing profile while it is still editable (DRAFT/SUBMITTED/REJECTED).
  update: (id, payload) => client.put(`/kyc/${id}`, payload).then(unwrap),
};

export default kycApi;
