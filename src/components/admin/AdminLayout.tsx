import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Settings, 
  Settings2,
  LogOut, 
  ArrowLeft,
  Home,
  Layout,
  Paintbrush,
  ChevronLeft,
  Eye,
  EyeOff,
  MessageSquare,
  ImageIcon
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebsiteData } from '../WebsiteDataProvider';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout: () => void;
  wide?: boolean;
  showPreviewToggle?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, onLogout, wide = false, showPreviewToggle = false }) => {
  const { isPreviewVisible, togglePreview } = useWebsiteData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved === 'true';
  });
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_width');
    return saved ? parseInt(saved, 10) : 280;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 450) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Layout, label: 'Page Editor', path: '/admin/pages' },
    { icon: Paintbrush, label: 'Design System', path: '/admin/design' },
    { icon: ImageIcon, label: 'Media', path: '/admin/media' },
    { icon: FileText, label: 'Blog', path: '/admin/blogs' },
    { icon: MessageSquare, label: 'Community', path: '/admin/community' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: Settings2, label: 'Settings', path: '/admin/settings' },
  ];

  const currentSidebarWidth = isCollapsed ? 80 : sidebarWidth;

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        style={{ width: `${currentSidebarWidth}px` }}
        className="bg-white border-r border-border flex flex-col z-30 relative transition-[width] duration-300 ease-in-out select-none"
      >
        {/* Resize Handle */}
        {!isCollapsed && (
          <div 
            onMouseDown={startResizing}
            className={`resize-handle ${isResizing ? 'active' : ''}`} 
          />
        )}

        {/* Sidebar Header */}
        <div className={`p-4 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 shrink-0 rounded-xl bg-accent flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white" />
            </motion.div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h1 className="text-xl font-serif italic text-text mb-0">Admin</h1>
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-off text-text transition-colors ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 group ${
                  isActive
                    ? 'bg-accent text-white shadow-xl shadow-accent/20'
                    : 'text-text2 hover:bg-off hover:text-text'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto border-t border-border space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold text-text2 hover:bg-off transition-all group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Home className="w-[18px] h-[18px] shrink-0 group-hover:scale-110" />
            {!isCollapsed && <span className="whitespace-nowrap">Live Preview</span>}
          </Link>
          <button
            onClick={onLogout}
            className={`flex items-center cursor-pointer gap-3 px-3 py-3 rounded-xl w-full text-[13px] font-bold text-rose-700 hover:bg-rose-50 transition-all text-left group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:scale-110" />
            {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-bg">
        <header className="h-15 shrink-0 bg-white border-b border-border px-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl border border-border hover:border-accent bg-bg flex items-center justify-center transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-text group-hover:text-accent transition-colors" />
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <h2 className="text-2xl font-serif italic text-text tracking-tight mb-0">{title}</h2>
          </div>

          <div className="flex items-center gap-4">
             {showPreviewToggle && (
                <button
                   onClick={togglePreview}
                   className={cn(
                      "flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-500 group",
                      isPreviewVisible 
                      ? "bg-accent/5 border-accent/20 text-accent shadow-sm" 
                      : "bg-off/40 border-border/40 text-muted hover:border-text/20 hover:text-text"
                   )}
                >
                   <AnimatePresence mode="wait">
                      <motion.div
                         key={isPreviewVisible ? 'eye' : 'eye-off'}
                         initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                         animate={{ opacity: 1, scale: 1, rotate: 0 }}
                         exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                         transition={{ duration: 0.2 }}
                      >
                         {isPreviewVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </motion.div>
                   </AnimatePresence>
                   <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                      {isPreviewVisible ? 'Live Preview On' : 'Preview Hidden'}
                   </span>
                </button>
             )}
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto ${wide ? 'px-0' : 'p-12'}`}>
          <div className="h-full w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
