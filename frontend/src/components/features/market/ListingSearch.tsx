"use client";
import { createContext, useContext, useState, useEffect, useSyncExternalStore, type ReactNode, type SelectHTMLAttributes } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { LocalImage } from '@/components/ui/LocalImage';
import { useSearchState } from '@/components/ui/Interactions';
import { requireAuth } from '@/lib/authGuard';
import { searchProperties, getPublicAmenities } from '@/services/properties';
import type { PropertySearchResponse } from '@/services/properties';
import type { PropertyResponse } from '@/services/owner';

type Filters = { maxPrice: number; guests: number; amenities: number[]; sort: string; location: string; check_in: string; check_out: string; page: number; bedrooms?: number; bathrooms?: number; beds?: number };
const defaults: Filters = { maxPrice: 600, guests: 1, amenities: [], sort: 'recommended', location: '', check_in: '', check_out: '', page: 1 };
type ListingState = { filters: Filters; update: (patch: Partial<Filters>) => void; results: PropertySearchResponse | null; loading: boolean; error: string | null };
const ListingContext = createContext<ListingState>({ filters: defaults, update: () => {}, results: null, loading: false, error: null });
export function ListingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => {
    const sp = searchParams;
    return {
      maxPrice: Number(sp.get('max_price') || 600),
      guests: Number(sp.get('guests') || 1),
      amenities: sp.getAll('amenity_ids').map(Number).filter(Boolean),
      sort: sp.get('sort') || 'recommended',
      location: sp.get('location') || '',
      check_in: sp.get('check_in') || '',
      check_out: sp.get('check_out') || '',
      page: Number(sp.get('page') || 1),
      bedrooms: sp.get('bedrooms') ? Number(sp.get('bedrooms')) : undefined,
      bathrooms: sp.get('bathrooms') ? Number(sp.get('bathrooms')) : undefined,
      beds: sp.get('beds') ? Number(sp.get('beds')) : undefined,
    };
  });
  const [results, setResults] = useState<PropertySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<Filters>) => {
    const prev = filters;
    const next: Filters = { ...prev, ...patch };
    if (patch.page === undefined && (patch.maxPrice !== undefined || patch.guests !== undefined || patch.amenities !== undefined || patch.sort !== undefined || patch.location !== undefined || patch.check_in !== undefined || patch.check_out !== undefined || patch.bedrooms !== undefined || patch.bathrooms !== undefined || patch.beds !== undefined)) {
      next.page = 1;
    }
    const qs = new URLSearchParams();
    if (next.location) qs.set('location', next.location);
    if (next.check_in) qs.set('check_in', next.check_in);
    if (next.check_out) qs.set('check_out', next.check_out);
    if (next.guests && next.guests !== 1) qs.set('guests', String(next.guests));
    if (next.maxPrice !== 600) qs.set('max_price', String(next.maxPrice));
    if (next.sort !== 'recommended') qs.set('sort', next.sort);
    if (next.page !== 1) qs.set('page', String(next.page));
    next.amenities.forEach(id => qs.append('amenity_ids', String(id)));
    if (next.bedrooms) qs.set('bedrooms', String(next.bedrooms));
    if (next.bathrooms) qs.set('bathrooms', String(next.bathrooms));
    if (next.beds) qs.set('beds', String(next.beds));
    const basePath = pathname || '/search';
    const url = qs.toString() ? `${basePath}?${qs.toString()}` : basePath;
    const current = `${pathname}?${searchParams.toString()}`;
    const target = url;
    if (current !== target) {
      router.push(url, { scroll: false });
    }
    setFilters(next);
  };

  // Sync from URL on mount / param change (back/forward)
  useEffect(() => {
    const sp = searchParams;
    setFilters(prev => ({
      ...prev,
      location: sp.get('location') || '',
      check_in: sp.get('check_in') || '',
      check_out: sp.get('check_out') || '',
      guests: Number(sp.get('guests') || prev.guests || 1),
      maxPrice: Number(sp.get('max_price') || prev.maxPrice || 600),
      sort: sp.get('sort') || prev.sort,
      page: Number(sp.get('page') || 1),
      amenities: sp.getAll('amenity_ids').map(Number).filter(Boolean),
    }));
  }, [searchParams]);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true); setError(null);
      try {
        const params: Record<string, unknown> = {
          page: filters.page,
          page_size: 12,
          sort: filters.sort as "recommended" | "price_low" | "price_high" | "newest",
          guests: filters.guests > 1 ? filters.guests : undefined,
          max_price: filters.maxPrice < 600 ? filters.maxPrice : undefined,
          location: filters.location || undefined,
          check_in: filters.check_in || undefined,
          check_out: filters.check_out || undefined,
          amenity_ids: filters.amenities.length ? filters.amenities : undefined,
        };
        // map sort values
        if (filters.sort === 'price-low') params.sort = 'price_low';
        if (filters.sort === 'price-high') params.sort = 'price_high';
        if (filters.sort === 'rating') params.sort = 'recommended';
        const res = await searchProperties(params as never);
        if (!cancelled) setResults(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally { if (!cancelled) setLoading(false); }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [filters.location, filters.check_in, filters.check_out, filters.guests, filters.maxPrice, filters.amenities, filters.sort, filters.page, filters.bedrooms, filters.bathrooms, filters.beds]);

  return <ListingContext.Provider value={{ filters, update, results, loading, error }}>{children}</ListingContext.Provider>;
}

