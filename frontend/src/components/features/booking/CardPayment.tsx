"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";

import { useBooking } from "./BookingContext";
import { BookingSummary, BookingProgress, BackToPropertyButton } from "./BookingSummary";
import { stripePromise } from "@/lib/stripe";
import StripePaymentForm from "@/components/payments/StripePaymentForm";

export function CardPayment() {
  const { booking, bookingLoading } = useBooking();

  const params = useParams() as {
    id?: string;
  };

  const propertyId = params.id;

  const [clientSecret, setClientSecret] =
    useState<string | null>(null);

  const [error, setError] = useState("");

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

  return (
    <main className="booking-main">
      <div className="mb-4"><BackToPropertyButton propertyId={propertyId} /></div>
      <BookingProgress step={3} />

      <div className="booking-grid">
        <div className="space-y-5">

          <div className="bg-surface-container-low p-4 rounded-lg text-xs text-primary">
            Secure payment powered by Stripe. Your card
            information is securely collected and processed by
            Stripe.
          </div>

          <div className="panel space-y-5">
            <div>
              <h1 className="text-xl font-semibold">
                Credit & Debit Card
              </h1>

              <p className="text-xs text-slate-500 mt-1">
                Complete your booking with secure card payment.
              </p>
            </div>

            {bookingLoading && (
              <div className="p-4 rounded-lg bg-surface-container-low text-sm text-slate-600">
                Loading booking...
              </div>
            )}

            {!bookingLoading && error && (
              <div className="p-4 rounded-lg bg-red-50 text-sm text-red-600">
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
                  />
                </Elements>
              )}

            {booking && (
              <div className="p-4 rounded-lg bg-surface-container-low text-xs space-y-1">
                <p>
                  Booking #{booking.id}
                </p>

                <p>
                  {booking.number_of_nights} night
                  {booking.number_of_nights !== 1
                    ? "s"
                    : ""}
                </p>

                <p className="font-semibold">
                  Total: $
                  {Number(
                    booking.total_price
                  ).toFixed(2)}{" "}
                  USD
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-500 text-center">
              Card details are securely handled by Stripe and
              are not stored by StayLeb.
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-3 text-xs items-center">
            <Link
  href={`/market/book/${propertyId}/payment-method`}
>
              ‹ Return to Payment Method Selection
            </Link>
            <BackToPropertyButton propertyId={propertyId} variant="compact" />
          </div>
        </div>

        <BookingSummary />
      </div>
    </main>
  );
}