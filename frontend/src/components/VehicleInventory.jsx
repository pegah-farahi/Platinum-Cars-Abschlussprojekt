import { useState } from "react";
import VehicleCard from "./VehicleCard";
import PriceRange from "./PriceRange";

export default function VehicleInventory({ vehicles }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const priceLimit = Math.max(
    100000,
    ...vehicles.map((vehicle) => {
      const price =
        vehicle.priceEur ??
        Number(vehicle.price.replaceAll(".", "").replace(",", "."));

      return Math.ceil(price / 100) * 100;
    }),
  );

  const minimum = minPrice === "" ? 0 : Number(minPrice);
  const maximum = maxPrice === "" ? priceLimit : Number(maxPrice);
  const brands = [
    ...new Set(vehicles.map((vehicle) => vehicle.brand).filter(Boolean)),
  ].sort();
  const fuels = [
    ...new Set(vehicles.map((vehicle) => vehicle.fuel).filter(Boolean)),
  ].sort();
  const search = query.trim().toLocaleLowerCase("de");
  const invalidRange =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);
  const matches = invalidRange
    ? []
    : vehicles.filter((vehicle) => {
        // Older API responses only include the German-formatted display price.
        const price =
          vehicle.priceEur ??
          Number(vehicle.price.replaceAll(".", "").replace(",", "."));

        return (
          vehicle.title.toLocaleLowerCase("de").includes(search) &&
          (!brand || vehicle.brand === brand) &&
          (!fuel || vehicle.fuel === fuel) &&
          (minPrice === "" || price >= Number(minPrice)) &&
          (maxPrice === "" || price <= Number(maxPrice))
        );
      });

  return (
    <>
      <div className="vehicle-filters">
        <label>
          <span>Suche:</span>
          <input
            type="search"
            value={query}
            placeholder="Marke oder Modell"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>Marke:</span>
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          >
            <option value="">Alle Marken</option>
            {brands.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Kraftstoff:</span>
          <select
            value={fuel}
            onChange={(event) => setFuel(event.target.value)}
          >
            <option value="">Alle Kraftstoffe</option>
            {fuels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <PriceRange
          minimum={minimum}
          maximum={maximum}
          limit={priceLimit}
          onMinimumChange={(value) => {
            setMinPrice(value === 0 ? "" : String(value));
          }}
          onMaximumChange={(value) => {
            setMaxPrice(value === priceLimit ? "" : String(value));
          }}
        />
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setBrand("");
            setFuel("");
            setMinPrice("");
            setMaxPrice("");
          }}
        >
          Zurücksetzen
        </button>
      </div>
      <p role="status">
        {invalidRange
          ? "Der Mindestpreis darf den Höchstpreis nicht überschreiten."
          : matches.length === 0
            ? "Keine passenden Fahrzeuge gefunden."
            : `${matches.length} ${matches.length === 1 ? "Fahrzeug" : "Fahrzeuge"} gefunden`}
      </p>
      <div className="vehicle-grid">
        {matches.map((vehicle) => (
          <VehicleCard key={vehicle.id} {...vehicle} />
        ))}
      </div>
    </>
  );
}
