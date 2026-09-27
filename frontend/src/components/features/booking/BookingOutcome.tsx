"use client";
import Link from 'next/link';
import {useBooking,money} from './BookingContext';
import {PropertyIdentity, BackToPropertyButton} from './BookingSummary';
import {Icon} from '@/components/ui/Icon';
import { LocalImage } from '@/components/ui/LocalImage';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBooking } from '@/services/bookings';
import { getPublicProperty } from '@/services/properties';
import type { BookingResponse } from '@/services/bookings';
import type { PropertyResponse } from '@/services/owner';

export function BookingConfirmed(){
  const {booking: ctxBooking} = useBooking();
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);
  const bookingId = mounted ? new URLSearchParams(window.location.search).get('booking_id') : null;
  const [booking, setBooking] = useState<BookingResponse | null>(ctxBooking || null);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Initial fetch
  useEffect(()=>{
    if(!booking && bookingId){
      getBooking(bookingId).then(setBooking).catch(()=>{});
    }
  },[booking, bookingId]);

  useEffect(()=>{
    if(booking){
      getPublicProperty(String(booking.property_id)).then(setProperty).catch(()=>{});
    }
  },[booking]);

  // Poll until confirmed (handles webhook delay)
  useEffect(()=>{
    if(!bookingId || !booking) return;
    if(booking.status === 'confirmed') return;
    if(pollCount >= 15) return; // stop after ~30s
    const timer = setTimeout(async ()=>{
      setPolling(true);
      try{
        const fresh = await getBooking(bookingId);
        setBooking(fresh);
        setPollCount(c=>c+1);
      }catch{}
      setPolling(false);
    }, 2000);
    return ()=>clearTimeout(timer);
  },[booking, bookingId, pollCount]);

  if (!mounted) return <main className="w-full min-h-screen bg-[#F4F7FB]"><div className="max-w-[1150px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5"><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-8 sm:p-12 text-center animate-pulse"><div className="mx-auto w-16 h-16 rounded-full bg-[#EAF1F6]" /><div className="mx-auto mt-5 h-6 w-56 bg-[#EAF1F6] rounded" /><div className="mx-auto mt-3 h-4 w-80 max-w-full bg-[#EAF1F6] rounded" /></div><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-44 bg-[#EAF1F6] rounded-2xl" /></div><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-16 bg-[#EAF1F6] rounded-2xl" /></div></div></main>;
  if (!bookingId) return <main className="w-full min-h-screen bg-[#F4F7FB]"><div className="max-w-[1150px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7"><div className="flex justify-start mb-5"><BackToPropertyButton /></div><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-8 text-center"><p className="text-sm text-[#64748B]">Missing booking information.</p><Link href="/" className="text-primary text-sm underline mt-4 inline-block">Return to Discover</Link></div></div></main>;
  if (!booking) return <main className="w-full min-h-screen bg-[#F4F7FB]"><div className="max-w-[1150px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5"><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-8 sm:p-12 text-center animate-pulse"><div className="mx-auto w-16 h-16 rounded-full bg-[#EAF1F6]" /><div className="mx-auto mt-5 h-6 w-56 bg-[#EAF1F6] rounded" /><div className="mx-auto mt-3 h-4 w-80 max-w-full bg-[#EAF1F6] rounded" /></div><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-44 bg-[#EAF1F6] rounded-2xl" /></div><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-16 bg-[#EAF1F6] rounded-2xl" /></div></div></main>;

  const total = Number(booking.total_price);
  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';

  const heroImage = property?.images?.find(i=>i.is_primary)?.image_url || property?.images?.[0]?.image_url;

  return (
  <main className="w-full min-h-screen bg-[#F4F7FB]">
    <div className="max-w-[1150px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="relative overflow-hidden rounded-[22px] border border-[#E3ECF3] mb-5">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url("/images/payment_method.png")`, backgroundPosition: 'center right' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/15" />
        <div className="relative px-4 sm:px-6 py-5 space-y-2.5">
          <div className="flex justify-start">
            <BackToPropertyButton className="bg-white border-[#E3ECF3] shadow-sm px-4 py-2.5 text-[13px] text-[#1E293B] hover:text-[#157375] hover:border-[#46B1B1]/50" />
          </div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748B] flex-wrap">
            <span>Discover</span>
            <span aria-hidden="true" className="text-[#94A3B8]">›</span>
            <span>Property</span>
            <span aria-hidden="true" className="text-[#94A3B8]">›</span>
            <span>Booking</span>
            <span aria-hidden="true" className="text-[#94A3B8]">›</span>
            <span aria-current="page" className="text-[#1E293B] font-semibold">Confirmation</span>
          </nav>
        </div>
      </div>

      <div className="space-y-5">
      <section className="relative overflow-hidden bg-white border border-[#E3ECF3] rounded-[24px] shadow-[0_8px_30px_rgba(21,115,117,0.10)] px-6 py-10 sm:px-12 sm:py-12 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#46B1B1]/[0.10] to-transparent" />
        <div className="relative">
          <span className={`mx-auto grid place-items-center h-[72px] w-[72px] rounded-full shadow-[0_0_0_8px_rgba(21,115,117,0.08)] ${isConfirmed ? "bg-gradient-to-br from-[#157375] to-[#46B1B1] text-white" : "bg-amber-100 text-amber-600"}`}>
            <Icon name={isConfirmed ? "check" : "hourglass_top"} className="material-symbols-outlined text-[36px]" />
          </span>
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#157375] mt-5">{isConfirmed ? "Booking Confirmed — Payment Verified" : isPending ? "Confirming your payment..." : `Booking ${booking.status}`}</p>
          <h1 className="text-[30px] sm:text-[36px] font-extrabold tracking-tight mt-2 text-[#1E293B]">{isConfirmed ? "Booking Confirmed!" : isPending ? "Confirming your payment..." : `Booking ${booking.status}`}</h1>
          <p className="text-[14px] text-[#64748B] mt-3 max-w-xl mx-auto leading-relaxed">
            {isConfirmed ? `Your mountain reservation ${property ? `at ${property.title}` : ''} is confirmed. Payment verified via Stripe.` : isPending ? "Your payment is being verified. This usually takes a few seconds. Please wait..." : `Your booking is currently ${booking.status}.`}
          </p>
          <div className="mt-6 mx-auto max-w-xl flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 rounded-2xl bg-[#F4F7FB] border border-[#E3ECF3] px-5 py-4">
            <span className="flex items-center gap-2 text-[#64748B]">
              <Icon name="description" className="material-symbols-outlined text-[22px] text-[#157375]" />
              <span className="text-[12.5px] font-semibold">REF CODE:</span>
              <strong className="text-[15px] font-extrabold text-[#1E293B] tracking-wide">#SLB-{booking.id.toString().padStart(5,'0')}</strong>
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-bold ${isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Icon name={isConfirmed ? "check_circle" : "hourglass_top"} className="material-symbols-outlined text-[15px]" />
              {isConfirmed ? 'Confirmed' : polling ? 'Verifying' : isPending ? 'Pending Payment' : booking.status}
            </span>
          </div>
          {isPending && <p className="text-xs text-[#64748B] mt-4">{polling ? "Checking payment status…" : "If this takes too long, you can check My Bookings or contact support."}</p>}
        </div>
      </section>

      <section className="bg-white border border-[#E3ECF3] rounded-[22px] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl overflow-hidden min-h-[220px] md:min-h-[260px]">
          {heroImage ? (
            <LocalImage src={heroImage} alt={property?.title ?? 'Property'} className="w-full h-full max-h-[320px] object-cover" />
          ) : (
            <div className="w-full h-full min-h-[220px] bg-[#EAF1F6] animate-pulse" />
          )}
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          {property ? (
            <>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#157375]">
                <Icon name="verified" className="material-symbols-outlined text-[14px]" />Verified Superhost
              </span>
              <h2 className="text-[20px] font-extrabold tracking-tight text-[#1E293B] mt-1.5">{property.title}</h2>
              <p className="text-[13.5px] text-[#64748B] mt-1.5 flex items-center gap-1">
                <Icon name="location_on" className="material-symbols-outlined text-[16px] text-[#46B1B1]" />{property.location}
              </p>
              <p className="text-[13px] text-[#157375] font-semibold mt-1 flex items-center gap-1">
                <Icon name="star" className="material-symbols-outlined text-[15px]" />Verified listing
              </p>
            </>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-5 w-2/3 bg-[#EAF1F6] rounded" />
              <div className="h-4 w-1/2 bg-[#EAF1F6] rounded" />
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[#EAF1F6] space-y-3 text-[13.5px]">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="calendar_month" className="material-symbols-outlined text-[20px] text-[#157375]" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Check-in</p>
                <p className="font-bold text-[#1E293B]">{booking.check_in} <span className="font-medium text-[#64748B]">· From 15:00</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="event" className="material-symbols-outlined text-[20px] text-[#157375]" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Check-out</p>
                <p className="font-bold text-[#1E293B]">{booking.check_out} <span className="font-medium text-[#64748B]">· Before 11:00</span></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/10 px-3.5 py-2.5">
                <Icon name="bedtime" className="material-symbols-outlined text-[20px] text-[#157375]" />
                <div>
                  <p className="font-bold text-[#1E293B] leading-tight">{booking.number_of_nights} night{booking.number_of_nights === 1 ? '' : 's'}</p>
                  <p className="text-[11.5px] text-[#64748B]">Duration</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/10 px-3.5 py-2.5">
                <Icon name="group" className="material-symbols-outlined text-[20px] text-[#157375]" />
                <div>
                  <p className="font-bold text-[#1E293B] leading-tight">{booking.guests} guest{booking.guests === 1 ? '' : 's'}</p>
                  <p className="text-[11.5px] text-[#64748B]">Guests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E3ECF3] rounded-[22px] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
            <Icon name="receipt_long" className="material-symbols-outlined text-[22px] text-[#157375]" />
          </span>
          <div>
            <h2 className="text-[18px] font-extrabold tracking-tight text-[#1E293B]">Receipt Breakdown</h2>
            <p className="text-[12.5px] text-[#64748B] mt-0.5">A summary of your booking and payment details.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#46B1B1]/[0.12] to-[#157375]/[0.12] border border-[#46B1B1]/20">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Icon name="account_balance_wallet" className="material-symbols-outlined text-[22px] text-[#157375]" />
            </span>
            <div>
              <p className="font-extrabold text-[#1E293B] text-[15px]">Total Booking Amount</p>
              <p className="text-[12px] text-[#64748B] mt-0.5">Status: {booking.status} · Total confirmed. {isConfirmed ? "Payment verified." : "Awaiting payment confirmation."}</p>
            </div>
          </div>
          <strong className="text-[22px] font-extrabold text-[#157375] shrink-0">{money(total)} USD</strong>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#1E293B] text-[14px] font-bold hover:border-[#46B1B1]/60 hover:text-[#157375] hover:bg-[#46B1B1]/[0.05] transition-all shadow-sm">
          <span aria-hidden="true">←</span> Return to Discover
        </Link>
        <button onClick={()=>window.print()} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#1E293B] text-[14px] font-bold hover:border-[#46B1B1]/60 hover:text-[#157375] hover:bg-[#46B1B1]/[0.05] transition-all shadow-sm">
          <Icon name="print" className="material-symbols-outlined text-[19px]" />Download / Print Receipt
        </button>
      </div>
      <Link href="/account/bookings" className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#157375] to-[#46B1B1] hover:from-[#0E4E50] hover:to-[#157375] text-white font-bold text-[15px] shadow-[0_10px_24px_rgba(21,115,117,0.35)] transition-all flex items-center justify-center gap-2 group">
        <Icon name="calendar_month" className="material-symbols-outlined text-white text-[20px]" />
        <span>View in My Bookings</span>
        <Icon name="arrow_forward" className="material-symbols-outlined text-white text-[20px] transition-transform group-hover:translate-x-1" />
      </Link>
      </div>
    </div>
  </main>
  );
}
export function PaymentFailed(){
  const params = useParams() as {id?: string};
  const propertyId = params.id;
  const bookingId = typeof window!=='undefined' ? new URLSearchParams(window.location.search).get('booking_id') : null;
  const bookingParam = bookingId ? `?booking_id=${bookingId}` : '';
  const paymentLink = propertyId ? `/market/book/${propertyId}/payment${bookingParam}` : `/market/book/unknown/payment${bookingParam}`;
  const paymentMethodLink = propertyId ? `/market/book/${propertyId}/payment-method${bookingParam}` : `/market/book/unknown/payment-method${bookingParam}`;
  return <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-5"><div className="flex justify-start"><BackToPropertyButton /></div><section className="panel"><span className="text-error text-xs">⚠ Stripe Authorization Unsuccessful</span><h1 className="text-3xl font-semibold mt-3 text-[#1E293B]">Payment Couldn’t Be Completed</h1><p className="text-sm text-[#64748B] mt-3">Your bank or card issuer was unable to authorize this transaction.</p><div className="p-5 bg-surface-container-low rounded-lg mt-5"><strong className="text-primary">Your booking has NOT been confirmed.</strong><p className="text-xs mt-2">No charges were made.</p></div></section><div className="grid md:grid-cols-2 gap-5"><section className="panel space-y-4"><h2 className="text-lg font-semibold">Choose Recovery Action</h2><Link href={paymentLink} className="primary-button w-full">Try Payment Again →</Link><Link href={paymentMethodLink} className="secondary-button w-full">Pay Cash on Arrival (USD) →</Link><Link href={`/`} className="block text-xs">‹ Return Home</Link></section></div></main>;
}
export function CashRequest({pending=false}:{pending?:boolean}){
  const {booking: ctxBooking} = useBooking();
  
  const bookingId = typeof window!=='undefined' ? new URLSearchParams(window.location.search).get('booking_id') : null;
  const [booking, setBooking] = useState<BookingResponse | null>(ctxBooking || null);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  useEffect(()=>{ if(!booking && bookingId){ getBooking(bookingId).then(setBooking).catch(()=>{}); } },[booking, bookingId]);
  useEffect(()=>{ if(booking){ getPublicProperty(String(booking.property_id)).then(setProperty).catch(()=>{}); } },[booking]);
  if (!booking) return <main className="w-full min-h-screen bg-[#F4F7FB]"><div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7"><div className="mb-5"><BackToPropertyButton /></div><div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"><div className="lg:col-span-8 space-y-5 min-w-0"><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-8 sm:p-10 animate-pulse"><div className="h-6 w-44 bg-[#FEF3C7] rounded-full" /><div className="mt-4 h-8 w-80 max-w-full bg-[#EAF1F6] rounded" /><div className="mt-3 h-4 w-full max-w-md bg-[#EAF1F6] rounded" /></div><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-28 bg-[#EAF1F6] rounded-2xl" /></div></div><div className="lg:col-span-4 min-w-0"><div className="bg-white rounded-[22px] border border-[#E3ECF3] p-5 animate-pulse"><div className="h-44 bg-[#EAF1F6] rounded-2xl" /><div className="mt-4 h-4 w-2/3 bg-[#EAF1F6] rounded" /></div></div></div><p className="text-center text-sm text-[#64748B] mt-6">Loading cash booking…</p></div></main>;
  const total = Number(booking.total_price);
  const heroImage = property?.images?.find(i=>i.is_primary)?.image_url || property?.images?.[0]?.image_url;
  const nextSteps = [
    { icon: 'mail', title: 'Request Submitted', text: 'Sent securely to host.' },
    { icon: 'event_available', title: 'Host Review', text: 'Owner reviews dates and party size.' },
    { icon: 'notifications', title: 'Approval / Notification', text: 'You receive confirmation.' },
    { icon: 'home', title: 'Check-in & Cash Handover', text: 'Pay the host upon arrival.' },
  ];
  return (
  <main className="w-full min-h-screen bg-[#F4F7FB]">
    <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="relative overflow-hidden rounded-[22px] border border-[#E3ECF3] mb-5">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url("/images/payment_method.png")`, backgroundPosition: 'center right' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/15" />
        <div className="relative px-4 sm:px-6 py-5 space-y-2.5">
          <div className="flex justify-start">
            <BackToPropertyButton className="bg-white border-[#E3ECF3] shadow-sm px-4 py-2.5 text-[13px] text-[#1E293B] hover:text-[#157375] hover:border-[#46B1B1]/50" />
          </div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748B] flex-wrap">
            <span>Discover</span>
            <span aria-hidden="true" className="text-[#94A3B8]">›</span>
            <span>Property</span>
            <span aria-hidden="true" className="text-[#94A3B8]">›</span>
            <span>Booking</span>
            <span aria-hidden="true" className="text-[#94A3B8]">›</span>
            <span aria-current="page" className="text-[#1E293B] font-semibold">Request Sent</span>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="space-y-5 lg:col-span-8 min-w-0">
          <section className="relative overflow-hidden bg-white border border-[#E3ECF3] rounded-[22px] shadow-[0_4px_22px_rgba(21,115,117,0.08)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-[46%] sm:w-[42%] bg-no-repeat"
              style={{ backgroundImage: `url("/images/cash_request.png")`, backgroundSize: 'contain', backgroundPosition: 'right bottom' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent sm:via-white/40" />
            <div className="relative p-6 sm:p-8 max-w-[62%]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[12px] font-bold">
                <Icon name="hourglass_top" className="material-symbols-outlined text-[15px]" />Pending Owner Approval
              </span>
              <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-[#1E293B] mt-3">{pending?'Pending Cash Booking':'Cash Booking Request Sent!'}</h1>
              <p className="text-[13.5px] text-[#64748B] mt-2 leading-relaxed">Your request {property ? `for ${property.title}` : ''} has been delivered. The owner has max 12h to review.</p>
            </div>
          </section>

          <div className="flex gap-3.5 p-5 rounded-[20px] bg-[#FFFBEB] border border-amber-200/70 shadow-sm">
            <span className="w-10 h-10 rounded-full bg-amber-500 text-white grid place-items-center shrink-0 shadow-sm">
              <Icon name="priority_high" className="material-symbols-outlined text-[22px]" />
            </span>
            <div className="text-[13px] leading-relaxed text-amber-900">
              <strong>Important: This booking is NOT confirmed yet.</strong>
              <p className="mt-1.5">Your requested dates are temporarily held. Once approved, you will pay {money(total)} in cash directly to the owner upon check-in. Status: {booking.status}</p>
            </div>
          </div>

          <section className="bg-white border border-[#E3ECF3] rounded-[22px] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 sm:p-6">
            <h2 className="text-[18px] font-extrabold tracking-tight text-[#1E293B]">Reservation Summary</h2>
            <div className="mt-4 flex gap-4 items-center">
              {heroImage ? (
                <LocalImage src={heroImage} alt={property?.title ?? 'Property'} className="w-28 h-24 object-cover rounded-2xl shrink-0" />
              ) : (
                <div className="w-28 h-24 bg-[#EAF1F6] rounded-2xl animate-pulse shrink-0" />
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#157375]">
                  <Icon name="verified" className="material-symbols-outlined text-[13px]" />Verified Superhost
                </span>
                <p className="text-[15.5px] font-extrabold tracking-tight text-[#1E293B] mt-1 truncate">{property?.title ?? 'Loading property…'}</p>
                <p className="text-[12.5px] text-[#64748B] mt-0.5 flex items-center gap-1">
                  <Icon name="location_on" className="material-symbols-outlined text-[14px] text-[#46B1B1]" />{property?.location ?? '—'}
                </p>
                <p className="text-[12px] text-[#157375] font-semibold mt-0.5 flex items-center gap-1">
                  <Icon name="star" className="material-symbols-outlined text-[13px]" />Verified listing
                </p>
              </div>
            </div>
            <dl className="mt-5 text-[13.5px] divide-y divide-[#EAF1F6]">
              <div className="flex justify-between items-center gap-3 py-3">
                <dt className="flex items-center gap-2.5 font-medium text-[#1E293B]">
                  <Icon name="calendar_month" className="material-symbols-outlined text-[19px] text-[#157375]" />Dates Requested
                </dt>
                <dd className="font-semibold text-[#1E293B] text-right">{booking.check_in} → {booking.check_out}</dd>
              </div>
              <div className="flex justify-between items-center gap-3 py-3">
                <dt className="flex items-center gap-2.5 font-medium text-[#1E293B]">
                  <Icon name="group" className="material-symbols-outlined text-[19px] text-[#157375]" />Guests
                </dt>
                <dd className="font-semibold text-[#1E293B]">{booking.guests}</dd>
              </div>
              <div className="flex justify-between items-center gap-3 py-3">
                <dt className="flex items-center gap-2.5 font-medium text-[#1E293B]">
                  <Icon name="payments" className="material-symbols-outlined text-[19px] text-[#157375]" />Payment Method
                </dt>
                <dd className="font-semibold text-[#1E293B] text-right">Cash on Arrival (USD)</dd>
              </div>
            </dl>
            <div className="mt-2 flex justify-between items-center p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#46B1B1]/[0.12] to-[#157375]/[0.12] border border-[#46B1B1]/20">
              <span className="font-extrabold text-[#1E293B] text-[14.5px]">Total to be paid in cash</span>
              <span className="text-[20px] font-extrabold text-[#157375]">{money(total)}</span>
            </div>
          </section>

          <section className="bg-white border border-[#E3ECF3] rounded-[22px] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 sm:p-6">
            <h2 className="text-[18px] font-extrabold tracking-tight text-[#1E293B]">What Happens Next</h2>
            <ol className="mt-4 divide-y divide-[#EAF1F6]">
              {nextSteps.map((step,index)=>(
                <li key={step.title} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  <span className="w-8 h-8 shrink-0 bg-gradient-to-br from-[#157375] to-[#46B1B1] text-white rounded-full grid place-items-center text-[13px] font-bold shadow-sm">{index+1}</span>
                  <span className="w-9 h-9 rounded-xl bg-[#46B1B1]/10 hidden sm:flex items-center justify-center shrink-0">
                    <Icon name={step.icon} className="material-symbols-outlined text-[19px] text-[#157375]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-[#1E293B]">{step.title}</p>
                    <p className="text-[12.5px] text-[#64748B]">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Link href="/account/bookings" className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#157375] to-[#46B1B1] hover:from-[#0E4E50] hover:to-[#157375] text-white font-bold text-[15px] shadow-[0_10px_24px_rgba(21,115,117,0.35)] transition-all flex items-center justify-center gap-2 group">
            <Icon name="calendar_month" className="material-symbols-outlined text-white text-[20px]" />
            <span>Go to My Bookings</span>
            <Icon name="arrow_forward" className="material-symbols-outlined text-white text-[20px] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/search" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#CBD5E1] text-[#157375] text-[13.5px] font-bold hover:border-[#46B1B1]/60 hover:bg-[#46B1B1]/[0.05] transition-all shadow-sm">
            <Icon name="landscape" className="material-symbols-outlined text-[18px]" />
            <span>Explore Other Chalets</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="lg:col-span-4 min-w-0">
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-[22px] border border-[#E3ECF3] shadow-[0_8px_30px_rgba(21,115,117,0.10)] overflow-hidden">
              <div className="p-3 pb-0">
                {heroImage ? (
                  <div className="h-52 overflow-hidden rounded-2xl">
                    <LocalImage src={heroImage} alt={property?.title ?? 'Property'} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-52 bg-[#EAF1F6] rounded-2xl animate-pulse" />
                )}
              </div>
              <div className="p-5">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#157375]">
                  <Icon name="verified" className="material-symbols-outlined text-[13px]" />Verified Superhost
                </span>
                <h2 className="text-[17px] font-extrabold tracking-tight text-[#1E293B] mt-1.5">{property?.title ?? 'Loading property…'}</h2>
                <p className="text-[13px] text-[#64748B] mt-1 flex items-center gap-1">
                  <Icon name="location_on" className="material-symbols-outlined text-[15px] text-[#46B1B1]" />{property?.location ?? '—'}
                </p>
                <p className="text-[12.5px] text-[#157375] font-semibold mt-1 flex items-center gap-1">
                  <Icon name="star" className="material-symbols-outlined text-[14px]" />Verified listing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  );
}
