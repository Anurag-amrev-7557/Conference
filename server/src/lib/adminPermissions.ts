/** Server mirror of src/lib/adminPermissions defaults — keep page ids in sync. */

export type AdminPageId =
  | 'dashboard'
  | 'homepage'
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

const PAGE_IDS: AdminPageId[] = [
  'dashboard',
  'homepage',
  'design',
  'settings',
  'media',
  'blogs',
  'events',
  'conference',
  'registrations',
  'newsletter',
  'users',
];

function allSectionsEnabled(): RoleAccessConfig['sections'] {
  return {
    homepage: {
      hero: true,
      stats: true,
      showcase: true,
      perks: true,
      sections: true,
      visibility: true,
      seo: true,
    },
    design: { colors: true, typography: true, tokens: true, branding: true },
    settings: { seo: true, navigation: true, pages: true, advanced: true },
    blogs: { articles: true, page: true, seo: true },
    events: { events: true, page: true, seo: true },
    conference: { hero: true, sections: true, lists: true, seo: true, publish: true },
    registrations: { submissions: true, form: true },
  };
}

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissionsConfig = {
  editor: {
    pages: Object.fromEntries(PAGE_IDS.map((id) => [id, id === 'users' ? 'none' : 'write'])) as Record<
      AdminPageId,
      PageAccess
    >,
    sections: allSectionsEnabled(),
  },
  viewer: {
    pages: Object.fromEntries(PAGE_IDS.map((id) => [id, id === 'users' ? 'none' : 'read'])) as Record<
      AdminPageId,
      PageAccess
    >,
    sections: allSectionsEnabled(),
  },
};

export function mergeAdminPermissions(raw: unknown): AdminPermissionsConfig {
  const base = JSON.parse(JSON.stringify(DEFAULT_ADMIN_PERMISSIONS)) as AdminPermissionsConfig;
  if (!raw || typeof raw !== 'object') return base;
  const input = raw as Partial<AdminPermissionsConfig>;
  for (const role of ['editor', 'viewer'] as const) {
    const patch = input[role];
    if (!patch || typeof patch !== 'object') continue;
    if (patch.pages) base[role].pages = { ...base[role].pages, ...patch.pages };
    if (patch.sections) {
      for (const [pageId, sectionMap] of Object.entries(patch.sections)) {
        if (!sectionMap || typeof sectionMap !== 'object') continue;
        base[role].sections[pageId as AdminPageId] = {
          ...base[role].sections[pageId as AdminPageId],
          ...sectionMap,
        };
      }
    }
  }
  return base;
}

export async function loadAdminPermissions(): Promise<AdminPermissionsConfig> {
  const prisma = (await import('./prisma')).default;
  const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  if (!content?.settings) return DEFAULT_ADMIN_PERMISSIONS;
  try {
    const settings = JSON.parse(content.settings) as { adminPermissions?: unknown };
    return mergeAdminPermissions(settings.adminPermissions);
  } catch {
    return DEFAULT_ADMIN_PERMISSIONS;
  }
}

export function resolvePermissionsForRole(
  role: string,
  config: AdminPermissionsConfig,
): RoleAccessConfig & { isSuperAdmin: boolean } {
  if (role === 'super_admin' || role === 'admin') {
    return {
      isSuperAdmin: true,
      pages: Object.fromEntries(PAGE_IDS.map((id) => [id, 'write' as PageAccess])) as Record<
        AdminPageId,
        PageAccess
      >,
      sections: allSectionsEnabled(),
    };
  }
  const key = role === 'viewer' ? 'viewer' : 'editor';
  return { isSuperAdmin: false, ...config[key] };
}