const subscribe = (callback: () => void) => {
  window.addEventListener('stayleb-favorites', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('stayleb-favorites', callback);
    window.removeEventListener('storage', callback);
  };
};
const readFavorites = () => localStorage.getItem('stayleb-saved-property-ids') || '["batroun-sunset","cedar-peak","azure-horizon"]';
const serverFavorites = () => '["batroun-sunset","cedar-peak","azure-horizon"]';

export function FavoriteButton({ id }: { id: string }) {
  const saved = JSON.parse(useSyncExternalStore(subscribe, readFavorites, serverFavorites)) as string[];
  const active = saved.includes(id);
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={active}
      onClick={() => {
        if (!requireAuth({ nextPath: pathname || '/account/favorites', action: 'favorites', router })) return;
        localStorage.setItem('stayleb-saved-property-ids', JSON.stringify(active ? saved.filter((v) => v !== id) : [...saved, id]));
        window.dispatchEvent(new Event('stayleb-favorites'));
      }}
      className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-90 ${
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

export function PropertyCard({ property }: { property: PropertyResponse & { stay_pricing?: { average_price_per_night: string } | null } }) {
  const primary = property.images?.find(i => i.is_primary)?.image_url || property.images?.[0]?.image_url || '/images/e8899428208cea05.jpg';
  const price = property.stay_pricing ? Number(property.stay_pricing.average_price_per_night) : Number(property.price_per_night);
  return (
    <article className="group bg-white rounded-[22px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_36px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1 flex flex-col">
      <div className="aspect-[4/3] relative overflow-hidden bg-surface-container">
        <Link href={`/properties/${property.id}`} className="block w-full h-full">
          <LocalImage
            src={primary}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"
          />
        </Link>
        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 backdrop-blur-md px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-on-surface shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Instant Book
          </span>
        </div>
        <div className="absolute top-3.5 right-3.5">
          <FavoriteButton id={String(property.id)} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 via-black/0 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-on-surface-variant/70 truncate">{property.location}</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-on-surface shrink-0">
            <Icon name="star" className="text-[14px] text-amber-500" />
            4.9
          </span>
        </div>

        <Link href={`/properties/${property.id}`} className="mt-1 block">
          <h3 className="text-[17px] font-semibold leading-6 tracking-tight text-on-surface group-hover:text-primary transition-colors line-clamp-1">{property.title}</h3>
        </Link>
        <p className="text-[13px] text-on-surface-variant mt-1 line-clamp-1">
          {property.max_guests} guests · {property.bedrooms} beds · {property.bathrooms} baths
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {property.amenities?.slice(0, 2).map((a: {id:number; name:string}) => (
            <span key={a.id} className="inline-flex items-center rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
              {a.name}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-surface-container-low flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-bold tracking-tight text-on-surface">${price}</span>
              <span className="text-[13px] text-on-surface-variant">/ night</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">{property.min_nights} nt min · {property.beds} beds</span>
          </div>
          <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
            <Icon name="arrow_outward" className="text-[16px]" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function SearchFilters() {
  const { filters, update } = useContext(ListingContext);
  const { setQuery } = useSearchState();
  const [amenitiesList, setAmenitiesList] = useState<{id:number; name:string}[]>([]);
  useEffect(()=>{ getPublicAmenities().then(setAmenitiesList).catch(()=>{}); },[]);
  const percent = ((filters.maxPrice - 100) / 500) * 100;

  return (
    <aside className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-[104px] h-fit space-y-4">
      <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(17,28,45,0.06)] border border-surface-container-low">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight">Filters</h2>
          <button
            onClick={() => {
              update({ maxPrice: 600, guests: 1, amenities: [], sort: 'recommended', location: '', check_in:'', check_out:'', page:1 });
              setQuery('');
            }}
            className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold tracking-[0.06em] uppercase text-on-surface-variant">Price per night</p>
            <span className="rounded-full bg-primary-container/15 text-primary px-2.5 py-1 text-[12px] font-semibold">Up to ${filters.maxPrice}</span>
          </div>
          <div className="relative mt-4">
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full rounded-full bg-surface-container-low overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
            </div>
            <input
              aria-label="Maximum nightly price"
              type="range"
              min={100}
              max={600}
              step={25}
              value={filters.maxPrice}
              onChange={(e) => update({ maxPrice: Number(e.target.value) })}
              className="relative w-full h-1.5 appearance-none bg-transparent accent-primary cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-primary"
            />
          </div>
          <div className="flex justify-between text-[11px] text-on-surface-variant mt-2">
            <span>$100</span>
            <span>$600</span>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between rounded-2xl bg-surface-container-lowest border border-surface-container-low px-4 py-3.5">
          <div>
            <p className="text-[13px] font-semibold">Guests</p>
            <p className="text-[11px] text-on-surface-variant">How many travelers?</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              aria-label="Fewer guests"
              onClick={() => update({ guests: Math.max(1, filters.guests - 1) })}
              className="w-8 h-8 rounded-full bg-white border border-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors shadow-sm active:scale-95"
            >
              −
            </button>
            <span className="w-6 text-center text-[15px] font-semibold tabular-nums">{filters.guests}</span>
            <button
              aria-label="More guests"
              onClick={() => update({ guests: Math.min(10, filters.guests + 1) })}
              className="w-8 h-8 rounded-full bg-on-surface text-white flex items-center justify-center hover:bg-on-surface/90 transition-colors shadow-sm active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <fieldset className="mt-7">
          <legend className="text-[12px] font-semibold tracking-[0.06em] uppercase text-on-surface-variant mb-3">Amenities</legend>
          <div className="space-y-2.5">
            {amenitiesList.slice(0,5).map((opt) => {
              const active = filters.amenities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update({ amenities: active ? filters.amenities.filter((i: number) => i !== opt.id) : [...filters.amenities, opt.id] })}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left border transition-all ${
                    active ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-white/20' : 'bg-white'}`}>
                    <Icon name="castle" className={`text-[18px] ${active ? 'text-white' : 'text-on-surface-variant'}`} />
                  </span>
                  <span className={`text-[13px] font-medium ${active ? 'text-white' : 'text-on-surface'}`}>{opt.name}</span>
                  <span className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${active ? 'bg-white border-white' : 'border-outline-variant bg-white'}`}>
                    {active && <Icon name="check" className="text-[14px] text-primary" />}
                  </span>
                </button>
              );
            })}
            {!amenitiesList.length && <p className="text-xs text-slate-500">Loading amenities…</p>}
          </div>
        </fieldset>

        <button
          className="w-full mt-7 rounded-full bg-surface-container-low text-on-surface text-[13px] font-semibold py-3 hover:bg-surface-container transition-colors"
          onClick={() => {
            const el = document.getElementById('listing-results');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Show results
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-2.5 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3.5">
        <Icon name="verified_user" className="text-primary text-[18px]" />
        <p className="text-[12px] leading-4 text-on-surface-variant">
          <span className="font-semibold text-on-surface">StayLeb Guarantee</span> · Verified hosts & 24/7 power
        </p>
      </div>
    </aside>
  );
}

export function SortSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { filters, update } = useContext(ListingContext);
  return (
    <div className="relative">
      <select
        {...props}
        value={filters.sort}
        onChange={(e) => update({ sort: e.target.value })}
        className={`appearance-none rounded-full bg-white border border-surface-container pl-3 pr-8 py-2 text-[13px] font-medium text-on-surface shadow-sm hover:border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${props.className ?? ''}`}
      >
        <option value="recommended">Recommended</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
      <Icon name="expand_more" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
    </div>
  );
}

export function SearchResultsGrid() {
  const { filters, update, results, loading, error } = useContext(ListingContext);
  const { query } = useSearchState();
  const items = results?.items ?? [];
  const visible = query ? items.filter(p=> [p.title, p.location, ...p.amenities.map(a=>a.name)].join(' ').toLowerCase().includes(query.toLowerCase())) : items;
  return (
    <div id="listing-results" className="w-full">
      <div className="flex items-center gap-2 text-[13px] text-on-surface-variant mb-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-white border border-surface-container-low px-3 py-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {loading ? 'Loading…' : `${results?.total ?? 0} ${results?.total === 1 ? 'stay' : 'stays'} found`}
        </span>
        {filters.amenities.length > 0 && <span className="hidden sm:inline text-on-surface-variant/60">· {filters.amenities.length} filter applied</span>}
        {error && <span className="text-red-600 ml-2">{error}</span>}
      </div>
      {loading ? (
        <div className="grid place-items-center py-16 bg-white rounded-[20px] border"><span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /><p className="text-sm text-slate-500 mt-3">Loading properties…</p></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        {visible.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      )}
      {!loading && !visible.length && (
        <div className="mt-6 bg-white rounded-[20px] border border-surface-container-low p-10 md:p-14 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto text-primary">
            <Icon name="search_off" className="text-[28px]" />
          </div>
          <h2 className="font-semibold text-[18px] mt-4 tracking-tight">No stays match these filters</h2>
          <p className="text-[13px] text-on-surface-variant my-2 max-w-md mx-auto">Try a broader location, higher budget, or fewer amenities — coastal gems are waiting.</p>
          <button
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-on-primary px-5 py-2.5 text-[13px] font-semibold hover:bg-primary/90 transition-colors"
            onClick={() => {
              update({ maxPrice: 600, guests: 1, amenities: [], sort: 'recommended', location:'', check_in:'', check_out:'', page:1 });
            }}
          >
            <Icon name="restart_alt" className="text-[16px]" /> Clear all filters
          </button>
        </div>
      )}
      {results && results.total_pages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white border border-surface-container-low px-4 py-3 shadow-sm">
          <span className="text-[13px] text-on-surface-variant">Showing <strong className="text-on-surface font-semibold">{(results.page-1)*results.page_size+1} – {Math.min(results.page*results.page_size, results.total)}</strong> of <strong className="text-on-surface font-semibold">{results.total}</strong></span>
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container-low">
            <button disabled={results.page<=1} onClick={()=>update({page: Math.max(1, (results.page-1))})} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:bg-white shadow-sm disabled:opacity-40"><Icon name="chevron_left" className="text-[18px]" /></button>
            {Array.from({length: Math.min(results.total_pages,5)}, (_,i) => {
              const n = i+1; const active = n===results.page;
              return <button key={n} onClick={()=>update({page:n})} className={`w-9 h-9 rounded-full text-[13px] font-semibold shadow-sm ${active?'bg-on-surface text-white':'bg-white text-on-surface hover:bg-surface-container-low'}`}>{n}</button>;
            })}
            <button disabled={results.page>=results.total_pages} onClick={()=>update({page: Math.min(results.total_pages, results.page+1)})} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-on-surface hover:bg-white shadow-sm disabled:opacity-40"><Icon name="chevron_right" className="text-[18px]" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FavoritesGrid() {
  // Keep for account favorites (still local)
  const ids = JSON.parse(useSyncExternalStore(subscribe, readFavorites, serverFavorites)) as string[];
  // This still uses mock for favorites - not fully implemented per spec (backend not complete)
  return (
    <div>
      <div className="bg-white rounded-[20px] border border-surface-container-low text-center py-16 px-6 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto text-primary">
          <Icon name="favorite_border" className="text-[26px]" />
        </div>
        <h2 className="text-[18px] font-semibold mt-4">Favorites sync coming soon</h2>
        <p className="text-on-surface-variant mt-2 mb-5 text-sm">Favorites backend is not complete. Please log in to save stays once backend is ready.</p>
        <Link href="/search" className="inline-flex rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold">
          Discover Properties
        </Link>
      </div>
    </div>
  );
}
