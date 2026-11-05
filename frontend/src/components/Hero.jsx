import './Hero.css'
function Hero() {
  return (
    <section className="site-hero" id="start">
      <div className="hero-content">
        <p className="hero-label">PLATINUM CARS · SOLINGEN</p>

        <h1>
          Ihr nächstes Auto
          <br />
          wartet auf Sie.
        </h1>

        <p className="hero-description">
          Entdecken Sie unsere Gebrauchtwagen und fragen Sie Ihren
          Besichtigungstermin direkt online an.
        </p>

        <a className="hero-button" href="/fahrzeuge">
          Fahrzeuge ansehen
        </a>
      </div>
    </section>
  )
}

export default Hero