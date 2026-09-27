"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";

export function OwnerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("stayleb_access_token") : null;
    if (!token) {
      router.replace("/auth/login?next=/owner");
      return;
    }
    // verify role via backend (source of truth)
    apiFetch("/users/me")
      .then((me: { role: string }) => {
        if ((me.role || "").toLowerCase() !== "owner") {
          // redirect non-owners to their home
          const r = (me.role || "").toLowerCase();
          if (r === "admin") router.replace("/admin");
          else if (r === "client") router.replace("/account");
          else router.replace("/auth/login");
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        router.replace("/auth/login?next=/owner");
      })
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#E4ECEE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#157375]/20 border-t-[#157375] rounded-full animate-spin" />
          <span className="text-sm text-[#157375] font-medium">Verifying owner access…</span>
        </div>
      </div>
    );
  }
  if (!allowed) return null;
  return <>{children}</>;
}
