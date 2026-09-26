import { SearchHeader, SearchTitle, SearchResultsGrid, SearchFilters, SortSelect } from './ListingSearch';

export function SearchResultsSection0() {
  return <main className="w-full min-h-screen bg-[#f8f9ff]">
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SearchHeader/>
      <div className="flex flex-wrap justify-between items-center gap-4 py-3"><SearchTitle/><label className="flex items-center gap-2 text-sm">Sort<SortSelect aria-label="Sort properties"/></label></div>
      <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8"><SearchFilters/><SearchResultsGrid/></div>
    </div>
  </main>;
}
