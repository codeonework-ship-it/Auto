import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext.jsx";
import { VehicleCard, Void, useReveal } from "../components/Ui.jsx";

export default function Garage() {
  const { saved, products } = useCatalog();
  const list = saved.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const ref = useReveal([list.length]);
  return (
    <div className="wrap section" ref={ref}>
      <div className="section-head">
        <div><div className="kicker">Private bay</div>
          <h1 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>Your garage</h1></div>
        <span className="count-readout"><b>{list.length}</b> DOCKED</span>
      </div>
      {list.length ? (
        <div className="grid g4">{list.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
      ) : (
        <Void sig="// BAY EMPTY" title="Nothing docked yet">
          <p className="muted">Hit the heart control on any machine to dock it here for later.</p>
          <Link className="btn btn-cmd" to="/hangar">Scout the hangar</Link>
        </Void>
      )}
    </div>
  );
}
