import type {
  ConferenceSectionId,
  ConferenceSectionVisibility,
  EmbeddedBlockId,
  SiteBookSettings,
  SiteSettings,
} from '../../../lib/websiteData'
import {
  DEFAULT_CONFERENCE_SECTION_ORDER,
  DEFAULT_EMBEDDED_BLOCK_ORDER,
} from '../../../lib/conferenceSectionOrder'
import type { ConferenceSectionVisibilityKey } from '../../../lib/conferenceDefaults'
import { DEFAULT_CONFERENCE_SECTION_VISIBILITY } from '../../../lib/conferenceDefaults'
import {
  CONFERENCE_SECTION_VISIBILITY_META,
  SUMMIT_EMBEDDED_VISIBILITY_KEYS,
  SUMMIT_VISIBILITY_META,
} from '../../../lib/siteVisibility'
import { AdminVisibilityToggles } from '../AdminVisibilityToggles'
import {
  AdminEditorField,
  AdminEditorFields,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorTextarea,
} from '../admin-editor-ui'
import { FinalCtaFields, PreviewCurationFields, SectionCopyFields } from '../admin-workspace-fields'
import { BookOpen, Calendar, Code, FileCode, Layout, Newspaper } from 'lucide-react'

type Props = {
  activeTab: 'embedded' | 'visibility' | 'advanced'
  sections: SiteSettings['sections']
  onSectionsChange: (next: SiteSettings['sections']) => void
  book: SiteBookSettings | undefined
  onBookChange: (next: SiteBookSettings) => void
  visibility: SiteSettings['visibility']
  onVisibilityChange: (next: SiteSettings['visibility']) => void
  sectionVisibility: ConferenceSectionVisibility | undefined
  onSectionVisibilityChange: (next: ConferenceSectionVisibility) => void
  customCss: string
  onCustomCssChange: (value: string) => void
  scripts: SiteSettings['scripts']
  onScriptsChange: (next: SiteSettings['scripts']) => void
  sectionOrder?: ConferenceSectionId[]
  embeddedBlockOrder?: EmbeddedBlockId[]
  onSectionOrderChange?: (next: ConferenceSectionId[]) => void
  onEmbeddedBlockOrderChange?: (next: EmbeddedBlockId[]) => void
  articleOptions?: { id: string; label: string }[]
  eventOptions?: { id: string; label: string }[]
}

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = [...list]
  const target = index + direction
  if (target < 0 || target >= next.length) return next
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

function SectionOrderEditor<T extends string>({
  title,
  order,
  defaults,
  labels,
  onChange,
}: {
  title: string
  order: T[]
  defaults: T[]
  labels: Record<string, string>
  onChange: (next: T[]) => void
}) {
  const resolved = order.length ? order : defaults

  return (
    <AdminEditorSubsection title={title}>
      <div className="space-y-2">
        {resolved.map((id, index) => (
          <div key={id} className="flex items-center gap-2 text-sm">
            <span className="flex-1">{labels[id] ?? id}</span>
            <button
              type="button"
              className="admin-list-editor__remove w-8 h-8"
              disabled={index === 0}
              onClick={() => onChange(moveItem(resolved, index, -1))}
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className="admin-list-editor__remove w-8 h-8"
              disabled={index === resolved.length - 1}
              onClick={() => onChange(moveItem(resolved, index, 1))}
              aria-label="Move down"
            >
              ↓
            </button>
          </div>
        ))}
      </div>
    </AdminEditorSubsection>
  )
}

