import React from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { FileText, Calendar, Eye, Palette, CheckCircle2 } from 'lucide-react';
import type { Article, AppEvent } from '../../lib/websiteData';

export const AdminOverview: React.FC = () => {
  const { data } = useWebsiteData();
  
  const stats = [
    { 
      label: 'Published Playbooks', 
      value: data.articles.filter((a: Article) => a.isPublished).length, 
      total: data.articles.length,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Live Events', 
      value: data.events.filter((e: AppEvent) => e.isPublished).length, 
      total: data.events.length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      label: 'Visible Sections', 
      value: Object.values(data.settings.visibility).filter(v => v).length, 
      total: Object.values(data.settings.visibility).length,
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-border/40 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif italic text-text">{stat.value}</span>
                <span className="text-xs text-muted">/ {stat.total} total</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-border/40 shadow-sm">
          <h3 className="text-2xl font-serif italic text-text mb-6 flex items-center gap-3">
             <Palette className="w-6 h-6 text-accent" />
             Current Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-off/50 border border-border/20">
               <span className="text-sm font-medium text-muted">Accent Color</span>
               <div className="flex items-center gap-3">
                 <span className="text-xs font-mono uppercase text-muted">{data.appearance.primaryColor}</span>
                 <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: data.appearance.primaryColor }} />
               </div>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-off/50 border border-border/20">
               <span className="text-sm font-medium text-muted">Brand Name</span>
               <span className="text-sm font-bold text-text">{data.appearance.brandName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-border/40 shadow-sm">
          <h3 className="text-2xl font-serif italic text-text mb-6 flex items-center gap-3">
             <CheckCircle2 className="w-6 h-6 text-emerald-500" />
             Quick Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Articles</p>
                <p className="text-lg font-serif italic text-emerald-900">Manage Feed</p>
             </div>
             <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Navigation</p>
                <p className="text-lg font-serif italic text-indigo-900">Edit Menu</p>
             </div>
          </div>
        </div>
      </div>

      <div className="p-12 rounded-[48px] bg-gradient-to-br from-white to-off border border-border/40 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-accent/10 transition-colors" />
         <div className="relative z-10">
            <h3 className="text-3xl font-serif italic text-text mb-4">Site Integrity Active</h3>
            <p className="text-muted max-w-xl leading-relaxed">Your Superhumanly AI Playbook is synchronized with the latest administrative updates. Changes to appearance and visibility are reflected instantly across the entire platform.</p>
         </div>
      </div>
    </div>
  );
};
