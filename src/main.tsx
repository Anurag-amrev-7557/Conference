import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import { readDomCmsBootstrap } from './lib/cmsBootstrap'
import { prefetchLiveCmsBootstrap } from './lib/prefetchCmsBootstrap'
import { WebsiteDataProvider } from './components/WebsiteDataProvider'
import './index.css'
import App from './App.tsx'

const inlineBootstrap = readDomCmsBootstrap()
const liveBootstrap = await prefetchLiveCmsBootstrap(inlineBootstrap)
if (liveBootstrap) {
  window.__CMS_PREFETCH__ = liveBootstrap
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <WebsiteDataProvider>
        <App />
      </WebsiteDataProvider>
    </HelmetProvider>
  </StrictMode>,
)
