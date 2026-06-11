import type { ReactNode } from 'react';
import { EditorialSectionHeader } from '../ui/EditorialSectionHeader';

interface CatalogHeroProps {
  eyebrow: string;
  title: ReactNode;
  lede: string;
}

export function CatalogHero({ eyebrow, title, lede }: CatalogHeroProps) {
  return (
    <header className="catalog-hero premium-catalog-hero">
      <div className="catalog-hero__pattern" aria-hidden />
      <div className="catalog-hero__glow" aria-hidden />
      <div className="catalog-hero__inner">
        <EditorialSectionHeader
          eyebrow={eyebrow}
          title={title}
          fallback={title}
          lede={lede}
          centered
          headingAs="h1"
          headingVariant="section"
          className="catalog-hero__header"
          eyebrowClassName="catalog-hero__eyebrow"
          titleClassName="catalog-hero__title"
          ledeClassName="catalog-hero__lede"
        />
      </div>
    </header>
  );
}
