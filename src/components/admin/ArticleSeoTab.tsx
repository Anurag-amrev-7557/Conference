import React from 'react'
import { EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Article, WebsiteData } from '../../lib/websiteData'
import { useDraftArticleSeo } from '../../hooks/useDraftArticleSeo'
import { SeoPreviewPanel } from './SeoPreviewPanel'
import { OgImageUpload } from './OgImageUpload'
import { cn } from '../../lib/utils'

const TITLE_MAX = 70
const DESC_MAX = 160

type ArticleSeoTabProps = {
  editForm: Partial<Article>
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Article>>>
  storedArticle: Article | undefined
  data: WebsiteData
}

export const ArticleSeoTab: React.FC<ArticleSeoTabProps> = ({
  editForm,
  setEditForm,
  storedArticle,
  data,
}) => {
  const { seo, fallbackLabels, slugReady } = useDraftArticleSeo(editForm, storedArticle, data)
  const titleLen = (editForm.seoTitle || '').length
  const descLen = (editForm.seoDescription || '').length

  return (
    <div className="space-y-10">
      <p className="text-[11px] text-muted leading-relaxed">
        Previews and the live site use the same resolver as public pages (
        <code className="text-accent">seoConfig.ts</code>).
      </p>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SEO Title</label>
        <input
          type="text"
          value={editForm.seoTitle || ''}
          onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
          placeholder="Override title for search results"
          className="w-full bg-[#fafafa] border border-border/40 p-5 font-serif italic text-lg focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
        />
        {titleLen > 0 ? (
          <p className={cn('text-[10px] text-muted', titleLen >= TITLE_MAX * 0.9 && 'text-amber-600')}>
            {titleLen}/{TITLE_MAX}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SEO Description</label>
        <textarea
          value={editForm.seoDescription || ''}
          onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })}
          rows={3}
          placeholder="Override meta description for search and social"
          className="w-full bg-[#fafafa] border border-border/40 p-6 text-sm leading-relaxed italic resize-none focus:bg-white transition-all outline-none rounded-xl shadow-sm"
        />
        {descLen > 0 ? (
          <p className={cn('text-[10px] text-muted', descLen >= DESC_MAX * 0.9 && 'text-amber-600')}>
            {descLen}/{DESC_MAX}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Open Graph Image URL</label>
        <input
          type="text"
          value={editForm.ogImage || ''}
          onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
          placeholder="https://... or upload below"
          className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-[10px] text-accent focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
        />
        <OgImageUpload
          value={editForm.ogImage || ''}
          onChange={(url) => setEditForm({ ...editForm, ogImage: url })}
          getToken={() => localStorage.getItem('adminToken') || ''}
        />
      </div>

      <div className="p-8 border border-border/40 rounded-2xl bg-[#fafafa] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm',
              editForm.noindex ? 'bg-accent/5 border-accent/20 text-accent' : 'bg-white border-border/40 text-muted/40',
            )}
          >
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-text uppercase tracking-widest">
              {editForm.noindex ? 'Hidden from Search' : 'Indexable'}
            </p>
            <p className="text-[11px] text-muted leading-relaxed mt-1">
              {editForm.noindex
                ? 'Adds noindex when this article is published.'
                : 'Article may be indexed when published and this toggle is off.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditForm({ ...editForm, noindex: !editForm.noindex })}
          className={cn(
            'w-12 h-6 rounded-full relative transition-all duration-500 p-1 border shadow-inner',
            editForm.noindex ? 'bg-accent border-accent' : 'bg-white border-border/40',
          )}
        >
          <motion.div
            animate={{ x: editForm.noindex ? 24 : 0 }}
            className="w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
      </div>

      {seo && fallbackLabels && slugReady ? (
        <div className="space-y-4 p-6 rounded-2xl border border-border/40 bg-white">
          <h4 className="text-sm font-bold text-text">Resolved for live site</h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-text line-clamp-2">{seo.title}</p>
              <p className="text-[10px] text-muted mt-0.5">Title · {fallbackLabels.title}</p>
            </div>
            <div>
              <p className="text-muted line-clamp-3">{seo.description}</p>
              <p className="text-[10px] text-muted mt-0.5">Description · {fallbackLabels.description}</p>
            </div>
            <div className="flex gap-4 items-start">
              {seo.ogImage ? (
                <img src={seo.ogImage} alt="" className="w-24 aspect-[1.91/1] object-cover rounded-lg border border-border/40" />
              ) : null}
              <p className="text-[10px] text-muted">Image · {fallbackLabels.image}</p>
            </div>
          </div>
        </div>
      ) : null}

      <SeoPreviewPanel seo={seo} slugReady={slugReady} />
    </div>
  )
}
