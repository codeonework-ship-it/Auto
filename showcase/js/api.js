/* ============================================================================
   MOTORA — API client. All catalog data (products, specs, images, reviews)
   comes from the AutoHub Spring Boot API. No mock data.
   Responses use the envelope { success, data, timestamp } → unwrapped here.
   ============================================================================ */

const stored = (() => { try { return localStorage.getItem("mv_api_base"); } catch { return null; } })();
export const API_BASE = (window.MOTORA_API || stored || "http://localhost:18080/api/v1").replace(/\/$/, "");

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

/** All product summaries (cards, rankings, filters, compare). */
export const fetchProducts = () => get("/products");

/** Full product detail by slug (specs, variants, colours, reviews). */
export const fetchProduct = (slug) => get(`/products/${encodeURIComponent(slug)}`);

/** Cross-catalog review feed. */
export const fetchLatestReviews = (limit = 12) => get(`/products/reviews/latest?limit=${limit}`);

/** URL of an original SVG image served by the API. */
export const productImg = (slug, position = 0) =>
  `${API_BASE}/products/${encodeURIComponent(slug)}/images/${position}`;
