"use client";
import { apiFetch } from "@/services/api";
import type { PropertySearchResponse } from "@/services/properties";

export type AISearchRequest = {
  query: string;
};

export type AISearchParams = {
  query: string;
  page?: number;
  page_size?: number;
};

export async function searchPropertiesWithAI(params: AISearchParams): Promise<PropertySearchResponse> {
  const { query, page = 1, page_size = 12 } = params;
  return apiFetch(`/ai/search?page=${page}&page_size=${page_size}`, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}