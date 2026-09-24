"use client";
import { useEffect, useState } from "react";
import { PropertyDetailsSection0 } from "@/components/features/market/PropertyDetailsSection0";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/Appshell";
import { isAuthenticated } from "@/lib/authGuard";

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setIsClient(isAuthenticated());
    setMounted(true);
  }, []);

  // Prevent hydration mismatch: render guest header on server, switch after mount
  if (!mounted) {
    return (
      <>
        <PublicHeader />
        <PropertyDetailsSection0 />
        <Footer />
      </>
    );
  }

  if (isClient) {
    // Client header = AppShell account header (no left sidebar, profile dropdown with Properties etc)
    return (
      <AppShell area="account">
        <PropertyDetailsSection0 />
      </AppShell>
    );
  }

  // Guest header
  return (
    <>
      <PublicHeader />
      <PropertyDetailsSection0 />
      <Footer />
    </>
  );
}
