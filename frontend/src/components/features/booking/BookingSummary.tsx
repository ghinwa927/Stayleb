"use client";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { useBooking,money } from './BookingContext';
import { Icon } from '@/components/ui/Icon';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPublicProperty } from '@/services/properties';
import type { PropertyResponse } from '@/services/owner';
import type { BookingResponse } from '@/services/bookings';

export function PropertyIdentity({hero=false, property, booking}:{hero?:boolean; property?: PropertyResponse | null; booking?: BookingResponse | null}) {
  const params = useParams() as {id?:string};
  
  const bookingCtx = useBooking();
  const b = booking ?? bookingCtx.booking;
  const [prop, setProp] = useState<PropertyResponse | null>(property ?? null);
  useEffect(()=>{
    if (prop) return;
    let pid: string | null = null;
    if (b) pid = String(b.property_id);
    else if (params.id) pid = params.id;
    if (!pid) return;
    // if property already passed skip
    if (property) return;
    getPublicProperty(pid).then(setProp).catch(()=>{});
  },[params.id, b, prop, property]);
  const displayProp = property ?? prop;
  if (!displayProp) return <div className="flex gap-3 items-center"><div className="w-24 h-20 bg-surface-container rounded-lg animate-pulse"/><div><p className="text-xs text-slate-500">Loading property…</p></div></div>;
  const img = displayProp.images?.find(i=>i.is_primary)?.image_url || displayProp.images?.[0]?.image_url || '/images/e8899428208cea05.jpg';
  return <div className={hero?'':'flex gap-4 items-center'}><LocalImage src={img} alt={displayProp.title} className={hero?'w-full h-48 object-cover rounded-xl mb-4':'w-24 h-20 object-cover rounded-lg'} /><div><span className="text-[10px] uppercase tracking-wider text-primary font-bold">Verified Superhost</span><h2 className="font-semibold mt-1">{displayProp.title}</h2><p className="text-xs text-on-surface-variant mt-1">⌖ {displayProp.location}</p><span className="text-xs text-primary">★ 4.9 · Verified</span></div></div>;
}
export function BookingSummary({preview, draft, property: passedProp}:{preview?: import('@/services/bookings').BookingPreviewResponse | null; draft?: import('./BookingContext').BookingDraft | null; property?: PropertyResponse | null}={}) {
  const {booking, nights, lodging, total, draft: ctxDraft} = useBooking();
  const params = useParams() as {id?:string};
  const [prop, setProp] = useState<PropertyResponse|null>(passedProp ?? null);
  const effectiveDraft = draft ?? ctxDraft;
  const isBookingStale = !!(booking && effectiveDraft && (booking.check_in !== effectiveDraft.checkIn || booking.check_out !== effectiveDraft.checkOut || booking.guests !== effectiveDraft.guests));
  useEffect(()=>{
    if(passedProp) return;
    // Prioritize draft/preview over stale booking
    const pid = (effectiveDraft ? effectiveDraft.propertyId : null) ?? (booking && !isBookingStale ? String(booking.property_id) : null) ?? params.id;
    if (!pid) return;
    getPublicProperty(pid).then(setProp).catch(()=>{});
  },[booking, effectiveDraft, isBookingStale, params.id, passedProp]);
  const displayProp = passedProp ?? prop;
  if (booking && !isBookingStale) {
    return <aside className="space-y-4"><div className="panel"><PropertyIdentity hero property={displayProp} booking={booking} /><div className="bg-surface-container-low rounded-lg p-4 mt-5 grid grid-cols-2 gap-4 text-xs"><div><span className="text-slate-500 block text-[10px] mb-1">CHECK-IN</span>{booking.check_in}</div><div><span className="text-slate-500 block text-[10px] mb-1">CHECK-OUT</span>{booking.check_out}</div><span>{booking.number_of_nights} nights</span><span>{booking.guests} guests</span></div><h3 className="text-xs tracking-wider uppercase mt-6 mb-4">Price breakdown</h3><dl className="space-y-3 text-xs"><div className="flex justify-between"><dt>Chalet stay ({booking.number_of_nights} nights)</dt><dd>{money(booking.total_price)}</dd></div><div className="flex justify-between bg-surface-container-low p-4 rounded-lg text-base font-semibold"><dt>Total</dt><dd className="text-primary">{money(booking.total_price)}</dd></div></dl><p className="text-[11px] mt-4 text-slate-500">Server-calculated · No hidden markup.</p></div><div className="panel flex gap-3 text-xs"><Icon name="verified_user" className="text-primary" /><div><strong>StayLeb Escrow Protection Shield</strong><p className="mt-1 text-slate-500">Your payment is protected.</p></div></div></aside>;
  }
  if (preview && effectiveDraft) {
    return <aside className="space-y-4"><div className="panel"><PropertyIdentity hero property={displayProp} /><div className="bg-surface-container-low rounded-lg p-4 mt-5 grid grid-cols-2 gap-4 text-xs"><div><span className="text-slate-500 block text-[10px] mb-1">CHECK-IN</span>{preview.check_in}</div><div><span className="text-slate-500 block text-[10px] mb-1">CHECK-OUT</span>{preview.check_out}</div><span>{preview.number_of_nights} nights</span><span>{preview.guests} guests</span></div><h3 className="text-xs tracking-wider uppercase mt-6 mb-4">Price breakdown</h3><dl className="space-y-3 text-xs"><div className="flex justify-between"><dt>Chalet stay ({preview.number_of_nights} nights)</dt><dd>{money(preview.total_price)}</dd></div><div className="flex justify-between bg-surface-container-low p-4 rounded-lg text-base font-semibold"><dt>Total</dt><dd className="text-primary">{money(preview.total_price)}</dd></div></dl><p className="text-[11px] mt-4 text-slate-500">Server-calculated · No hidden markup. No booking created yet.</p></div><div className="panel flex gap-3 text-xs"><Icon name="verified_user" className="text-primary" /><div><strong>StayLeb Escrow Protection Shield</strong><p className="mt-1 text-slate-500">Your payment is protected.</p></div></div></aside>;
  }
  return <aside className="space-y-4"><div className="panel"><PropertyIdentity hero property={displayProp} /><div className="bg-surface-container-low rounded-lg p-4 mt-5 grid grid-cols-2 gap-4 text-xs"><div><span className="text-slate-500 block text-[10px] mb-1">CHECK-IN</span>{effectiveDraft ? effectiveDraft.checkIn : 'Select dates'}</div><div><span className="text-slate-500 block text-[10px] mb-1">CHECK-OUT</span>{effectiveDraft ? effectiveDraft.checkOut : '—'}</div><span>{nights} nights</span><span>{effectiveDraft ? `${effectiveDraft.guests} guests` : '0 guests'}</span></div><h3 className="text-xs tracking-wider uppercase mt-6 mb-4">Price breakdown</h3><dl className="space-y-3 text-xs"><div className="flex justify-between"><dt>Chalet stay ({nights} nights)</dt><dd>{money(lodging)}</dd></div><div className="flex justify-between bg-surface-container-low p-4 rounded-lg text-base font-semibold"><dt>Total</dt><dd className="text-primary">{money(total)}</dd></div></dl></div></aside>;
}
export function BackToPropertyButton({propertyId, variant='default', className='' }: { propertyId?: string | number | null; variant?: 'default' | 'compact'; className?: string }) {
  const params = useParams() as { id?: string };
  const { booking } = useBooking();
  const pid = propertyId ?? (booking ? String(booking.property_id) : params.id);
  if (!pid) return null;
  const compact = variant === 'compact';
  return (
    <Link
      href={`/properties/${pid}`}
      aria-label="Back to property details"
      className={`inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary ${compact ? 'text-xs text-slate-600' : 'text-sm text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:border-primary/30 hover:bg-primary/5'} ${className}`}
    >
      <Icon name="arrow_back" className={`${compact ? 'text-[16px]' : 'text-[18px]'}`} />
      {compact ? 'Back to property' : 'Back to property details'}
    </Link>
  );
}

export function BookingProgress({step}:{step:number}) {return <div className="flex flex-wrap justify-between gap-4 text-xs mb-7"><div className="text-slate-500">Discover <span className="mx-2">›</span> Property <span className="mx-2">›</span> Booking</div><ol aria-label="Booking progress" className="flex gap-4">{['Stay Details','Price & Review','Payment'].map((title,index)=><li key={title} aria-current={step===index+1?'step':undefined} className={step>=index+1?'text-primary':'text-slate-400'}><span className={`rounded-full inline-grid place-items-center w-4 h-4 mr-1 text-[10px] ${step>=index+1?'bg-primary text-white':'bg-surface-container'}`}>{index+1}</span>{title}</li>)}</ol></div>; }
