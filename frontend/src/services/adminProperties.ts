"use client";
import { apiFetch } from "@/services/api";
import type { PropertyResponse } from "@/services/owner";

export type AdminPropertyListResponse = {
  items: PropertyResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type AdminPropertyParams = {
  status?: "pending" | "approved" | "rejected";
  search?: string;
  owner_id?: number;
  location?: string;
  page?: number;
  page_size?: number;
};

export async function getAdminProperties(params: AdminPropertyParams = {}): Promise<AdminPropertyListResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  if (typeof params.owner_id === "number") qs.set("owner_id", String(params.owner_id));
  if (params.location) qs.set("location", params.location);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/admin/properties${suffix}`);
}

export async function approveAdminProperty(id: number | string): Promise<PropertyResponse> {
  return apiFetch(`/admin/properties/${id}/approve`, { method: "PATCH" });
}

export async function rejectAdminProperty(id: number | string, rejection_reason: string): Promise<PropertyResponse> {
  return apiFetch(`/admin/properties/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejection_reason }),
  });
}
