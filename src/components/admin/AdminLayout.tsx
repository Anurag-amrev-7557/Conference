import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Settings, 
  Settings2,
  LogOut, 
  ArrowLeft,
  Home,
  Palette
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Blogs', path: '/admin/blogs' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: Settings, label: 'Section Content', path: '/admin/content' },
    { icon: Settings2, label: 'General Settings', path: '/admin/settings' },
    { icon: Palette, label: 'Appearance', path: '/admin/appearance' },
  ];

  return (
    <div className="flex min-h-screen bg-off overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-border/40 flex flex-col z-30">
        <div className="p-8 border-b border-border/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-serif italic text-text">Admin</h1>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">Control Center</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-muted hover:bg-off hover:text-text'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-border/20 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-off hover:text-text transition-all"
          >
            <Home className="w-5 h-5" />
            View Site
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-border/20 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border border-border hover:border-accent hover:bg-accent/5 flex items-center justify-center transition-all group"
            >
              <ArrowLeft className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
            </button>
            <h2 className="text-2xl font-serif italic text-text">{title}</h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-text">Admin User</p>
               <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Session</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
               A
             </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
