import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { FinalCTA } from '../components/sections/FinalCTA';
import { CatalogHero } from '../components/catalog/CatalogHero';
import { CatalogPagination } from '../components/catalog/CatalogPagination';
import { SpeakerCard } from '../components/sections/conference/SpeakerCard';
import { SpeakerDetailDialog } from '../components/speakers/SpeakerDetailDialog';
import { SpeakerListRow } from '../components/speakers/SpeakerListRow';
import { SpeakersCatalogToolbar } from '../components/speakers/SpeakersCatalogToolbar';
import { useConferenceContent } from '../hooks/useConferenceContent';
import {
  countFeaturedSpeakers,
  countPastSpeakers,
  getCatalogPageSize,
  filterSpeakers,
  getSpeakerCompanies,
  sortSpeakers,
  type SpeakerCatalogFilter,
  type SpeakerSort,
  type SpeakerViewMode,
} from '../lib/speakers';
import { renderCatalogTitle } from '../lib/renderSectionTitle';
import { usePagination } from '../lib/usePagination';
import type { ConferenceSpeaker } from '../lib/websiteData';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { JsonLd } from '../seo/JsonLd';
import { SeoHead } from '../seo/SeoHead';
import { usePageJsonLd } from '../seo/usePageJsonLd';
import { usePageSeo } from '../seo/usePageSeo';
import { RoutePageSkeleton } from '../components/RoutePageSkeleton';

const BASE_SPEAKER_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
] as const;

const ALUMNI_FILTER = { id: 'alumni', label: 'Alumni' } as const;

export function SpeakersPage() {
  const { data, loading } = useWebsiteData();
  const conference = useConferenceContent();
  const seo = usePageSeo();
  const jsonLd = usePageJsonLd();
  const [searchParams] = useSearchParams();
  const speakers = conference.speakers;
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<SpeakerCatalogFilter | null>(null);
  const [activeCompany, setActiveCompany] = useState('all');
  const [sort, setSort] = useState<SpeakerSort>('featured-first');
  const [viewMode, setViewMode] = useState<SpeakerViewMode>('grid');
  const [selectedSpeaker, setSelectedSpeaker] = useState<ConferenceSpeaker | null>(null);

  const companies = useMemo(() => getSpeakerCompanies(speakers), [speakers]);
  const featuredCount = countFeaturedSpeakers(speakers);
  const pastCount = countPastSpeakers(speakers);
  const showFeaturedFilter = featuredCount > 0;
  const showAlumniFilter = pastCount > 0;
  const urlFilter: SpeakerCatalogFilter | null =
    searchParams.get('roster') === 'past' && showAlumniFilter ? 'alumni' : null;
  const activeFilter = userFilter ?? urlFilter ?? 'all';

  const speakerFilters = useMemo(() => {
    const filters: { id: string; label: string }[] = [{ id: 'all', label: 'All' }];
    if (showFeaturedFilter) {
      filters.push(BASE_SPEAKER_FILTERS[1]);
    }
    if (showAlumniFilter) {
      filters.push(ALUMNI_FILTER);
    }
    return filters;
  }, [showFeaturedFilter, showAlumniFilter]);

  const filteredSpeakers = useMemo(() => {
    const filtered = filterSpeakers(speakers, {
      query: searchQuery,
      filter: activeFilter,
      company: activeCompany,
    });
    return sortSpeakers(filtered, sort);
  }, [speakers, searchQuery, activeFilter, activeCompany, sort]);

  const catalog = data.settings.catalogPages?.speakers;
  const pageSize = getCatalogPageSize(catalog?.pageSize, 12);
  const { page, setPage, totalPages, paginatedItems, showPagination } = usePagination(
    filteredSpeakers,
    pageSize,
  );

  const resetFilters = () => {
    setUserFilter(null);
    setActiveCompany('all');
    setSearchQuery('');
    setSort('featured-first');
  };
  const speakerCountLabel = speakers.length === 1 ? '1 speaker' : `${speakers.length} speakers`;

  if (loading && speakers.length === 0) {
    return <RoutePageSkeleton />;
  }

  return (
    <>
      <SeoHead seo={seo} />
      <JsonLd graph={jsonLd} />
      <div className="speakers-page public-page-shell public-inner-page">
        <CatalogHero
          eyebrow={catalog?.eyebrow?.trim() || 'Speakers'}
          title={renderCatalogTitle(
            catalog,
            <>
              The minds shaping <span className="editorial-accent">agentic AI</span>
            </>,
          )}
          lede={
            catalog?.lede?.trim() ||
            `Browse ${speakerCountLabel} from across industry, research, and venture—each bringing hard-won insight to the summit stage.`
          }
        />

        <div className="catalog-main premium-catalog-main speakers-page__main w-full max-w-none mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
          <div className="speakers-catalog-stack">
            <SpeakersCatalogToolbar
              searchId="speakers-search-input"
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filters={speakerFilters.length > 1 ? speakerFilters : []}
              activeFilterId={activeFilter}
              onFilterChange={(id) => setUserFilter(id as SpeakerCatalogFilter)}
              companies={companies}
              activeCompany={activeCompany}
              onCompanyChange={setActiveCompany}
              sort={sort}
              onSortChange={setSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {speakers.length === 0 ? (
              <div className="speakers-empty">
                <p>Speaker lineup coming soon.</p>
              </div>
            ) : filteredSpeakers.length === 0 ? (
              <div className="speakers-empty">
                <p>No speakers match your filters.</p>
                {(searchQuery.trim() || activeFilter !== 'all' || activeCompany !== 'all') && (
                  <button type="button" className="speakers-empty__reset" onClick={resetFilters}>
                    Show all speakers
                  </button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <>
                <div className="speakers-catalog-list" role="list">
                  {paginatedItems.map((speaker) => (
                    <SpeakerListRow
                      key={speaker.id}
                      speaker={speaker}
                      onSelect={setSelectedSpeaker}
                    />
                  ))}
                </div>
                {showPagination ? (
                  <CatalogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
                ) : null}
              </>
            ) : (
              <>
                <ul className="speakers-catalog-grid">
                  {paginatedItems.map((speaker, idx) => (
                    <li key={speaker.id} className="speakers-catalog-grid__item">
                      <SpeakerCard
                        speaker={speaker}
                        priority={idx < 4}
                        interactive
                        variant="compact"
                        showEditionBadge={speaker.roster === 'past'}
                        showTalkChip={false}
                        onSelect={setSelectedSpeaker}
                      />
                    </li>
                  ))}
                </ul>
                {showPagination ? (
                  <CatalogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
                ) : null}
              </>
            )}
          </div>
        </div>

        {(data.settings.visibility.finalCta ?? true) ? (
          <FinalCTA useSummitRegister surfaceVariant="muted" />
        ) : null}

        <Footer />
      </div>

      <SpeakerDetailDialog speaker={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} />
    </>
  );
}
