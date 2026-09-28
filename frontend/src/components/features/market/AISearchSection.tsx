"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { requireAuth } from "@/lib/authGuard";
import { searchPropertiesWithAI, type AISearchParams } from "@/services/ai";
import type { PropertySearchResponse } from "@/services/properties";
import { PropertyCard } from "@/components/features/homepage/PropertyCard";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import Swal from "sweetalert2";

const exampleQueries = [
  "Find me a chalet in Tyre for 2 guests with a pool",
  "I want a furnished house in Batroun for 6 people with parking",
  "Show me a chalet under $200 per night with a sea view",
  "Cozy mountain chalet in Faraya with fireplace for 4",
  "Beachfront villa in Jbeil for a family of 5",
];

export function AISearchSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState("");
  const [showExamples, setShowExamples] = useState(true);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (!requireAuth({ nextPath: "/account", action: "booking", router })) return;

    setLoading(true);
    setError(null);
    setShowExamples(false);
    setCurrentQuery(trimmed);
    setCurrentPage(1);

    try {
      const data = await searchPropertiesWithAI({ query: trimmed, page: 1, page_size: 12 });
      setResults(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "We couldn't find stays matching your request. Please try again.";
      setError(msg);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!currentQuery || loading) return;
    setLoading(true);
    try {
      const data = await searchPropertiesWithAI({ query: currentQuery, page, page_size: 12 });
      setResults(data);
      setCurrentPage(page);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load more results.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setError(null);
    setCurrentQuery("");
    setCurrentPage(1);
    setShowExamples(true);
  };

  if (results && results.total > 0) {
    const totalPages = results.total_pages;
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 bg-white rounded-[20px] border border-[#E9EEF3] shadow-[0_4px_20px_rgba(15,40,50,0.06)]">
          <div>
            <h2 className="text-[18px] font-bold text-[#0F2432] flex items-center gap-2">
              <Icon name="auto_awesome" className="material-symbols-outlined text-[#157375] text-[22px]" />
              AI Search Results
            </h2>
            <p className="text-[13.5px] text-[#64748B] mt-1">
              Found <strong className="text-[#157375]">{results.total}</strong> {results.total === 1 ? "stay" : "stays"} for <strong>&quot;{currentQuery}&quot;</strong>
            </p>
          </div>
          <button
            onClick={clearSearch}
            className="text-[13px] font-semibold text-[#157375] hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            <Icon name="close" className="material-symbols-outlined text-[16px]" />
            New Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.items.map((property) => (
            <PropertyCard key={property.id} property={property} showFavorite={true} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav aria-label="AI Search results pages" className="flex flex-wrap items-center justify-center gap-2">
            <span className="sr-only">Page {currentPage} of {totalPages}</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#157375] hover:bg-[#F8FAFC] disabled:opacity-40 inline-flex items-center"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <Icon name="chevron_left" className="material-symbols-outlined text-[18px]" />
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const page = start + index;
                return (
                  <button
                    key={page}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`min-w-10 h-10 px-3 rounded-full text-[13px] font-semibold transition-all ${page === currentPage ? "bg-[#157375] text-white shadow-[0_6px_16px_rgba(21,115,117,0.3)]" : "bg-white border border-[#E2E8F0] text-[#157375] hover:bg-[#F8FAFC]"}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#157375] hover:bg-[#F8FAFC] disabled:opacity-40 inline-flex items-center"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <Icon name="chevron_right" className="material-symbols-outlined text-[18px]" />
              </button>
            </div>
          </nav>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-body-md text-on-surface-variant font-medium">Finding stays that match your request…</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3].map((id) => (
            <div key={id} className="rounded-2xl bg-white animate-pulse overflow-hidden shadow-sm border border-surface-container-low">
              <div className="aspect-[4/3] bg-gradient-to-br from-surface-container to-surface-container-high" />
              <div className="p-5 space-y-4">
                <div className="h-5 bg-surface-container rounded w-3/4" />
                <div className="h-4 bg-surface-container rounded w-1/2" />
                <div className="h-4 bg-surface-container rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-surface-container-low text-center space-y-6" role="alert">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon name="search_off" className="text-primary text-4xl" />
        </div>
        <div className="space-y-2">
          <h3 className="text-headline-md font-headline-md text-[#157375]">No stays found</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={clearSearch} className="primary-button w-full sm:w-auto">
            <Icon name="refresh" className="material-symbols-outlined text-[18px] mr-2" />
            Try a different search
          </button>
          <Link href="/account/properties" className="secondary-button w-full sm:w-auto">
            <Icon name="explore" className="material-symbols-outlined text-[18px] mr-2" />
            Browse all properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="bg-white rounded-[22px] p-5 sm:p-6 md:p-7 shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#46B1B1] to-[#157375] flex items-center justify-center flex-shrink-0 shadow-[0_6px_16px_rgba(21,115,117,0.3)]">
            <Icon name="auto_awesome" className="material-symbols-outlined text-white text-[26px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#0F2432] tracking-tight">AI Search</h2>
            <p className="text-[13.5px] text-[#64748B] mt-0.5">Describe your ideal stay in your own words</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <Icon name="search" className="material-symbols-outlined absolute left-4 top-5 text-[22px] text-[#94A3B8] pointer-events-none" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Find me a chalet in Tyre for 2 guests with a pool"
              className="w-full h-28 pl-12 pr-4 pt-4 pb-4 rounded-xl bg-white border border-[#E2E8F0] text-[15px] text-[#1E293B] focus:outline-none focus:ring-[3px] focus:ring-[#46B1B1]/20 focus:border-[#46B1B1] transition-all resize-none placeholder:text-[#94A3B8]"
              rows={4}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex flex-1 min-w-[180px] items-center justify-center gap-2 py-4 px-6 rounded-xl text-white text-[15px] font-semibold bg-gradient-to-r from-[#46B1B1] to-[#157375] shadow-[0_10px_25px_rgba(21,115,117,0.3)] hover:brightness-[1.03] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Searching…
                </>
              ) : (
                <>
                  <Icon name="auto_awesome" className="material-symbols-outlined text-[20px]" />
                  Find My Stay
                  <Icon name="arrow_forward" className="material-symbols-outlined text-[19px]" />
                </>
              )}
            </button>
            {currentQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-4 text-[14px] font-semibold text-[#157375] hover:bg-[#F8FAFC] transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="close" className="material-symbols-outlined text-[18px]" />
                  Clear
                </span>
              </button>
            )}
          </div>
        </form>

        {showExamples && !currentQuery && (
          <div className="pt-5 mt-5 border-t border-[#EEF2F6]">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.12em] mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium rounded-full bg-white border border-[#E2E8F0] text-[#157375] hover:border-[#46B1B1] hover:bg-[#46B1B1]/5 transition-all"
                >
                  <Icon name="search" className="material-symbols-outlined text-[15px] text-[#157375]" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}