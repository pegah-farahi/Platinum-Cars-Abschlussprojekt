import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import VehicleCard from "./components/VehicleCard";
import VehicleInventory from "./components/VehicleInventory";
import HomeInfo from "./components/HomeInfo";
import Shop from "./components/Shop";
import Workshop from "./components/Workshop";
import "./App.css";

function App() {
  const isVehiclesPage = window.location.pathname === "/fahrzeuge";
  const isShopPage = window.location.pathname === "/shop";
  const isWorkshopPage = window.location.pathname === "/werkstatt";
  const detailRoute = /^\/fahrzeuge\/(\d+)\/?$/.exec(window.location.pathname);
  const vehicleId = detailRoute ? Number(detailRoute[1]) : null;
  const [vehicles, setVehicles] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const selectedVehicle = vehicles?.find(({ id }) => id === vehicleId);
  const featuredVehicles = (vehicles ?? []).filter(({ id }) => id === 1 || id === 2 || id === 3);

  useEffect(() => {
    if (isShopPage || isWorkshopPage) return;
    const controller = new AbortController();

    fetch("/api/vehicles.php", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Fahrzeugdaten nicht verfügbar");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Ungültige Fahrzeugdaten");
        setVehicles(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      });

    return () => controller.abort();
  }, [isShopPage, isWorkshopPage]);

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView();
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        {isShopPage ? <Shop /> : isWorkshopPage ? <Workshop /> : detailRoute ? (
          <section className="vehicles-section vehicle-detail">
            <p><a className="info-link" href="/fahrzeuge">← Alle Fahrzeuge</a></p>
            {loadError && <p role="alert">Die Fahrzeugdaten konnten nicht geladen werden.</p>}
            {!loadError && vehicles === null && <p role="status">Fahrzeug wird geladen …</p>}
            {vehicles !== null && !selectedVehicle && <h1>Fahrzeug nicht gefunden</h1>}
            {selectedVehicle && <VehicleCard key={selectedVehicle.id} {...selectedVehicle} detailed />}
          </section>
        ) : (
          <>
        {!isVehiclesPage && <Hero />}

        <section
          className="vehicles-section"
          id="fahrzeuge"
          aria-labelledby="vehicles-heading"
        >
          {isVehiclesPage ? (
            <h1 id="vehicles-heading">Alle Fahrzeuge</h1>
          ) : (
            <>
              <h2 id="vehicles-heading">Unsere Fahrzeuge</h2>
              <p>Entdecken Sie eine Auswahl unserer Fahrzeuge.</p>
            </>
          )}

          {loadError && <p role="alert">Die Fahrzeuge konnten nicht geladen werden.</p>}
          {!loadError && vehicles === null && <p role="status">Fahrzeuge werden geladen …</p>}
          {vehicles !== null && (isVehiclesPage ? (
            <VehicleInventory vehicles={vehicles} />
          ) : (
            <div className="vehicle-grid">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} {...vehicle} />
              ))}
            </div>
          ))}

          {!isVehiclesPage && (
            <p>
              <a href="/fahrzeuge">Alle Fahrzeuge ansehen</a>
            </p>
          )}
        </section>
        {!isVehiclesPage && <HomeInfo />}
          </>
        )}
      </main>
      <footer className="site-footer">
        <p>Platinum Cars · Solingen</p>
        <p className="site-footer-note">Demo für das Abschlussprojekt</p>
      </footer>
    </>
  );
}

export default App;
