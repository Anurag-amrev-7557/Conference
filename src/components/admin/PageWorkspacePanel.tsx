import { useCallback, useState } from 'react'
import { Globe, Newspaper, Calendar } from 'lucide-react'
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

