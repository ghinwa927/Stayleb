import { SearchHeader, SearchTitle, SearchResultsGrid, SearchFilters, SortSelect } from './ListingSearch';

export function SearchResultsSection0() {
  return <main className="w-full min-h-screen bg-[#F6F8FB]">
    {/* Compact scenic hero */}
    <section aria-label="Discover Lebanon" className="relative overflow-hidden">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/search_hero.png" alt="" aria-hidden="true" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2E35]/65 via-[#0B2E35]/35 to-[#0B2E35]/15" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B2E35]/40 to-transparent" />
      </div>
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-14 pb-16 sm:pb-20">
        <p className="text-[11px] font-bold tracking-[0.22em] text-white/85">DISCOVER LEBANON</p>
        <h2 className="text-white text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold tracking-tight leading-tight mt-2 drop-shadow-sm">Stays across Lebanon</h2>
        <p className="text-white/90 text-[13.5px] sm:text-[15px] mt-1.5">Villas, chalets and unique homes in extraordinary places</p>
      </div>
    </section>

    {/* Search card overlapping hero */}
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="-mt-10 sm:-mt-12 relative z-10">
        <SearchHeader />
      </div>
    </div>

    {/* Results area */}
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16">
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        <SearchFilters />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
            <SearchTitle />
            <label className="flex items-center gap-2 text-[13px] text-[#64748B] shrink-0 pt-1">Sort by<SortSelect aria-label="Sort properties" /></label>
          </div>
          <SearchResultsGrid />
        </div>
      </div>
    </div>
  </main>;
}
