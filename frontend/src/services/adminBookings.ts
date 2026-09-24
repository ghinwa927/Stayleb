"use client";
import { apiFetch } from "@/services/api";

export type AdminBookingClient = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
};

export type AdminBookingProperty = {
  id: number;
  title: string;
  location: string;
};

export type AdminBookingPayment = {
  id: number;
  amount: string;
  payment_method: string;
  payment_status: string;
  stripe_payment_id: string | null;
  stripe_refund_id: string | null;
  refunded_amount: string;
  paid_at: string | null;
};

export type AdminBooking = {
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
  client: AdminBookingClient;
  property: AdminBookingProperty;
  payment: AdminBookingPayment | null;
};

export type AdminBookingListResponse = {
  items: AdminBooking[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type AdminBookingFilters = {
  booking_status?: string;
  payment_method?: string;
  payment_status?: string;
  search?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  page?: number;
  page_size?: number;
};

export type AdminBookingStatsBreakdown = {
  period: string;
  total_bookings: number;
  gross_booking_volume: string;
  platform_commission: string;
  owner_earnings: string;
};

export type AdminBookingStats = {
  total_bookings: number;
  gross_booking_volume: string;
  platform_commission: string;
  owner_earnings: string;
  stripe_gross: string;
  cash_gross: string;
  pending_cash_commission: string;
  pending_cash_bookings: number;
  booking_statuses: {
    pending: number;
    confirmed: number;
    cancelled: number;
    rejected: number;
    completed: number;
  };
  breakdown: AdminBookingStatsBreakdown[];
};

export type AdminBookingStatsParams = {
  from_date?: string;
  to_date?: string;
  property_id?: number;
  group_by?: "day" | "month";
};

export async function getAdminBookings(filters: AdminBookingFilters = {}): Promise<AdminBookingListResponse> {
  const params = new URLSearchParams();
  if (filters.booking_status) params.set("booking_status", filters.booking_status);
  if (filters.payment_method) params.set("payment_method", filters.payment_method);
  if (filters.payment_status) params.set("payment_status", filters.payment_status);
  if (filters.search) params.set("search", filters.search);
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/admin/bookings${qs}`);
}

export async function getAdminBookingStats(params?: AdminBookingStatsParams): Promise<AdminBookingStats> {
  const qs = new URLSearchParams();
  if (params?.from_date) qs.set("from_date", params.from_date);
  if (params?.to_date) qs.set("to_date", params.to_date);
  if (params?.property_id) qs.set("property_id", String(params.property_id));
  if (params?.group_by) qs.set("group_by", params.group_by);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/admin/bookings/stats${suffix}`);
}
