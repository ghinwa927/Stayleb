"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Waves, Mountain, Castle, Trees } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { searchProperties, type PropertySearchResponse } from '@/services/properties';
import { propertySearchQuery } from '@/lib/property-search';
import { PropertySearchForm } from '@/components/features/market/PropertySearchForm';
import { PropertyCard } from './PropertyCard';
import { useAmenities } from '@/hooks/useAmenities';
import { AISearchSection } from '@/components/features/market/AISearchSection';
import { isAuthenticated } from '@/lib/authGuard';
import { useEffect as useEffectHook, useState as useStateHook } from 'react';

const destinations = [
  { location: 'Batroun', title: 'Batroun', eyebrow: 'Coast & Souks', description: 'Old souks and Mediterranean coastal walks.', image: '/images/stayleb-12.jpg', icon: Waves },
  { location: 'Faraya', title: 'Faraya & Mzaar', eyebrow: 'Slopes & Peaks', description: 'Mountain scenery and snowy winter escapes.', image: '/images/stayleb-13.jpg', icon: Mountain },
  { location: 'Jbeil', title: 'Jbeil / Byblos', eyebrow: 'Historic Port', description: 'Explore the old port and historic streets.', image: '/images/stayleb-14.jpg', icon: Castle },
  { location: 'Chouf', title: 'Chouf & Barouk', eyebrow: 'Cedar Country', description: 'Cedar forest walks and mountain villages.', image: '/images/stayleb-15.jpg', icon: Trees },
];

function HomeStays({ location }: { location?: string }) {
  const [result, setResult] = useState<PropertySearchResponse | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    searchProperties({ location, page: 1, page_size: 8, sort: 'newest' }).then(data => {
      if (active) setResult(data);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [location, attempt]);
  if (error) return <div role="alert" className="panel text-center space-y-3"><p>We couldn’t load stays right now.</p><button className="secondary-button" onClick={() => { setError(false); setResult(null); setAttempt(value => value + 1); }}>Try again</button></div>;
  if (!result) return <div role="status" aria-label="Loading stays" className="property-grid">{[0, 1, 2, 3].map(id => <div key={id} className="rounded-xl bg-white animate-pulse overflow-hidden"><div className="aspect-[4/3] bg-surface-container"/><p className="p-6 text-sm">Loading stays…</p></div>)}</div>;
  if (!result.items.length) return <div className="panel text-center py-10"><h3 className="font-semibold">No stays to show here yet</h3><p className="text-sm text-on-surface-variant mt-2">Explore another region or browse all stays.</p><Link className="primary-button mt-4" href="/search">Browse stays</Link></div>;
  return <><div className="property-grid">{result.items.map(property => <PropertyCard key={property.id} property={property}/>)}</div><div className="mt-6 text-center"><Link className="secondary-button" href={`/search?${propertySearchQuery({ location, sort: 'newest' })}`}>Explore all stays <ArrowRight size={16}/></Link></div></>;
}

export function HomeExperience({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  const [region, setRegion] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const amenities = useAmenities();
  return <>
    <section className="home-hero">
      <Image src="/images/stayleb-07.jpg" alt="Mountain chalet above the clouds in Mount Lebanon" fill priority sizes="100vw"/>
      <div className="hero-scrim"/>
      <div className="page-container hero-content">
        <div className="hero-eyebrow"><span/>LEBANESE CHALET ESCAPES <b>•</b><span className="hero-eyebrow-subtitle">From Mountain Peaks to the Coast</span></div>
        <h1>Authentic Lebanese Chalets &amp; Mountain Getaways</h1>
        <p className="hero-description">Find your next escape, from snowy Faraya peaks to sunlit Batroun shores.</p>
        <div className="search-widget">
          <div className="search-top"><h2 className="font-semibold">Find your stay</h2></div>
          <PropertySearchForm onSearch={values => router.push(`/search?${propertySearchQuery({ ...values, amenity_ids: selectedAmenities })}`)}/>
          <div className="popular-filters mt-3"><span>AMENITIES:</span>
            {amenities.loading ? <span role="status" className="animate-pulse">Loading amenities…</span> : amenities.error ? <span role="alert">Amenities unavailable. <button onClick={amenities.retry}>Try again</button></span> : !amenities.items.length ? <span>No amenities to filter by yet.</span> : amenities.items.slice(0, 8).map(item => <button key={item.id} type="button" aria-pressed={selectedAmenities.includes(item.id)} onClick={() => setSelectedAmenities(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])}>{item.name}</button>)}
          </div>
        </div>
      </div>
    </section>
    {isAuthenticated() && (
      <section className="page-container ai-search-section" aria-label="AI Search">
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 md:p-8 shadow-sm border border-primary/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Icon name="auto_awesome" className="material-symbols-outlined text-[20px] text-primary" />
                <span className="text-caption font-caption text-primary uppercase font-semibold tracking-wider">AI Search</span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-[#157375] font-semibold">Find stays with natural language</h3>
              <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                Describe your ideal stay in your own words — "chalet in Faraya with fireplace for 4 guests" — and let AI find the perfect match.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <AISearchSection />
            </div>
          </div>
        </div>
      </section>
    )}
    <section id="stays" className="page-container stays-section">
      <div className="section-heading"><div><p className="section-eyebrow"><span>EXPLORE STAYS</span></p><h2>Find Your Lebanese Getaway</h2></div><div className="region-tabs">{[['Faraya', 'Faraya'], ['Batroun', 'Batroun'], ['', 'All regions']].map(([value, label]) => <button key={value} aria-pressed={region === value} onClick={() => setRegion(value)}>{label}</button>)}</div></div>
      <HomeStays key={region} location={region || undefined}/>
    </section>
    <section id="destinations" className="page-container destinations-section">
      <p className="section-eyebrow"><span>DESTINATIONS</span></p><h2>Explore Lebanese Regions</h2><p className="section-description">From the Mediterranean coastline to mountain villages.</p>
      <div className="destination-grid">{destinations.map(({ icon: DestinationIcon, ...destination }) => <Link className="destination-card" key={destination.location} href={`/search?${propertySearchQuery({ location: destination.location })}`}><Image src={destination.image} alt={`${destination.title} landscape in Lebanon`} fill sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 25vw"/><div className="destination-scrim"/><div className="destination-copy"><span><DestinationIcon size={15}/>{destination.eyebrow}</span><h3>{destination.title}</h3><p>{destination.description}</p><strong>Explore stays <ArrowRight size={15}/></strong></div></Link>)}</div>
    </section>
  </>;
}
