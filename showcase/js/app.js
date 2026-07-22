/* ============================================================================
   MOTORA — application core (zero-dependency SPA)
   Hash-routed pages · token themes · procedural SVG vehicle art · filters ·
   compare · reviews. Everything is progressive: storage failures and missing
   data degrade gracefully.
   ============================================================================ */
import { VEHICLES, BRANDS, CAR_CATEGORIES, BIKE_CATEGORIES, CATEGORY_MAP, catLabel } from "./data.js";

/* ----------------------------- tiny utilities ----------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtPrice = (n) => {
  if (n == null) return "Price on request";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  return "$" + n.toLocaleString("en-US");
};
const fmtCount = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
const parseNum = (s) => { const m = String(s ?? "").replace(/,/g, "").match(/[\d.]+/); return m ? parseFloat(m[0]) : NaN; };
const stars = (r) => { if (!r) return "☆☆☆☆☆"; const f = Math.round(r); return "★".repeat(f) + "☆".repeat(5 - f); };

/* storage that survives disabled localStorage */
const store = (() => {
  let ok = true; const mem = {};
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); } catch { ok = false; }
  return {
    get(k, d) { try { const v = ok ? localStorage.getItem(k) : mem[k]; return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { ok ? localStorage.setItem(k, JSON.stringify(v)) : (mem[k] = JSON.stringify(v)); } catch { /* full/blocked */ } },
  };
})();

/* ------------------------------- themes ---------------------------------- */
const THEMES = [
  { id: "midnight", label: "Midnight Blue + Cream" },
  { id: "arctic",   label: "Arctic Velocity" },
  { id: "carbon",   label: "Carbon Performance" },
  { id: "sunset",   label: "Sunset Sport" },
  { id: "mech",     label: "Mech Command" },
  { id: "contrast", label: "High Contrast" },
];
function applyTheme(id) {
  if (!THEMES.some(t => t.id === id)) id = "midnight";   /* invalid stored value → default */
  document.documentElement.setAttribute("data-theme", id);
  store.set("mv_theme", id);
  const sel = $("#themeSelect"); if (sel) sel.value = id;
  const imBtn = $("#immersiveBtn"); if (imBtn) imBtn.hidden = id !== "mech";
}
function applyMotion(off) {
  document.documentElement.setAttribute("data-motion", off ? "off" : "on");
  store.set("mv_motion_off", !!off);
  const b = $("#motionBtn"); if (b) b.setAttribute("aria-pressed", String(!!off));
}
function applyImmersive(on) {
  document.documentElement.setAttribute("data-immersive", on ? "on" : "off");
  store.set("mv_immersive", !!on);
  const b = $("#immersiveBtn"); if (b) b.setAttribute("aria-pressed", String(!!on));
}

/* --------------------------- saved & compare ------------------------------ */
const savedIds = () => store.get("mv_saved", []);
const isSaved = (id) => savedIds().includes(id);
function toggleSaved(id) {
  const s = savedIds();
  const i = s.indexOf(id);
  i >= 0 ? s.splice(i, 1) : s.push(id);
  store.set("mv_saved", s);
  toast(i >= 0 ? "Removed from your garage" : "Saved to your garage ♥");
  syncSaveButtons(); renderCompareTray();
}
const compareIds = () => store.get("mv_compare", []);
function toggleCompare(id) {
  const list = compareIds();
  const v = VEHICLES.find(x => x.id === id);
  const i = list.indexOf(id);
  if (i >= 0) { list.splice(i, 1); }
  else {
    const types = list.map(x => VEHICLES.find(v2 => v2.id === x)?.type);
    if (types.length && types[0] !== v.type) {
      toast(`Cars and bikes can't be compared together — your tray holds ${types[0]}s. Clear it to compare ${v.type}s.`, true);
      return;
    }
    if (list.length >= 4) { toast("Compare holds up to 4 vehicles — remove one first.", true); return; }
    list.push(id);
  }
  store.set("mv_compare", list);
  syncCompareButtons(); renderCompareTray();
}
function syncSaveButtons() {
  $$("[data-save]").forEach(b => {
    const on = isSaved(b.dataset.save);
    b.setAttribute("aria-pressed", String(on));
    b.innerHTML = on ? "♥" : "♡";
    b.setAttribute("aria-label", (on ? "Remove from" : "Add to") + " saved");
  });
}
function syncCompareButtons() {
  $$("[data-compare]").forEach(b => {
    const on = compareIds().includes(b.dataset.compare);
    b.setAttribute("aria-pressed", String(on));
    b.textContent = on ? "✓ Comparing" : "⇄ Compare";
  });
}
function renderCompareTray() {
  const tray = $("#compareTray");
  const list = compareIds().map(id => VEHICLES.find(v => v.id === id)).filter(Boolean);
  const onComparePage = location.hash.startsWith("#/compare");
  if (!list.length || onComparePage) { tray.hidden = true; tray.innerHTML = ""; return; }
  tray.hidden = false;
  tray.innerHTML = `<div class="wrap">
      <strong>⇄ ${list.length} selected</strong>
      ${list.map(v => `<span class="chip">${esc(v.brand)} ${esc(v.model)}
        <button data-compare-remove="${v.id}" aria-label="Remove ${esc(v.model)} from compare">✕</button></span>`).join("")}
      <span style="margin-left:auto;display:flex;gap:8px">
        <a class="btn btn-primary btn-sm" href="#/compare">Compare now</a>
        <button class="btn btn-ghost btn-sm" data-compare-clear>Clear</button>
      </span></div>`;
}

/* --------------------------- procedural SVG art --------------------------- */
function vehicleArt(v, variant = 0, { label = "" } = {}) {
  if (v.noArt) {
    return `<svg viewBox="0 0 320 180" role="img" aria-label="No photo available for ${esc(v.model)}" width="320" height="180">
      <rect width="320" height="180" fill="var(--surface-2)"/>
      <text x="160" y="86" text-anchor="middle" font-size="34">📷</text>
      <text x="160" y="116" text-anchor="middle" font-size="12" fill="var(--card-muted)">Image coming soon</text></svg>`;
  }
  const h = (v.hue + variant * 26) % 360;
  const g1 = `hsl(${h} 72% 52%)`, g2 = `hsl(${(h + 45) % 360} 78% 40%)`;
  const gid = `g${v.id.replace(/[^a-z0-9]/gi, "")}${variant}`;
  const body = v.type === "car"
    ? `<path d="M28 118 C40 96 62 90 88 86 L114 64 C152 47 208 47 242 66 L272 86 C292 92 300 101 302 113 L302 126 L282 128 A26 26 0 0 0 232 130 L124 130 A26 26 0 0 0 72 132 L30 128 Z" fill="url(#${gid})"/>
       <path d="M122 66 L152 53 C182 45 210 47 231 62 L245 80 L124 82 Z" fill="rgba(240,246,255,.82)"/>
       <circle cx="98" cy="130" r="21" fill="#141a26"/><circle cx="98" cy="130" r="9" fill="#8d97a8"/>
       <circle cx="258" cy="130" r="21" fill="#141a26"/><circle cx="258" cy="130" r="9" fill="#8d97a8"/>
       <rect x="286" y="98" width="12" height="5" rx="2" fill="hsl(${h} 80% 72%)"/>`
    : `<circle cx="82" cy="122" r="34" fill="none" stroke="#141a26" stroke-width="11"/>
       <circle cx="82" cy="122" r="10" fill="#8d97a8"/>
       <circle cx="244" cy="122" r="34" fill="none" stroke="#141a26" stroke-width="11"/>
       <circle cx="244" cy="122" r="10" fill="#8d97a8"/>
       <path d="M82 122 L146 96 L196 100 L214 70 L232 62" fill="none" stroke="url(#${gid})" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M244 122 L214 70" fill="none" stroke="#3c4657" stroke-width="8" stroke-linecap="round"/>
       <path d="M124 92 L188 80 L198 100 L150 106 Z" fill="url(#${gid})"/>
       <path d="M204 63 L232 52" stroke="#3c4657" stroke-width="7" stroke-linecap="round"/>
       <path d="M96 96 L134 90" stroke="#232b3a" stroke-width="10" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 320 180" role="img" aria-label="${esc(v.brand)} ${esc(v.model)} illustration" width="320" height="180">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/></linearGradient></defs>
    <rect width="320" height="180" fill="var(--bg-2)"/>
    <path d="M0 148 H320" stroke="hsl(${h} 40% 45% / .5)" stroke-width="2"/>
    <ellipse cx="168" cy="150" rx="140" ry="8" fill="rgba(0,0,0,.28)"/>
    ${body}
    ${label ? `<text x="12" y="170" font-size="11" fill="var(--ink-muted)" opacity=".9">${esc(label)}</text>` : ""}
  </svg>`;
}

