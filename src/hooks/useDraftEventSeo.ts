import { useMemo } from 'react'
import type { AppEvent, WebsiteData } from '../lib/websiteData'
import { resolvePageSeo } from '../seo/seoConfig'
import type { PageSeo } from '../seo/types'

export interface SeoFallbackLabels {
  title: string
  description: string
  image: string
}

function buildSyntheticEvent(
  editForm: Partial<AppEvent>,
  stored: AppEvent | undefined,
): AppEvent | undefined {
  if (!stored && !editForm.id) return undefined
  const base = stored ?? ({
    id: editForm.id || 'draft',
    day: editForm.day || '',
    weekday: editForm.weekday || '',
    time: editForm.time || '',
    full_time: editForm.full_time || '',
    title: editForm.title || 'Untitled event',
    host: editForm.host || '',
    location: editForm.location || '',
    tags: editForm.tags || [],
    price: editForm.price || '',
    thumbnail: editForm.thumbnail || '',
    status: editForm.status || 'Upcoming',
    isPublished: editForm.isPublished ?? false,
  } as AppEvent)

  return { ...base, ...editForm, id: editForm.id || base.id } as AppEvent
}

function fallbackLabels(data: WebsiteData, event: AppEvent): SeoFallbackLabels {
  const site = data.settings.seo
  const title = event.seoTitle?.trim()
    ? 'SEO title override'
    : 'Event title + site suffix'

  let description = 'SEO description override'
  if (!event.seoDescription?.trim()) {
    description = event.description?.trim()
      ? 'Event description'
      : 'Generated from title, host, and location'
  }

  let image = 'Custom OG image URL'
  if (!event.ogImage?.trim()) {
    image = event.thumbnail?.trim()
      ? 'Event cover image'
      : site.ogImage?.trim()
        ? 'Site default OG image'
        : 'Default /og-image.jpg'
  }

  return { title, description, image }
}

export function useDraftEventSeo(
  editForm: Partial<AppEvent>,
  storedEvent: AppEvent | undefined,
  data: WebsiteData,
): { seo: PageSeo | null; fallbackLabels: SeoFallbackLabels | null; slugReady: boolean } {
  return useMemo(() => {
    const id = editForm.id?.trim() || storedEvent?.id
    if (!id) {
      return { seo: null, fallbackLabels: null, slugReady: false }
    }

    const synthetic = buildSyntheticEvent(editForm, storedEvent)
    if (!synthetic) {
      return { seo: null, fallbackLabels: null, slugReady: false }
    }

    const pathname = `/events/${id}`
    const seo = resolvePageSeo({ pathname, data, event: synthetic })
    return {
      seo,
      fallbackLabels: fallbackLabels(data, synthetic),
      slugReady: true,
    }
  }, [editForm, storedEvent, data])
}
