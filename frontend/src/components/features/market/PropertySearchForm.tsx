"use client";
import { useState, type FormEvent } from 'react';
import { Search, MapPin, CalendarDays, Users, ArrowRight } from 'lucide-react';
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
  return <form onSubmit={submit} className="w-full">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_auto] gap-2.5 lg:gap-3 items-stretch">
      <label className="flex items-center gap-3 rounded-xl bg-[#F1F5F9]/80 hover:bg-[#E7EEFF]/70 transition-colors px-4 py-3 min-h-[68px] text-left cursor-text">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-white shadow-sm shrink-0"><MapPin size={17} className="text-[#157375]" /></span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-[#1E293B] leading-tight">Destination</span>
          <input className="w-full bg-transparent outline-none text-[13px] text-[#64748B] placeholder:text-[#94A3B8] p-0 border-0 focus:ring-0" name="location" aria-label="Destination" placeholder="Anywhere in Lebanon" defaultValue={values.location ?? ''} />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl bg-[#F1F5F9]/80 hover:bg-[#E7EEFF]/70 transition-colors px-4 py-3 min-h-[68px] text-left cursor-pointer">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-white shadow-sm shrink-0"><CalendarDays size={17} className="text-[#157375]" /></span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-[#1E293B] leading-tight">Check-in</span>
          <input className="w-full bg-transparent outline-none text-[13px] text-[#64748B] p-0 border-0 focus:ring-0" name="check_in" aria-label="Check-in" type="date" defaultValue={values.check_in ?? ''} />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl bg-[#F1F5F9]/80 hover:bg-[#E7EEFF]/70 transition-colors px-4 py-3 min-h-[68px] text-left cursor-pointer">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-white shadow-sm shrink-0"><CalendarDays size={17} className="text-[#157375]" /></span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-[#1E293B] leading-tight">Check-out</span>
          <input className="w-full bg-transparent outline-none text-[13px] text-[#64748B] p-0 border-0 focus:ring-0" name="check_out" aria-label="Check-out" type="date" defaultValue={values.check_out ?? ''} />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl bg-[#F1F5F9]/80 hover:bg-[#E7EEFF]/70 transition-colors px-4 py-3 min-h-[68px] text-left cursor-pointer">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-white shadow-sm shrink-0"><Users size={17} className="text-[#157375]" /></span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-[#1E293B] leading-tight">Guests</span>
          <input className="w-full bg-transparent outline-none text-[13px] text-[#64748B] placeholder:text-[#94A3B8] p-0 border-0 focus:ring-0" name="guests" aria-label="Guests" type="number" min="1" step="1" placeholder="Any" defaultValue={values.guests ?? ''} />
        </span>
      </label>
      <button className="flex items-center justify-center gap-2 rounded-xl bg-[#157375] hover:bg-[#0f5f61] active:scale-[0.98] transition-all text-white text-[14px] font-semibold px-6 min-h-[68px] shadow-[0_8px_20px_rgba(21,115,117,0.28)] whitespace-nowrap" type="submit"><Search size={18} strokeWidth={2.4} />Search stays<ArrowRight size={16} className="opacity-80" /></button>
    </div>
    {error && <p role="alert" className="text-sm text-red-700 mt-3">{error}</p>}
  </form>;
}
