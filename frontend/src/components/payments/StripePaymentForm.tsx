"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Icon } from "@/components/ui/Icon";

type StripePaymentFormProps = {
  bookingId: number;
  propertyId?: string;
  totalLabel?: string;
};

export default function StripePaymentForm({
  bookingId,
  propertyId,
  totalLabel,
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
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#157375] to-[#46B1B1] hover:from-[#0E4E50] hover:to-[#157375] text-white font-bold text-[15px] shadow-[0_10px_24px_rgba(21,115,117,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing
          ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing payment...
            </>
          )
          : (
            <>
              <Icon name="lock" className="material-symbols-outlined text-white text-[18px]" />
              <span>Pay securely{totalLabel ? ` ${totalLabel}` : ""}</span>
              <Icon name="arrow_forward" className="material-symbols-outlined text-white text-[19px]" />
            </>
          )}
      </button>

      <p className="text-[11px] text-slate-500 text-center">
        Payments are securely processed by Stripe.
      </p>
    </form>
  );
}