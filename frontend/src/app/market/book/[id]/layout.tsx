"use client";
import { useEffect, useState } from "react";
import { BookingProvider } from "@/components/features/booking/BookingContext";
import { AppShell } from "@/components/layout/Appshell";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { isAuthenticated } from "@/lib/authGuard";

function BookingLayoutInner({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isClientAuthed, setIsClientAuthed] = useState(false);
  useEffect(() => {
    setIsClientAuthed(isAuthenticated());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  if (isClientAuthed) {
    // Client header = AppShell account (same as property details when logged in)
    return <AppShell area="account">{children}</AppShell>;
  }

  // Guest header
  return (
    <>
      <PublicHeader />
      {children}
      <Footer />
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <BookingLayoutInner>{children}</BookingLayoutInner>
    </BookingProvider>
  );
}
