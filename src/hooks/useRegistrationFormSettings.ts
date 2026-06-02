import { useMemo } from 'react';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { defaultConferenceRegistrationForm } from '../lib/registrationDefaults';
import type { ConferenceRegistrationFormSettings } from '../lib/registrationTypes';

export function useRegistrationFormSettings(): ConferenceRegistrationFormSettings {
  const { data } = useWebsiteData();

  return useMemo(() => {
    const fromSettings = data.settings.conferenceRegistration;
    if (!fromSettings) return defaultConferenceRegistrationForm;

    const ticketPriceCents =
      typeof fromSettings.ticketPriceCents === 'number'
        ? fromSettings.ticketPriceCents
        : defaultConferenceRegistrationForm.ticketPriceCents;

    return {
      ...defaultConferenceRegistrationForm,
      ...fromSettings,
      ticketPriceCents,
      fields: {
        ...defaultConferenceRegistrationForm.fields,
        ...fromSettings.fields,
        name: {
          ...defaultConferenceRegistrationForm.fields.name,
          ...fromSettings.fields?.name,
        },
        email: {
          ...defaultConferenceRegistrationForm.fields.email,
          ...fromSettings.fields?.email,
        },
        phone: {
          ...defaultConferenceRegistrationForm.fields.phone,
          ...fromSettings.fields?.phone,
        },
        linkedIn: {
          ...defaultConferenceRegistrationForm.fields.linkedIn,
          ...fromSettings.fields?.linkedIn,
        },
        designation: {
          ...defaultConferenceRegistrationForm.fields.designation,
          ...fromSettings.fields?.designation,
        },
      },
      designationOptions:
        fromSettings.designationOptions?.length
          ? fromSettings.designationOptions
          : defaultConferenceRegistrationForm.designationOptions,
      panelStats:
        fromSettings.panelStats?.length
          ? fromSettings.panelStats
          : defaultConferenceRegistrationForm.panelStats,
      panelQuote: {
        ...defaultConferenceRegistrationForm.panelQuote,
        ...fromSettings.panelQuote,
      },
      sendRegistrantEmails:
        fromSettings.sendRegistrantEmails ?? defaultConferenceRegistrationForm.sendRegistrantEmails,
      registrationOpen:
        fromSettings.registrationOpen ?? defaultConferenceRegistrationForm.registrationOpen,
      registrationClosedMessage:
        fromSettings.registrationClosedMessage ??
        defaultConferenceRegistrationForm.registrationClosedMessage,
    };
  }, [data.settings.conferenceRegistration]);
}
