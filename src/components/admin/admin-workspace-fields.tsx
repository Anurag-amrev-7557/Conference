import type { ElementType } from 'react'
import type { CatalogHeroContent, FinalCtaContent, RouteSeoOverride, SectionBlockContent } from '../../lib/websiteData'
import { cn } from '../../lib/utils'
import { AdminButton } from './admin-ui'
import {
  AdminEditorField,
  AdminEditorFields,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorTextarea,
} from './admin-editor-ui'
import { OgImageUpload } from './OgImageUpload'
import { PanelBottom, Plus, Trash2 } from 'lucide-react'

const SECTION_COPY_LIMITS = {
  eyebrow: 64,
  title: 120,
  titleAccent: 64,
  lede: 400,
  ctaLabel: 48,
  ctaHref: 200,
} as const

const CATALOG_HERO_LIMITS = {
  eyebrow: 64,
  title: 120,
  titleAccent: 64,
  lede: 400,
} as const

const ROUTE_SEO_LIMITS = {
  title: 70,
  description: 160,
  ogImage: 500,
} as const

const FINAL_CTA_LIMITS = {
  eyebrow: 64,
  title: 120,
  titleAccent: 64,
  lede: 400,
  trustItem: 80,
  ctaLabel: 48,
  ctaHref: 200,
  secondaryCtaLabel: 48,
  secondaryCtaHref: 200,
  waitlistGuideLabel: 80,
  waitlistPlaceholder: 64,
  waitlistSubmitLabel: 48,
  formNote: 200,
  waitlistSuccessTitle: 80,
  waitlistSuccessCopy: 200,
} as const

export function CatalogHeroFields({
  title: _title,
  value,
  onChange,
}: {
  title?: string
  value: CatalogHeroContent | undefined
  onChange: (next: CatalogHeroContent) => void
}) {
  const patch = (field: keyof CatalogHeroContent, v: string) =>
    onChange({ ...value, [field]: v })

  return (
    <AdminEditorSubsection title="Hero copy">
      <AdminEditorField
        label="Eyebrow"
        value={value?.eyebrow || ''}
        maxLength={CATALOG_HERO_LIMITS.eyebrow}
        showCharCount
      >
        <AdminEditorInput
          value={value?.eyebrow || ''}
          maxLength={CATALOG_HERO_LIMITS.eyebrow}
          onChange={(e) => patch('eyebrow', e.target.value)}
        />
      </AdminEditorField>
      <AdminEditorField
        label="Title (before accent)"
        value={value?.title || ''}
        maxLength={CATALOG_HERO_LIMITS.title}
        showCharCount
      >
        <AdminEditorInput
          value={value?.title || ''}
          maxLength={CATALOG_HERO_LIMITS.title}
          onChange={(e) => patch('title', e.target.value)}
        />
      </AdminEditorField>
      <AdminEditorField
        label="Title accent"
        value={value?.titleAccent || ''}
        maxLength={CATALOG_HERO_LIMITS.titleAccent}
        showCharCount
      >
        <AdminEditorInput
          value={value?.titleAccent || ''}
          maxLength={CATALOG_HERO_LIMITS.titleAccent}
          onChange={(e) => patch('titleAccent', e.target.value)}
        />
      </AdminEditorField>
      <AdminEditorField
        label="Lede"
        value={value?.lede || ''}
        maxLength={CATALOG_HERO_LIMITS.lede}
        showCharCount
      >
        <AdminEditorTextarea
          rows={3}
          value={value?.lede || ''}
          maxLength={CATALOG_HERO_LIMITS.lede}
          onChange={(e) => patch('lede', e.target.value)}
        />
      </AdminEditorField>
    </AdminEditorSubsection>
  )
}

