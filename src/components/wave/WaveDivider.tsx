import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { buildWavePath, WAVE_ACCENT } from '../../lib/waveMath'

type WaveDividerProps = {
  className?: string
  variant?: 'light' | 'dark'
}

const H = 40
const AMP = 6
const WAVELENGTH = 120

export function WaveDivider({ className, variant = 'light' }: WaveDividerProps) {
  const gradId = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const phaseRef = useRef(0)
  const widthRef = useRef(1200)
  const animatingRef = useRef(false)
  const [width, setWidth] = useState(1200)
  const [drawn, setDrawn] = useState(false)

  const applyPath = (nextWidth: number, phase: number) => {
    pathRef.current?.setAttribute(
      'd',
      buildWavePath(nextWidth, H, phase, AMP, WAVELENGTH, 2),
    )
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => {
      const nextWidth = Math.max(320, Math.floor(entry.contentRect.width))
      widthRef.current = nextWidth
      setWidth(nextWidth)
      applyPath(nextWidth, phaseRef.current)
    })
    ro.observe(el)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    applyPath(widthRef.current, phaseRef.current)

    let raf = 0
    const tick = () => {
      if (!animatingRef.current) {
        raf = 0
        return
      }
      phaseRef.current += 0.04
      applyPath(widthRef.current, phaseRef.current)
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (reduced || raf) return
      animatingRef.current = true
      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      animatingRef.current = false
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true)
          start()
        } else {
          stop()
        }
      },
      { threshold: 0.05 },
    )
    obs.observe(el)

    return () => {
      stop()
      obs.disconnect()
      ro.disconnect()
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
      <svg className="wave-divider__svg" viewBox={`0 0 ${width} ${H}`} preserveAspectRatio="none">
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
          d={buildWavePath(width, H, 0, AMP, WAVELENGTH, 2)}
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
