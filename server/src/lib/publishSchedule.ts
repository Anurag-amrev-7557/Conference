/** Whether content should appear on the public site right now. */
export function isEffectivelyPublished(item: {
  isPublished: boolean;
  publishAt?: Date | null;
  unpublishAt?: Date | null;
}): boolean {
  if (!item.isPublished) return false;
  const now = Date.now();
  if (item.publishAt) {
    const t = item.publishAt.getTime();
    if (!Number.isNaN(t) && t > now) return false;
  }
  if (item.unpublishAt) {
    const t = item.unpublishAt.getTime();
    if (!Number.isNaN(t) && t <= now) return false;
  }
  return true;
}

export function scheduledArticleWhere(now = new Date()) {
  return {
    isPublished: true,
    deletedAt: null,
    AND: [
      { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
      { OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }] },
    ],
  };
}

export function scheduledEventWhere(now = new Date()) {
  return scheduledArticleWhere(now);
}
