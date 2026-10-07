"use client";
import { apiFetch } from "@/services/api";
import { propertySearchQuery } from "@/lib/property-search";
import {
  AMENITIES_TTL_MS,
  PROPERTY_SEARCH_TTL_MS,
  dedupedFetch,
  getCached,
} from "@/lib/request-cache";
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

export type CachedFetchInit = {
  /** Per-caller abort signal. Safe with shared requests (see request-cache). */
  signal?: AbortSignal;
  /** Skip the cache read and fetch again. Concurrent identical callers still share one request. */
  forceRefresh?: boolean;
};

/**
 * Cache key covering every search parameter. Amenity ids are sorted so
 * semantically identical searches share one entry regardless of order.
 */
export function propertySearchKey(params: PropertySearchParams): string {
  const normalized: PropertySearchParams = {
    ...params,
    amenity_ids: params.amenity_ids ? [...params.amenity_ids].sort((a, b) => a - b) : undefined,
  };
  const query = propertySearchQuery(normalized);
  return `GET:/properties${query ? `?${query}` : ""}`;
}

export const AMENITIES_CACHE_KEY = "GET:/amenities/public";

export async function searchProperties(
  params: PropertySearchParams,
  init?: CachedFetchInit,
): Promise<PropertySearchResponse> {
  const key = propertySearchKey(params);
  const query = propertySearchQuery(params);
  const suffix = query ? `?${query}` : "";
  return dedupedFetch<PropertySearchResponse>(
    key,
    (signal) => apiFetch(`/properties${suffix}`, { signal }),
    { ttlMs: PROPERTY_SEARCH_TTL_MS, signal: init?.signal, forceRefresh: init?.forceRefresh },
  );
}

/** Synchronous read of a fresh cached search response, if any. No network. */
export function getCachedSearch(params: PropertySearchParams): PropertySearchResponse | null {
  return getCached<PropertySearchResponse>(propertySearchKey(params));
}

export async function getPublicProperty(
  id: number | string,
  init?: CachedFetchInit,
): Promise<PropertyResponse> {
  const key = publicPropertyKey(id);
  return dedupedFetch<PropertyResponse>(
    key,
    (signal) => apiFetch(`/properties/public/${id}`, { signal }),
    { ttlMs: PUBLIC_PROPERTY_TTL_MS, signal: init?.signal, forceRefresh: init?.forceRefresh },
  );
}

/**
 * Short-lived cache for public property *display* details (title, images,
 * base nightly price). Property details change rarely, so identical
 * `/properties/public/{id}` requests share one network call and reuse fresh
 * responses briefly. Never use this for booking status, payments, or
 * availability checks — those must always hit the server (see
 * `getAvailability`, intentionally uncached).
 */
export const PUBLIC_PROPERTY_TTL_MS = 60_000;

export function publicPropertyKey(id: number | string): string {
  return `GET:/properties/public/${id}`;
}

/** Synchronous read of fresh cached property details, if any. No network. */
export function getCachedPublicProperty(id: number | string): PropertyResponse | null {
  return getCached<PropertyResponse>(publicPropertyKey(id));
}

// Availability must always be fresh: never route through the shared cache.
export async function getAvailability(
  id: number | string,
  options?: RequestInit,
): Promise<AvailabilityResponse> {
  return apiFetch(`/properties/${id}/availability`, options);
}

export async function getPublicAmenities(
  init?: CachedFetchInit,
): Promise<import("@/services/owner").Amenity[]> {
  return dedupedFetch<import("@/services/owner").Amenity[]>(
    AMENITIES_CACHE_KEY,
    (signal) => apiFetch(`/amenities/public`, { signal }),
    { ttlMs: AMENITIES_TTL_MS, signal: init?.signal, forceRefresh: init?.forceRefresh },
  );
}

/** Synchronous read of fresh cached amenities, if any. No network. */
export function getCachedAmenities(): import("@/services/owner").Amenity[] | null {
  return getCached<import("@/services/owner").Amenity[]>(AMENITIES_CACHE_KEY);
}
