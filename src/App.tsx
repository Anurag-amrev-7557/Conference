import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { LandingPage } from './pages/LandingPage'
import { EventsPage } from './pages/EventsPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { CommunityPage } from './pages/CommunityPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { Navbar } from './components/Navbar'
import { WebsiteDataProvider, useWebsiteData } from './components/WebsiteDataProvider'
import { SplashScreen } from './components/ui/SplashScreen'
import { ScrollToHash } from './components/ScrollToHash'
import { MarketingService } from './lib/marketing'
import { useLocation } from 'react-router-dom'

function ThemeSynchronizer() {
  const { data } = useWebsiteData();
  const { appearance, settings } = data;

  useEffect(() => {
    // Update CSS Variables for Primary Color
    document.documentElement.style.setProperty('--color-accent', appearance.primaryColor);
    
    // Simple helper to darken hex color for hover states (approximate)
    const darkenColor = (hex: string) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * 10);
      const r = Math.max(0, (num >> 16) - amt);
      const b = Math.max(0, ((num >> 8) & 0x00FF) - amt);
      const g = Math.max(0, (num & 0x0000FF) - amt);
      return '#' + (0x1000000 + r * 0x10000 + b * 0x100 + g).toString(16).slice(1);
    };
    
    document.documentElement.style.setProperty('--color-accent2', darkenColor(appearance.primaryColor));
    
    // Update SEO Title
    if (settings.seo.title) {
      document.title = settings.seo.title;
    }
    
    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.seo.description) {
      metaDesc.setAttribute('content', settings.seo.description);
    }
  }, [appearance, settings]);

  return null;
}

function MarketingTracker() {
  const location = useLocation();

  useEffect(() => {
    // Phase 2: Hub Neutralization & Discovery
    MarketingService.init();
  }, []); // Static Init

  useEffect(() => {
    MarketingService.logEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <WebsiteDataProvider>
      <SplashScreen />
      <ThemeSynchronizer />
      <Router>
        <ScrollToHash />
        <MarketingTracker />
        <div className="min-h-screen bg-off font-sans text-text">
          <div className="noise-texture" />
          <Routes>
            <Route path="/" element={<><Navbar /><LandingPage /></>} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </WebsiteDataProvider>
  )
}

export default App
