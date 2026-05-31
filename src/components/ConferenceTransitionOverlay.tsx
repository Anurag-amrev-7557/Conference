import { forwardRef } from "react"

type ConferenceTransitionOverlayProps = {
  active: boolean
}

export const ConferenceTransitionOverlay = forwardRef<
  HTMLDivElement,
  ConferenceTransitionOverlayProps
>(function ConferenceTransitionOverlay({ active }, ref) {
  if (!active) return null

  return (
    <div className="fixed inset-0 z-[190] pointer-events-none" aria-hidden>
      <div
        ref={ref}
        className="absolute inset-0 will-change-[clip-path,background]"
      />
    </div>
  )
})
