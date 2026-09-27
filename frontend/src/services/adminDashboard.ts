"use client";
import { apiFetch } from "@/services/api";

export type AdminDashboardStats = {
  users: {
    total: number;
    owners: number;
    clients: number;
    active: number;
    inactive: number;
  };
  properties: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  financials: {
    total_revenue: number | string;
    platform_commission: number | string;
    owner_earnings: number | string;
    outstanding_cash_commission: number | string;
  };
  reviews: {
    total: number;
    average_rating: number | string;
  };
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return apiFetch("/admin/dashboard/stats");
}
