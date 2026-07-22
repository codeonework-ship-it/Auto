import { Link } from "react-router-dom";
import { useCatalog, catLabel } from "../context/CatalogContext.jsx";
import { fmtPrice, parseNum } from "../util.js";
import { ProductImage, Void } from "../components/Ui.jsx";
import { IconX } from "../components/Icons.jsx";

export default function Compare() {
  const { compare, products, toggleCompare, clearCompare } = useCatalog();
  const list = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  if (list.length < 2) {
    return (
      <div className="wrap section">
        <Void sig="// DUEL BAY" title="Performance duel">
          <p className="muted" style={{ maxWidth: "52ch", margin: "0 auto 8px" }}>
            Select <b style={{ color: "var(--cyan)" }}>2–4 cars</b> or <b style={{ color: "var(--cyan)" }}>2–4 bikes</b> with
            the DUEL control on any card. Cross-class duels are blocked — car and bike telemetry
            are not comparable.
          </p>
          {list.length === 1 && (
            <p className="mono" style={{ fontSize: ".76rem", color: "var(--amber)", letterSpacing: ".1em" }}>
              STAGED: {list[0].brand.toUpperCase()} {list[0].model.toUpperCase()} — ADD ONE MORE {list[0].type.toUpperCase()}
            </p>
          )}
          <Link className="btn btn-cmd" to="/hangar">Open the hangar</Link>
        </Void>
      </div>
    );
  }

  const type = list[0].type;
  const rows = [
    ["PRICE", (v) => fmtPrice(v.price), { best: "min", num: (v) => v.price ?? Infinity, tag: "BEST VALUE" }],
    ["RATING", (v) => (v.rating ? v.rating.toFixed(1) + " ★" : "—"), { best: "max", num: (v) => v.rating }],
    ["POWER", (v) => v.power, { best: "max", num: (v) => parseNum(v.power), tag: "POWER LEADER" }],
    ["TORQUE", (v) => v.torque, { best: "max", num: (v) => parseNum(v.torque) }],
    ["ECON / RANGE", (v) => v.mileage, { best: "max", num: (v) => parseNum(v.mileage), tag: "EFFICIENCY LEADER" }],
    ["POWERPLANT", (v) => v.fuel, {}],
    ["TRANSMISSION", (v) => v.transmission, {}],
    ...(type === "car"
      ? [
          ["LAYOUT", (v) => v.drivetrain, {}],
          ["SEATS", (v) => `${v.seating ?? "—"}`, { best: "max", num: (v) => v.seating }],
          ["SAFETY", (v) => "◆".repeat(v.safety || 0) || "—", { best: "max", num: (v) => v.safety }],
          ["ADAS", (v) => (v.adas ? "FITTED" : "—"), {}],
        ]
      : [
          ["KERB WEIGHT", (v) => v.kerb, { best: "min", num: (v) => parseNum(v.kerb), tag: "LIGHTEST" }],
          ["SEAT HEIGHT", (v) => v.seatHeight, { best: "min", num: (v) => parseNum(v.seatHeight) }],
          ["ABS", (v) => v.abs, {}],
          ["COOLING", (v) => v.cooling, {}],
        ]),
    ["STATUS", (v) => v.availability, {}],
  ];

  return (
    <div className="wrap section">
      <div className="section-head">
        <div><div className="kicker">Computed — never sponsored</div>
          <h1 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>Performance duel</h1></div>
        <button className="btn btn-line btn-sm" onClick={clearCompare}>Clear bay</button>
      </div>
      <div className="duel-wrap hud">
        <table className="duel">
          <thead>
            <tr>
              <th style={{ minWidth: 140 }} className="mono" scope="col">TELEMETRY</th>
              {list.map((v) => (
                <th key={v.id} scope="col" style={{ minWidth: 190 }}>
                  <div style={{ maxWidth: 200, border: "1px solid var(--line)", marginBottom: 8 }}><ProductImage v={v} /></div>
                  <b style={{ textTransform: "uppercase", letterSpacing: ".04em" }}>{v.brand} {v.model}</b>
                  <div className="mono muted" style={{ fontSize: ".62rem", letterSpacing: ".16em", margin: "2px 0 8px" }}>
                    {catLabel(v.type, v.category).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Link className="btn btn-line btn-sm" to={`/vehicle/${v.id}`}>Intel</Link>
                    <button className="btn btn-line btn-sm" onClick={() => toggleCompare(v.id)} aria-label={`Remove ${v.model}`}>
                      <IconX size={12} /> Eject
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get, meta]) => {
              let best = -1;
              if (meta.best) {
                const nums = list.map(meta.num);
                const valid = nums.filter((n) => !isNaN(n) && isFinite(n));
                if (valid.length > 1) {
                  const target = meta.best === "max" ? Math.max(...valid) : Math.min(...valid);
                  if (!nums.every((n) => n === target)) best = nums.indexOf(target);
                }
              }
              return (
                <tr key={label}>
                  <th scope="row">{label}{meta.tag && <span style={{ display: "block", color: "var(--amber)", fontSize: ".56rem" }}>{meta.tag}</span>}</th>
                  {list.map((v, i) => (
                    <td key={v.id} className={i === best ? "lead" : ""}>{get(v) ?? "NOT AVAILABLE"}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mono muted" style={{ fontSize: ".62rem", letterSpacing: ".16em", marginTop: 10 }}>
        ◆ MARKS THE COMPUTED LEADER IN EACH MEASURABLE ROW
      </p>
    </div>
  );
}
