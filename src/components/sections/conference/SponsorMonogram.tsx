import type { CSSProperties } from 'react'
import { cn } from '../../../lib/utils'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function hashHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

type SponsorMonogramProps = {
  name: string
  variant?: 'featured' | 'standard' | 'compact'
  showName?: boolean
  className?: string
}

export function SponsorMonogram({
  name,
  variant = 'standard',
  showName = true,
  className,
}: SponsorMonogramProps) {
  const initials = getInitials(name)
  const hue = hashHue(name)

  return (
    <span
      className={cn(
        'conference-sponsor-monogram',
        variant === 'featured' && 'conference-sponsor-monogram--featured',
        variant === 'compact' && 'conference-sponsor-monogram--compact',
        className,
      )}
      style={{ '--sponsor-hue': hue } as CSSProperties}
    >
      <span className="conference-sponsor-monogram__mark" aria-hidden>
        {initials}
      </span>
      {showName ? <span className="conference-sponsor-monogram__name">{name}</span> : null}
    </span>
  )
}