export function RouteSeoFields({
  path: _path,
  value,
  onChange,
}: {
  path: string
  value: RouteSeoOverride | undefined
  onChange: (next: RouteSeoOverride) => void
}) {
  return (
    <AdminEditorSubsection title="Meta & social">
      <AdminEditorField
        label="Meta title"
        value={value?.title || ''}
        maxLength={ROUTE_SEO_LIMITS.title}
        showCharCount
      >
        <AdminEditorInput
          value={value?.title || ''}
          maxLength={ROUTE_SEO_LIMITS.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </AdminEditorField>
      <AdminEditorField
        label="Meta description"
        value={value?.description || ''}
        maxLength={ROUTE_SEO_LIMITS.description}
        showCharCount
      >
        <AdminEditorTextarea
          rows={3}
          value={value?.description || ''}
          maxLength={ROUTE_SEO_LIMITS.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </AdminEditorField>
      <AdminEditorField
        label="Open Graph image"
        hint="Paste a URL or upload below."
        value={value?.ogImage || ''}
        maxLength={ROUTE_SEO_LIMITS.ogImage}
        showCharCount
      >
        <AdminEditorInput
          value={value?.ogImage || ''}
          maxLength={ROUTE_SEO_LIMITS.ogImage}
          onChange={(e) => onChange({ ...value, ogImage: e.target.value })}
          placeholder="https://… or upload below"
          className="font-mono mb-2"
        />
        <OgImageUpload
          value={value?.ogImage || ''}
          onChange={(url) => onChange({ ...value, ogImage: url })}
          getToken={() => localStorage.getItem('adminToken') || ''}
        />
      </AdminEditorField>
    </AdminEditorSubsection>
  )
}

export function SectionCopyFields({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  showCta,
  showSecondaryCta,
  showEmptyState,
  showFounderCountLabel,
}: {
  icon: ElementType
  title: string
  description?: string
  value: SectionBlockContent | undefined
  onChange: (next: SectionBlockContent) => void
  showCta?: boolean
  showSecondaryCta?: boolean
  showEmptyState?: boolean
  showFounderCountLabel?: boolean
}) {
  const patch = (field: keyof SectionBlockContent, v: string) =>
    onChange({ ...value, [field]: v })

  return (
    <AdminEditorSection icon={Icon} title={title} description={description}>
      <AdminEditorFields>
        <AdminEditorSubsection title="Section copy">
          <AdminEditorField
            label="Eyebrow"
            value={value?.eyebrow || ''}
            maxLength={SECTION_COPY_LIMITS.eyebrow}
            showCharCount
          >
            <AdminEditorInput
              value={value?.eyebrow || ''}
              maxLength={SECTION_COPY_LIMITS.eyebrow}
              onChange={(e) => patch('eyebrow', e.target.value)}
            />
          </AdminEditorField>
          <AdminEditorField
            label="Title"
            value={value?.title || ''}
            maxLength={SECTION_COPY_LIMITS.title}
            showCharCount
          >
            <AdminEditorInput
              value={value?.title || ''}
              maxLength={SECTION_COPY_LIMITS.title}
              onChange={(e) => patch('title', e.target.value)}
            />
          </AdminEditorField>
          <AdminEditorField
            label="Title accent"
            value={value?.titleAccent || ''}
            maxLength={SECTION_COPY_LIMITS.titleAccent}
            showCharCount
          >
            <AdminEditorInput
              value={value?.titleAccent || ''}
              maxLength={SECTION_COPY_LIMITS.titleAccent}
              onChange={(e) => patch('titleAccent', e.target.value)}
            />
          </AdminEditorField>
          <AdminEditorField
            label="Lede"
            value={value?.lede || ''}
            maxLength={SECTION_COPY_LIMITS.lede}
            showCharCount
          >
            <AdminEditorTextarea
              rows={2}
              value={value?.lede || ''}
              maxLength={SECTION_COPY_LIMITS.lede}
              onChange={(e) => patch('lede', e.target.value)}
            />
          </AdminEditorField>
          {showFounderCountLabel ? (
            <AdminEditorField
              label="Founder count label"
              hint="Optional badge beside the section title (e.g. 2,500+ founders)."
              value={value?.founderCountLabel || ''}
              maxLength={SECTION_COPY_LIMITS.eyebrow}
              showCharCount
            >
              <AdminEditorInput
                value={value?.founderCountLabel || ''}
                maxLength={SECTION_COPY_LIMITS.eyebrow}
                onChange={(e) => patch('founderCountLabel', e.target.value)}
              />
            </AdminEditorField>
          ) : null}
          {showEmptyState ? (
            <AdminEditorField
              label="Empty state"
              hint="Shown when there are no published items to list."
              value={value?.emptyState || ''}
              maxLength={SECTION_COPY_LIMITS.lede}
              showCharCount
            >
              <AdminEditorTextarea
                rows={2}
                value={value?.emptyState || ''}
                maxLength={SECTION_COPY_LIMITS.lede}
                onChange={(e) => patch('emptyState', e.target.value)}
              />
            </AdminEditorField>
          ) : null}
          {showCta ? (
            <>
              <AdminEditorField
                label="CTA label"
                value={value?.ctaLabel || ''}
                maxLength={SECTION_COPY_LIMITS.ctaLabel}
                showCharCount
              >
                <AdminEditorInput
                  value={value?.ctaLabel || ''}
                  maxLength={SECTION_COPY_LIMITS.ctaLabel}
                  onChange={(e) => patch('ctaLabel', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField
                label="CTA URL"
                value={value?.ctaHref || ''}
                maxLength={SECTION_COPY_LIMITS.ctaHref}
                showCharCount
              >
                <AdminEditorInput
                  value={value?.ctaHref || ''}
                  maxLength={SECTION_COPY_LIMITS.ctaHref}
                  onChange={(e) => patch('ctaHref', e.target.value)}
                />
              </AdminEditorField>
            </>
          ) : null}
          {showSecondaryCta ? (
            <>
              <AdminEditorField
                label="Secondary CTA label"
                value={value?.secondaryCtaLabel || ''}
                maxLength={SECTION_COPY_LIMITS.ctaLabel}
                showCharCount
              >
                <AdminEditorInput
                  value={value?.secondaryCtaLabel || ''}
                  maxLength={SECTION_COPY_LIMITS.ctaLabel}
                  onChange={(e) => patch('secondaryCtaLabel', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField
                label="Secondary CTA URL"
                value={value?.secondaryCtaHref || ''}
                maxLength={SECTION_COPY_LIMITS.ctaHref}
                showCharCount
              >
                <AdminEditorInput
                  value={value?.secondaryCtaHref || ''}
                  maxLength={SECTION_COPY_LIMITS.ctaHref}
                  onChange={(e) => patch('secondaryCtaHref', e.target.value)}
                />
              </AdminEditorField>
            </>
          ) : null}
        </AdminEditorSubsection>
      </AdminEditorFields>
    </AdminEditorSection>
  )
}

export function FinalCtaFields({
  value,
  onChange,
}: {
  value: FinalCtaContent | undefined
  onChange: (next: FinalCtaContent) => void
}) {
  const patch = (field: keyof FinalCtaContent, v: string | string[]) =>
    onChange({ ...value, [field]: v })

  const trustItems = value?.trustItems?.length ? value.trustItems : ['']

  const updateTrustItem = (index: number, text: string) => {
    const next = [...trustItems]
    next[index] = text
    patch('trustItems', next)
  }

  const addTrustItem = () => patch('trustItems', [...trustItems, ''])

  const removeTrustItem = (index: number) => {
    patch(
      'trustItems',
      trustItems.filter((_, i) => i !== index),
    )
  }

  return (
    <AdminEditorSection
      icon={PanelBottom}
      title="Final CTA"
      description="Bottom registry block on /home and /conference. Summit buttons show on the conference page; the waitlist form shows on the book page."
      action={
        <AdminButton type="button" variant="secondary" onClick={addTrustItem}>
          <Plus className="w-4 h-4" />
          Add trust item
        </AdminButton>
      }
    >
      <AdminEditorFields>
        <AdminEditorSubsection
          title="Main copy"
          description="Headline block above trust bullets and CTAs."
        >
          <AdminEditorField
            label="Eyebrow"
            value={value?.eyebrow || ''}
            maxLength={FINAL_CTA_LIMITS.eyebrow}
            showCharCount
          >
            <AdminEditorInput
              value={value?.eyebrow || ''}
              maxLength={FINAL_CTA_LIMITS.eyebrow}
              onChange={(e) => patch('eyebrow', e.target.value)}
            />
          </AdminEditorField>
          <AdminEditorField
            label="Title"
            value={value?.title || ''}
            maxLength={FINAL_CTA_LIMITS.title}
            showCharCount
          >
            <AdminEditorInput
              value={value?.title || ''}
              maxLength={FINAL_CTA_LIMITS.title}
              onChange={(e) => patch('title', e.target.value)}
            />
          </AdminEditorField>
          <AdminEditorField
            label="Title accent"
            value={value?.titleAccent || ''}
            maxLength={FINAL_CTA_LIMITS.titleAccent}
            showCharCount
          >
            <AdminEditorInput
              value={value?.titleAccent || ''}
              maxLength={FINAL_CTA_LIMITS.titleAccent}
              onChange={(e) => patch('titleAccent', e.target.value)}
            />
          </AdminEditorField>
          <AdminEditorField
            label="Lede"
            value={value?.lede || ''}
            maxLength={FINAL_CTA_LIMITS.lede}
            showCharCount
          >
            <AdminEditorTextarea
              rows={3}
              value={value?.lede || ''}
              maxLength={FINAL_CTA_LIMITS.lede}
              onChange={(e) => patch('lede', e.target.value)}
            />
          </AdminEditorField>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="Trust bullets">
          {trustItems.map((item, index) => (
            <div key={`trust-${index}`} className="admin-editor-item-group">
              <div className="admin-editor-item-group__toolbar">
                <p className="admin-editor-item-group__title">Item {index + 1}</p>
                {trustItems.length > 1 ? (
                  <AdminButton
                    type="button"
                    variant="danger"
                    aria-label="Remove trust item"
                    onClick={() => removeTrustItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </AdminButton>
                ) : null}
              </div>
              <AdminEditorField
                label="Trust bullet"
                value={item}
                maxLength={FINAL_CTA_LIMITS.trustItem}
                showCharCount
              >
                <AdminEditorInput
                  value={item}
                  maxLength={FINAL_CTA_LIMITS.trustItem}
                  onChange={(e) => updateTrustItem(index, e.target.value)}
                  placeholder="2,500+ on the registry"
                />
              </AdminEditorField>
            </div>
          ))}
        </AdminEditorSubsection>

        <AdminEditorSubsection
          title="Summit buttons"
          description="Shown on the conference page."
        >
          <AdminEditorField
            label="Primary button label"
            value={value?.ctaLabel || ''}
            maxLength={FINAL_CTA_LIMITS.ctaLabel}
            showCharCount
          >
            <AdminEditorInput
              value={value?.ctaLabel || ''}
              maxLength={FINAL_CTA_LIMITS.ctaLabel}
              onChange={(e) => patch('ctaLabel', e.target.value)}
              placeholder="Register for the summit"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Primary button URL"
            value={value?.ctaHref || ''}
            maxLength={FINAL_CTA_LIMITS.ctaHref}
            showCharCount
          >
            <AdminEditorInput
              value={value?.ctaHref || ''}
              maxLength={FINAL_CTA_LIMITS.ctaHref}
              onChange={(e) => patch('ctaHref', e.target.value)}
              placeholder="/register"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Secondary button label"
            value={value?.secondaryCtaLabel || ''}
            maxLength={FINAL_CTA_LIMITS.secondaryCtaLabel}
            showCharCount
          >
            <AdminEditorInput
              value={value?.secondaryCtaLabel || ''}
              maxLength={FINAL_CTA_LIMITS.secondaryCtaLabel}
              onChange={(e) => patch('secondaryCtaLabel', e.target.value)}
              placeholder="View the agenda"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Secondary button URL"
            value={value?.secondaryCtaHref || ''}
            maxLength={FINAL_CTA_LIMITS.secondaryCtaHref}
            showCharCount
          >
            <AdminEditorInput
              value={value?.secondaryCtaHref || ''}
              maxLength={FINAL_CTA_LIMITS.secondaryCtaHref}
              onChange={(e) => patch('secondaryCtaHref', e.target.value)}
              placeholder="#conference-agenda"
            />
          </AdminEditorField>
        </AdminEditorSubsection>

        <AdminEditorSubsection
          title="Book page waitlist"
          description="Email capture form on the book homepage."
        >
          <AdminEditorField
            label="Guide label"
            value={value?.waitlistGuideLabel || ''}
            maxLength={FINAL_CTA_LIMITS.waitlistGuideLabel}
            showCharCount
          >
            <AdminEditorInput
              value={value?.waitlistGuideLabel || ''}
              maxLength={FINAL_CTA_LIMITS.waitlistGuideLabel}
              onChange={(e) => patch('waitlistGuideLabel', e.target.value)}
              placeholder="Exclusive guide · Building AI agents"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Email placeholder"
            value={value?.waitlistPlaceholder || ''}
            maxLength={FINAL_CTA_LIMITS.waitlistPlaceholder}
            showCharCount
          >
            <AdminEditorInput
              value={value?.waitlistPlaceholder || ''}
              maxLength={FINAL_CTA_LIMITS.waitlistPlaceholder}
              onChange={(e) => patch('waitlistPlaceholder', e.target.value)}
              placeholder="you@company.com"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Submit button label"
            value={value?.waitlistSubmitLabel || ''}
            maxLength={FINAL_CTA_LIMITS.waitlistSubmitLabel}
            showCharCount
          >
            <AdminEditorInput
              value={value?.waitlistSubmitLabel || ''}
              maxLength={FINAL_CTA_LIMITS.waitlistSubmitLabel}
              onChange={(e) => patch('waitlistSubmitLabel', e.target.value)}
              placeholder="Get the playbook"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Form note"
            value={value?.formNote || ''}
            maxLength={FINAL_CTA_LIMITS.formNote}
            showCharCount
          >
            <AdminEditorTextarea
              rows={2}
              value={value?.formNote || ''}
              maxLength={FINAL_CTA_LIMITS.formNote}
              onChange={(e) => patch('formNote', e.target.value)}
              placeholder="Join 2,500+ founders — playbook in your inbox in minutes."
            />
          </AdminEditorField>
          <AdminEditorField
            label="Success title"
            value={value?.waitlistSuccessTitle || ''}
            maxLength={FINAL_CTA_LIMITS.waitlistSuccessTitle}
            showCharCount
          >
            <AdminEditorInput
              value={value?.waitlistSuccessTitle || ''}
              maxLength={FINAL_CTA_LIMITS.waitlistSuccessTitle}
              onChange={(e) => patch('waitlistSuccessTitle', e.target.value)}
              placeholder="You're on the list"
            />
          </AdminEditorField>
          <AdminEditorField
            label="Success message"
            value={value?.waitlistSuccessCopy || ''}
            maxLength={FINAL_CTA_LIMITS.waitlistSuccessCopy}
            showCharCount
          >
            <AdminEditorTextarea
              rows={2}
              value={value?.waitlistSuccessCopy || ''}
              maxLength={FINAL_CTA_LIMITS.waitlistSuccessCopy}
              onChange={(e) => patch('waitlistSuccessCopy', e.target.value)}
              placeholder="Check your inbox — the playbook arrives in a few minutes."
            />
          </AdminEditorField>
        </AdminEditorSubsection>
      </AdminEditorFields>
    </AdminEditorSection>
  )
}

export function WorkspaceTabBar({
  tabs,
  sections,
  activeId,
  onSelect,
}: {
  tabs?: { id: string; label: string }[]
  sections?: { label: string; tabs: { id: string; label: string }[] }[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const resolvedSections =
    sections ??
    (tabs ? [{ label: '', tabs }] : [])

  return (
    <div className="admin-tab-bar admin-tab-bar--grouped" role="tablist">
      {resolvedSections.map((section, sectionIndex) => (
        <div
          key={section.label || `section-${sectionIndex}`}
          className={cn(
            'admin-tab-bar__section',
            sectionIndex > 0 && 'admin-tab-bar__section--separated',
          )}
        >
          {section.label ? (
            <span className="admin-tab-bar__section-label">{section.label}</span>
          ) : null}
          <div className="admin-tab-bar__section-tabs">
            {section.tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeId === tab.id}
                onClick={() => onSelect(tab.id)}
                className={cn(
                  'admin-tab-bar__item',
                  activeId === tab.id && 'admin-tab-bar__item--active',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
