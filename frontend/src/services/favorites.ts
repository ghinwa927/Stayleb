"use client";
import { apiFetch } from "@/services/api";
import type { PropertyResponse } from "@/services/owner";

export type FavoritePropertyItem = {
  property: PropertyResponse;
  created_at: string;
};

export type FavoriteListResponse = {
  items: FavoritePropertyItem[];
};

export type FavoriteCreate = {
  property_id: number;
};

export type FavoriteResponse = {
  client_id: number;
  property_id: number;
  created_at: string;
};

export async function getFavorites(): Promise<FavoriteListResponse> {
  return apiFetch("/favorites");
}

export async function addFavorite(propertyId: number): Promise<FavoriteResponse> {
  return apiFetch("/favorites", {
    method: "POST",
    body: JSON.stringify({ property_id: propertyId }),
  });
}

export async function removeFavorite(propertyId: number): Promise<void> {
  return apiFetch(`/favorites/${propertyId}`, {
    method: "DELETE",
  });
}