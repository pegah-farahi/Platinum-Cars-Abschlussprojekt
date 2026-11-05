import "./VehicleCard.css";
import { useRef, useState } from "react";
import DealerContact from "./DealerContact";

const audiA5FinancingUrl = "https://www.mobile.de/finanzierung/route/outlink/1?adId=53191191733536&channel=desktop&downPayment=2698&loanDuration=60&loanType=BALLOON&meta=loid%3A87fc3da4-d859-11f1-92be-95f7998002cf&placement=dhp-vip-price-link&lang=de&abtest=cos-dhp-aa%3Acontrol&abtest=cos-qct-dhp-contact%3Av1";

const specIcons = {
  Kilometerstand: "M5 3v18M19 3v18M12 3v3m0 4v4m0 4v3",
  Leistung: "M4 19a9 9 0 1 1 16 0H4zm8-4 4-5m-4 5h.01",
  Kraftstoff: "M3 21h11M5 21V4h8v17M5 11h8m0 3h2a2 2 0 0 1 2 2v1a2 2 0 0 0 4 0v-7l-4-4",
  Getriebe: "M5 4v16M12 4v16M19 4v8H5",
  Erstzulassung: "M4 6h16v15H4zM4 10h16M8 3v5m8-5v5m-8 7 3 3 5-5",
  Fahrzeughalter: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2",
};

