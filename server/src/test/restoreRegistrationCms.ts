import prisma from '../lib/prisma';
import { defaultConferenceRegistrationForm } from '../lib/registrationDefaults';

function safeParseSettings(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** Reset summit registration CMS copy polluted by integration tests. */
export async function restoreRegistrationCms() {
  const row = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  if (!row) return false;

  const settings = safeParseSettings(row.settings);
  settings.conferenceRegistration = defaultConferenceRegistrationForm;

  const routeSeo = (settings.routeSeo ?? {}) as Record<
    string,
    { title?: string; description?: string }
  >;
  const registerSeo = routeSeo['/register'];
  if (
    registerSeo?.title?.startsWith('Register SEO ') ||
    registerSeo?.description === 'Custom register meta description.'
  ) {
    delete routeSeo['/register'];
    settings.routeSeo = routeSeo;
  }

  if (typeof settings.seo === 'object' && settings.seo !== null) {
    const seo = settings.seo as { title?: string };
    if (seo.title?.startsWith('seo-preserve-')) {
      delete settings.seo;
    }
  }

  await prisma.siteContent.update({
    where: { id: 'global' },
    data: { settings: JSON.stringify(settings) },
  });

  return true;
}
