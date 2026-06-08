import type { CSSProperties } from 'react'
import type { ConferenceLogo } from '../../../lib/websiteData'
import { resolveAssetUrl } from '../../../lib/assetUrl'
import { cn } from '../../../lib/utils'
import { SponsorMonogram } from './SponsorMonogram'

type SponsorLogoTileProps = {
  logo: ConferenceLogo
  variant?: 'featured' | 'standard' | 'compact'
  index?: number
  className?: string
  decorative?: boolean
  'aria-hidden'?: boolean
}

export function SponsorLogoTile({
  logo,
  variant = 'standard',
  index = 0,
  className,
  decorative = false,
  'aria-hidden': ariaHidden,
}: SponsorLogoTileProps) {
  const hasImage = Boolean(logo.logoUrl?.trim())
  const website = decorative ? '' : logo.websiteUrl?.trim()

  const visual = hasImage ? (
    <img
      src={resolveAssetUrl(logo.logoUrl!)}
      alt={logo.logoAlt || logo.name}
      className={cn(
        'conference-sponsor-logo__img',
        variant === 'featured' && 'conference-sponsor-logo__img--featured',
        variant === 'compact' && 'conference-sponsor-logo__img--compact',
      )}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <SponsorMonogram
      name={logo.name}
      variant={variant === 'compact' ? 'compact' : variant}
      showName={variant !== 'compact'}
    />
  )

  const content = website ? (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="conference-sponsor-logo__link"
      aria-label={`Visit ${logo.name} website`}
    >
      {visual}
    </a>
  ) : (
    visual
  )

  return (
    <li
      className={cn(
        'conference-sponsor-logo',
        variant === 'featured' && 'conference-sponsor-logo--featured',
        variant === 'compact' && 'conference-sponsor-logo--compact',
        className,
      )}
      style={{ '--sponsor-i': index } as CSSProperties}
      aria-hidden={ariaHidden || undefined}
    >
      {logo.tier?.trim() && variant === 'featured' ? (
        <span className="conference-sponsor-logo__tier">{logo.tier.trim()}</span>
      ) : null}
      {content}
    </li>
  )
}