/* ------------------------------ vehicle card ------------------------------ */
function vehicleCard(v, { lazy = true } = {}) {
  return `<article class="card reveal">
    <div class="v-art">
      ${lazy ? `<div data-lazy-art="${v.id}" style="width:100%;height:100%"></div>` : vehicleArt(v)}
      <div class="art-tags">${(v.tags || []).slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <button class="icon-btn fav" data-save="${v.id}" aria-pressed="false" aria-label="Add to saved">♡</button>
    </div>
    <div class="v-body">
      <span class="v-brand">${esc(v.brand)} · ${esc(catLabel(v.type, v.category))}</span>
      <h3 class="v-name"><a href="#/vehicle/${v.id}">${esc(v.model)}</a></h3>
      <div class="v-meta">
        <span class="rating-badge">★ ${v.rating ? v.rating.toFixed(1) : "New"}</span>
        <span>${fmtCount(v.reviews?.length || 0)} reviews</span>
        <span>${esc(v.fuel)}</span><span>${esc(v.power)}</span>
        ${v.transmission ? `<span>${esc(v.transmission)}</span>` : ""}
      </div>
      <div class="v-price">${fmtPrice(v.price)} ${v.price != null ? "<small>starting</small>" : ""}</div>
      <p class="muted" style="margin:0;font-size:.85rem">${esc(v.highlight)}</p>
      ${v.availability !== "New" ? `<span class="tag gold">${esc(v.availability)}</span>` : ""}
      <div class="v-actions">
        <a class="btn btn-primary btn-sm" href="#/vehicle/${v.id}">View details</a>
        <button class="btn btn-ghost btn-sm" data-compare="${v.id}" aria-pressed="false">⇄ Compare</button>
      </div>
    </div></article>`;
}

/* lazily inject SVG art when card scrolls into view (below-the-fold budget) */
let artObserver = null;
function activateLazyArt(root = document) {
  const slots = $$("[data-lazy-art]", root);
  const inject = (el) => { const v = VEHICLES.find(x => x.id === el.dataset.lazyArt); if (v) el.outerHTML = vehicleArt(v); };
  if (!("IntersectionObserver" in window)) { document.body.classList.add("no-io"); slots.forEach(inject); return; }
  artObserver?.disconnect();
  artObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { artObserver.unobserve(e.target); inject(e.target); } });
  }, { rootMargin: "300px" });
  slots.forEach(el => artObserver.observe(el));
}
let revealObserver = null;
function activateReveal(root = document) {
  const items = $$(".reveal", root);
  if (!("IntersectionObserver" in window)) { document.body.classList.add("no-io"); return; }
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); } });
  }, { threshold: .06 });
  items.forEach(el => revealObserver.observe(el));
}

/* ------------------------------- routing ---------------------------------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "") || "home";
  const [pathPart, queryPart] = raw.split("?");
  const segs = pathPart.split("/").filter(Boolean);
  return { page: segs[0] || "home", arg: segs[1] || null, q: new URLSearchParams(queryPart || "") };
}
function nav(page, params) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  location.hash = `#/${page}${qs}`;
}

const outlet = () => $("#app");
function skeletons(n = 6) {
  return `<div class="wrap section"><div class="v-grid">${Array.from({ length: n }, () => `<div class="skeleton" aria-hidden="true"></div>`).join("")}</div></div>`;
}

let renderToken = 0;
function route() {
  const { page, arg, q } = parseHash();
  $$(".main-nav a").forEach(a => {
    const target = a.getAttribute("href").replace(/^#\//, "").split("?")[0];
    a.toggleAttribute("aria-current", false);
    if (target === page || (page === "vehicle" && target === "listings")) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $(".main-nav")?.classList.remove("open");
  $("#navToggle")?.setAttribute("aria-expanded", "false");

  const token = ++renderToken;
  outlet().innerHTML = skeletons(page === "vehicle" ? 3 : 6);
  /* tiny simulated latency so skeleton states are demonstrable; instant enough to feel dynamic */
  setTimeout(() => {
    if (token !== renderToken) return;
    try {
      switch (page) {
        case "home":     renderHome(); break;
        case "listings": renderListings(q); break;
        case "vehicle":  renderVehicle(arg); break;
        case "compare":  renderCompare(); break;
        case "saved":    renderSaved(); break;
        case "reviews":  renderReviewsHub(); break;
        default:         renderNotFound();
      }
    } catch (err) {
      console.error(err);
      outlet().innerHTML = `<div class="wrap"><div class="empty-state panel" style="margin:40px auto;max-width:560px">
        <div class="glyph">⚠️</div><h2>Something went off-track</h2>
        <p class="muted">We hit a snag rendering this page. Try heading back home.</p>
        <a class="btn btn-primary" href="#/home">Back to home</a></div></div>`;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    syncSaveButtons(); syncCompareButtons(); renderCompareTray();
    activateLazyArt(); activateReveal();
  }, 160);
}

/* ------------------------------- HOME ------------------------------------- */
function topSearched(type, n = 6) { return VEHICLES.filter(v => v.type === type).sort((a, b) => b.searches - a.searches).slice(0, n); }
function topCostliest(type, n = 10) { return VEHICLES.filter(v => v.type === type && v.price != null).sort((a, b) => b.price - a.price).slice(0, n); }

