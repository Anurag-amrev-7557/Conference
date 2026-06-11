/**
 * skeleton-only — offline defaults before the API loads.
 * Authoritative demo and production content lives in server/src/seed.ts (BACK-06).
 */
import { BookOpen, Cpu, TrendingUp, MessageSquare, Zap, Shield, Database, Bot, Send } from "lucide-react";
import type { ConferenceRegistrationFormSettings } from './registrationTypes';

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  time: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  isPublished: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface EventSeoFields {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface EventTag {
  name: string;
  color: string;
}

export interface AppEvent extends EventSeoFields {
  id: string;
  day: string;
  weekday: string;
  time: string;
  full_time: string;
  title: string;
  host: string;
  location: string;
  description?: string;
  tags: EventTag[];
  price: string;
  thumbnail: string;
  status: 'Upcoming' | 'Past';
  isPublished: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;
  registrationUrl?: string;
  registrationOpen?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  lat?: number;
  lng?: number;
}

export interface SiteBookSettings {
  title?: string;
  tagline?: string;
  abstract?: string;
  authorName?: string;
  authorUrl?: string;
  isbn?: string;
  coverImageUrl?: string;
  publisherName?: string;
  publisherUrl?: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface Pillar {
  id: string;
  iconName: 'BookOpen' | 'Cpu' | 'TrendingUp' | 'Database' | 'Send' | 'Bot';
  title: string;
  description: string;
  prompt?: string;
  color?: string;
}

export interface Perk {
  id: string;
  iconName: 'MessageSquare' | 'BookOpen' | 'Zap' | 'Shield';
  title: string;
  label: string;
  description: string;
}

export interface HeroContent {
  tagline: string;
  headline: string;
  headlineAccent: string;
  subtitle: string;
  videoUrl: string;
  primaryCtaLabel?: string;
}

export interface CatalogHeroContent {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  lede?: string;
}

export interface CatalogPageSettings extends CatalogHeroContent {
  searchPlaceholder?: string;
  pageSize?: number;
  filters?: { id: string; label: string }[];
  emptyStateTitle?: string;
  emptyStateBody?: string;
  emptyStateCtaLabel?: string;
  emptyStateCtaHref?: string;
  layout?: 'grid' | 'list' | 'grid-list-toggle';
}

export interface SectionCtaBundle {
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  emptyStateTitle?: string;
  emptyStateBody?: string;
  emptyStateCtaLabel?: string;
  emptyStateCtaHref?: string;
}

export interface SectionBlockContent extends SectionCtaBundle {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  lede?: string;
  founderCountLabel?: string;
  /** Shown when a preview section has no published items (blog/events). */
  emptyState?: string;
  previewCount?: number;
  featuredArticleIds?: string[];
  featuredEventIds?: string[];
  cardCtaUpcoming?: string;
  cardCtaPast?: string;
  sectionAnchor?: string;
}

export interface FinalCtaContent extends SectionBlockContent {
  trustItems?: string[];
  displayMode?: 'summit-buttons' | 'waitlist' | 'auto';
  hideTrustRow?: boolean;
  formNote?: string;
  waitlistSubmitLabel?: string;
  waitlistPlaceholder?: string;
  waitlistGuideLabel?: string;
  waitlistSuccessTitle?: string;
  waitlistSuccessCopy?: string;
}

export interface RouteSeoOverride {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface ConferenceMetric {
  id: string;
  value: string;
  label: string;
}

export interface ConferenceHeroContent {
  badge: string;
  badgeLogoUrl?: string;
  title: string;
  titleAccent: string;
  lede: string;
  dateLabel: string;
  locationLabel: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel: string;
  secondaryCtaHref?: string;
  showMetrics?: boolean;
  videoUrl?: string;
  posterUrl?: string;
  metrics: ConferenceMetric[];
}

export interface ConferenceSectionCopy extends SectionCtaBundle {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  lede?: string;
  caption?: string;
  playButtonLabel?: string;
  errorMessage?: string;
  trackFilterLabel?: string;
  registerCtaLabel?: string;
  registerCtaHref?: string;
  downloadCtaLabel?: string;
  featuredBadgeLabel?: string;
  /** Optional stat chips — used by the featured video section. */
  metrics?: ConferenceMetric[];
}

/** Video asset URLs on the conference root — caption, CTA, and metrics live on `sections.video`. */
export interface ConferenceVideoContent {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  lede?: string;
  videoUrl?: string;
  posterUrl?: string;
}

export type SpeakerRoster = 'current' | 'past';

export interface ConferenceSpeaker {
  id: string;
  name: string;
  title: string;
  company: string;
  image: string;
  /** When true, shown on the summit homepage speaker carousel. */
  featured?: boolean;
  /** Defaults to `current` when omitted. */
  roster?: SpeakerRoster;
  /** Summit edition label, e.g. "2024", "2025". */
  edition?: string;
  bio?: string;
  talkTitle?: string;
  timeSlot?: string;
  linkedIn?: string;
  twitter?: string;
}

export interface ConferenceAgendaSession {
  id: string;
  time: string;
  title: string;
  speaker: string;
  track: string;
  /** Optional link to a speaker record in the roster. */
  speakerId?: string;
  /** e.g. "90 min" or "1 hr" */
  duration?: string;
  room?: string;
  description?: string;
}

export interface ConferenceAgendaDay {
  id: string;
  label: string;
  sessions: ConferenceAgendaSession[];
}

export interface ConferenceFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ConferenceTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
}

export interface ConferenceLogo {
  id: string;
  name: string;
  logoUrl?: string;
  logoAlt?: string;
  websiteUrl?: string;
  tier?: string;
  description?: string;
}

export interface ConferenceTicketTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended: boolean;
  ctaLabel?: string;
}

export interface ConferenceTicketsContent {
  eyebrow?: string;
  title?: string;
  lede?: string;
  tiers: ConferenceTicketTier[];
}

export interface ConferenceVenueContent {
  eyebrow?: string;
  title?: string;
  lede?: string;
  address?: string;
  mapEmbedUrl?: string;
}

export interface ConferenceSectionVisibility {
  hero?: boolean;
  countdown?: boolean;
  speakers?: boolean;
  video?: boolean;
  agenda?: boolean;
  sponsors?: boolean;
  partners?: boolean;
  testimonials?: boolean;
  pastSpeakers?: boolean;
  venue?: boolean;
  tickets?: boolean;
  faq?: boolean;
}

export type ConferenceSectionId =
  | 'countdown'
  | 'speakers'
  | 'video'
  | 'agenda'
  | 'sponsors'
  | 'partners'
  | 'testimonials'
  | 'pastSpeakers'
  | 'venue'
  | 'tickets'
  | 'faq';

export type EmbeddedBlockId = 'showcase' | 'blog' | 'events' | 'finalCta';

export interface ConferenceContent {
  published?: boolean;
  eventStartAt?: string;
  eventTimezone?: string;
  countdownEnabled?: boolean;
  /** Render order for summit flow sections (excludes hero). */
  sectionOrder?: ConferenceSectionId[];
  /** Render order for embedded blocks after summit sections. */
  embeddedBlockOrder?: EmbeddedBlockId[];
  /** Optional manual ordering/limit for homepage featured speakers. */
  homepageSpeakerIds?: string[];
  maxFeaturedSpeakers?: number;
  /** Optional manual ordering/limit for homepage past speakers. */
  homepagePastSpeakerIds?: string[];
  maxPastSpeakers?: number;
  /** Per-block toggles for summit homepage sections at /. */
  sectionVisibility?: ConferenceSectionVisibility;
  venue?: ConferenceVenueContent;
  hero: ConferenceHeroContent;
  video?: ConferenceVideoContent;
  sections: {
    /** @deprecated Use sponsors — kept for legacy CMS rows */
    socialProof?: ConferenceSectionCopy;
    sponsors?: ConferenceSectionCopy;
    video?: ConferenceSectionCopy;
    speakers?: ConferenceSectionCopy;
    agenda?: ConferenceSectionCopy;
    faq?: ConferenceSectionCopy;
    tickets?: ConferenceSectionCopy;
    partners?: ConferenceSectionCopy;
    testimonials?: ConferenceSectionCopy;
    pastSpeakers?: ConferenceSectionCopy;
  };
  tickets?: ConferenceTicketsContent;
  logos: ConferenceLogo[];
  partners: ConferenceLogo[];
  speakers: ConferenceSpeaker[];
  agenda: ConferenceAgendaDay[];
  faq: ConferenceFaqItem[];
  testimonials: ConferenceTestimonial[];
}

export interface NavLink {
  id: string;
  name: string;
  href: string;
}

export interface SocialLink {
  id: string;
  platform: 'LinkedIn' | 'Youtube' | 'Instagram' | 'X';
  href: string;
}

export interface HomepageContent {
  hero: HeroContent;
  stats: Stat[];
  pillars: Pillar[];
  perks: Perk[];
}

export interface FooterSettings {
  tagline?: string;
  copyright?: string;
  registryStatusLabel?: string;
  /** Footer registry row — defaults to header primary CTA label when empty. */
  registryCtaLabel?: string;
  /** Override registry button URL — defaults to header primary CTA href. */
  registryCtaHref?: string;
  navColumnTitle?: string;
  socialColumnTitle?: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyLabel?: string;
  termsLabel?: string;
}

export interface CookieBannerSettings {
  enabled?: boolean;
  text?: string;
  acceptLabel?: string;
  policyUrl?: string;
}

export interface NotFoundSettings {
  eyebrow?: string;
  title?: string;
  lede?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface BlogCtaSettings {
  title?: string;
  lede?: string;
  buttonLabel?: string;
}

export interface LeadCaptureModalSettings {
  title?: string;
  lede?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  emailPlaceholder?: string;
}

export interface BlogCategoryOption {
  id: string;
  label: string;
}

export interface RouteVisibilitySettings {
  blog?: boolean;
  events?: boolean;
  speakers?: boolean;
  register?: boolean;
}

export interface SiteSettings {
  homepage?: HomepageContent;
  seo: {
    title: string;
    description: string;
    ogImage?: string;
    googleSiteVerification?: string;
    ogSiteName?: string;
    ogLocale?: string;
    twitterSite?: string;
  };
  catalogPages?: {
    blog?: CatalogPageSettings;
    events?: CatalogPageSettings;
    speakers?: CatalogPageSettings;
  };
  blogCategories?: BlogCategoryOption[];
  leadCaptureModal?: LeadCaptureModalSettings;
  routeVisibility?: RouteVisibilitySettings;
  sections?: {
    finalCta?: FinalCtaContent;
    whoWeAre?: SectionBlockContent;
    blogPreview?: SectionBlockContent;
    eventsPreview?: SectionBlockContent;
    bookShowcase?: SectionBlockContent;
    /** Header copy for the homepage perks / community block. */
    community?: SectionBlockContent;
  };
  footer?: FooterSettings;
  cookieBanner?: CookieBannerSettings;
  notFound?: NotFoundSettings;
  blogCta?: BlogCtaSettings;
  newsletter?: {
    enabled?: boolean;
  };
  adminPermissions?: import('./adminPermissions').AdminPermissionsConfig;
  routeSeo?: Partial<
    Record<
      '/' | '/home' | '/blog' | '/events' | '/speakers' | '/conference' | '/register',
      RouteSeoOverride
    >
  >;
  conference?: ConferenceContent;
  conferenceRegistration?: ConferenceRegistrationFormSettings;
  book?: SiteBookSettings;
  navigation: {
    links: NavLink[];
    socials: SocialLink[];
    footerLinks: NavLink[];
    primaryCta: { label: string; href: string };
    navbarVisible?: boolean;
    brandLogoAlt?: string;
  };
  visibility: {
    showcase: boolean;
    blog: boolean;
    events: boolean;
    finalCta?: boolean;
    footer?: boolean;
  };
  customCss: string;
  scripts: {
    header: string;
    footer: string;
  };
}

export interface SiteAppearance {
  primaryColor: string;
  brandName: string;
  brandLogoText: string;
  brandLogoUrl?: string;
  typography: {
    headingFont: 'serif' | 'sans' | 'mono';
    bodyFont: 'serif' | 'sans' | 'mono';
    baseSize: 'small' | 'medium' | 'large';
  };
  theme: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    buttonStyle: 'flat' | 'outline' | 'glass';
    shadowIntensity: 'none' | 'soft' | 'heavy';
  };
}

export interface WebsiteData {
  hero: HeroContent;
  articles: Article[];
  events: AppEvent[];
  stats: Stat[];
  pillars: Pillar[];
  perks: Perk[];
  settings: SiteSettings;
  appearance: SiteAppearance;
}

import { structuralDefaults } from './structuralDefaults';

/** Offline structural shell — authoritative content comes from cms-bootstrap + API. */
export const initialData: WebsiteData = structuralDefaults;

export const pillarIcons = {
  BookOpen,
  Cpu,
  TrendingUp,
  Database,
  Bot,
  Send
};

export const perkIcons = {
  MessageSquare,
  BookOpen,
  Zap,
  Shield,
};
