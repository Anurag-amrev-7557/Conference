import { useCallback, useState } from 'react'
import { Globe, Newspaper, Calendar, Users } from 'lucide-react'
import type { CatalogHeroContent, RouteSeoOverride } from '../../lib/websiteData'
import { useWebsiteData } from '../WebsiteDataProvider'
import { CatalogHeroFields, RouteSeoFields } from './admin-workspace-fields'
import { AdminEditorFields, AdminEditorSection } from './admin-editor-ui'
import {
  useRegisterWorkspaceSave,
  type WorkspaceSaveConfig,
} from './admin-workspace-save'

type PanelProps = {
  mode: 'page' | 'seo'
  onSaveReady?: (config: WorkspaceSaveConfig | null) => void
}

export function BlogPageWorkspacePanel({ mode, onSaveReady }: PanelProps) {
  const { sourceData, updateSettings } = useWebsiteData()
  const [catalog, setCatalog] = useState(sourceData.settings.catalogPages?.blog ?? {})
  const [routeSeo, setRouteSeo] = useState(sourceData.settings.routeSeo?.['/blog'] ?? {})
  const [saving, setSaving] = useState(false)

  const save = useCallback(async () => {
    setSaving(true)
    try {
      if (mode === 'seo') {
        await updateSettings({
          ...sourceData.settings,
          routeSeo: { ...sourceData.settings.routeSeo, '/blog': routeSeo },
        })
      } else {
        await updateSettings({
          ...sourceData.settings,
          catalogPages: { ...sourceData.settings.catalogPages, blog: catalog },
        })
      }
    } finally {
      setSaving(false)
    }
  }, [mode, sourceData.settings, routeSeo, catalog, updateSettings])

  const label = mode === 'seo' ? 'Save SEO' : 'Save page hero'
  useRegisterWorkspaceSave(
    onSaveReady,
    onSaveReady ? { label, saving, onSave: save } : null,
  )

  if (mode === 'seo') {
    return (
      <AdminEditorSection
        icon={Globe}
        title="Search & sharing"
        description="Applied to the /blog listing URL."
      >
        <AdminEditorFields>
          <RouteSeoFields path="/blog" value={routeSeo} onChange={setRouteSeo} />
        </AdminEditorFields>
      </AdminEditorSection>
    )
  }

  return (
    <AdminEditorSection
      icon={Newspaper}
      title="Listing hero"
      description="Shown above the article grid on /blog."
    >
      <AdminEditorFields>
        <CatalogHeroFields value={catalog} onChange={setCatalog} />
      </AdminEditorFields>
    </AdminEditorSection>
  )
}

type SpeakersCatalogFieldsProps = {
  catalog: CatalogHeroContent
  onCatalogChange: (next: CatalogHeroContent) => void
  routeSeo: RouteSeoOverride
  onRouteSeoChange: (next: RouteSeoOverride) => void
}

/** Shared hero + SEO fields for /speakers (used by ConferenceManager and standalone panel). */
export function SpeakersCatalogPageFields({
  catalog,
  onCatalogChange,
  routeSeo,
  onRouteSeoChange,
}: SpeakersCatalogFieldsProps) {
  return (
    <>
      <AdminEditorSection
        icon={Users}
        title="Listing hero"
        description="Shown above the speaker grid on /speakers. Speaker profiles are managed under Summit → Lists."
      >
        <AdminEditorFields>
          <CatalogHeroFields value={catalog} onChange={onCatalogChange} />
        </AdminEditorFields>
      </AdminEditorSection>
      <AdminEditorSection
        icon={Globe}
        title="Search & sharing"
        description="Applied to the /speakers catalog URL."
      >
        <AdminEditorFields>
          <RouteSeoFields path="/speakers" value={routeSeo} onChange={onRouteSeoChange} />
        </AdminEditorFields>
      </AdminEditorSection>
      <p className="text-sm text-[var(--admin-text-muted)] max-w-prose">
        To show Speakers in the header, add a navigation link to <code className="text-xs">/speakers</code> under
        Site settings → Navigation.
      </p>
    </>
  )
}

