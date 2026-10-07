"use client";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type SelectHTMLAttributes, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { LocalImage } from '@/components/ui/LocalImage';
import { requireAuth } from '@/lib/authGuard';
import { getCachedSearch, searchProperties, type PropertySearchParams, type PropertySearchResponse } from '@/services/properties';
import { isAbortError } from '@/lib/request-cache';
import { propertySearchQuery, readPropertySearch, searchValidation, propertyDetailsHref } from '@/lib/property-search';
import { useAmenities } from '@/hooks/useAmenities';
import { PropertySearchForm } from './PropertySearchForm';
import { favoritesIdentity, getFavoritesCached, addFavorite, invalidateFavoritesCache, removeFavorite } from '@/services/favorites';
import Swal from 'sweetalert2';

type ListingState = { filters: PropertySearchParams; update: (patch: PropertySearchParams) => void; reset: () => void; retry: () => void; results: PropertySearchResponse | null; loading: boolean; error: string | null };
const ListingContext = createContext<ListingState | null>(null);
function useListing() {
  const state = useContext(ListingContext);
  if (!state) throw new Error('ListingProvider is required');
  return state;
}
export function ListingProvider({ children }: { children: ReactNode }) {
  const query = useSearchParams().toString();
  // Remount request state on URL changes, including browser back/forward.
  return <ListingRequest key={query} query={query}>{children}</ListingRequest>;
}
function ListingRequest({ query, children }: { query: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters] = useState(() => readPropertySearch(new URLSearchParams(query)));
  const validation = searchValidation(filters);
  // Reuse a fresh cached response so remounts and back-navigation render
  // instantly without another network request.
  const [initialResults] = useState<PropertySearchResponse | null>(
    () => (validation ? null : getCachedSearch(filters)),
  );
  const [results, setResults] = useState<PropertySearchResponse | null>(initialResults);
  const [error, setError] = useState<string | null>(validation);
  const [loading, setLoading] = useState(!validation && initialResults === null);
  const [attempt, setAttempt] = useState(0);
  // Monotonic id so a slow earlier response can never overwrite newer results.
  const requestId = useRef(0);
  // Set by retry() so only the retry-triggered fetch bypasses the cache.
  const forceNextRef = useRef(false);
  useEffect(() => {
    if (validation) return;
    const id = ++requestId.current;
    // Strict Mode runs this effect twice in development; both runs share one
    // network request through the cached fetcher, and only the latest
    // request id may write state.
    const forceRefresh = forceNextRef.current;
    forceNextRef.current = false;
    let cancelled = false;
    const controller = new AbortController();
    searchProperties(filters, { signal: controller.signal, forceRefresh }).then(data => {
      if (!cancelled && id === requestId.current) { setResults(data); setLoading(false); }
    }).catch((fetchError: unknown) => {
      if (cancelled || isAbortError(fetchError)) return;
      if (id === requestId.current) { setError('We couldn’t load stays. Please try again.'); setLoading(false); }
    });
    return () => { cancelled = true; controller.abort(); };
  }, [filters, validation, attempt]);
  function update(patch: PropertySearchParams) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    router.push(`${pathname}?${propertySearchQuery(next)}`, { scroll: false });
  }
  const retry = () => { if (!validation) { forceNextRef.current = true; setError(null); setLoading(true); setAttempt(value => value + 1); } };
  return <ListingContext.Provider value={{ filters, update, reset: () => router.push(pathname, { scroll: false }), retry, results, loading, error }}>{children}</ListingContext.Provider>;
}

