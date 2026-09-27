"use client";
import { apiFetch } from "@/services/api";

export type OwnerDashboardStats = {
  total_properties: number;
  approved_properties: number;
  pending_properties: number;
  rejected_properties: number;
  total_bookings: number;
  pending_cash_requests: number;
  upcoming_bookings: number;
  total_revenue: string | number;
  platform_commission: string | number;
  owner_earnings: string | number;
  outstanding_cash_commission: string | number;
  portfolio_rating: string | number;
  total_reviews: number;
};

export async function getOwnerDashboardStats(): Promise<OwnerDashboardStats> {
  return apiFetch("/owner/dashboard/stats");
}
