"use client";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode, type SelectHTMLAttributes, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { LocalImage } from '@/components/ui/LocalImage';
import { requireAuth } from '@/lib/authGuard';
import { searchProperties, type PropertySearchParams, type PropertySearchResponse } from '@/services/properties';
import { propertySearchQuery, readPropertySearch, searchValidation, propertyDetailsHref } from '@/lib/property-search';
import { useAmenities } from '@/hooks/useAmenities';
import { PropertySearchForm } from './PropertySearchForm';
import { getFavorites, addFavorite, removeFavorite, type FavoriteListResponse } from '@/services/favorites';
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
  const [results, setResults] = useState<PropertySearchResponse | null>(null);
  const [error, setError] = useState<string | null>(validation);
  const [loading, setLoading] = useState(!validation);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (validation) return;
    let active = true;
    searchProperties(filters).then(data => {
      if (active) { setResults(data); setLoading(false); }
    }).catch(() => {
      if (active) { setError('We couldn’t load stays. Please try again.'); setLoading(false); }
    });
    return () => { active = false; };
  }, [filters, validation, attempt]);
  function update(patch: PropertySearchParams) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    router.push(`${pathname}?${propertySearchQuery(next)}`, { scroll: false });
  }
  const retry = () => { if (!validation) { setError(null); setLoading(true); setAttempt(value => value + 1); } };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFavorites();
      const favSet = new Set(response.items.map(item => item.property.id));
      setFavorites(favSet);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

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
    <FavoritesContext.Provider value={{ favorites, loading, error, refreshFavorites: loadFavorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function SearchHeader() {
  const { filters, update } = useListing();
  return <section className="bg-white rounded-[22px] shadow-sm border border-surface-container-low p-4 sm:p-6">
    <PropertySearchForm values={filters} onSearch={update}/>
  </section>;
}
export function SearchTitle() {
  const { filters } = useListing();
  return <h1 className="text-[26px] md:text-[32px] font-bold tracking-tight text-on-surface">{filters.location ? `Stays in ${filters.location}` : 'Stays across Lebanon'}</h1>;
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
        active ? 'bg-white text-rose-500' : 'bg-white/90 text-slate-600 hover:bg-white hover:text-rose-400'
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
  return <article className="group bg-white rounded-[22px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-lg border border-white transition-all flex flex-col">
    <div className="aspect-[4/3] relative bg-surface-container">
      <Link href={href} className="block w-full h-full" aria-label={`View ${property.title}`}>
        {image ? <LocalImage src={image} alt={property.title} className="w-full h-full object-cover"/> : <div className="h-full grid place-items-center text-sm text-on-surface-variant">Photo unavailable</div>}
      </Link>
      {showFavorite && <div className="absolute top-3 right-3"><FavoriteButton id={String(property.id)}/></div>}
    </div>
    <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
      <p className="text-xs uppercase tracking-wide text-on-surface-variant">{property.location}</p>
      <Link href={href} className="text-[17px] font-semibold text-on-surface group-hover:text-primary">{property.title}</Link>
      <p className="text-xs text-primary">{property.property_type === 'chalet' ? 'Chalet' : 'Furnished house'}</p>
      <p className="text-sm text-on-surface-variant">{property.max_guests} guests · {property.bedrooms} bedrooms · {property.beds} beds · {property.bathrooms} baths</p>
      <div className="flex flex-wrap gap-1.5 mt-1">{property.amenities.slice(0, 3).map(item => <span key={item.id} className="rounded-full bg-surface-container-low px-2 py-1 text-xs">{item.name}</span>)}</div>
      <div className="mt-auto pt-4 border-t border-surface-container-low">
        <strong className="text-lg">{money(pricing?.average_price_per_night ?? property.price_per_night)}</strong><span className="text-sm text-on-surface-variant"> / {pricing ? 'night on average' : 'night'}</span>
        {pricing && <p className="text-sm mt-1">{money(pricing.total_price)} for {pricing.number_of_nights} nights</p>}
        <p className="text-xs mt-1 text-on-surface-variant">{property.min_nights}-night minimum</p>
      </div>
    </div>
  </article>;
}

export function SearchFilters() {
  const { filters, update, reset } = useListing();
  const amenities = useAmenities();
  const [message, setMessage] = useState<string | null>(null);
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
  return <aside className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-24 h-fit bg-white rounded-[20px] p-6 shadow-sm border border-surface-container-low space-y-5">
    <div className="flex items-center justify-between"><h2 className="font-semibold">Filters</h2><button onClick={reset} className="text-sm text-primary underline">Clear all</button></div>
    <form onSubmit={apply} className="space-y-4">
      <fieldset><legend className="text-sm font-semibold mb-2">Nightly price (USD)</legend><div className="grid grid-cols-2 gap-3">
        <label className="field text-xs">Minimum<input name="min_price" type="number" min="0" step="0.01" placeholder="Any" defaultValue={filters.min_price ?? ''}/></label>
        <label className="field text-xs">Maximum<input name="max_price" type="number" min="0" step="0.01" placeholder="Any" defaultValue={filters.max_price ?? ''}/></label>
      </div><p className="text-xs text-on-surface-variant mt-2">For dated stays, each night must fit this range.</p></fieldset>
      <label className="field text-sm">Property type<select name="property_type" defaultValue={filters.property_type ?? ''}><option value="">All types</option><option value="chalet">Chalet</option><option value="furnished_house">Furnished house</option></select></label>
      {(['bedrooms', 'beds', 'bathrooms'] as const).map(field => <label className="field text-sm capitalize" key={field}>Minimum {field}<input name={field} type="number" min={field === 'bedrooms' ? 0 : 1} step="1" placeholder="Any" defaultValue={filters[field] ?? ''}/></label>)}
      {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
      <button type="submit" className="primary-button w-full">Apply filters</button>
    </form>
    <fieldset className="space-y-2"><legend className="text-sm font-semibold mb-2">Amenities</legend><p className="text-xs text-on-surface-variant">Stays must include all selected amenities.</p>
      {amenities.loading ? <p role="status" className="text-sm animate-pulse">Loading amenities…</p> : amenities.error ? <div role="alert" className="text-sm">Amenities are unavailable. <button onClick={amenities.retry} className="underline text-primary">Try again</button></div> : amenities.items.length === 0 ? <p className="text-sm">No amenities to filter by yet.</p> : amenities.items.map(item => <label key={item.id} className="flex gap-2 items-center text-sm py-1"><input type="checkbox" checked={filters.amenity_ids?.includes(item.id) ?? false} onChange={event => update({ amenity_ids: event.target.checked ? [...(filters.amenity_ids ?? []), item.id] : filters.amenity_ids?.filter(id => id !== item.id) })}/>{item.name}</label>)}
    </fieldset>
  </aside>;
}
export function SortSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { filters, update } = useListing();
  return <select {...props} value={filters.sort} onChange={event => update({ sort: event.target.value as PropertySearchParams['sort'] })} className="rounded-full bg-white border px-3 py-2 text-sm"><option value="recommended">Recommended</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="newest">Newest</option></select>;
}
export function SearchResultsGrid() {
  const { filters, update, reset, retry, results, loading, error } = useListing();
  if (loading) return <div role="status" aria-label="Loading stays" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">{[0, 1, 2].map(id => <div key={id} className="bg-white rounded-[22px] overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-surface-container"/><div className="p-5 h-36">Loading stays…</div></div>)}</div>;
  if (error) return <div role="alert" className="panel w-full text-center space-y-4"><p>{error}</p><button onClick={retry} className="secondary-button">Try again</button><button onClick={reset} className="secondary-button ml-2">Clear search</button></div>;
  const items = results?.items ?? [];
  const current = results?.page ?? 1;
  const pages = results?.total_pages ?? 0;
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  return <div id="listing-results" className="w-full space-y-5">
    <p role="status" className="text-sm text-on-surface-variant">{results?.total ?? 0} {(results?.total ?? 0) === 1 ? 'stay' : 'stays'} found</p>
    {items.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{items.map(property => <PropertyCard key={property.id} property={property} search={filters}/>)}</div> : <div className="panel text-center py-12"><Icon name="search_off" className="text-primary text-3xl"/><h2 className="text-lg font-semibold mt-3">{results?.total ? 'No stays on this page' : 'No stays match your search'}</h2><p className="text-sm text-on-surface-variant mt-2">Try another destination, different dates or fewer filters.</p><button onClick={results?.total ? () => update({ page: 1 }) : reset} className="primary-button mt-5">{results?.total ? 'Go to first page' : 'Clear search'}</button></div>}
    {results && pages > 1 && <nav aria-label="Search results pages" className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border">
      <span className="text-sm">Page {current} of {pages}</span><div className="flex gap-2"><button className="secondary-button" disabled={current <= 1} onClick={() => update({ page: current - 1 })}>Previous</button>{Array.from({ length: Math.min(5, pages) }, (_, index) => start + index).map(page => <button key={page} aria-current={page === current ? 'page' : undefined} className={`w-9 rounded-full ${page === current ? 'bg-primary text-white' : 'bg-surface-container-low'}`} onClick={() => update({ page })}>{page}</button>)}<button className="secondary-button" disabled={current >= pages} onClick={() => update({ page: current + 1 })}>Next</button></div>
    </nav>}
    <label className="flex items-center gap-2 text-sm">Stays per page<select className="border rounded-lg p-2 bg-white" value={filters.page_size ?? 12} onChange={event => update({ page_size: Number(event.target.value) })}>{[...new Set([12, 24, 48, filters.page_size ?? 12])].sort((a, b) => a - b).map(size => <option key={size} value={size}>{size}</option>)}</select></label>
  </div>;
}
