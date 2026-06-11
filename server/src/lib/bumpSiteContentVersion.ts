import prisma from './prisma';

/** Blog/event edits do not PATCH site_content — bump version so bootstrap cache invalidates. */
export async function bumpSiteContentVersion(): Promise<void> {
  await prisma.siteContent.update({
    where: { id: 'global' },
    data: { version: { increment: 1 } },
  });
}