function VehicleCard({
  id,
  title,
  brand,
  model,
  images,
  firstRegistration,
  mileage,
  fuel,
  power,
  price,
  transmission,
  exteriorColor,
  description,
  equipment,
  technicalDetails,
  financingExample,
  detailed = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(null);
  const photoDialog = useRef(null);
  function changeImage(direction) {
    setCurrentIndex(
      (previousIndex) =>
        (previousIndex + direction + images.length) % images.length,
    );
  }
  function handleTouchStart(event) {
    if (images.length < 2 || event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }

    const { clientX, clientY } = event.touches[0];
    touchStart.current = { x: clientX, y: clientY };
  }

  function handleTouchEnd(event) {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || images.length < 2) return;

    const { clientX, clientY } = event.changedTouches[0];
    const dx = clientX - start.x;
    const dy = clientY - start.y;

    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;

    changeImage(dx < 0 ? 1 : -1);
  }
  const gallery = (
      <div
        className="vehicle-image"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
      >
        {images.length > 0 ? (
          <button className="vehicle-zoom" type="button"
            aria-label={`${title} – Bild ${currentIndex + 1} vergrößern`}
            onClick={() => photoDialog.current.showModal()}>
            <img src={images[currentIndex]} alt="" loading="lazy" />
            <span className="vehicle-zoom-label">⌕ Vergrößern</span>
          </button>
        ) : (
          <p className="vehicle-image-empty">Fahrzeugfoto folgt</p>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-prev"
              aria-label={`Vorheriges Bild von ${title}`}
              onClick={() => changeImage(-1)}
            >
              ‹
            </button>

            <button
              type="button"
              className="gallery-arrow gallery-arrow-next"
              aria-label={`Nächstes Bild von ${title}`}
              onClick={() => changeImage(1)}
            >
              ›
            </button>

            <span className="gallery-counter" aria-live="polite">
              {currentIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>
  );

  const enlargedGallery = images.length > 0 && (
    <dialog ref={photoDialog} className="vehicle-photo-dialog" aria-label={`Bilder: ${title}`}
      onKeyDown={(event) => {
        if (images.length < 2) return;
        if (event.key === "ArrowLeft") changeImage(-1);
        if (event.key === "ArrowRight") changeImage(1);
      }}>
      <div className="vehicle-photo-toolbar">
        <span aria-live="polite">{currentIndex + 1} / {images.length}</span>
        <form method="dialog"><button type="submit">Schließen ×</button></form>
      </div>
      <img src={images[currentIndex]} alt={`${title} – Bild ${currentIndex + 1}`} loading="lazy" />
      {images.length > 1 && (
        <div className="vehicle-photo-toolbar">
          <button type="button" onClick={() => changeImage(-1)}>‹ Vorheriges Bild</button>
          <button type="button" onClick={() => changeImage(1)}>Nächstes Bild ›</button>
        </div>
      )}
    </dialog>
  );

  if (detailed) {
    // Keep model names such as CLA 180 together on the first line.
    const modelParts = model?.match(/^(\S+(?:\s+\d{3})?)(?:\s+(.+))?$/);
    const heading = brand && modelParts ? `${brand} ${modelParts[1]}` : title;
    const subtitle = brand ? modelParts?.[2] : null;
    const { Fahrzeughalter: owners, ...extraSpecs } = technicalDetails ?? {};
    const highlights = [
      ["Kilometerstand", `${mileage} km`],
      ["Leistung", power],
      ["Kraftstoff", fuel],
      ["Getriebe", transmission],
      ["Erstzulassung", firstRegistration],
      ["Fahrzeughalter", owners],
    ].filter(([, value]) => value);
    const specs = [
      ["Außenfarbe", exteriorColor],
      ...Object.entries(extraSpecs),
    ].filter(([, value]) => value);
    const equipmentItems = equipment?.split("\n").filter(Boolean) ?? [];

    return (
      <article className="vehicle-detail-content">
        {enlargedGallery}
        <div className="vehicle-detail-overview">
          <div>
            {gallery}
            {images.length > 1 && (
              <div className="vehicle-thumbnails" aria-label="Fahrzeugbilder">
                {images.map((image, index) => (
                  <button key={image} type="button"
                    aria-label={`Bild ${index + 1} anzeigen`}
                    aria-pressed={index === currentIndex}
                    onClick={() => setCurrentIndex(index)}>
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="vehicle-detail-price">
            <h1>
              {heading}
              {subtitle && <span className="vehicle-detail-subtitle"> {subtitle}</span>}
            </h1>
            <p className="vehicle-price-label">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 4h8l9 9a2 2 0 0 1 0 2.8l-4.2 4.2a2 2 0 0 1-2.8 0L3 10V4Z" />
                <circle cx="7.5" cy="8" r="1" />
              </svg>
              Kaufpreis:
            </p>
            <strong>{price} €</strong>
            {financingExample && (
              <p className="vehicle-financing-summary">
                ab <strong>{financingExample.monthlyRate}</strong> mtl.{" "}
                {id === 4 ? (
                  <a href={audiA5FinancingUrl} target="_blank" rel="noopener noreferrer">
                    Finanzierung berechnen
                  </a>
                ) : (
                  <a href="#fahrzeug-finanzierung">Finanzierungsbeispiel ansehen</a>
                )}
              </p>
            )}
            <div className="vehicle-dealer" id="fahrzeug-kontakt">
              <h2>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.7"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-7-7l2-2-2-5Z" />
                </svg>
                Kontakt zu uns:
              </h2>
              <DealerContact compact />
            </div>
          </div>
        </div>

        <section>
          <h2>Technische Daten</h2>
          <dl className="vehicle-highlights">
            {highlights.map(([label, value]) => (
              <div key={label}>
                <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.7"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d={specIcons[label]} />
                </svg>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {specs.length > 0 && (
            <details className="vehicle-more">
              <summary>Weitere technische Daten</summary>
              <dl className="vehicle-specs">
                {specs.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </details>
          )}
        </section>

        <section>
          <h2>Ausstattung</h2>
          {equipmentItems.length > 0 ? (
            <ul className="vehicle-equipment">
              {equipmentItems.map((item) => (
                <li key={item}><span aria-hidden="true">✓</span>{item}</li>
              ))}
            </ul>
          ) : <p>Details zur Ausstattung erhalten Sie beim Händler.</p>}
        </section>

        <section>
          <h2>Fahrzeugbeschreibung</h2>
          <p>{description || "Weitere Informationen zum Fahrzeug erhalten Sie beim Händler."}</p>
        </section>

        <section id="fahrzeug-finanzierung">
          <h2>Finanzierung</h2>
          <p>Fragen Sie beim Händler nach Finanzierungsmöglichkeiten und aktuellen Konditionen für dieses Fahrzeug.</p>
          <a className="info-link" href="#fahrzeug-kontakt">Kontakt zu uns</a>
          {financingExample && (
            <>
              <h3>Finanzierungsbeispiel aus dem Inserat</h3>
              <p>Dokumentiert am {financingExample.recordedOn}. Aktuelle Konditionen bitte beim Händler erfragen.</p>
              <dl className="vehicle-specs">
                <div><dt>Monatsrate im Beispiel</dt><dd>{financingExample.monthlyRate}</dd></div>
                {Object.entries(financingExample.terms).map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </>
          )}
        </section>
      </article>
    );
  }

  return (
    <article className="vehicle-card">
      {enlargedGallery}
      {gallery}
      <div className="vehicle-card-content">
        <h3>{title}</h3>

        <p>
          {firstRegistration} · {mileage} km
        </p>
        <p>
          {fuel} · {power}
        </p>

        <p className="vehicle-price">{price} €</p>
        <a className="info-link" href={`/fahrzeuge/${id}`}>Details ansehen</a>
      </div>
    </article>
  );
}

export default VehicleCard;
