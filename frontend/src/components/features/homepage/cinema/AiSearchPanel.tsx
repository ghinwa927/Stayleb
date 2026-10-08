"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, MapPin, Search } from "lucide-react";
import { requireAuth } from "@/lib/authGuard";
import { searchPropertiesWithAI } from "@/services/ai";
import type { PropertySearchResponse } from "@/services/properties";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { LocalImage } from "@/components/ui/LocalImage";
import { toStayCard } from "./adapters";

const exampleQueries = [
  "Find me a chalet in Tyre for 2 guests with a pool",
  "I want a furnished house in Batroun for 6 people with parking",
  "Show me a chalet under $200 per night with a sea view",
  "Cozy mountain chalet in Faraya with fireplace for 4",
  "Beachfront villa in Jbeil for a family of 5",
];

const AI_PAGE_SIZE = 8;

/**
 * Cinematic presentation variant of AI search for the homepage film scene.
 * Reuses the real AI endpoint, auth guard, favorites and detail links, but
 * renders compact stay rows consistent with Explore Stays instead of the
 * shared component's light cards (other routes keep that appearance).
 * Requests fire only on explicit submit/page change — never on scroll.
 */
export function AiSearchPanel() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState("");
  const [showExamples, setShowExamples] = useState(true);
  // Monotonic id so a slow earlier response can never overwrite newer results.
  const requestId = useRef(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function autogrow() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  async function runSearch(submitted: string, page: number) {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await searchPropertiesWithAI({ query: submitted, page, page_size: AI_PAGE_SIZE });
      if (id !== requestId.current) return;
      setResults(data);
      setCurrentPage(page);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : "We couldn't find stays matching your request. Please try again.");
      setResults(null);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    if (!requireAuth({ nextPath: "/account", action: "booking", router })) return;
    setShowExamples(false);
    setCurrentQuery(trimmed);
    void runSearch(trimmed, 1);
  }

  function handlePageChange(page: number) {
    if (!currentQuery || loading) return;
    void runSearch(currentQuery, page);
  }

  function clearSearch() {
    requestId.current++;
    setQuery("");
    setResults(null);
    setError(null);
    setCurrentQuery("");
    setCurrentPage(1);
    setShowExamples(true);
    if (areaRef.current) areaRef.current.style.height = "auto";
  }

  const totalPages = results?.total_pages ?? 0;
  const pageStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));

  return (
    <div className="ai-panel">
      <form className="ai-form" onSubmit={handleSubmit}>
        <label className="ai-input-wrap" htmlFor="cinema-ai-query">
          <Search size={18} aria-hidden="true" />
          <span className="ai-input-label">Describe your ideal stay</span>
          <textarea
            ref={areaRef}
            id="cinema-ai-query"
            value={query}
            onChange={(e) => { setQuery(e.target.value); autogrow(); }}
            placeholder="e.g., Find me a chalet in Tyre for 2 guests with a pool"
            rows={2}
            className="ai-textarea"
          />
        </label>
        <div className="ai-form-row">
          <button type="submit" disabled={loading || !query.trim()} className="search-button ai-submit">
            {loading ? (
              <span className="ai-loading-inline" role="status">Searching…</span>
            ) : (
              <>Find My Stay <ArrowUpRight size={17} /></>
            )}
          </button>
          {currentQuery && (
            <button type="button" onClick={clearSearch} className="outline-button">
              Clear
            </button>
          )}
        </div>
      </form>

      {showExamples && !currentQuery && (
        <div className="ai-examples">
          <span>Try asking:</span>
          {exampleQueries.map((example) => (
            <button
              type="button"
              key={example}
              className="chip"
              onClick={() => { setQuery(example); requestAnimationFrame(autogrow); }}
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div role="status" aria-label="Finding matching stays" className="ai-loading">
          <p className="refresh-note">Finding stays that match your request…</p>
          <div className="ai-list">
            {[0, 1, 2].map((id) => (
              <div key={id} className="stay-card stay-skeleton" aria-hidden="true">
                <div className="card-image skeleton-block" />
                <div className="card-content">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="stay-message" role="alert">
          <p>No stays found</p>
          <p className="ai-error-detail">{error}</p>
          <div className="ai-form-row">
            <button className="outline-button" onClick={() => currentQuery && void runSearch(currentQuery, 1)}>Try a different search</button>
            <Link className="outline-button" href="/account/properties">Browse all properties</Link>
          </div>
        </div>
      )}

      {!loading && !error && results && results.total > 0 && (
        <div className="ai-results-block">
          <p className="results-note" role="status">
            Found {results.total} {results.total === 1 ? "stay" : "stays"} for “{currentQuery}”{" "}
            <button onClick={clearSearch}>New search</button>
          </p>
          <div className="ai-list">
            {results.items.map((property) => {
              const stay = toStayCard(property);
              return (
                <article className="stay-card" key={stay.id}>
                  <div className="card-image">
                    <Link className="card-link" href={stay.href} aria-label={`View ${stay.title}`}>
                      {stay.imageUrl ? (
                        <LocalImage src={stay.imageUrl} alt={stay.title} loading="lazy" />
                      ) : (
                        <div className="card-photo-fallback" role="img" aria-label={`${stay.title} (photo unavailable)`}>Photo unavailable</div>
                      )}
                    </Link>
                    <span className="photo-label">
                      <MapPin size={11} />
                      {stay.region}
                    </span>
                    <span className="ai-fav">
                      <FavoriteButton id={String(stay.id)} />
                    </span>
                  </div>
                  <div className="card-content">
                    <p className="property-type">{stay.typeLabel}</p>
                    <h3>
                      <Link href={stay.href}>{stay.title}</Link>
                    </h3>
                    <p className="capacity">{stay.capacityLine}</p>
                    <div className="card-amenities">
                      {stay.amenityNames.map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </div>
                    <div className="card-bottom">
                      <div>
                        <p>
                          <strong>{stay.priceLabel}</strong>
                          <span> / night</span>
                        </p>
                        <small>{stay.priceNote}</small>
                      </div>
                      <Link className="card-arrow" aria-label={`Explore ${stay.title}`} href={stay.href}>
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {totalPages > 1 && (
            <nav aria-label="AI Search results pages" className="ai-pages">
              <button disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                const page = pageStart + index;
                return (
                  <button
                    key={page}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={page === currentPage ? "active" : undefined}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </nav>
          )}
        </div>
      )}

      {!loading && !error && results && results.total === 0 && (
        <div className="stay-message" role="status">
          <p>No stays matched that description.</p>
          <div className="ai-form-row">
            <button className="outline-button" onClick={clearSearch}>Try a different search</button>
          </div>
        </div>
      )}
    </div>
  );
}
