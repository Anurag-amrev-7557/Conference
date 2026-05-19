/**
 * BACK-06 single source of truth for demo/production site content.
 * Frontend initialData is skeleton-only; run seed to populate the database.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin
  const hashedPassword = await bcrypt.hash('Welcome@1234', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword
    }
  });

  // 2. Initial Data from websiteData.ts
  const initialData = {
    hero: {
      tagline: "The Future of Automation is Here.",
      headline: "The Blueprint for Automating Business with",
      headlineAccent: "Agentic AI",
      subtitle: "Stop wasting hours on manual tasks. Get our exclusive playbook on how to build, deploy, and scale AI agent swarms for your business — starting today."
    },
    settings: {
      seo: {
        title: "Superhumanly Playbook — Master Agentic AI Automation",
        description: "Scale your business and automate your workflows with the definitive Agentic AI Playbook. Join 2,500+ innovators today.",
        ogImage: "",
        googleSiteVerification: "",
      },
      navigation: {
        links: [
          { id: "1", name: "The Playbook", href: "/blog" },
          { id: "2", name: "Founders Hub", href: "/community" },
          { id: "3", name: "Strategy", href: "#who-we-are" },
          { id: "4", name: "Live Training", href: "/events" }
        ],
        socials: [
          { id: "1", platform: "LinkedIn", href: "https://linkedin.com/company/superhumanly" },
          { id: "2", platform: "Youtube", href: "https://youtube.com/@superhumanly" },
          { id: "3", platform: "Instagram", href: "https://instagram.com/superhumanly.ai" },
          { id: "4", platform: "X", href: "https://x.com/superhumanly" }
        ]
      },
      visibility: {
        hero: true,
        whoWeAre: true,
        community: true,
        blog: true,
        events: true
      }
    },
    appearance: {
      primaryColor: "#0052cc",
      brandName: "Superhumanly -Thoughts",
      brandLogoText: "S"
    },
    stats: [
      { id: "1", value: "2,500+", label: "Business Owners" },
      { id: "2", value: "8", label: "AI Frameworks" },
      { id: "3", value: "50+", label: "Templates" },
      { id: "4", value: "24/7", label: "AI Uptime" }
    ],
    pillars: [
      {
        id: "1",
        iconName: "BookOpen",
        title: "No-Code Friendly",
        description: "Every technique is designed for non-technical owners. Zero coding — just follow the steps."
      },
      {
        id: "2",
        iconName: "Cpu",
        title: "AI Agent Architecture",
        description: "Design, deploy, and orchestrate intelligent agents that handle real business tasks."
      },
      {
        id: "3",
        iconName: "TrendingUp",
        title: "Growth Automation",
        description: "Build systems that grow your brand on autopilot — social media, email, and beyond."
      }
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
      perks: JSON.stringify(initialData.perks)
    }
  });

  // 3. Articles
  const articles = [
    {
      id: "1",
      slug: "evolution-of-agentic-orchestration",
      title: "The Evolution of Agentic Orchestration",
      category: "RESEARCH",
      time: "6 MIN",
      excerpt: "How small businesses are moving from simple automation to complex agentic ecosystems.",
      content: `# The Evolution of Agentic Orchestration\n\nIn the rapidly evolving landscape of artificial intelligence...`,
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000",
      isPublished: true,
      authorName: "Maria Jones",
      authorRole: "Chief AI Strategist",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      publishedAt: "2024-04-10"
    }
    // Add more if needed
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article
    });
  }

  // 4. Events
  const events = [
    {
      id: "1",
      day: "9 Apr",
      weekday: "Thursday",
      time: "17:30",
      full_time: "8 Apr, 17:30 GMT-7",
      title: "Making a break into Venture Capital: Live Networking",
      host: "Neville Fernandes",
      location: "San Carlos, California",
      tags: JSON.stringify([
        { name: "AI", color: "bg-rose-50 text-rose-600 border-rose-100" },
        { name: "Peninsula", color: "bg-pink-50 text-pink-600 border-pink-100" },
        { name: "VC", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
      ]),
      price: "US$20",
      thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop",
      status: "Upcoming",
      isPublished: true,
      lat: 37.524,
      lng: -122.261
    }
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: event
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