export function SpeakersPageWorkspacePanel({ mode, onSaveReady }: PanelProps) {
  const { sourceData, updateSettings } = useWebsiteData()
  const [catalog, setCatalog] = useState(sourceData.settings.catalogPages?.speakers ?? {})
  const [routeSeo, setRouteSeo] = useState(sourceData.settings.routeSeo?.['/speakers'] ?? {})
  const [saving, setSaving] = useState(false)

  const save = useCallback(async () => {
    setSaving(true)
    try {
      if (mode === 'seo') {
        await updateSettings({
          ...sourceData.settings,
          routeSeo: { ...sourceData.settings.routeSeo, '/speakers': routeSeo },
        })
      } else {
        await updateSettings({
          ...sourceData.settings,
          catalogPages: { ...sourceData.settings.catalogPages, speakers: catalog },
        })
      }
    } finally {
      setSaving(false)
    }
  }, [mode, sourceData.settings, routeSeo, catalog, updateSettings])

  const label = mode === 'seo' ? 'Save SEO' : 'Save page hero'
  useRegisterWorkspaceSave(
    onSaveReady,
    onSaveReady ? { label, saving, onSave: save } : null,
  )

  if (mode === 'seo') {
    return (
      <AdminEditorSection
        icon={Globe}
        title="Search & sharing"
        description="Applied to the /speakers listing URL."
      >
        <AdminEditorFields>
          <RouteSeoFields path="/speakers" value={routeSeo} onChange={setRouteSeo} />
        </AdminEditorFields>
      </AdminEditorSection>
    )
  }

  return (
    <AdminEditorSection
      icon={Users}
      title="Listing hero"
      description="Shown above the speaker grid on /speakers."
    >
      <AdminEditorFields>
        <CatalogHeroFields value={catalog} onChange={setCatalog} />
      </AdminEditorFields>
    </AdminEditorSection>
  )
}

export function EventsPageWorkspacePanel({ mode, onSaveReady }: PanelProps) {
  const { sourceData, updateSettings } = useWebsiteData()
  const [catalog, setCatalog] = useState(sourceData.settings.catalogPages?.events ?? {})
  const [routeSeo, setRouteSeo] = useState(sourceData.settings.routeSeo?.['/events'] ?? {})
  const [saving, setSaving] = useState(false)

  const save = useCallback(async () => {
    setSaving(true)
    try {
      if (mode === 'seo') {
        await updateSettings({
          ...sourceData.settings,
          routeSeo: { ...sourceData.settings.routeSeo, '/events': routeSeo },
        })
      } else {
        await updateSettings({
          ...sourceData.settings,
          catalogPages: { ...sourceData.settings.catalogPages, events: catalog },
        })
      }
    } finally {
      setSaving(false)
    }
  }, [mode, sourceData.settings, routeSeo, catalog, updateSettings])

  const label = mode === 'seo' ? 'Save SEO' : 'Save page hero'
  useRegisterWorkspaceSave(
    onSaveReady,
    onSaveReady ? { label, saving, onSave: save } : null,
  )

  if (mode === 'seo') {
    return (
      <AdminEditorSection
        icon={Globe}
        title="Search & sharing"
        description="Applied to the /events listing URL."
      >
        <AdminEditorFields>
          <RouteSeoFields path="/events" value={routeSeo} onChange={setRouteSeo} />
        </AdminEditorFields>
      </AdminEditorSection>
    )
  }

  return (
    <AdminEditorSection
      icon={Calendar}
      title="Listing hero"
      description="Shown above the calendar on /events."
    >
      <AdminEditorFields>
        <CatalogHeroFields value={catalog} onChange={setCatalog} />
      </AdminEditorFields>
    </AdminEditorSection>
  )
}

