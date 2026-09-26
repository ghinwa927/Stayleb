"use client";
import { apiFetch } from "@/services/api";

export type BookingCreatePayload = {
  property_id: number;
  check_in: string; // YYYY-MM-DD
  check_out: string;
  guests: number;
};

export type BookingResponse = {
  id: number;
  client_id: number;
  property_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  price_per_night: string;
  number_of_nights: number;
  total_price: string;
  status: string;
  expires_at: string | null;
  commission_percentage: string;
  commission_amount: string;
  owner_earnings: string;
  cancelled_at: string | null;
  cancellation_percentage: string | null;
  cancellation_fee: string | null;
  refund_amount: string | null;
  cancellation_commission_amount: string;
  owner_cancellation_earnings: string;
  created_at: string;
  updated_at: string;
};

export async function createBooking(payload: BookingCreatePayload): Promise<BookingResponse> {
  return apiFetch(`/bookings`, { method: "POST", body: JSON.stringify(payload) });
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  return apiFetch(`/bookings/my-bookings`);
}

export async function getBooking(id: number | string): Promise<BookingResponse> {
  return apiFetch(`/bookings/${id}`);
}

export async function cancelBooking(id: number | string): Promise<BookingResponse> {
  return apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" });
}

export async function getOwnerCashRequests(): Promise<BookingResponse[]> {
  return apiFetch(`/bookings/owner/cash-requests`);
}

export async function getPropertyBookings(propertyId: number | string): Promise<BookingResponse[]> {
  return apiFetch(`/bookings/property/${propertyId}`);
}

export async function approveBooking(id: number | string): Promise<BookingResponse> {
  return apiFetch(`/bookings/${id}/approve`, { method: "PATCH" });
}

export async function rejectBooking(id: number | string): Promise<BookingResponse> {
  return apiFetch(`/bookings/${id}/reject`, { method: "PATCH" });
}

export type BookingPreviewResponse = {
  property_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  price_per_night: string;
  number_of_nights: number;
  total_price: string;
  commission_percentage: string;
  commission_amount: string;
  owner_earnings: string;
  nightly_breakdown: {
    date: string;
    price: string;
    pricing_source: "base" | "seasonal";
    season_name: string | null;
  }[];
};

export async function previewBooking(payload: BookingCreatePayload): Promise<BookingPreviewResponse> {
  return apiFetch(`/bookings/preview`, { method: "POST", body: JSON.stringify(payload) });
}
