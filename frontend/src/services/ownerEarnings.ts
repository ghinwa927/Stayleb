"use client";
import { apiFetch } from "@/services/api";

export type OwnerDecimal = number | string;

export type OwnerEarningsBookingStatuses = {
  pending: number;
  confirmed: number;
  cancelled: number;
  rejected: number;
  completed: number;
};

export type OwnerEarningsBreakdownItem = {
  period: string;
  total_bookings: number;
  gross_booking_volume: OwnerDecimal;
  platform_commission: OwnerDecimal;
  owner_earnings: OwnerDecimal;
};

export type OwnerEarningsResponse = {
  total_bookings: number;
  gross_revenue: OwnerDecimal;
  platform_commission: OwnerDecimal;
  owner_earnings: OwnerDecimal;
  stripe_revenue: OwnerDecimal;
  cash_revenue: OwnerDecimal;
  outstanding_cash_commission: OwnerDecimal;
  pending_cash_commission_bookings: number;
  booking_statuses: OwnerEarningsBookingStatuses;
  breakdown: OwnerEarningsBreakdownItem[];
};

export type OwnerEarningsFilters = {
  from_date?: string;
  to_date?: string;
  property_id?: number;
  group_by?: "day" | "month";
};

export type OwnerEarningsLedgerItem = {
  booking_id: number;
  property_id: number;
  property_title: string;
  check_in: string;
  check_out: string;
  number_of_nights: number;
  booking_status: string;
  payment_method: string | null;
  payment_status: string | null;
  gross_booking_volume: OwnerDecimal;
  platform_commission: OwnerDecimal;
  owner_earnings: OwnerDecimal;
};

export type OwnerEarningsLedgerResponse = {
  items: OwnerEarningsLedgerItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type OwnerEarningsLedgerFilters = {
  from_date?: string;
  to_date?: string;
  property_id?: number;
  page?: number;
  page_size?: number;
};

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getOwnerEarnings(filters: OwnerEarningsFilters = {}): Promise<OwnerEarningsResponse> {
  const query = queryString({
    from_date: filters.from_date,
    to_date: filters.to_date,
    property_id: filters.property_id,
    group_by: filters.group_by,
  });
  return apiFetch(`/owner/earnings${query}`);
}

export async function getOwnerEarningsLedger(filters: OwnerEarningsLedgerFilters = {}): Promise<OwnerEarningsLedgerResponse> {
  const query = queryString({
    from_date: filters.from_date,
    to_date: filters.to_date,
    property_id: filters.property_id,
    page: filters.page,
    page_size: filters.page_size,
  });
  return apiFetch(`/owner/earnings/ledger${query}`);
}
