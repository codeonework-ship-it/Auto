import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCatalog, catLabel } from "../context/CatalogContext.jsx";
import { IconLogo, IconMenu, IconX, IconSearch, IconDuel } from "./Icons.jsx";

/* ------------------------------- top bar --------------------------------- */
export function TopBar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc]);
  const links = [
    ["/", "Deck", true], ["/hangar?type=car", "Cars"], ["/hangar?type=bike", "Bikes"],
    ["/duel", "Duel"], ["/garage", "Garage"],
  ];
  const isOn = (to, exact) => {
    const path = to.split("?")[0];
    if (exact) return loc.pathname === "/";
    if (path === "/hangar") {
      const t = new URLSearchParams(to.split("?")[1]).get("type");
      return loc.pathname === "/hangar" && new URLSearchParams(loc.search).get("type") === t;
    }
    return loc.pathname.startsWith(path);
  };
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link to="/" className="brand" aria-label="MOTORA command deck home">
          <span className="brand-glyph"><IconLogo size={20} style={{ color: "var(--cyan)" }} /></span>
          <span><b>MOTORA</b><small>COMMAND DECK</small></span>
        </Link>
        <button className="icon-btn nav-burger" aria-expanded={open} aria-controls="mainNav"
                aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <IconX /> : <IconMenu />}
        </button>
        <nav id="mainNav" className={`nav ${open ? "open" : ""}`} aria-label="Primary">
          {links.map(([to, label, exact]) => (
            <NavLink key={to} to={to} className={isOn(to, exact) ? "on" : ""}>{label}</NavLink>
          ))}
        </nav>
        <span className="grow" />
        <QuickSearch compact />
      </div>
    </header>
  );
}

/* -------------------------- search w/ suggestions ------------------------- */
export function QuickSearch({ compact = false, typeFilter = "all", onSubmitQuery }) {
  const { products } = useCatalog();
  const [q, setQ] = useState("");
  const [openList, setOpenList] = useState(false);
  const [sel, setSel] = useState(-1);
  const nav = useNavigate();
  const boxRef = useRef(null);

  const matches = useMemo(() => {
    const pool = products.filter((p) => typeFilter === "all" || p.type === typeFilter);
    const term = q.trim().toLowerCase();
    if (!term) return pool.slice().sort((a, b) => b.searches - a.searches).slice(0, 5);
    return pool.filter((p) => `${p.brand} ${p.model} ${p.category} ${catLabel(p.type, p.category)}`.toLowerCase().includes(term)).slice(0, 7);
  }, [products, q, typeFilter]);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpenList(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const go = (id) => { setOpenList(false); setQ(""); nav(`/vehicle/${id}`); };
  const submit = () => {
    setOpenList(false);
    if (onSubmitQuery) onSubmitQuery(q);
    else nav(`/hangar?q=${encodeURIComponent(q.trim())}${typeFilter !== "all" ? `&type=${typeFilter}` : ""}`);
  };
  const onKey = (e) => {
    if (!openList) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (s + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % Math.max(1, matches.length));
    } else if (e.key === "Enter") {
      if (sel >= 0 && matches[sel]) { e.preventDefault(); go(matches[sel].id); } else submit();
    } else if (e.key === "Escape") setOpenList(false);
  };

  return (
    <div ref={boxRef} style={{ position: "relative", minWidth: compact ? "min(240px, 58vw)" : undefined, flex: compact ? "0 1 300px" : 1 }}>
      <div style={{ position: "relative" }}>
        <input className="field" role="combobox" aria-expanded={openList} aria-autocomplete="list"
               aria-label="Search machines" placeholder={compact ? "SEARCH…" : "DESIGNATION, BRAND OR CLASS…"}
               value={q} style={{ paddingRight: 42, fontFamily: "var(--mono)", fontSize: ".8rem", letterSpacing: ".1em" }}
               onChange={(e) => { setQ(e.target.value); setOpenList(true); setSel(-1); }}
               onFocus={() => setOpenList(true)} onKeyDown={onKey} />
        <IconSearch size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
      </div>
      {openList && (
        <ul className="suggest" role="listbox" style={{ left: 0, right: 0, top: "calc(100% + 4px)" }}>
          {matches.length === 0 && (
            <li style={{ padding: "12px 14px", color: "var(--muted)", fontSize: ".84rem" }}>
              NO CONTACT FOR “{q}”. Try a brand like <b style={{ color: "var(--cyan)" }}>Ryujin</b> or a class like <b style={{ color: "var(--cyan)" }}>SUV</b>.
            </li>
          )}
          {matches.map((m, i) => (
            <li key={m.id} role="option" aria-selected={i === sel}>
              <button onClick={() => go(m.id)}>
                <span>{m.brand} {m.model}</span>
                <span>{m.type} // {catLabel(m.type, m.category)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------ compare tray ------------------------------ */
export function CompareTray() {
  const { compare, products, toggleCompare, clearCompare } = useCatalog();
  const loc = useLocation();
  const list = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!list.length || loc.pathname.startsWith("/duel")) return null;
  return (
    <div className="tray" aria-label="Duel selection">
      <div className="wrap tray-inner">
        <span className="mono" style={{ color: "var(--cyan)", fontSize: ".74rem", letterSpacing: ".2em" }}>
          <IconDuel size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> DUEL BAY // {list.length}/4
        </span>
        {list.map((v) => (
          <span key={v.id} className="chip chip-dim">{v.brand} {v.model}
            <button onClick={() => toggleCompare(v.id)} aria-label={`Remove ${v.model}`}><IconX size={12} /></button>
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link className="btn btn-cmd btn-sm" to="/duel">Engage</Link>
          <button className="btn btn-line btn-sm" onClick={clearCompare}>Clear</button>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- footer ---------------------------------- */
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand" style={{ marginBottom: 12 }}>
              <span className="brand-glyph"><IconLogo size={18} style={{ color: "var(--cyan)" }} /></span>
              <span><b style={{ fontSize: ".95rem" }}>MOTORA</b><small>COMMAND DECK</small></span>
            </Link>
            <p className="muted" style={{ maxWidth: "30ch", fontSize: ".85rem" }}>
              Precision in every specification. Built for the road ahead.
            </p>
          </div>
          <div><h4>Hangar</h4><ul>
            <li><Link to="/hangar?type=car">All cars</Link></li>
            <li><Link to="/hangar?type=bike">All bikes</Link></li>
            <li><Link to="/hangar?fuel=Electric">Electric fleet</Link></li>
          </ul></div>
          <div><h4>Operations</h4><ul>
            <li><Link to="/duel">Performance duel</Link></li>
            <li><Link to="/garage">Your garage</Link></li>
          </ul></div>
          <div><h4>Signal</h4><ul>
            <li><a href="#/">Help centre</a></li>
            <li><a href="#/">Report a listing</a></li>
            <li><a href="#/">Privacy · Terms</a></li>
          </ul></div>
        </div>
        <div className="footer-base">
          <span>© 2026 MOTORA // ALL MACHINES FICTIONAL — DEMO CATALOG SERVED BY AUTOHUB API</span>
          <span>NO TRACKERS · ORIGINAL ART · WCAG AA</span>
        </div>
      </div>
    </footer>
  );
}
