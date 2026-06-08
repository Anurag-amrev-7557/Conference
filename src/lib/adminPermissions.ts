/** Admin page + section access — configured by super_admin in settings.adminPermissions */

export type AdminPageId =
  | 'dashboard'
  | 'design'
  | 'settings'
  | 'media'
  | 'blogs'
  | 'events'
  | 'conference'
  | 'registrations'
  | 'newsletter'
  | 'users';

export type PageAccess = 'none' | 'read' | 'write';

export type RoleAccessConfig = {
  pages: Partial<Record<AdminPageId, PageAccess>>;
  sections: Partial<Record<AdminPageId, Record<string, boolean>>>;
};

export type AdminPermissionsConfig = {
  editor: RoleAccessConfig;
  viewer: RoleAccessConfig;
};

export const ADMIN_PAGE_META: Record<
  AdminPageId,
  { path: string; label: string; group: 'Overview' | 'Site' | 'Pages' | 'Access' }
> = {
  dashboard: { path: '/admin/dashboard', label: 'Dashboard', group: 'Overview' },
  newsletter: { path: '/admin/newsletter', label: 'Newsletter', group: 'Overview' },
  users: { path: '/admin/users', label: 'Team & access', group: 'Access' },
  design: { path: '/admin/design', label: 'Brand & theme', group: 'Site' },
  settings: { path: '/admin/settings', label: 'Site settings', group: 'Site' },
  media: { path: '/admin/media', label: 'Media', group: 'Site' },
  blogs: { path: '/admin/blogs', label: 'Blog', group: 'Pages' },
  events: { path: '/admin/events', label: 'Events', group: 'Pages' },
  conference: { path: '/admin/conference', label: 'Summit homepage', group: 'Pages' },
  registrations: { path: '/admin/registrations', label: 'Registrations', group: 'Pages' },
};

/** Section ids per route — keep in sync with admin-mobile-nav-sections.ts */
export const ADMIN_PAGE_SECTIONS: Partial<Record<AdminPageId, { id: string; label: string }[]>> = {
  design: [
    { id: 'colors', label: 'Palette' },
    { id: 'typography', label: 'Typography' },
    { id: 'tokens', label: 'Theme' },
    { id: 'branding', label: 'Brand' },
  ],
  settings: [
    { id: 'seo', label: 'SEO' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'pages', label: 'Site pages' },
    { id: 'advanced', label: 'Advanced' },
  ],
  newsletter: [{ id: 'signups', label: 'Signups' }],
  blogs: [
    { id: 'articles', label: 'Articles' },
    { id: 'page', label: 'Page hero' },
    { id: 'seo', label: 'SEO' },
  ],
  events: [
    { id: 'events', label: 'Events' },
    { id: 'page', label: 'Page hero' },
    { id: 'seo', label: 'SEO' },
  ],
  conference: [
    { id: 'hero', label: 'Hero' },
    { id: 'sections', label: 'Section copy' },
    { id: 'lists', label: 'Lists' },
    { id: 'speakers-page', label: 'Speakers page' },
    { id: 'embedded', label: 'Embedded blocks' },
    { id: 'visibility', label: 'Visibility' },
    { id: 'seo', label: 'SEO' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'publish', label: 'Publish' },
  ],
  registrations: [
    { id: 'submissions', label: 'Submissions' },
    { id: 'form', label: 'Form copy' },
    { id: 'operations', label: 'Operations' },
    { id: 'seo', label: 'SEO' },
  ],
  users: [
    { id: 'team', label: 'Team members' },
    { id: 'permissions', label: 'Role permissions' },
  ],
};

const ALL_PAGES_WRITE = Object.fromEntries(
  (Object.keys(ADMIN_PAGE_META) as AdminPageId[]).map((id) => [id, 'write' as PageAccess]),
) as Record<AdminPageId, PageAccess>;

const ALL_PAGES_READ = Object.fromEntries(
  (Object.keys(ADMIN_PAGE_META) as AdminPageId[]).map((id) => [id, 'read' as PageAccess]),
) as Record<AdminPageId, PageAccess>;

function allSectionsEnabled(): RoleAccessConfig['sections'] {
  const sections: RoleAccessConfig['sections'] = {};
  for (const [pageId, items] of Object.entries(ADMIN_PAGE_SECTIONS)) {
    sections[pageId as AdminPageId] = Object.fromEntries(items!.map((s) => [s.id, true]));
  }
  return sections;
}

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissionsConfig = {
  editor: {
    pages: { ...ALL_PAGES_WRITE, users: 'none' },
    sections: allSectionsEnabled(),
  },
  viewer: {
    pages: { ...ALL_PAGES_READ, users: 'none' },
    sections: allSectionsEnabled(),
  },
};

export function mergeAdminPermissions(
  raw: Partial<AdminPermissionsConfig> | null | undefined,
): AdminPermissionsConfig {
  const base = structuredClone(DEFAULT_ADMIN_PERMISSIONS);
  if (!raw) return base;
  for (const role of ['editor', 'viewer'] as const) {
    const patch = raw[role];
    if (!patch) continue;
    base[role].pages = { ...base[role].pages, ...patch.pages };
    if (patch.sections) {
      for (const [pageId, sectionMap] of Object.entries(patch.sections)) {
        base[role].sections[pageId as AdminPageId] = {
          ...base[role].sections[pageId as AdminPageId],
          ...sectionMap,
        };
      }
    }
  }
  return base;
}

export function pageIdFromPath(pathname: string): AdminPageId | null {
  const entry = (Object.entries(ADMIN_PAGE_META) as [AdminPageId, (typeof ADMIN_PAGE_META)[AdminPageId]][]).find(
    ([, meta]) => pathname === meta.path || pathname.startsWith(`${meta.path}/`),
  );
  return entry?.[0] ?? null;
}

export function resolvePageAccess(
  role: string,
  pageId: AdminPageId,
  config: AdminPermissionsConfig,
): PageAccess {
  if (role === 'super_admin' || role === 'admin') return 'write';
  const roleKey = role === 'viewer' ? 'viewer' : 'editor';
  return config[roleKey].pages[pageId] ?? DEFAULT_ADMIN_PERMISSIONS[roleKey].pages[pageId] ?? 'none';
}

export function canAccessPage(
  role: string,
  pageId: AdminPageId,
  config: AdminPermissionsConfig,
): boolean {
  return resolvePageAccess(role, pageId, config) !== 'none';
}

export function canWritePage(
  role: string,
  pageId: AdminPageId,
  config: AdminPermissionsConfig,
): boolean {
  return resolvePageAccess(role, pageId, config) === 'write';
}

export function canAccessSection(
  role: string,
  pageId: AdminPageId,
  sectionId: string,
  config: AdminPermissionsConfig,
): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  if (!canAccessPage(role, pageId, config)) return false;
  const roleKey = role === 'viewer' ? 'viewer' : 'editor';
  const map = config[roleKey].sections[pageId];
  if (!map) return true;
  return map[sectionId] !== false;
}

export function filterSubnavByPermissions<T extends { id: string }>(
  role: string,
  pageId: AdminPageId,
  items: T[],
  config: AdminPermissionsConfig,
): T[] {
  return items.filter((item) => canAccessSection(role, pageId, item.id, config));
}
