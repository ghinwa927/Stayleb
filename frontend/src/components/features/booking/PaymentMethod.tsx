"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { useBooking, money } from "./BookingContext";
import { BookingSummary, BookingProgress, BackToPropertyButton } from "./BookingSummary";
import { Icon } from "@/components/ui/Icon";
import {
  createCashPayment,
  createStripePayment,
} from "@/services/payments";
import { createBooking, previewBooking, type BookingPreviewResponse } from "@/services/bookings";
import { getPaymentByBooking } from "@/services/payments";

export function PaymentMethod() {
  const { booking, setBooking, draft, setDraft, preview: ctxPreview, setPreview: setCtxPreview, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining } = useBooking();

  const params = useParams() as { id?: string };
  const router = useRouter();

  const [method, setMethod] = useState<"Card" | "Cash">("Card");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<BookingPreviewResponse | null>(ctxPreview);

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

  // Fetch preview for total display (server-calculated) - reuse context preview if available
  useEffect(()=>{
    if(!effectiveDraft || booking) return;
    if(ctxPreview && ctxPreview.property_id === Number(propertyId) && ctxPreview.check_in === effectiveDraft.checkIn && ctxPreview.check_out === effectiveDraft.checkOut && ctxPreview.guests === effectiveDraft.guests){
      setPreview(ctxPreview);
      return;
    }
    previewBooking({
      property_id: Number(propertyId),
      check_in: effectiveDraft.checkIn,
      check_out: effectiveDraft.checkOut,
      guests: effectiveDraft.guests
    }).then(p=>{ setPreview(p); setCtxPreview(p); }).catch(()=>{});
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

  if (!mounted) {
    return <main className="booking-main"><div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div><BookingProgress step={3} /><div className="panel p-6 text-center"><p className="text-sm text-slate-500">Loading booking details…</p></div></main>;
  }

  // If no draft and no booking, prompt to go back to stay details
  if (!effectiveDraft && !booking) {
    return (
      <main className="booking-main">
        <div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div>
        <BookingProgress step={3} />
        <div className="panel p-6 text-center">
          <p className="text-sm text-slate-500">
            No stay details found.
          </p>
          <p className="text-xs text-slate-500 mt-2">Please select dates and guests first. No booking has been created yet.</p>
          <Link href={`/properties/${propertyId}`} className="text-primary text-sm underline mt-4 inline-block">Back to Property Details</Link>
        </div>
      </main>
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

  return (
    <main className="booking-main">
      <div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div>
      <BookingProgress step={3} />

      <div className="booking-grid">
        <div>
          <p className="text-xs text-primary uppercase tracking-wider mb-2">
            Secure transaction step
          </p>

          <h1 className="text-3xl font-semibold">
            Select How You Would Like to Pay
          </h1>

          <p className="text-sm text-slate-500 mt-3 mb-6">
            Choose between immediate confirmation via Stripe
            or a cash booking request requiring owner approval.
          </p>

          {isTempHold && expiresAtSeconds !== null && expiresAtSeconds > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <Icon name="schedule" className="material-symbols-outlined text-amber-700 text-[22px]" />
                <div>
                  <p className="font-semibold text-amber-800">Complete your booking within <span className="font-mono text-lg">{formatCountdown(expiresAtSeconds)}</span></p>
                  <p className="text-xs text-amber-700">This temporary hold expires automatically. Your dates will be released if not confirmed.</p>
                </div>
              </div>
            </div>
          )}

          <fieldset className="space-y-4">
            <legend className="sr-only">
              Payment method
            </legend>

            {(["Card", "Cash"] as const).map((m) => (
              <label
                key={m}
                className={`panel block cursor-pointer border-2 ${
                  method === m
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <div className="flex gap-3">
                  <Icon
                    name={
                      m === "Card"
                        ? "credit_card"
                        : "payments"
                    }
                    className={
                      m === "Card"
                        ? "text-primary"
                        : "text-amber-600"
                    }
                  />

                  <div className="flex-1">
                    <strong>
                      {m === "Card"
                        ? "Pay Online with Stripe"
                        : "Pay Cash upon Arrival"}
                    </strong>

                    <span
                      className={`block text-xs mt-2 ${
                        m === "Card"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {m === "Card"
                        ? "Instant Automated Confirmation"
                        : "Host Approval Required"}
                    </span>

                    <p className="text-xs text-slate-500 mt-3">
                      {m === "Card"
                        ? "Pay securely online. Your reservation is confirmed after Stripe verifies the payment."
                        : "Send a reservation request for owner approval."}
                    </p>
                  </div>

                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={method === m}
                    onChange={() => setMethod(m)}
                    className="accent-teal-700"
                  />
                </div>

                <ul className="mt-5 text-xs space-y-2 pl-9">
                  {(m === "Card"
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
                    <li key={text}>✓ {text}</li>
                  ))}
                </ul>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-wrap justify-between gap-4 mt-7 items-center">
            <div className="flex flex-wrap gap-3 items-center">
              <Link
  href={`/market/book/${propertyId}/summary`}
>
                ← Back to Trip Details
              </Link>
              <span className="text-slate-300">|</span>
              <BackToPropertyButton propertyId={propertyId} variant="compact" />
            </div>

            <button
              disabled={loading}
              onClick={handleContinue}
              className="primary-button"
            >
              {loading
                ? "Processing…"
                : method === "Card"
                  ? `Continue to Secure Payment (${money(total)})`
                  : "Send Cash Booking Request →"}
            </button>
          </div>
        </div>

        <BookingSummary preview={preview} draft={effectiveDraft} />
      </div>
    </main>
  );
}