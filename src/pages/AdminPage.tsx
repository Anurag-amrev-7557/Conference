import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import '../admin/admin.css';
import { AdminLayoutOutlet } from '../components/admin/AdminLayoutOutlet';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminWorkspaceNavProvider } from '../components/admin/admin-workspace-nav';
import { AdminAuthLogin } from '../components/admin/AdminAuthLogin';
import { AdminSessionProvider } from '../components/admin/useAdminSession';
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
import { clearAdminAuth, getAdminToken } from '../lib/adminAuth';
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
  import('../components/admin/RegistrationManager').then((m) => ({
    default: m.RegistrationManager,
  })),
);
const DesignSystemManager = lazy(() =>
  import('../components/admin/DesignSystemManager').then((m) => ({
    default: m.DesignSystemManager,
  })),
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

function ProtectedManager({
  pageId,
  children,
}: {
  pageId: Parameters<typeof ProtectedAdminRoute>[0]['pageId'];
  children: React.ReactNode;
}) {
  return (
    <ProtectedAdminRoute pageId={pageId}>
      <ManagerSuspense>{children}</ManagerSuspense>
    </ProtectedAdminRoute>
  );
}

export const AdminPage: React.FC = () => {
  const seo = usePageSeo();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(
    !!localStorage.getItem(config.admin.sessionKey),
  );
  const [sessionError, setSessionError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hasSessionHint = localStorage.getItem(config.admin.sessionKey);
    if (!hasSessionHint) {
      setSessionChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await api.getAdminMe(getAdminToken());
        if (!cancelled) {
          setIsAuthenticated(true);
          setAdminSession(me.role, me.username);
        }
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (!cancelled && (status === 401 || status === 403)) {
          await clearAdminAuth();
          clearAdminSession();
          notifyAdminSessionChanged();
          setIsAuthenticated(false);
          setSessionError('Your session has expired. Please sign in again.');
        }
      } finally {
        if (!cancelled) setSessionChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setIsAuthenticated(false);
    await clearAdminAuth();
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
                <AdminSessionProvider>
                  <AdminWorkspaceNavProvider>
                    <ErrorBoundary fallbackTitle="Admin workspace error">
                      <Routes>
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route element={<AdminLayoutOutlet onLogout={handleLogout} />}>
                          <Route
                            path="dashboard"
                            element={
                              <ProtectedManager pageId="dashboard">
                                <AdminOverview />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="pages"
                            element={<Navigate to="/admin/conference" replace />}
                          />
                          <Route
                            path="homepage"
                            element={<Navigate to="/admin/conference" replace />}
                          />
                          <Route
                            path="design"
                            element={
                              <ProtectedManager pageId="design">
                                <DesignSystemManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="media"
                            element={
                              <ProtectedManager pageId="media">
                                <MediaManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="blogs"
                            element={
                              <ProtectedManager pageId="blogs">
                                <BlogManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="events"
                            element={
                              <ProtectedManager pageId="events">
                                <EventManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="settings"
                            element={
                              <ProtectedManager pageId="settings">
                                <SettingsManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="conference"
                            element={
                              <ProtectedManager pageId="conference">
                                <ConferenceManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="newsletter"
                            element={
                              <ProtectedManager pageId="newsletter">
                                <NewsletterManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="users"
                            element={
                              <ProtectedManager pageId="users">
                                <AdminUsersManager />
                              </ProtectedManager>
                            }
                          />
                          <Route
                            path="registrations"
                            element={
                              <ProtectedManager pageId="registrations">
                                <RegistrationManager />
                              </ProtectedManager>
                            }
                          />
                        </Route>
                      </Routes>
                    </ErrorBoundary>
                  </AdminWorkspaceNavProvider>
                </AdminSessionProvider>
              </AdminProviders>
            </UndoRedoProvider>
          </AutosaveProvider>
        </ToastProvider>
      </AdminThemeProvider>
    </>
  );
};
