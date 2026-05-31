import {
  BarChart3,
  Box,
  Calendar,
  ExternalLink,
  FileCode,
  FileText,
  Globe,
  Layers,
  Layout,
  List,
  Navigation,
  Palette,
  Search,
  Sparkles,
  Target,
  Type,
  Users,
  ClipboardList,
} from 'lucide-react'
import type { WorkspaceSubnavItem } from './admin-workspace-nav'

export type MobileNavSectionGroup = { label: string; items: WorkspaceSubnavItem[] }

export const ADMIN_PENDING_SECTION_KEY = 'admin-workspace-pending-section'

/** Default workspace sections per admin route (mobile drawer dropdown). */
export const MOBILE_NAV_SECTIONS: Record<string, MobileNavSectionGroup[]> = {
  '/admin/design': [
    {
      label: 'Visual',
      items: [
        { id: 'colors', label: 'Palette', icon: Palette },
        { id: 'typography', label: 'Typography', icon: Type },
        { id: 'tokens', label: 'Theme', icon: Box },
      ],
    },
    {
      label: 'Identity',
      items: [{ id: 'branding', label: 'Brand', icon: Layers }],
    },
  ],
  '/admin/settings': [
    {
      label: 'Workspace',
      items: [
        { id: 'seo', label: 'SEO', icon: Search },
        { id: 'navigation', label: 'Navigation', icon: Navigation },
        { id: 'advanced', label: 'Advanced', icon: FileCode },
      ],
    },
  ],
  '/admin/homepage': [
    {
      label: 'Content',
      items: [
        { id: 'hero', label: 'Hero', icon: Sparkles },
        { id: 'stats', label: 'Stats', icon: BarChart3 },
        { id: 'showcase', label: 'Showcase', icon: Target },
        { id: 'perks', label: 'Perks', icon: Users },
        { id: 'sections', label: 'Sections', icon: Type },
      ],
    },
    {
      label: 'Publish',
      items: [
        { id: 'visibility', label: 'Visibility', icon: Layout },
        { id: 'seo', label: 'SEO', icon: Globe },
      ],
    },
  ],
  '/admin/blogs': [
    { label: 'Editorial', items: [{ id: 'articles', label: 'Articles', icon: FileText }] },
    {
      label: 'Blog page',
      items: [
        { id: 'page', label: 'Page hero', icon: Layout },
        { id: 'seo', label: 'SEO', icon: Globe },
      ],
    },
  ],
  '/admin/events': [
    { label: 'Calendar', items: [{ id: 'events', label: 'Events', icon: Calendar }] },
    {
      label: 'Events page',
      items: [
        { id: 'page', label: 'Page hero', icon: Layout },
        { id: 'seo', label: 'SEO', icon: Globe },
      ],
    },
  ],
  '/admin/registrations': [
    {
      label: 'CRM',
      items: [
        { id: 'submissions', label: 'Submissions', icon: ClipboardList },
        { id: 'form', label: 'Form copy', icon: FileText },
      ],
    },
  ],
  '/admin/conference': [
    {
      label: 'Page content',
      items: [
        { id: 'hero', label: 'Hero', icon: Sparkles },
        { id: 'sections', label: 'Sections', icon: List },
        { id: 'lists', label: 'Lists', icon: Users },
      ],
    },
    {
      label: 'Go live',
      items: [
        { id: 'seo', label: 'SEO', icon: Globe },
        { id: 'publish', label: 'Publish', icon: ExternalLink },
      ],
    },
  ],
}

export function setPendingAdminSection(path: string, sectionId: string) {
  sessionStorage.setItem(
    ADMIN_PENDING_SECTION_KEY,
    JSON.stringify({ path, sectionId }),
  )
}
