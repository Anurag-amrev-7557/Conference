import prisma from './prisma';

const safeParse = (str: string | null | undefined, fallback: unknown = {}) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

export async function getNewsletterSettings(): Promise<{ enabled: boolean }> {
  const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  const settings = safeParse(content?.settings, {}) as { newsletter?: { enabled?: boolean } };
  return { enabled: settings.newsletter?.enabled !== false };
}
