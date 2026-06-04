import prisma from './prisma';
import { mergeDesignationOptions } from './registrationDesignations';
import { defaultConferenceRegistrationForm } from './registrationDefaults';

export const DEFAULT_TICKET_PRICE_CENTS = 2000;

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

/** Merged conference registration CMS settings (DB + defaults). */
export async function getConferenceRegistrationSettings() {
  const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  const settings = safeParseSettings(content?.settings);
  const saved = settings.conferenceRegistration as Record<string, unknown> | undefined;

  const ticketPriceCents =
    typeof saved?.ticketPriceCents === 'number' && Number.isFinite(saved.ticketPriceCents)
      ? saved.ticketPriceCents
      : defaultConferenceRegistrationForm.ticketPriceCents;

  return {
    ...defaultConferenceRegistrationForm,
    ...saved,
    ticketPriceCents,
    registrationOpen:
      typeof saved?.registrationOpen === 'boolean'
        ? saved.registrationOpen
        : defaultConferenceRegistrationForm.registrationOpen,
    fields: {
      ...defaultConferenceRegistrationForm.fields,
      ...(saved?.fields as Record<string, unknown> | undefined),
    },
    designationOptions: mergeDesignationOptions(
      Array.isArray(saved?.designationOptions)
        ? (saved.designationOptions as { value: string; label: string; description?: string }[])
        : undefined,
      defaultConferenceRegistrationForm.designationOptions,
    ),
    panelStats:
      Array.isArray(saved?.panelStats) && saved.panelStats.length
        ? saved.panelStats
        : defaultConferenceRegistrationForm.panelStats,
    panelQuote: {
      ...defaultConferenceRegistrationForm.panelQuote,
      ...(saved?.panelQuote as Record<string, unknown> | undefined),
    },
    trustFooter: {
      ...defaultConferenceRegistrationForm.trustFooter,
      ...(saved?.trustFooter as Record<string, unknown> | undefined),
      logos:
        Array.isArray((saved?.trustFooter as { logos?: unknown })?.logos) &&
        (saved?.trustFooter as { logos: unknown[] }).logos.length
          ? (saved?.trustFooter as { logos: string[] }).logos
          : defaultConferenceRegistrationForm.trustFooter.logos,
    },
  };
}