function renderHome() {
  const totalReviews = VEHICLES.reduce((s, v) => s + (v.reviews?.length || 0), 0);
  const latestReviews = VEHICLES.flatMap(v => (v.reviews || []).map(r => ({ ...r, vehicle: v }))).sort((a, b) => b.helpful - a.helpful).slice(0, 3);

  outlet().innerHTML = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="tag" style="margin-bottom:12px">Precision in every specification</span>
        <h1>Find your next <em style="color:var(--accent);font-style:normal">machine</em>.</h1>
        <p class="lede">Cars and bikes, intelligently curated — real specifications, honest owner reviews, and comparisons you can trust. Built for the road ahead.</p>
        <div class="search-console" role="search">
          <div class="search-row">
            <div class="seg" role="group" aria-label="Vehicle type">
              <button data-hero-type="all" aria-pressed="true">All</button>
              <button data-hero-type="car" aria-pressed="false">Cars</button>
              <button data-hero-type="bike" aria-pressed="false">Bikes</button>
            </div>
            <input id="heroSearch" class="search-input" type="search" role="combobox" aria-expanded="false"
              aria-autocomplete="list" aria-controls="heroSuggest" aria-label="Search cars and bikes"
              placeholder="Search a brand, model or category…">
            <button class="btn btn-primary" id="heroGo">Search</button>
          </div>
          <ul id="heroSuggest" class="suggestions" role="listbox" hidden></ul>
          <div class="quick-links" aria-label="Quick searches">
            <a class="chip" href="#/listings?pmax=200000">💰 Under $200k</a>
            <a class="chip" href="#/listings?type=car&cat=ev">⚡ Electric cars</a>
            <a class="chip" href="#/listings?type=car&cat=suv">🚙 SUVs</a>
            <a class="chip" href="#/listings?type=bike&cat=sports">🏍️ Sport bikes</a>
            <a class="chip" href="#/listings?fuel=Electric">🔌 All EVs</a>
          </div>
        </div>
        <div class="hero-stats" aria-label="Platform stats">
          <div><b data-countup="${VEHICLES.length}">0</b><span>machines listed</span></div>
          <div><b data-countup="${BRANDS.length}">0</b><span>brands</span></div>
          <div><b data-countup="${totalReviews}">0</b><span>owner reviews</span></div>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        ${vehicleArt(VEHICLES.find(v => v.id === "stratos-veloce-rs"), 0)}
        <div style="max-width:70%;margin:-20px 0 0 auto">${vehicleArt(VEHICLES.find(v => v.id === "ryujin-katana-rr"), 1)}</div>
      </div>
    </div>
  </section>

  <section class="section wrap" aria-labelledby="msHead">
    <div class="section-head">
      <div><span class="kicker">Trending now</span><h2 id="msHead">Most searched</h2></div>
      <div class="seg" role="group" aria-label="Most searched vehicle type">
        <button data-ms-tab="car" aria-pressed="true">Cars</button>
        <button data-ms-tab="bike" aria-pressed="false">Bikes</button>
      </div>
    </div>
    <div id="msGrid" class="v-grid"></div>
  </section>

  <section class="section wrap" aria-labelledby="tcHead">
    <div class="section-head">
      <div><span class="kicker">Elite Garage · Performance Index</span><h2 id="tcHead">Top 10 costliest</h2></div>
      <div class="seg" role="group" aria-label="Costliest vehicle type">
        <button data-tc-tab="car" aria-pressed="true">Cars</button>
        <button data-tc-tab="bike" aria-pressed="false">Bikes</button>
      </div>
    </div>
    <div id="tcList" class="rank-list"></div>
  </section>

  <section class="section wrap" aria-labelledby="catHead">
    <div class="section-head"><div><span class="kicker">Browse</span><h2 id="catHead">Browse by category</h2></div></div>
    <h3 style="font-size:1rem;margin:6px 0 10px">Cars</h3>
    <div class="cat-grid">${CAR_CATEGORIES.map(c => `
      <a class="card cat-card" href="#/listings?type=car&cat=${c.id}"><span class="ico" aria-hidden="true">${c.ico}</span>
      <b>${c.label}</b><span>${VEHICLES.filter(v => v.type === "car" && v.category === c.id).length} models</span></a>`).join("")}
    </div>
    <h3 style="font-size:1rem;margin:18px 0 10px">Bikes</h3>
    <div class="cat-grid">${BIKE_CATEGORIES.map(c => `
      <a class="card cat-card" href="#/listings?type=bike&cat=${c.id}"><span class="ico" aria-hidden="true">${c.ico}</span>
      <b>${c.label}</b><span>${VEHICLES.filter(v => v.type === "bike" && v.category === c.id).length} models</span></a>`).join("")}
    </div>
  </section>

  <section class="section wrap" aria-labelledby="brHead">
    <div class="section-head"><div><span class="kicker">Marques</span><h2 id="brHead">Popular brands</h2></div></div>
    <div class="cat-grid">${BRANDS.map(b => `
      <a class="card cat-card" href="#/listings?brand=${encodeURIComponent(b.name)}">
        <b>${esc(b.name)}</b><span>${b.count} model${b.count > 1 ? "s" : ""} · ${b.types.join(" & ")}s</span></a>`).join("")}
    </div>
  </section>

  <section class="section wrap" aria-labelledby="rvHead">
    <div class="section-head">
      <div><span class="kicker">Driver Intelligence</span><h2 id="rvHead">Latest owner stories</h2></div>
      <a class="btn btn-ghost btn-sm" href="#/reviews">All reviews →</a>
    </div>
    <div class="v-grid">${latestReviews.map(r => `
      <article class="card review-card reveal">
        <div class="review-head">
          <span class="avatar" aria-hidden="true">${esc(r.author[0])}</span>
          <div><b>${esc(r.author)}</b> ${r.verified ? `<span class="tag" style="font-size:.6rem">Verified owner</span>` : ""}
            <div class="muted" style="font-size:.78rem">${esc(r.vehicle.brand)} ${esc(r.vehicle.model)}</div></div>
          <span class="rating-badge" style="margin-left:auto">★ ${r.rating}</span>
        </div>
        <div class="review-body"><b>${esc(r.title)}</b><p class="muted" style="font-size:.9rem">${esc(r.content)}</p></div>
        <a href="#/vehicle/${r.vehicle.id}" class="btn btn-ghost btn-sm">Read on ${esc(r.vehicle.model)} →</a>
      </article>`).join("")}
    </div>
  </section>

  <section class="section wrap" aria-labelledby="whyHead">
    <div class="section-head"><div><span class="kicker">Why MOTORA</span><h2 id="whyHead">Decisions, made easy</h2></div></div>
    <div class="trust-grid">
      ${[["🔬", "Spec-level truth", "Every figure sourced and structured — no marketing fog."],
         ["🛡️", "Verified owners", "Reviews carry ownership signals, not bot noise."],
         ["⇄", "Honest comparisons", "Side-by-side specs with leaders highlighted, never sponsored."],
         ["⚡", "Fast everywhere", "No heavy images, no trackers — instant on any connection."]]
        .map(([i, t, d]) => `<div class="card cat-card reveal"><span class="ico" aria-hidden="true">${i}</span><b>${t}</b><span>${d}</span></div>`).join("")}
    </div>
  </section>

  <section class="section wrap">
    <div class="card newsletter reveal">
      <div><h2 style="margin:0">Price-drop alerts</h2><p class="muted" style="margin:4px 0 0">One email when a machine on your list moves. No spam, ever.</p></div>
      <form id="newsForm"><label class="sr-only" for="newsEmail" style="position:absolute;left:-9999px">Email</label>
        <input id="newsEmail" type="email" required placeholder="you@example.com" aria-label="Email address">
        <button class="btn btn-primary" type="submit">Notify me</button></form>
    </div>
  </section>`;

  const renderMs = (t) => { $("#msGrid").innerHTML = topSearched(t).map(v => vehicleCard(v)).join(""); afterSwap("#msGrid"); };
  const renderTc = (t) => {
    $("#tcList").innerHTML = topCostliest(t).map((v, i) => `
      <div class="card rank-item reveal in">
        <div class="rank-num" aria-label="Rank ${i + 1}">${String(i + 1).padStart(2, "0")}</div>
        <div class="rank-art">${vehicleArt(v)}</div>
        <div class="rank-info">
          <span class="v-brand">${esc(v.brand)} · ${esc(catLabel(v.type, v.category))}</span>
          <h3 class="v-name"><a href="#/vehicle/${v.id}">${esc(v.model)}</a></h3>
          <div class="v-meta"><span>${esc(v.power)}</span><span>${esc(v.highlight)}</span></div>
        </div>
        <div class="rank-price">${fmtPrice(v.price)}</div>
      </div>`).join("");
    afterSwap("#tcList");
  };
  renderMs("car"); renderTc("car");
  $$("[data-ms-tab]").forEach(b => b.addEventListener("click", () => {
    $$("[data-ms-tab]").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true"); renderMs(b.dataset.msTab);
  }));
  $$("[data-tc-tab]").forEach(b => b.addEventListener("click", () => {
    $$("[data-tc-tab]").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true"); renderTc(b.dataset.tcTab);
  }));

  /* hero search */
  let heroType = "all";
  $$("[data-hero-type]").forEach(b => b.addEventListener("click", () => {
    $$("[data-hero-type]").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true"); heroType = b.dataset.heroType;
    updateSuggest($("#heroSearch").value);
  }));
  attachSuggest($("#heroSearch"), $("#heroSuggest"), () => heroType);
  $("#heroGo").addEventListener("click", () => {
    const params = { q: $("#heroSearch").value.trim() };
    if (heroType !== "all") params.type = heroType;
    nav("listings", params);
  });
  $("#heroSearch").addEventListener("keydown", (e) => { if (e.key === "Enter" && !$("#heroSuggest").querySelector('[aria-selected="true"]')) $("#heroGo").click(); });

  $("#newsForm").addEventListener("submit", (e) => { e.preventDefault(); toast("You're on the list — alerts armed 🔔"); e.target.reset(); });

  /* count-up stats */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
  $$("[data-countup]").forEach(el => {
    const target = +el.dataset.countup;
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(target * p); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  function afterSwap(sel) { syncSaveButtons(); syncCompareButtons(); activateLazyArt($(sel)); activateReveal($(sel)); }
}

/* ------------------------- search suggestions ----------------------------- */
function searchIndex() {
  return VEHICLES.map(v => ({ id: v.id, label: `${v.brand} ${v.model}`, sub: `${v.type === "car" ? "Car" : "Bike"} · ${catLabel(v.type, v.category)}`, type: v.type, hay: `${v.brand} ${v.model} ${v.category} ${catLabel(v.type, v.category)} ${v.fuel}`.toLowerCase() }));
}
let suggestState = { items: [], sel: -1 };
function attachSuggest(input, listEl, typeFn) {
  input.addEventListener("input", () => updateSuggest(input.value));
  input.addEventListener("focus", () => updateSuggest(input.value));
  input.addEventListener("keydown", (e) => {
    if (listEl.hidden) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      suggestState.sel = (suggestState.sel + dir + suggestState.items.length) % suggestState.items.length;
      paintSuggest(listEl);
    } else if (e.key === "Enter" && suggestState.sel >= 0) {
      e.preventDefault(); nav("vehicle/" + suggestState.items[suggestState.sel].id);
      listEl.hidden = true;
    } else if (e.key === "Escape") { listEl.hidden = true; input.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("click", (e) => { if (!listEl.contains(e.target) && e.target !== input) { listEl.hidden = true; input.setAttribute("aria-expanded", "false"); } });

  window.updateSuggest = function updateSuggest(q) {
    const type = typeFn();
    const query = (q || "").trim().toLowerCase();
    let pool = searchIndex().filter(i => type === "all" || i.type === type);
    let matches;
    if (!query) {
      matches = pool.slice(0, 5);
      listEl.innerHTML = `<li role="presentation" style="padding:6px 12px" class="muted">Popular right now</li>` + matches.map((m, i) => liFor(m, i)).join("");
    } else {
      matches = pool.filter(i => i.hay.includes(query)).slice(0, 7);
      listEl.innerHTML = matches.length
        ? matches.map((m, i) => liFor(m, i)).join("")
        : `<li role="presentation" style="padding:10px 12px" class="muted">No matches for “${esc(q)}”. Try a brand like <b>Ryujin</b> or a category like <b>SUV</b>.</li>`;
    }
    suggestState = { items: matches, sel: -1 };
    listEl.hidden = false;
    input.setAttribute("aria-expanded", "true");
    $$("button[data-suggest]", listEl).forEach(b => b.addEventListener("click", () => { nav("vehicle/" + b.dataset.suggest); listEl.hidden = true; }));
    function liFor(m, i) {
      return `<li role="option" id="sg-${i}" aria-selected="false"><button data-suggest="${m.id}"><span>${esc(m.label)}</span><span class="muted">${esc(m.sub)}</span></button></li>`;
    }
  };
}
function paintSuggest(listEl) {
  $$('li[role="option"]', listEl).forEach((li, i) => li.setAttribute("aria-selected", String(i === suggestState.sel)));
}

/* ------------------------------ LISTINGS ---------------------------------- */
const SORTS = {
  popular: { label: "Popularity", fn: (a, b) => b.searches - a.searches },
  "price-asc": { label: "Price: low to high", fn: (a, b) => (a.price ?? 1e12) - (b.price ?? 1e12) },
  "price-desc": { label: "Price: high to low", fn: (a, b) => (b.price ?? -1) - (a.price ?? -1) },
  rating: { label: "Rating", fn: (a, b) => b.rating - a.rating },
  newest: { label: "Newest", fn: (a, b) => (b.availability === "Upcoming") - (a.availability === "Upcoming") },
};

function readFilters(q) {
  return {
    type: q.get("type") || "all",
    q: q.get("q") || "",
    cat: q.getAll("cat"),
    brand: q.getAll("brand"),
    fuel: q.getAll("fuel"),
    avail: q.getAll("avail"),
    pmin: q.get("pmin") || "", pmax: q.get("pmax") || "",
    rating: q.get("rating") || "",
    seats: q.get("seats") || "", drive: q.get("drive") || "", adas: q.get("adas") === "1",
    abs: q.get("abs") === "1", cooling: q.get("cooling") || "",
    sort: q.get("sort") || "popular",
    view: q.get("view") || "grid",
  };
}
function filtersToParams(f) {
  const p = new URLSearchParams();
  if (f.type !== "all") p.set("type", f.type);
  if (f.q) p.set("q", f.q);
  f.cat.forEach(c => p.append("cat", c));
  f.brand.forEach(b => p.append("brand", b));
  f.fuel.forEach(x => p.append("fuel", x));
  f.avail.forEach(x => p.append("avail", x));
  if (f.pmin) p.set("pmin", f.pmin);
  if (f.pmax) p.set("pmax", f.pmax);
  if (f.rating) p.set("rating", f.rating);
  if (f.seats) p.set("seats", f.seats);
  if (f.drive) p.set("drive", f.drive);
  if (f.adas) p.set("adas", "1");
  if (f.abs) p.set("abs", "1");
  if (f.cooling) p.set("cooling", f.cooling);
  if (f.sort !== "popular") p.set("sort", f.sort);
  if (f.view !== "grid") p.set("view", f.view);
  return p;
}
function applyFilters(f) {
  let priceError = "";
  let list = VEHICLES.filter(v => f.type === "all" || v.type === f.type);
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(v => `${v.brand} ${v.model} ${v.category}`.toLowerCase().includes(q)); }
  if (f.cat.length) list = list.filter(v => f.cat.includes(v.category));
  if (f.brand.length) list = list.filter(v => f.brand.includes(v.brand));
  if (f.fuel.length) list = list.filter(v => f.fuel.includes(v.fuel));
  if (f.avail.length) list = list.filter(v => f.avail.includes(v.availability));
  const mn = parseFloat(f.pmin), mx = parseFloat(f.pmax);
  if (!isNaN(mn) && !isNaN(mx) && mn > mx) priceError = "Min price is greater than max — showing unfiltered prices.";
  else {
    if (!isNaN(mn)) list = list.filter(v => v.price != null && v.price >= mn);
    if (!isNaN(mx)) list = list.filter(v => v.price != null && v.price <= mx);
  }
  if (f.rating) list = list.filter(v => v.rating >= parseFloat(f.rating));
  if (f.seats) list = list.filter(v => v.type !== "car" || (v.seating ?? 0) >= parseInt(f.seats, 10));
  if (f.drive) list = list.filter(v => v.type !== "car" || v.drivetrain === f.drive);
  if (f.adas) list = list.filter(v => v.type !== "car" || v.adas);
  if (f.abs) list = list.filter(v => v.type !== "bike" || /dual|cornering/i.test(v.abs || ""));
  if (f.cooling) list = list.filter(v => v.type !== "bike" || (v.cooling || "").includes(f.cooling));
  list = [...list].sort((SORTS[f.sort] || SORTS.popular).fn);
  return { list, priceError };
}

function filterFormHTML(f) {
  const pool = VEHICLES.filter(v => f.type === "all" || v.type === f.type);
  const brands = [...new Set(pool.map(v => v.brand))].sort();
  const fuels = [...new Set(pool.map(v => v.fuel))].sort();
  const cats = f.type === "car" ? CAR_CATEGORIES : f.type === "bike" ? BIKE_CATEGORIES : [];
  const check = (name, val, list) => `<label class="filter-opt"><input type="checkbox" name="${name}" value="${esc(val)}" ${list.includes(val) ? "checked" : ""}> ${esc(val)}</label>`;
  return `
    <fieldset class="filter-group" style="border-top:0;margin-top:0;padding-top:0">
      <legend>Price range ($)</legend>
      <div class="range-row">
        <input type="number" name="pmin" min="0" inputmode="numeric" placeholder="Min" value="${esc(f.pmin)}" aria-label="Minimum price">
        <span aria-hidden="true">–</span>
        <input type="number" name="pmax" min="0" inputmode="numeric" placeholder="Max" value="${esc(f.pmax)}" aria-label="Maximum price">
      </div>
    </fieldset>
    ${cats.length ? `<fieldset class="filter-group"><legend>${f.type === "car" ? "Body type" : "Category"}</legend>
      ${cats.map(c => `<label class="filter-opt"><input type="checkbox" name="cat" value="${c.id}" ${f.cat.includes(c.id) ? "checked" : ""}> ${c.label}</label>`).join("")}</fieldset>` : ""}
    <fieldset class="filter-group"><legend>Brand</legend>${brands.map(b => check("brand", b, f.brand)).join("")}</fieldset>
    <fieldset class="filter-group"><legend>Fuel / power</legend>${fuels.map(x => check("fuel", x, f.fuel)).join("")}</fieldset>
    <fieldset class="filter-group"><legend>Minimum rating</legend>
      <select class="select" name="rating" aria-label="Minimum rating" style="width:100%">
        <option value="">Any rating</option>
        ${[4.5, 4, 3.5, 3].map(r => `<option value="${r}" ${f.rating == r ? "selected" : ""}>★ ${r}+</option>`).join("")}
      </select></fieldset>
    <fieldset class="filter-group"><legend>Availability</legend>
      ${["New", "Upcoming", "Discontinued"].map(a => check("avail", a, f.avail)).join("")}</fieldset>
    ${f.type === "car" ? `
      <fieldset class="filter-group"><legend>Car specifics</legend>
        <label class="filter-opt">Seats ≥ <select class="select" name="seats"><option value="">Any</option>
          ${[2, 4, 5, 7].map(s => `<option ${f.seats == s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
        <label class="filter-opt">Drivetrain <select class="select" name="drive"><option value="">Any</option>
          ${["FWD", "RWD", "AWD", "4WD"].map(d => `<option ${f.drive === d ? "selected" : ""}>${d}</option>`).join("")}</select></label>
        <label class="filter-opt"><input type="checkbox" name="adas" value="1" ${f.adas ? "checked" : ""}> ADAS equipped</label>
      </fieldset>` : ""}
    ${f.type === "bike" ? `
      <fieldset class="filter-group"><legend>Bike specifics</legend>
        <label class="filter-opt"><input type="checkbox" name="abs" value="1" ${f.abs ? "checked" : ""}> Dual-channel / cornering ABS</label>
        <label class="filter-opt">Cooling <select class="select" name="cooling"><option value="">Any</option>
          ${["Liquid", "Air"].map(c => `<option ${f.cooling === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
      </fieldset>` : ""}
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-primary" type="submit" style="flex:1">Apply</button>
      <button class="btn btn-ghost" type="button" data-reset-filters>Reset all</button>
    </div>`;
}

function activeChips(f) {
  const chips = [];
  const chip = (label, mutate) => chips.push({ label, mutate });
  f.cat.forEach(c => chip(catLabel(f.type === "bike" ? "bike" : "car", c), (x) => x.cat = x.cat.filter(v => v !== c)));
  f.brand.forEach(b => chip(b, (x) => x.brand = x.brand.filter(v => v !== b)));
  f.fuel.forEach(v0 => chip(v0, (x) => x.fuel = x.fuel.filter(v => v !== v0)));
  f.avail.forEach(v0 => chip(v0, (x) => x.avail = x.avail.filter(v => v !== v0)));
  if (f.q) chip(`“${f.q}”`, (x) => x.q = "");
  if (f.pmin) chip(`Min ${fmtPrice(+f.pmin)}`, (x) => x.pmin = "");
  if (f.pmax) chip(`Max ${fmtPrice(+f.pmax)}`, (x) => x.pmax = "");
  if (f.rating) chip(`★ ${f.rating}+`, (x) => x.rating = "");
  if (f.seats) chip(`Seats ≥ ${f.seats}`, (x) => x.seats = "");
  if (f.drive) chip(f.drive, (x) => x.drive = "");
  if (f.adas) chip("ADAS", (x) => x.adas = false);
  if (f.abs) chip("ABS", (x) => x.abs = false);
  if (f.cooling) chip(`${f.cooling}-cooled`, (x) => x.cooling = "");
  return chips;
}

function renderListings(q) {
  const f = readFilters(q);
  const { list, priceError } = applyFilters(f);
  const chips = activeChips(f);

  outlet().innerHTML = `
  <div class="wrap">
    <div class="listings">
      <aside class="filters-panel panel" aria-label="Filters">
        <h2 style="font-size:1.05rem;display:flex;justify-content:space-between;align-items:center">Filters
          ${chips.length ? `<span class="tag">${chips.length} active</span>` : ""}</h2>
        <form id="filterForm">${filterFormHTML(f)}</form>
      </aside>
      <div>
        <div class="toolbar">
          <div class="seg" role="group" aria-label="Vehicle type">
            ${["all", "car", "bike"].map(t => `<button data-type-tab="${t}" aria-pressed="${f.type === t}">${t === "all" ? "All" : t === "car" ? "Cars" : "Bikes"}</button>`).join("")}
          </div>
          <span class="results-count grow" aria-live="polite">${list.length} machine${list.length === 1 ? "" : "s"} found</span>
          <button class="btn btn-ghost btn-sm filters-fab" data-open-drawer aria-haspopup="dialog">☰ Filters ${chips.length ? `(${chips.length})` : ""}</button>
          <label class="muted" style="font-size:.85rem">Sort
            <select class="select" id="sortSel" aria-label="Sort results">
              ${Object.entries(SORTS).map(([k, s]) => `<option value="${k}" ${f.sort === k ? "selected" : ""}>${s.label}</option>`).join("")}
            </select></label>
          <div class="seg" role="group" aria-label="Layout">
            <button data-view="grid" aria-pressed="${f.view === "grid"}" aria-label="Grid view">▦</button>
            <button data-view="list" aria-pressed="${f.view === "list"}" aria-label="List view">☰</button>
          </div>
        </div>
        ${priceError ? `<p class="field-error" role="alert">${priceError}</p>` : ""}
        ${chips.length ? `<div class="active-chips" aria-label="Active filters">
          ${chips.map((c, i) => `<span class="chip">${esc(c.label)} <button data-chip="${i}" aria-label="Remove filter ${esc(c.label)}">✕</button></span>`).join("")}
          <button class="btn btn-ghost btn-sm" data-reset-filters>Reset all</button></div>` : ""}
        ${list.length ? `<div class="v-grid cols-4 ${f.view === "list" ? "list-view" : ""}">${list.map(v => vehicleCard(v)).join("")}</div>`
          : `<div class="empty-state panel"><div class="glyph">🔍</div><h2>No machines match</h2>
             <p class="muted">Try widening the price range, clearing a category, or switching vehicle type.</p>
             <button class="btn btn-primary" data-reset-filters>Reset all filters</button></div>`}
      </div>
    </div>
  </div>`;

  const pushFilters = (mut) => { const nf = { ...f, cat: [...f.cat], brand: [...f.brand], fuel: [...f.fuel], avail: [...f.avail] }; mut(nf); nav("listings", filtersToParams(nf)); };

  $$("[data-type-tab]").forEach(b => b.addEventListener("click", () =>
    pushFilters(x => { x.type = b.dataset.typeTab; x.cat = []; x.seats = ""; x.drive = ""; x.adas = false; x.abs = false; x.cooling = ""; })));
  $("#sortSel").addEventListener("change", (e) => pushFilters(x => x.sort = e.target.value));
  $$("[data-view]").forEach(b => b.addEventListener("click", () => pushFilters(x => x.view = b.dataset.view)));
  $$("[data-chip]").forEach(b => b.addEventListener("click", () => pushFilters(x => chips[+b.dataset.chip].mutate(x))));
  $$("[data-reset-filters]").forEach(b => b.addEventListener("click", () => nav("listings", f.type !== "all" ? { type: f.type } : {})));

  const readForm = (form) => {
    const data = new FormData(form);
    return {
      ...f,
      pmin: data.get("pmin") || "", pmax: data.get("pmax") || "",
      cat: data.getAll("cat"), brand: data.getAll("brand"), fuel: data.getAll("fuel"), avail: data.getAll("avail"),
      rating: data.get("rating") || "", seats: data.get("seats") || "", drive: data.get("drive") || "",
      adas: data.get("adas") === "1", abs: data.get("abs") === "1", cooling: data.get("cooling") || "",
    };
  };
  $("#filterForm").addEventListener("submit", (e) => { e.preventDefault(); nav("listings", filtersToParams(readForm(e.target))); });
  $("#filterForm").addEventListener("change", (e) => { if (e.target.type === "checkbox" || e.target.tagName === "SELECT") nav("listings", filtersToParams(readForm(e.target.form))); });

  $$("[data-open-drawer]").forEach(b => b.addEventListener("click", () => openFilterDrawer(f)));
}

/* mobile filter drawer with focus management */
let lastFocused = null;
function openFilterDrawer(f) {
  lastFocused = document.activeElement;
  const d = document.createElement("div");
  d.className = "drawer"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Filters");
  d.innerHTML = `<div class="drawer-head"><h2 style="margin:0">Filters</h2>
      <button class="icon-btn" data-close-drawer aria-label="Close filters">✕</button></div>
    <form id="drawerForm">${filterFormHTML(f)}</form>`;
  document.body.appendChild(d);
  document.body.style.overflow = "hidden";
  const close = () => { d.remove(); document.body.style.overflow = ""; lastFocused?.focus(); };
  $("[data-close-drawer]", d).addEventListener("click", close);
  d.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Tab") { /* simple focus trap */
      const focusables = $$("button, input, select, a[href]", d).filter(el => !el.disabled);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $("#drawerForm", d).addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const nf = { ...f, pmin: data.get("pmin") || "", pmax: data.get("pmax") || "", cat: data.getAll("cat"), brand: data.getAll("brand"), fuel: data.getAll("fuel"), avail: data.getAll("avail"), rating: data.get("rating") || "", seats: data.get("seats") || "", drive: data.get("drive") || "", adas: data.get("adas") === "1", abs: data.get("abs") === "1", cooling: data.get("cooling") || "" };
    close(); nav("listings", filtersToParams(nf));
  });
  $("[data-reset-filters]", d)?.addEventListener("click", () => { close(); nav("listings", f.type !== "all" ? { type: f.type } : {}); });
  $("[data-close-drawer]", d).focus();
}

/* ------------------------------- DETAIL ----------------------------------- */
const SPEC_TIPS = { "Torque": "Rotational force — how hard the vehicle pulls.", "ADAS": "Advanced Driver Assistance Systems: adaptive cruise, lane keeping, AEB.", "ABS": "Anti-lock Braking System — prevents wheel lock under hard braking.", "Kerb weight": "Weight of the vehicle with all fluids, ready to ride/drive." };
function specCell(k) { return SPEC_TIPS[k] ? `<abbr title="${esc(SPEC_TIPS[k])}">${esc(k)}</abbr>` : esc(k); }

function renderVehicle(id) {
  const v = VEHICLES.find(x => x.id === id);
  if (!v) { renderNotFound(); return; }
  const galleryLabels = ["Front quarter", "Side profile", "Rear quarter", "Detail"];
  const similar = VEHICLES.filter(x => x.type === v.type && x.id !== v.id && (x.category === v.category || Math.abs((x.price ?? 0) - (v.price ?? 0)) < (v.price ?? 1) * .4)).slice(0, 3);
  const reviews = v.reviews || [];
  const dist = [5, 4, 3, 2, 1].map(s => reviews.filter(r => Math.round(r.rating) === s).length);
  const comments = store.get("mv_comments_" + v.id, []);

  outlet().innerHTML = `
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="#/home">Home</a> / <a href="#/listings?type=${v.type}">${v.type === "car" ? "Cars" : "Bikes"}</a> /
      <a href="#/listings?type=${v.type}&cat=${v.category}">${esc(catLabel(v.type, v.category))}</a> /
      <span aria-current="page">${esc(v.model)}</span>
    </nav>

    <div class="detail-top">
      <div>
        <div class="gallery-main" id="galleryMain" tabindex="0" role="group" aria-roledescription="image gallery"
             aria-label="${esc(v.model)} gallery — use left and right arrow keys">${vehicleArt(v, 0, { label: galleryLabels[0] })}</div>
        <div class="gallery-thumbs" role="tablist" aria-label="Gallery angles">
          ${galleryLabels.map((l, i) => `<button role="tab" data-gal="${i}" aria-current="${i === 0}" aria-label="${l}">${vehicleArt(v, i)}</button>`).join("")}
        </div>
      </div>
      <div>
        <span class="v-brand" style="color:var(--ink-muted)">${esc(v.brand)} · ${esc(catLabel(v.type, v.category))} ${v.availability !== "New" ? `· <span class="tag gold">${esc(v.availability)}</span>` : ""}</span>
        <h1 style="font-size:clamp(1.5rem,4vw,2.3rem);overflow-wrap:anywhere">${esc(v.model)}</h1>
        <div class="v-meta" style="color:var(--ink-muted)">
          <span class="rating-badge">★ ${v.rating ? v.rating.toFixed(1) : "Not yet rated"}</span>
          <span>${reviews.length} review${reviews.length === 1 ? "" : "s"}</span>
          <span>${fmtCount(v.searches)} searches</span>
        </div>
        <p class="v-price" id="priceLine" style="font-size:1.7rem;margin:10px 0 2px;color:var(--ink)">${fmtPrice(v.price)}</p>
        <p class="muted" style="margin:0 0 12px">${v.price != null ? "Starting price, ex-showroom" : "Contact us for availability"}</p>

        ${v.variants.length > 1 ? `<div class="variant-row" role="group" aria-label="Variants">
          <div class="seg">${v.variants.map((vr, i) => `<button data-variant="${i}" aria-pressed="${i === 0}">${esc(vr.name)}</button>`).join("")}</div></div>` : ""}

        <div class="highlights" id="hlRow">
          <div class="card hl"><b id="hlPower">${esc(v.power)}</b><span>Power</span></div>
          <div class="card hl"><b>${esc(v.torque)}</b><span>Torque</span></div>
          <div class="card hl"><b id="hlMileage">${esc(v.mileage)}</b><span>${v.fuel === "Electric" ? "Range" : "Mileage"}</span></div>
          <div class="card hl"><b>${esc(v.transmission)}</b><span>Transmission</span></div>
          ${v.type === "car" ? `<div class="card hl"><b>${v.seating} seats</b><span>Seating</span></div>` : `<div class="card hl"><b>${esc(v.kerb)}</b><span>Kerb weight</span></div>`}
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" data-quote>Get best price</button>
          <button class="btn btn-ghost" data-compare="${v.id}" aria-pressed="false">⇄ Compare</button>
          <button class="btn btn-ghost" data-save="${v.id}" aria-pressed="false" aria-label="Save">♡ Save</button>
        </div>
      </div>
    </div>

    <nav class="subnav" aria-label="Sections">
      ${["overview", "specs", "variants", "colours", "proscons", "reviews", "similar"].map((s, i) =>
        `<a href="#/vehicle/${v.id}" data-jump="${s}" class="${i === 0 ? "on" : ""}">${{ overview: "Overview", specs: "Specifications", variants: "Variants", colours: "Colours", proscons: "Pros & cons", reviews: "Reviews", similar: "Similar" }[s]}</a>`).join("")}
    </nav>

    <section class="section" id="sec-overview" aria-labelledby="ovh">
      <h2 id="ovh">Overview</h2>
      <p class="muted" style="max-width:70ch">${esc(v.highlight)}. The ${esc(v.brand)} ${esc(v.model)} sits in the ${esc(catLabel(v.type, v.category))} class, sending ${esc(v.power)} through a ${esc(v.transmission)} ${v.type === "car" ? `${esc(v.drivetrain)} drivetrain` : "final drive"}, and returns ${esc(v.mileage)}.</p>
    </section>

    <section class="section" id="sec-specs" aria-labelledby="sph">
      <h2 id="sph">Full technical specifications</h2>
      <div class="spec-grid">
        ${Object.entries(v.specs).map(([group, rows]) => `
          <div class="card" style="padding:16px"><h3 style="font-size:1rem">${esc(group)}</h3>
            <table class="spec-table"><tbody>
              ${Object.entries(rows).map(([k, val]) => `<tr><th scope="row">${specCell(k)}</th><td>${esc(val)}</td></tr>`).join("")}
            </tbody></table></div>`).join("")}
        ${Object.keys(v.specs).length < 2 ? `<div class="card" style="padding:16px"><h3 style="font-size:1rem">More data</h3><p class="muted">Additional specifications not available for this model.</p></div>` : ""}
      </div>
    </section>

    <section class="section" id="sec-variants" aria-labelledby="vrh">
      <h2 id="vrh">Variants & pricing</h2>
      <div class="compare-wrap"><table class="spec-table card" style="min-width:420px">
        <thead><tr><th scope="col">Variant</th><th scope="col">Price</th><th scope="col">Power</th><th scope="col">${v.fuel === "Electric" ? "Range" : "Mileage"}</th><th scope="col">Est. EMI*</th></tr></thead>
        <tbody>${v.variants.map(vr => `<tr><td><b>${esc(vr.name)}</b></td><td>${fmtPrice(vr.price)}</td><td>${esc(vr.power)}</td><td>${esc(vr.mileage)}</td>
          <td>${vr.price ? "$" + Math.round((vr.price * 1.08) / 60).toLocaleString() + "/mo" : "—"}</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="muted" style="font-size:.78rem">*Illustrative 60-month estimate at 8% — not a finance offer.</p>
    </section>

    <section class="section" id="sec-colours" aria-labelledby="clh">
      <h2 id="clh">Colours</h2>
      <div class="quick-links">${v.colors.map(c => `<span class="chip">🎨 ${esc(c)}</span>`).join("")}</div>
    </section>

    <section class="section" id="sec-proscons" aria-labelledby="pch">
      <h2 id="pch">Pros & cons</h2>
      <div class="proscons">
        <div class="card pros" style="padding:16px"><h4>What owners love</h4><ul>${v.pros.map(p => `<li>${esc(p)}</li>`).join("") || "<li class='muted'>Not enough data yet</li>"}</ul></div>
        <div class="card cons" style="padding:16px"><h4>Watch out for</h4><ul>${v.cons.map(c => `<li>${esc(c)}</li>`).join("") || "<li class='muted'>Nothing reported yet</li>"}</ul></div>
      </div>
    </section>

    <section class="section" id="sec-reviews" aria-labelledby="rvh2">
      <h2 id="rvh2">Owner reviews & ratings</h2>
      ${reviews.length ? `
      <div class="rating-summary">
        <div class="card" style="padding:18px;text-align:center">
          <div class="big-rating">${v.rating.toFixed(1)}</div>
          <div class="rating-badge" style="justify-content:center">${stars(v.rating)}</div>
          <div class="muted" style="font-size:.85rem">${reviews.length} verified-weighted review${reviews.length === 1 ? "" : "s"}</div>
        </div>
        <div class="card" style="padding:18px">
          ${dist.map((n, i) => `<div class="dist-row"><span>${5 - i} ★</span><div class="dist-bar"><i style="width:${reviews.length ? (n / reviews.length) * 100 : 0}%"></i></div><span>${n}</span></div>`).join("")}
          <div style="margin-top:12px" class="muted">Sort:
            <select class="select" id="revSort" aria-label="Sort reviews">
              <option value="helpful">Most helpful</option><option value="recent">Most recent</option>
              <option value="high">Highest rating</option><option value="low">Lowest rating</option>
            </select></div>
        </div>
      </div>
      <div id="revList" class="v-grid" style="margin-top:16px;grid-template-columns:1fr"></div>`
      : `<div class="empty-state panel"><div class="glyph">📝</div><h3>No reviews yet</h3>
         <p class="muted">Own a ${esc(v.model)}? Be the first to share real-world insight with thousands of shoppers.</p></div>`}

      <div class="card" style="padding:16px;margin-top:16px">
        <h3 style="font-size:1rem">Questions & comments (${comments.length})</h3>
        <div id="commentList">${comments.map(c => `<p style="border-top:1px solid var(--border);padding-top:8px"><b>${esc(c.by)}</b> · <span class="muted" style="font-size:.8rem">${esc(c.at)}</span><br>${esc(c.text)}
          <button class="btn btn-ghost btn-sm" data-report style="margin-left:6px">⚑ Report</button></p>`).join("") || `<p class="muted">Start the discussion — ask owners anything.</p>`}</div>
        <form id="commentForm" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <input class="search-input" style="flex:1;min-width:200px" name="text" required maxlength="500" placeholder="Ask a question or share a tip…" aria-label="Your comment">
          <button class="btn btn-primary">Post</button>
        </form>
      </div>
    </section>

    <section class="section" id="sec-similar" aria-labelledby="smh">
      <h2 id="smh">Similar ${v.type === "car" ? "cars" : "bikes"}</h2>
      ${similar.length ? `<div class="v-grid">${similar.map(s => vehicleCard(s)).join("")}</div>` : `<p class="muted">No close rivals in the catalog yet.</p>`}
    </section>
  </div>`;

  /* gallery */
  let gal = 0;
  const setGal = (i) => {
    gal = (i + galleryLabels.length) % galleryLabels.length;
    $("#galleryMain").innerHTML = vehicleArt(v, gal, { label: galleryLabels[gal] });
    $$("[data-gal]").forEach((b, j) => b.setAttribute("aria-current", String(j === gal)));
  };
  $$("[data-gal]").forEach(b => b.addEventListener("click", () => setGal(+b.dataset.gal)));
  $("#galleryMain").addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setGal(gal + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setGal(gal - 1); }
  });
  let touchX = null;
  $("#galleryMain").addEventListener("touchstart", (e) => touchX = e.touches[0].clientX, { passive: true });
  $("#galleryMain").addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) setGal(gal + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* variants */
  $$("[data-variant]").forEach(b => b.addEventListener("click", () => {
    $$("[data-variant]").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    const vr = v.variants[+b.dataset.variant];
    $("#priceLine").textContent = fmtPrice(vr.price);
    $("#hlPower").textContent = vr.power; $("#hlMileage").textContent = vr.mileage;
  }));

  /* subnav */
  $$("[data-jump]").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    $$("[data-jump]").forEach(x => x.classList.remove("on")); a.classList.add("on");
    $("#sec-" + a.dataset.jump)?.scrollIntoView({ behavior: document.documentElement.dataset.motion === "off" ? "auto" : "smooth", block: "start" });
  }));

  /* reviews list */
  if (reviews.length) {
    const paint = (mode) => {
      const sorted = [...reviews].sort({ helpful: (a, b) => b.helpful - a.helpful, recent: (a, b) => b.date.localeCompare(a.date), high: (a, b) => b.rating - a.rating, low: (a, b) => a.rating - b.rating }[mode]);
      $("#revList").innerHTML = sorted.map((r, i) => {
        const long = r.content.length > 220;
        const marked = store.get("mv_helpful", []).includes(v.id + ":" + i);
        return `<article class="card review-card">
          <div class="review-head">
            <span class="avatar" aria-hidden="true">${esc(r.author[0])}</span>
            <div><b>${esc(r.author)}</b>
              ${r.verified ? `<span class="tag" style="font-size:.6rem">Verified owner</span>` : `<span class="tag gold" style="font-size:.6rem">${esc(r.ownership)}</span>`}
              <div class="review-meta"><span>${esc(r.date)}</span>${r.variant ? `<span>Variant: ${esc(r.variant)}</span>` : ""}</div></div>
            <span class="rating-badge" style="margin-left:auto" aria-label="Rated ${r.rating} of 5">★ ${r.rating}</span>
          </div>
          <div class="review-body"><b>${esc(r.title)}</b>
            <p class="rev-text" data-full="${esc(r.content)}">${esc(long ? r.content.slice(0, 220) + "…" : r.content)}</p>
            ${long ? `<button class="btn btn-ghost btn-sm" data-expand>Read more</button>` : ""}
            ${r.pros.length ? `<p style="color:var(--pos);font-size:.85rem;margin:4px 0">▲ ${r.pros.map(esc).join(" · ")}</p>` : ""}
            ${r.cons.length ? `<p style="color:var(--neg);font-size:.85rem;margin:4px 0">▼ ${r.cons.map(esc).join(" · ")}</p>` : ""}
          </div>
          <div class="v-actions">
            <button class="btn btn-ghost btn-sm helpful-btn" data-helpful="${i}" aria-pressed="${marked}">👍 Helpful (${r.helpful + (marked ? 1 : 0)})</button>
            <button class="btn btn-ghost btn-sm" data-report>⚑ Report</button>
          </div></article>`;
      }).join("");
      $$("[data-expand]", $("#revList")).forEach(b => b.addEventListener("click", () => {
        b.previousElementSibling.textContent = b.previousElementSibling.dataset.full; b.remove();
      }));
      $$("[data-helpful]", $("#revList")).forEach(b => b.addEventListener("click", () => {
        const key = v.id + ":" + b.dataset.helpful, m = store.get("mv_helpful", []);
        if (!m.includes(key)) { m.push(key); store.set("mv_helpful", m); paint($("#revSort").value); toast("Thanks — marked helpful"); }
      }));
    };
    paint("helpful");
    $("#revSort").addEventListener("change", (e) => paint(e.target.value));
  }

  /* comments */
  $("#commentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("text").trim();
    if (!text) return;
    const list = store.get("mv_comments_" + v.id, []);
    list.push({ by: "You", at: "just now", text });
    store.set("mv_comments_" + v.id, list);
    toast("Comment posted (demo — stored locally)");
    renderVehicle(v.id); syncSaveButtons(); syncCompareButtons(); activateLazyArt(); activateReveal();
  });
  $$("[data-quote]").forEach(b => b.addEventListener("click", () => toast(v.availability === "Upcoming" ? "We'll notify you at launch 🔔" : "A partner dealer will reach out — demo only")));
}

