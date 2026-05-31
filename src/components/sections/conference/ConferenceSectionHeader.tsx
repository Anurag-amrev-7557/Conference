import type { ReactNode } from 'react'
import type { ConferenceSectionCopy } from '../../../lib/websiteData'
import { renderSectionHeading } from '../../../lib/renderSectionTitle'

type ConferenceSectionHeaderProps = {
  copy?: ConferenceSectionCopy
  fallback: ReactNode
  lede?: string
  ledeFallback?: string
  centered?: boolean
  className?: string
  actions?: ReactNode
}

export function ConferenceSectionHeader({
  copy,
  fallback,
  lede,
  ledeFallback,
  centered = true,
  className = '',
  actions,
}: ConferenceSectionHeaderProps) {
  const ledeText = lede ?? copy?.lede?.trim() ?? ledeFallback

  return (
    <header
      className={`conference-section__header ${centered ? 'conference-section__header--center' : ''} ${className}`.trim()}
    >
      {copy?.eyebrow?.trim() && (
        <div className={`editorial-eyebrow ${centered ? 'editorial-eyebrow--center' : ''} mb-6 sm:mb-7`}>
          <span className="editorial-eyebrow__rule" aria-hidden />
          <span className="section-eyebrow !mb-0 text-muted">{copy.eyebrow}</span>
          <span className="editorial-eyebrow__rule" aria-hidden />
        </div>
      )}

      <div className={centered ? '' : 'max-w-3xl'}>
        <h2
          className={`editorial-heading editorial-heading--section conference-section__title mb-6 sm:mb-8 max-w-3xl ${centered ? 'mx-auto' : ''}`.trim()}
        >
          {renderSectionHeading(copy, fallback, { singleLine: true })}
        </h2>
        {ledeText ? <p className="editorial-lede max-w-2xl mx-auto">{ledeText}</p> : null}
      </div>

      {actions ? <div className="conference-section__header-actions">{actions}</div> : null}
    </header>
  )
}
