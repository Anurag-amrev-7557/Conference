import React from 'react';
import { LandingPage } from '../../pages/LandingPage';
import { Navbar } from '../Navbar';
import { Laptop, Smartphone, Tablet, Globe, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LivePreviewProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="h-full flex flex-col overflow-hidden shadow-2xl bg-white">
      {/* Browser Header */}
      <div className="h-14 bg-white border-b border-border/20 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-off border border-border/40 min-w-[240px]">
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span className="text-[11px] font-medium text-muted truncate">superhumanly.ai/preview</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-off p-1 rounded-xl border border-border/40">
            {[
              { id: 'desktop', icon: Laptop },
              { id: 'tablet', icon: Tablet },
              { id: 'mobile', icon: Smartphone }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                aria-label={`${d.id} preview`}
                aria-pressed={device === d.id}
                onClick={() => setDevice(d.id as 'desktop' | 'tablet' | 'mobile')}
                className={`p-1.5 rounded-lg transition-all ${device === d.id ? 'bg-white shadow-sm text-accent' : 'text-muted hover:text-text'}`}
              >
                <d.icon className="w-4 h-4" aria-hidden />
              </button>
            ))}
          </div>
          
          <div className="h-4 w-[1px] bg-border/40" />
          
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? 'Exit full screen preview' : 'Full screen preview'}
            aria-pressed={isSidebarCollapsed}
            className={`p-2 rounded-lg transition-all ${isSidebarCollapsed ? 'bg-accent/10 text-accent shadow-inner' : 'text-muted hover:text-text hover:bg-off'}`}
          >
            {isSidebarCollapsed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            aria-label="Reset preview"
            className="p-2 text-muted hover:text-text hover:bg-off rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Frame Content */}
      <div className="flex-1 overflow-hidden relative flex justify-center bg-off/30">
        <motion.div 
          animate={{ 
            width: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px',
            height: device === 'desktop' ? '100%' : device === 'tablet' ? '1024px' : '667px',
            borderRadius: device === 'desktop' ? '0px' : '32px'
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          className={`bg-white shadow-elite relative overflow-hidden transition-all duration-700 ${device === 'desktop' ? '' : 'border-[6px] border-text'}`}
        >
          {/* Scrollable container for the site */}
          <div className="absolute inset-0 overflow-y-auto hide-scrollbar touch-pan-y z-10 bg-white">
            <div className="min-h-full w-full origin-top transform-gpu">
                <Navbar isInsidePreview />
                <LandingPage />
            </div>
          </div>

          {/* Device indicators for non-desktop */}
          {device !== 'desktop' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-text rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
