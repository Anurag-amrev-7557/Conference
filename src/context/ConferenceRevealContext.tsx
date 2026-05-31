import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ConferenceRevealContextValue = {
  heroRevealReady: boolean
  /** Shorter hero stagger when entering via homepage iris transition */
  heroEntranceFast: boolean
  beginTransitionReveal: () => void
  completeTransitionReveal: () => void
  endTransitionEntrance: () => void
}

const ConferenceRevealContext = createContext<ConferenceRevealContextValue | null>(
  null,
)

export function ConferenceRevealProvider({ children }: { children: ReactNode }) {
  const [heroRevealReady, setHeroRevealReady] = useState(true)
  const [heroEntranceFast, setHeroEntranceFast] = useState(false)

  const beginTransitionReveal = useCallback(() => {
    setHeroEntranceFast(true)
    setHeroRevealReady(false)
  }, [])

  const completeTransitionReveal = useCallback(() => {
    setHeroRevealReady(true)
  }, [])

  const endTransitionEntrance = useCallback(() => {
    setHeroEntranceFast(false)
  }, [])

  const value = useMemo(
    () => ({
      heroRevealReady,
      heroEntranceFast,
      beginTransitionReveal,
      completeTransitionReveal,
      endTransitionEntrance,
    }),
    [
      heroRevealReady,
      heroEntranceFast,
      beginTransitionReveal,
      completeTransitionReveal,
      endTransitionEntrance,
    ],
  )

  return (
    <ConferenceRevealContext.Provider value={value}>
      {children}
    </ConferenceRevealContext.Provider>
  )
}

export function useConferenceReveal() {
  const ctx = useContext(ConferenceRevealContext)
  if (!ctx) {
    throw new Error("useConferenceReveal must be used within ConferenceRevealProvider")
  }
  return ctx
}
