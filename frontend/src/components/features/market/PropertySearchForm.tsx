"use client";
import { useState, type FormEvent } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { PropertySearchParams } from '@/services/properties';
import { searchValidation } from '@/lib/property-search';

export function PropertySearchForm({ values = {}, onSearch }: { values?: PropertySearchParams; onSearch: (values: PropertySearchParams) => void }) {
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: PropertySearchParams = {
      location: String(form.get('location') || '').trim() || undefined,
      check_in: String(form.get('check_in') || '') || undefined,
      check_out: String(form.get('check_out') || '') || undefined,
      guests: form.get('guests') ? Number(form.get('guests')) : undefined,
    };
    const message = searchValidation(next);
    setError(message);
    if (!message) onSearch(next);
  }
  return <form onSubmit={submit} className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_.65fr_auto] gap-3 items-end">
      <label className="search-field"><span className="flex items-center gap-1 text-xs font-semibold"><MapPin size={14}/>Destination</span><input className="w-full mt-2 outline-none bg-transparent" name="location" aria-label="Destination" placeholder="Anywhere in Lebanon" defaultValue={values.location ?? ''}/></label>
      <label className="search-field"><span className="text-xs font-semibold">Check-in</span><input className="w-full mt-2 outline-none bg-transparent" name="check_in" aria-label="Check-in" type="date" defaultValue={values.check_in ?? ''}/></label>
      <label className="search-field"><span className="text-xs font-semibold">Check-out</span><input className="w-full mt-2 outline-none bg-transparent" name="check_out" aria-label="Check-out" type="date" defaultValue={values.check_out ?? ''}/></label>
      <label className="search-field"><span className="text-xs font-semibold">Guests</span><input className="w-full mt-2 outline-none bg-transparent" name="guests" aria-label="Guests" type="number" min="1" step="1" placeholder="Any" defaultValue={values.guests ?? ''}/></label>
      <button className="search-button h-[66px]" type="submit"><Search size={18}/>Search stays</button>
    </div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </form>;
}
