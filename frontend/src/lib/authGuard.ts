"use client";
import Swal from "sweetalert2";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("stayleb_access_token");
  const demo = sessionStorage.getItem("stayleb-demo-session");
  const role = localStorage.getItem("stayleb_role");
  // Consider any valid session as authenticated; real token takes precedence
  return !!token || !!demo || !!role;
}

export function requireAuth(opts: { nextPath: string; action?: "booking" | "favorites"; router: { push: (url: string) => void } }): boolean {
  if (isAuthenticated()) return true;

  const isBooking = opts.action === "booking";
  const title = isBooking ? "Please log in to book" : "Please log in to save favorites";
  const text = isBooking
    ? "You need to log in before you can continue to booking. Sign in to reserve this property."
    : "You need to log in to save properties to your favorites. Sign in to keep your wishlist in sync.";

  Swal.fire({
    title,
    text,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Go to Login",
    cancelButtonText: "Continue as Guest",
    confirmButtonColor: "#3a9a9e",
    cancelButtonColor: "#e7eeff",
    customClass: {
      popup: "rounded-2xl",
      confirmButton: "rounded-full px-6",
      cancelButton: "rounded-full px-6 text-on-surface",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      opts.router.push(`/auth/login?next=${encodeURIComponent(opts.nextPath)}`);
    }
  });

  return false;
}
