export default function DealerContact({ compact = false }) {
  return (
    <address className="dealer-contact">
      {!compact && (
        <>
          <strong>Platinum Cars</strong><br />
          Löhdorfer Straße 70<br />
          42699 Solingen<br />
        </>
      )}
      <div className="dealer-contact-item">
        <span>Telefon:</span>
        <a href="tel:+492121491680621">+49 (0)212 1491680621</a>
      </div>
      <div className="dealer-contact-item">
        <span>E-Mail:</span>
        <a href="mailto:projekt.test.email@gmail.com">projekt.test.email@gmail.com</a>
      </div>
    </address>
  );
}
