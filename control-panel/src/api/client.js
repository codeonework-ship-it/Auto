import axios from 'axios';

// Central axios instance for the AutoHub control-panel.
// Base URL comes from Vite env; falls back to the dev proxy path.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const TOKEN_KEY = 'autohub_admin_token';

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Request interceptor — attach the JWT bearer token if present.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — normalize errors and handle 401 (expired/invalid session).
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Avoid redirect loops when already on the login page.
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    const message =
      error?.response?.data?.message || error?.message || 'Unexpected error';
    return Promise.reject(Object.assign(error, { normalizedMessage: message }));
  }
);

export default client;
