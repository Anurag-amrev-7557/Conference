import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../../lib/utils';
import type { ConferenceSpeaker } from '../../../lib/websiteData';
import { SectionCarousel } from '../SectionCarousel';
import { SpeakerCarouselItem } from './SpeakerCarouselItem';
import { SpeakerCard } from './SpeakerCard';

const panelVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: [0.4, 0, 1, 1] as const },
  },
};

type EditionTab = {
  id: string;
  label: string;
};

type PastSpeakerEditionTabsProps = {
  editions: EditionTab[];
  speakersByEdition: Map<string, ConferenceSpeaker[]>;
  allSpeakers: ConferenceSpeaker[];
  onSelect: (speaker: ConferenceSpeaker) => void;
};

export function PastSpeakerEditionTabs({
  editions,
  speakersByEdition,
  allSpeakers,
  onSelect,
}: PastSpeakerEditionTabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prefersReducedMotion = useReducedMotion();
  const [activeEditionId, setActiveEditionId] = useState(editions[0]?.id ?? 'all');
  const [hasSwitchedEdition, setHasSwitchedEdition] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const panelId = `${baseId}-panel`;

  const activeSpeakers =
    activeEditionId === 'all' ? allSpeakers : (speakersByEdition.get(activeEditionId) ?? []);

  const focusTab = useCallback(
    (index: number) => {
      const tab = tabRefs.current[index];
      if (!tab) return;
      tab.focus();
      setActiveEditionId(editions[index].id);
    },
    [editions],
  );

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const lastIndex = editions.length - 1;
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = index === lastIndex ? 0 : index + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = index === 0 ? lastIndex : index - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = lastIndex;
          break;
        default:
          return;
      }

      event.preventDefault();
      focusTab(nextIndex);
    },
    [editions.length, focusTab],
  );

  const handleEditionChange = (editionId: string, label: string) => {
    if (editionId !== activeEditionId) {
      setHasSwitchedEdition(true);
    }
    setActiveEditionId(editionId);
    setLiveMessage(`${label} speakers loaded`);
  };

  const showEditionTabs = editions.length > 1;
  const showEditionBadgeOnCards = activeEditionId === 'all';

  return (
    <>
      {showEditionTabs ? (
        <div className="past-speakers-edition-tabs__toolbar">
          <div className="past-speakers-edition-tabs" role="tablist" aria-label="Summit editions">
            {editions.map((edition, index) => {
              const tabId = `${baseId}-tab-${edition.id}`;
              const isActive = activeEditionId === edition.id;

              return (
                <button
                  key={edition.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleEditionChange(edition.id, edition.label)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn(
                    'past-speakers-edition-tabs__tab',
                    isActive && 'past-speakers-edition-tabs__tab--active',
                  )}
                >
                  {edition.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeEditionId}
          id={panelId}
          role="tabpanel"
          aria-labelledby={showEditionTabs ? `${baseId}-tab-${activeEditionId}` : undefined}
          className="past-speakers-edition-tabs__panel"
          variants={prefersReducedMotion ? undefined : panelVariants}
          initial={prefersReducedMotion ? false : 'initial'}
          animate={prefersReducedMotion ? undefined : 'animate'}
          exit={prefersReducedMotion ? undefined : 'exit'}
        >
          {activeSpeakers.length === 0 ? (
            <p className="past-speakers-edition-tabs__empty">
              No alumni speakers for this edition yet.
            </p>
          ) : (
            <SectionCarousel ariaLabel="Past speakers" variant="speakers" showScrollHints>
              {activeSpeakers.map((speaker, idx) => (
                <SpeakerCarouselItem key={speaker.id} itemIndex={idx} instant={hasSwitchedEdition}>
                  <SpeakerCard
                    speaker={speaker}
                    priority={idx < 2}
                    interactive
                    showTalkChip
                    showEditionBadge={showEditionBadgeOnCards}
                    onSelect={onSelect}
                  />
                </SpeakerCarouselItem>
              ))}
            </SectionCarousel>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
