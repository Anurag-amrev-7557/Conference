import React from 'react'
import { Globe, Search, Monitor } from 'lucide-react'
import type { AppEvent, WebsiteData } from '../../lib/websiteData'
import { useDraftEventSeo } from '../../hooks/useDraftEventSeo'
import { SeoPreviewPanel } from './SeoPreviewPanel'
import { OgImageUpload } from './OgImageUpload'
import {
  AdminEditorField,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorTextarea,
} from './admin-editor-ui'
import { Toggle } from './ui'
import { cn } from '../../lib/utils'

const TITLE_MAX = 70
const DESC_MAX = 160
const OG_MAX = 500

type EventSeoTabProps = {
  editForm: Partial<AppEvent>
  setEditForm: React.Dispatch<React.SetStateAction<Partial<AppEvent>>>
  storedEvent: AppEvent | undefined
  data: WebsiteData
}

export const EventSeoTab: React.FC<EventSeoTabProps> = ({
  editForm,
  setEditForm,
  storedEvent,
  data,
}) => {
  const { seo, fallbackLabels, slugReady } = useDraftEventSeo(editForm, storedEvent, data)

  return (
    <>
      <AdminEditorSection
        icon={Globe}
        title="Meta tags"
        description="Overrides for search results and social sharing on this event."
      >
        <AdminEditorSubsection
          title="Title & description"
          description="Previews use the same resolver as the live site (seoConfig.ts)."
        >
          <AdminEditorField
            label="SEO title"
            value={editForm.seoTitle || ''}
            maxLength={TITLE_MAX}
            showCharCount
          >
            <AdminEditorInput
              value={editForm.seoTitle || ''}
              maxLength={TITLE_MAX}
              onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
              placeholder="Override title for search results"
            />
          </AdminEditorField>
          <AdminEditorField
            label="SEO description"
            value={editForm.seoDescription || ''}
            maxLength={DESC_MAX}
            showCharCount
          >
            <AdminEditorTextarea
              rows={3}
              value={editForm.seoDescription || ''}
              maxLength={DESC_MAX}
              onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })}
              placeholder="Override meta description for search and social"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Open Graph image"
            hint="Paste a URL or upload below."
            value={editForm.ogImage || ''}
            maxLength={OG_MAX}
            showCharCount
          >
            <AdminEditorInput
              value={editForm.ogImage || ''}
              maxLength={OG_MAX}
              onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
              placeholder="https://… or upload below"
              className="font-mono mb-2"
            />
            <OgImageUpload
              value={editForm.ogImage || ''}
              onChange={(url) => setEditForm({ ...editForm, ogImage: url })}
              getToken={() => localStorage.getItem('adminToken') || ''}
            />
          </AdminEditorField>
        </AdminEditorSubsection>
      </AdminEditorSection>

      <AdminEditorSection
        icon={Search}
        title="Search indexing"
        description="Control whether this event appears in search indexes when published."
      >
        <AdminEditorSubsection title="Indexability">
          <div className="admin-editor-visibility-row">
            <div
              className={cn(
                'admin-editor-visibility-row__icon',
                !editForm.noindex && 'admin-editor-visibility-row__icon--on',
              )}
              aria-hidden
            >
              <Search className="w-4 h-4" />
            </div>
            <Toggle
              label={editForm.noindex ? 'Hidden from search' : 'Indexable'}
              description={
                editForm.noindex
                  ? 'Adds noindex when this event is published.'
                  : 'Event may be indexed when published and this toggle is off.'
              }
              checked={!editForm.noindex}
              onChange={(checked) => setEditForm({ ...editForm, noindex: !checked })}
            />
          </div>
        </AdminEditorSubsection>
      </AdminEditorSection>

      {seo && fallbackLabels && slugReady ? (
        <AdminEditorSection
          icon={Globe}
          title="Resolved for live site"
          description="Effective values after fallbacks."
        >
          <AdminEditorSubsection title="Effective meta">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-[var(--editor-text-primary)] line-clamp-2">{seo.title}</p>
                <p className="admin-editor-field__hint mt-0.5">Title · {fallbackLabels.title}</p>
              </div>
              <div>
                <p className="text-[var(--editor-text-secondary)] line-clamp-3">{seo.description}</p>
                <p className="admin-editor-field__hint mt-0.5">Description · {fallbackLabels.description}</p>
              </div>
              <div className="flex gap-4 items-start">
                {seo.ogImage ? (
                  <img
                    src={seo.ogImage}
                    alt=""
                    className="w-24 aspect-[1.91/1] object-cover rounded-lg border border-[var(--editor-border-secondary)]"
                  />
                ) : null}
                <p className="admin-editor-field__hint">Image · {fallbackLabels.image}</p>
              </div>
            </div>
          </AdminEditorSubsection>
        </AdminEditorSection>
      ) : null}

      <AdminEditorSection
        icon={Monitor}
        title="Live preview"
        description="Google and social snippets from the current draft."
      >
        <AdminEditorSubsection title="Snippet preview">
          <SeoPreviewPanel seo={seo} slugReady={slugReady} />
        </AdminEditorSubsection>
      </AdminEditorSection>
    </>
  )
}
