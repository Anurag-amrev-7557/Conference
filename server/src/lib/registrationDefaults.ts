const defaultPanelQuote = {
  quote:
    'The summit packed more signal into two days than a quarter of conference-hopping—every session felt built for operators who ship.',
  name: 'Priya Sharma',
  role: 'Head of AI, Northwind Labs',
  initials: 'PS',
};

const defaultTrustFooter = {
  eyebrow: 'Trusted worldwide',
  title: 'Builders and teams shipping AI at scale',
  logos: ['Anthropic', 'OpenAI', 'Stripe', 'Notion', 'Figma', 'Linear'],
};

export const defaultConferenceRegistrationForm = {
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
  panelQuote: defaultPanelQuote,
  trustFooter: defaultTrustFooter,
  formKicker: '',
  formTitle: '',
  formSubtitle: 'We’ll email your confirmation within one business day.',
  priceLabel: 'Summit pass',
  priceAmount: '$20',
  ticketPriceCents: 2000,
  priceNote: 'Per attendee · secure checkout coming soon',
  submitLabel: 'Complete registration',
  successTitle: 'You’re registered',
  successMessage:
    'Thanks for reserving your pass. We sent a confirmation to your email — see you at the summit.',
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
  ],
  /** Email that receives new registration alerts with approve/deny links */
  notifyEmail: '',
  notifyOnSubmit: true,
  sendRegistrantEmails: true,
  registrationOpen: true,
  registrationClosedMessage:
    'Registration is closed for this summit. Join our waitlist on the homepage for future events.',
};
