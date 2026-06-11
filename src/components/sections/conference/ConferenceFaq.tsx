import { useConferenceContent } from '../../../hooks/useConferenceContent';
import { ConferenceSectionHeader } from './ConferenceSectionHeader';
import { ConferenceSectionShell } from './ConferenceSectionShell';

export function ConferenceFaq() {
  const { faq, sections } = useConferenceContent();
  const copy = sections.faq;

  return (
    <ConferenceSectionShell
      id="conference-faq"
      sectionClass="conference-faq-section"
      visibleClass="conference-faq-section--visible"
      variant="muted"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            Frequently Asked <span className="editorial-accent">Questions</span>
          </>
        }
        ledeFallback="Everything you need to know before you register."
      />

      <div className="conference-faq-list">
        {faq.map((item) => (
          <details key={item.id} className="conference-faq-item group">
            <summary className="conference-faq-item__summary">
              {item.question}
              <span className="conference-faq-item__icon" aria-hidden>
                +
              </span>
            </summary>
            <p className="conference-faq-item__answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </ConferenceSectionShell>
  );
}
