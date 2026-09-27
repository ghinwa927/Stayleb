"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { useBooking, money } from "./BookingContext";
import { BackToPropertyButton } from "./BookingSummary";
import { Icon } from "@/components/ui/Icon";
import { LocalImage } from "@/components/ui/LocalImage";
import {
  createCashPayment,
  createStripePayment,
} from "@/services/payments";
import { createBooking, previewBooking, type BookingPreviewResponse } from "@/services/bookings";
import { getPaymentByBooking } from "@/services/payments";
import { getPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";

const HEADER_BG = "/images/payment_method.png";

// Local stepper for the Payment Method page only (shared BookingProgress is left untouched
// so Stay Details / Price & Review steps keep their current rendering).
function PaymentMethodStepper() {
  return (
    <ol aria-label="Booking progress" className="flex items-center gap-1.5 sm:gap-2.5 text-[12px] font-semibold overflow-x-auto whitespace-nowrap py-1">
      <li className="flex items-center gap-1.5 shrink-0">
        <span className="w-6 h-6 rounded-full bg-[#46B1B1] text-white grid place-items-center shadow-sm">
          <Icon name="check" className="material-symbols-outlined text-[15px]" />
        </span>
        <span className="text-[#157375]">Stay Details</span>
      </li>
      <span aria-hidden="true" className="w-6 sm:w-10 h-px bg-[#157375]/50 shrink-0" />
      <li className="flex items-center gap-1.5 shrink-0">
        <span className="w-6 h-6 rounded-full bg-[#46B1B1] text-white grid place-items-center shadow-sm">
          <Icon name="check" className="material-symbols-outlined text-[15px]" />
        </span>
        <span className="text-[#157375]">Price & Review</span>
      </li>
      <span aria-hidden="true" className="w-6 sm:w-10 h-px bg-[#157375]/50 shrink-0" />
      <li className="flex items-center gap-1.5 shrink-0" aria-current="step">
        <span className="w-6 h-6 rounded-full bg-[#157375] text-white grid place-items-center font-bold text-[11px] shadow-[0_0_0_4px_rgba(21,115,117,0.15)]">
          3
        </span>
        <span className="text-[#1E293B] font-bold">Payment</span>
      </li>
    </ol>
  );
}

function PaymentMethodHeader({ propertyId }: { propertyId?: string }) {
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
          <PaymentMethodStepper />
        </div>
      </div>
    </div>
  );
}

function PaymentMethodShell({ propertyId, children }: { propertyId?: string; children: React.ReactNode }) {
  return (
    <main className="w-full min-h-screen bg-[#F4F7FB]">
      <div className="max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <PaymentMethodHeader propertyId={propertyId} />
        {children}
      </div>
    </main>
  );
}

