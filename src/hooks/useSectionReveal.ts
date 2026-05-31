import { useEffect, useRef } from 'react'

export function useSectionReveal(visibleClass: string) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(visibleClass)
          observer.disconnect()
        }
      },
      { rootMargin: '-60px 0px', threshold: 0.06 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleClass])

  return ref
}
