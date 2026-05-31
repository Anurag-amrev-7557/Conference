import React from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import {
  FileText,
  Layout,
  Settings,
  Palette,
  ChevronRight,
  Layers,
  Calendar,
  Mic2,
  ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverview: React.FC = () => {
  const { data } = useWebsiteData();

  const stats = [
    {
      label: 'Published articles',
      value: data.articles.filter((a) => a.isPublished).length,
      total: data.articles.length,
      icon: FileText,
    },
    {
      label: 'Published events',
      value: data.events.filter((e) => e.isPublished).length,
      total: data.events.length,
      icon: Calendar,
    },
    {
      label: 'Active modules',
      value: Object.values(data.settings.visibility).filter(Boolean).length,
      total: Object.values(data.settings.visibility).length,
      icon: Layers,
    },
  ];

  const tools = [
    {
      title: 'Homepage',
      path: '/admin/homepage',
      icon: Layout,
      desc: 'Hero, sections, perks, visibility',
    },
    {
      title: 'Brand & theme',
      path: '/admin/design',
      icon: Palette,
      desc: 'Brand name, colors, typography',
    },
    {
      title: 'Site settings',
      path: '/admin/settings',
      icon: Settings,
      desc: 'Global SEO, navigation, scripts',
    },
    {
      title: 'Media library',
      path: '/admin/media',
      icon: ImageIcon,
      desc: 'Images and uploads',
    },
    {
      title: 'Blog',
      path: '/admin/blogs',
      icon: FileText,
      desc: 'Articles, page hero, SEO',
    },
    {
      title: 'Events',
      path: '/admin/events',
      icon: Calendar,
      desc: 'Schedule, page hero, SEO',
    },
    {
      title: 'Homepage',
      path: '/admin/conference',
      icon: Mic2,
      desc: 'Summit landing, tickets, publish',
    },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <h1 className="admin-dashboard__title">Welcome back</h1>
        <p className="admin-dashboard__lede">
          Manage your homepage, book page, and global configuration.
        </p>
      </header>

      <section className="admin-dashboard__section" aria-labelledby="dashboard-stats-heading">
        <h2 id="dashboard-stats-heading" className="admin-dashboard__section-title">
          At a glance
        </h2>
        <div className="admin-stat-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="admin-stat-card">
              <div className="admin-stat-card__icon" aria-hidden>
                <stat.icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="admin-stat-card__body">
                <p className="admin-stat-card__label">{stat.label}</p>
                <p className="admin-stat-card__value">
                  <span className="admin-stat-card__num">{stat.value}</span>
                  <span className="admin-stat-card__of">of {stat.total}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-dashboard__section" aria-labelledby="dashboard-workspace-heading">
        <h2 id="dashboard-workspace-heading" className="admin-dashboard__section-title">
          Workspace
        </h2>
        <div className="admin-tool-grid">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} className="admin-tool-card">
              <div className="admin-tool-card__icon" aria-hidden>
                <tool.icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="admin-tool-card__body">
                <h3 className="admin-tool-card__title">{tool.title}</h3>
                <p className="admin-tool-card__desc">{tool.desc}</p>
              </div>
              <ChevronRight className="admin-tool-card__chevron" aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
