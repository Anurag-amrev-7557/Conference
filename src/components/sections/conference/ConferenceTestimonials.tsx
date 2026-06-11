import { useConferenceContent } from '../../../hooks/useConferenceContent';
import { resolveAssetUrl } from '../../../lib/assetUrl';
import { ConferenceSectionHeader } from './ConferenceSectionHeader';
import { ConferenceSectionShell } from './ConferenceSectionShell';

export function ConferenceTestimonials() {
  const { testimonials, sections } = useConferenceContent();
  const copy = sections.testimonials;

  if (!testimonials?.length) return null;

  return (
    <ConferenceSectionShell
      id="conference-testimonials"
      sectionClass="conference-testimonials-section"
      visibleClass="conference-testimonials-section--visible"
      variant="muted"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            What attendees <span className="editorial-accent">are saying</span>
          </>
        }
        ledeFallback="Leaders share why the summit experience matters."
      />

      <ul className="list-none p-0 m-0 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6">
        {testimonials.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.18)] flex flex-col gap-4"
          >
            <blockquote className="text-text2 leading-relaxed italic m-0 flex-1">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3 pt-2 border-t border-black/6">
              {item.avatarUrl?.trim() ? (
                <img
                  src={resolveAssetUrl(item.avatarUrl)}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-sm shrink-0"
                  aria-hidden
                >
                  {item.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-text truncate">{item.name}</p>
                <p className="text-sm text-muted truncate">
                  {[item.role, item.company].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ConferenceSectionShell>
  );
}
