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
      {compact && "Telefon: "}
      <a href="tel:+492121491680621">+49 (0)212 1491680621</a>
      <br />
      E-Mail: <a href="mailto:pegah.farahi@gmail.com">pegah.farahi@gmail.com</a>
    </address>
  );
}
