import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ConferenceTransitionOverlay } from "../components/ConferenceTransitionOverlay"
import { useConferenceReveal } from "../context/ConferenceRevealContext"

/** One shared expansion curve; reveal follows the same curve after a chase lag */
const EXPAND_DURATION_MS = 640
const CHASE_LAG_MS = 200
/** Minimum pixel gap between black leading edge and reveal edge */
const CHASE_RING_GAP_PX = 240
const OUTER_RADIUS_PAD = 140
const INNER_RADIUS_PAD = 220
const REVEAL_FEATHER_PX = 4
/** No transparent center until the reveal hole is large enough (avoids white flash on the pill) */
const REVEAL_GRADIENT_MIN_INNER_PX = 36
/** Reveal must pass this far into the hero before entrance starts */
const HERO_REVEAL_LAG_PX = 64
const REDUCED_MOTION_FADE_MS = 160

/** Gentle ease-out — slower acceleration than quart, reads smoother on large radii */
const easeExpand = (t: number) => 1 - Math.pow(1 - t, 2.1)

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getHeroRevealPoint() {
  const hero =
    document.getElementById("conference-hero") ??
    document.getElementById("conference-hero-heading")
  if (!hero) return null

  const rect = hero.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height * 0.34,
  }
}

function getHeroRevealThreshold(revealX: number, revealY: number) {
  const hero =
    document.getElementById("conference-hero") ??
    document.getElementById("conference-hero-heading")
  if (!hero) return Number.POSITIVE_INFINITY

  const rect = hero.getBoundingClientRect()
  const probeX = rect.left + rect.width / 2
  const probeY = rect.top + rect.height * 0.34
  return Math.hypot(probeX - revealX, probeY - revealY) + HERO_REVEAL_LAG_PX
}

function applyOverlayStyles(
  layer: HTMLDivElement,
  options: {
    clipX: number
    clipY: number
    clipRadius: number
    fullScreenClip: boolean
    revealX: number
    revealY: number
    innerRadius: number
  },
) {
  const { clipX, clipY, clipRadius, fullScreenClip, revealX, revealY, innerRadius } =
    options

  if (fullScreenClip) {
    layer.style.clipPath = "none"
    layer.style.setProperty("-webkit-clip-path", "none")
  } else {
    const clip = `circle(${clipRadius}px at ${clipX}px ${clipY}px)`
    layer.style.clipPath = clip
    layer.style.setProperty("-webkit-clip-path", clip)
  }

  if (innerRadius < REVEAL_GRADIENT_MIN_INNER_PX) {
    layer.style.background = "var(--color-text)"
    return
  }

  const featherEnd = innerRadius + REVEAL_FEATHER_PX
  layer.style.background = `radial-gradient(circle at ${revealX}px ${revealY}px, transparent ${innerRadius}px, var(--color-text) ${featherEnd}px)`
}

function focusConferenceHero() {
  requestAnimationFrame(() => {
    const target = document.getElementById("conference-hero-heading")
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true })
    }
  })
}

