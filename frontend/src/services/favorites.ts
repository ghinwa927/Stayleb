"use client";
import { apiFetch, parseJwt } from "@/services/api";
import { dedupedFetch, FAVORITES_TTL_MS, getCached } from "@/lib/request-cache";
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

/**
 * Identity used to scope the favorites cache. Returns null for anonymous
 * visitors (including demo sessions without an access token), so callers can
 * skip the request entirely instead of collecting a 401.
 */
export function favoritesIdentity(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("stayleb_access_token");
  if (!token) return null;
  try {
    const sub = (parseJwt(token) as { sub?: unknown }).sub;
    const id = (sub != null && String(sub)) || localStorage.getItem("stayleb_user_id") || "";
    return id || "token";
  } catch {
    return localStorage.getItem("stayleb_user_id") || "token";
  }
}

// Bumped on login/logout/account switch and after mutations so cached
// favorites can never leak from one account (or session) into another.
let favoritesEpoch = 0;

export function invalidateFavoritesCache(): void {
  favoritesEpoch += 1;
}

function favoritesCacheKey(identity: string): string {
  return `GET:/favorites:user:${identity}:e${favoritesEpoch}`;
}

/**
 * Favorites list for the current user, sharing one in-flight request across
 * concurrent callers and reusing fresh responses briefly. Throws when there
 * is no signed-in user; check `favoritesIdentity()` first to avoid the call.
 */
export async function getFavoritesCached(init?: {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<FavoriteListResponse> {
  const identity = favoritesIdentity();
  if (!identity) throw new Error("Not signed in");
  return dedupedFetch<FavoriteListResponse>(
    favoritesCacheKey(identity),
    (signal) => apiFetch("/favorites", { signal }),
    { ttlMs: FAVORITES_TTL_MS, signal: init?.signal, forceRefresh: init?.forceRefresh },
  );
}

/** Synchronous read of the current user's fresh cached favorites, if any. */
export function getCachedFavorites(): FavoriteListResponse | null {
  const identity = favoritesIdentity();
  if (!identity) return null;
  return getCached<FavoriteListResponse>(favoritesCacheKey(identity));
}

export async function addFavorite(propertyId: number): Promise<FavoriteResponse> {
  const created = await apiFetch("/favorites", {
    method: "POST",
    body: JSON.stringify({ property_id: propertyId }),
  });
  invalidateFavoritesCache();
  return created;
}

export async function removeFavorite(propertyId: number): Promise<void> {
  await apiFetch(`/favorites/${propertyId}`, {
    method: "DELETE",
  });
  invalidateFavoritesCache();
}
