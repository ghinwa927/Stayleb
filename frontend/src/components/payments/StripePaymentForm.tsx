"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type StripePaymentFormProps = {
  bookingId: number;
  propertyId?: string;
};

export default function StripePaymentForm({
  bookingId,
  propertyId,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!propertyId) {
      setErrorMessage("Property information is missing.");
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage("");

      const { error } = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url:
  `${window.location.origin}/market/book/${propertyId}/confirmed?booking_id=${bookingId}`,

},
      });

      if (error) {
        setErrorMessage(
          error.message ||
            "Payment could not be completed."
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Payment could not be completed."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <PaymentElement />

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="primary-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing
          ? "Processing payment..."
          : "Pay securely"}
      </button>

      <p className="text-[11px] text-slate-500 text-center">
        Payments are securely processed by Stripe.
      </p>
    </form>
  );
}