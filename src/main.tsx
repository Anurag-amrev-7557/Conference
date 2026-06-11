import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import { startLiveBootstrapPrefetch } from './lib/prefetchCmsBootstrap';
import { reportWebVitals } from './lib/reportWebVitals';
import { setupDeployRecovery } from './lib/setupDeployRecovery';
import { WebsiteDataProvider } from './components/WebsiteDataProvider';
import './index.css';
import App from './App.tsx';

setupDeployRecovery();

// Non-blocking: use baked HTML bootstrap for first paint; refresh when API responds.
startLiveBootstrapPrefetch();
reportWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <WebsiteDataProvider>
        <App />
      </WebsiteDataProvider>
    </HelmetProvider>
  </StrictMode>,
);
