import type { ReactNode } from 'react';
import type { CatalogHeroContent, SectionBlockContent } from './websiteData';

export function renderCatalogTitle(
  content: CatalogHeroContent | undefined,
  fallback: ReactNode,
): ReactNode {
  return normalizeSplitTitle(content?.title, content?.titleAccent) ?? fallback;
}

function normalizeSplitTitle(
  title: string | undefined,
  titleAccent: string | undefined,
): ReactNode | null {
  const primary = title?.trim();
  const accent = titleAccent?.trim();
  if (!primary && !accent) return null;
  if (!primary) return <span className="editorial-accent">{accent}</span>;
  if (!accent) return primary;
  if (primary.toLowerCase() === accent.toLowerCase()) {
    return <span className="editorial-accent">{accent}</span>;
  }
  const primaryLower = primary.toLowerCase();
  const accentLower = accent.toLowerCase();
  if (primaryLower.endsWith(accentLower)) {
    const splitAt = primaryLower.lastIndexOf(accentLower);
    if (splitAt > 0) {
      return (
        <>
          {primary.slice(0, splitAt).trimEnd()}{' '}
          <span className="editorial-accent">{primary.slice(splitAt)}</span>
        </>
      );
    }
  }
  return (
    <>
      {primary} <span className="editorial-accent">{accent}</span>
    </>
  );
}

/** Renders title + accent inline so the heading stays on one line when space allows and wraps when it does not. */
export function renderSectionHeading(
  content: SectionBlockContent | undefined,
  fallback: ReactNode,
): ReactNode {
  return normalizeSplitTitle(content?.title, content?.titleAccent) ?? fallback;
}
