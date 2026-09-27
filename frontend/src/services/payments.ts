"use client";
import { apiFetch } from "@/services/api";

export type PaymentResponse = {
  id: number;
  booking_id: number;
  amount: string;
  payment_method: string;
  payment_status: string;
  stripe_payment_id: string | null;
  stripe_refund_id: string | null;
  refunded_amount: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StripePaymentResponse = {
  payment: PaymentResponse;
  client_secret: string;
};

export async function createCashPayment(bookingId: number | string): Promise<PaymentResponse> {
  return apiFetch(`/payments/bookings/${bookingId}`, { method: "POST", body: JSON.stringify({ payment_method: "cash" }) });
}

export async function createStripePayment(bookingId: number | string): Promise<StripePaymentResponse> {
  return apiFetch(`/payments/bookings/${bookingId}/stripe`, { method: "POST" });
}

export async function getPaymentByBooking(bookingId: number | string): Promise<PaymentResponse> {
  return apiFetch(`/payments/bookings/${bookingId}`, {
    method: "GET",
  });
}

export async function markCashPaymentPaid(bookingId: number | string): Promise<PaymentResponse> {
  return apiFetch(`/payments/bookings/${bookingId}/mark-paid`, {
    method: "PATCH",
  });
}
