import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConferenceContent } from '../../../hooks/useConferenceContent';
import { defaultConferenceTickets } from '../../../lib/conferenceDefaults';
import { ConferenceSectionHeader } from './ConferenceSectionHeader';
import { ConferenceSectionShell } from './ConferenceSectionShell';

export function ConferenceTickets() {
  const content = useConferenceContent();
  const block = content.tickets ?? defaultConferenceTickets;
  const tiers = block.tiers?.length ? block.tiers : defaultConferenceTickets.tiers;
  const copy = content.sections.tickets;

  return (
    <ConferenceSectionShell
      id="conference-tickets"
      sectionClass="conference-tickets-section"
      visibleClass="conference-tickets-section--visible"
      variant="white"
    >
      <ConferenceSectionHeader
        copy={{
          eyebrow: copy?.eyebrow ?? block.eyebrow,
          title: copy?.title ?? block.title,
          titleAccent: copy?.titleAccent ?? block.titleAccent,
          lede: copy?.lede ?? block.lede,
        }}
        fallback={
          <>
            Secure Your <span className="editorial-accent">Spot</span>
          </>
        }
      />

      <div className="conference-tickets-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`conference-ticket-card${tier.recommended ? ' conference-ticket-card--featured' : ''}`}
          >
            {tier.recommended ? (
              <div className="conference-ticket-card__badge">Most Popular</div>
            ) : null}

            <div className="conference-ticket-card__head">
              <h3 className="conference-ticket-card__name">{tier.name}</h3>
              <p className="conference-ticket-card__description">{tier.description}</p>
              <div className="conference-ticket-card__price-row">
                <span className="conference-ticket-card__price">{tier.price}</span>
              </div>
            </div>

            <ul className="conference-ticket-card__features list-none p-0 m-0">
              {tier.features.map((feature) => (
                <li key={feature} className="conference-ticket-card__feature">
                  <Check className="conference-ticket-card__check" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className={`conference-ticket-card__cta${tier.recommended ? ' conference-ticket-card__cta--featured' : ''}`}
            >
              {tier.ctaLabel ?? 'Get Tickets'}
            </Link>
          </div>
        ))}
      </div>
    </ConferenceSectionShell>
  );
}
