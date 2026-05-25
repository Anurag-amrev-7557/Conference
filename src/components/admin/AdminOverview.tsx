import React from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { 
  FileText, 
  Layout, 
  Settings, 
  Palette, 
  ArrowRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AdminOverview: React.FC = () => {
  const { data } = useWebsiteData();
  
  const stats = [
    { 
      label: 'BLOG ARTICLES', 
      value: data.articles.filter(a => a.isPublished).length, 
      total: data.articles.length,
      icon: FileText,
      subtitle: 'Published posts'
    },
    { 
      label: 'UPCOMING EVENTS', 
      value: data.events.filter(e => e.isPublished).length, 
      total: data.events.length,
      icon: ActivityIcon,
      subtitle: 'Scheduled engagements'
    },
    { 
      label: 'WEBSITE VISIBILITY', 
      value: Object.values(data.settings.visibility).filter(v => v).length, 
      total: Object.values(data.settings.visibility).length,
      icon: Layers,
      subtitle: 'Active page modules'
    }
  ];

  const tools = [
    { label: 'CONTENT', title: 'Page Editor', path: '/admin/pages', icon: Layout, desc: 'Customize your landing page segments, headlines, and visibility status.', color: 'blue' },
    { label: 'VISUALS', title: 'Design System', path: '/admin/design', icon: Palette, desc: 'Manage global branding tokens, color palettes, and typography.', color: 'purple' },
    { label: 'CONFIGURATION', title: 'Settings', path: '/admin/settings', icon: Settings, desc: 'Orchestrate SEO parameters, navigation logic, and custom scripts.', color: 'teal' },
    { label: 'EDITORIAL', title: 'Blog Manager', path: '/admin/blogs', icon: FileText, desc: 'Compose and manage technical articles and research publications.', color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-text">
      {/* HEADER SECTION */}
      <div className="p-10 border-b border-border/40">
        <div className="mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Overview</p>
            <h1 className="text-6xl font-serif italic text-text leading-tight mb-6">Administrative Dashboard</h1>
            <p className="text-sm text-muted max-w-xl leading-relaxed opacity-70">
              A centralized control center for managing your platform's editorial content, visual identity, and core infrastructure settings.
            </p>
          </motion.div>
        </div>
      </div>

      {/* STATS STRIP - Edge to Edge Grid */}
      <div className="border-b border-border/40 bg-[#fafafa]/50">
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="p-12 group hover:bg-white transition-colors duration-500"
            >
              <div className="flex items-center gap-4 mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
                <stat.icon className="w-4 h-4 text-accent" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-6xl font-serif italic">{stat.value}</span>
                <span className="text-xl font-serif italic text-muted/30">/ {stat.total}</span>
              </div>
              <p className="text-[11px] text-muted tracking-wide">{stat.subtitle}</p>
              
              <div className="mt-8 h-px w-full bg-border/20 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.value / (stat.total || 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                  className="absolute inset-y-0 left-0 bg-accent"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CORE TOOLS GRID - 2x2 Unified Grid */}
      <div className="flex-1 bg-white">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-x-0 md:divide-x border-x-0 md:border-x border-border/40">
            {tools.map((tool, i) => (
              <Link 
                key={i} 
                to={tool.path}
                className="p-16 group hover:bg-[#fafafa] transition-all duration-700 relative overflow-hidden flex flex-col border-border/40"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity">
                   <ChevronRight className="w-12 h-12 text-accent" />
                </div>

                <div className="flex items-center gap-5 mb-10">
                   <div className="w-12 h-12 rounded-xl bg-off flex items-center justify-center border border-border/40 group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
                      <tool.icon className="w-5 h-5 text-accent" />
                   </div>
                   <span className="text-[10px] font-bold text-accent/40 group-hover:text-accent uppercase tracking-[0.4em] transition-colors">{tool.label}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-3xl font-serif italic text-text mb-6 group-hover:translate-x-2 transition-transform duration-500">{tool.title}</h3>
                  <p className="text-sm text-muted leading-relaxed max-w-md opacity-60 group-hover:opacity-100 transition-opacity">{tool.desc}</p>
                </div>

                <div className="mt-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-text opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                   Enter Module <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function ActivityIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
