import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogManager } from '../components/admin/BlogManager';
import { EventManager } from '../components/admin/EventManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import { ConferenceManager } from '../components/admin/ConferenceManager';
import { RegistrationManager } from '../components/admin/RegistrationManager';
import { DesignSystemManager } from '../components/admin/DesignSystemManager';
import { MediaManager } from '../components/admin/MediaManager';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminUsersManager } from '../components/admin/AdminUsersManager';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { NewsletterManager } from '../components/admin/NewsletterManager';
import { AdminWorkspaceNavProvider } from '../components/admin/admin-workspace-nav';
import { AdminAuthLogin } from '../components/admin/AdminAuthLogin';
import { setAdminSession, clearAdminSession } from '../components/admin/useAdminSession';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../components/admin/ui/Toast';
import { AutosaveProvider } from '../components/admin/providers/AutosaveProvider';
import { AdminProviders } from '../components/admin/providers/AdminProviders';
import { AdminThemeProvider } from '../components/admin/providers/AdminThemeProvider';
import { UndoRedoProvider } from '../components/admin/providers/UndoRedoProvider';
import { PageLoader } from '../components/admin/ui/Skeleton';
import { api } from '../lib/api';
import { config } from '../lib/config';

export const AdminPage: React.FC = () => {
  const seo = usePageSeo();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(
    !!localStorage.getItem('adminToken')
  );
  const [sessionError, setSessionError] = useState('');
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
        const me = await api.getAdminMe(token);
        if (!cancelled) {
          setIsAuthenticated(true);
          setAdminSession(me.role, me.username);
        }
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 401 || !cancelled) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem(config.admin.sessionKey);
          clearAdminSession();
          if (!cancelled) {
            setIsAuthenticated(false);
            setSessionError('Your session has expired. Please sign in again.');
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem(config.admin.sessionKey);
    clearAdminSession();
    navigate('/admin');
  };

  if (sessionChecking) {
    return (
      <>
        <SeoHead seo={seo} />
        <div className="admin-shell admin-auth-shell min-h-screen" data-theme="light">
          <PageLoader variant="dashboard" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SeoHead seo={seo} />
        <AdminAuthLogin
          initialError={sessionError}
          onSuccess={() => {
            setSessionError('');
            setIsAuthenticated(true);
          }}
        />
      </>
    );
  }

  return (
    <>
    <SeoHead seo={seo} />
    <AdminThemeProvider>
    <ToastProvider>
    <AutosaveProvider>
    <UndoRedoProvider>
    <AdminProviders>
    <AdminWorkspaceNavProvider>
    <ErrorBoundary fallbackTitle="Admin workspace error">
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route 
        path="dashboard" 
        element={
          <ProtectedAdminRoute pageId="dashboard">
            <AdminLayout title="Dashboard" onLogout={handleLogout}>
              <AdminOverview />
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route path="pages" element={<Navigate to="/admin/conference" replace />} />
      <Route path="homepage" element={<Navigate to="/admin/conference" replace />} />
      <Route 
        path="design" 
        element={
          <ProtectedAdminRoute pageId="design">
            <AdminLayout title="Brand & theme" onLogout={handleLogout} wide>
              <DesignSystemManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route
        path="media"
        element={
          <ProtectedAdminRoute pageId="media">
            <AdminLayout title="Media" onLogout={handleLogout} wide>
              <MediaManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route 
        path="blogs" 
        element={
          <ProtectedAdminRoute pageId="blogs">
            <AdminLayout title="Blog workspace" onLogout={handleLogout} wide>
              <BlogManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="events" 
        element={
          <ProtectedAdminRoute pageId="events">
            <AdminLayout title="Events workspace" onLogout={handleLogout} wide>
              <EventManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="settings" 
        element={
          <ProtectedAdminRoute pageId="settings">
            <AdminLayout title="Site settings" onLogout={handleLogout} wide>
              <SettingsManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route
        path="conference"
        element={
          <ProtectedAdminRoute pageId="conference">
            <AdminLayout title="Summit homepage" onLogout={handleLogout} wide>
              <ConferenceManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="newsletter"
        element={
          <ProtectedAdminRoute pageId="newsletter">
            <AdminLayout title="Newsletter signups" onLogout={handleLogout} wide>
              <NewsletterManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="users"
        element={
          <ProtectedAdminRoute pageId="users">
            <AdminLayout title="Team & access" onLogout={handleLogout} wide>
              <AdminUsersManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="registrations"
        element={
          <ProtectedAdminRoute pageId="registrations">
            <AdminLayout title="Registrations" onLogout={handleLogout} wide>
              <RegistrationManager />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
    </Routes>
    </ErrorBoundary>
    </AdminWorkspaceNavProvider>
    </AdminProviders>
    </UndoRedoProvider>
    </AutosaveProvider>
    </ToastProvider>
    </AdminThemeProvider>
    </>
  );
};
