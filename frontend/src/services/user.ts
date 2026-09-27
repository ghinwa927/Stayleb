"use client";
import { apiFetch } from "@/services/api";

export type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type UpdateProfilePayload = {
  full_name?: string;
  email?: string;
  phone?: string;
};

export async function getMyProfile(): Promise<UserProfile> {
  return apiFetch("/users/me");
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}