import { useId, useMemo, useState, type CSSProperties } from 'react'
import { Pause, Play } from 'lucide-react'
import type { ConferenceLogo } from '../../../lib/websiteData'
import { repeatForMarquee } from '../../../lib/partitionSponsors'
import { SponsorLogoTile } from './SponsorLogoTile'

type SponsorsMarqueeProps = {
  logos: ConferenceLogo[]
}

export function SponsorsMarquee({ logos }: SponsorsMarqueeProps) {
  const controlId = useId()
  const [paused, setPaused] = useState(false)

  const row = useMemo(() => repeatForMarquee(logos, Math.max(14, logos.length * 2)), [logos])

  if (row.length === 0) return null

  const durationSec = Math.max(36, row.length * 3.25)

  return (
    <div
      className={`conference-sponsors-marquee${paused ? ' conference-sponsors-marquee--paused' : ''}`}
      style={{ '--marquee-duration': `${durationSec}s` } as CSSProperties}
    >
      <div className="conference-sponsors-marquee__toolbar">
        <button
          type="button"
          id={controlId}
          className="conference-sponsors-marquee__control"
          aria-pressed={paused}
          aria-label={paused ? 'Play sponsor scroll' : 'Pause sponsor scroll'}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
          <span className="conference-sponsors-marquee__control-text">
            {paused ? 'Play' : 'Pause'}
          </span>
        </button>
      </div>

      <div
        className="conference-sponsors-marquee__viewport"
        aria-label="Sponsor logos"
        aria-labelledby={controlId}
      >
        <ul className="conference-sponsors-marquee__track list-none p-0 m-0">
          {row.map((logo, idx) => (
            <SponsorLogoTile key={`${logo.id}-a-${idx}`} logo={logo} variant="compact" index={idx} />
          ))}
          {row.map((logo, idx) => (
            <SponsorLogoTile
              key={`${logo.id}-b-${idx}`}
              logo={logo}
              variant="compact"
              index={idx}
              decorative
              className="conference-sponsor-logo--duplicate"
              aria-hidden={true}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
