import { useEffect, useRef, useState, type TransitionEvent } from 'react';

type RevealPhase = 'hidden' | 'animating' | 'done';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isSpeakerSectionVisible(section: HTMLElement | null): boolean {
  if (!section) return false;
  return (
    section.classList.contains('conference-speakers-section--visible') ||
    section.classList.contains('conference-past-speakers-section--visible')
  );
}

function isInCarouselViewport(viewport: HTMLElement, item: HTMLElement): boolean {
  const vRect = viewport.getBoundingClientRect();
  const iRect = item.getBoundingClientRect();
  return iRect.right > vRect.left + 4 && iRect.left < vRect.right - 4;
}

function getVisibleStaggerIndex(viewport: HTMLElement, target: HTMLElement): number {
  const items = viewport.querySelectorAll<HTMLElement>('.speaker-card-item');
  let order = 0;

  for (const item of items) {
    if (item === target) {
      return Math.min(order, 7);
    }

    const phase = item.dataset.revealPhase;
    if (phase === 'done' || phase === 'instant') continue;
    if (!isInCarouselViewport(viewport, item)) continue;

    order += 1;
  }

  return 0;
}

export function useSpeakerCarouselReveal(skipAnimation: boolean) {
  const shouldSkip = skipAnimation || prefersReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const phaseRef = useRef<RevealPhase>(shouldSkip ? 'done' : 'hidden');
  const [phase, setPhase] = useState<RevealPhase>(() => (shouldSkip ? 'done' : 'hidden'));

  useEffect(() => {
    const skip = skipAnimation || prefersReducedMotion();
    phaseRef.current = skip ? 'done' : 'hidden';
    setPhase(phaseRef.current);

    const el = ref.current;
    if (!el) return;

    if (skip) {
      el.dataset.revealPhase = 'instant';
      return;
    }

    el.dataset.revealPhase = 'hidden';

    const section = el.closest<HTMLElement>(
      '.conference-speakers-section, .conference-past-speakers-section',
    );
    const viewport = el.closest<HTMLElement>('.section-carousel__viewport');
    if (!section || !viewport) return;

    let frame = 0;

    const attemptReveal = () => {
      if (phaseRef.current !== 'hidden') return;
      if (!isSpeakerSectionVisible(section)) return;
      if (!isInCarouselViewport(viewport, el)) return;

      const stagger = getVisibleStaggerIndex(viewport, el);
      el.style.setProperty('--speaker-stagger-index', String(stagger));
      el.dataset.revealPhase = 'animating';
      phaseRef.current = 'animating';
      setPhase('animating');
    };

    const scheduleAttempt = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(attemptReveal);
    };

    const sectionObserver = new MutationObserver(scheduleAttempt);
    sectionObserver.observe(section, { attributes: true, attributeFilter: ['class'] });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) scheduleAttempt();
      },
      { root: viewport, threshold: 0.12 },
    );
    intersectionObserver.observe(el);

    viewport.addEventListener('scroll', scheduleAttempt, { passive: true });
    window.addEventListener('resize', scheduleAttempt);
    scheduleAttempt();

    return () => {
      cancelAnimationFrame(frame);
      sectionObserver.disconnect();
      intersectionObserver.disconnect();
      viewport.removeEventListener('scroll', scheduleAttempt);
      window.removeEventListener('resize', scheduleAttempt);
    };
  }, [skipAnimation]);

  const onTransitionEnd = (event: TransitionEvent<HTMLLIElement>) => {
    if (event.target !== ref.current) return;
    if (event.propertyName !== 'opacity') return;
    if (phaseRef.current !== 'animating') return;

    if (ref.current) {
      ref.current.dataset.revealPhase = 'done';
    }
    phaseRef.current = 'done';
    setPhase('done');
  };

  return { ref, phase, onTransitionEnd };
}
