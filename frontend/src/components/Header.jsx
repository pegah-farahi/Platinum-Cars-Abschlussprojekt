import "./Header.css";
import logo from "../assets/platinum-cars-logo.webp";

function Header() {
  return (
    <header className="site-header">
      <a className="site-brand" href="/">
        <img src={logo} alt="Platinum Cars – Startseite" />
      </a>

      <nav className="site-nav" aria-label="Hauptnavigation">
        <a href="/">Startseite</a>
        <a href="/fahrzeuge">Fahrzeuge</a>
        <details
          className="services-menu"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") event.currentTarget.open = true;
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse" && !event.currentTarget.querySelector(".services-menu-links :focus")) {
              event.currentTarget.open = false;
            }
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(":hover")) {
              event.currentTarget.open = false;
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && event.currentTarget.open) {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary").focus();
            }
          }}
        >
          <summary>Leistungen</summary>
          <div className="services-menu-links">
            <a href="/werkstatt" onClick={(event) => {
              event.currentTarget.closest("details").open = false;
            }}>Fahrzeugaufbereitung &amp; Reparatur</a>
            <a href="/shop">Online-Shop (Vorschau)</a>
          </div>
        </details>
        <a href="/#kontakt">Kontakt</a>
      </nav>
    </header>
  );
}

export default Header;
