import { summitRegisterLogos, summitRegisterQuote } from '../data/summitRegisterOptions';
import type { ConferenceRegistrationFormSettings } from './registrationTypes';

export const DEFAULT_TICKET_PRICE_CENTS = 2000;

export function formatPriceFromCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
}

export const defaultConferenceRegistrationForm: ConferenceRegistrationFormSettings = {
  pageTitle: 'Reserve your',
  pageTitleAccent: 'pass',
  pageLede: '',
  panelEyebrow: 'Superhumanly Summit 2026',
  panelHeadline: 'Two days of',
  panelHeadlineAccent: 'high-signal AI',
  panelLede:
    'Founders, operators, and builders — keynotes, workshops, and conversations that ship.',
  panelStats: [
    { value: '3,500+', label: 'Attendees' },
    { value: '150+', label: 'Speakers' },
    { value: '2', label: 'Days' },
  ],
  panelQuote: { ...summitRegisterQuote },
  trustFooter: {
    eyebrow: 'Trusted worldwide',
    title: 'Builders and teams shipping AI at scale',
    logos: [...summitRegisterLogos],
  },
  formKicker: '',
  formTitle: '',
  formSubtitle: 'We’ll email your confirmation within one business day.',
  priceLabel: 'Summit pass',
  priceAmount: formatPriceFromCents(DEFAULT_TICKET_PRICE_CENTS),
  ticketPriceCents: DEFAULT_TICKET_PRICE_CENTS,
  priceNote: 'Per attendee · secure checkout coming soon',
  submitLabel: 'Complete registration',
  successTitle: 'You’re registered',
  successMessage:
    'Thanks for reserving your pass. We sent a receipt to {email} — our team will confirm your spot within one business day.',
  fields: {
    name: { label: 'Full name', placeholder: 'Jane Doe', required: true },
    email: { label: 'Email', placeholder: 'you@company.com', required: true },
    phone: { label: 'Phone number', placeholder: '+1 (555) 000-0000', required: true },
    linkedIn: {
      label: 'LinkedIn',
      placeholder: 'linkedin.com/in/yourprofile',
      required: true,
    },
    designation: { label: 'I’m registering as', required: true },
  },
  designationOptions: [
    {
      value: 'enterprise',
      label: 'Enterprise',
      description: 'Company-sponsored or team pass',
    },
    {
      value: 'student',
      label: 'Student',
      description: 'Currently enrolled in a degree program',
    },
    {
      value: 'individual',
      label: 'Individual',
      description: 'Independent founder, operator, or builder',
    },
    {
      value: 'sponsor',
      label: 'Sponsor',
      description: 'Partner, exhibitor, or sponsorship inquiry',
    },
  ],
  notifyEmail: '',
  notifyOnSubmit: true,
  sendRegistrantEmails: true,
  registrationOpen: true,
  registrationClosedMessage:
    'Registration is closed for this summit. Join our waitlist on the homepage for future events.',
  showSiteFooter: true,
  validationMessages: {
    nameRequired: 'Please enter your full name.',
    emailRequired: 'Please enter your email.',
    emailInvalid: 'Please enter a valid email address.',
    phoneRequired: 'Please enter your phone number.',
    linkedInRequired: 'Please enter your LinkedIn profile.',
    designationRequired: 'Please select how you are registering.',
  },
};
