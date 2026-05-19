/**
 * skeleton-only — offline defaults before the API loads.
 * Authoritative demo and production content lives in server/src/seed.ts (BACK-06).
 */
import { BookOpen, Cpu, TrendingUp, MessageSquare, Zap, Shield, Database, Bot, Send } from "lucide-react";

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
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface EventTag {
  name: string;
  color: string;
}

export interface AppEvent {
  id: string;
  day: string;
  weekday: string;
  time: string;
  full_time: string;
  title: string;
  host: string;
  location: string;
  tags: EventTag[];
  price: string;
  thumbnail: string;
  status: 'Upcoming' | 'Past';
  isPublished: boolean;
  lat?: number;
  lng?: number;
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

export interface SiteSettings {
  seo: {
    title: string;
    description: string;
    ogImage?: string;
    googleSiteVerification?: string;
  };
  navigation: {
    links: NavLink[];
    socials: SocialLink[];
    footerLinks: NavLink[];
  };
  visibility: {
    hero: boolean;
    stats: boolean;
    showcase: boolean;
    pillars: boolean;
    whoWeAre: boolean;
    perks: boolean;
    community: boolean;
    blog: boolean;
    events: boolean;
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

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  replies?: CommunityComment[];
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  category: string;
  votes: number;
  comments: CommunityComment[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WebsiteData {
  hero: HeroContent;
  articles: Article[];
  events: AppEvent[];
  communityPosts: CommunityPost[];
  stats: Stat[];
  pillars: Pillar[];
  perks: Perk[];
  settings: SiteSettings;
  appearance: SiteAppearance;
}

export const initialData: WebsiteData = {
  hero: {
    tagline: "",
    headline: "",
    headlineAccent: "",
    subtitle: "",
    videoUrl: "",
  },
  communityPosts: [],
  settings: {
    seo: {
      title: "Superhumanly Playbook — Master Agentic AI Automation",
      description: "Scale your business and automate your workflows with the definitive Agentic AI Playbook. Join 2,500+ innovators today."
    },
    navigation: {
      links: [
        { id: "1", name: "Blog", href: "/blog" },
        { id: "2", name: "Community", href: "/community" },
        { id: "3", name: "About Us", href: "#who-we-are" },
        { id: "4", name: "Events", href: "/events" }
      ],
      socials: [
        { id: "1", platform: "LinkedIn", href: "https://linkedin.com/company/superhumanly" },
        { id: "2", platform: "Youtube", href: "https://youtube.com/@superhumanly" },
        { id: "3", platform: "Instagram", href: "https://instagram.com/superhumanly.ai" },
        { id: "4", platform: "X", href: "https://x.com/superhumanly" }
      ],
      footerLinks: [
        { id: "f1", name: 'The Playbook', href: '/blog' },
        { id: "f2", name: 'Founders Hub', href: '/community' },
        { id: "f3", name: 'Strategy', href: '/#who-we-are' },
        { id: "f4", name: 'Live Training', href: '/events' },
        { id: "f5", name: "Join Registry", href: "/#final-cta" }
      ]
    },
    visibility: {
      hero: true,
      stats: true,
      showcase: true,
      pillars: true,
      whoWeAre: true,
      perks: true,
      community: true,
      blog: true,
      events: true
    },
    customCss: "",
    scripts: {
      header: "",
      footer: ""
    }
  },
  appearance: {
    primaryColor: "#0052cc",
    brandName: "Superhumanly -Thoughts",
    brandLogoText: "S",
    typography: {
      headingFont: 'serif',
      bodyFont: 'sans',
      baseSize: 'medium'
    },
    theme: {
      borderRadius: 'lg',
      buttonStyle: 'glass',
      shadowIntensity: 'soft'
    }
  },
  articles: [],
  events: [],
  stats: [],
  pillars: [
    {
      id: "1",
      iconName: "Database",
      title: "Precision Ingestion",
      description: "Connect your private data layer (Knowledge Base, CRM, APIs). Our system autonomously vectors these into a semantic mesh.",
      prompt: "Synthesizing knowledge graph from 50,000 corporate records...",
      color: "text-blue-500"
    },
    {
      id: "2",
      iconName: "Cpu",
      title: "Agentic Logic",
      description: "Define behaviors using natural language. The orchestrator decomposes complex goals into executable agent swarms.",
      prompt: "Running multi-agent reasoning chain for lead intent...",
      color: "text-[#6366f1]"
    },
    {
      id: "3",
      iconName: "Send",
      title: "Autonomous Dispatch",
      description: "The final agent executes high-priority actions: hyper-personalized outreach, real-time strategy calls, and revenue events.",
      prompt: "Dispatched hyper-personalized campaign to prospect id #921",
      color: "text-green-500"
    },
  ],
  perks: [
    {
      id: "1",
      iconName: "MessageSquare",
      title: "Weekly Syncs",
      label: "LIVE SESSIONS",
      description: "Join weekly live sessions with Maria and fellow founders."
    },
    {
      id: "2",
      iconName: "BookOpen",
      title: "Resource Library",
      label: "VIP ACCESS",
      description: "Access our exclusive vault of agentic playbooks and templates."
    },
    {
      id: "3",
      iconName: "Zap",
      title: "AI Support",
      label: "AGENTIC HELP",
      description: "Direct access to our custom agents for your business."
    },
    {
      id: "4",
      iconName: "Shield",
      title: "Secure Network",
      label: "VETTED ACCESS",
      description: "Connect with a strictly vetted group of innovators."
    }
  ]
};

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
