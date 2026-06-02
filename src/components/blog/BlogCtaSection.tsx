import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { LeadCaptureModal } from "../LeadCaptureModal"
import { useWebsiteData } from "../WebsiteDataProvider"

export function BlogCtaSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data } = useWebsiteData()
  const cta = data.settings.blogCta ?? {}

  const lede =
    cta.lede ??
    "Our team of AI experts is just a call away. Whether you're exploring ideas or ready to build, we'll help you bring your agentic workflow to life—faster."
  const buttonLabel = cta.buttonLabel ?? "Talk to Us"

  return (
    <>
      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section className="blog-cta" aria-labelledby="blog-cta-heading">
        <div className="blog-cta__card">
          <h2 id="blog-cta-heading" className="blog-cta__title">
            {cta.title ?? (
              <>
                Got a use case in mind? <span className="editorial-accent">Let&apos;s make it real.</span>
              </>
            )}
          </h2>
          <p className="blog-cta__lede">{lede}</p>
          <button
            type="button"
            className="blog-cta__btn group"
            onClick={() => setIsModalOpen(true)}
          >
            {buttonLabel}
            <ArrowUpRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </button>
        </div>
      </section>
    </>
  )
}
