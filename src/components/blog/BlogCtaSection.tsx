import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { LeadCaptureModal } from "../LeadCaptureModal"

export function BlogCtaSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section className="blog-cta" aria-labelledby="blog-cta-heading">
        <div className="blog-cta__card">
          <h2 id="blog-cta-heading" className="blog-cta__title">
            Got a use case in mind? <em>Let&apos;s make it real.</em>
          </h2>
          <p className="blog-cta__lede">
            Our team of AI experts is just a call away. Whether you&apos;re exploring ideas
            or ready to build, we&apos;ll help you bring your agentic workflow to life—faster.
          </p>
          <button
            type="button"
            className="blog-cta__btn group"
            onClick={() => setIsModalOpen(true)}
          >
            Talk to Us
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
