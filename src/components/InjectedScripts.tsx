import { useEffect, useRef } from 'react'

const MARKER = 'data-cms-injected'

/** Parses admin-provided script HTML and injects executable script nodes once per mount. */
export function InjectedScripts({
  html,
  target,
}: {
  html: string
  target: 'head' | 'body'
}) {
  const injectedRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const trimmed = html?.trim()
    if (!trimmed) return

    const container = document.createElement('div')
    container.innerHTML = trimmed
    const scripts = container.querySelectorAll('script')
    const parent = target === 'head' ? document.head : document.body
    const created: HTMLElement[] = []

    scripts.forEach((source) => {
      const el = document.createElement('script')
      el.setAttribute(MARKER, target)
      for (const attr of source.attributes) {
        el.setAttribute(attr.name, attr.value)
      }
      if (source.textContent) {
        el.textContent = source.textContent
      }
      parent.appendChild(el)
      created.push(el)
    })

    injectedRef.current = created

    return () => {
      created.forEach((node) => node.remove())
      injectedRef.current = []
    }
  }, [html, target])

  return null
}
