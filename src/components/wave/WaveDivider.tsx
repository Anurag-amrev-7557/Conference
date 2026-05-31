import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { buildWavePath, WAVE_ACCENT } from '../../lib/waveMath'

type WaveDividerProps = {
  className?: string
  variant?: 'light' | 'dark'
}

export function WaveDivider({ className, variant = 'light' }: WaveDividerProps) {
  const gradId = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [width, setWidth] = useState(1200)
  const [phase, setPhase] = useState(0)
  const [drawn, setDrawn] = useState(false)

  const h = 40
  const amp = 6
  const wavelength = 120
  const d = buildWavePath(width, h, phase, amp, wavelength, 2)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, Math.floor(entry.contentRect.width)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setDrawn(true)
      },
      { threshold: 0.2 },
    )
    obs.observe(el)

    if (reduced) return () => obs.disconnect()

    let raf = 0
    const tick = () => {
      setPhase((p) => p + 0.04)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className={cn(
        'wave-divider',
        `wave-divider--${variant}`,
        drawn && 'wave-divider--visible',
        className,
      )}
      aria-hidden
    >
      <svg className="wave-divider__svg" viewBox={`0 0 ${width} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`wave-divider-grad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {variant === 'dark' ? (
              <>
                <stop offset="0%" stopColor="transparent" />
                <stop offset="18%" stopColor="#003E99" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#7eb3ff" stopOpacity="0.75" />
                <stop offset="82%" stopColor="#003E99" stopOpacity="0.45" />
                <stop offset="100%" stopColor="transparent" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="transparent" />
                <stop offset="15%" stopColor="#a5b4fc" stopOpacity="0.5" />
                <stop offset="50%" stopColor={WAVE_ACCENT} stopOpacity="0.85" />
                <stop offset="85%" stopColor="#a5b4fc" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" />
              </>
            )}
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          className="wave-divider__path"
          d={d}
          fill="none"
          stroke={`url(#wave-divider-grad-${gradId})`}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
