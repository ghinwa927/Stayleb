"use client";
import { apiFetch } from "@/services/api";

export type Review = {
  id: number;
  booking_id: number;
  overall_rating: number;
  cleanliness_rating: number;
  privacy_rating: number;
  wifi_rating: number;
  hot_water_rating: number;
  location_rating: number;
  value_rating: number;
  comment: string | null;
  created_at: string;
};

export type ReviewCreate = {
  booking_id: number;
  overall_rating: number;
  cleanliness_rating: number;
  privacy_rating: number;
  wifi_rating: number;
  hot_water_rating: number;
  location_rating: number;
  value_rating: number;
  comment?: string | null;
};

export type PropertyReviewStats = {
  total_reviews: number;
  overall_rating: string | number;
  cleanliness_rating: string | number;
  privacy_rating: string | number;
  wifi_rating: string | number;
  hot_water_rating: string | number;
  location_rating: string | number;
  value_rating: string | number;
};

export async function createReview(data: ReviewCreate): Promise<Review> {
  return apiFetch(`/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getReviewByBooking(bookingId: number | string): Promise<Review> {
  return apiFetch(`/reviews/booking/${bookingId}`);
}

export async function getPropertyReviews(propertyId: number | string): Promise<Review[]> {
  return apiFetch(`/reviews/property/${propertyId}`);
}

export async function getPropertyReviewStats(propertyId: number | string): Promise<PropertyReviewStats> {
  return apiFetch(`/reviews/property/${propertyId}/stats`);
}

export type OwnerReview = {
  id: number;
  booking_id: number;
  overall_rating: number;
  cleanliness_rating: number;
  privacy_rating: number;
  wifi_rating: number;
  hot_water_rating: number;
  location_rating: number;
  value_rating: number;
  comment: string | null;
  created_at: string;
  property: {
    id: number;
    title: string;
    location: string;
  };
  moderation_status?: string;
  report_reason?: string | null;
  reported_at?: string | null;
  moderated_at?: string | null;
};

export async function reportOwnerReview(reviewId: number, reason: string): Promise<{ id: number; moderation_status: string; report_reason: string | null; reported_at: string | null }> {
  return apiFetch(`/reviews/owner/${reviewId}/report`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export type OwnerReviewListResponse = {
  items: OwnerReview[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type OwnerReviewStats = PropertyReviewStats;

export async function getOwnerReviews(params: { property_id?: number | string; search?: string; page?: number; page_size?: number } = {}): Promise<OwnerReviewListResponse> {
  const qs = new URLSearchParams();
  if (params.property_id) qs.set("property_id", String(params.property_id));
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/reviews/owner${suffix}`);
}

export async function getOwnerReviewStats(propertyId?: number | string): Promise<OwnerReviewStats> {
  const qs = propertyId ? `?property_id=${propertyId}` : "";
  return apiFetch(`/reviews/owner/stats${qs}`);
}

export type AdminReview = {
  id: number;
  booking_id: number;
  overall_rating: number;
  cleanliness_rating: number;
  privacy_rating: number;
  wifi_rating: number;
  hot_water_rating: number;
  location_rating: number;
  value_rating: number;
  comment: string | null;
  created_at: string;
  client: {
    id: number;
    full_name: string;
    email: string;
  };
  property: {
    id: number;
    title: string;
    location: string;
  };
  moderation_status: string;
  report_reason: string | null;
  reported_at: string | null;
  moderated_at: string | null;
};

export type AdminReviewListResponse = {
  items: AdminReview[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type AdminReviewStats = PropertyReviewStats;

export async function getAdminReviews(params: { search?: string; rating?: number; moderation_status?: "visible" | "flagged" | "removed"; page?: number; page_size?: number } = {}): Promise<AdminReviewListResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.rating) qs.set("rating", String(params.rating));
  if (params.moderation_status) qs.set("moderation_status", params.moderation_status);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/admin/reviews${suffix}`);
}

export async function restoreAdminReview(reviewId: number): Promise<AdminReview> {
  return apiFetch(`/admin/reviews/${reviewId}/restore`, { method: "PATCH" });
}

export async function removeAdminReview(reviewId: number): Promise<AdminReview> {
  return apiFetch(`/admin/reviews/${reviewId}`, { method: "DELETE" });
}

export async function getAdminReviewStats(): Promise<AdminReviewStats> {
  return apiFetch(`/admin/reviews/stats`);
}
