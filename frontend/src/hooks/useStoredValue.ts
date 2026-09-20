"use client";
import { useSyncExternalStore } from "react";
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
export function useStoredValue(
  key: string,
  fallback: string,
  kind: "local" | "session" = "session",
) {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return (
          (kind === "local" ? localStorage : sessionStorage).getItem(key) ??
          fallback
        );
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );
}
