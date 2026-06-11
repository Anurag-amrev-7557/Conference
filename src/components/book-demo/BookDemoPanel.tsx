import { CalendarDays, Mic2, Users } from 'lucide-react'
import { useRegistrationFormSettingsContext } from '../../context/RegistrationFormSettingsContext'
import { SectionWaveLabel } from '../ui/SectionWaveLabel'

const statIcons = [Users, Mic2, CalendarDays] as const

export function BookDemoPanel() {
  const form = useRegistrationFormSettingsContext()
  const quote = form.panelQuote

  return (
    <div className="book-demo-panel">
      <div className="book-demo-panel__inner">
        <SectionWaveLabel
          label={form.panelEyebrow}
          waves="both"
          theme="dark"
          variant="pill"
          className="book-demo-wave-label"
          textClassName="book-demo-wave-label__text"
        />

        <h1 id="book-demo-heading" className="book-demo-panel__title">
          <span className="book-demo-panel__title-line">{form.panelHeadline}</span>
          {form.panelHeadlineAccent ? (
            <span className="book-demo-panel__title-accent">{form.panelHeadlineAccent}</span>
          ) : null}
        </h1>

        <p className="book-demo-panel__lead">{form.panelLede}</p>

        {form.panelStats.length > 0 ? (
          <ul className="book-demo-stats">
            {form.panelStats.map((point, index) => {
              const Icon = statIcons[index] ?? Users
              return (
                <li key={point.label} className="book-demo-stat-card">
                  <span className="book-demo-stat-card__icon" aria-hidden>
                    <Icon strokeWidth={1.75} />
                  </span>
                  <span className="book-demo-stat-card__value">{point.value}</span>
                  <span className="book-demo-stat-card__label">{point.label}</span>
                </li>
              )
            })}
          </ul>
        ) : null}

        <figure className="book-demo-quote-card">
          <span className="book-demo-quote-card__mark" aria-hidden>
            &ldquo;
          </span>
          <blockquote className="book-demo-quote-card__quote">
            <p>{quote.quote}</p>
          </blockquote>
          <figcaption className="book-demo-quote-card__author">
            <span className="book-demo-quote-card__avatar" aria-hidden>
              {quote.initials}
            </span>
            <span className="book-demo-quote-card__meta">
              <span className="book-demo-quote-card__name">{quote.name}</span>
              <span className="book-demo-quote-card__role">{quote.role}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
