import './PriceRange.css'

function PriceRange({
  minimum,
  maximum,
  limit,
  onMinimumChange,
  onMaximumChange,
}) {
  const formatPrice = (value) =>
    new Intl.NumberFormat('de-DE').format(value)

  const left = (minimum / limit) * 100
  const right = (maximum / limit) * 100

  return (
    <fieldset className="price-range">
      <legend>Preis:</legend>

      <div className="price-range-slider">
        <div className="price-range-track" />

        <div
          className="price-range-selected"
          style={{
            left: `${left}%`,
            width: `${right - left}%`,
          }}
        />

        <input
          type="range"
          aria-label="Mindestpreis"
          aria-valuetext={`${formatPrice(minimum)} Euro`}
          min="0"
          max={limit}
          step="100"
          value={minimum}
          onChange={(event) => {
            onMinimumChange(
              Math.min(Number(event.target.value), maximum - 100)
            )
          }}
        />

        <input
          type="range"
          aria-label="Höchstpreis"
          aria-valuetext={`${formatPrice(maximum)} Euro`}
          min="0"
          max={limit}
          step="100"
          value={maximum}
          onChange={(event) => {
            onMaximumChange(
              Math.max(Number(event.target.value), minimum + 100)
            )
          }}
        />
      </div>

      <div className="price-range-values">
        <span>ab {formatPrice(minimum)} €</span>
        <span>bis {formatPrice(maximum)} €</span>
      </div>
    </fieldset>
  )
}

export default PriceRange