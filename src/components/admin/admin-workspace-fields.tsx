import type { CatalogHeroContent, FinalCtaContent, RouteSeoOverride, SectionBlockContent } from '../../lib/websiteData'
import { cn } from '../../lib/utils'
import { AdminButton, AdminField, AdminFormSection, AdminInput, AdminTextarea } from './admin-ui'
import { Plus, Trash2 } from 'lucide-react'

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
      <div className="space-y-0">
        <AdminField label="Eyebrow">
          <AdminInput
            value={value?.eyebrow || ''}
            onChange={(e) => patch('eyebrow', e.target.value)}
          />
        </AdminField>
        <AdminField label="Title (before accent)">
          <AdminInput
            value={value?.title || ''}
            onChange={(e) => patch('title', e.target.value)}
          />
        </AdminField>
        <AdminField label="Title accent">
          <AdminInput
            value={value?.titleAccent || ''}
            onChange={(e) => patch('titleAccent', e.target.value)}
          />
        </AdminField>
        <AdminField label="Lede">
          <AdminTextarea
            rows={3}
            value={value?.lede || ''}
            onChange={(e) => patch('lede', e.target.value)}
          />
        </AdminField>
      </div>
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
    <div className="space-y-0">
      <AdminField label="Meta title">
        <AdminInput
          value={value?.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </AdminField>
      <AdminField label="Meta description">
        <AdminTextarea
          rows={3}
          value={value?.description || ''}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </AdminField>
    </div>
  )
}

export function SectionCopyFields({
  title,
  value,
  onChange,
  showCta,
}: {
  title: string
  value: SectionBlockContent | undefined
  onChange: (next: SectionBlockContent) => void
  showCta?: boolean
}) {
  const patch = (field: keyof SectionBlockContent, v: string) =>
    onChange({ ...value, [field]: v })

  return (
    <AdminFormSection title={title}>
        <AdminField label="Eyebrow">
          <AdminInput
            value={value?.eyebrow || ''}
            onChange={(e) => patch('eyebrow', e.target.value)}
          />
        </AdminField>
        <AdminField label="Title">
          <AdminInput
            value={value?.title || ''}
            onChange={(e) => patch('title', e.target.value)}
          />
        </AdminField>
        <AdminField label="Title accent">
          <AdminInput
            value={value?.titleAccent || ''}
            onChange={(e) => patch('titleAccent', e.target.value)}
          />
        </AdminField>
        <AdminField label="Lede">
          <AdminTextarea
            rows={2}
            value={value?.lede || ''}
            onChange={(e) => patch('lede', e.target.value)}
          />
        </AdminField>
        {showCta && (
          <>
            <AdminField label="CTA label">
              <AdminInput
                value={value?.ctaLabel || ''}
                onChange={(e) => patch('ctaLabel', e.target.value)}
              />
            </AdminField>
            <AdminField label="CTA URL">
              <AdminInput
                value={value?.ctaHref || ''}
                onChange={(e) => patch('ctaHref', e.target.value)}
              />
            </AdminField>
          </>
        )}
    </AdminFormSection>
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
    <AdminFormSection
      title="Final CTA"
      description="Bottom registry block on /home and /conference. Summit buttons show on the conference page; the waitlist form shows on the book page."
      action={
        <AdminButton type="button" variant="secondary" onClick={addTrustItem}>
          <Plus className="w-4 h-4" />
          Add trust item
        </AdminButton>
      }
    >
      <AdminField label="Eyebrow">
        <AdminInput
          value={value?.eyebrow || ''}
          onChange={(e) => patch('eyebrow', e.target.value)}
        />
      </AdminField>
      <AdminField label="Title">
        <AdminInput
          value={value?.title || ''}
          onChange={(e) => patch('title', e.target.value)}
        />
      </AdminField>
      <AdminField label="Title accent">
        <AdminInput
          value={value?.titleAccent || ''}
          onChange={(e) => patch('titleAccent', e.target.value)}
        />
      </AdminField>
      <AdminField label="Lede">
        <AdminTextarea
          rows={3}
          value={value?.lede || ''}
          onChange={(e) => patch('lede', e.target.value)}
        />
      </AdminField>

      <p className="admin-form-section__desc !mt-2">Trust bullets</p>
      <div className="admin-list-editor">
        {trustItems.map((item, index) => (
          <div key={`trust-${index}`} className="admin-list-editor__row">
            <div className="admin-list-editor__fields">
              <AdminField label={`Item ${index + 1}`}>
                <AdminInput
                  value={item}
                  onChange={(e) => updateTrustItem(index, e.target.value)}
                  placeholder="2,500+ on the registry"
                />
              </AdminField>
            </div>
            {trustItems.length > 1 ? (
              <AdminButton
                type="button"
                variant="danger"
                className="admin-list-editor__remove"
                aria-label="Remove trust item"
                onClick={() => removeTrustItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </AdminButton>
            ) : null}
          </div>
        ))}
      </div>

      <p className="admin-form-section__desc !mt-4">Summit buttons (conference page)</p>
      <AdminField label="Primary button label">
        <AdminInput
          value={value?.ctaLabel || ''}
          onChange={(e) => patch('ctaLabel', e.target.value)}
          placeholder="Register for the summit"
        />
      </AdminField>
      <AdminField label="Primary button URL">
        <AdminInput
          value={value?.ctaHref || ''}
          onChange={(e) => patch('ctaHref', e.target.value)}
          placeholder="/register"
        />
      </AdminField>
      <AdminField label="Secondary button label">
        <AdminInput
          value={value?.secondaryCtaLabel || ''}
          onChange={(e) => patch('secondaryCtaLabel', e.target.value)}
          placeholder="View the agenda"
        />
      </AdminField>
      <AdminField label="Secondary button URL">
        <AdminInput
          value={value?.secondaryCtaHref || ''}
          onChange={(e) => patch('secondaryCtaHref', e.target.value)}
          placeholder="#conference-agenda"
        />
      </AdminField>

      <p className="admin-form-section__desc !mt-4">Book page waitlist</p>
      <AdminField label="Guide label">
        <AdminInput
          value={value?.waitlistGuideLabel || ''}
          onChange={(e) => patch('waitlistGuideLabel', e.target.value)}
          placeholder="Exclusive guide · Building AI agents"
        />
      </AdminField>
      <AdminField label="Email placeholder">
        <AdminInput
          value={value?.waitlistPlaceholder || ''}
          onChange={(e) => patch('waitlistPlaceholder', e.target.value)}
          placeholder="you@company.com"
        />
      </AdminField>
      <AdminField label="Submit button label">
        <AdminInput
          value={value?.waitlistSubmitLabel || ''}
          onChange={(e) => patch('waitlistSubmitLabel', e.target.value)}
          placeholder="Get the playbook"
        />
      </AdminField>
      <AdminField label="Form note">
        <AdminTextarea
          rows={2}
          value={value?.formNote || ''}
          onChange={(e) => patch('formNote', e.target.value)}
          placeholder="Join 2,500+ founders — playbook in your inbox in minutes."
        />
      </AdminField>
      <AdminField label="Success title">
        <AdminInput
          value={value?.waitlistSuccessTitle || ''}
          onChange={(e) => patch('waitlistSuccessTitle', e.target.value)}
          placeholder="You're on the list"
        />
      </AdminField>
      <AdminField label="Success message">
        <AdminTextarea
          rows={2}
          value={value?.waitlistSuccessCopy || ''}
          onChange={(e) => patch('waitlistSuccessCopy', e.target.value)}
          placeholder="Check your inbox — the playbook arrives in a few minutes."
        />
      </AdminField>
    </AdminFormSection>
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
