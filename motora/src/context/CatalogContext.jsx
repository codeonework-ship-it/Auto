import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchProducts } from "../api.js";

/* ---- taxonomy (UI labels only; all product data comes from the API) ---- */
export const CAR_CATEGORIES = [
  { id: "suv", label: "SUV" }, { id: "sedan", label: "Sedan" }, { id: "hatchback", label: "Hatchback" },
  { id: "coupe", label: "Coupe" }, { id: "luxury", label: "Luxury" }, { id: "ev", label: "Electric" },
  { id: "hybrid", label: "Hybrid" }, { id: "offroad", label: "Off-road" }, { id: "convertible", label: "Convertible" },
];
export const BIKE_CATEGORIES = [
  { id: "sports", label: "Sports" }, { id: "cruiser", label: "Cruiser" }, { id: "naked", label: "Naked" },
  { id: "adventure", label: "Adventure" }, { id: "scooter", label: "Scooter" }, { id: "commuter", label: "Commuter" },
  { id: "electric", label: "Electric" }, { id: "touring", label: "Touring" }, { id: "caferacer", label: "Café Racer" },
];
export const catLabel = (type, id) =>
  ((type === "bike" ? BIKE_CATEGORIES : CAR_CATEGORIES).find((c) => c.id === id) || { label: id }).label;

/* ---- storage that tolerates disabled localStorage ---- */
const store = (() => {
  let ok = true;
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); } catch { ok = false; }
  const mem = {};
  return {
    get(k, d) { try { const v = ok ? localStorage.getItem(k) : mem[k]; return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { ok ? localStorage.setItem(k, JSON.stringify(v)) : (mem[k] = JSON.stringify(v)); } catch { /* blocked */ } },
  };
})();

const Ctx = createContext(null);

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");   /* loading | ready | error */
  const [saved, setSaved] = useState(() => store.get("motora_saved", []));
  const [compare, setCompare] = useState(() => store.get("motora_compare", []));
  const [toast, setToastState] = useState(null);
  const toastTimer = useRef(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setProducts(await fetchProducts());
      setStatus("ready");
    } catch (e) {
      console.error("Catalog load failed", e);
      setStatus("error");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setToast = useCallback((msg, warn = false) => {
    clearTimeout(toastTimer.current);
    setToastState({ msg, warn });
    toastTimer.current = setTimeout(() => setToastState(null), warn ? 4200 : 2600);
  }, []);

  const toggleSaved = useCallback((id) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      store.set("motora_saved", next);
      setToast(prev.includes(id) ? "REMOVED FROM GARAGE" : "DOCKED IN YOUR GARAGE");
      return next;
    });
  }, [setToast]);

  const toggleCompare = useCallback((id) => {
    setCompare((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        store.set("motora_compare", next);
        return next;
      }
      const v = products.find((p) => p.id === id);
      const first = products.find((p) => p.id === prev[0]);
      if (first && v && first.type !== v.type) {
        setToast(`CROSS-CLASS DUEL BLOCKED — TRAY HOLDS ${first.type.toUpperCase()}S. CLEAR IT TO COMPARE ${v.type.toUpperCase()}S.`, true);
        return prev;
      }
      if (prev.length >= 4) { setToast("DUEL BAY FULL — MAX 4 MACHINES.", true); return prev; }
      const next = [...prev, id];
      store.set("motora_compare", next);
      return next;
    });
  }, [products, setToast]);

  const clearCompare = useCallback(() => { setCompare([]); store.set("motora_compare", []); }, []);

  const brands = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const b = map.get(p.brand) || { name: p.brand, count: 0, types: new Set() };
      b.count += 1; b.types.add(p.type); map.set(p.brand, b);
    }
    return [...map.values()].map((b) => ({ ...b, types: [...b.types] }));
  }, [products]);

  const value = useMemo(() => ({
    products, status, reload: load, brands,
    saved, toggleSaved, compare, toggleCompare, clearCompare,
    toast, setToast,
  }), [products, status, load, brands, saved, toggleSaved, compare, toggleCompare, clearCompare, toast, setToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCatalog outside CatalogProvider");
  return ctx;
}
