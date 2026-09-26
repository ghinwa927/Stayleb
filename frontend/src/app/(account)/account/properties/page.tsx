import type { Metadata } from "next";
import { ListingProvider } from "@/components/features/market/ListingSearch";
import { SearchResultsSection0 } from "@/components/features/market/SearchResultsSection0";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Properties | StayLeb" };
export const dynamic = 'force-dynamic';

// Reuses same SearchResultsSection0 as public /search but rendered
// inside the account workspace (AppShell). No PublicHeader/Footer —
// only the content, so the client stays inside the dashboard.
export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading properties…</div>}>
      <ListingProvider>
        <div className="bg-background">
          <SearchResultsSection0 />
        </div>
      </ListingProvider>
    </Suspense>
  );
}
