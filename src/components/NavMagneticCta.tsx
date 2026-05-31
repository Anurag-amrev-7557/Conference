import { useEffect, useRef, type MouseEvent } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"

const MAGNETIC_STRENGTH = 0.3
const MAGNETIC_MAX_OFFSET = 9
const LERP_FOLLOW = 0.14
const LERP_RETURN = 0.11
const SETTLE_THRESHOLD = 0.04

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor
}

function magneticTarget(clientX: number, clientY: number, rect: DOMRect) {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = clientX - centerX
  const dy = clientY - centerY

  const norm = Math.hypot(dx / (rect.width * 0.5), dy / (rect.height * 0.5))
  const falloff = 1 / (1 + norm * norm * 0.4)

  return {
    x: clamp(dx * MAGNETIC_STRENGTH * falloff, -MAGNETIC_MAX_OFFSET, MAGNETIC_MAX_OFFSET),
    y: clamp(dy * MAGNETIC_STRENGTH * falloff, -MAGNETIC_MAX_OFFSET, MAGNETIC_MAX_OFFSET),
  }
}

type NavMagneticCtaProps = {
  label: string
  className?: string
  magnetic?: boolean
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
} & (
  | ({ to: string; href?: never } & Omit<LinkProps, "children" | "className" | "to" | "onClick">)
  | ({ href: string; to?: never } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      "children" | "className" | "href" | "onClick"
    >)
)

function NavCtaContent({ label }: { label: string }) {
  return (
    <>
      <span className="btn-nav-cta__label">{label}</span>
      <span className="btn-nav-cta__icon btn-nav-cta__icon--trail" aria-hidden>
        <ArrowRight className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.25} />
      </span>
    </>
  )
}

export function NavMagneticCta({
  label,
  className,
  magnetic = true,
  onClick,
  to,
  href,
  ...rest
}: NavMagneticCtaProps) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const translateRef = useRef<HTMLDivElement>(null)
  const reducedMotionRef = useRef(false)
  const activeRef = useRef(false)
  const rafRef = useRef(0)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const applyTransform = (x: number, y: number) => {
    const el = translateRef.current
    if (!el) return
    if (Math.abs(x) < SETTLE_THRESHOLD && Math.abs(y) < SETTLE_THRESHOLD) {
      el.style.transform = ""
      return
    }
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  const tick = () => {
    const factor = activeRef.current ? LERP_FOLLOW : LERP_RETURN
    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, factor)
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, factor)

    applyTransform(currentRef.current.x, currentRef.current.y)

    const settled =
      !activeRef.current &&
      Math.abs(currentRef.current.x) < SETTLE_THRESHOLD &&
      Math.abs(currentRef.current.y) < SETTLE_THRESHOLD

    if (settled) {
      currentRef.current = { x: 0, y: 0 }
      targetRef.current = { x: 0, y: 0 }
      applyTransform(0, 0)
      rafRef.current = 0
      return
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  const startLoop = () => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  const resetMagnetic = () => {
    activeRef.current = false
    targetRef.current = { x: 0, y: 0 }
    startLoop()
  }

  const snapMagnetic = () => {
    activeRef.current = false
    targetRef.current = { x: 0, y: 0 }
    currentRef.current = { x: 0, y: 0 }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    applyTransform(0, 0)
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const zone = zoneRef.current
    if (!zone || !magnetic || reducedMotionRef.current) return

    const next = magneticTarget(event.clientX, event.clientY, zone.getBoundingClientRect())
    targetRef.current = next
    activeRef.current = true
    startLoop()
  }

  const linkProps = {
    className: cn("btn-nav-cta", className),
    onClick,
    onMouseDown: snapMagnetic,
    ...rest,
  }

  const button =
    to != null ? (
      <Link to={to} {...linkProps}>
        <NavCtaContent label={label} />
      </Link>
    ) : (
      <a href={href} {...linkProps}>
        <NavCtaContent label={label} />
      </a>
    )

  if (!magnetic) {
    return button
  }

  return (
    <div
      ref={zoneRef}
      className="nav-cta-magnetic-zone"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMagnetic}
    >
      <div ref={translateRef} className="nav-cta-magnetic-inner">
        {button}
      </div>
    </div>
  )
}
