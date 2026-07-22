import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCatalog, CAR_CATEGORIES, BIKE_CATEGORIES, catLabel } from "../context/CatalogContext.jsx";
import { fmtPrice } from "../util.js";
import { VehicleCard, Void, useReveal } from "../components/Ui.jsx";
import { IconFilter, IconX } from "../components/Icons.jsx";

const SORTS = {
  popular: ["Popularity", (a, b) => b.searches - a.searches],
  "price-asc": ["Price ▲", (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)],
  "price-desc": ["Price ▼", (a, b) => (b.price ?? -1) - (a.price ?? -1)],
  rating: ["Rating", (a, b) => b.rating - a.rating],
  newest: ["Newest", (a, b) => (b.availability === "Upcoming") - (a.availability === "Upcoming")],
};

export default function Listings() {
  const { products } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);

  const f = {
    type: params.get("type") || "all",
    q: params.get("q") || "",
    cat: params.getAll("cat"),
    brand: params.getAll("brand"),
    fuel: params.getAll("fuel"),
    avail: params.getAll("avail"),
    pmin: params.get("pmin") || "",
    pmax: params.get("pmax") || "",
    rating: params.get("rating") || "",
    sort: params.get("sort") || "popular",
  };

  const patch = (mut) => {
    const next = new URLSearchParams(params);
    mut(next);
    setParams(next, { replace: false });
  };
  const toggleMulti = (key, val) => patch((n) => {
    const cur = n.getAll(key);
    n.delete(key);
    (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]).forEach((x) => n.append(key, x));
  });
  const setOne = (key, val) => patch((n) => { val ? n.set(key, val) : n.delete(key); });
  const reset = () => setParams(f.type !== "all" ? { type: f.type } : {});

  const mn = parseFloat(f.pmin), mx = parseFloat(f.pmax);
  const priceError = !isNaN(mn) && !isNaN(mx) && mn > mx;

  const list = useMemo(() => {
    let l = products.filter((p) => f.type === "all" || p.type === f.type);
    if (f.q) { const t = f.q.toLowerCase(); l = l.filter((p) => `${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(t)); }
    if (f.cat.length) l = l.filter((p) => f.cat.includes(p.category));
    if (f.brand.length) l = l.filter((p) => f.brand.includes(p.brand));
    if (f.fuel.length) l = l.filter((p) => f.fuel.includes(p.fuel));
    if (f.avail.length) l = l.filter((p) => f.avail.includes(p.availability));
    if (!priceError) {
      if (!isNaN(mn)) l = l.filter((p) => p.price != null && p.price >= mn);
      if (!isNaN(mx)) l = l.filter((p) => p.price != null && p.price <= mx);
    }
    if (f.rating) l = l.filter((p) => p.rating >= parseFloat(f.rating));
    return [...l].sort((SORTS[f.sort] || SORTS.popular)[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, params]);

  const ref = useReveal([list]);

  const chips = [
    ...f.cat.map((c) => [catLabel(f.type === "bike" ? "bike" : "car", c), () => toggleMulti("cat", c)]),
    ...f.brand.map((b) => [b, () => toggleMulti("brand", b)]),
    ...f.fuel.map((x) => [x, () => toggleMulti("fuel", x)]),
    ...f.avail.map((x) => [x, () => toggleMulti("avail", x)]),
    ...(f.q ? [[`“${f.q}”`, () => setOne("q", "")]] : []),
    ...(f.pmin ? [[`MIN ${fmtPrice(+f.pmin)}`, () => setOne("pmin", "")]] : []),
    ...(f.pmax ? [[`MAX ${fmtPrice(+f.pmax)}`, () => setOne("pmax", "")]] : []),
    ...(f.rating ? [[`RATING ${f.rating}+`, () => setOne("rating", "")]] : []),
  ];

  const pool = products.filter((p) => f.type === "all" || p.type === f.type);
  const brandOpts = [...new Set(pool.map((p) => p.brand))].sort();
  const fuelOpts = [...new Set(pool.map((p) => p.fuel))].sort();
  const cats = f.type === "car" ? CAR_CATEGORIES : f.type === "bike" ? BIKE_CATEGORIES : [];

  const FilterBody = () => (
    <>
      <fieldset className="fgroup">
        <legend>Price band ($)</legend>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input className="field" type="number" min="0" placeholder="MIN" aria-label="Minimum price"
                 defaultValue={f.pmin} onBlur={(e) => setOne("pmin", e.target.value)} />
          <span className="muted">—</span>
          <input className="field" type="number" min="0" placeholder="MAX" aria-label="Maximum price"
                 defaultValue={f.pmax} onBlur={(e) => setOne("pmax", e.target.value)} />
        </div>
        {priceError && <p className="mono" style={{ color: "var(--red)", fontSize: ".68rem", margin: "8px 0 0" }} role="alert">MIN &gt; MAX — PRICE FILTER SUSPENDED</p>}
      </fieldset>
      {cats.length > 0 && (
        <fieldset className="fgroup">
          <legend>{f.type === "car" ? "Body class" : "Class"}</legend>
          {cats.map((c) => (
            <label key={c.id} className="fopt">
              <input type="checkbox" checked={f.cat.includes(c.id)} onChange={() => toggleMulti("cat", c.id)} /> {c.label}
            </label>
          ))}
        </fieldset>
      )}
      <fieldset className="fgroup"><legend>Marque</legend>
        {brandOpts.map((b) => (
          <label key={b} className="fopt"><input type="checkbox" checked={f.brand.includes(b)} onChange={() => toggleMulti("brand", b)} /> {b}</label>
        ))}
      </fieldset>
      <fieldset className="fgroup"><legend>Powerplant</legend>
        {fuelOpts.map((x) => (
          <label key={x} className="fopt"><input type="checkbox" checked={f.fuel.includes(x)} onChange={() => toggleMulti("fuel", x)} /> {x}</label>
        ))}
      </fieldset>
      <fieldset className="fgroup"><legend>Minimum rating</legend>
        <select className="field" value={f.rating} onChange={(e) => setOne("rating", e.target.value)} aria-label="Minimum rating">
          <option value="">ANY</option>
          {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>{r}+ STARS</option>)}
        </select>
      </fieldset>
      <fieldset className="fgroup"><legend>Status</legend>
        {["New", "Upcoming", "Discontinued"].map((a) => (
          <label key={a} className="fopt"><input type="checkbox" checked={f.avail.includes(a)} onChange={() => toggleMulti("avail", a)} /> {a}</label>
        ))}
      </fieldset>
      <button className="btn btn-line" style={{ width: "100%", marginTop: 16 }} onClick={() => { reset(); setDrawer(false); }}>Reset all</button>
    </>
  );

  return (
    <div className="wrap" ref={ref}>
      <div className="hangar">
        <aside className="hud filters" aria-label="Filters">
          <div className="kicker" style={{ marginBottom: 4 }}>Filter matrix {chips.length > 0 && `(${chips.length})`}</div>
          <FilterBody />
        </aside>
        <div>
          <div className="toolbar">
            <div className="seg" role="group" aria-label="Vehicle class">
              {["all", "car", "bike"].map((t) => (
                <button key={t} aria-pressed={f.type === t}
                        onClick={() => setParams(t === "all" ? {} : { type: t })}>
                  {t === "all" ? "All" : t === "car" ? "Cars" : "Bikes"}
                </button>
              ))}
            </div>
            <span className="count-readout grow" aria-live="polite"><b>{list.length}</b> UNITS ON DECK</span>
            <button className="btn btn-line btn-sm drawer-fab" onClick={() => setDrawer(true)} aria-haspopup="dialog">
              <IconFilter size={14} /> Filters {chips.length > 0 && `(${chips.length})`}
            </button>
            <select className="field" style={{ width: "auto" }} value={f.sort} aria-label="Sort"
                    onChange={(e) => setOne("sort", e.target.value)}>
              {Object.entries(SORTS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          {chips.length > 0 && (
            <div className="chips" aria-label="Active filters">
              {chips.map(([label, remove], i) => (
                <span key={i} className="chip">{label}<button onClick={remove} aria-label={`Remove ${label}`}><IconX size={12} /></button></span>
              ))}
              <button className="btn btn-line btn-sm" onClick={reset}>Reset</button>
            </div>
          )}
          {list.length ? (
            <div className="grid g4">{list.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
          ) : (
            <Void sig="// SCAN RETURNED ZERO" title="No machines match">
              <p className="muted">Widen the price band, drop a class filter, or switch vehicle type.</p>
              <button className="btn btn-cmd" onClick={reset}>Reset all filters</button>
            </Void>
          )}
        </div>
      </div>

      {drawer && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Filters"
             onKeyDown={(e) => e.key === "Escape" && setDrawer(false)}>
          <div className="drawer-head">
            <span className="kicker" style={{ margin: 0 }}>Filter matrix</span>
            <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close filters" autoFocus><IconX /></button>
          </div>
          <FilterBody />
          <button className="btn btn-cmd" style={{ width: "100%", marginTop: 14 }} onClick={() => setDrawer(false)}>Apply — {list.length} units</button>
        </div>
      )}
    </div>
  );
}
