import productPhotos from "../assets/shop-products.webp";

const products = [
  { name: "Mikrofasertücher", description: "Ein weiches Tuchset für die Fahrzeugpflege.", price: "9,90 €", imagePosition: "left" },
  { name: "Gummifußmatten", description: "Abwaschbare Matten für den Innenraum.", price: "29,90 €", imagePosition: "center" },
  { name: "Kofferraum-Organizer", description: "Eine faltbare Tasche für den Kofferraum.", price: "24,90 €", imagePosition: "right" },
];

export default function Shop() {
  return (
    <section className="vehicles-section" aria-labelledby="shop-heading">
      <h1 id="shop-heading">Autozubehör</h1>
      <p>Hier sehen Sie Beispielprodukte mit Beispielpreisen und illustrativen Produktbildern. Die Online-Bestellung ist für später geplant.</p>
      <div className="vehicle-grid">
        {products.map(({ name, description, price, imagePosition }) => (
          <article className="shop-product" key={name}>
            <div
              className="shop-product-image"
              aria-hidden="true"
              style={{ backgroundImage: `url("${productPhotos}")`, backgroundPosition: imagePosition }}
            />
            <h2>{name}</h2>
            <p>{description}</p>
            <strong>{price}</strong>
          </article>
        ))}
      </div>
      <p><a href="/#leistungen">Zurück zu den Leistungen</a></p>
    </section>
  );
}
