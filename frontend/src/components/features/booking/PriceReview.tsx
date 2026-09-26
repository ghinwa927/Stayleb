"use client";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBooking, money } from './BookingContext';
import { BookingSummary,BookingProgress,PropertyIdentity, BackToPropertyButton } from './BookingSummary';
import { getPublicProperty } from '@/services/properties';
import { previewBooking, type BookingPreviewResponse } from '@/services/bookings';
import { useEffect, useState } from 'react';
import type { PropertyResponse } from '@/services/owner';
import { Icon } from '@/components/ui/Icon';
import Swal from 'sweetalert2';

export function PriceReview(){
  const { draft, setDraft, booking, preview: ctxPreview, setPreview: setCtxPreview, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining } = useBooking();
  const params = useParams() as {id?:string};
  const router = useRouter();
  const propertyId = params.id;
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [preview, setPreview] = useState<BookingPreviewResponse | null>(ctxPreview);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [expiresAtSeconds, setExpiresAtSeconds] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);

  useEffect(()=>{ if(propertyId) getPublicProperty(propertyId).then(setProperty).catch(()=>{}); },[propertyId]);
  // Sync context preview to local state (ensures PropertyDetails preview is reused)
  useEffect(()=>{ if(ctxPreview) { setPreview(ctxPreview); } },[ctxPreview]);

  // If booking already exists (user reached this via final step back navigation after creation), prefer booking data
  // But normally draft should be used for preview
  // Fallback to query params for robustness (ensures dates survive even if draft race)
  const queryDraft = (()=> {
    if(typeof window === 'undefined') return null;
    try{
      const qs = new URLSearchParams(window.location.search);
      const qIn = qs.get('check_in');
      const qOut = qs.get('check_out');
      const qGuests = qs.get('guests');
      if(qIn && qOut && qGuests) return { propertyId: String(propertyId), checkIn: qIn, checkOut: qOut, guests: Number(qGuests) } as const;
    }catch{}
    return null;
  })();
  const effectiveDraft = (draft && draft.propertyId === propertyId ? draft : null) || queryDraft;

  // Sync query draft to context so Payment step can reuse it
  useEffect(()=>{
    if(queryDraft && (!draft || draft.propertyId !== propertyId || draft.checkIn !== queryDraft.checkIn || draft.checkOut !== queryDraft.checkOut || draft.guests !== queryDraft.guests)){
      setDraft(queryDraft as any);
    }
  },[queryDraft, draft, propertyId]);

  useEffect(()=>{
    if(!effectiveDraft || !propertyId) return;
    // If we already have a valid preview for this draft (from PropertyDetails) with breakdown, reuse it - don't refetch
    if(ctxPreview && (ctxPreview as any).nightly_breakdown && ctxPreview.property_id === Number(propertyId) && ctxPreview.check_in === effectiveDraft.checkIn && ctxPreview.check_out === effectiveDraft.checkOut && ctxPreview.guests === effectiveDraft.guests){
      setPreview(ctxPreview);
      return;
    }
    setLoadingPreview(true);
    setPreviewError(null);
    previewBooking({
      property_id: Number(propertyId),
      check_in: effectiveDraft.checkIn,
      check_out: effectiveDraft.checkOut,
      guests: effectiveDraft.guests
    }).then(p=>{ setPreview(p); setCtxPreview(p); }).catch((e)=>{
      setPreview(null); setCtxPreview(null);
      setPreviewError(e instanceof Error ? e.message : 'Unable to calculate pricing');
    }).finally(()=>setLoadingPreview(false));
  },[effectiveDraft, propertyId]);

  // Checkout expiration countdown for temporary booking holds
  useEffect(() => {
    if (!booking || !isTemporaryCheckoutHold(booking)) {
      setExpiresAtSeconds(null);
      setExpired(false);
      return;
    }
    const initialSeconds = getExpiresAtSecondsRemaining(booking);
    if (initialSeconds === null || initialSeconds <= 0) {
      setExpired(true);
      setExpiresAtSeconds(0);
      return;
    }
    setExpiresAtSeconds(initialSeconds);
    setExpired(false);
    const timer = setInterval(() => {
      const remaining = getExpiresAtSecondsRemaining(booking);
      if (remaining === null || remaining <= 0) {
        clearInterval(timer);
        setExpired(true);
        setExpiresAtSeconds(0);
      } else {
        setExpiresAtSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [booking, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining]);

  // Handle expired checkout - redirect to property with message
  useEffect(() => {
    if (expired && booking) {
      const expiredBookingId = booking.id;
      // Clear stale booking data
      try {
        sessionStorage.removeItem('stayleb-latest-booking-id');
        sessionStorage.removeItem('stayleb-latest-booking');
        localStorage.removeItem('stayleb-latest-booking-id');
        sessionStorage.removeItem('stayleb-stripe-client-secret');
        sessionStorage.removeItem('stayleb-stripe-booking-id');
      } catch {}
      Swal.fire({
        title: 'Checkout hold expired',
        text: 'Your temporary booking hold has expired. Please select dates again to start a new booking.',
        icon: 'warning',
        confirmButtonColor: '#157375',
      }).then(() => {
        router.push(`/properties/${propertyId}`);
      });
    }
  }, [expired, booking, propertyId, router]);
  // Render same loading skeleton on server and initial client, then hydrate correctly.
  if (!mounted) {
    return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={2}/><div className="booking-grid"><div className="space-y-5"><div className="panel p-6 text-center"><p className="text-sm text-slate-500">Loading booking details…</p><p className="text-xs text-slate-500 mt-2">Please wait while we load your selection.</p></div></div><BookingSummary/></div></main>;
  }

  if (!effectiveDraft) {
    // No draft - user navigated directly or refreshed without draft
    // If booking exists (e.g., after payment creation then back), show booking-based fallback
    if (booking) {
      const displayBooking = booking;
      return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={2}/><div className="booking-grid"><div className="space-y-5"><div className="panel"><PropertyIdentity property={property} booking={displayBooking}/><div className="flex justify-between items-center mt-6 bg-surface-container-low rounded-lg p-4"><div><small>Selected itinerary</small><p>{displayBooking.check_in} → {displayBooking.check_out}</p><small>{displayBooking.number_of_nights} nights · {displayBooking.guests} guests</small></div><Link href={`/properties/${propertyId}`} className="text-xs text-primary underline">Edit dates</Link></div></div><section className="panel"><h1 className="font-semibold text-lg">Price Summary — Server Verified</h1><p className="text-xs text-slate-500 mt-1 mb-5">All pricing is calculated server-side with seasonal rates. No hidden markup.</p><dl className="text-sm mt-6 space-y-3"><div className="flex justify-between"><dt>{displayBooking.number_of_nights} nights × {money(displayBooking.price_per_night)} avg</dt><dd>{money(displayBooking.total_price)}</dd></div><div className="flex justify-between p-5 bg-surface-container-low rounded-lg font-semibold"><dt>Total Booking Amount</dt><dd className="text-xl text-primary">{money(displayBooking.total_price)}</dd></div></dl></section><div className="grid sm:grid-cols-2 gap-4"><div className="panel"><h2 className="font-semibold">24/7 Power Guarantee</h2><p className="text-xs text-slate-500 mt-2">Hybrid solar + generator assurance.</p></div><div className="panel"><h2 className="font-semibold">Free Cancellation</h2><p className="text-xs text-slate-500 mt-2">Per policy before check-in.</p></div></div><Link href={`/market/book/${propertyId}/payment-method`} className="primary-button w-full">Choose Payment Method →</Link></div><BookingSummary/></div></main>;
    }
    return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={2}/><div className="booking-grid"><div className="space-y-5"><div className="panel p-6 text-center"><p className="text-sm text-slate-500">No booking details found.</p><p className="text-xs mt-2">Please select your stay dates first. No booking has been created yet.</p><Link href={`/properties/${propertyId}`} className="text-primary text-sm underline mt-4 inline-block">Back to Property Details</Link></div></div><BookingSummary/></div></main>;
  }

  const checkIn = effectiveDraft.checkIn;
  const checkOut = effectiveDraft.checkOut;
  const guests = effectiveDraft.guests;

  if (loadingPreview) {
    return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={2}/><div className="booking-grid"><div className="space-y-5"><div className="panel"><PropertyIdentity property={property} /><div className="flex justify-between items-center mt-6 bg-surface-container-low rounded-lg p-4"><div><small>Selected itinerary</small><p>{checkIn} → {checkOut}</p><small>? nights · {guests} guests</small></div><Link href={`/properties/${propertyId}`} className="text-xs text-primary underline">Edit dates</Link></div></div><section className="panel"><h1 className="font-semibold text-lg">Price Summary — Server Verified</h1><p className="text-sm text-slate-500 mt-4 animate-pulse">Calculating server pricing…</p></section></div><BookingSummary/></div></main>;
  }

  if (previewError || !preview) {
    return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={2}/><div className="booking-grid"><div className="space-y-5"><div className="panel"><PropertyIdentity property={property} /><div className="flex justify-between items-center mt-6 bg-surface-container-low rounded-lg p-4"><div><small>Selected itinerary</small><p>{checkIn} → {checkOut}</p><small>{guests} guests</small></div><Link href={`/properties/${propertyId}`} className="text-xs text-primary underline">Edit dates</Link></div></div><section className="panel"><h1 className="font-semibold text-lg">Pricing unavailable</h1><p className="text-sm text-error mt-3">{previewError}</p><p className="text-xs text-slate-500 mt-2">Dates may have become unavailable. Please choose different dates.</p><Link href={`/properties/${propertyId}`} className="secondary-button mt-4 inline-flex">Change Dates →</Link></section></div><BookingSummary/></div></main>;
  }

  const formatNightDate = (iso: string) => {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return iso; }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={2}/><div className="booking-grid"><div className="space-y-5"><div className="panel"><PropertyIdentity property={property} /><div className="flex justify-between items-center mt-6 bg-surface-container-low rounded-lg p-4"><div><small>Selected itinerary</small><p>{checkIn} → {checkOut}</p><small>{preview.number_of_nights} nights · {guests} guests</small></div><Link href={`/properties/${propertyId}`} className="text-xs text-primary underline">Edit dates</Link></div></div>
  {(booking && isTemporaryCheckoutHold(booking) && expiresAtSeconds !== null && expiresAtSeconds > 0) && (
    <section className="panel border-amber-200 bg-amber-50">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-100">
        <Icon name="schedule" className="material-symbols-outlined text-amber-700 text-[22px]" />
        <div>
          <p className="font-semibold text-amber-800">Complete your booking within <span className="font-mono text-lg">{formatCountdown(expiresAtSeconds)}</span></p>
          <p className="text-xs text-amber-700">This temporary hold expires automatically. Your dates will be released if not confirmed.</p>
        </div>
      </div>
    </section>
  )}
  <section className="panel"><h1 className="font-semibold text-lg">Price Summary — Server Verified</h1><p className="text-xs text-slate-500 mt-1 mb-5">All pricing is calculated server-side with seasonal rates. No hidden markup.</p><dl className="text-sm mt-6 space-y-3"><div className="flex justify-between"><dt>{preview.number_of_nights} nights × {money(preview.price_per_night)} avg</dt><dd>{money(preview.total_price)}</dd></div>{preview.nightly_breakdown && preview.nightly_breakdown.length > 0 && (<div className="pt-3 border-t border-surface-container-low"><button type="button" onClick={()=>setShowBreakdown(!showBreakdown)} className="flex items-center justify-between w-full text-sm font-semibold text-[#157375] hover:text-primary py-1"><span className="flex items-center gap-1.5"><Icon name="calendar_month" className="text-[18px] text-primary" />Nightly Price Breakdown</span><Icon name={showBreakdown ? "expand_less" : "expand_more"} className="text-[20px]" /></button>{showBreakdown && (<div className="mt-3 space-y-2">{preview.nightly_breakdown.map((night)=> (<div key={night.date} className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-surface-container-low"><div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-[#157375] text-sm">{formatNightDate(night.date)}</span>{night.pricing_source === 'seasonal' && night.season_name ? (<span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{night.season_name}</span>) : night.pricing_source === 'seasonal' ? (<span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Seasonal</span>) : null}</div><span className="font-semibold text-[#157375] text-sm">{money(night.price)}</span></div>))}</div>)}</div>)}<div className="flex justify-between p-5 bg-surface-container-low rounded-lg font-semibold"><dt>Total Booking Amount</dt><dd className="text-xl text-primary">{money(preview.total_price)}</dd></div></dl></section><div className="grid sm:grid-cols-2 gap-4"><div className="panel"><h2 className="font-semibold">24/7 Power Guarantee</h2><p className="text-xs text-slate-500 mt-2">Hybrid solar + generator assurance.</p></div><div className="panel"><h2 className="font-semibold">Free Cancellation</h2><p className="text-xs text-slate-500 mt-2">Per policy before check-in.</p></div></div><button onClick={()=>router.push(`/market/book/${propertyId}/payment-method?check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}&guests=${guests}`)} className="primary-button w-full">Choose Payment Method →</button><p className="text-xs text-center text-slate-500">No booking has been created yet. It will be created only after you choose a payment method.</p></div><BookingSummary preview={preview} draft={effectiveDraft} property={property}/></div></main>;
}
