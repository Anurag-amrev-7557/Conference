import type { ElementType, ReactNode } from 'react';
import { EditorialEyebrow } from './EditorialEyebrow';
import type { SectionBlockContent } from '../../lib/websiteData';
import { renderSectionHeading } from '../../lib/renderSectionTitle';
import { cn } from '../../lib/utils';

const HEADING_VARIANT_CLASS = {
  section: 'editorial-heading--section',
  showcase: 'editorial-heading--showcase',
  cta: 'editorial-heading--cta',
} as const;

export type EditorialSectionHeaderProps = {
  copy?: SectionBlockContent;
  fallback: ReactNode;
  /** When set, renders instead of `renderSectionHeading(copy, fallback)`. */
  title?: ReactNode;
  eyebrow?: string;
  eyebrowFallback?: string;
  lede?: string;
  ledeFallback?: string;
  centered?: boolean;
  className?: string;
  actions?: ReactNode;
  actionsClassName?: string;
  compactEyebrow?: boolean;
  ledeClassName?: string;
  titleClassName?: string;
  headingVariant?: keyof typeof HEADING_VARIANT_CLASS;
  headingAs?: 'h1' | 'h2';
  titleId?: string;
  eyebrowTheme?: 'light' | 'dark';
  eyebrowClassName?: string;
  eyebrowTextClassName?: string;
};

export function EditorialSectionHeader({
  copy,
  fallback,
  title,
  eyebrow,
  eyebrowFallback,
  lede,
  ledeFallback,
  centered = true,
  className,
  actions,
  actionsClassName,
  compactEyebrow = false,
  ledeClassName = '',
  titleClassName = '',
  headingVariant = 'section',
  headingAs = 'h2',
  titleId,
  eyebrowTheme = 'light',
  eyebrowClassName,
  eyebrowTextClassName,
}: EditorialSectionHeaderProps) {
  const ledeText = lede ?? copy?.lede?.trim() ?? ledeFallback;
  const eyebrowText = eyebrow ?? copy?.eyebrow?.trim() ?? eyebrowFallback;
  const Heading = headingAs as ElementType;
  const headingContent = title ?? renderSectionHeading(copy, fallback);

  return (
    <header className={className}>
      {eyebrowText ? (
        <EditorialEyebrow
          centered={centered}
          compactOnMobile={compactEyebrow}
          theme={eyebrowTheme}
          className={cn('mb-5', eyebrowClassName)}
          textClassName={eyebrowTextClassName}
        >
          {eyebrowText}
        </EditorialEyebrow>
      ) : null}

      <div className={centered ? undefined : 'max-w-4xl'}>
        <Heading
          id={titleId}
          className={cn(
            'editorial-heading',
            HEADING_VARIANT_CLASS[headingVariant],
            'mb-4 max-w-4xl',
            centered && 'mx-auto text-center',
            titleClassName,
          )}
        >
          {headingContent}
        </Heading>
        {ledeText ? (
          <p
            className={cn(
              'editorial-lede mt-0 max-w-2xl',
              centered && 'mx-auto text-center',
              ledeClassName,
            )}
          >
            {ledeText}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className={cn('conference-section__header-actions', actionsClassName)}>{actions}</div>
      ) : null}
    </header>
  );
}
