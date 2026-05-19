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
import { useWebsiteData } from './components/WebsiteDataProvider'
import { ScrollToHash } from './components/ScrollToHash'
import { MarketingService } from './lib/marketing'
import { initWebVitalsReporting } from './lib/reportWebVitals'
import { useLocation } from 'react-router-dom'

import { applyAppearance } from './theme/applyAppearance'

function ThemeSynchronizer() {
  const { data } = useWebsiteData();
  const { appearance, settings } = data;

  useEffect(() => {
    applyAppearance(appearance, settings);
  }, [appearance, settings]);

  return null;
}

function MarketingTracker() {
  const location = useLocation();

  useEffect(() => {
    // Phase 2: Hub Neutralization & Discovery
    MarketingService.init();
    initWebVitalsReporting();
  }, []); // Static Init

  useEffect(() => {
    MarketingService.logEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <ThemeSynchronizer />
      <Router>
        <ScrollToHash />
        <MarketingTracker />
        <div className="min-h-screen bg-bg font-sans text-text">
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
    </>
  )
}

export default App
