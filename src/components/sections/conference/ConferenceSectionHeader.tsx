import type { ReactNode } from 'react';
import type { ConferenceSectionCopy } from '../../../lib/websiteData';
import { EditorialSectionHeader } from '../../ui/EditorialSectionHeader';
import { cn } from '../../../lib/utils';

type ConferenceSectionHeaderProps = {
  copy?: ConferenceSectionCopy;
  fallback: ReactNode;
  lede?: string;
  ledeFallback?: string;
  centered?: boolean;
  className?: string;
  actions?: ReactNode;
  compactEyebrow?: boolean;
  ledeClassName?: string;
  titleClassName?: string;
};

export function ConferenceSectionHeader({
  copy,
  centered = true,
  className = '',
  ledeClassName = '',
  titleClassName = '',
  ...props
}: ConferenceSectionHeaderProps) {
  return (
    <EditorialSectionHeader
      copy={copy}
      centered={centered}
      headingVariant="section"
      headingAs="h2"
      eyebrow={copy?.eyebrow?.trim() || undefined}
      className={cn(
        'conference-section__header',
        centered && 'conference-section__header--center',
        className,
      )}
      titleClassName={cn('conference-section__title', titleClassName)}
      ledeClassName={cn('conference-section__lede', ledeClassName)}
      {...props}
    />
  );
}
