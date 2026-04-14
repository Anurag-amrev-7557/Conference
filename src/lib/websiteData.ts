import { BookOpen, Cpu, TrendingUp, MessageSquare, Zap, Shield } from "lucide-react";

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
  iconName: 'BookOpen' | 'Cpu' | 'TrendingUp';
  title: string;
  description: string;
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
  };
  navigation: {
    links: NavLink[];
    socials: SocialLink[];
  };
  visibility: {
    hero: boolean;
    whoWeAre: boolean;
    community: boolean;
    blog: boolean;
    events: boolean;
  };
}

export interface SiteAppearance {
  primaryColor: string;
  brandName: string;
  brandLogoText: string;
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
    tagline: "The Future of Automation is Here.",
    headline: "The Art of building AI/ML Products",
    headlineAccent: "-Agentic AI",
    subtitle: "Stop wasting hours on manual tasks. Get our exclusive playbook on how to build, deploy, and scale AI agent swarms for your business — starting today."
  },
  communityPosts: [
    {
      id: "post-1",
      title: "How do I ensure my AI agents don't hallucinate during customer support?",
      content: "I've been deploying some LLM-powered agents for customer support, but occasionally they provide incorrect information about shipping delays. What are the best prompt engineering or RAG patterns to mitigate this?",
      authorName: "Arthur Vance",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      authorRole: "Founder, Zenith Labs",
      category: "Prompt Engineering",
      votes: 42,
      createdAt: "2024-04-09T12:00:00Z",
      isPinned: true,
      comments: [
        {
          id: "comment-1",
          authorName: "Maria Jones",
          authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
          content: "The best approach is to strictly use RAG (Retrieval-Augmented Generation) and force the model to cite specific sources. Additionally, setting the 'temperature' parameter to 0 helps significantly in determinism.",
          createdAt: "2024-04-09T14:30:00Z"
        }
      ]
    },
    {
      id: "post-2",
      title: "What is your favorite no-code stack for building multi-agent swarms?",
      content: "I'm looking at different tools for orchestrating a swarm of 5+ agents. Currently testing Zapier + OpenAI, but considering more specialized tools. Any recommendations?",
      authorName: "Sarah Chen",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
      authorRole: "Full-stack Developer",
      category: "Architecture",
      votes: 28,
      createdAt: "2024-04-10T09:15:00Z",
      comments: []
    }
  ],
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
  articles: [
    {
      id: "1",
      slug: "evolution-of-agentic-orchestration",
      title: "The Evolution of Agentic Orchestration",
      category: "RESEARCH",
      time: "6 MIN",
      excerpt: "How small businesses are moving from simple automation to complex agentic ecosystems.",
      content: `# The Evolution of Agentic Orchestration\n\nIn the rapidly evolving landscape of artificial intelligence, the transition from simple automation to **agentic orchestration** represents a paradigm shift for small businesses and enterprises alike.\n\n## What is Agentic Orchestration?\n\nUnlike traditional automation, which follows linear "if-this-then-that" rules, agentic orchestration involves multiple AI agents working autonomously or collaboratively to achieve complex goals. These agents can reason, plan, and execute tasks with a level of intuition previously reserved for human operators.\n\n### Key Benefits\n\n1. **Dynamic Decision Making**: Agents can adapt to changing contexts.\n2. **Scalability**: Deploy a swarm of agents to handle thousands of requests simultaneously.\n3. **Precision**: Error rates drop as specialized agents handle specific tasks within a pipeline.\n\n## The Role of No-Code Tools\n\nThe democratization of these tools means that you no longer need a PhD in Machine Learning to deploy a multi-agent system. Platforms are now offering drag-and-drop interfaces that allow business owners to "hook" different LLM-powered agents together.\n\n> "The future of business isn't just about AI; it's about how well you can orchestrate your AI agents."\n\nStay tuned as we dive deeper into the specific architectural patterns that make this possible.`,
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000",
      isPublished: true,
      authorName: "Maria Jones",
      authorRole: "Chief AI Strategist",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      publishedAt: "2024-04-10"
    },
    {
      id: "2",
      slug: "small-business-automation-no-code",
      title: "Small Business Automation: No-Code Era",
      category: "STRATEGY",
      time: "4 MIN",
      excerpt: "Democratizing enterprise-grade AI tools for everyday small business operations.",
      content: `# Small Business Automation: The No-Code Era\n\nAutomation is no longer a luxury reserved for tech giants with massive engineering budgets. We are entering the era where any small business can leverage sophisticated AI to streamline operations.\n\n## Breaking the Barrier\n\nFor years, the barrier to entry for AI was technical complexity. Now, with the rise of **no-code platforms**, the focus has shifted from "how to build" to "what to build."\n\n### Where to Start?\n\n* **Customer Support**: Use AI agents to handle 80% of routine inquiries.\n* **Content Creation**: Automate your social media pipeline with multi-modal agents.\n* **Lead Gen**: Let agents research and qualify prospects while you sleep.\n\n## Conclusion\n\nThe goal is not to replace humans, but to augment them. By automating the mundane, you free up your team to focus on high-value creative work and human connection.`,
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000",
      isPublished: true,
      authorName: "Neville Fernandes",
      authorRole: "Automation Architect",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      publishedAt: "2024-04-05"
    },
    {
      id: "3",
      slug: "building-multi-agent-setup",
      title: "Building Your First Multi-Agent Setup",
      category: "PLAYBOOK",
      time: "8 MIN",
      excerpt: "A tactical guide on designing and scaling multi-agent architectural systems for immediate business impact.",
      content: `# Building Your First Multi-Agent Setup\n\nA step-by-step guide to architectural patterns for multi-agent systems.\n\n## The Architecture\n\nA robust multi-agent setup typically consists of a **Commander Agent** and several **Worker Agents**.\n\n### The Workflow\n\n1. **Input**: A human provides a high-level goal.\n2. **Planning**: The Commander breaks the goal into sub-tasks.\n3. **Execution**: Specialized Worker Agents execute the tasks.\n4. **Review**: The Commander verifies the output against the original goal.\n\n## Best Practices\n\nAlways ensure that your agents have clear boundary conditions. An agent trying to do "everything" is an agent that does nothing well.`,
      thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=2000",
      isPublished: true,
      authorName: "Maria Jones",
      authorRole: "Chief AI Strategist",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      publishedAt: "2024-03-28"
    }
  ],
  events: [
    {
      id: "1",
      day: "9 Apr",
      weekday: "Thursday",
      time: "17:30",
      full_time: "8 Apr, 17:30 GMT-7",
      title: "Making a break into Venture Capital: Live Networking",
      host: "Neville Fernandes",
      location: "San Carlos, California",
      tags: [
        { name: "AI", color: "bg-rose-50 text-rose-600 border-rose-100" },
        { name: "Peninsula", color: "bg-pink-50 text-pink-600 border-pink-100" },
        { name: "VC", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
      ],
      price: "US$20",
      thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop",
      status: "Upcoming",
      isPublished: true,
      lat: 37.524,
      lng: -122.261
    },
    {
      id: "2",
      day: "11 Apr",
      weekday: "Saturday",
      time: "10:00",
      full_time: "11 Apr, 10:00 GMT-7",
      title: "Building the Agentic Ecosystem: Strategy Workshop",
      host: "Maria Jones",
      location: "Virtual / London HQ",
      tags: [
        { name: "Strategy", color: "bg-blue-50 text-blue-600 border-blue-100" },
        { name: "Ecosystem", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
      ],
      price: "Free",
      thumbnail: "https://images.unsplash.com/photo-1591115765373-520b7a21765c?q=80&w=2070&auto=format&fit=crop",
      status: "Upcoming",
      isPublished: true,
      lat: 51.507,
      lng: -0.127
    },
    {
      id: "4",
      day: "15 Apr",
      weekday: "Wednesday",
      time: "18:00",
      full_time: "15 Apr, 18:00 GMT-7",
      title: "AI Executive Dinner: The Future of SaaS",
      host: "David Sacks",
      location: "Palo Alto, CA",
      tags: [
        { name: "Executive", color: "bg-amber-50 text-amber-600 border-amber-100" },
        { name: "Networking", color: "bg-blue-50 text-blue-600 border-blue-100" },
      ],
      price: "Invite Only",
      thumbnail: "https://images.unsplash.com/photo-1511795409834-432f7b172832?q=80&w=2070&auto=format&fit=crop",
      status: "Upcoming",
      isPublished: true,
      lat: 37.4419,
      lng: -122.1430
    },
    {
      id: "5",
      day: "18 Apr",
      weekday: "Saturday",
      time: "13:00",
      full_time: "18 Apr, 13:00 GMT-7",
      title: "Founders Creative: AI Build-a-thon",
      host: "Founders Creative Team",
      location: "San Francisco, CA",
      tags: [
        { name: "Workshop", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        { name: "Founders", color: "bg-purple-50 text-purple-600 border-purple-100" },
      ],
      price: "Free",
      thumbnail: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
      status: "Upcoming",
      isPublished: true,
      lat: 37.7749,
      lng: -122.4194
    },
    {
      id: "3",
      day: "4 Apr",
      weekday: "Saturday",
      time: "14:00",
      full_time: "4 Apr, 14:00 GMT-7",
      title: "AI Literacy for the Modern Workforce",
      host: "Dr. Alex Chen",
      location: "San Francisco, CA",
      tags: [
        { name: "Education", color: "bg-zinc-50 text-zinc-600 border-zinc-100" },
      ],
      price: "US$40",
      thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
      status: "Past",
      isPublished: true,
      lat: 37.7578,
      lng: -122.5074
    },
    {
      id: "6",
      day: "1 Apr",
      weekday: "Wednesday",
      time: "17:00",
      full_time: "1 Apr, 17:00 GMT-7",
      title: "Agentic AI Summit: Advancing Responsible AI",
      host: "Luma Community",
      location: "New York, NY",
      tags: [
        { name: "Summit", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
        { name: "Ethics", color: "bg-slate-50 text-slate-600 border-slate-100" },
      ],
      price: "Free",
      thumbnail: "https://images.unsplash.com/photo-1475721027466-10ba5c6224c1?q=80&w=2070&auto=format&fit=crop",
      status: "Past",
      isPublished: true,
      lat: 40.7128,
      lng: -74.0060
    }
  ],
  stats: [
    { id: "1", value: "2,500+", label: "Business Owners" },
    { id: "2", value: "8", label: "AI Frameworks" },
    { id: "3", value: "50+", label: "Templates" },
    { id: "4", value: "24/7", label: "AI Uptime" },
  ],
  pillars: [
    {
      id: "1",
      iconName: "BookOpen",
      title: "No-Code Friendly",
      description: "Every technique is designed for non-technical owners. Zero coding — just follow the steps.",
    },
    {
      id: "2",
      iconName: "Cpu",
      title: "AI Agent Architecture",
      description: "Design, deploy, and orchestrate intelligent agents that handle real business tasks.",
    },
    {
      id: "3",
      iconName: "TrendingUp",
      title: "Growth Automation",
      description: "Build systems that grow your brand on autopilot — social media, email, and beyond.",
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
};

export const perkIcons = {
  MessageSquare,
  BookOpen,
  Zap,
  Shield,
};
