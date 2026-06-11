import { useRegistrationFormSettingsContext } from '../../context/RegistrationFormSettingsContext'
import { SectionWaveLabel } from '../ui/SectionWaveLabel'

function LogoWordmark({ label }: { label: string }) {
  return (
    <span className="book-demo-trust__logo" role="img" aria-label={`${label} logo`}>
      <span className="book-demo-trust__logo-mark" aria-hidden>
        {label}
      </span>
    </span>
  )
}

function LogoTrack({ logos, ariaHidden = false }: { logos: string[]; ariaHidden?: boolean }) {
  const items = [...logos, ...logos]
  return (
    <div className="book-demo-trust__track" aria-hidden={ariaHidden || undefined}>
      {items.map((name, i) => (
        <LogoWordmark key={`${name}-${i}`} label={name} />
      ))}
    </div>
  )
}

export function BookDemoTrustFooter() {
  const form = useRegistrationFormSettingsContext()
  const logos = form.trustFooter.logos

  return (
    <footer className="book-demo-trust" aria-labelledby="book-demo-trust-heading">
      <div className="book-demo-trust__intro">
        <SectionWaveLabel
          label={form.trustFooter.eyebrow}
          waves="both"
          theme="dark"
          variant="plain"
          className="book-demo-trust__wave-label"
          textClassName="book-demo-trust__wave-text"
        />
        <p id="book-demo-trust-heading" className="book-demo-trust__title">
          {form.trustFooter.title}
        </p>
      </div>

      {logos.length > 0 ? (
        <div className="book-demo-trust__marquee" role="region" aria-label="Partner logos">
          <div className="book-demo-trust__fade book-demo-trust__fade--left" />
          <div className="book-demo-trust__fade book-demo-trust__fade--right" />
          <div className="book-demo-trust__viewport">
            <LogoTrack logos={logos} />
          </div>
        </div>
      ) : null}
    </footer>
  )
}
