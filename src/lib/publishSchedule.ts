/** Whether content should appear on the public site right now. */
export function isEffectivelyPublished(item: {
  isPublished?: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;
}): boolean {
  if (!item.isPublished) return false;
  const now = Date.now();
  if (item.publishAt) {
    const t = new Date(item.publishAt).getTime();
    if (!Number.isNaN(t) && t > now) return false;
  }
  if (item.unpublishAt) {
    const t = new Date(item.unpublishAt).getTime();
    if (!Number.isNaN(t) && t <= now) return false;
  }
  return true;
}

export function formatScheduleHint(item: {
  publishAt?: string | null;
  unpublishAt?: string | null;
}): string | null {
  const parts: string[] = [];
  if (item.publishAt) {
    parts.push(`Publishes ${new Date(item.publishAt).toLocaleString()}`);
  }
  if (item.unpublishAt) {
    parts.push(`Unpublishes ${new Date(item.unpublishAt).toLocaleString()}`);
  }
  return parts.length ? parts.join(' · ') : null;
}

export type ScheduleBadge = 'scheduled' | 'expired' | null;

/** Badge for admin lists when publish flag is on but schedule hides content. */
export function getScheduleBadge(item: {
  isPublished?: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;
}): ScheduleBadge {
  if (!item.isPublished) return null;
  const now = Date.now();
  if (item.publishAt) {
    const t = new Date(item.publishAt).getTime();
    if (!Number.isNaN(t) && t > now) return 'scheduled';
  }
  if (item.unpublishAt) {
    const t = new Date(item.unpublishAt).getTime();
    if (!Number.isNaN(t) && t <= now) return 'expired';
  }
  return null;
}
