import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCatalog, catLabel } from "../context/CatalogContext.jsx";
import { productImg } from "../api.js";
import { fmtPrice, fmtCount, unitCode, clamp, parseNum } from "../util.js";
import { IconHeart, IconDuel, IconStar } from "./Icons.jsx";

/* reveal-on-scroll for children with .reveal */
export function useReveal(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.06 });
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export const Rating = ({ value, count }) => (
  <span className="rating" aria-label={value ? `Rated ${value} of 5` : "Not yet rated"}>
    <IconStar size={13} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
    {value ? value.toFixed(1) : "NEW"}{count != null && <span style={{ color: "var(--muted)" }}> · {fmtCount(count)}</span>}
  </span>
);

export function ProductImage({ v, position = 0, eager = false, alt }) {
  if (!v || !(v.imageCount > 0)) {
    return (
      <svg viewBox="0 0 640 360" role="img" aria-label={`No image for ${v?.model || "product"}`}>
        <rect width="640" height="360" fill="#080c13" />
        <path d="M290 150 h60 v10 h20 v50 h-100 v-50 h20 Z M320 172 a14 14 0 1 0 .1 0" fill="none" stroke="#22344a" strokeWidth="4" />
        <text x="320" y="252" textAnchor="middle" fontFamily="Consolas,monospace" fontSize="16" letterSpacing="4" fill="#3d5470">VISUAL PENDING</text>
      </svg>
    );
  }
  const pos = clamp(position, 0, v.imageCount - 1);
  return (
    <img src={productImg(v.id, pos)} alt={alt || `${v.brand} ${v.model}`}
         width="640" height="360" loading={eager ? "eager" : "lazy"} decoding="async"
         {...(eager ? { fetchpriority: "high" } : {})} />
  );
}

export function VehicleCard({ v }) {
  const { saved, toggleSaved, compare, toggleCompare } = useCatalog();
  const inSaved = saved.includes(v.id);
  const inCompare = compare.includes(v.id);
  return (
    <article className="hud hud-quiet vcard reveal">
      <div className="vcard-art">
        <Link to={`/vehicle/${v.id}`} aria-label={`${v.brand} ${v.model} details`}>
          <ProductImage v={v} />
        </Link>
        <div className="vcard-tags">
          {(v.tags || []).slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}
          {v.availability !== "New" && <span className="chip chip-amber">{v.availability}</span>}
        </div>
        <button className="icon-btn vcard-save" aria-pressed={inSaved}
                aria-label={inSaved ? "Remove from garage" : "Dock in garage"}
                onClick={() => toggleSaved(v.id)}>
          <IconHeart size={17} filled={inSaved} />
        </button>
      </div>
      <div className="vcard-body">
        <div className="vcard-sys"><span>{v.brand} // {catLabel(v.type, v.category)}</span><span>{unitCode(v)}</span></div>
        <h3 className="vcard-name"><Link to={`/vehicle/${v.id}`}>{v.model}</Link></h3>
        <div className="vstat-row">
          <Rating value={v.rating} count={v.reviewCount} />
          <span>PWR <b>{v.power}</b></span>
          <span>{v.fuel === "Electric" ? "RNG" : "ECO"} <b>{v.mileage}</b></span>
        </div>
        <div className="vprice">{fmtPrice(v.price)} {v.price != null && <small>base</small>}</div>
        <div className="vcard-actions">
          <Link className="btn btn-cmd btn-sm" to={`/vehicle/${v.id}`}>Intel</Link>
          <button className="btn btn-line btn-sm" aria-pressed={inCompare} onClick={() => toggleCompare(v.id)}>
            <IconDuel size={14} /> {inCompare ? "In duel" : "Duel"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function TelemetryBar({ label, value, pct }) {
  return (
    <div className="tele-row">
      <span className="lbl">{label}</span>
      <div className="tele-track"><span className="tele-fill" style={{ width: `${clamp(pct, 4, 100)}%` }} /></div>
      <span className="tele-val">{value}</span>
    </div>
  );
}

export function Telemetry({ v }) {
  const power = parseNum(v.power), torque = parseNum(v.torque), eco = parseNum(v.mileage);
  const isRange = /range/i.test(v.mileage || "");
  return (
    <div className="telemetry hud hud-quiet" style={{ padding: 16 }}>
      <TelemetryBar label="POWER" value={v.power || "—"} pct={(power / (v.type === "car" ? 1050 : 220)) * 100} />
      <TelemetryBar label="TORQUE" value={v.torque || "—"} pct={(torque / (v.type === "car" ? 1450 : 230)) * 100} />
      <TelemetryBar label={isRange ? "RANGE" : "ECONOMY"} value={v.mileage || "—"} pct={(eco / (isRange ? 660 : 66)) * 100} />
    </div>
  );
}

export const SkeletonGrid = ({ n = 6 }) => (
  <div className="grid g4" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <div key={i} className="skel" />)}
  </div>
);

export const Void = ({ sig = "// NO SIGNAL", title, children }) => (
  <div className="hud void">
    <div className="sig">{sig}</div>
    <h2>{title}</h2>
    {children}
  </div>
);

export function Toast() {
  const { toast } = useCatalog();
  if (!toast) return null;
  return <div className={`toast ${toast.warn ? "warn" : ""}`} role="status">{toast.msg}</div>;
}
