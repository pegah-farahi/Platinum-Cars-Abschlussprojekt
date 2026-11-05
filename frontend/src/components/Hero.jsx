import './Hero.css'
function Hero() {
  return (
    <section className="site-hero" id="start">
      <div className="hero-content">
        <p className="hero-label">PLATINUM CARS · SOLINGEN</p>

        <h1>
          Dein nächstes Auto
          <br />
          wartet auf dich.
        </h1>

        <p className="hero-description">
          Entdecke unsere Gebrauchtwagen und frage deinen
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
