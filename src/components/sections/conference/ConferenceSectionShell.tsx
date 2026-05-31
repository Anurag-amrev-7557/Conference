import type { ReactNode } from 'react'
import { useSectionReveal } from '../../../hooks/useSectionReveal'

type ConferenceSectionShellProps = {
  id: string
  sectionClass: string
  visibleClass: string
  variant?: 'light' | 'white' | 'muted'
  children: ReactNode
}

export function ConferenceSectionShell({
  id,
  sectionClass,
  visibleClass,
  variant = 'light',
  children,
}: ConferenceSectionShellProps) {
  const ref = useSectionReveal(visibleClass)

  return (
    <section
      ref={ref}
      id={id}
      className={`${sectionClass} conference-section premium-home-section conference-section--${variant}`}
    >
      <div className="conference-section__ambient" aria-hidden />
      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        {children}
      </div>
    </section>
  )
}
