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
          <span className="editorial-accent">{content.titleAccent}</span>
        </>
      ) : null}
    </>
  )
}

/** Renders title + accent inline so the heading stays on one line when space allows and wraps when it does not. */
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
          {' '}
          <span className="editorial-accent">{content.titleAccent}</span>
        </>
      ) : null}
    </>
  )
}
