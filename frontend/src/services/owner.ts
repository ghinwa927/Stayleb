"use client";
import { apiFetch } from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stayleb_access_token");
}

// Types matching backend schemas
export type PropertyImageCreate = {
  image_url: string;
  imagekit_file_id?: string | null;
  is_primary: boolean;
  display_order: number;
};

export type SeasonalPriceCreate = {
  season_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  price_per_night: string | number;
};

export type PropertyRuleCreate = {
  rule_id: number;
  allowed: boolean;
  value?: string | null;
};

export type PropertyCreatePayload = {
  title: string;
  description: string;
  property_type: "chalet" | "furnished_house";
  location: string;
  address?: string | null;
  price_per_night: string | number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  min_nights: number;
  images: PropertyImageCreate[];
  amenity_ids: number[];
  rules: PropertyRuleCreate[];
  seasonal_prices: SeasonalPriceCreate[];
};

export type PropertyUpdatePayload = Partial<Omit<PropertyCreatePayload, "images" | "amenity_ids" | "rules" | "seasonal_prices">> & {
  images?: PropertyImageCreate[] | null;
  amenity_ids?: number[] | null;
  rules?: PropertyRuleCreate[] | null;
  seasonal_prices?: SeasonalPriceCreate[] | null;
};

export type Amenity = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
};

export type Rule = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
};

export type PropertyDescriptionRule = {
  name: string;
  allowed: boolean;
  value: string | null;
};

export type PropertyDescriptionRequest = {
  title: string;
  property_type: "chalet" | "furnished_house";
  location: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  rules: PropertyDescriptionRule[];
};

export type PropertyDescriptionResponse = {
  description: string;
};

export type PropertyBlockedDate = {
  id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyResponse = {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  property_type: string;
  location: string;
  address: string | null;
  price_per_night: string | number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  min_nights: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  images: { id: number; property_id: number; image_url: string; imagekit_file_id: string | null; is_primary: boolean; display_order: number; created_at: string }[];
  amenities: Amenity[];
  property_rules: { id: number; rule_id: number; allowed: boolean; value: string | null; rule?: Rule }[];
  seasonal_prices: { id: number; property_id: number; season_name: string; start_date: string; end_date: string; price_per_night: string | number; created_at: string; updated_at: string }[];
  created_at: string;
  updated_at: string;
};

// Properties
export async function getMyProperties(): Promise<PropertyResponse[]> {
  return apiFetch("/properties/my-properties");
}

export async function getOwnerProperty(id: number | string): Promise<PropertyResponse> {
  return apiFetch(`/properties/${id}`);
}

export async function createProperty(payload: PropertyCreatePayload): Promise<PropertyResponse> {
  return apiFetch("/properties", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateProperty(id: number | string, payload: PropertyUpdatePayload): Promise<PropertyResponse> {
  return apiFetch(`/properties/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteProperty(id: number | string): Promise<void> {
  await apiFetch(`/properties/${id}`, { method: "DELETE" });
}

export async function generatePropertyDescription(payload: PropertyDescriptionRequest): Promise<PropertyDescriptionResponse> {
  return apiFetch("/ai/property/generate-description", { method: "POST", body: JSON.stringify(payload) });
}

// Amenities / Rules
export async function getAmenities(): Promise<Amenity[]> {
  return apiFetch("/amenities");
}

export async function getRules(): Promise<Rule[]> {
  return apiFetch("/rules");
}

// Images - multipart upload
export async function uploadPropertyImage(file: File): Promise<{ imagekit_file_id: string; image_url: string; file_name: string }> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/images/property`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    let detail = `Upload failed: ${res.status}`;
    try {
      const data = await res.json();
      const d = data.detail;
      if (Array.isArray(d)) detail = d.map((x: { msg?: string }) => x.msg || JSON.stringify(x)).join(", ");
      else detail = d || data.message || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

// Blocked dates
export async function getBlockedDates(propertyId: number | string): Promise<PropertyBlockedDate[]> {
  return apiFetch(`/properties/${propertyId}/blocked-dates`);
}

export async function createBlockedDate(propertyId: number | string, data: { start_date: string; end_date: string; reason?: string | null }): Promise<PropertyBlockedDate> {
  return apiFetch(`/properties/${propertyId}/blocked-dates`, { method: "POST", body: JSON.stringify(data) });
}

export async function deleteBlockedDate(propertyId: number | string, blockedDateId: number | string): Promise<void> {
  await apiFetch(`/properties/${propertyId}/blocked-dates/${blockedDateId}`, { method: "DELETE" });
}
