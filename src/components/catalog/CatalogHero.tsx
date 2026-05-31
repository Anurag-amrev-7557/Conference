import type { ReactNode } from "react"

interface CatalogHeroProps {
  eyebrow: string
  title: ReactNode
  lede: string
}

export function CatalogHero({ eyebrow, title, lede }: CatalogHeroProps) {
  return (
    <header className="catalog-hero premium-catalog-hero">
      <div className="catalog-hero__pattern" aria-hidden />
      <div className="catalog-hero__glow" aria-hidden />
      <div className="catalog-hero__inner">
        <span className="catalog-hero__eyebrow">{eyebrow}</span>
        <h1 className="catalog-hero__title">{title}</h1>
        <p className="catalog-hero__lede">{lede}</p>
      </div>
    </header>
  )
}
