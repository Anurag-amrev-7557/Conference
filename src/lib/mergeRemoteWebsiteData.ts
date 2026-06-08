import type { WebsiteData } from './websiteData';
import { initialData } from './websiteData';
import { mergeConferenceContent } from './conferenceDefaults';
import { defaultConferenceRegistrationForm } from './registrationDefaults';
import { hydrateHomepage } from './homepageContent';
import { mergeRemoteSettings } from './mergeRemoteSettings';

/** Deep-merge API payload into defaults — shared by initial load and background refresh. */
export function mergeRemoteWebsiteData(remoteData: Record<string, unknown>): WebsiteData {
  const merged = { ...initialData, ...remoteData } as WebsiteData;

  if (remoteData.appearance && typeof remoteData.appearance === 'object') {
    const appearance = remoteData.appearance as WebsiteData['appearance'];
    merged.appearance = { ...initialData.appearance, ...appearance };
    if (appearance.typography) {
      merged.appearance.typography = {
        ...initialData.appearance.typography,
        ...appearance.typography,
      };
    }
    if (appearance.theme) {
      merged.appearance.theme = { ...initialData.appearance.theme, ...appearance.theme };
    }
  }

  if (remoteData.settings && typeof remoteData.settings === 'object') {
    const remoteSettings = remoteData.settings as WebsiteData['settings'];
    merged.settings = mergeRemoteSettings(remoteSettings);
    merged.settings.conference = mergeConferenceContent(remoteSettings.conference);
    const fromApi = remoteSettings.conferenceRegistration;
    if (fromApi) {
      const ticketPriceCents =
        typeof fromApi.ticketPriceCents === 'number'
          ? fromApi.ticketPriceCents
          : defaultConferenceRegistrationForm.ticketPriceCents;
      merged.settings.conferenceRegistration = {
        ...defaultConferenceRegistrationForm,
        ...fromApi,
        ticketPriceCents,
        fields: {
          ...defaultConferenceRegistrationForm.fields,
          ...fromApi.fields,
          name: {
            ...defaultConferenceRegistrationForm.fields.name,
            ...fromApi.fields?.name,
          },
          email: {
            ...defaultConferenceRegistrationForm.fields.email,
            ...fromApi.fields?.email,
          },
          phone: {
            ...defaultConferenceRegistrationForm.fields.phone,
            ...fromApi.fields?.phone,
          },
          linkedIn: {
            ...defaultConferenceRegistrationForm.fields.linkedIn,
            ...fromApi.fields?.linkedIn,
          },
          designation: {
            ...defaultConferenceRegistrationForm.fields.designation,
            ...fromApi.fields?.designation,
          },
        },
        designationOptions:
          fromApi.designationOptions?.length
            ? fromApi.designationOptions
            : defaultConferenceRegistrationForm.designationOptions,
        panelStats:
          fromApi.panelStats?.length
            ? fromApi.panelStats
            : defaultConferenceRegistrationForm.panelStats,
        panelQuote: {
          ...defaultConferenceRegistrationForm.panelQuote,
          ...fromApi.panelQuote,
        },
        trustFooter: {
          ...defaultConferenceRegistrationForm.trustFooter,
          ...fromApi.trustFooter,
          logos:
            fromApi.trustFooter?.logos?.length
              ? fromApi.trustFooter.logos
              : defaultConferenceRegistrationForm.trustFooter.logos,
        },
      };
    } else {
      merged.settings.conferenceRegistration = defaultConferenceRegistrationForm;
    }
  }

  if (remoteData.hero && typeof remoteData.hero === 'object') {
    const { secondaryCtaHref: _href, secondaryCtaLabel: _label, ...hero } =
      remoteData.hero as WebsiteData['hero'] & {
        secondaryCtaHref?: string;
        secondaryCtaLabel?: string;
      };
    merged.hero = { ...initialData.hero, ...hero };
  }

  if (Array.isArray(remoteData.stats)) {
    merged.stats = remoteData.stats as WebsiteData['stats'];
  }
  if (Array.isArray(remoteData.pillars)) {
    merged.pillars = remoteData.pillars as WebsiteData['pillars'];
  }
  if (Array.isArray(remoteData.perks)) {
    merged.perks = remoteData.perks as WebsiteData['perks'];
  }
  if (Array.isArray(remoteData.articles)) {
    merged.articles = remoteData.articles as WebsiteData['articles'];
  }
  if (Array.isArray(remoteData.events)) {
    merged.events = remoteData.events as WebsiteData['events'];
  }

  return hydrateHomepage(merged);
}
