export type RegistrationDesignation = 'enterprise' | 'student' | 'individual';

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface RegistrationFieldCopy {
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface RegistrationDesignationOption {
  value: RegistrationDesignation;
  label: string;
  description?: string;
}

export interface RegistrationPanelQuote {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface RegistrationTrustFooter {
  eyebrow: string;
  title: string;
  logos: string[];
}

export interface ConferenceRegistrationFormSettings {
  pageTitle: string;
  pageTitleAccent?: string;
  pageLede: string;
  panelEyebrow: string;
  panelHeadline: string;
  panelHeadlineAccent?: string;
  panelLede: string;
  panelStats: { value: string; label: string }[];
  panelQuote: RegistrationPanelQuote;
  trustFooter: RegistrationTrustFooter;
  formKicker: string;
  formTitle: string;
  formSubtitle: string;
  priceLabel: string;
  priceAmount: string;
  /** Charged on new submissions (public form + admin create). */
  ticketPriceCents: number;
  priceNote?: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  fields: {
    name: RegistrationFieldCopy;
    email: RegistrationFieldCopy;
    phone: RegistrationFieldCopy;
    linkedIn: RegistrationFieldCopy;
    designation: RegistrationFieldCopy;
  };
  designationOptions: RegistrationDesignationOption[];
  /** Admin inbox for new registration alerts (approve/deny links). */
  notifyEmail?: string;
  notifyOnSubmit?: boolean;
  /** Email registrant when status becomes confirmed or cancelled. */
  sendRegistrantEmails?: boolean;
  /** When false, public registration form is closed. */
  registrationOpen?: boolean;
  registrationClosedMessage?: string;
}

export interface ConferenceRegistrationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedIn: string;
  designation: RegistrationDesignation;
  ticketPriceCents: number;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}
