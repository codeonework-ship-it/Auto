import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog, CAR_CATEGORIES, BIKE_CATEGORIES, catLabel } from "../context/CatalogContext.jsx";
import { fetchLatestReviews } from "../api.js";
import { fmtPrice, fmtCount, unitCode } from "../util.js";
import { QuickSearch } from "../components/Chrome.jsx";
import { VehicleCard, ProductImage, Rating, useReveal } from "../components/Ui.jsx";
import { IconCar, IconBike, IconBolt, IconGauge, IconShield, IconSignal, IconChevron } from "../components/Icons.jsx";

function CountUp({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
    let raf; const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / 900); setN(Math.round(to * p)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className="mono">{n}</span>;
}

export default function Home() {
  const { products, brands } = useCatalog();
  const [msTab, setMsTab] = useState("car");
  const [tcTab, setTcTab] = useState("car");
  const [heroType, setHeroType] = useState("all");
  const [stories, setStories] = useState([]);
  const ref = useReveal([products, msTab, tcTab]);

  useEffect(() => { fetchLatestReviews(3).then(setStories).catch(() => setStories([])); }, []);

  const mostSearched = useMemo(
    () => products.filter((p) => p.type === msTab).sort((a, b) => b.searches - a.searches).slice(0, 6),
    [products, msTab]);
  const costliest = useMemo(
    () => products.filter((p) => p.type === tcTab && p.price != null).sort((a, b) => b.price - a.price).slice(0, 10),
    [products, tcTab]);
  const heroCar = useMemo(() => products.filter((p) => p.type === "car").sort((a, b) => b.searches - a.searches)[0], [products]);
  const totalReviews = products.reduce((s, p) => s + (p.reviewCount || 0), 0);

  return (
    <div ref={ref}>
      {/* ============================ HERO ============================ */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="kicker">Machina systems online</div>
            <h1 className="h-display">Command your<br />next <em>machine</em></h1>
            <p className="hero-sub">
              A tactical catalog of high-performance cars and bikes — verified telemetry,
              owner signals and head-to-head duels. Zero noise. Full spec.
            </p>
            <div className="hud console">
              <div className="console-row">
                <div className="seg" role="group" aria-label="Vehicle class">
                  {["all", "car", "bike"].map((t) => (
                    <button key={t} aria-pressed={heroType === t} onClick={() => setHeroType(t)}>
                      {t === "all" ? "All" : t === "car" ? "Cars" : "Bikes"}
                    </button>
                  ))}
                </div>
                <QuickSearch typeFilter={heroType} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <Link className="chip" to="/hangar?pmax=200000">UNDER $200K</Link>
                <Link className="chip" to="/hangar?type=car&cat=ev">EV CARS</Link>
                <Link className="chip" to="/hangar?type=car&cat=suv">SUV</Link>
                <Link className="chip" to="/hangar?type=bike&cat=sports">SPORT BIKES</Link>
                <Link className="chip" to="/hangar?fuel=Electric">ALL ELECTRIC</Link>
              </div>
            </div>
            <div className="hero-readout" aria-label="Fleet telemetry">
              <div><CountUp to={products.length} /><span>Machines</span></div>
              <div><CountUp to={brands.length} /><span>Marques</span></div>
              <div><CountUp to={totalReviews} /><span>Owner signals</span></div>
            </div>
          </div>
          <div className="hero-art hud" aria-hidden="true">
            {heroCar && <ProductImage v={heroCar} eager />}
          </div>
        </div>
      </section>

      {/* ======================== MOST SEARCHED ======================= */}
      <section className="section wrap" aria-labelledby="msH">
        <div className="section-head">
          <div><div className="kicker">Live demand feed</div><h2 id="msH">Most searched</h2></div>
          <div className="seg" role="group" aria-label="Most searched class">
            <button aria-pressed={msTab === "car"} onClick={() => setMsTab("car")}>Cars</button>
            <button aria-pressed={msTab === "bike"} onClick={() => setMsTab("bike")}>Bikes</button>
          </div>
        </div>
        <div className="grid">{mostSearched.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
      </section>

      {/* ======================= ELITE GARAGE TOP 10 ================== */}
      <section className="section wrap" aria-labelledby="tcH">
        <div className="section-head">
          <div><div className="kicker">Performance index</div><h2 id="tcH">Elite garage — top 10 costliest</h2></div>
          <div className="seg" role="group" aria-label="Elite garage class">
            <button aria-pressed={tcTab === "car"} onClick={() => setTcTab("car")}>Cars</button>
            <button aria-pressed={tcTab === "bike"} onClick={() => setTcTab("bike")}>Bikes</button>
          </div>
        </div>
        <div className="rank-list">
          {costliest.map((v, i) => (
            <div key={v.id} className="hud hud-quiet rank-row reveal">
              <div className="rank-num" aria-label={`Rank ${i + 1}`}>{String(i + 1).padStart(2, "0")}</div>
              <Link to={`/vehicle/${v.id}`} className="rank-art"><ProductImage v={v} /></Link>
              <div>
                <div className="vcard-sys"><span>{v.brand} // {catLabel(v.type, v.category)}</span><span>{unitCode(v)}</span></div>
                <h3 className="vcard-name" style={{ margin: "2px 0" }}><Link to={`/vehicle/${v.id}`}>{v.model}</Link></h3>
                <div className="vstat-row"><span>PWR <b>{v.power}</b></span><span>{v.highlight}</span></div>
              </div>
              <div className="rank-price">{fmtPrice(v.price)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= CLASS SELECT ======================= */}
      <section className="section wrap" aria-labelledby="catH">
        <div className="section-head"><div><div className="kicker">Deployment class</div><h2 id="catH">Browse by category</h2></div></div>
        <h3 className="mono" style={{ fontSize: ".72rem", letterSpacing: ".26em", color: "var(--muted)", margin: "4px 0 12px" }}>CARS</h3>
        <div className="tile-grid">
          {CAR_CATEGORIES.map((c) => (
            <Link key={c.id} className="hud hud-quiet tile" to={`/hangar?type=car&cat=${c.id}`}>
              {c.id === "ev" ? <IconBolt /> : <IconCar />}
              <b>{c.label}</b>
              <span>{products.filter((p) => p.type === "car" && p.category === c.id).length} UNITS</span>
            </Link>
          ))}
        </div>
        <h3 className="mono" style={{ fontSize: ".72rem", letterSpacing: ".26em", color: "var(--muted)", margin: "20px 0 12px" }}>BIKES</h3>
        <div className="tile-grid">
          {BIKE_CATEGORIES.map((c) => (
            <Link key={c.id} className="hud hud-quiet tile" to={`/hangar?type=bike&cat=${c.id}`}>
              {c.id === "electric" ? <IconBolt /> : <IconBike />}
              <b>{c.label}</b>
              <span>{products.filter((p) => p.type === "bike" && p.category === c.id).length} UNITS</span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================== MARQUES ========================== */}
      <section className="section wrap" aria-labelledby="brH">
        <div className="section-head"><div><div className="kicker">Manufacturers</div><h2 id="brH">Marques</h2></div></div>
        <div className="tile-grid">
          {brands.map((b) => (
            <Link key={b.name} className="hud hud-quiet tile" to={`/hangar?brand=${encodeURIComponent(b.name)}`}>
              <IconSignal />
              <b>{b.name}</b>
              <span>{b.count} UNITS // {b.types.join(" + ").toUpperCase()}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================== OWNER SIGNALS ======================= */}
      <section className="section wrap" aria-labelledby="rvH">
        <div className="section-head">
          <div><div className="kicker">Driver intelligence</div><h2 id="rvH">Owner signals</h2></div>
        </div>
        <div className="grid">
          {stories.map((r, i) => (
            <article key={i} className="hud hud-quiet rev-card reveal">
              <div className="rev-head">
                <span className="avatar">{r.author[0]}</span>
                <div>
                  <b style={{ fontSize: ".92rem" }}>{r.author}</b>{" "}
                  {r.verified && <span className="chip" style={{ padding: "2px 8px", fontSize: ".56rem" }}>VERIFIED</span>}
                  <div className="rev-meta"><span>{r.productBrand} {r.productModel}</span></div>
                </div>
                <span className="rating" style={{ marginLeft: "auto" }}><Rating value={r.rating} /></span>
              </div>
              <div className="rev-body"><b>{r.title}</b><p className="muted" style={{ fontSize: ".88rem" }}>{r.content}</p></div>
              <Link className="btn btn-line btn-sm" to={`/vehicle/${r.productId}`}>Open intel <IconChevron size={12} /></Link>
            </article>
          ))}
        </div>
      </section>

      {/* ========================= TRUST STRIP ======================== */}
      <section className="section wrap" aria-labelledby="whyH">
        <div className="section-head"><div><div className="kicker">Why Motora</div><h2 id="whyH">Built for decisions</h2></div></div>
        <div className="tile-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            [IconGauge, "Spec-level truth", "Every figure structured and sourced — zero marketing fog."],
            [IconShield, "Verified owners", "Reviews carry ownership signals, not bot noise."],
            [IconBolt, "Instant everywhere", "No trackers, vector imagery, sub-second loads."],
            [IconSignal, "Computed duels", "Leaders highlighted by math, never by sponsorship."],
          ].map(([Ic, t, d]) => (
            <div key={t} className="hud hud-quiet tile reveal"><Ic /><b>{t}</b><span style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--sans)", fontSize: ".84rem" }}>{d}</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}
