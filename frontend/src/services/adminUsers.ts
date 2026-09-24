"use client";
import { apiFetch } from "@/services/api";

export type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type AdminUsersResponse = {
  items: AdminUser[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type AdminUsersParams = {
  role?: "owner" | "client" | "admin";
  is_active?: boolean;
  search?: string;
  sort?: "newest" | "oldest" | "name_asc" | "name_desc";
  created_from?: string; // YYYY-MM-DD
  created_to?: string; // YYYY-MM-DD
  page?: number;
  page_size?: number;
};

export async function getAdminUsers(params: AdminUsersParams = {}): Promise<AdminUsersResponse> {
  const qs = new URLSearchParams();
  if (params.role) qs.set("role", params.role);
  if (typeof params.is_active === "boolean") qs.set("is_active", String(params.is_active));
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  if (params.created_from) qs.set("created_from", params.created_from);
  if (params.created_to) qs.set("created_to", params.created_to);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/admin/users${suffix}`);
}

export async function getAdminUserById(id: number): Promise<AdminUser> {
  return apiFetch(`/admin/users/${id}`);
}

export async function blockAdminUser(id: number): Promise<AdminUser> {
  return apiFetch(`/admin/users/${id}/block`, { method: "PATCH" });
}

export async function unblockAdminUser(id: number): Promise<AdminUser> {
  return apiFetch(`/admin/users/${id}/unblock`, { method: "PATCH" });
}
