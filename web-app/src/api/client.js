import axios from 'axios';

/*
 * Shared axios instance for the AutoHub API.
 * Base URL comes from VITE_API_BASE_URL (see .env.example); falls back to the
 * dev proxy path so /api/v1 is forwarded to the backend on 8080.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Origin that serves media (the API host), derived from the API base URL by
// stripping the trailing /api/v1. Empty string => same origin (dev proxy).
const apiOrigin = baseURL.replace(/\/api\/v\d+\/?$/, '');

/** Build an absolute URL for a server-relative media path like "/media/abc.png". */
export function mediaUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path}`;
}

export const TOKEN_KEY = 'autohub.jwt';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Request interceptor: attach JWT bearer token when present.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: normalize errors and handle 401 (expired/invalid token).
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Token invalid/expired — clear it. UI reacts via AuthContext bootstrap.
      setToken(null);
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Unexpected network error';
    return Promise.reject({ status, message, raw: error });
  },
);

export default client;
