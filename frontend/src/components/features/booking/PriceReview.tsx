"use client";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBooking, money } from './BookingContext';
import { BookingSummary, PropertyIdentity, BackToPropertyButton } from './BookingSummary';
import { getPublicProperty } from '@/services/properties';
import { previewBooking, type BookingPreviewResponse } from '@/services/bookings';
import { useEffect, useState } from 'react';
import type { PropertyResponse } from '@/services/owner';
import { Icon } from '@/components/ui/Icon';
import { LocalImage } from '@/components/ui/LocalImage';
import Swal from 'sweetalert2';

const HEADER_BG = "/images/price&review.png";

// Local stepper for the Price & Review page only (shared BookingProgress is left untouched
// so Stay Details / Payment steps keep their current rendering).
function PriceReviewStepper() {
  return (
    <ol aria-label="Booking progress" className="flex items-center gap-1.5 sm:gap-2.5 text-[12px] font-semibold overflow-x-auto whitespace-nowrap py-1">
      <li className="flex items-center gap-1.5 shrink-0" aria-current={undefined}>
        <span className="w-6 h-6 rounded-full bg-[#46B1B1] text-white grid place-items-center shadow-sm">
          <Icon name="check" className="material-symbols-outlined text-[15px]" />
        </span>
        <span className="text-[#157375]">Stay Details</span>
      </li>
      <span aria-hidden="true" className="w-6 sm:w-10 h-px bg-[#157375]/50 shrink-0" />
      <li className="flex items-center gap-1.5 shrink-0" aria-current="step">
        <span className="w-6 h-6 rounded-full bg-[#157375] text-white grid place-items-center font-bold text-[11px] shadow-[0_0_0_4px_rgba(21,115,117,0.15)]">
          2
        </span>
        <span className="text-[#1E293B] font-bold">Price & Review</span>
      </li>
      <span aria-hidden="true" className="w-6 sm:w-10 h-px bg-[#E3ECF3] shrink-0" />
      <li className="flex items-center gap-1.5 shrink-0">
        <span className="w-6 h-6 rounded-full bg-white text-[#94A3B8] grid place-items-center font-bold text-[11px] border border-[#CBD5E1]">
          3
        </span>
        <span className="text-[#94A3B8]">Payment</span>
      </li>
    </ol>
  );
}

function PriceReviewHeader({ propertyId }: { propertyId?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[#E3ECF3] mb-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url("${HEADER_BG}")`, backgroundPosition: 'center right' }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/15" />
      <div className="relative px-4 sm:px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <BackToPropertyButton
              propertyId={propertyId}
              className="bg-white border-[#E3ECF3] shadow-sm px-4 py-2.5 text-[13px] text-[#1E293B] hover:text-[#157375] hover:border-[#46B1B1]/50"
            />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748B]">
              <span>Discover</span>
              <span aria-hidden="true" className="text-[#94A3B8]">›</span>
              <span>Property</span>
              <span aria-hidden="true" className="text-[#94A3B8]">›</span>
              <span aria-current="page" className="text-[#1E293B] font-semibold">Booking</span>
            </nav>
          </div>
          <PriceReviewStepper />
        </div>
      </div>
    </div>
  );
}

function PriceReviewShell({ propertyId, children }: { propertyId?: string; children: React.ReactNode }) {
  return (
    <main className="w-full min-h-screen bg-[#F4F7FB]">
      <div className="max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <PriceReviewHeader propertyId={propertyId} />
        {children}
      </div>
    </main>
  );
}

