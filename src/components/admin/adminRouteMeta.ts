import type { AdminPageId } from '../../lib/adminPermissions';

export type AdminRouteMeta = {
  title: string;
  wide: boolean;
  pageId: AdminPageId;
};

export const ADMIN_ROUTE_META: Record<string, AdminRouteMeta> = {
  dashboard: { title: 'Dashboard', wide: false, pageId: 'dashboard' },
  design: { title: 'Brand & theme', wide: true, pageId: 'design' },
  media: { title: 'Media', wide: true, pageId: 'media' },
  blogs: { title: 'Blog workspace', wide: true, pageId: 'blogs' },
  events: { title: 'Events workspace', wide: true, pageId: 'events' },
  settings: { title: 'Site settings', wide: true, pageId: 'settings' },
  conference: { title: 'Summit homepage', wide: true, pageId: 'conference' },
  newsletter: { title: 'Newsletter signups', wide: true, pageId: 'newsletter' },
  users: { title: 'Team & access', wide: true, pageId: 'users' },
  registrations: { title: 'Registrations', wide: true, pageId: 'registrations' },
};

export function adminSegmentFromPath(pathname: string): string {
  const segment = pathname.replace(/^\/admin\/?/, '').split('/')[0];
  return segment || 'dashboard';
}

export function adminRouteMetaForPath(pathname: string): AdminRouteMeta {
  const segment = adminSegmentFromPath(pathname);
  return ADMIN_ROUTE_META[segment] ?? ADMIN_ROUTE_META.dashboard;
}
