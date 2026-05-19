import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogManager } from '../components/admin/BlogManager';
import { CommunityManager } from '../components/admin/CommunityManager';
import { EventManager } from '../components/admin/EventManager';
import { PageEditor } from '../components/admin/PageEditor';
import { SettingsManager } from '../components/admin/SettingsManager';
import { DesignSystemManager } from '../components/admin/DesignSystemManager';
import { AdminOverview } from '../components/admin/AdminOverview';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '../lib/config';
import { api } from '../lib/api';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';

export const AdminPage: React.FC = () => {
  const seo = usePageSeo();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(
    !!localStorage.getItem('adminToken')
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setSessionChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await api.getAdminMe(token);
        if (!cancelled) setIsAuthenticated(true);
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 401 || !cancelled) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem(config.admin.sessionKey);
          if (!cancelled) {
            setIsAuthenticated(false);
            setError('Your session has expired. Please sign in again.');
          }
        }
      } finally {
        if (!cancelled) setSessionChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { token } = await api.login(password);
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', token);
      localStorage.setItem(config.admin.sessionKey, 'true');
    } catch (err: any) {
      setError(err.message || 'Incorrect administrative password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem(config.admin.sessionKey);
    navigate('/admin');
  };

  if (sessionChecking) {
    return (
      <>
      <SeoHead seo={seo} />
      <motion.div className="min-h-screen flex items-center justify-center bg-off">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </motion.div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
      <SeoHead seo={seo} />
      <motion.div className="min-h-screen flex items-center justify-center bg-off p-6 relative">
        <div className="absolute inset-0 bg-grid-studio opacity-40 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/50 backdrop-blur-xl p-12 lg:p-16 border border-border/60 relative z-10">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-8 shadow-sm">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-4xl font-serif italic text-text mb-4 tracking-tight">Admin Dashboard</h1>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Sign In Required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] ml-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl bg-off border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-center tracking-widest"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent2 transition-all shadow-lg shadow-accent/20 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
          </div>
        </motion.div>
      </motion.div>
      </>
    );
  }

  return (
    <>
    <SeoHead seo={seo} />
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route 
        path="dashboard" 
        element={
          <AdminLayout title="Dashboard" onLogout={handleLogout} wide={true}>
            <AdminOverview />
          </AdminLayout>
        } 
      />
      <Route 
        path="pages" 
        element={
          <AdminLayout title="Page Editor" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <PageEditor />
          </AdminLayout>
        } 
      />
      <Route 
        path="design" 
        element={
          <AdminLayout title="Design System" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <DesignSystemManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="blogs" 
        element={
          <AdminLayout title="Blog" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <BlogManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="community" 
        element={
          <AdminLayout title="Community" onLogout={handleLogout} wide={true}>
            <CommunityManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="events" 
        element={
          <AdminLayout title="Events" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <EventManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="settings" 
        element={
          <AdminLayout title="Settings" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <SettingsManager />
          </AdminLayout>
        } 
      />
    </Routes>
    </>
  );
};
