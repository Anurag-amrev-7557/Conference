import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ConferencePage } from './pages/ConferencePage'
import { ConferenceRegisterPage } from './pages/ConferenceRegisterPage'
import { Navbar } from './components/Navbar'
import { ConferenceRevealProvider } from './context/ConferenceRevealContext'
import { useWebsiteData } from './components/WebsiteDataProvider'
import { ScrollToHash } from './components/ScrollToHash'
import { MarketingService } from './lib/marketing'
import { initWebVitalsReporting } from './lib/reportWebVitals'
import { useLocation } from 'react-router-dom'
import { InjectedScripts } from './components/InjectedScripts'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CookieBanner } from './components/CookieBanner'
import { ApiKeepAlive } from './components/ApiKeepAlive'

function ThemeSynchronizer() {
  const { data } = useWebsiteData();
  const { appearance, settings } = data;

  useEffect(() => {
    // 1. Update Colors
    document.documentElement.style.setProperty('--color-accent', appearance.primaryColor);
    
    const darkenColor = (hex: string) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * 10);
      const r = Math.max(0, (num >> 16) - amt);
      const b = Math.max(0, ((num >> 8) & 0x00FF) - amt);
      const g = Math.max(0, (num & 0x0000FF) - amt);
      return '#' + (0x1000000 + r * 0x10000 + b * 0x100 + g).toString(16).slice(1);
    };
    document.documentElement.style.setProperty('--color-accent2', darkenColor(appearance.primaryColor));
    
    // 2. Update Typography
    const fontMapping = {
      serif: "'Instrument Serif', serif",
      sans: "'Plus Jakarta Sans', sans-serif",
      mono: "'JetBrains Mono', monospace"
    };
    if (appearance?.typography?.headingFont) {
      document.documentElement.style.setProperty('--font-serif', fontMapping[appearance.typography.headingFont as keyof typeof fontMapping]);
    }
    if (appearance?.typography?.bodyFont) {
      document.documentElement.style.setProperty('--font-sans', fontMapping[appearance.typography.bodyFont as keyof typeof fontMapping]);
    }
    
    if (appearance?.typography?.baseSize) {
      const sizeMapping = { small: '14px', medium: '15px', large: '17px' };
      document.documentElement.style.setProperty('--base-font-size', sizeMapping[appearance.typography.baseSize as keyof typeof sizeMapping]);
    }
    
    // 3. Update Theme Styles
    if (appearance?.theme?.borderRadius) {
      const radiusMapping = { none: '0px', sm: '8px', md: '16px', lg: '32px', full: '999px' };
      document.documentElement.style.setProperty('--radius-global', radiusMapping[appearance.theme.borderRadius as keyof typeof radiusMapping]);
    }
    
    if (appearance?.theme?.shadowIntensity) {
      const shadowMapping = {
        none: 'none',
        soft: '0 10px 30px -5px rgba(0,0,0,0.05)',
        heavy: '0 20px 50px -10px rgba(0,0,0,0.15)'
      };
      document.documentElement.style.setProperty('--shadow-dynamic', shadowMapping[appearance.theme.shadowIntensity as keyof typeof shadowMapping]);
    }

    // 4. Inject Custom CSS
    let styleTag = document.getElementById('custom-css-runtime');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-css-runtime';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = settings.customCss;

  }, [appearance, settings]);

  return (
    <>
      <InjectedScripts html={settings.scripts?.header ?? ''} target="head" />
      <InjectedScripts html={settings.scripts?.footer ?? ''} target="body" />
    </>
  );
}

function MarketingTracker() {
  const location = useLocation();

  useEffect(() => {
    // Phase 2: Hub Neutralization & Discovery
    MarketingService.init();
    initWebVitalsReporting();
  }, []); // Static Init

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    MarketingService.logEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return null;
}

function App() {
  const { loading } = useWebsiteData();

  if (loading) {
    return (
      <div className="min-h-screen bg-off font-sans text-text">
        <div className="noise-texture" />
        <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-text/60">Loading</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Superhumanly Thoughts</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <ThemeSynchronizer />
      <ApiKeepAlive />
      <Router>
        <ConferenceRevealProvider>
        <ScrollToHash />
        <MarketingTracker />
        <div className="min-h-screen bg-off font-sans text-text">
          <div className="noise-texture" />
          <ErrorBoundary fallbackTitle="This page failed to load">
          <Routes>
            <Route path="/" element={<><Navbar /><ConferencePage /></>} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/conference" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<ConferenceRegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
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
