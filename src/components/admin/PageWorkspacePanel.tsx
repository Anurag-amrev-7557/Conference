import { useCallback, useState } from 'react'
import { useWebsiteData } from '../WebsiteDataProvider'
import { AdminFormSection } from './admin-ui'
import { CatalogHeroFields, RouteSeoFields } from './admin-workspace-fields'
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
      <AdminFormSection title="Search & sharing" description="Applied to the /blog listing URL.">
        <RouteSeoFields path="/blog" value={routeSeo} onChange={setRouteSeo} />
      </AdminFormSection>
    )
  }

  return (
    <AdminFormSection title="Listing hero" description="Shown above the article grid on /blog.">
      <CatalogHeroFields value={catalog} onChange={setCatalog} />
    </AdminFormSection>
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
      <AdminFormSection title="Search & sharing" description="Applied to the /events listing URL.">
        <RouteSeoFields path="/events" value={routeSeo} onChange={setRouteSeo} />
      </AdminFormSection>
    )
  }

  return (
    <AdminFormSection title="Listing hero" description="Shown above the calendar on /events.">
      <CatalogHeroFields value={catalog} onChange={setCatalog} />
    </AdminFormSection>
  )
}

export function HomepageSeoPanel({
  onSaveReady,
}: {
  onSaveReady?: (config: WorkspaceSaveConfig | null) => void
}) {
  const { sourceData, updateSettings } = useWebsiteData()
  const [routeSeo, setRouteSeo] = useState(sourceData.settings.routeSeo?.['/home'] ?? {})
  const [saving, setSaving] = useState(false)

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await updateSettings({
        ...sourceData.settings,
        routeSeo: { ...sourceData.settings.routeSeo, '/home': routeSeo },
      })
    } finally {
      setSaving(false)
    }
  }, [sourceData.settings, routeSeo, updateSettings])

  useRegisterWorkspaceSave(
    onSaveReady,
    onSaveReady ? { label: 'Save homepage SEO', saving, onSave: save } : null,
  )

  return (
    <AdminFormSection title="Search & sharing" description="Applied to the book marketing page (/home).">
      <RouteSeoFields path="/home" value={routeSeo} onChange={setRouteSeo} />
    </AdminFormSection>
  )
}