// Favorites context for sharing favorites state across components
type FavoritesState = {
  favorites: Set<number>;
  loading: boolean;
  error: string | null;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (propertyId: number) => Promise<void>;
  isFavorite: (propertyId: number) => boolean;
};
const FavoritesContext = createContext<FavoritesState | null>(null);
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('FavoritesProvider is required');
  return context;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  // Anonymous visitors never load: start idle, not loading, so favorite
  // buttons stay interactive and no 401 request is ever sent. Signed-in
  // visitors start loading until the fetch below resolves.
  const [loading, setLoading] = useState<boolean>(() => favoritesIdentity() !== null);
  const [error, setError] = useState<string | null>(null);
  // Signed-in identity (null when anonymous). Changes on login/logout and
  // across tabs; the favorites fetch below follows it.
  const [identity, setIdentity] = useState<string | null>(() => favoritesIdentity());
  const identityRef = useRef<string | null>(identity);

  useEffect(() => {
    const syncIdentity = () => {
      const next = favoritesIdentity();
      if (identityRef.current === next) return;
      identityRef.current = next;
      // Drop cached entries on every account transition so favorites can
      // never leak from one account (or session) into another.
      invalidateFavoritesCache();
      if (next === null) {
        // Logged out: clear user-specific state here (in the event handler,
        // not in an effect) and skip the request entirely.
        setFavorites(new Set());
        setError(null);
        setLoading(false);
      } else {
        // Signing in (or switching accounts) shows loading until the fetch
        // effect below resolves.
        setError(null);
        setLoading(true);
      }
      setIdentity(next);
    };
    syncIdentity();
    window.addEventListener("stayleb-auth", syncIdentity);
    window.addEventListener("storage", syncIdentity);
    return () => {
      window.removeEventListener("stayleb-auth", syncIdentity);
      window.removeEventListener("storage", syncIdentity);
    };
  }, []);

  const loadFavorites = async (options?: { forceRefresh?: boolean }) => {
    const current = favoritesIdentity();
    // Never request favorites anonymously (avoids the 401 entirely).
    if (!current) {
      setFavorites(new Set());
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getFavoritesCached({ forceRefresh: options?.forceRefresh });
      // An account switch (or logout) during the flight must not write
      // another user's data into this provider.
      if (favoritesIdentity() !== current) return;
      const favSet = new Set(response.items.map(item => item.property.id));
      setFavorites(favSet);
    } catch (e) {
      if (isAbortError(e)) return;
      if (favoritesIdentity() !== current) return;
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
    } finally {
      if (favoritesIdentity() === current) setLoading(false);
      else {
        setFavorites(new Set());
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Anonymous: nothing to fetch (state is cleared in the auth handler).
    if (!identity) return;
    let cancelled = false;
    const controller = new AbortController();
    const wanted = identity;
    getFavoritesCached({ signal: controller.signal }).then(response => {
      if (!cancelled && favoritesIdentity() === wanted) {
        setFavorites(new Set(response.items.map(item => item.property.id)));
        setLoading(false);
      }
    }).catch((e: unknown) => {
      if (cancelled || isAbortError(e)) return;
      if (favoritesIdentity() !== wanted) return;
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
      setLoading(false);
    });
    return () => { cancelled = true; controller.abort(); };
  }, [identity]);

  const toggleFavorite = async (propertyId: number) => {
    const currentlyFavorite = favorites.has(propertyId);
    
    // Optimistic update
    const newFavorites = new Set(favorites);
    if (currentlyFavorite) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);

    try {
      if (currentlyFavorite) {
        await removeFavorite(propertyId);
      } else {
        await addFavorite(propertyId);
      }
      Swal.fire({
        title: currentlyFavorite ? 'Removed from favorites' : 'Saved to favorites',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      // Rollback on error
      setFavorites(favorites);
      const msg = e instanceof Error ? e.message : 'Failed to update favorites';
      Swal.fire({
        title: 'Error',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#157375',
      });
    }
  };

  const isFavorite = (propertyId: number) => favorites.has(propertyId);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, error, refreshFavorites: () => loadFavorites({ forceRefresh: true }), toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function SearchHeader() {
  const { filters, update } = useListing();
  return <section aria-label="Search stays" className="bg-white rounded-2xl shadow-[0_20px_45px_-15px_rgba(15,40,50,0.25)] border border-white/60 p-2.5 sm:p-3.5">
    <PropertySearchForm values={filters} onSearch={update}/>
  </section>;
}
export function SearchTitle() {
  const { filters, results } = useListing();
  const total = results?.total ?? 0;
  return <div className="min-w-0">
    <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#1E293B] leading-tight">{filters.location ? `Stays in ${filters.location}` : 'Stays across Lebanon'}</h1>
    <p role="status" className="text-[13px] text-[#64748B] mt-1">{total} {total === 1 ? 'stay' : 'stays'} found</p>
  </div>;
}

export function FavoriteButton({ id, onClick }: { id: string; onClick?: () => void }) {
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const propertyId = Number(id);
  const active = isFavorite(propertyId);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (!requireAuth({ nextPath: pathname || '/account/favorites', action: 'favorites', router })) return;
    toggleFavorite(propertyId);
  };

  return (
    <button
      type="button"
      aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={active}
      disabled={loading}
      onClick={handleClick}
      className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'bg-white text-rose-500' : 'bg-white/90 text-[#64748B] hover:bg-white hover:text-rose-400'
      }`}
    >
      <Icon name="favorite" className={`text-[18px] transition-all ${active ? 'filled' : ''}`} />
      <style jsx>{`
        .filled {
          font-variation-settings: 'FILL' 1;
        }
      `}</style>
    </button>
  );
}

export function PropertyCard({ property, search = {}, showFavorite = true }: { property: PropertySearchResponse['items'][number]; search?: PropertySearchParams; showFavorite?: boolean }) {
  const image = property.images.find(item => item.is_primary)?.image_url || property.images[0]?.image_url;
  const pricing = property.stay_pricing;
  const money = (value: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value));
  const href = propertyDetailsHref(property.id, search);
  return <article className="group bg-white rounded-[18px] overflow-hidden border border-[#E6EBF0] shadow-[0_2px_10px_rgba(15,40,50,0.05)] hover:shadow-[0_16px_35px_-12px_rgba(21,115,117,0.25)] hover:-translate-y-[2px] transition-all duration-300 flex flex-col h-full">
    <div className="aspect-[16/10] relative bg-[#EEF2F6] overflow-hidden shrink-0">
      <Link href={href} className="block w-full h-full" aria-label={`View ${property.title}`}>
        {image ? <LocalImage src={image} alt={property.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" /> : <div className="h-full grid place-items-center text-sm text-[#64748B]">Photo unavailable</div>}
      </Link>
      {showFavorite && <div className="absolute top-3 right-3"><FavoriteButton id={String(property.id)}/></div>}
    </div>
    <div className="p-4 sm:p-5 flex flex-col flex-1 gap-1.5 min-w-0">
      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#157375] flex items-center gap-1 truncate"><span className="text-[#94A3B8]">◉</span> {property.location}</p>
      <Link href={href} className="text-[16px] font-bold text-[#0F2432] group-hover:text-[#157375] transition-colors line-clamp-1 leading-snug">{property.title}</Link>
      <p className="text-[12px] text-[#46B1B1] font-semibold">{property.property_type === 'chalet' ? 'Chalet' : 'Furnished house'}</p>
      <p className="text-[12.5px] text-[#64748B] truncate">{property.max_guests} guests · {property.bedrooms} bedrooms · {property.beds} beds · {property.bathrooms} baths</p>
      <div className="flex flex-wrap gap-1.5 mt-1.5">{property.amenities.slice(0, 3).map(item => <span key={item.id} className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-medium text-[#64748B] whitespace-nowrap">{item.name}</span>)}</div>
      <div className="mt-auto pt-3">
        <div className="flex items-baseline gap-1.5"><strong className="text-[19px] font-extrabold text-[#157375] tracking-tight">{money(pricing?.average_price_per_night ?? property.price_per_night)}</strong><span className="text-[12px] text-[#64748B]">/ {pricing ? 'night avg.' : 'night'}</span></div>
        {pricing && <p className="text-[12.5px] mt-0.5 text-[#1E293B] font-semibold">{money(pricing.total_price)} for {pricing.number_of_nights} nights</p>}
        <p className="text-[11.5px] mt-0.5 text-[#94A3B8]">{property.min_nights}-night minimum</p>
      </div>
    </div>
  </article>;
}

export function SearchFilters() {
  const { filters, update, reset } = useListing();
  const amenities = useAmenities();
  const [message, setMessage] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const patch: PropertySearchParams = {};
    for (const field of ['min_price', 'max_price', 'bedrooms', 'beds', 'bathrooms'] as const) {
      const raw = data.get(field);
      patch[field] = raw === '' ? undefined : Number(raw);
    }
    patch.property_type = (data.get('property_type') || undefined) as PropertySearchParams['property_type'];
    const error = searchValidation({ ...filters, ...patch });
    setMessage(error);
    if (!error) update(patch);
  }
  const inputCls = "w-full h-[44px] rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[13px] text-[#1E293B] outline-none focus:border-[#46B1B1] focus:ring-2 focus:ring-[#46B1B1]/20 focus:bg-white transition-all placeholder:text-[#94A3B8]";
  return <>
    <button type="button" onClick={() => setMobileOpen(v => !v)} aria-expanded={mobileOpen} className="lg:hidden w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm px-4 py-3 text-[14px] font-semibold text-[#157375]">
      <Icon name="tune" className="text-[20px] text-[#157375]" />{mobileOpen ? 'Hide filters' : 'Show filters'}
    </button>
    <aside className={`${mobileOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[280px] xl:w-[300px] shrink-0 lg:sticky lg:top-24 h-fit bg-white rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3] space-y-5`}>
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-[15px] text-[#1E293B] font-bold"><Icon name="tune" className="text-[20px] text-[#157375]" />Filters</h2><button onClick={reset} className="text-[12.5px] font-semibold text-[#46B1B1] hover:text-[#157375] hover:underline">Clear all</button></div>
      <form onSubmit={apply} className="space-y-4">
        <fieldset><legend className="text-[13px] font-bold text-[#1E293B] mb-2">Nightly price (USD)</legend><div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5 text-[11.5px] font-medium text-[#64748B]">Minimum<input className={inputCls} name="min_price" type="number" min="0" step="0.01" placeholder="Any" defaultValue={filters.min_price ?? ''} /></label>
          <label className="flex flex-col gap-1.5 text-[11.5px] font-medium text-[#64748B]">Maximum<input className={inputCls} name="max_price" type="number" min="0" step="0.01" placeholder="Any" defaultValue={filters.max_price ?? ''} /></label>
        </div><p className="text-[11.5px] text-[#94A3B8] mt-2 leading-snug">For dated stays, each night must fit this range.</p></fieldset>
        <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#1E293B]">Property type<select className={inputCls} name="property_type" defaultValue={filters.property_type ?? ''}><option value="">All types</option><option value="chalet">Chalet</option><option value="furnished_house">Furnished house</option></select></label>
        {(['bedrooms', 'beds', 'bathrooms'] as const).map(field => {
          const current = filters[field];
          const base = Array.from({ length: 8 }, (_, i) => (field === 'bedrooms' ? i : i + 1));
          const options = current !== undefined && !base.includes(current) ? [...base, current].sort((a, b) => a - b) : base;
          return <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#1E293B] capitalize" key={field}>Minimum {field}<select className={inputCls} name={field} defaultValue={current !== undefined ? String(current) : ''}><option value="">Any</option>{options.map(n => <option key={n} value={n}>{n}+</option>)}</select></label>;
        })}
        {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
        <button type="submit" className="w-full flex items-center justify-center rounded-xl bg-[#157375] hover:bg-[#0f5f61] active:scale-[0.99] transition-all text-white text-[14px] font-semibold min-h-[48px] shadow-[0_8px_20px_rgba(21,115,117,0.25)]">Apply filters</button>
      </form>
      <fieldset className="space-y-1 pt-4 border-t border-[#EEF2F6]"><legend className="text-[13px] font-bold text-[#1E293B] mb-1">Amenities</legend><p className="text-[11.5px] text-[#94A3B8] pb-1">Stays must include all selected amenities.</p>
        <div className="max-h-none space-y-0.5">
          {amenities.loading ? <p role="status" className="text-sm animate-pulse text-[#64748B]">Loading amenities…</p> : amenities.error ? <div role="alert" className="text-sm text-[#64748B]">Amenities are unavailable. <button onClick={amenities.retry} className="underline text-[#157375] font-semibold">Try again</button></div> : amenities.items.length === 0 ? <p className="text-sm text-[#64748B]">No amenities to filter by yet.</p> : amenities.items.map(item => <label key={item.id} className="flex gap-2.5 items-center text-[13px] text-[#334155] py-[7px] px-2 -mx-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors"><input type="checkbox" className="w-[16px] h-[16px] rounded accent-[#157375] shrink-0" checked={filters.amenity_ids?.includes(item.id) ?? false} onChange={event => update({ amenity_ids: event.target.checked ? [...(filters.amenity_ids ?? []), item.id] : filters.amenity_ids?.filter(id => id !== item.id) })} /><span className="flex items-center gap-1.5 truncate"><Icon name="check_circle" className={`text-[17px] ${filters.amenity_ids?.includes(item.id) ? 'text-[#157375]' : 'text-[#CBD5E1]'}`} />{item.name}</span></label>)}
        </div>
      </fieldset>
    </aside>
  </>;
}
export function SortSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { filters, update } = useListing();
  return <select {...props} value={filters.sort} onChange={event => update({ sort: event.target.value as PropertySearchParams['sort'] })} className="rounded-full bg-white border border-[#E2E8F0] shadow-sm px-4 py-2 text-[13px] font-medium text-[#1E293B] outline-none focus:border-[#46B1B1] cursor-pointer"><option value="recommended">Recommended</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="newest">Newest</option></select>;
}
export function SearchResultsGrid() {
  const { filters, update, reset, retry, results, loading, error } = useListing();
  if (loading) return <div role="status" aria-label="Loading stays" className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">{[0, 1, 2, 3].map(id => <div key={id} className="bg-white rounded-[18px] overflow-hidden animate-pulse border border-[#E6EBF0]"><div className="aspect-[16/10] bg-[#EEF2F6]" /><div className="p-5 space-y-2"><div className="h-3 w-1/3 bg-[#EEF2F6] rounded" /><div className="h-4 w-2/3 bg-[#EEF2F6] rounded" /><div className="h-3 w-1/2 bg-[#EEF2F6] rounded" /></div></div>)}</div>;
  if (error) return <div role="alert" className="bg-white rounded-[18px] border border-[#E6EBF0] w-full text-center px-6 py-12 space-y-4 shadow-sm"><p className="text-[#1E293B]">{error}</p><div className="flex items-center justify-center gap-2"><button onClick={retry} className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#157375] hover:bg-[#F8FAFC]">Try again</button><button onClick={reset} className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#157375] hover:bg-[#F8FAFC] ml-2">Clear search</button></div></div>;
  const items = results?.items ?? [];
  const current = results?.page ?? 1;
  const pages = results?.total_pages ?? 0;
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  return <div id="listing-results" className="w-full min-w-0">
    {items.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{items.map(property => <PropertyCard key={property.id} property={property} search={filters}/>)}</div> : <div className="bg-white rounded-[18px] border border-[#E6EBF0] text-center py-14 px-6"><Icon name="search_off" className="text-[#157375] text-4xl" /><h2 className="text-[17px] font-bold mt-3 text-[#1E293B]">{results?.total ? 'No stays on this page' : 'No stays match your search'}</h2><p className="text-[13px] text-[#64748B] mt-2">Try another destination, different dates or fewer filters.</p><button onClick={results?.total ? () => update({ page: 1 }) : reset} className="rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white text-sm font-semibold px-6 py-3 mt-5">{results?.total ? 'Go to first page' : 'Clear search'}</button></div>}
    {results && pages > 1 && <nav aria-label="Search results pages" className="flex flex-wrap items-center justify-center gap-2 mt-8">
      <button className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#157375] hover:bg-[#F8FAFC] disabled:opacity-40" disabled={current <= 1} onClick={() => update({ page: current - 1 })}>Previous</button>
      {Array.from({ length: Math.min(5, pages) }, (_, index) => start + index).map(page => <button key={page} aria-current={page === current ? 'page' : undefined} className={`min-w-9 h-9 px-2.5 rounded-full text-[13px] font-semibold transition-all ${page === current ? 'bg-[#157375] text-white shadow-[0_6px_16px_rgba(21,115,117,0.3)]' : 'bg-white border border-[#E2E8F0] text-[#157375] hover:bg-[#F8FAFC]'}`} onClick={() => update({ page })}>{page}</button>)}
      <button className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#157375] hover:bg-[#F8FAFC] disabled:opacity-40" disabled={current >= pages} onClick={() => update({ page: current + 1 })}>Next</button>
    </nav>}
    <div className="flex items-center justify-center sm:justify-end gap-2 mt-6"><label className="flex items-center gap-2 text-[12.5px] text-[#64748B]">Stays per page<select className="border border-[#E2E8F0] rounded-[10px] px-2.5 py-2 bg-white text-[#1E293B] text-[13px] outline-none focus:border-[#46B1B1]" value={filters.page_size ?? 12} onChange={event => update({ page_size: Number(event.target.value) })}>{[...new Set([6, 12, 24, filters.page_size ?? 12])].sort((a, b) => a - b).map(size => <option key={size} value={size}>{size}</option>)}</select></label></div>
  </div>;
}
