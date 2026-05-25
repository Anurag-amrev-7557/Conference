import React, { useEffect, useState } from 'react'
import type { PageSeo } from '../../seo/types'

function hostnameFromCanonical(canonical: string): string {
  try {
    if (canonical.startsWith('http')) return new URL(canonical).hostname
    return canonical || 'example.com'
  } catch {
    return 'example.com'
  }
}

type SeoPreviewPanelProps = {
  seo: PageSeo | null
  slugReady: boolean
}

export const SeoPreviewPanel: React.FC<SeoPreviewPanelProps> = ({ seo, slugReady }) => {
  const [debouncedSeo, setDebouncedSeo] = useState(seo)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSeo(seo), 300)
    return () => clearTimeout(t)
  }, [seo])

  if (!slugReady || !debouncedSeo) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 bg-[#fafafa] p-8 text-center">
        <p className="text-sm text-muted">Add a URL slug to preview search and social snippets.</p>
      </div>
    )
  }

  const host = hostnameFromCanonical(debouncedSeo.canonical)
  const pathSuffix = debouncedSeo.canonical.replace(/^https?:\/\/[^/]+/, '') || '/'

  return (
    <div className="space-y-8">
      <PreviewSection title="Google search preview">
        <div className="max-w-[600px] rounded-xl border border-border/40 bg-white p-4 shadow-sm">
          <p className="text-[#1a0dab] text-lg leading-snug line-clamp-2">{debouncedSeo.title}</p>
          <p className="text-[#006621] text-sm mt-0.5 truncate">
            {host}
            {pathSuffix}
          </p>
          <p className="text-[#545454] text-sm mt-1 line-clamp-2">{debouncedSeo.description}</p>
        </div>
      </PreviewSection>
      <PreviewSection title="Social share preview">
        <div className="max-w-[500px] overflow-hidden rounded-xl border border-border/40 bg-white shadow-sm">
          <div className="aspect-[1.91/1] bg-off">
            {debouncedSeo.ogImage ? (
              <img src={debouncedSeo.ogImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
            )}
          </div>
          <div className="border-t border-border/40 p-3 space-y-1">
            <p className="text-[10px] uppercase text-muted truncate">{host}</p>
            <p className="text-sm font-semibold text-text line-clamp-2">{debouncedSeo.title}</p>
            <p className="text-xs text-muted line-clamp-2">{debouncedSeo.description}</p>
          </div>
        </div>
      </PreviewSection>
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted">{title}</h5>
      {children}
    </div>
  )
}