function ItineraryStrip({ checkIn, checkOut, nightsLabel, guests, propertyId }: { checkIn: string; checkOut: string; nightsLabel: string; guests: number; propertyId?: string }) {
  return (
    <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
          <Icon name="calendar_month" className="material-symbols-outlined text-[22px] text-[#157375]" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Selected itinerary</p>
          <p className="text-[14px] font-bold text-[#1E293B] truncate">{checkIn} → {checkOut}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:px-4 text-[13.5px] font-semibold text-[#1E293B]">
        <span className="flex items-center gap-1.5">
          <Icon name="bedtime" className="material-symbols-outlined text-[18px] text-[#157375]" />{nightsLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="group" className="material-symbols-outlined text-[18px] text-[#157375]" />{guests} guest{guests === 1 ? '' : 's'}
        </span>
      </div>
      <Link
        href={`/properties/${propertyId}`}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#46B1B1]/40 text-[#157375] text-[13px] font-bold hover:bg-[#46B1B1]/10 hover:text-[#157375] transition-colors shrink-0"
      >
        <Icon name="edit" className="material-symbols-outlined text-[16px]" />Edit dates
      </Link>
    </div>
  );
}

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
    return <PriceReviewShell propertyId={propertyId}><div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"><div className="lg:col-span-8 space-y-5"><div className="bg-white rounded-[20px] border border-[#E3ECF3] p-6 text-center shadow-sm"><p className="text-sm text-[#64748B]">Loading booking details…</p><p className="text-xs text-[#64748B] mt-2">Please wait while we load your selection.</p></div></div><div className="lg:col-span-4"><BookingSummary/></div></div></PriceReviewShell>;
  }

  if (!effectiveDraft) {
    // No draft - user navigated directly or refreshed without draft
    // If booking exists (e.g., after payment creation then back), show booking-based fallback
    if (booking) {
      const displayBooking = booking;
      return <PriceReviewShell propertyId={propertyId}><div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"><div className="space-y-5 lg:col-span-8"><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6"><PropertyIdentity property={property} booking={displayBooking}/><div className="flex justify-between items-center mt-6 bg-surface-container-low rounded-lg p-4"><div><small>Selected itinerary</small><p>{displayBooking.check_in} → {displayBooking.check_out}</p><small>{displayBooking.number_of_nights} nights · {displayBooking.guests} guests</small></div><Link href={`/properties/${propertyId}`} className="text-xs text-primary underline">Edit dates</Link></div></div><section className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6"><h1 className="font-semibold text-lg">Price Summary</h1><p className="text-xs text-[#64748B] mt-1 mb-5">All pricing includes seasonal rates. No hidden markup.</p><dl className="text-sm mt-6 space-y-3"><div className="flex justify-between"><dt>{displayBooking.number_of_nights} nights × {money(displayBooking.price_per_night)} avg</dt><dd>{money(displayBooking.total_price)}</dd></div><div className="flex justify-between p-5 bg-surface-container-low rounded-lg font-semibold"><dt>Total Booking Amount</dt><dd className="text-xl text-primary">{money(displayBooking.total_price)}</dd></div></dl></section><div className="grid sm:grid-cols-2 gap-4"><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6"><h2 className="font-semibold">24/7 Power Guarantee</h2><p className="text-xs text-[#64748B] mt-2">Hybrid solar + generator assurance.</p></div><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6"><h2 className="font-semibold">Free Cancellation</h2><p className="text-xs text-[#64748B] mt-2">Per policy before check-in.</p></div></div><Link href={`/market/book/${propertyId}/payment-method`} className="primary-button w-full">Choose Payment Method →</Link></div><div className="lg:col-span-4"><BookingSummary/></div></div></PriceReviewShell>;
    }
    return <PriceReviewShell propertyId={propertyId}><div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"><div className="space-y-5 lg:col-span-8"><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6 text-center"><p className="text-sm text-[#64748B]">No booking details found.</p><p className="text-xs mt-2">Please select your stay dates first. No booking has been created yet.</p><Link href={`/properties/${propertyId}`} className="text-primary text-sm underline mt-4 inline-block">Back to Property Details</Link></div></div><div className="lg:col-span-4"><BookingSummary/></div></div></PriceReviewShell>;
  }

  const checkIn = effectiveDraft.checkIn;
  const checkOut = effectiveDraft.checkOut;
  const guests = effectiveDraft.guests;

  if (loadingPreview) {
    return (
      <PriceReviewShell propertyId={propertyId}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          <div className="space-y-5 lg:col-span-8 min-w-0">
            <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-24 h-20 bg-[#EAF1F6] rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-[#EAF1F6] rounded" />
                  <div className="h-3 w-1/3 bg-[#EAF1F6] rounded" />
                </div>
              </div>
              <div className="mt-5 h-16 bg-[#F4F7FB] border border-[#E3ECF3] rounded-2xl" />
            </div>
            <section className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6" aria-busy="true" aria-label="Calculating seasonal pricing">
              <h1 className="text-[19px] font-extrabold tracking-tight text-[#1E293B]">Price Summary</h1>
              <p className="text-[12.5px] text-[#64748B] mt-0.5">All pricing includes seasonal rates. No hidden markup.</p>
              <div className="mt-5 space-y-2.5 animate-pulse" aria-hidden="true">
                <div className="h-4 bg-[#EAF1F6] rounded w-full" />
                <div className="h-4 bg-[#EAF1F6] rounded w-5/6" />
                <div className="h-14 bg-[#46B1B1]/10 border border-[#46B1B1]/15 rounded-2xl w-full" />
              </div>
              <p className="text-sm text-[#64748B] mt-4 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#46B1B1] border-t-transparent rounded-full animate-spin" />
                Calculating seasonal pricing…
              </p>
            </section>
          </div>
          <div className="lg:col-span-4 min-w-0">
            <div className="bg-white rounded-[22px] border border-[#E3ECF3] shadow-sm p-6 animate-pulse" aria-hidden="true">
              <div className="h-44 bg-[#EAF1F6] rounded-2xl" />
              <div className="mt-4 h-4 w-2/3 bg-[#EAF1F6] rounded" />
              <div className="mt-2 h-3 w-1/2 bg-[#EAF1F6] rounded" />
              <div className="mt-4 h-16 bg-[#F4F7FB] border border-[#E3ECF3] rounded-2xl" />
            </div>
          </div>
        </div>
      </PriceReviewShell>
    );
  }

  if (previewError || !preview) {
    return <PriceReviewShell propertyId={propertyId}><div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"><div className="space-y-5 lg:col-span-8 min-w-0"><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6"><PropertyIdentity property={property} /><div className="flex justify-between items-center mt-6 bg-surface-container-low rounded-lg p-4"><div><small>Selected itinerary</small><p>{checkIn} → {checkOut}</p><small>{guests} guests</small></div><Link href={`/properties/${propertyId}`} className="text-xs text-primary underline">Edit dates</Link></div></div><section className="bg-white rounded-[20px] border border-[#FECDD3] shadow-sm p-6"><h1 className="text-[19px] font-extrabold tracking-tight text-[#1E293B]">Pricing unavailable</h1><p className="text-sm text-error mt-3">{previewError}</p><p className="text-xs text-[#64748B] mt-2">Dates may have become unavailable. Please choose different dates.</p><Link href={`/properties/${propertyId}`} className="secondary-button mt-4 inline-flex">Change Dates →</Link></section></div><div className="lg:col-span-4 min-w-0"><BookingSummary/></div></div></PriceReviewShell>;
  }

  const formatNightDate = (iso: string) => {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return iso; }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const heroImage = property?.images?.find(i=>i.is_primary)?.image_url || property?.images?.[0]?.image_url;

  return (
    <PriceReviewShell propertyId={propertyId}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="space-y-5 lg:col-span-8 min-w-0">
          <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 sm:p-6">
            <div className="flex gap-4 items-start">
              {heroImage ? (
                <LocalImage src={heroImage} alt={property?.title ?? 'Property'} className="w-28 h-24 sm:w-36 sm:h-28 object-cover rounded-2xl shrink-0" />
              ) : (
                <div className="w-28 h-24 sm:w-36 sm:h-28 bg-[#EAF1F6] rounded-2xl animate-pulse shrink-0" />
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10.5px] font-bold uppercase tracking-wider">
                  <Icon name="verified" className="material-symbols-outlined text-[13px]" />Verified Superhost
                </span>
                <h1 className="text-[20px] sm:text-[22px] font-extrabold tracking-tight text-[#1E293B] mt-1.5 truncate">{property?.title ?? 'Loading property…'}</h1>
                <p className="text-[13px] text-[#64748B] mt-1 flex items-center gap-1">
                  <Icon name="location_on" className="material-symbols-outlined text-[15px] text-[#46B1B1]" />{property?.location ?? '—'}
                </p>
                <p className="text-[12.5px] text-[#157375] font-semibold mt-1 flex items-center gap-1">
                  <Icon name="star" className="material-symbols-outlined text-[14px]" />Verified listing
                </p>
              </div>
            </div>
            <ItineraryStrip checkIn={checkIn} checkOut={checkOut} nightsLabel={`${preview.number_of_nights} night${preview.number_of_nights === 1 ? '' : 's'}`} guests={guests} propertyId={propertyId} />
          </div>
          {(booking && isTemporaryCheckoutHold(booking) && expiresAtSeconds !== null && expiresAtSeconds > 0) && (
            <section className="bg-white rounded-[20px] border border-amber-200 shadow-sm p-4">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-100">
                <Icon name="schedule" className="material-symbols-outlined text-amber-700 text-[22px]" />
                <div>
                  <p className="font-semibold text-amber-800">Complete your booking within <span className="font-mono text-lg">{formatCountdown(expiresAtSeconds)}</span></p>
                  <p className="text-xs text-amber-700">This temporary hold expires automatically. Your dates will be released if not confirmed.</p>
                </div>
              </div>
            </section>
          )}
          <section className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="receipt_long" className="material-symbols-outlined text-[22px] text-[#157375]" />
              </span>
              <div>
                <h2 className="text-[19px] font-extrabold tracking-tight text-[#1E293B]">Price Summary</h2>
                <p className="text-[12.5px] text-[#64748B] mt-0.5">All pricing includes seasonal rates. No hidden markup.</p>
              </div>
            </div>
            <dl className="text-sm mt-5 space-y-3">
              <div className="flex justify-between items-center text-[#1E293B]">
                <dt className="font-medium">{preview.number_of_nights} night{preview.number_of_nights === 1 ? '' : 's'} × {money(preview.price_per_night)} avg</dt>
                <dd className="font-bold">{money(preview.total_price)}</dd>
              </div>
              {preview.nightly_breakdown && preview.nightly_breakdown.length > 0 && (
                <div className="pt-3 border-t border-[#EAF1F6]">
                  <button type="button" onClick={()=>setShowBreakdown(!showBreakdown)} aria-expanded={showBreakdown} className="flex items-center justify-between w-full text-sm font-bold text-[#157375] hover:text-[#0E4E50] py-1 transition-colors">
                    <span className="flex items-center gap-2">
                      <Icon name="calendar_month" className="material-symbols-outlined text-[20px] text-[#157375]" />Nightly Price Breakdown
                    </span>
                    <Icon name={showBreakdown ? "expand_less" : "expand_more"} className="material-symbols-outlined text-[22px]" />
                  </button>
                  {showBreakdown && (
                    <div className="mt-3 space-y-2">
                      {preview.nightly_breakdown.map((night)=> (
                        <div key={night.date} className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/10">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#1E293B] text-sm">{formatNightDate(night.date)}, {new Date(night.date + 'T12:00:00').getFullYear()}</span>
                            {night.pricing_source === 'seasonal' && night.season_name ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#157375]/10 text-[#157375] font-semibold">{night.season_name}</span>
                            ) : night.pricing_source === 'seasonal' ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Seasonal</span>
                            ) : null}
                          </div>
                          <span className="font-bold text-[#157375] text-sm">{money(night.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#46B1B1]/[0.12] to-[#157375]/[0.12] border border-[#46B1B1]/20">
                <dt className="font-extrabold text-[#1E293B] text-[15px]">Total Booking Amount</dt>
                <dd className="text-[22px] font-extrabold text-[#157375]">{money(preview.total_price)}</dd>
              </div>
            </dl>
          </section>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 flex items-start gap-3.5">
              <span className="w-11 h-11 rounded-full bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="bolt" className="material-symbols-outlined text-[22px] text-[#157375]" />
              </span>
              <div>
                <h2 className="text-[14.5px] font-extrabold text-[#1E293B]">24/7 Power Guarantee</h2>
                <p className="text-[12.5px] text-[#64748B] mt-1">Hybrid solar + generator assurance.</p>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 flex items-start gap-3.5">
              <span className="w-11 h-11 rounded-full bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="event_available" className="material-symbols-outlined text-[22px] text-[#157375]" />
              </span>
              <div>
                <h2 className="text-[14.5px] font-extrabold text-[#1E293B]">Free Cancellation</h2>
                <p className="text-[12.5px] text-[#64748B] mt-1">Per policy before check-in.</p>
              </div>
            </div>
          </div>
          <div>
            <button onClick={()=>router.push(`/market/book/${propertyId}/payment-method?check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}&guests=${guests}`)} className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#157375] to-[#46B1B1] hover:from-[#0E4E50] hover:to-[#157375] text-white font-bold text-[15px] shadow-[0_10px_24px_rgba(21,115,117,0.35)] transition-all flex items-center justify-center gap-2 group">
              <span>Choose Payment Method</span>
              <Icon name="arrow_forward" className="material-symbols-outlined text-white text-[20px] transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-xs text-center text-[#64748B] mt-2.5 flex items-center justify-center gap-1.5">
              <Icon name="info" className="material-symbols-outlined text-[15px]" />
              No booking has been created yet. It will be created only after you choose a payment method.
            </p>
          </div>
        </div>
        <div className="lg:col-span-4 min-w-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-[22px] border border-[#E3ECF3] shadow-[0_8px_30px_rgba(21,115,117,0.10)] overflow-hidden">
              {heroImage ? (
                <div className="h-48 overflow-hidden">
                  <LocalImage src={heroImage} alt={property?.title ?? 'Property'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-[#EAF1F6] animate-pulse" />
              )}
              <div className="p-5 sm:p-6">
                {property ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10.5px] font-bold uppercase tracking-wider">
                      <Icon name="verified" className="material-symbols-outlined text-[13px]" />Verified Superhost
                    </span>
                    <h2 className="text-[18px] font-extrabold tracking-tight text-[#1E293B] mt-2">{property.title}</h2>
                    <p className="text-[13px] text-[#64748B] mt-1 flex items-center gap-1">
                      <Icon name="location_on" className="material-symbols-outlined text-[15px] text-[#46B1B1]" />{property.location}
                    </p>
                    <p className="text-[12.5px] text-[#157375] font-semibold mt-1 flex items-center gap-1">
                      <Icon name="star" className="material-symbols-outlined text-[14px]" />Verified listing
                    </p>
                  </>
                ) : (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 w-2/3 bg-[#EAF1F6] rounded" />
                    <div className="h-3 w-1/2 bg-[#EAF1F6] rounded" />
                  </div>
                )}
                <div className="mt-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                        <Icon name="calendar_month" className="material-symbols-outlined text-[15px] text-[#157375]" />Check-in
                      </p>
                      <p className="text-[13.5px] font-bold text-[#1E293B] mt-1">{preview.check_in}</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                        <Icon name="event" className="material-symbols-outlined text-[15px] text-[#157375]" />Check-out
                      </p>
                      <p className="text-[13.5px] font-bold text-[#1E293B] mt-1">{preview.check_out}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#46B1B1]/15 flex items-center gap-5 text-[13px] font-semibold text-[#1E293B]">
                    <span className="flex items-center gap-1.5">
                      <Icon name="bedtime" className="material-symbols-outlined text-[17px] text-[#157375]" />{preview.number_of_nights} night{preview.number_of_nights === 1 ? '' : 's'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="group" className="material-symbols-outlined text-[17px] text-[#157375]" />{preview.guests} guest{preview.guests === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-5 mb-2.5 flex items-center gap-1.5">
                  <Icon name="receipt_long" className="material-symbols-outlined text-[16px]" />Price breakdown
                </h3>
                <dl className="text-[13.5px] space-y-2">
                  <div className="flex justify-between text-[#475569]">
                    <dt>Chalet stay ({preview.number_of_nights} night{preview.number_of_nights === 1 ? '' : 's'})</dt>
                    <dd className="font-semibold text-[#1E293B]">{money(preview.total_price)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-[#46B1B1]/[0.12] to-[#157375]/[0.12] border border-[#46B1B1]/20">
                  <span className="font-extrabold text-[#1E293B] text-[14.5px]">Total</span>
                  <span className="text-[19px] font-extrabold text-[#157375]">{money(preview.total_price)}</span>
                </div>
                <p className="text-[11.5px] mt-3 text-[#64748B]">Calculated with seasonal rates · No hidden markup.</p>
                <p className="text-[11.5px] text-[#64748B]">No booking created yet.</p>
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 flex gap-3">
              <span className="w-11 h-11 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="material-symbols-outlined text-[22px] text-[#157375]" />
              </span>
              <div>
                <strong className="text-[14px] font-extrabold text-[#1E293B]">StayLeb Escrow Protection Shield</strong>
                <p className="mt-1 text-[12.5px] text-[#64748B]">Your payment is protected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PriceReviewShell>
  );
}
