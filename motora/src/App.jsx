import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { CatalogProvider, useCatalog } from "./context/CatalogContext.jsx";
import { API_BASE } from "./api.js";
import { TopBar, Footer, CompareTray } from "./components/Chrome.jsx";
import { SkeletonGrid, Void, Toast } from "./components/Ui.jsx";
import Home from "./pages/Home.jsx";
import Listings from "./pages/Listings.jsx";
import Detail from "./pages/Detail.jsx";
import Compare from "./pages/Compare.jsx";
import Garage from "./pages/Garage.jsx";

function ScrollTop() {
  const { pathname, search } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return null;
}

function Boot() {
  const [show, setShow] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div className="boot" aria-hidden="true">
      <div style={{ textAlign: "center" }}>
        <div className="mono">MOTORA // SYSTEMS ONLINE</div>
        <div className="bar"><i /></div>
      </div>
    </div>
  );
}

function Deck() {
  const { status, reload } = useCatalog();
  if (status === "loading") {
    return <main className="wrap section"><SkeletonGrid n={8} /></main>;
  }
  if (status === "error") {
    return (
      <main className="wrap section">
        <Void sig="// UPLINK SEVERED" title="Catalog API unreachable">
          <p className="muted">
            MOTORA is fully API-driven — it needs the AutoHub backend at{" "}
            <b className="mono" style={{ color: "var(--cyan)" }}>{API_BASE}</b>.
          </p>
          <p className="mono muted" style={{ fontSize: ".68rem", letterSpacing: ".08em" }}>
            java -jar backend/target/autohub-backend-0.1.0-SNAPSHOT.jar --spring.profiles.active=local --server.port=18080
          </p>
          <button className="btn btn-cmd" onClick={reload}>Re-establish uplink</button>
        </Void>
      </main>
    );
  }
  return (
    <main id="main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hangar" element={<Listings />} />
        <Route path="/vehicle/:slug" element={<Detail />} />
        <Route path="/duel" element={<Compare />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="*" element={
          <div className="wrap section">
            <Void sig="// TARGET NOT FOUND" title="Lost the route">
              <a className="btn btn-cmd" href="#/">Return to deck</a>
            </Void>
          </div>} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <HashRouter>
        <Boot />
        <ScrollTop />
        <TopBar />
        <Deck />
        <CompareTray />
        <Toast />
        <Footer />
      </HashRouter>
    </CatalogProvider>
  );
}
