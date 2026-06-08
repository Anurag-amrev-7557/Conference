import type { ReactNode } from 'react'
import { EditorialEyebrow } from '../../ui/EditorialEyebrow'
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
  compactEyebrow?: boolean
  ledeClassName?: string
  titleClassName?: string
}

export function ConferenceSectionHeader({
  copy,
  fallback,
  lede,
  ledeFallback,
  centered = true,
  className = '',
  actions,
  compactEyebrow = false,
  ledeClassName = '',
  titleClassName = '',
}: ConferenceSectionHeaderProps) {
  const ledeText = lede ?? copy?.lede?.trim() ?? ledeFallback

  return (
    <header
      className={`conference-section__header ${centered ? 'conference-section__header--center' : ''} ${className}`.trim()}
    >
      {copy?.eyebrow?.trim() && (
        <EditorialEyebrow
          centered={centered}
          compactOnMobile={compactEyebrow}
          className="mb-6"
        >
          {copy.eyebrow}
        </EditorialEyebrow>
      )}

      <div className={centered ? '' : 'max-w-4xl'}>
        <h2
          className={`editorial-heading editorial-heading--section conference-section__title mb-6 max-w-4xl ${centered ? 'mx-auto' : ''} ${titleClassName}`.trim()}
        >
          {renderSectionHeading(copy, fallback)}
        </h2>
        {ledeText ? (
          <p className={`editorial-lede conference-section__lede max-w-2xl mx-auto ${ledeClassName}`.trim()}>
            {ledeText}
          </p>
        ) : null}
      </div>

      {actions ? <div className="conference-section__header-actions">{actions}</div> : null}
    </header>
  )
}
