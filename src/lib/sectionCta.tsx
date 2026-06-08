import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type SectionCtaFields = {
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  emptyStateTitle?: string
  emptyStateBody?: string
  emptyStateCtaLabel?: string
  emptyStateCtaHref?: string
}

export function resolveCtaHref(href: string | undefined, fallback: string): string {
  const trimmed = href?.trim()
  return trimmed || fallback
}

export function resolveCtaLabel(label: string | undefined, fallback: string): string {
  const trimmed = label?.trim()
  return trimmed || fallback
}

export function SectionCtaLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}
