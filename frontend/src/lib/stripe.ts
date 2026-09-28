import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Null when the publishable key is not configured (e.g. Vercel env var
// missing). Callers must handle null and show a configuration error
// instead of crashing or pretending payment succeeded.
export const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;

export const isStripeConfigured = (): boolean => stripePromise !== null;