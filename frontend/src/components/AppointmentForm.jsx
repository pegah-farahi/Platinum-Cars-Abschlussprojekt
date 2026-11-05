import { useState } from "react";

function AppointmentForm({ vehicleId, vehicleTitle }) {
  const now = new Date();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  async function submitAppointment(event) {
    event.preventDefault();

    if (sending || result?.success) return;

    const formData = new FormData(event.currentTarget);

    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/appointments.php", {
        method: "POST",
        body: new URLSearchParams(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Die Anfrage konnte nicht gespeichert werden.",
        );
      }

      setResult({
        success: true,
        text: data.message,
      });
    } catch (error) {
      setResult({
        success: false,
        text:
          error instanceof SyntaxError
            ? "Der Server ist derzeit nicht erreichbar. Kontakt ist telefonisch oder per E-Mail möglich."
            : error.message,
      });
    } finally {
      setSending(false);
    }
  }
  return (
    <details className="appointment-panel">
      <summary>Besichtigung anfragen</summary>

      <p>Besichtigungsanfrage für: {vehicleTitle}</p>

      <form className="appointment-form" onSubmit={submitAppointment}>
        <input type="hidden" name="vehicle_id" value={vehicleId} />

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
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>

        <label>
          Wunschdatum: *
          <input name="preferred_date" type="date" min={today} required />
        </label>

        <label>
          Wunschzeit:
          <input name="preferred_time" type="time" />
        </label>

        <label>
          Nachricht:
          <textarea name="message" rows={4} maxLength={4000} />
        </label>

        <p>
          * Pflichtfelder. Der Wunschtermin wird erst nach unserer Bestätigung
          verbindlich.
        </p>

        <button type="submit" disabled={sending || result?.success}>
          {sending
            ? "Wird gesendet …"
            : result?.success
              ? "Anfrage gespeichert ✓"
              : "Termin anfragen"}
        </button>

        {result && (
          <p role={result.success ? "status" : "alert"}>{result.text}</p>
        )}
      </form>
    </details>
  );
}

export default AppointmentForm;
