import { useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { BookDemoForm } from '../components/book-demo/BookDemoForm'
import { BookDemoPanel } from '../components/book-demo/BookDemoPanel'
import { BookDemoTrustFooter } from '../components/book-demo/BookDemoTrustFooter'
import { WaveDivider } from '../components/wave/WaveDivider'
import { SeoHead } from '../seo/SeoHead'
import { usePageSeo } from '../seo/usePageSeo'

export function ConferenceRegisterPage() {
  const seo = usePageSeo()

  useEffect(() => {
    document.documentElement.classList.add('book-demo-route')
    return () => document.documentElement.classList.remove('book-demo-route')
  }, [])

  return (
    <>
      <SeoHead seo={seo} />
      <div className="book-demo-page min-h-svh text-white">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="book-demo-main">
          <div className="book-demo">
            <section className="book-demo-dark" aria-labelledby="book-demo-heading">
              <div className="book-demo__backdrop" aria-hidden>
                <div className="book-demo__mesh" />
                <div className="book-demo__glow book-demo__glow--left" />
                <div className="book-demo__glow book-demo__glow--form" />
                <div className="book-demo__dots" />
                <div className="book-demo__grid" />
                <div className="book-demo__beam" />
                <div className="book-demo__noise" />
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
        </main>
      </div>
    </>
  )
}
