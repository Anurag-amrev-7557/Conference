/**
 * BACK-06 single source of truth for demo/production site content.
 * Frontend initialData is skeleton-only; run seed to populate the database.
 */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { defaultConferenceContent } from '../../src/lib/conferenceDefaults';
import { defaultConferenceRegistrationForm } from './lib/registrationDefaults';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword) {
    console.error('[seed] ADMIN_PASSWORD environment variable is required.');
    process.exit(1);
  }
  if (adminPassword.length < 12) {
    console.error('[seed] ADMIN_PASSWORD must be at least 12 characters.');
    process.exit(1);
  }

  // 1. Create Admin
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'super_admin',
    },
  });

  // 2. Initial Data from websiteData.ts
  const initialData = {
    hero: {
      tagline: 'The Future of Automation is Here.',
      headline: 'The Blueprint for Automating Business with',
      headlineAccent: 'Agentic AI',
      subtitle:
        'Stop wasting hours on manual tasks. Get our exclusive playbook on how to build, deploy, and scale AI agent swarms for your business — starting today.',
      videoUrl: '',
      primaryCtaLabel: 'Book a demo',
    },
    settings: {
      seo: {
        title: 'Superhumanly Playbook — Master Agentic AI Automation',
        description:
          'Scale your business and automate your workflows with the definitive Agentic AI Playbook. Join 2,500+ innovators today.',
        ogImage: '',
        googleSiteVerification: '',
        ogSiteName: 'Superhumanly',
        ogLocale: 'en_US',
        twitterSite: '@superhumanly',
      },
      catalogPages: {
        blog: {
          eyebrow: 'Blog',
          title: 'Where builders',
          titleAccent: 'learn to ship',
          lede: 'Architecture, automation, and intelligence for builders shipping agentic systems—guides, playbooks, and research from the Superhumanly team.',
        },
        events: {
          eyebrow: 'Events',
          title: 'Where AI leaders',
          titleAccent: 'come together',
          lede: 'Explore upcoming masterclasses, networking sessions, and venture workshops—built for founders shaping the future of agentic AI.',
        },
        speakers: {
          eyebrow: 'Speakers',
          title: 'The minds shaping',
          titleAccent: 'agentic AI',
          lede: 'Browse summit speakers from across industry, research, and venture—each bringing hard-won insight to the stage.',
        },
      },
      sections: {
        finalCta: {
          eyebrow: 'Final Registry',
          title: 'Secure your',
          titleAccent: 'spot.',
          lede: 'The architectural blueprint for automating your business with agentic AI — written for founders who ship, not slide decks.',
          trustItems: ['2,500+ on the registry', 'Free agentic playbook', 'No spam, ever'],
          ctaLabel: 'Register for the summit',
          ctaHref: '/register',
          secondaryCtaLabel: 'View the agenda',
          secondaryCtaHref: '#conference-agenda',
          formNote: 'Join 2,500+ founders — playbook in your inbox in minutes.',
          waitlistSubmitLabel: 'Get the playbook',
          waitlistPlaceholder: 'you@company.com',
          waitlistGuideLabel: 'Exclusive guide · Building AI agents',
          waitlistSuccessTitle: "You're on the list",
          waitlistSuccessCopy: 'Check your inbox — the playbook arrives in a few minutes.',
        },
        whoWeAre: {
          eyebrow: 'Who We Are',
          title: 'Built by founders,',
          titleAccent: 'for founders',
          lede: 'The definitive playbook for small business owners who want to harness AI — without jargon, complexity, or hiring a developer.',
        },
      },
      routeSeo: {},
      catalogPages: {
        blog: {
          eyebrow: 'Blog',
          title: 'Where builders',
          titleAccent: 'learn to ship',
          lede: 'Architecture, automation, and intelligence for builders shipping agentic systems.',
          searchPlaceholder: 'Search for articles',
          pageSize: 9,
        },
        events: {
          eyebrow: 'Events',
          title: 'Where AI leaders',
          titleAccent: 'come together',
          lede: 'Explore upcoming masterclasses, networking sessions, and venture workshops.',
          searchPlaceholder: 'Search for events',
          pageSize: 9,
        },
        speakers: {
          eyebrow: 'Speakers',
          title: 'The minds shaping',
          titleAccent: 'agentic AI',
          lede: 'Browse summit speakers from across industry, research, and venture.',
          searchPlaceholder: 'Search by name, company, or talk',
          pageSize: 12,
        },
      },
      blogCategories: [
        { id: 'RESEARCH', label: 'Research' },
        { id: 'STRATEGY', label: 'Strategy' },
        { id: 'PLAYBOOK', label: 'Playbook' },
        { id: 'GUIDE', label: 'Guide' },
      ],
      routeVisibility: {
        blog: true,
        events: true,
        speakers: true,
        register: true,
      },
      leadCaptureModal: {
        title: 'Get the playbook',
        lede: 'Join the registry for exclusive guides and summit updates.',
        submitLabel: 'Subscribe',
        successTitle: "You're on the list",
        successMessage: 'Check your inbox for the playbook.',
        emailPlaceholder: 'you@company.com',
      },
      conference: defaultConferenceContent,
      conferenceRegistration: defaultConferenceRegistrationForm,
      book: {
        title: 'The Blueprint for Automating Business with Agentic AI',
        tagline: 'The definitive playbook for scaling with AI agent swarms.',
        abstract:
          "Stop wasting hours on manual tasks. This book gives you a practical, step-by-step system to build, deploy, and scale agentic AI inside your business — without hiring a developer or drowning in jargon.\n\nInside you'll find frameworks for agent design, deployment checklists, and real-world workflows you can adapt this week — whether you run a solo consultancy or a growing team.",
        authorName: 'Superhumanly',
        coverImageUrl: '',
        publisherName: 'Superhumanly Press',
      },
      navigation: {
        links: [
          { id: '1', name: 'The Playbook', href: '/blog' },
          { id: '3', name: 'Strategy', href: '#who-we-are' },
          { id: '4', name: 'Live Training', href: '/events' },
          { id: '5', name: 'Speakers', href: '/speakers' },
        ],
        footerLinks: [
          { id: 'f1', name: 'The Playbook', href: '/blog' },
          { id: 'f3', name: 'Strategy', href: '/#who-we-are' },
          { id: 'f4', name: 'Live Training', href: '/events' },
          { id: 'f5', name: 'Speakers', href: '/speakers' },
          { id: 'f6', name: 'Join Registry', href: '/#final-cta' },
        ],
        socials: [
          { id: '1', platform: 'LinkedIn', href: 'https://linkedin.com/company/superhumanly' },
          { id: '2', platform: 'Youtube', href: 'https://youtube.com/@superhumanly' },
          { id: '3', platform: 'Instagram', href: 'https://instagram.com/superhumanly.ai' },
          { id: '4', platform: 'X', href: 'https://x.com/superhumanly' },
        ],
        primaryCta: { label: 'Join Now', href: '/register' },
      },
      footer: {
        tagline: 'Orchestrating the future of automated business systems.',
        copyright: '© Superhumanly AI Playbook.',
        registryStatusLabel: 'Registry open',
        registryCtaLabel: 'Join the registry',
        navColumnTitle: 'Section Index',
        socialColumnTitle: 'Connection',
        privacyUrl: '#',
        termsUrl: '#',
        privacyLabel: 'Privacy Policy',
        termsLabel: 'Terms of Service',
      },
      visibility: {
        hero: true,
        stats: true,
        showcase: true,
        pillars: true,
        perks: true,
        whoWeAre: true,
        blog: true,
        events: true,
        finalCta: true,
      },
      customCss: '',
      scripts: { header: '', footer: '' },
    },
    appearance: {
      primaryColor: '#0052cc',
      brandName: 'Superhumanly - Thoughts',
      brandLogoText: 'S',
      brandLogoUrl: '/media/superhumanly-logo.png',
    },
    stats: [
      { id: '1', value: '2,500+', label: 'Business Owners' },
      { id: '2', value: '8', label: 'AI Frameworks' },
      { id: '3', value: '50+', label: 'Templates' },
      { id: '4', value: '24/7', label: 'AI Uptime' },
    ],
    pillars: [
      {
        id: '1',
        iconName: 'BookOpen',
        title: 'No-Code Friendly',
        description:
          'Every technique is designed for non-technical owners. Zero coding — just follow the steps.',
      },
      {
        id: '2',
        iconName: 'Cpu',
        title: 'AI Agent Architecture',
        description:
          'Design, deploy, and orchestrate intelligent agents that handle real business tasks.',
      },
      {
        id: '3',
        iconName: 'TrendingUp',
        title: 'Growth Automation',
        description:
          'Build systems that grow your brand on autopilot — social media, email, and beyond.',
      },
    ],
    perks: [
      {
        id: '1',
        iconName: 'MessageSquare',
        title: 'Weekly Syncs',
        label: 'LIVE SESSIONS',
        description: 'Join weekly live sessions with Maria and fellow founders.',
      },
      {
        id: '2',
        iconName: 'BookOpen',
        title: 'Resource Library',
        label: 'VIP ACCESS',
        description: 'Access our exclusive vault of agentic playbooks and templates.',
      },
      {
        id: '3',
        iconName: 'Zap',
        title: 'AI Support',
        label: 'AGENTIC HELP',
        description: 'Direct access to our custom agents for your business.',
      },
      {
        id: '4',
        iconName: 'Shield',
        title: 'Secure Network',
        label: 'VETTED ACCESS',
        description: 'Connect with a strictly vetted group of innovators.',
      },
    ],
  };

  (initialData.settings as { homepage?: unknown }).homepage = {
    hero: initialData.hero,
    stats: initialData.stats,
    pillars: initialData.pillars,
    perks: initialData.perks,
  };

  await prisma.siteContent.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      hero: JSON.stringify(initialData.hero),
      settings: JSON.stringify(initialData.settings),
      appearance: JSON.stringify(initialData.appearance),
      stats: JSON.stringify(initialData.stats),
      pillars: JSON.stringify(initialData.pillars),
      perks: JSON.stringify(initialData.perks),
    },
  });

  // 3. Articles (sample content for local UI: blog index, read page, TOC, related guides)
  const articles = [
    {
      id: 'article-ai-roi-leaders',
      slug: 'ai-roi-industry-leaders',
      title: 'Proving AI ROI: What Industry Leaders Do Differently',
      category: 'STRATEGY',
      time: '5 MIN',
      excerpt:
        'Discover how industry leaders are moving past the AI hype cycle to deliver measurable ROI in production workflows.',
      content: `# Proving AI ROI

Executive teams want proof before they fund the next wave of AI projects. The teams that win treat ROI as a weekly operating metric—not a slide in a quarterly review.

## Anchor on one workflow

Pick a process with clear inputs, owners, and success criteria. Support triage, quote generation, and vendor onboarding are strong first candidates.

## Measure what operators feel

Track cycle time, rework rate, and override frequency. If humans override agents more than a third of the time, narrow scope before scaling spend.

## Publish a 30-day scorecard

Share baseline vs. current performance with finance and operations. Transparency builds the trust required for the next automation lane.`,
      thumbnail:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000',
      isPublished: true,
      authorName: 'Jordan Ellis',
      authorRole: 'Systems Architect',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      publishedAt: '2026-06-08',
    },
    {
      id: 'article-evolution-agentic',
      slug: 'evolution-of-agentic-orchestration',
      title: 'The Evolution of Agentic Orchestration',
      category: 'RESEARCH',
      time: '8 MIN',
      excerpt:
        'How small businesses are moving from simple automation to complex agentic ecosystems that coordinate work across tools.',
      content: `# The Evolution of Agentic Orchestration

Agentic systems are no longer experimental side projects. Teams are wiring models, tools, and policies into repeatable workflows that ship outcomes—not demos.

## Why orchestration matters now

Most businesses already automate isolated tasks. The next step is coordinating multiple agents with clear ownership, guardrails, and observability.

### From scripts to swarms

Early automation was linear: trigger, action, done. Agentic orchestration adds planning, retries, and human checkpoints when confidence drops.

### What changes for operators

- **Visibility:** every step leaves an audit trail
- **Recovery:** failed runs can resume without duplicating side effects
- **Governance:** roles decide who can approve high-risk actions

## A practical rollout pattern

Start with one high-friction workflow—onboarding, support triage, or weekly reporting—then expand only after you measure cycle time and error rate.

## What to measure in week one

Track time-to-resolution, handoff count, and override rate. If humans override more than 30% of agent decisions, tighten prompts or narrow tool access before scaling.

## Closing thought

The winners will not be the teams with the flashiest models. They will be the teams with the clearest orchestration contracts between people, agents, and data.`,
      thumbnail:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000',
      isPublished: true,
      authorName: 'Maria Jones',
      authorRole: 'Chief AI Strategist',
      authorAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      publishedAt: '2024-04-10',
    },
    {
      id: 'article-strategic-ai-implementation',
      slug: 'strategic-ai-implementation',
      title: 'Strategic AI Implementation: Moving from Hype to High Impact',
      category: 'STRATEGY',
      time: '5 MIN',
      excerpt:
        'A field-tested playbook for prioritizing AI initiatives, proving value in 30 days, and scaling without burning your team out.',
      content: `# Strategic AI Implementation

Leaders are under pressure to "do AI" quickly. The teams that succeed treat implementation as a product discipline—not a one-off pilot.

## Start with business outcomes

Pick one measurable outcome: reduced support backlog, faster proposal turnaround, or higher qualified pipeline. If you cannot name the metric, pause before buying more tools.

## Build a 30-day proof lane

### Week 1: Map the workflow

Document inputs, approvals, and failure modes. Capture where humans spend time on copy-paste or context switching.

### Week 2: Ship a narrow agent

Scope the agent to a single decision boundary. Give it read-only access first, then expand permissions after review.

### Week 3: Instrument and iterate

Add logging, cost tracking, and a weekly review with operators. Promote only workflows that beat your baseline on quality and speed.

## Common traps to avoid

- **Boiling the ocean:** too many use cases at once
- **Shadow workflows:** agents that bypass compliance checks
- **Vanity demos:** impressive UI with no production owner

## Operating model that scales

Assign a workflow owner, an AI builder, and a risk reviewer. Meet weekly until error rates stabilize, then move to monthly governance.

## Related capabilities to invest in next

Once one lane is stable, add retrieval quality, evaluation suites, and role-based access. These three investments compound faster than adding more models.`,
      thumbnail:
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000',
      isPublished: true,
      authorName: 'Jordan Ellis',
      authorRole: 'Systems Architect',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      publishedAt: '2026-06-02',
    },
  ];

  for (const article of articles) {
    const { id, slug, ...rest } = article;
    await prisma.article.upsert({
      where: { slug },
      update: { ...rest, id },
      create: article,
    });
  }

  // 4. Events
  const events = [
    {
      id: '1',
      day: '9 Apr',
      weekday: 'Thursday',
      time: '17:30',
      full_time: '8 Apr, 17:30 GMT-7',
      title: 'Making a break into Venture Capital: Live Networking',
      host: 'Neville Fernandes',
      location: 'San Carlos, California',
      tags: JSON.stringify([
        { name: 'AI', color: 'bg-rose-50 text-rose-600 border-rose-100' },
        { name: 'Peninsula', color: 'bg-pink-50 text-pink-600 border-pink-100' },
        { name: 'VC', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
      ]),
      price: 'US$20',
      thumbnail:
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop',
      status: 'Upcoming',
      isPublished: true,
      lat: 37.524,
      lng: -122.261,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }

  // 5. Community posts (Implementation Wins feed)
  const communityPosts = [
    {
      id: 'cp-1',
      title: 'Deployed inbound triage agent — 40% faster response time',
      content:
        'Used the Ch. 2 ingestion template to pipe Intercom tickets into our agent swarm. First week: 127 tickets auto-routed, 3 escalations only.',
      authorName: 'Sarah Kim',
      authorAvatar: 'SK',
      authorRole: 'Series A SaaS',
      category: 'Shipped',
      votes: 12,
      isPinned: true,
    },
    {
      id: 'cp-2',
      title: 'Outbound sequence agent — config + prompt pack',
      content:
        "Shared the exact agent config from last week's sync. Includes CRM webhook setup and the 3-prompt chain for personalization.",
      authorName: 'Maria Rodriguez',
      authorAvatar: 'MR',
      authorRole: 'Operator',
      category: 'Template',
      votes: 28,
      isPinned: false,
    },
    {
      id: 'cp-3',
      title: 'How do you handle agent failure loops in production?',
      content:
        'My dispatch agent keeps retrying the same API call. Looking for patterns from Ch. 3 or real-world guardrails.',
      authorName: 'James T.',
      authorAvatar: 'JT',
      authorRole: 'Pre-seed founder',
      category: 'Question',
      votes: 6,
      isPinned: false,
    },
    {
      id: 'cp-4',
      title: 'Stuck on multi-agent handoff between CRM and email',
      content:
        'Agents lose context when passing from enrichment to outreach. Anyone solved this with a shared state store?',
      authorName: 'Priya Lal',
      authorAvatar: 'PL',
      authorRole: 'Founder',
      category: 'Stuck',
      votes: 4,
      isPinned: false,
    },
  ];

  for (const post of communityPosts) {
    await prisma.communityPost.upsert({
      where: { id: post.id },
      update: {},
      create: post,
    });
  }

  console.log('[✅] Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
