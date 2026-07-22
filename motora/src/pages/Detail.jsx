import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCatalog, catLabel } from "../context/CatalogContext.jsx";
import { fetchProduct, API_BASE } from "../api.js";
import { fmtPrice, fmtCount, unitCode } from "../util.js";
import { ProductImage, Telemetry, Rating, Void, SkeletonGrid, VehicleCard, useReveal } from "../components/Ui.jsx";
import { IconHeart, IconDuel, IconFlag, IconChevron } from "../components/Icons.jsx";

const detailCache = new Map();

export default function Detail() {
  const { slug } = useParams();
  const { products, saved, toggleSaved, compare, toggleCompare, setToast } = useCatalog();
  const [d, setD] = useState(detailCache.get(slug) || null);
  const [state, setState] = useState(d ? "ready" : "loading");
  const [gal, setGal] = useState(0);
  const [variant, setVariant] = useState(0);
  const [revSort, setRevSort] = useState("helpful");
  const galleryRef = useRef(null);
  const touchX = useRef(null);

  useEffect(() => {
    setGal(0); setVariant(0);
    const cached = detailCache.get(slug);
    if (cached) { setD(cached); setState("ready"); return; }
    setState("loading");
    let live = true;
    fetchProduct(slug)
      .then((res) => {
        const merged = { ...res.summary, colors: res.colors, variants: res.variants, specs: res.specs,
                         pros: res.pros, cons: res.cons, reviews: res.reviews, imageLabels: res.imageLabels };
        detailCache.set(slug, merged);
        if (live) { setD(merged); setState("ready"); }
      })
      .catch((e) => live && setState(e.status === 404 ? "missing" : "error"));
    return () => { live = false; };
  }, [slug]);

  const v = d;
  const similar = useMemo(() => {
    if (!v) return [];
    return products
      .filter((p) => p.type === v.type && p.id !== v.id &&
        (p.category === v.category || Math.abs((p.price ?? 0) - (v.price ?? 0)) < (v.price ?? 1) * 0.4))
      .slice(0, 3);
  }, [products, v]);
  const ref = useReveal([v, revSort]);

  if (state === "loading") return <div className="wrap section"><SkeletonGrid n={3} /></div>;
  if (state === "missing") return (
    <div className="wrap section"><Void sig="// TARGET NOT FOUND" title="Lost the route">
      <p className="muted">That designation doesn't exist in the fleet.</p>
      <Link className="btn btn-cmd" to="/hangar">Return to hangar</Link></Void></div>
  );
  if (state === "error") return (
    <div className="wrap section"><Void sig="// LINK DOWN" title="Catalog API unreachable">
      <p className="muted mono" style={{ fontSize: ".74rem" }}>{API_BASE}</p>
      <button className="btn btn-cmd" onClick={() => location.reload()}>Re-establish link</button></Void></div>
  );

  const reviews = v.reviews || [];
  const dist = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => Math.round(r.rating) === s).length);
  const sortedReviews = [...reviews].sort({
    helpful: (a, b) => b.helpful - a.helpful,
    recent: (a, b) => String(b.date).localeCompare(String(a.date)),
    high: (a, b) => b.rating - a.rating,
    low: (a, b) => a.rating - b.rating,
  }[revSort]);
  const activeVariant = v.variants[variant] || v.variants[0];
  const galleryLabels = (v.imageLabels?.length ? v.imageLabels : ["Front quarter", "Side profile", "Rear quarter", "Studio detail"]).slice(0, Math.max(1, v.imageCount));
  const inSaved = saved.includes(v.id);
  const inCompare = compare.includes(v.id);
  const nudgeGal = (dir) => setGal((g) => (g + dir + galleryLabels.length) % galleryLabels.length);

  return (
    <div className="wrap" ref={ref}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Deck</Link> / <Link to={`/hangar?type=${v.type}`}>{v.type === "car" ? "Cars" : "Bikes"}</Link> /{" "}
        <Link to={`/hangar?type=${v.type}&cat=${v.category}`}>{catLabel(v.type, v.category)}</Link> /{" "}
        <span style={{ color: "var(--cyan)" }}>{v.model}</span>
      </nav>

      <div className="detail-grid">
        <div>
          <div className="hud gallery-main" ref={galleryRef} tabIndex={0} role="group"
               aria-label={`${v.model} gallery — arrow keys to change angle`}
               onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); nudgeGal(1); } if (e.key === "ArrowLeft") { e.preventDefault(); nudgeGal(-1); } }}
               onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
               onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (touchX.current ?? 0); if (Math.abs(dx) > 40) nudgeGal(dx < 0 ? 1 : -1); touchX.current = null; }}>
            <ProductImage v={v} position={gal} eager alt={`${v.brand} ${v.model} — ${galleryLabels[gal]}`} />
          </div>
          {v.imageCount > 1 && (
            <div className="thumbs" role="tablist" aria-label="Angles">
              {galleryLabels.map((l, i) => (
                <button key={l} role="tab" aria-current={i === gal} aria-label={l} onClick={() => setGal(i)}>
                  <ProductImage v={v} position={i} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="vcard-sys" style={{ marginBottom: 8 }}>
            <span>{v.brand} // {catLabel(v.type, v.category)}</span><span>{unitCode(v)}</span>
          </div>
          <h1 className="h-display" style={{ fontSize: "clamp(1.6rem,4vw,2.5rem)" }}>{v.model}</h1>
          <div className="vstat-row" style={{ margin: "6px 0 14px" }}>
            <Rating value={v.rating} count={reviews.length} />
            <span>{fmtCount(v.searches)} SEARCHES</span>
            {v.availability !== "New" && <span className="chip chip-amber">{v.availability}</span>}
          </div>
          <div className="vprice" style={{ fontSize: "1.9rem" }}>{fmtPrice(activeVariant?.price ?? v.price)}</div>
          <p className="mono muted" style={{ fontSize: ".64rem", letterSpacing: ".22em", margin: "2px 0 16px" }}>
            {(activeVariant?.price ?? v.price) != null ? "BASE PRICE // EX-SHOWROOM" : "CONTACT COMMAND FOR AVAILABILITY"}
          </p>

          {v.variants.length > 1 && (
            <div className="seg" role="group" aria-label="Variants" style={{ marginBottom: 16, flexWrap: "wrap" }}>
              {v.variants.map((vr, i) => (
                <button key={vr.name} aria-pressed={i === variant} onClick={() => setVariant(i)}>{vr.name}</button>
              ))}
            </div>
          )}

          <Telemetry v={{ ...v, power: activeVariant?.power || v.power }} />

          <div className="spec-strip">
            <div className="hud hud-quiet spec-cell"><b>{v.transmission || "—"}</b><span>Drive</span></div>
            {v.type === "car"
              ? <>
                  <div className="hud hud-quiet spec-cell"><b>{v.drivetrain || "—"}</b><span>Layout</span></div>
                  <div className="hud hud-quiet spec-cell"><b>{v.seating ?? "—"}</b><span>Seats</span></div>
                  <div className="hud hud-quiet spec-cell"><b>{"◆".repeat(v.safety || 0) || "—"}</b><span>Safety</span></div>
                </>
              : <>
                  <div className="hud hud-quiet spec-cell"><b>{v.kerb || "—"}</b><span>Kerb</span></div>
                  <div className="hud hud-quiet spec-cell"><b>{v.seatHeight || "—"}</b><span>Seat</span></div>
                  <div className="hud hud-quiet spec-cell"><b>{v.abs || "—"}</b><span>ABS</span></div>
                </>}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-cmd" onClick={() => setToast(v.availability === "Upcoming" ? "LAUNCH ALERT ARMED" : "PARTNER DEALER SIGNALLED — DEMO")}>
              Request best price
            </button>
            <button className="btn btn-line" aria-pressed={inCompare} onClick={() => toggleCompare(v.id)}>
              <IconDuel size={15} /> {inCompare ? "In duel bay" : "Add to duel"}
            </button>
            <button className="btn btn-line" aria-pressed={inSaved} onClick={() => toggleSaved(v.id)}>
              <IconHeart size={15} filled={inSaved} /> {inSaved ? "Docked" : "Dock"}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------- full specifications ------------------------ */}
      <section className="section" aria-labelledby="spH">
        <div className="kicker">Vehicle intelligence</div>
        <h2 id="spH" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Full technical specification</h2>
        <div className="spec-tables">
          {Object.entries(v.specs).map(([group, rows]) => (
            <div key={group} className="hud hud-quiet" style={{ padding: 18 }}>
              <h3 className="mono" style={{ fontSize: ".72rem", letterSpacing: ".24em", color: "var(--cyan)", textTransform: "uppercase" }}>{group}</h3>
              <table className="spec-table"><tbody>
                {Object.entries(rows).map(([k, val]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{val}</td></tr>
                ))}
              </tbody></table>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- variants table --------------------------- */}
      <section className="section" aria-labelledby="vrH">
        <div className="kicker">Loadouts</div>
        <h2 id="vrH" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Variants &amp; pricing</h2>
        <div className="duel-wrap hud hud-quiet">
          <table className="duel">
            <thead><tr><th>Variant</th><th>Price</th><th>Power</th><th>{v.fuel === "Electric" ? "Range" : "Economy"}</th><th>Est. monthly*</th></tr></thead>
            <tbody>
              {v.variants.map((vr) => (
                <tr key={vr.name}>
                  <td style={{ fontFamily: "var(--sans)", fontWeight: 700 }}>{vr.name}</td>
                  <td>{fmtPrice(vr.price)}</td><td>{vr.power}</td><td>{vr.mileage}</td>
                  <td>{vr.price ? "$" + Math.round((vr.price * 1.08) / 60).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mono muted" style={{ fontSize: ".62rem", letterSpacing: ".14em", marginTop: 8 }}>*ILLUSTRATIVE 60-MONTH ESTIMATE @ 8% — NOT A FINANCE OFFER</p>
        {v.colors?.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {v.colors.map((c) => <span key={c} className="chip chip-dim">{c}</span>)}
          </div>
        )}
      </section>

      {/* ------------------------------ pros / cons --------------------------- */}
      <section className="section" aria-labelledby="pcH">
        <div className="kicker">Field assessment</div>
        <h2 id="pcH" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Strengths &amp; watch-outs</h2>
        <div className="proscons">
          <div className="hud hud-quiet pos" style={{ padding: 18 }}>
            <h4>▲ Confirmed strengths</h4>
            <ul>{(v.pros?.length ? v.pros : ["Insufficient field data"]).map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          <div className="hud hud-quiet neg" style={{ padding: 18 }}>
            <h4>▼ Watch-outs</h4>
            <ul>{(v.cons?.length ? v.cons : ["Nothing reported"]).map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* -------------------------------- reviews ----------------------------- */}
      <section className="section" aria-labelledby="rvH">
        <div className="kicker">Owner signal</div>
        <h2 id="rvH" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Reviews &amp; ratings</h2>
        {reviews.length ? (
          <>
            <div className="rev-summary">
              <div className="hud hud-quiet" style={{ padding: 20, textAlign: "center" }}>
                <div className="big-score">{v.rating.toFixed(1)}</div>
                <div className="mono muted" style={{ fontSize: ".64rem", letterSpacing: ".2em", marginTop: 6 }}>
                  {reviews.length} SIGNAL{reviews.length === 1 ? "" : "S"} RECEIVED
                </div>
              </div>
              <div className="hud hud-quiet" style={{ padding: 20 }}>
                {dist.map((n, i) => (
                  <div key={i} className="dist-row">
                    <span>{5 - i}★</span>
                    <div className="dist-bar"><i style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} /></div>
                    <span>{n}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <select className="field" style={{ width: "auto" }} value={revSort} onChange={(e) => setRevSort(e.target.value)} aria-label="Sort reviews">
                    <option value="helpful">Most helpful</option><option value="recent">Most recent</option>
                    <option value="high">Highest</option><option value="low">Lowest</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              {sortedReviews.map((r, i) => (
                <article key={i} className="hud hud-quiet rev-card">
                  <div className="rev-head">
                    <span className="avatar">{r.author[0]}</span>
                    <div>
                      <b style={{ fontSize: ".92rem" }}>{r.author}</b>{" "}
                      {r.verified
                        ? <span className="chip" style={{ padding: "2px 8px", fontSize: ".56rem" }}>VERIFIED OWNER</span>
                        : <span className="chip chip-amber" style={{ padding: "2px 8px", fontSize: ".56rem" }}>{r.ownership?.toUpperCase()}</span>}
                      <div className="rev-meta"><span>{r.date}</span>{r.variant && <span>LOADOUT: {r.variant}</span>}</div>
                    </div>
                    <span style={{ marginLeft: "auto" }}><Rating value={r.rating} /></span>
                  </div>
                  <div className="rev-body"><b>{r.title}</b><p>{r.content}</p></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="chip chip-dim">▲ {r.helpful} FOUND USEFUL</span>
                    <button className="btn btn-line btn-sm" onClick={() => setToast("FLAGGED FOR MODERATION")}>
                      <IconFlag size={13} /> Report
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <Void sig="// AWAITING FIRST SIGNAL" title="No reviews yet">
            <p className="muted">Pilot a {v.model}? Your field report guides thousands of operators.</p>
          </Void>
        )}
      </section>

      {/* -------------------------------- similar ----------------------------- */}
      {similar.length > 0 && (
        <section className="section" aria-labelledby="smH" style={{ paddingBottom: 40 }}>
          <div className="kicker">Adjacent units</div>
          <h2 id="smH" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Similar {v.type === "car" ? "cars" : "bikes"}</h2>
          <div className="grid">{similar.map((s) => <VehicleCard key={s.id} v={s} />)}</div>
        </section>
      )}
    </div>
  );
}
