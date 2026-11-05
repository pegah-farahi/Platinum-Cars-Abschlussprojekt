import { useState } from "react";
import DealerContact from "./DealerContact";
import workshop from "../assets/workshop-navy.webp";

export default function Workshop() {
  const [requestType, setRequestType] = useState("contact");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  async function submitRequest(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setResult(null);
    try {
      const response = await fetch("/api/service-requests.php", {
        method: "POST",
        body: new URLSearchParams(new FormData(form)),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Die Anfrage konnte nicht gespeichert werden.",
        );
      setResult({ success: true, text: data.message });
      form.reset();
      setRequestType("contact");
    } catch (error) {
      setResult({
        success: false,
        text:
          error instanceof SyntaxError
            ? "Der Server ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut."
            : error.message,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="vehicles-section workshop-page">
      <section className="info-grid">
        <div>
          <h1>Fahrzeugaufbereitung &amp; Reparatur</h1>
          <p>
            Gemeinsam mit unserem Partner unterstützen wir Sie bei der Pflege,
            Aufbereitung und Reparatur Ihres Fahrzeugs.
          </p>
          <h2>Ihr Anliegen im Mittelpunkt</h2>
          <p>
            Beschreiben Sie uns, was an Ihrem Fahrzeug gemacht werden soll. Wir
            klären mit Ihnen den möglichen Leistungsumfang und die nächsten
            Schritte.
          </p>
          <p>
            Ein Kostenvoranschlag und die Terminabstimmung erfolgen nach
            persönlicher Rücksprache. Teilen Sie uns dafür bitte Fahrzeugmodell
            und Ihr Anliegen mit.
          </p>
          <DealerContact />
        </div>
        <figure className="workshop-photo">
          <img src={workshop} alt="Arbeiten im Motorraum eines Fahrzeugs" />
        </figure>
      </section>
      <section
        className="workshop-request"
        aria-labelledby="service-request-title"
      >
        <h2 id="service-request-title">Ihre Anfrage an uns</h2>
        <form className="request-form" onSubmit={submitRequest}>
          <fieldset disabled={sending}>
            <label>
              Anfrageart:
              <select
                name="request_type"
                value={requestType}
                onChange={(event) => setRequestType(event.target.value)}
              >
                <option value="contact">Kontaktanfrage</option>
                <option value="appointment">Terminanfrage</option>
              </select>
            </label>
            <label>
              Name: *
              <input name="name" autoComplete="name" maxLength={150} required />
            </label>
            <label>
              E-Mail: *
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>
            <label>
              Telefon:
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
              />
            </label>
            <label>
              Ihr Fahrzeug:
              <input
                name="vehicle_description"
                placeholder="Marke und Modell"
                maxLength={200}
              />
            </label>
            <label>
              Wunschdatum:{requestType === "appointment" && " *"}
              <input
                name="preferred_date"
                type="date"
                min={today}
                required={requestType === "appointment"}
              />
            </label>
            <label>
              Wunschzeit:
              <input name="preferred_time" type="time" />
            </label>
            <label className="request-message">
              Ihr Anliegen: *
              <textarea name="message" maxLength={4000} rows={5} required />
            </label>
            <p className="request-message">
              * Pflichtfelder. Ein Wunschtermin wird erst nach unserer
              Bestätigung verbindlich.
            </p>
            <button className="hero-button" type="submit">
              {sending
                ? "Wird gesendet …"
                : requestType === "appointment"
                  ? "Termin anfragen"
                  : "Nachricht senden"}
            </button>
          </fieldset>
        </form>
        {result && (
          <p role={result.success ? "status" : "alert"}>{result.text}</p>
        )}
      </section>
    </div>
  );
}
