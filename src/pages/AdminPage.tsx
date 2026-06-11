import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import '../admin/admin.css';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
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
import { notifyAdminSessionChanged } from '../lib/adminSessionEvents';

const AdminOverview = lazy(() =>
  import('../components/admin/AdminOverview').then((m) => ({ default: m.AdminOverview })),
);
const BlogManager = lazy(() =>
  import('../components/admin/BlogManager').then((m) => ({ default: m.BlogManager })),
);
const EventManager = lazy(() =>
  import('../components/admin/EventManager').then((m) => ({ default: m.EventManager })),
);
const SettingsManager = lazy(() =>
  import('../components/admin/SettingsManager').then((m) => ({ default: m.SettingsManager })),
);
const ConferenceManager = lazy(() =>
  import('../components/admin/ConferenceManager').then((m) => ({ default: m.ConferenceManager })),
);
const RegistrationManager = lazy(() =>
  import('../components/admin/RegistrationManager').then((m) => ({ default: m.RegistrationManager })),
);
const DesignSystemManager = lazy(() =>
  import('../components/admin/DesignSystemManager').then((m) => ({ default: m.DesignSystemManager })),
);
const MediaManager = lazy(() =>
  import('../components/admin/MediaManager').then((m) => ({ default: m.MediaManager })),
);
const AdminUsersManager = lazy(() =>
  import('../components/admin/AdminUsersManager').then((m) => ({ default: m.AdminUsersManager })),
);
const NewsletterManager = lazy(() =>
  import('../components/admin/NewsletterManager').then((m) => ({ default: m.NewsletterManager })),
);

function ManagerSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader variant="dashboard" />}>{children}</Suspense>;
}

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
          notifyAdminSessionChanged();
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
    notifyAdminSessionChanged();
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
            notifyAdminSessionChanged();
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
              <ManagerSuspense>
                <AdminOverview />
              </ManagerSuspense>
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
              <ManagerSuspense>
                <DesignSystemManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route
        path="media"
        element={
          <ProtectedAdminRoute pageId="media">
            <AdminLayout title="Media" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <MediaManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route 
        path="blogs" 
        element={
          <ProtectedAdminRoute pageId="blogs">
            <AdminLayout title="Blog workspace" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <BlogManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="events" 
        element={
          <ProtectedAdminRoute pageId="events">
            <AdminLayout title="Events workspace" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <EventManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="settings" 
        element={
          <ProtectedAdminRoute pageId="settings">
            <AdminLayout title="Site settings" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <SettingsManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        } 
      />
      <Route
        path="conference"
        element={
          <ProtectedAdminRoute pageId="conference">
            <AdminLayout title="Summit homepage" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <ConferenceManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="newsletter"
        element={
          <ProtectedAdminRoute pageId="newsletter">
            <AdminLayout title="Newsletter signups" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <NewsletterManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="users"
        element={
          <ProtectedAdminRoute pageId="users">
            <AdminLayout title="Team & access" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <AdminUsersManager />
              </ManagerSuspense>
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="registrations"
        element={
          <ProtectedAdminRoute pageId="registrations">
            <AdminLayout title="Registrations" onLogout={handleLogout} wide>
              <ManagerSuspense>
                <RegistrationManager />
              </ManagerSuspense>
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
