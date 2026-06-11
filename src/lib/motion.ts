import { useEffect, useState } from 'react';

/** Matches `prefers-reduced-motion: reduce` (UX-03, PERF-01). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Framer Motion props: skip enter animation when user prefers reduced motion. */
export function motionInitial(reduceMotion: boolean): false | undefined {
  return reduceMotion ? false : undefined;
}

/** Shared fade-up enter props for Framer Motion surfaces. */
export function fadeUpMotionProps(reduceMotion: boolean) {
  return reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
}