/* ------------------------------- COMPARE ---------------------------------- */
function renderCompare() {
  const list = compareIds().map(id => VEHICLES.find(v => v.id === id)).filter(Boolean);
  if (list.length < 2) {
    const need = list.length === 1 ? `one more ${list[0].type}` : "2–4 cars or 2–4 bikes";
    outlet().innerHTML = `<div class="wrap"><div class="empty-state panel" style="margin:48px auto;max-width:620px">
      <div class="glyph">⇄</div><h1 style="font-size:1.5rem">Performance comparison</h1>
      <p class="muted">Pick <b>${need}</b> using the ⇄ Compare button on any card. Cars and bikes compare separately — their specifications aren't apples to apples.</p>
      ${list.length === 1 ? `<p>Currently selected: <b>${esc(list[0].brand)} ${esc(list[0].model)}</b> — add at least one more ${list[0].type}.</p>` : ""}
      <a class="btn btn-primary" href="#/listings">Browse machines</a></div></div>`;
    return;
  }
  const type = list[0].type;
  const rows = [
    ["Price", v => fmtPrice(v.price), { best: "min", num: v => v.price ?? Infinity, label: "Best value" }],
    ["Rating", v => v.rating ? "★ " + v.rating.toFixed(1) : "—", { best: "max", num: v => v.rating }],
    ["Power", v => v.power, { best: "max", num: v => parseNum(v.power), label: "Power leader" }],
    ["Torque", v => v.torque, { best: "max", num: v => parseNum(v.torque) }],
    [type === "car" ? "Mileage / range" : "Mileage / range", v => v.mileage, { best: "max", num: v => parseNum(v.mileage), label: "Efficiency leader" }],
    ["Fuel", v => v.fuel, {}],
    ["Transmission", v => v.transmission, {}],
    ...(type === "car" ? [
      ["Drivetrain", v => v.drivetrain, {}],
      ["Seating", v => v.seating + " seats", { best: "max", num: v => v.seating }],
      ["Safety rating", v => "★".repeat(v.safety || 0), { best: "max", num: v => v.safety }],
      ["ADAS", v => v.adas ? "Yes" : "No", {}],
      ["Sunroof", v => v.sunroof ? "Yes" : "No", {}],
    ] : [
      ["Kerb weight", v => v.kerb, { best: "min", num: v => parseNum(v.kerb), label: "Lightest" }],
      ["Seat height", v => v.seatHeight, { best: "min", num: v => parseNum(v.seatHeight) }],
      ["ABS", v => v.abs, {}],
      ["Cooling", v => v.cooling, {}],
    ]),
    ["Availability", v => v.availability, {}],
  ];

  outlet().innerHTML = `<div class="wrap section">
    <div class="section-head"><div><span class="kicker">Battle of specs — professionally</span>
      <h1 style="font-size:1.6rem;margin:0">Performance comparison</h1></div>
      <button class="btn btn-ghost btn-sm" data-compare-clear>Clear all</button></div>
    <div class="compare-wrap card">
      <table class="compare-table">
        <thead><tr><th scope="col" style="min-width:130px">Specification</th>
          ${list.map(v => `<th scope="col" style="min-width:170px">
            <div style="max-width:180px">${vehicleArt(v)}</div>
            <b style="overflow-wrap:anywhere">${esc(v.brand)} ${esc(v.model)}</b><br>
            <a href="#/vehicle/${v.id}" class="btn btn-ghost btn-sm" style="margin:6px 0">Details</a>
            <button class="btn btn-ghost btn-sm" data-compare-remove="${v.id}" aria-label="Remove ${esc(v.model)}">✕ Remove</button></th>`).join("")}
        </tr></thead>
        <tbody>
          ${rows.map(([label, get, meta]) => {
            let bestIdx = -1;
            if (meta.best) {
              const nums = list.map(meta.num);
              const valid = nums.filter(n => !isNaN(n) && isFinite(n));
              if (valid.length > 1) {
                const target = meta.best === "max" ? Math.max(...valid) : Math.min(...valid);
                if (!nums.every(n => n === target)) bestIdx = nums.indexOf(target);
              }
            }
            return `<tr><th scope="row">${esc(label)}${meta.label ? ` <span class="muted" style="font-weight:400;font-size:.72rem">(${meta.label})</span>` : ""}</th>
              ${list.map((v, i) => `<td class="${i === bestIdx ? "best" : ""}">${esc(get(v) ?? "Not available")}</td>`).join("")}</tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
    <p class="muted" style="font-size:.8rem;margin-top:10px">★ marks the leading value in each measurable row. Leaders are computed, never sponsored.</p>
  </div>`;
}

/* ------------------------------- SAVED ------------------------------------ */
function renderSaved() {
  const list = savedIds().map(id => VEHICLES.find(v => v.id === id)).filter(Boolean);
  outlet().innerHTML = `<div class="wrap section">
    <div class="section-head"><div><span class="kicker">Your garage, intelligently curated</span><h1 style="font-size:1.6rem;margin:0">Saved machines</h1></div></div>
    ${list.length ? `<div class="v-grid cols-4">${list.map(v => vehicleCard(v)).join("")}</div>`
      : `<div class="empty-state panel"><div class="glyph">♡</div><h2>Your garage is empty</h2>
         <p class="muted">Tap the ♡ on any machine to park it here for later.</p>
         <a class="btn btn-primary" href="#/listings">Start browsing</a></div>`}</div>`;
}

/* ---------------------------- REVIEWS HUB --------------------------------- */
function renderReviewsHub() {
  const all = VEHICLES.flatMap(v => (v.reviews || []).map(r => ({ ...r, vehicle: v }))).sort((a, b) => b.helpful - a.helpful);
  outlet().innerHTML = `<div class="wrap section">
    <div class="section-head"><div><span class="kicker">Driver Intelligence</span><h1 style="font-size:1.6rem;margin:0">Community reviews</h1></div></div>
    <div class="v-grid">${all.map(r => `
      <article class="card review-card reveal">
        <div class="review-head"><span class="avatar" aria-hidden="true">${esc(r.author[0])}</span>
          <div><b>${esc(r.author)}</b>${r.verified ? ` <span class="tag" style="font-size:.6rem">Verified</span>` : ""}
            <div class="muted" style="font-size:.78rem">${esc(r.vehicle.brand)} ${esc(r.vehicle.model)}</div></div>
          <span class="rating-badge" style="margin-left:auto">★ ${r.rating}</span></div>
        <div class="review-body"><b>${esc(r.title)}</b><p class="muted" style="font-size:.9rem">${esc(r.content)}</p></div>
        <a class="btn btn-ghost btn-sm" href="#/vehicle/${r.vehicle.id}">View ${esc(r.vehicle.model)} →</a>
      </article>`).join("")}</div></div>`;
}

function renderNotFound() {
  outlet().innerHTML = `<div class="wrap"><div class="empty-state panel" style="margin:48px auto;max-width:520px">
    <div class="glyph">🛞</div><h1 style="font-size:1.5rem">Lost the route</h1>
    <p class="muted">That page doesn't exist — but plenty of machines do.</p>
    <a class="btn btn-primary" href="#/home">Back to home</a></div></div>`;
}

/* ------------------------------- toast ------------------------------------ */
let toastTimer = null;
function toast(msg, warn = false) {
  $(".toast")?.remove();
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status");
  t.style.borderColor = warn ? "var(--neg)" : "var(--border-strong)";
  t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), warn ? 4200 : 2600);
}

/* ------------------------- global event delegation ------------------------ */
document.addEventListener("click", (e) => {
  const save = e.target.closest("[data-save]"); if (save) { toggleSaved(save.dataset.save); return; }
  const cmp = e.target.closest("[data-compare]"); if (cmp) { toggleCompare(cmp.dataset.compare); return; }
  const rem = e.target.closest("[data-compare-remove]"); if (rem) {
    const l = compareIds().filter(x => x !== rem.dataset.compareRemove);
    store.set("mv_compare", l); syncCompareButtons(); renderCompareTray();
    if (location.hash.startsWith("#/compare")) renderCompare();
    return;
  }
  if (e.target.closest("[data-compare-clear]")) {
    store.set("mv_compare", []); syncCompareButtons(); renderCompareTray();
    if (location.hash.startsWith("#/compare")) renderCompare();
    return;
  }
  if (e.target.closest("[data-report]")) { toast("Thanks — flagged for our moderation team ⚑"); return; }
});

/* ------------------------------ boot -------------------------------------- */
function boot() {
  /* header controls */
  const themeSel = $("#themeSelect");
  themeSel.innerHTML = THEMES.map(t => `<option value="${t.id}">${t.label}</option>`).join("");
  themeSel.addEventListener("change", () => applyTheme(themeSel.value));
  applyTheme(store.get("mv_theme", "midnight"));
  applyMotion(store.get("mv_motion_off", false));
  applyImmersive(store.get("mv_immersive", false));
  $("#motionBtn").addEventListener("click", () => applyMotion(document.documentElement.dataset.motion !== "off"));
  $("#immersiveBtn").addEventListener("click", () => applyImmersive(document.documentElement.dataset.immersive !== "on"));
  $("#navToggle").addEventListener("click", () => {
    const nav0 = $(".main-nav"); const open = nav0.classList.toggle("open");
    $("#navToggle").setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#/home";
  route();
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
