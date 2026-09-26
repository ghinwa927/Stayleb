"use client";
import { apiFetch } from "@/services/api";
import { propertySearchQuery } from "@/lib/property-search";
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
  const query = propertySearchQuery(params);
  const suffix = query ? `?${query}` : "";
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
