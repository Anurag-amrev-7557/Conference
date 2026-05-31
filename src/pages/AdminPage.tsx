import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogManager } from '../components/admin/BlogManager';
import { EventManager } from '../components/admin/EventManager';
import { PageEditor } from '../components/admin/PageEditor';
import { SettingsManager } from '../components/admin/SettingsManager';
import { ConferenceManager } from '../components/admin/ConferenceManager';
import { RegistrationManager } from '../components/admin/RegistrationManager';
import { DesignSystemManager } from '../components/admin/DesignSystemManager';
import { MediaManager } from '../components/admin/MediaManager';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminWorkspaceNavProvider } from '../components/admin/admin-workspace-nav';
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
      <div className="admin-shell admin-auth" data-admin>
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-auth__card"
        >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-5 shadow-lg shadow-accent/25">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="admin-auth__title">Sign in to CMS</h1>
              <p className="admin-auth__subtitle">Enter your admin password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="admin-field mb-0">
                <label htmlFor="admin-password" className="admin-field__label">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="admin-input"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="admin-error text-center" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn--primary w-full"
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
        </motion.div>
      </div>
      </>
    );
  }

  return (
    <>
    <SeoHead seo={seo} />
    <AdminWorkspaceNavProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route 
        path="dashboard" 
        element={
          <AdminLayout title="Dashboard" onLogout={handleLogout}>
            <AdminOverview />
          </AdminLayout>
        } 
      />
      <Route path="pages" element={<Navigate to="/admin/homepage" replace />} />
      <Route
        path="homepage"
        element={
          <AdminLayout title="Book page" onLogout={handleLogout} wide showPreviewToggle>
            <PageEditor />
          </AdminLayout>
        }
      />
      <Route 
        path="design" 
        element={
          <AdminLayout title="Brand & theme" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <DesignSystemManager />
          </AdminLayout>
        } 
      />
      <Route
        path="media"
        element={
          <AdminLayout title="Media" onLogout={handleLogout} wide={true}>
            <MediaManager />
          </AdminLayout>
        }
      />
      <Route 
        path="blogs" 
        element={
          <AdminLayout title="Blog workspace" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <BlogManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="events" 
        element={
          <AdminLayout title="Events workspace" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <EventManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="settings" 
        element={
          <AdminLayout title="Site settings" onLogout={handleLogout} wide={true} showPreviewToggle={true}>
            <SettingsManager />
          </AdminLayout>
        } 
      />
      <Route
        path="conference"
        element={
          <AdminLayout title="Homepage" onLogout={handleLogout} wide>
            <ConferenceManager />
          </AdminLayout>
        }
      />
      <Route
        path="registrations"
        element={
          <AdminLayout title="Registrations" onLogout={handleLogout} wide>
            <RegistrationManager />
          </AdminLayout>
        }
      />
    </Routes>
    </AdminWorkspaceNavProvider>
    </>
  );
};
