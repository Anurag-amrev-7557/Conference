import {
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
  Type,
  Users,
  ClipboardList,
  LayoutTemplate,
  Mail,
  Settings2,
  Shield,
  UserPlus,
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
        { id: 'pages', label: 'Site pages', icon: LayoutTemplate },
        { id: 'advanced', label: 'Advanced', icon: FileCode },
      ],
    },
  ],
  '/admin/newsletter': [
    {
      label: 'Audience',
      items: [{ id: 'signups', label: 'Signups', icon: Mail }],
    },
  ],
  '/admin/users': [
    {
      label: 'Team',
      items: [
        { id: 'team', label: 'Team members', icon: UserPlus },
        { id: 'permissions', label: 'Role permissions', icon: Shield },
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
      items: [{ id: 'submissions', label: 'Submissions', icon: ClipboardList }],
    },
    {
      label: 'Page',
      items: [
        { id: 'form', label: 'Form copy', icon: FileText },
        { id: 'operations', label: 'Operations', icon: Settings2 },
        { id: 'seo', label: 'SEO', icon: Globe },
      ],
    },
  ],
  '/admin/conference': [
    {
      label: 'Summit content',
      items: [
        { id: 'hero', label: 'Hero', icon: Sparkles },
        { id: 'sections', label: 'Section copy', icon: List },
        { id: 'lists', label: 'Lists', icon: Users },
        { id: 'embedded', label: 'Embedded blocks', icon: Layers },
      ],
    },
    {
      label: 'Go live',
      items: [
        { id: 'visibility', label: 'Visibility', icon: Layout },
        { id: 'seo', label: 'SEO', icon: Globe },
        { id: 'advanced', label: 'Advanced', icon: FileCode },
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
