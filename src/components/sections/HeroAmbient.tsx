/** Decorative hero background — CSS only, no JS animation libs (LCP-safe). */
export function HeroAmbient() {
  return (
    <div className="hero-ambient" aria-hidden>
      <div className="hero-ambient-grid" />
      <div className="hero-ambient-orb hero-ambient-orb--1" />
      <div className="hero-ambient-orb hero-ambient-orb--2" />
    </div>
  )
}
