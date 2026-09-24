"use client";
import { apiFetch } from "@/services/api";
import type { PropertyResponse } from "@/services/owner";

export type PropertySearchParams = {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: "chalet" | "furnished_house";
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenity_ids?: number[];
  sort?: "recommended" | "price_low" | "price_high" | "newest";
  page?: number;
  page_size?: number;
};

export type PropertySearchResponse = {
  items: (PropertyResponse & { stay_pricing?: { number_of_nights: number; total_price: string; average_price_per_night: string; lowest_nightly_price: string; highest_nightly_price: string } | null })[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type AvailabilityResponse = {
  property_id: number;
  blocked_dates: { id: number; start_date: string; end_date: string; reason: string | null }[];
  booked_dates: { id: number; check_in: string; check_out: string; status: string }[];
};

export async function searchProperties(params: PropertySearchParams): Promise<PropertySearchResponse> {
  const qs = new URLSearchParams();
  if (params.location) qs.set("location", params.location);
  if (params.check_in) qs.set("check_in", params.check_in);
  if (params.check_out) qs.set("check_out", params.check_out);
  if (params.guests) qs.set("guests", String(params.guests));
  if (params.min_price !== undefined) qs.set("min_price", String(params.min_price));
  if (params.max_price !== undefined) qs.set("max_price", String(params.max_price));
  if (params.property_type) qs.set("property_type", params.property_type);
  if (params.bedrooms !== undefined) qs.set("bedrooms", String(params.bedrooms));
  if (params.beds !== undefined) qs.set("beds", String(params.beds));
  if (params.bathrooms !== undefined) qs.set("bathrooms", String(params.bathrooms));
  if (params.amenity_ids) params.amenity_ids.forEach((id) => qs.append("amenity_ids", String(id)));
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/properties${suffix}`);
}

export async function getPublicProperty(id: number | string): Promise<PropertyResponse> {
  return apiFetch(`/properties/public/${id}`);
}

export async function getAvailability(id: number | string): Promise<AvailabilityResponse> {
  return apiFetch(`/properties/${id}/availability`);
}

export async function getPublicAmenities(): Promise<import("@/services/owner").Amenity[]> {
  return apiFetch(`/amenities/public`);
}
