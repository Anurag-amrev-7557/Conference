import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

const W = 56
const H = 18
const CY = H / 2
const AMP = 3.75
const WAVELENGTH = 18
const WAVE_STROKE = '#52525b'
const WAVE_WIDTH = 1.75
const PHASE_SPEED = 0.095

type WaveCanvasProps = {
  flip?: boolean
  className?: string
  theme?: 'light' | 'dark'
}

export function WaveCanvas({ flip = false, className, theme = 'light' }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phase = 0
    let raf = 0
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const setupSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, W, H)
      ctx.clip()

      ctx.beginPath()
      const step = 0.3
      for (let x = 0; x <= W; x += step) {
        const y = CY + AMP * Math.sin((2 * Math.PI * x) / WAVELENGTH + phase)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      const stroke = ctx.createLinearGradient(0, 0, W, 0)
      if (theme === 'dark') {
        stroke.addColorStop(0, '#003E99')
        stroke.addColorStop(0.4, '#7eb3ff')
        stroke.addColorStop(1, '#a1a1aa')
      } else {
        stroke.addColorStop(0, '#003E99')
        stroke.addColorStop(0.45, '#002D70')
        stroke.addColorStop(1, WAVE_STROKE)
      }
      ctx.strokeStyle = stroke
      ctx.lineWidth = WAVE_WIDTH
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()
    }

    const tick = () => {
      drawFrame()
      if (!reducedMotion) {
        phase += PHASE_SPEED
        raf = requestAnimationFrame(tick)
      }
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches
      cancelAnimationFrame(raf)
      phase = 0
      tick()
    }

    setupSize()
    tick()

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', onMotionChange)

    return () => {
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', onMotionChange)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className={cn('hero-eyebrow-wave shrink-0', flip && '-scale-x-100', className)}
      width={W}
      height={H}
      aria-hidden
    />
  )
}