export function SummitHomepageSettings({
  activeTab,
  sections,
  onSectionsChange,
  book,
  onBookChange,
  visibility,
  onVisibilityChange,
  sectionVisibility,
  onSectionVisibilityChange,
  customCss,
  onCustomCssChange,
  scripts,
  onScriptsChange,
  sectionOrder,
  embeddedBlockOrder,
  onSectionOrderChange,
  onEmbeddedBlockOrderChange,
  articleOptions = [],
  eventOptions = [],
}: Props) {
  const patchBook = (field: keyof SiteBookSettings, value: string) =>
    onBookChange({ ...book, [field]: value })

  if (activeTab === 'embedded') {
    return (
      <>
        <AdminEditorSection
          icon={BookOpen}
          title="Book showcase block"
          description="Copy and metadata for the 3D book section on the summit homepage."
        >
          <AdminEditorFields>
            <AdminEditorSubsection title="Book metadata">
              <AdminEditorField label="Title">
                <AdminEditorInput
                  value={book?.title || ''}
                  onChange={(e) => patchBook('title', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Tagline">
                <AdminEditorInput
                  value={book?.tagline || ''}
                  onChange={(e) => patchBook('tagline', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Abstract" className="admin-editor-field--wide">
                <AdminEditorTextarea
                  rows={4}
                  value={book?.abstract || ''}
                  onChange={(e) => patchBook('abstract', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Author">
                <AdminEditorInput
                  value={book?.authorName || ''}
                  onChange={(e) => patchBook('authorName', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="ISBN-13">
                <AdminEditorInput
                  value={book?.isbn || ''}
                  onChange={(e) => patchBook('isbn', e.target.value)}
                  className="font-mono text-sm"
                />
              </AdminEditorField>
              <AdminEditorField label="Publisher">
                <AdminEditorInput
                  value={book?.publisherName || ''}
                  onChange={(e) => patchBook('publisherName', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Cover image URL" className="admin-editor-field--wide">
                <AdminEditorInput
                  value={book?.coverImageUrl || ''}
                  onChange={(e) => patchBook('coverImageUrl', e.target.value)}
                  placeholder="https://"
                  className="font-mono text-sm"
                />
              </AdminEditorField>
            </AdminEditorSubsection>
          </AdminEditorFields>
        </AdminEditorSection>

        <SectionCopyFields
          icon={BookOpen}
          title="Book showcase labels"
          description="Eyebrow and button labels on the book block."
          showCta
          showSecondaryCta
          value={sections?.bookShowcase}
          onChange={(next) => onSectionsChange({ ...sections, bookShowcase: next })}
        />

        <SectionCopyFields
          icon={Newspaper}
          title="Blog preview"
          description="Headline and footer link for the article grid on the homepage."
          showCta
          showEmptyState
          value={sections?.blogPreview}
          onChange={(next) => onSectionsChange({ ...sections, blogPreview: next })}
        />
        <PreviewCurationFields
          value={sections?.blogPreview}
          onChange={(next) => onSectionsChange({ ...sections, blogPreview: next })}
          itemOptions={articleOptions}
          itemLabel="articles"
          featuredKey="featuredArticleIds"
        />

        <SectionCopyFields
          icon={Calendar}
          title="Events preview"
          description="Headline and footer link for the events timeline on the homepage."
          showCta
          showEmptyState
          value={sections?.eventsPreview}
          onChange={(next) => onSectionsChange({ ...sections, eventsPreview: next })}
        />
        <PreviewCurationFields
          value={sections?.eventsPreview}
          onChange={(next) => onSectionsChange({ ...sections, eventsPreview: next })}
          itemOptions={eventOptions}
          itemLabel="events"
          featuredKey="featuredEventIds"
        />

        <FinalCtaFields
          value={sections?.finalCta}
          onChange={(next) => onSectionsChange({ ...sections, finalCta: next })}
        />
      </>
    )
  }

  if (activeTab === 'visibility') {
    return (
      <AdminEditorSection
        icon={Layout}
        title="Section visibility"
        description="Show or hide any block on the summit homepage (/)."
      >
        <AdminEditorSubsection title="Summit sections">
          <AdminVisibilityToggles
            entries={(
              Object.keys(CONFERENCE_SECTION_VISIBILITY_META) as ConferenceSectionVisibilityKey[]
            ).map((key) => ({
              key,
              label: CONFERENCE_SECTION_VISIBILITY_META[key].label,
              description: CONFERENCE_SECTION_VISIBILITY_META[key].description,
              checked: sectionVisibility?.[key] !== false,
              onChange: (checked) =>
                onSectionVisibilityChange({
                  ...DEFAULT_CONFERENCE_SECTION_VISIBILITY,
                  ...sectionVisibility,
                  [key]: checked,
                }),
            }))}
          />
        </AdminEditorSubsection>
        <AdminEditorSubsection title="Embedded content blocks">
          <AdminVisibilityToggles
            entries={SUMMIT_EMBEDDED_VISIBILITY_KEYS.map((key) => ({
              key,
              label: SUMMIT_VISIBILITY_META[key].label,
              description: SUMMIT_VISIBILITY_META[key].description,
              checked:
                key === 'finalCta' || key === 'footer'
                  ? visibility[key] !== false
                  : !!visibility[key],
              onChange: (checked) => onVisibilityChange({ ...visibility, [key]: checked }),
            }))}
          />
        </AdminEditorSubsection>
        {onSectionOrderChange ? (
          <SectionOrderEditor
            title="Summit section order"
            order={sectionOrder ?? DEFAULT_CONFERENCE_SECTION_ORDER}
            defaults={DEFAULT_CONFERENCE_SECTION_ORDER}
            labels={Object.fromEntries(
              (
                Object.keys(CONFERENCE_SECTION_VISIBILITY_META) as ConferenceSectionVisibilityKey[]
              ).map((key) => [key, CONFERENCE_SECTION_VISIBILITY_META[key].label]),
            )}
            onChange={onSectionOrderChange}
          />
        ) : null}
        {onEmbeddedBlockOrderChange ? (
          <SectionOrderEditor
            title="Embedded block order"
            order={embeddedBlockOrder ?? DEFAULT_EMBEDDED_BLOCK_ORDER}
            defaults={DEFAULT_EMBEDDED_BLOCK_ORDER}
            labels={Object.fromEntries(
              SUMMIT_EMBEDDED_VISIBILITY_KEYS.map((key) => [
                key,
                SUMMIT_VISIBILITY_META[key].label,
              ]),
            )}
            onChange={onEmbeddedBlockOrderChange}
          />
        ) : null}
      </AdminEditorSection>
    )
  }

  return (
    <>
      <AdminEditorSection
        icon={Code}
        title="Custom CSS"
        description="Inject site-wide CSS (summit and all public pages). Validated on save."
      >
        <AdminEditorField label="Custom stylesheet" className="admin-editor-field--wide">
          <AdminEditorTextarea
            rows={12}
            value={customCss}
            onChange={(e) => onCustomCssChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="/* .conference-hero { ... } */"
          />
        </AdminEditorField>
      </AdminEditorSection>

      <AdminEditorSection
        icon={FileCode}
        title="Injected scripts"
        description="Raw HTML/JS snippets added to every public page head or body."
      >
        <AdminEditorField label="Header scripts" className="admin-editor-field--wide">
          <AdminEditorTextarea
            rows={6}
            value={scripts?.header ?? ''}
            onChange={(e) => onScriptsChange({ ...scripts, header: e.target.value })}
            className="font-mono text-sm"
            placeholder="<!-- analytics, meta tags, ... -->"
          />
        </AdminEditorField>
        <AdminEditorField label="Footer scripts" className="admin-editor-field--wide">
          <AdminEditorTextarea
            rows={6}
            value={scripts?.footer ?? ''}
            onChange={(e) => onScriptsChange({ ...scripts, footer: e.target.value })}
            className="font-mono text-sm"
            placeholder="<!-- chat widgets, ... -->"
          />
        </AdminEditorField>
      </AdminEditorSection>
    </>
  )
}
