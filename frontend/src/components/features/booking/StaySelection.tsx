"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BookingProgress, PropertyIdentity, BackToPropertyButton } from './BookingSummary';
import { Icon } from '@/components/ui/Icon';
import { getPublicProperty, getAvailability } from '@/services/properties';
import type { PropertyResponse } from '@/services/owner';
import Swal from 'sweetalert2';
import { isAuthenticated } from '@/lib/authGuard';
import { useBooking } from './BookingContext';

export function StaySelection() {
  const params = useParams() as {id?:string};
  const propertyId = params.id;
  const router = useRouter();
  const { draft, setDraft } = useBooking();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [availability, setAvailability] = useState<import('@/services/properties').AvailabilityResponse | null>(null);

  useEffect(()=>{
    if (!propertyId) return;
    getPublicProperty(propertyId).then(p=>{ setProperty(p); setAdults(prev=> Math.min(prev || 2, p.max_guests)); }).catch(()=>{}).finally(()=>setLoading(false));
    getAvailability(propertyId).then(setAvailability).catch(()=>{});
  },[propertyId]);

  // Hydrate from draft if exists for same property
  useEffect(()=>{
    if(draft && propertyId && draft.propertyId === propertyId){
      setCheckIn(draft.checkIn);
      setCheckOut(draft.checkOut);
      // split guests into adults/children heuristic: keep adults at least 1, remainder as adults
      // We store total guests; restore as adults = min(guests, max or 2), children = remainder
      // Simple: adults = draft.guests, children 0 (preserve total)
      setAdults(draft.guests);
      setChildren(0);
    }
  },[draft, propertyId]);

  const totalGuests = adults + children;
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.round((Date.parse(checkOut) - Date.parse(checkIn))/86400000) : 0;
  const valid = property ? nights >= property.min_nights && totalGuests <= property.max_guests && totalGuests>=1 && checkIn && checkOut && checkOut>checkIn : false;

  const handleContinue = async () => {
    if (!isAuthenticated()) { Swal.fire({title:'Please log in to continue with your booking.', icon:'info', showCancelButton:true, confirmButtonText:'Go to Login'}).then(r=>{ if(r.isConfirmed) router.push(`/auth/login?next=${encodeURIComponent(`/market/book/${propertyId}`)}`); }); return; }
    if (!property) return;
    if (!valid) { Swal.fire({title:'Validation', text:'Check dates and guests meet requirements', icon:'warning'}); return; }
    // Store draft only - DO NOT create booking yet
    setDraft({ propertyId: String(propertyId), checkIn, checkOut, guests: totalGuests });
    router.push(`/market/book/${propertyId}/summary`);
  };

  if (loading) return <main className="booking-main"><div className="p-10 text-center">Loading property…</div></main>;
  if (!property) return <main className="booking-main"><div className="p-10 text-center">Property not found</div></main>;

  return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={1}/><div className="booking-grid"><div className="space-y-5"><div className="panel"><PropertyIdentity property={property} /></div><section className="panel"><h1 className="font-semibold flex items-center gap-2"><Icon name="calendar_month" className="text-primary" />Stay Dates</h1><div className="grid sm:grid-cols-2 gap-4 mt-5"><label className="field">Check-in<input aria-label="Check-in" type="date" value={checkIn} min={new Date().toISOString().slice(0,10)} onChange={e=>setCheckIn(e.target.value)}/><span className="text-xs text-slate-500">From 15:00 onwards</span></label><label className="field">Check-out<input aria-label="Check-out" type="date" min={checkIn || new Date().toISOString().slice(0,10)} value={checkOut} onChange={e=>setCheckOut(e.target.value)}/><span className="text-xs text-slate-500">Strictly before 11:00 AM</span></label></div><div className="mt-5 rounded-lg bg-surface-container-low p-4 text-sm">{nights ? `${nights} nights selected` : 'Select dates'} · Min {property.min_nights} nights · Max {property.max_guests} guests</div></section><section className="panel"><h2 className="font-semibold flex items-center gap-2"><Icon name="group" className="text-primary"/>Guests<span className="ml-auto text-xs font-normal">Total: {totalGuests} · Max {property.max_guests}</span></h2>{(['adults','children'] as const).map(key=>{
    const val = key==='adults'? adults: children;
    const set = key==='adults'? setAdults: setChildren;
    return <div key={key} className="flex justify-between items-center mt-6"><div><strong className="capitalize text-sm">{key}</strong><p className="text-xs text-slate-500">{key==='adults'?'Age 13 or above':'Ages 2–12, with guardian'}</p></div><div className="flex items-center gap-3"><button className="w-8 h-8 bg-surface-container rounded-full" disabled={val<=(key==='adults'?1:0)} onClick={()=>set(val-1)}>−</button><span>{val}</span><button className="w-8 h-8 bg-surface-container rounded-full" disabled={totalGuests>=property.max_guests} onClick={()=>set(val+1)}>+</button></div></div>;
  })}</section><div className={`panel text-sm ${valid?'text-primary':'text-error'}`} role="status"><Icon name={valid?'verified_user':'error'} className="align-middle mr-2" />{valid?'Minimum nights and guest capacity requirements met.':'Choose valid dates and guests.'}</div><button disabled={!valid} onClick={handleContinue} className={`primary-button w-full ${!valid?'opacity-50':''}`}>Continue to Price Summary <Icon name="arrow_forward" /></button><p className="text-xs text-center text-slate-500">You won’t be charged until payment step. Backend is final authority.</p></div><div className="panel"><PropertyIdentity hero property={property} /><div className="p-4 mt-4 bg-surface-container-low rounded-lg text-sm">Selected: {checkIn || '—'} → {checkOut || '—'} · {nights || 0} nights · {totalGuests} guests<br/>Availability: {availability ? `${availability.blocked_dates.length} blocked, ${availability.booked_dates.length} booked` : 'Loading...'}</div></div></div></main>;
}
