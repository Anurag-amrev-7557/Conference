import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TransitionEvent,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type SectionCarouselProps = {
  ariaLabel: string;
  variant?: 'speakers' | 'articles' | 'events';
  trackClassName?: string;
  showScrollHints?: boolean;
  children: ReactNode;
};

type SectionCarouselItemProps = {
  className?: string;
  style?: CSSProperties;
  onTransitionEnd?: (event: TransitionEvent<HTMLLIElement>) => void;
  children: ReactNode;
};

export function SectionCarousel({
  ariaLabel,
  variant,
  trackClassName,
  showScrollHints = false,
  children,
}: SectionCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [fitsInView, setFitsInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = Children.count(children);

  const getScrollStep = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return 0;

    const firstItem = viewport.querySelector<HTMLElement>('.section-carousel__item');
    const track = viewport.querySelector<HTMLElement>('.section-carousel__track');
    const gap = track
      ? Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16
      : 16;

    return firstItem ? firstItem.offsetWidth + gap : viewport.clientWidth * 0.86;
  }, []);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollLeft, scrollWidth, clientWidth } = viewport;
    const allCardsFit = scrollWidth > 0 && scrollWidth <= clientWidth + 8;
    setFitsInView(allCardsFit);

    if (allCardsFit) {
      if (scrollLeft !== 0) {
        viewport.scrollLeft = 0;
      }
      setCanScrollPrev(false);
      setCanScrollNext(false);
      setActiveIndex(0);
      return;
    }

    const atStart = scrollLeft <= 8;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 8;
    setCanScrollPrev(!atStart);
    setCanScrollNext(!atEnd);

    const items = viewport.querySelectorAll<HTMLElement>('.section-carousel__item');
    if (items.length === 0) return;

    const viewportCenter = scrollLeft + clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(itemCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (viewport.scrollLeft > 0 && viewport.scrollLeft <= 8) {
      viewport.scrollLeft = 0;
    }
    const raf = requestAnimationFrame(() => updateScrollState());

    viewport.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);

    const track = viewport.querySelector('.section-carousel__track');
    if (track) resizeObserver.observe(track);

    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, children]);

  const scrollByPage = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport || fitsInView) return;

    viewport.scrollBy({ left: direction * getScrollStep(), behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport || fitsInView) return;

    const item = viewport.querySelectorAll<HTMLElement>('.section-carousel__item')[index];
    if (!item) return;

    const target = item.offsetLeft - (viewport.clientWidth - item.offsetWidth) / 2;

    viewport.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  };

  const showNav = !fitsInView;
  const showDots = showNav && itemCount > 1;

  return (
    <div
      className={cn(
        'section-carousel',
        variant && `section-carousel--${variant}`,
        fitsInView && 'section-carousel--fits',
        showScrollHints && showNav && canScrollPrev && 'section-carousel--hint-prev',
        showScrollHints && showNav && canScrollNext && 'section-carousel--hint-next',
      )}
    >
      <div ref={viewportRef} className="section-carousel__viewport">
        <ul
          className={cn('section-carousel__track list-none p-0 m-0', trackClassName)}
          role="list"
          aria-label={ariaLabel}
        >
          {children}
        </ul>
      </div>

      {showNav ? (
        <>
          <button
            type="button"
            className="section-carousel__nav section-carousel__nav--prev"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollPrev}
            aria-label="Show previous items"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="section-carousel__nav section-carousel__nav--next"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollNext}
            aria-label="Show next items"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}

      {showDots ? (
        <div className="section-carousel__dots" role="group" aria-label="Carousel pagination">
          {Array.from({ length: itemCount }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={cn(
                'section-carousel__dot',
                activeIndex === index && 'section-carousel__dot--active',
              )}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const SectionCarouselItem = forwardRef<HTMLLIElement, SectionCarouselItemProps>(
  function SectionCarouselItem({ className, style, onTransitionEnd, children }, ref) {
    return (
      <li
        ref={ref}
        className={cn('section-carousel__item', className)}
        style={style}
        onTransitionEnd={onTransitionEnd}
      >
        {children}
      </li>
    );
  },
);
