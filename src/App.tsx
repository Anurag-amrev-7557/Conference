import { lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { useEffect } from 'react'
import { ConferencePage } from './pages/ConferencePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ConferenceRevealProvider } from './context/ConferenceRevealContext'
import { useWebsiteData } from './components/WebsiteDataProvider'
import { ScrollToHash } from './components/ScrollToHash'
import { InjectedScripts } from './components/InjectedScripts'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CookieBanner } from './components/CookieBanner'
import { ApiKeepAlive } from './components/ApiKeepAlive'
import { RouteVisibilityGuard } from './components/RouteVisibilityGuard'
import { RouteSuspense } from './components/RouteSuspense'

const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const EventsPage = lazy(() => import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })))
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage })),
)
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })))
const ConferenceRegisterPage = lazy(() =>
  import('./pages/ConferenceRegisterPage').then((m) => ({ default: m.ConferenceRegisterPage })),
)
const SpeakersPage = lazy(() => import('./pages/SpeakersPage').then((m) => ({ default: m.SpeakersPage })))

function ThemeSynchronizer() {
  const { data } = useWebsiteData()
  const { appearance, settings } = data

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', appearance.primaryColor)

    const darkenColor = (hex: string) => {
      const num = parseInt(hex.replace('#', ''), 16)
      const amt = Math.round(2.55 * 10)
      const r = Math.max(0, (num >> 16) - amt)
      const g = Math.max(0, ((num >> 8) & 0x00ff) - amt)
      const b = Math.max(0, (num & 0x0000ff) - amt)
      return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
    }
    document.documentElement.style.setProperty('--color-accent2', darkenColor(appearance.primaryColor))

    const fontMapping = {
      serif: "'Instrument Serif', serif",
      sans: "'Plus Jakarta Sans', sans-serif",
      mono: "'JetBrains Mono', monospace",
    }
    if (appearance?.typography?.headingFont) {
      document.documentElement.style.setProperty(
        '--font-serif',
        fontMapping[appearance.typography.headingFont as keyof typeof fontMapping],
      )
    }
    if (appearance?.typography?.bodyFont) {
      document.documentElement.style.setProperty(
        '--font-sans',
        fontMapping[appearance.typography.bodyFont as keyof typeof fontMapping],
      )
    }

    if (appearance?.typography?.baseSize) {
      const sizeMapping = { small: '14px', medium: '15px', large: '17px' }
      document.documentElement.style.setProperty(
        '--base-font-size',
        sizeMapping[appearance.typography.baseSize as keyof typeof sizeMapping],
      )
    }

    if (appearance?.theme?.borderRadius) {
      const radiusMapping = { none: '0px', sm: '8px', md: '16px', lg: '32px', full: '999px' }
      document.documentElement.style.setProperty(
        '--radius-global',
        radiusMapping[appearance.theme.borderRadius as keyof typeof radiusMapping],
      )
    }

    if (appearance?.theme?.shadowIntensity) {
      const shadowMapping = {
        none: 'none',
        soft: '0 10px 30px -5px rgba(0,0,0,0.05)',
        heavy: '0 20px 50px -10px rgba(0,0,0,0.15)',
      }
      document.documentElement.style.setProperty(
        '--shadow-dynamic',
        shadowMapping[appearance.theme.shadowIntensity as keyof typeof shadowMapping],
      )
    }

    let styleTag = document.getElementById('custom-css-runtime')
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = 'custom-css-runtime'
      document.head.appendChild(styleTag)
    }
    styleTag.innerHTML = settings.customCss
  }, [appearance, settings])

  return (
    <>
      <InjectedScripts html={settings.scripts?.header ?? ''} target="head" />
      <InjectedScripts html={settings.scripts?.footer ?? ''} target="body" />
    </>
  )
}

function App() {
  return (
    <>
      <ThemeSynchronizer />
      <ApiKeepAlive />
      <Router>
        <ConferenceRevealProvider>
          <ScrollToHash />
          <div className="min-h-screen bg-off font-sans text-text">
            <div className="noise-texture" />
            <ErrorBoundary fallbackTitle="This page failed to load">
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<ConferencePage />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/conference" element={<Navigate to="/" replace />} />
                  <Route
                    path="/register"
                    element={
                      <RouteSuspense>
                        <RouteVisibilityGuard route="register">
                          <ConferenceRegisterPage />
                        </RouteVisibilityGuard>
                      </RouteSuspense>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <RouteSuspense>
                        <RouteVisibilityGuard route="events">
                          <EventsPage />
                        </RouteVisibilityGuard>
                      </RouteSuspense>
                    }
                  />
                  <Route
                    path="/events/:id"
                    element={
                      <RouteSuspense>
                        <RouteVisibilityGuard route="events">
                          <EventDetailPage />
                        </RouteVisibilityGuard>
                      </RouteSuspense>
                    }
                  />
                  <Route
                    path="/speakers"
                    element={
                      <RouteSuspense>
                        <RouteVisibilityGuard route="speakers">
                          <SpeakersPage />
                        </RouteVisibilityGuard>
                      </RouteSuspense>
                    }
                  />
                  <Route
                    path="/blog"
                    element={
                      <RouteSuspense>
                        <RouteVisibilityGuard route="blog">
                          <BlogPage />
                        </RouteVisibilityGuard>
                      </RouteSuspense>
                    }
                  />
                  <Route
                    path="/blog/:slug"
                    element={
                      <RouteSuspense>
                        <RouteVisibilityGuard route="blog">
                          <BlogPostPage />
                        </RouteVisibilityGuard>
                      </RouteSuspense>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route
                  path="/admin/*"
                  element={
                    <RouteSuspense>
                      <AdminPage />
                    </RouteSuspense>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </div>
          <CookieBanner />
        </ConferenceRevealProvider>
      </Router>
    </>
  )
}

export default App
