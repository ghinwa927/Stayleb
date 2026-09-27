"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";

import { useBooking, money } from "./BookingContext";
import { BackToPropertyButton } from "./BookingSummary";
import { stripePromise } from "@/lib/stripe";
import StripePaymentForm from "@/components/payments/StripePaymentForm";
import { Icon } from "@/components/ui/Icon";
import { LocalImage } from "@/components/ui/LocalImage";
import { getPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";

const HEADER_BG = "/images/stripe_payment.png";

// Local stepper for the Stripe payment page only (shared BookingProgress is left untouched
// so Stay Details / Price & Review steps keep their current rendering).
function StripePaymentStepper() {
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

function StripePaymentHeader({ propertyId }: { propertyId?: string }) {
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
          <StripePaymentStepper />
        </div>
      </div>
    </div>
  );
}

function StripePaymentShell({ propertyId, children }: { propertyId?: string; children: React.ReactNode }) {
  return (
    <main className="w-full min-h-screen bg-[#F4F7FB]">
      <div className="max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <StripePaymentHeader propertyId={propertyId} />
        {children}
      </div>
    </main>
  );
}

export function CardPayment() {
  const { booking, bookingLoading } = useBooking();

  const params = useParams() as {
    id?: string;
  };

  const propertyId = params.id;

  const [clientSecret, setClientSecret] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const [property, setProperty] = useState<PropertyResponse | null>(null);

  useEffect(() => {
    const secret = sessionStorage.getItem(
      "stayleb-stripe-client-secret"
    );

    const stripeBookingId = sessionStorage.getItem(
      "stayleb-stripe-booking-id"
    );

    if (!secret) {
      setError(
        "Stripe payment information is missing. Please return to payment method selection and try again."
      );

      return;
    }

    if (
      booking &&
      stripeBookingId &&
      String(booking.id) !== stripeBookingId
    ) {
      setError(
        "The Stripe payment does not match this booking."
      );

      return;
    }

    setClientSecret(secret);
  }, [booking]);

  // Property details for the summary card display (same service the booking summary uses).
  useEffect(() => {
    if (propertyId) getPublicProperty(propertyId).then(setProperty).catch(() => {});
  }, [propertyId]);

  const heroImage = property?.images?.find(i=>i.is_primary)?.image_url || property?.images?.[0]?.image_url;

  return (
    <StripePaymentShell propertyId={propertyId}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="space-y-5 lg:col-span-8 min-w-0">
          <div>
            <p className="text-[11.5px] text-[#46B1B1] font-bold uppercase tracking-[0.14em] mb-2">
              Secure transaction step
            </p>
            <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-[#1E293B]">
              Complete Your Payment
            </h1>
            <p className="text-[13.5px] text-[#64748B] mt-2 leading-relaxed">
              Your card information is securely collected and processed by Stripe.
            </p>
          </div>

          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 text-[12.5px] text-[#0E4E50] font-medium">
            <Icon name="lock" className="material-symbols-outlined text-[20px] text-[#157375] shrink-0" />
            <span className="flex-1">Secure payment powered by Stripe. Your payment details are encrypted and never stored by StayLeb.</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] shrink-0">
              Powered by
              <span className="px-1.5 py-0.5 rounded bg-[#635BFF] text-white text-[11px] font-extrabold italic leading-none">stripe</span>
            </span>
          </div>

          <div className="bg-white rounded-[20px] border-2 border-[#157375]/60 shadow-[0_8px_28px_rgba(21,115,117,0.12)] p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-2xl bg-[#46B1B1]/15 flex items-center justify-center shrink-0">
                  <Icon name="credit_card" className="material-symbols-outlined text-[26px] text-[#157375]" />
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold tracking-tight text-[#1E293B]">
                    Credit & Debit Card
                  </h2>
                  <p className="text-[12.5px] text-[#64748B] mt-0.5">
                    Complete your booking with secure card payment.
                  </p>
                </div>
              </div>
              <span aria-hidden="true" className="w-6 h-6 rounded-full border-2 border-[#157375] grid place-items-center shrink-0 mt-1">
                <span className="w-3 h-3 rounded-full bg-[#157375]" />
              </span>
            </div>

            {bookingLoading && (
              <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E3ECF3] text-sm text-[#64748B] flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#46B1B1] border-t-transparent rounded-full animate-spin" />
                Loading booking...
              </div>
            )}

            {!bookingLoading && error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            {!bookingLoading &&
              !error &&
              clientSecret &&
              booking && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,

                    appearance: {
                      theme: "stripe",

                      variables: {
                        colorPrimary: "#157375",
                        colorText: "#1E293B",
                        colorDanger: "#E11D48",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    bookingId={booking.id}
                    propertyId={propertyId}
                    totalLabel={money(booking.total_price)}
                  />
                </Elements>
              )}

            {booking && (
              <div className="p-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 text-[12.5px] space-y-1 text-[#475569]">
                <p className="flex items-center gap-1.5">
                  <Icon name="receipt_long" className="material-symbols-outlined text-[15px] text-[#157375]" />
                  Booking #{booking.id}
                </p>

                <p className="pl-6">
                  {booking.number_of_nights} night
                  {booking.number_of_nights !== 1
                    ? "s"
                    : ""}
                </p>

                <p className="pl-6 font-bold text-[#1E293B]">
                  Total: $
                  {Number(
                    booking.total_price
                  ).toFixed(2)}{" "}
                  USD
                </p>
              </div>
            )}

            <p className="text-[11px] text-[#64748B] text-center">
              Card details are securely handled by Stripe and
              are not stored by StayLeb.
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-3 text-[13px] font-semibold items-center">
            <Link
              href={`/market/book/${propertyId}/payment-method`}
              className="inline-flex items-center gap-1.5 text-[#1E293B] hover:text-[#157375] transition-colors"
            >
              <span aria-hidden="true">‹</span> Return to Payment Method Selection
            </Link>
            <BackToPropertyButton propertyId={propertyId} variant="compact" />
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
                {booking ? (
                  <>
                    <div className="mt-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                            <Icon name="calendar_month" className="material-symbols-outlined text-[15px] text-[#157375]" />Check-in
                          </p>
                          <p className="text-[13.5px] font-bold text-[#1E293B] mt-1">{booking.check_in}</p>
                        </div>
                        <div>
                          <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                            <Icon name="event" className="material-symbols-outlined text-[15px] text-[#157375]" />Check-out
                          </p>
                          <p className="text-[13.5px] font-bold text-[#1E293B] mt-1">{booking.check_out}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#46B1B1]/15 flex items-center gap-5 text-[13px] font-semibold text-[#1E293B]">
                        <span className="flex items-center gap-1.5">
                          <Icon name="bedtime" className="material-symbols-outlined text-[17px] text-[#157375]" />{booking.number_of_nights} night{booking.number_of_nights === 1 ? '' : 's'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="group" className="material-symbols-outlined text-[17px] text-[#157375]" />{booking.guests} guest{booking.guests === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-5 mb-2.5 flex items-center gap-1.5">
                      <Icon name="receipt_long" className="material-symbols-outlined text-[16px]" />Price breakdown
                    </h3>
                    <dl className="text-[13.5px] space-y-2">
                      <div className="flex justify-between text-[#475569]">
                        <dt>Chalet stay ({booking.number_of_nights} night{booking.number_of_nights === 1 ? '' : 's'})</dt>
                        <dd className="font-semibold text-[#1E293B]">{money(booking.total_price)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-[#46B1B1]/[0.12] to-[#157375]/[0.12] border border-[#46B1B1]/20">
                      <span className="font-extrabold text-[#1E293B] text-[14.5px]">Total</span>
                      <span className="text-[19px] font-extrabold text-[#157375]">{money(booking.total_price)}</span>
                    </div>
                    <p className="text-[11.5px] mt-3 text-[#64748B]">Calculated with seasonal rates · No hidden markup.</p>
                  </>
                ) : (
                  <div className="mt-4 space-y-2 animate-pulse" aria-hidden="true">
                    <div className="h-20 bg-[#F4F7FB] border border-[#E3ECF3] rounded-2xl" />
                    <div className="h-4 bg-[#EAF1F6] rounded w-full" />
                    <div className="h-14 bg-[#46B1B1]/10 border border-[#46B1B1]/15 rounded-2xl w-full" />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] p-5 flex gap-3">
              <span className="w-11 h-11 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="material-symbols-outlined text-[22px] text-[#157375]" />
              </span>
              <div>
                <strong className="text-[14px] font-extrabold text-[#1E293B]">StayLeb Payment Protection</strong>
                <p className="mt-1 text-[12.5px] text-[#64748B]">Your payment is securely processed through Stripe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StripePaymentShell>
  );
}
