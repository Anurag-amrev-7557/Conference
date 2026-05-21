import type { ReactNode } from 'react'
import type { CatalogHeroContent, SectionBlockContent } from './websiteData'

export function renderCatalogTitle(
  content: CatalogHeroContent | undefined,
  fallback: ReactNode,
): ReactNode {
  if (!content?.title && !content?.titleAccent) return fallback
  return (
    <>
      {content.title}
      {content.titleAccent ? (
        <>
          {' '}
          <em>{content.titleAccent}</em>
        </>
      ) : null}
    </>
  )
}

export function renderSectionHeading(
  content: SectionBlockContent | undefined,
  fallback: ReactNode,
): ReactNode {
  if (!content?.title && !content?.titleAccent) return fallback
  return (
    <>
      {content.title}
      {content.titleAccent ? (
        <>
          <br />
          <span className="italic editorial-accent">{content.titleAccent}</span>
        </>
      ) : null}
    </>
  )
}
