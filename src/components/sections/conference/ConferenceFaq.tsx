import { useConferenceContent } from '../../../hooks/useConferenceContent'

export function ConferenceFaq() {
  const { faq, sections } = useConferenceContent()
  const copy = sections.faq

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          {copy?.eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
              {copy.eyebrow}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-text">
            {copy?.title ?? 'FAQ'}
          </h2>
        </div>

        <div className="space-y-4">
          {faq.map((item) => (
            <details
              key={item.id}
              className="group rounded-2xl border border-black/10 bg-white px-6 py-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.22)]"
            >
              <summary className="cursor-pointer list-none text-lg font-semibold text-text flex items-center justify-between gap-3">
                {item.question}
                <span className="text-text2 transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-text2 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
