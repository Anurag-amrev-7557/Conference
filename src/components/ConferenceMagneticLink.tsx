import { useEffect, useRef, type ReactNode } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { cn } from "../lib/utils"

const MAGNETIC_STRENGTH = 0.32
const MAGNETIC_MAX_OFFSET = 11

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

type ConferenceMagneticLinkProps = Omit<LinkProps, "children"> & {
  className?: string
  children: ReactNode
  onZoneEnter?: () => void
}

export function ConferenceMagneticLink({
  className,
  children,
  onZoneEnter,
  ...linkProps
}: ConferenceMagneticLinkProps) {
  const innerRef = useRef<HTMLAnchorElement>(null)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
  }, [])

  const resetTransform = () => {
    const el = innerRef.current
    if (!el) return
    el.style.transform = ""
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = innerRef.current
    if (!el || reducedMotionRef.current) return

    const rect = el.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - rect.width / 2
    const offsetY = event.clientY - rect.top - rect.height / 2
    const x = clamp(offsetX * MAGNETIC_STRENGTH, -MAGNETIC_MAX_OFFSET, MAGNETIC_MAX_OFFSET)
    const y = clamp(offsetY * MAGNETIC_STRENGTH, -MAGNETIC_MAX_OFFSET, MAGNETIC_MAX_OFFSET)

    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  return (
    <div
      className="nav-conference-magnetic-zone"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTransform}
      onMouseEnter={onZoneEnter}
    >
      <Link
        ref={innerRef}
        className={cn(className)}
        onMouseDown={resetTransform}
        {...linkProps}
      >
        {children}
      </Link>
    </div>
  )
}
