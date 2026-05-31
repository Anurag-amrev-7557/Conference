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
  ChevronDown,
  X,
  Menu,
  Eye,
  EyeOff,
  ImageIcon,
  Mic2,
  ClipboardList,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebsiteData } from '../WebsiteDataProvider';
import { cn } from '../../lib/utils';
import { useAdminWorkspaceNav } from './admin-workspace-nav';
import {
  MOBILE_NAV_SECTIONS,
  setPendingAdminSection,
} from './admin-mobile-nav-sections';

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
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved === 'true';
  });
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_width');
    return saved ? parseInt(saved, 10) : 248;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavExpandedPath, setMobileNavExpandedPath] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileNavOpen(false);
    setMobileNavExpandedPath(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) setMobileNavExpandedPath(null);
  }, [mobileNavOpen]);

  useEffect(() => {
    document.body.classList.toggle('admin-shell--nav-open', mobileNavOpen);
    return () => document.body.classList.remove('admin-shell--nav-open');
  }, [mobileNavOpen]);

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

  const navGroups: {
    label: string;
    description: string;
    items: { icon: React.ElementType; label: string; path: string }[];
  }[] = [
    {
      label: 'Overview',
      description: 'Health & shortcuts',
      items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' }],
    },
    {
      label: 'Site',
      description: 'Brand, settings & assets',
      items: [
        { icon: Paintbrush, label: 'Brand & theme', path: '/admin/design' },
        { icon: Settings2, label: 'Site settings', path: '/admin/settings' },
        { icon: ImageIcon, label: 'Media', path: '/admin/media' },
      ],
    },
    {
      label: 'Pages',
      description: 'Route-level content',
      items: [
        { icon: Layout, label: 'Book page', path: '/admin/homepage' },
        { icon: FileText, label: 'Blog', path: '/admin/blogs' },
        { icon: Calendar, label: 'Events', path: '/admin/events' },
        { icon: Mic2, label: 'Homepage', path: '/admin/conference' },
        { icon: ClipboardList, label: 'Registrations', path: '/admin/registrations' },
      ],
    },
  ];

  const currentSidebarWidth = isCollapsed ? 72 : sidebarWidth;
  const showNavLabels = !isCollapsed || mobileNavOpen;
  const workspaceSubnav = useAdminWorkspaceNav()?.subnav;

  return (
    <div
      className={cn(
        'admin-shell flex h-screen overflow-hidden',
        mobileNavOpen && 'admin-shell--nav-open',
      )}
    >
      {mobileNavOpen ? (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside 
        ref={sidebarRef}
        style={{ width: mobileNavOpen ? undefined : `${currentSidebarWidth}px` }}
        className={cn(
          'admin-shell__sidebar flex flex-col z-30 relative transition-[width,transform] duration-300 ease-in-out select-none shrink-0',
          mobileNavOpen && 'admin-shell__sidebar--mobile-open',
        )}
      >
        {!isCollapsed && !mobileNavOpen && (
          <div
            onMouseDown={startResizing}
            className={`resize-handle ${isResizing ? 'active' : ''}`}
          />
        )}

        <div
          className={cn(
            'admin-shell__brand',
            isCollapsed && !mobileNavOpen && 'admin-shell__brand--collapsed',
          )}
        >
          <div className="admin-shell__brand-mark">
            <Settings className="w-5 h-5 text-white" aria-hidden />
          </div>
          {showNavLabels && (
            <div className="admin-shell__brand-text min-w-0">
              <p className="admin-shell__brand-title truncate">Superhumanly</p>
              <p className="admin-shell__brand-sub truncate">CMS</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            className="admin-shell__sidebar-close"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'admin-shell__sidebar-collapse',
              isCollapsed && 'admin-shell__sidebar-collapse--collapsed',
            )}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={cn(
                'admin-nav-group',
                groupIndex > 0 && 'admin-nav-group--spaced',
                isCollapsed && !mobileNavOpen && 'admin-nav-group--collapsed',
              )}
            >
              {showNavLabels && (
                <p className="admin-nav-group__label">{group.label}</p>
              )}
              {!showNavLabels && groupIndex > 0 && (
                <div className="admin-nav-group__rule" aria-hidden />
              )}
              <div className="admin-nav-group__items">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const staticGroups = MOBILE_NAV_SECTIONS[item.path];
                  const navGroups =
                    isActive && workspaceSubnav ? workspaceSubnav.groups : staticGroups;
                  const activeSectionId =
                    isActive && workspaceSubnav ? workspaceSubnav.activeId : undefined;
                  const showMobileDropdown = mobileNavOpen && navGroups != null;
                  const isDropdownOpen = mobileNavExpandedPath === item.path;

                  if (showMobileDropdown && navGroups) {
                    const sectionsId = `admin-nav-sections-${item.path.replace(/\//g, '-')}`;
                    return (
                      <div key={item.path} className="admin-nav-dropdown">
                        <button
                          type="button"
                          className={cn(
                            'admin-shell__nav-link admin-nav-dropdown__trigger w-full',
                            isActive && 'admin-shell__nav-link--active',
                            isDropdownOpen && 'admin-nav-dropdown__trigger--open',
                          )}
                          aria-expanded={isDropdownOpen}
                          aria-controls={sectionsId}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMobileNavExpandedPath(isDropdownOpen ? null : item.path);
                          }}
                        >
                          <item.icon className="w-5 h-5 shrink-0" aria-hidden />
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'admin-nav-dropdown__chevron w-4 h-4 shrink-0',
                              isDropdownOpen && 'admin-nav-dropdown__chevron--open',
                            )}
                            aria-hidden
                          />
                        </button>
                        <div
                          id={sectionsId}
                          className={cn(
                            'admin-nav-subsections',
                            isDropdownOpen && 'admin-nav-subsections--open',
                          )}
                          role="group"
                          aria-label={`${item.label} sections`}
                          hidden={!isDropdownOpen}
                        >
                          {navGroups.map((section) => (
                            <div key={section.label || 'default'} className="admin-nav-subsections__block">
                              {section.label ? (
                                <p className="admin-nav-subsections__label">{section.label}</p>
                              ) : null}
                              {section.items.map((sub) => {
                                const subActive = activeSectionId === sub.id;
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    className={cn(
                                      'admin-nav-subsection',
                                      subActive && 'admin-nav-subsection--active',
                                    )}
                                    aria-current={subActive ? 'true' : undefined}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (isActive && workspaceSubnav) {
                                        workspaceSubnav.onSelect(sub.id);
                                      } else {
                                        setPendingAdminSection(item.path, sub.id);
                                        navigate(item.path);
                                      }
                                      setMobileNavOpen(false);
                                      setMobileNavExpandedPath(null);
                                    }}
                                  >
                                    <sub.icon className="w-4 h-4 shrink-0" aria-hidden />
                                    <span className="truncate">{sub.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <React.Fragment key={item.path}>
                      <Link
                        to={item.path}
                        title={!showNavLabels ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          'admin-shell__nav-link',
                          isActive && 'admin-shell__nav-link--active',
                          !showNavLabels && 'admin-shell__nav-link--icon-only',
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" aria-hidden />
                        {showNavLabels && <span className="truncate">{item.label}</span>}
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-nav-footer">
          <Link
            to="/"
            title={!showNavLabels ? 'View site' : undefined}
            className={cn('admin-shell__nav-link', !showNavLabels && 'admin-shell__nav-link--icon-only')}
            onClick={() => setMobileNavOpen(false)}
          >
            <Home className="w-5 h-5 shrink-0" aria-hidden />
            {showNavLabels && <span>View site</span>}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            aria-label={!showNavLabels ? 'Sign out' : undefined}
            className={cn(
              'admin-shell__nav-link admin-shell__nav-link--danger w-full',
              !showNavLabels && 'admin-shell__nav-link--icon-only',
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" aria-hidden />
            {showNavLabels && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main id="admin-main" className="flex-1 flex flex-col overflow-hidden min-w-0" role="main">
        <header className="admin-shell__header flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="admin-shell__menu-btn"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <Menu className="w-5 h-5" aria-hidden />
            </button>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-10 h-10 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="admin-shell__header-title truncate">{title}</h1>
          </div>

          {showPreviewToggle && (
            <button
              type="button"
              onClick={togglePreview}
              aria-pressed={isPreviewVisible}
              aria-label={isPreviewVisible ? 'Turn preview off' : 'Turn preview on'}
              className={cn(
                'admin-shell__preview-toggle flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer',
                isPreviewVisible 
                  ? 'bg-accent/10 border-accent/25 text-accent' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900',
              )}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isPreviewVisible ? 'eye' : 'eye-off'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex"
                >
                  {isPreviewVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
              <span className="hidden sm:inline">
                {isPreviewVisible ? 'Preview on' : 'Preview off'}
              </span>
            </button>
          )}
        </header>

        <div
          className={cn(
            'flex-1 min-h-0',
            wide
              ? 'admin-shell__content--wide flex flex-col overflow-hidden'
              : 'admin-shell__content overflow-y-auto',
          )}
        >
          <div
            className={cn(
              wide ? 'admin-workspace admin-workspace--fill' : 'admin-workspace admin-shell__page',
            )}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