export function useConferenceTransition() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { beginTransitionReveal, completeTransitionReveal, endTransitionEntrance } =
    useConferenceReveal()
  const [active, setActive] = useState(false)
  const layerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lockRef = useRef(false)
  const navigatedRef = useRef(false)

  const cancelAnimation = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const finishTransition = useCallback(
    (heroAlreadyRevealed: boolean) => {
      cancelAnimation()
      lockRef.current = false
      navigatedRef.current = false
      setActive(false)
      if (!heroAlreadyRevealed) {
        completeTransitionReveal()
      }
      endTransitionEntrance()
      focusConferenceHero()
    },
    [cancelAnimation, completeTransitionReveal, endTransitionEntrance],
  )

  useEffect(() => {
    return () => cancelAnimation()
  }, [cancelAnimation])

  useEffect(() => {
    if (lockRef.current) return
    cancelAnimation()
    setActive(false)
  }, [pathname, cancelAnimation])

  const prefetchConference = useCallback(() => {
    void import("../pages/ConferencePage")
  }, [])

  const startTransition = useCallback(
    (targetHref: string, originEl: HTMLElement) => {
      if (lockRef.current) return false

      const rect = originEl.getBoundingClientRect()
      const originX = rect.left + rect.width / 2
      const originY = rect.top + rect.height / 2
      const maxRadius = Math.hypot(
        Math.max(originX, window.innerWidth - originX),
        Math.max(originY, window.innerHeight - originY),
      )
      const outerEndRadius = maxRadius + OUTER_RADIUS_PAD
      const innerEndRadius = maxRadius + INNER_RADIUS_PAD
      const revealPhaseMs = EXPAND_DURATION_MS + CHASE_LAG_MS
      const navigateAtRadius = maxRadius + 6

      if (prefersReducedMotion()) {
        beginTransitionReveal()
        navigate(targetHref)
        window.setTimeout(() => {
          completeTransitionReveal()
          endTransitionEntrance()
          focusConferenceHero()
        }, REDUCED_MOTION_FADE_MS)
        return true
      }

      lockRef.current = true
      navigatedRef.current = false
      beginTransitionReveal()
      setActive(true)
      cancelAnimation()

      const startTime = performance.now()
      let revealStartTime: number | null = null
      let heroRevealed = false

      const tick = (now: number) => {
        const layer = layerRef.current
        if (!layer) {
          rafRef.current = window.requestAnimationFrame(tick)
          return
        }

        const elapsed = now - startTime
        const outerT = Math.min(elapsed / EXPAND_DURATION_MS, 1)
        const clipRadius = outerEndRadius * easeExpand(outerT)

        const navigated = navigatedRef.current
        const fullScreenBlack = navigated && clipRadius >= navigateAtRadius

        let innerRadius = 0
        let revealX = originX
        let revealY = originY

        if (navigated) {
          if (revealStartTime === null) {
            revealStartTime = now
          }

          const revealElapsed = now - revealStartTime
          const innerT = Math.min(
            Math.max(0, revealElapsed - CHASE_LAG_MS) / EXPAND_DURATION_MS,
            1,
          )
          const laggedInner = innerEndRadius * easeExpand(innerT)
          const gapCloseProgress = Math.max(0, Math.min(1, innerT - 0.84) / 0.16)
          const effectiveGap = CHASE_RING_GAP_PX * (1 - gapCloseProgress)
          const gapLimitedInner = Math.max(0, clipRadius - effectiveGap)
          innerRadius = Math.min(laggedInner, gapLimitedInner)

          const heroPoint = getHeroRevealPoint()
          if (heroPoint) {
            revealX = heroPoint.x
            revealY = heroPoint.y
          }
        }

        applyOverlayStyles(layer, {
          clipX: originX,
          clipY: originY,
          clipRadius,
          fullScreenClip: fullScreenBlack,
          revealX,
          revealY,
          innerRadius,
        })

        if (!navigated && clipRadius >= navigateAtRadius) {
          navigatedRef.current = true
          revealStartTime = now
          navigate(targetHref)
        }

        if (
          !heroRevealed &&
          navigated &&
          innerRadius >= getHeroRevealThreshold(revealX, revealY)
        ) {
          heroRevealed = true
          completeTransitionReveal()
        }

        const revealElapsed =
          revealStartTime === null ? 0 : now - revealStartTime
        const expandDone = navigated || elapsed >= EXPAND_DURATION_MS
        const revealDone = navigated && revealElapsed >= revealPhaseMs

        if (!expandDone || (navigated && !revealDone)) {
          rafRef.current = window.requestAnimationFrame(tick)
          return
        }

        finishTransition(heroRevealed)
      }

      requestAnimationFrame(() => {
        const layer = layerRef.current
        if (layer) {
          applyOverlayStyles(layer, {
            clipX: originX,
            clipY: originY,
            clipRadius: 0,
            fullScreenClip: false,
            revealX: originX,
            revealY: originY,
            innerRadius: 0,
          })
        }
        rafRef.current = window.requestAnimationFrame(tick)
      })

      return true
    },
    [
      beginTransitionReveal,
      cancelAnimation,
      completeTransitionReveal,
      endTransitionEntrance,
      finishTransition,
      navigate,
    ],
  )

  const overlay = <ConferenceTransitionOverlay ref={layerRef} active={active} />

  return {
    overlay,
    startTransition,
    prefetchConference,
    transitionLockRef: lockRef,
  }
}
