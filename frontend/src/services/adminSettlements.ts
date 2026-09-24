"use client";
import { apiFetch } from "@/services/api";

export type AdminSettlement = {
  id: number;
  booking_id: number;
  owner_id: number;
  commission_amount: string;
  status: "unpaid" | "paid";
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  };
  property: {
    id: number;
    title: string;
    location: string;
  };
};

export type AdminSettlementListResponse = {
  items: AdminSettlement[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type AdminSettlementStats = {
  total_settlements: number;
  unpaid_count: number;
  paid_count: number;
  outstanding_commission: string;
  settled_commission: string;
};

export type AdminSettlementFilters = {
  status?: "unpaid" | "paid";
  search?: string;
  owner_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
};

export async function getAdminSettlements(filters: AdminSettlementFilters = {}): Promise<AdminSettlementListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.owner_id) params.set("owner_id", String(filters.owner_id));
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/admin/settlements${qs}`);
}

export async function getAdminSettlementStats(): Promise<AdminSettlementStats> {
  return apiFetch(`/admin/settlements/stats`);
}

export async function settleAdminCommission(settlementId: number): Promise<AdminSettlement> {
  return apiFetch(`/admin/settlements/${settlementId}/settle`, {
    method: "PATCH",
  });
}
