/** Pixels below the fixed navbar used as the “current section” read line. */
const READ_LINE_BUFFER_PX = 16

/** Resolves `--header-offset` (rem/px) to pixels for JS APIs that require px (e.g. IntersectionObserver). */
export function getHeaderOffsetPx(): number {
  if (typeof window === 'undefined') return 88

  const raw =
    getComputedStyle(document.documentElement).getPropertyValue('--header-offset').trim() ||
    '5.5rem'

  if (raw.endsWith('rem')) {
    const rem = parseFloat(raw)
    if (!Number.isNaN(rem)) {
      const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      return rem * rootSize
    }
  } else if (raw.endsWith('px')) {
    const px = parseFloat(raw)
    if (!Number.isNaN(px)) return px
  }

  return 88
}

/** Matches `--header-offset` + read buffer (sticky TOC / scroll spy). */
export function getArticleScrollOffsetPx(): number {
  return getHeaderOffsetPx() + READ_LINE_BUFFER_PX
}

export function scrollToArticleSection(
  id: string,
  behavior: ScrollBehavior = 'smooth',
): void {
  const el = document.getElementById(id)
  if (!el) return

  const top =
    el.getBoundingClientRect().top + window.scrollY - getArticleScrollOffsetPx()

  window.scrollTo({ top: Math.max(0, top), behavior })
}

/** Last heading whose top is at or above the read line wins (document order). */
export function resolveActiveSectionId(sections: HTMLElement[]): string | undefined {
  if (sections.length === 0) return undefined

  const line = getArticleScrollOffsetPx()
  let active = sections[0].id

  for (const section of sections) {
    if (section.getBoundingClientRect().top <= line + 4) {
      active = section.id
    } else {
      break
    }
  }

  const last = sections[sections.length - 1]
  const doc = document.documentElement
  const nearBottom =
    window.innerHeight + window.scrollY >= doc.scrollHeight - 64

  if (nearBottom && last) {
    active = last.id
  }

  return active
}
