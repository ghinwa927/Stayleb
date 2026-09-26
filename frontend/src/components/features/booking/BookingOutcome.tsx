"use client";
import Link from 'next/link';
import {useBooking,money} from './BookingContext';
import {PropertyIdentity, BackToPropertyButton} from './BookingSummary';
import {Icon} from '@/components/ui/Icon';
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

  if (!mounted) return <main className="max-w-2xl mx-auto p-5 md:p-8">Loading…</main>;
  if (!bookingId) return <main className="max-w-2xl mx-auto p-5 md:p-8"><div className="flex justify-start"><BackToPropertyButton /></div><div className="panel text-center"><p className="text-sm text-slate-500">Missing booking information.</p><Link href="/" className="text-primary text-sm underline mt-4 inline-block">Return to Discover</Link></div></main>;
  if (!booking) return <main className="max-w-2xl mx-auto p-5 md:p-8">Loading…</main>;

  const total = Number(booking.total_price);
  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';

  return <main className="max-w-2xl mx-auto p-5 md:p-8 space-y-5"><div className="flex justify-start"><BackToPropertyButton /></div>
    <section className="panel text-center bg-gradient-to-br from-white to-cyan-50">
      <span className="inline-grid place-items-center h-14 w-14 rounded-full bg-cyan-100 text-primary mb-4"><Icon name={isConfirmed ? "check" : "hourglass_top"} className="text-3xl"/></span>
      <p className="text-xs text-primary">{isConfirmed ? "Booking Confirmed — Payment Verified" : isPending ? "Confirming your payment..." : `Booking ${booking.status}`}</p>
      <h1 className="text-3xl font-semibold mt-3">{isConfirmed ? "Booking Confirmed!" : isPending ? "Confirming your payment..." : `Booking ${booking.status}`}</h1>
      <p className="text-sm text-slate-500 mt-3">
        {isConfirmed ? `Your mountain reservation ${property ? `at ${property.title}` : ''} is confirmed. Payment verified via Stripe.` : isPending ? "Your payment is being verified via Stripe webhook. This usually takes a few seconds. Please wait..." : `Your booking is currently ${booking.status}.`}
      </p>
      <div className="bg-surface-container-low p-4 mt-6 rounded-lg">REF CODE: <strong>#SLB-{booking.id.toString().padStart(5,'0')}</strong><span className={`ml-3 text-xs ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>{isConfirmed ? '✓ Confirmed' : polling ? '… Verifying' : isPending ? 'Pending Payment' : booking.status}</span></div>
      {isPending && <p className="text-xs text-slate-500 mt-3">{polling ? "Checking payment status…" : "If this takes too long, you can check My Bookings or contact support."}</p>}
    </section>
    <section className="panel"><PropertyIdentity hero property={property} booking={booking}/><div className="grid grid-cols-2 gap-5 mt-5 text-sm"><div><span className="block text-xs text-slate-500">Check-in</span>{booking.check_in} · From 15:00</div><div><span className="block text-xs text-slate-500">Check-out</span>{booking.check_out} · Before 11:00</div><div>{booking.number_of_nights} nights · {booking.guests} guests</div><div>Hosted — verified</div></div></section>
    <section className="panel"><h2 className="font-semibold">Receipt Breakdown</h2><div className="flex justify-between mt-5 bg-surface-container-low p-5 rounded-lg"><span>Total Booking Amount</span><strong className="text-primary text-xl">{money(total)} USD</strong></div><p className="text-xs text-slate-500 mt-4">Status: {booking.status} · Total from server. {isConfirmed ? "Payment verified." : "Awaiting Stripe webhook confirmation."}</p></section>
    <div className="flex flex-wrap gap-3 justify-between"><Link href="/" className="secondary-button">← Return to Discover</Link><button className="secondary-button" onClick={()=>window.print()}>Download / Print Receipt</button><Link href="/account/bookings" className="primary-button">View in My Bookings</Link></div></main>;
}
export function PaymentFailed(){
  const params = useParams() as {id?: string};
  const propertyId = params.id;
  const bookingId = typeof window!=='undefined' ? new URLSearchParams(window.location.search).get('booking_id') : null;
  const bookingParam = bookingId ? `?booking_id=${bookingId}` : '';
  const paymentLink = propertyId ? `/market/book/${propertyId}/payment${bookingParam}` : `/market/book/unknown/payment${bookingParam}`;
  const paymentMethodLink = propertyId ? `/market/book/${propertyId}/payment-method${bookingParam}` : `/market/book/unknown/payment-method${bookingParam}`;
  return <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-5"><div className="flex justify-start"><BackToPropertyButton /></div><section className="panel"><span className="text-error text-xs">⚠ Stripe Authorization Unsuccessful</span><h1 className="text-3xl font-semibold mt-3">Payment Couldn’t Be Completed</h1><p className="text-sm text-slate-500 mt-3">Your bank or card issuer was unable to authorize this transaction.</p><div className="p-5 bg-surface-container-low rounded-lg mt-5"><strong className="text-primary">Your booking has NOT been confirmed.</strong><p className="text-xs mt-2">No charges were made.</p></div></section><div className="grid md:grid-cols-2 gap-5"><section className="panel space-y-4"><h2 className="text-lg font-semibold">Choose Recovery Action</h2><Link href={paymentLink} className="primary-button w-full">Try Payment Again →</Link><Link href={paymentMethodLink} className="secondary-button w-full">Pay Cash on Arrival (USD) →</Link><Link href={`/`} className="block text-xs">‹ Return Home</Link></section></div></main>;
}
export function CashRequest({pending=false}:{pending?:boolean}){
  const {booking: ctxBooking} = useBooking();
  
  const bookingId = typeof window!=='undefined' ? new URLSearchParams(window.location.search).get('booking_id') : null;
  const [booking, setBooking] = useState<BookingResponse | null>(ctxBooking || null);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  useEffect(()=>{ if(!booking && bookingId){ getBooking(bookingId).then(setBooking).catch(()=>{}); } },[booking, bookingId]);
  useEffect(()=>{ if(booking){ getPublicProperty(String(booking.property_id)).then(setProperty).catch(()=>{}); } },[booking]);
  if (!booking) return <main className="booking-main"><div className="mb-4"><BackToPropertyButton /></div><div className="p-6 text-center">Loading cash booking…</div></main>;
  const total = Number(booking.total_price);
  return <main className="booking-main"><div className="mb-4"><BackToPropertyButton /></div><div className="booking-grid"><div className="space-y-5"><section className="panel border-t-4 border-primary"><span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full">⌛ Pending Owner Approval</span><h1 className="text-2xl font-semibold mt-4">{pending?'Pending Cash Booking':'Cash Booking Request Sent!'}</h1><p className="text-sm text-slate-500 mt-3">Your request {property ? `for ${property.title}` : ''} has been delivered. The owner has max 12h to review.</p></section><div className="p-5 rounded-xl bg-amber-50 text-amber-900 text-sm"><strong>Important: This booking is NOT confirmed yet.</strong><p className="mt-2">Your requested dates are temporarily held. Once approved, you will pay {money(total)} in cash directly to the owner upon check-in. Status: {booking.status}</p></div><section className="panel"><h2 className="font-semibold mb-5">Reservation Summary</h2><PropertyIdentity property={property} booking={booking}/><dl className="space-y-4 mt-6 text-sm"><div className="flex justify-between"><dt>Dates Requested</dt><dd>{booking.check_in} → {booking.check_out}</dd></div><div className="flex justify-between"><dt>Guests</dt><dd>{booking.guests}</dd></div><div className="flex justify-between"><dt>Payment Method</dt><dd>Cash on Arrival (USD)</dd></div><div className="flex justify-between p-4 bg-surface-container-low rounded-lg"><dt>Total to be paid in cash</dt><dd className="font-bold text-primary">{money(total)}</dd></div></dl></section><section className="panel"><h2 className="font-semibold mb-5">What Happens Next</h2><ol className="space-y-5 text-sm">{['Request Submitted — sent securely to host.','Host Review — owner reviews dates and party size.','Approval / Notification — you receive confirmation.','Check-in & Cash Handover — Pay the host upon arrival.'].map((step,index)=><li key={step} className="flex gap-3"><span className="w-6 h-6 shrink-0 bg-primary text-white rounded-full grid place-items-center text-xs">{index+1}</span>{step}</li>)}</ol></section><div className="flex gap-3 flex-wrap"><Link href="/account/bookings" className="primary-button">Go to My Bookings</Link><Link href="/search" className="secondary-button">Explore Other Chalets →</Link></div></div><div><div className="panel"><PropertyIdentity hero property={property} booking={booking}/></div></div></div></main>;
}
