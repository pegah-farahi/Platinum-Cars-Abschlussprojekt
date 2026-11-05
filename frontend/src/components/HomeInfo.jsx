import workshop from "../assets/workshop-navy.webp";

const mapAddress = encodeURIComponent("Löhdorfer Straße 70, 42699 Solingen");

export default function HomeInfo() {

  return (
    <>
      <section id="leistungen" className="vehicles-section info-grid">
        <div>
          <h2>Unsere Leistungen</h2>
          <p>Gemeinsam mit unserem Partner bieten wir Unterstützung bei der Aufbereitung und Reparatur von Fahrzeugen an.</p>
          <a className="info-link" href="/werkstatt">Mehr zu Aufbereitung &amp; Reparatur →</a>
          <div className="shop-teaser">
            <div className="icon-heading">
            <svg className="shop-teaser-icon" width="48" height="48"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M3 4h2l2.4 10.5h11.2L21 7H6" />
              <circle cx="9" cy="19" r="1.4" />
              <circle cx="17" cy="19" r="1.4" />
            </svg>
            <h3>Autozubehör</h3>
            </div>
            <p>Entdecken Sie eine Vorschau auf unseren geplanten Zubehörshop.</p>
            <a className="info-link" href="/shop">Shop-Vorschau ansehen →</a>
          </div>
        </div>
        <figure className="workshop-photo">
          <img src={workshop} alt="Mechaniker bei der Arbeit am Fahrzeug" loading="lazy" />
        </figure>
      </section>

      <section id="kontakt" className="vehicles-section info-grid">
        <div>
          <h2 className="icon-heading">
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Kontakt
          </h2>
          <DealerContact />
          <a className="info-link" href={`https://www.google.com/maps/dir/?api=1&destination=${mapAddress}`}>Route in Google Maps öffnen ↗</a>
        </div>
          <iframe
            className="contact-map"
            title="Google Maps – Standort Platinum Cars"
            src={`https://maps.google.com/maps?q=${mapAddress}&z=15&output=embed`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
      </section>
    </>
  );
}
import DealerContact from "./DealerContact";
