"use client";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/authGuard";

export type AuthStatus = "loading" | "authenticated" | "guest";

/**
 * Hydration-safe authentication status. The initial state is deterministically
 * "loading" on both the server and the first client render, so conditional UI
 * never diverges during hydration. The real value (same semantics as
 * isAuthenticated(): access token, demo session, or role) resolves after
 * mounting and follows login/logout plus cross-tab storage events.
 */
export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const sync = () => setStatus(isAuthenticated() ? "authenticated" : "guest");
    sync();
    window.addEventListener("stayleb-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("stayleb-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return status;
}