export function PaymentMethod() {
  const { booking, setBooking, draft, setDraft, preview: ctxPreview, setPreview: setCtxPreview, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining } = useBooking();

  const params = useParams() as { id?: string };
  const router = useRouter();

  const [method, setMethod] = useState<"Card" | "Cash">("Card");
  const [loading, setLoading] = useState(false);
  const [focusedMethod, setFocusedMethod] = useState<"Card" | "Cash" | null>(null);
  const [preview, setPreview] = useState<BookingPreviewResponse | null>(ctxPreview);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [property, setProperty] = useState<PropertyResponse | null>(null);

  const propertyId = params.id;

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

  const [mounted, setMounted] = useState(false);
  const [expiresAtSeconds, setExpiresAtSeconds] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  useEffect(()=>{ setMounted(true); },[]);
  useEffect(()=>{
    if(queryDraft && (!draft || draft.propertyId !== propertyId || draft.checkIn !== queryDraft.checkIn || draft.checkOut !== queryDraft.checkOut || draft.guests !== queryDraft.guests)){
      setDraft(queryDraft as any);
    }
  },[queryDraft, draft, propertyId]);

  useEffect(()=>{ if(ctxPreview) setPreview(ctxPreview); },[ctxPreview]);

  // Property details for the summary card display (same service the booking summary uses).
  useEffect(()=>{ if(propertyId) getPublicProperty(propertyId).then(setProperty).catch(()=>{}); },[propertyId]);

  // Fetch preview for total display (server-calculated) - reuse context preview if available
  useEffect(()=>{
    if(!effectiveDraft || booking) return;
    if(ctxPreview && ctxPreview.property_id === Number(propertyId) && ctxPreview.check_in === effectiveDraft.checkIn && ctxPreview.check_out === effectiveDraft.checkOut && ctxPreview.guests === effectiveDraft.guests){
      setPreview(ctxPreview);
      return;
    }
    setPreviewLoading(true);
    previewBooking({
      property_id: Number(propertyId),
      check_in: effectiveDraft.checkIn,
      check_out: effectiveDraft.checkOut,
      guests: effectiveDraft.guests
    }).then(p=>{ setPreview(p); setCtxPreview(p); }).catch(()=>{}).finally(()=>setPreviewLoading(false));
  },[effectiveDraft, propertyId, booking]);

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

  const total = booking ? Number(booking.total_price) : preview ? Number(preview.total_price) : 0;
  // bookingId for display/navigation after creation
  const existingBookingId = booking ? String(booking.id) : null;

  // Display-only summary values (booking → server preview → draft, same precedence as total).
  const summary = booking
    ? { checkIn: booking.check_in, checkOut: booking.check_out, nights: booking.number_of_nights, guests: booking.guests }
    : preview
      ? { checkIn: preview.check_in, checkOut: preview.check_out, nights: preview.number_of_nights, guests: preview.guests }
      : effectiveDraft
        ? {
            checkIn: effectiveDraft.checkIn,
            checkOut: effectiveDraft.checkOut,
            nights: Math.max(0, Math.round((Date.parse(effectiveDraft.checkOut) - Date.parse(effectiveDraft.checkIn)) / 86400000)),
            guests: effectiveDraft.guests,
          }
        : null;
  const heroImage = property?.images?.find(i=>i.is_primary)?.image_url || property?.images?.[0]?.image_url;
  const railLoading = !booking && !preview && (previewLoading || !effectiveDraft);

  if (!mounted) {
    return <PaymentMethodShell propertyId={propertyId}><div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6 text-center"><p className="text-sm text-[#64748B]">Loading booking details…</p></div></PaymentMethodShell>;
  }

  // If no draft and no booking, prompt to go back to stay details
  if (!effectiveDraft && !booking) {
    return (
      <PaymentMethodShell propertyId={propertyId}>
        <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-sm p-6 text-center">
          <p className="text-sm text-[#64748B]">
            No stay details found.
          </p>
          <p className="text-xs text-[#64748B] mt-2">Please select dates and guests first. No booking has been created yet.</p>
          <Link href={`/properties/${propertyId}`} className="text-primary text-sm underline mt-4 inline-block">Back to Property Details</Link>
        </div>
      </PaymentMethodShell>
    );
  }

  const handleContinue = async () => {
    if (!propertyId) {
      await Swal.fire({
        title: "Property not found",
        text: "The property information is missing.",
        icon: "error",
      });
      return;
    }
    if (!effectiveDraft && !booking) {
      await Swal.fire({
        title: "No stay details",
        text: "Please select check-in, check-out and guests before choosing a payment method.",
        icon: "warning",
      });
      router.push(`/properties/${propertyId}`);
      return;
    }

    // Prevent double submission
    if (loading) return;
    setLoading(true);

    try {
      // === Ensure booking exists, create only on explicit payment commit ===
      let bookingId: string;
      let activeBooking = booking;
      if (activeBooking) {
        bookingId = String(activeBooking.id);
      } else if (effectiveDraft) {
        // Create booking now (first time user commits to payment)
        const newBooking = await createBooking({
          property_id: Number(propertyId),
          check_in: effectiveDraft.checkIn,
          check_out: effectiveDraft.checkOut,
          guests: effectiveDraft.guests,
        });
        // Store for duplicate protection & future navigation
        setBooking(newBooking);
        try{
          sessionStorage.setItem('stayleb-latest-booking-id', String(newBooking.id));
          sessionStorage.setItem('stayleb-latest-booking', JSON.stringify(newBooking));
          localStorage.setItem('stayleb-latest-booking-id', String(newBooking.id));
        }catch{}
        activeBooking = newBooking;
        bookingId = String(newBooking.id);
      } else {
        throw new Error("Missing booking data");
      }

      // =========================
      // CASH
      // =========================
      if (method === "Cash") {
        try {
          await createCashPayment(bookingId);
        } catch (payErr) {
          // Booking succeeded but payment failed - show error, keep booking for retry
          // Do not navigate to success; allow retry without creating new booking
          throw payErr;
        }
        router.push(`/market/book/${propertyId}/request-sent?booking_id=${bookingId}`);
        return;
      }

      // =========================
      // STRIPE
      // =========================
      // Backend supports retry: if payment exists and failed, createStripePayment creates new PaymentIntent
      // and returns new client_secret. We just call it and handle the response.
      let response;
      try {
        response = await createStripePayment(bookingId);
      } catch (stripeErr) {
        throw stripeErr;
      }

      if (!response.client_secret) {
        throw new Error("Stripe did not return a client secret.");
      }

      sessionStorage.setItem("stayleb-stripe-client-secret", response.client_secret);
      sessionStorage.setItem("stayleb-stripe-booking-id", bookingId);

      router.push(`/market/book/${propertyId}/payment?booking_id=${bookingId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Payment could not be initialized.";
      // Handle availability conflict specifically
      if (msg.toLowerCase().includes("already booked") || msg.toLowerCase().includes("unavailable") || msg.toLowerCase().includes("409")) {
        await Swal.fire({
          title: "Dates unavailable",
          text: msg + " The selected dates became unavailable. Please choose different dates.",
          icon: "warning",
        });
        // Optionally clear draft? Keep so user can change dates
      } else {
        await Swal.fire({
          title: method === "Card" ? "Stripe init failed" : "Cash payment failed",
          text: msg,
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTempHold = booking && isTemporaryCheckoutHold(booking);
  const ctaDisabled = loading || railLoading;

  return (
    <PaymentMethodShell propertyId={propertyId}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="lg:col-span-8 min-w-0">
          <p className="text-[11.5px] text-[#46B1B1] font-bold uppercase tracking-[0.14em] mb-2">
            Secure transaction step
          </p>

          <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-[#1E293B]">
            Select How You Would Like to Pay
          </h1>

          <p className="text-[13.5px] text-[#64748B] mt-2 mb-6 leading-relaxed">
            Choose between immediate confirmation via Stripe
            or a cash booking request requiring owner approval.
          </p>

          {isTempHold && expiresAtSeconds !== null && expiresAtSeconds > 0 && (
            <div className="mb-5 p-4 rounded-[20px] bg-white border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50">
                <Icon name="schedule" className="material-symbols-outlined text-amber-700 text-[22px]" />
                <div>
                  <p className="font-semibold text-amber-800 text-[13.5px]">Complete your booking within <span className="font-mono text-lg">{formatCountdown(expiresAtSeconds)}</span></p>
                  <p className="text-xs text-amber-700">This temporary hold expires automatically. Your dates will be released if not confirmed.</p>
                </div>
              </div>
            </div>
          )}

          <fieldset className="space-y-4">
            <legend className="sr-only">
              Payment method
            </legend>

            {(["Card", "Cash"] as const).map((m) => {
              const selected = method === m;
              const isCard = m === "Card";
              return (
                <label
                  key={m}
                  className={`block cursor-pointer rounded-[20px] border-2 p-5 sm:p-6 transition-all ${
                    selected
                      ? isCard
                        ? "border-[#157375] bg-gradient-to-br from-[#46B1B1]/[0.10] to-[#157375]/[0.10] shadow-[0_8px_28px_rgba(21,115,117,0.16)]"
                        : "border-amber-500/70 bg-[#FFFBEB] shadow-[0_8px_28px_rgba(217,119,6,0.14)]"
                      : "border-[#E3ECF3] bg-white hover:border-[#46B1B1]/40 hover:shadow-[0_4px_18px_rgba(21,115,117,0.08)]"
                  } ${focusedMethod === m ? "ring-2 ring-[#157375] ring-offset-2" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selected}
                    onChange={() => setMethod(m)}
                    onFocus={() => setFocusedMethod(m)}
                    onBlur={() => setFocusedMethod(null)}
                    aria-label={isCard ? "Pay Online with Stripe" : "Pay Cash upon Arrival"}
                    className="sr-only"
                  />
                  <div className="flex gap-4">
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCard ? "bg-[#46B1B1]/15" : "bg-amber-100"
                    }`}>
                      <Icon
                        name={isCard ? "credit_card" : "payments"}
                        className={`material-symbols-outlined text-[26px] ${isCard ? "text-[#157375]" : "text-amber-600"}`}
                      />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <strong className="text-[17px] font-extrabold tracking-tight text-[#1E293B]">
                          {isCard ? "Pay Online with Stripe" : "Pay Cash upon Arrival"}
                        </strong>
                        <span
                          aria-hidden="true"
                          className={`w-6 h-6 rounded-full border-2 grid place-items-center shrink-0 mt-0.5 transition-colors ${
                            selected
                              ? isCard
                                ? "border-[#157375]"
                                : "border-amber-500"
                              : "border-[#CBD5E1] bg-white"
                          }`}
                        >
                          {selected && (
                            <span className={`w-3 h-3 rounded-full ${isCard ? "bg-[#157375]" : "bg-amber-500"}`} />
                          )}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11.5px] font-bold ${
                          isCard
                            ? "bg-[#46B1B1]/15 text-[#157375]"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <Icon name={isCard ? "bolt" : "person"} className="material-symbols-outlined text-[14px]" />
                        {isCard ? "Instant Confirmation" : "Host Approval Required"}
                      </span>

                      <p className="text-[13px] text-[#64748B] mt-2.5 leading-relaxed">
                        {isCard
                          ? "Pay securely online. Your reservation is confirmed after Stripe verifies the payment."
                          : "Send a reservation request for owner approval."}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2.5 sm:pl-16">
                    {(isCard
                      ? [
                          "Secure Stripe payment",
                          "Automatic payment verification",
                          "Booking confirmation after successful payment",
                        ]
                      : [
                          "Pay USD directly at check-in",
                          "Booking remains pending",
                          "Owner approval required",
                        ]
                    ).map((text) => (
                      <li key={text} className="flex items-center gap-2.5 text-[13px] font-medium text-[#1E293B]">
                        <span className={`w-5 h-5 rounded-full grid place-items-center shrink-0 ${isCard ? "bg-[#157375]" : "bg-amber-100"}`}>
                          <Icon name="check" className={`material-symbols-outlined text-[13px] font-bold ${isCard ? "text-white" : "text-amber-600"}`} />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </label>
              );
            })}
          </fieldset>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-7 text-[13.5px] font-semibold">
            <Link
              href={`/market/book/${propertyId}/summary`}
              className="inline-flex items-center gap-1.5 text-[#1E293B] hover:text-[#157375] transition-colors"
            >
              <span aria-hidden="true">←</span> Back to Trip Details
            </Link>
            <span aria-hidden="true" className="text-[#CBD5E1]">|</span>
            <BackToPropertyButton propertyId={propertyId} variant="compact" />
          </div>

          <button
            disabled={ctaDisabled}
            onClick={handleContinue}
            className={`mt-4 w-full py-4 px-6 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 group ${
              method === "Card"
                ? "bg-gradient-to-r from-[#157375] to-[#46B1B1] hover:from-[#0E4E50] hover:to-[#157375] text-white shadow-[0_10px_24px_rgba(21,115,117,0.35)]"
                : "bg-gradient-to-r from-[#157375] to-[#46B1B1] hover:from-[#0E4E50] hover:to-[#157375] text-white shadow-[0_10px_24px_rgba(21,115,117,0.35)]"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : method === "Card"
              ? (
                <>
                  <span>Continue to Secure Payment ({money(total)})</span>
                  <Icon name="arrow_forward" className="material-symbols-outlined text-white text-[20px] transition-transform group-hover:translate-x-1" />
                </>
              )
              : (
                <span>Send Cash Booking Request →</span>
              )}
          </button>
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
                {summary ? (
                  <div className="mt-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                          <Icon name="calendar_month" className="material-symbols-outlined text-[15px] text-[#157375]" />Check-in
                        </p>
                        <p className="text-[13.5px] font-bold text-[#1E293B] mt-1">{summary.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                          <Icon name="event" className="material-symbols-outlined text-[15px] text-[#157375]" />Check-out
                        </p>
                        <p className="text-[13.5px] font-bold text-[#1E293B] mt-1">{summary.checkOut}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#46B1B1]/15 flex items-center gap-5 text-[13px] font-semibold text-[#1E293B]">
                      <span className="flex items-center gap-1.5">
                        <Icon name="bedtime" className="material-symbols-outlined text-[17px] text-[#157375]" />{summary.nights} night{summary.nights === 1 ? '' : 's'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="group" className="material-symbols-outlined text-[17px] text-[#157375]" />{summary.guests} guest{summary.guests === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 h-24 bg-[#F4F7FB] border border-[#E3ECF3] rounded-2xl animate-pulse" />
                )}
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-5 mb-2.5 flex items-center gap-1.5">
                  <Icon name="receipt_long" className="material-symbols-outlined text-[16px]" />Price breakdown
                </h3>
                {railLoading ? (
                  <div className="space-y-2 animate-pulse" aria-hidden="true">
                    <div className="h-4 bg-[#EAF1F6] rounded w-full" />
                    <div className="h-14 bg-[#46B1B1]/10 border border-[#46B1B1]/15 rounded-2xl w-full" />
                  </div>
                ) : (
                  <>
                    <dl className="text-[13.5px] space-y-2">
                      <div className="flex justify-between text-[#475569]">
                        <dt>Chalet stay ({summary?.nights ?? 0} night{(summary?.nights ?? 0) === 1 ? '' : 's'})</dt>
                        <dd className="font-semibold text-[#1E293B]">{money(total)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-[#46B1B1]/[0.12] to-[#157375]/[0.12] border border-[#46B1B1]/20">
                      <span className="font-extrabold text-[#1E293B] text-[14.5px]">Total</span>
                      <span className="text-[19px] font-extrabold text-[#157375]">{money(total)}</span>
                    </div>
                  </>
                )}
                <p className="text-[11.5px] mt-3 text-[#64748B]">Calculated with seasonal rates · No hidden markup.</p>
                {!booking && <p className="text-[11.5px] text-[#64748B]">No booking created yet.</p>}
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 flex gap-3">
              <span className="w-11 h-11 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="material-symbols-outlined text-[22px] text-[#157375]" />
              </span>
              <div>
                <strong className="text-[14px] font-extrabold text-[#1E293B]">StayLeb Payment Protection</strong>
                <p className="mt-1 text-[12.5px] text-[#64748B]">Your payment is protected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PaymentMethodShell>
  );
}
