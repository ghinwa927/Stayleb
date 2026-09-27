"use client";
import { apiFetch } from "@/services/api";
import type { OwnerDecimal } from "@/services/ownerEarnings";

export type OwnerSettlementOwner = {
  id: number;
  full_name: string;
  email: string;
};

export type OwnerSettlementProperty = {
  id: number;
  title: string;
  location: string;
};

export type OwnerSettlement = {
  id: number;
  booking_id: number;
  owner_id: number;
  commission_amount: OwnerDecimal;
  status: "unpaid" | "paid";
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  owner: OwnerSettlementOwner;
  property: OwnerSettlementProperty;
};

export type OwnerSettlementListResponse = {
  items: OwnerSettlement[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type OwnerSettlementStatsResponse = {
  total_settlements: number;
  unpaid_count: number;
  paid_count: number;
  outstanding_commission: OwnerDecimal;
  settled_commission: OwnerDecimal;
};

export type OwnerSettlementFilters = {
  status?: "unpaid" | "paid";
  search?: string;
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

export async function getOwnerSettlements(filters: OwnerSettlementFilters = {}): Promise<OwnerSettlementListResponse> {
  const query = queryString({
    status: filters.status,
    search: filters.search,
    page: filters.page,
    page_size: filters.page_size,
  });
  return apiFetch(`/owner/settlements${query}`);
}

export async function getOwnerSettlementStats(): Promise<OwnerSettlementStatsResponse> {
  return apiFetch("/owner/settlements/stats");
}
