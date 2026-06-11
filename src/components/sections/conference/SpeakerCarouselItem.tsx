import type { CSSProperties, ReactNode } from 'react';
import { useSpeakerCarouselReveal } from '../../../hooks/useSpeakerCarouselReveal';
import { cn } from '../../../lib/utils';
import { SectionCarouselItem } from '../SectionCarousel';

type SpeakerCarouselItemProps = {
  itemIndex: number;
  instant?: boolean;
  children: ReactNode;
};

export function SpeakerCarouselItem({
  itemIndex,
  instant = false,
  children,
}: SpeakerCarouselItemProps) {
  const { ref, phase, onTransitionEnd } = useSpeakerCarouselReveal(instant);

  return (
    <SectionCarouselItem
      ref={ref}
      className={cn(
        'speaker-card-item',
        instant && 'speaker-card-item--instant',
        phase === 'animating' && 'speaker-card-item--animating',
        phase === 'done' && 'speaker-card-item--entered',
      )}
      style={{ '--speaker-i': itemIndex } as CSSProperties}
      onTransitionEnd={onTransitionEnd}
    >
      {children}
    </SectionCarouselItem>
  );
}
