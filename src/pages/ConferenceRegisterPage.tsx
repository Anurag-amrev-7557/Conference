import { useEffect } from 'react';
import '../styles/book-demo.css';
import { Footer } from '../components/Footer';
import { BookDemoForm } from '../components/book-demo/BookDemoForm';
import { BookDemoPanel } from '../components/book-demo/BookDemoPanel';
import { BookDemoTrustFooter } from '../components/book-demo/BookDemoTrustFooter';
import { WaveDivider } from '../components/wave/WaveDivider';
import {
  RegistrationFormSettingsProvider,
  useRegistrationFormSettingsContext,
} from '../context/RegistrationFormSettingsContext';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';

function ConferenceRegisterContent() {
  const seo = usePageSeo();
  const registration = useRegistrationFormSettingsContext();

  useEffect(() => {
    document.documentElement.classList.add('book-demo-route');
    return () => document.documentElement.classList.remove('book-demo-route');
  }, []);

  return (
    <>
      <SeoHead seo={seo} />
      <div className="book-demo-page min-h-svh text-white">
        <div className="book-demo-main">
          <div className="book-demo">
            <section className="book-demo-dark" aria-labelledby="book-demo-heading">
              <div className="book-demo__backdrop" aria-hidden>
                <div className="book-demo__mesh" />
                <div className="book-demo__glow book-demo__glow--left" />
                <div className="book-demo__glow book-demo__glow--form book-demo__glow--optional" />
                <div className="book-demo__dots" />
                <div className="book-demo__grid" />
                <div className="book-demo__beam book-demo__beam--optional" />
                <div className="book-demo__noise book-demo__noise--optional" />
                <div className="book-demo__horizon" />
                <div className="book-demo__vignette" />
              </div>

              <div className="book-demo__content">
                <div className="book-demo__layout">
                  <BookDemoPanel />
                  <div className="book-demo__form-col">
                    <BookDemoForm />
                  </div>
                </div>

                <div className="book-demo__wave-band" aria-hidden>
                  <WaveDivider variant="dark" className="book-demo__wave-divider" />
                </div>

                <BookDemoTrustFooter />
              </div>
            </section>
          </div>
        </div>
        {registration.showSiteFooter !== false ? <Footer /> : null}
      </div>
    </>
  );
}

export function ConferenceRegisterPage() {
  return (
    <RegistrationFormSettingsProvider>
      <ConferenceRegisterContent />
    </RegistrationFormSettingsProvider>
  );
}
