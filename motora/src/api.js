/* MOTORA — API client. The entire catalog (products, specs, images, reviews)
   is served by the AutoHub Spring Boot API. No mock data. */

const stored = (() => { try { return localStorage.getItem("motora_api"); } catch { return null; } })();
export const API_BASE = (import.meta.env.VITE_API_BASE || stored || "http://localhost:18080/api/v1").replace(/\/$/, "");

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const err = new Error(`API ${res.status} for ${path}`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  return body?.data ?? body;
}

export const fetchProducts = () => get("/products");
export const fetchProduct = (slug) => get(`/products/${encodeURIComponent(slug)}`);
export const fetchLatestReviews = (limit = 12) => get(`/products/reviews/latest?limit=${limit}`);
/* Bump ART_V whenever the server-side art generator changes — busts long-lived image caches. */
const ART_V = 2;
export const productImg = (slug, position = 0) =>
  `${API_BASE}/products/${encodeURIComponent(slug)}/images/${position}?v=${ART_V}`;
