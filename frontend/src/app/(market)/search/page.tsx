import { ListingProvider } from "@/components/features/market/ListingSearch";
import type { Metadata } from "next";
import { SearchResultsSection0 } from "@/components/features/market/SearchResultsSection0";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Search Results | StayLeb" };
export const dynamic = 'force-dynamic';
export default function Page() {
  return (
    <>
      <PublicHeader />
      <Suspense fallback={<div className="p-10 text-center">Loading search…</div>}>
        <ListingProvider>
          <div className="bg-background font-body-md text-body-md text-on-surface">
            <SearchResultsSection0 />
          </div>
        </ListingProvider>
      </Suspense>
      <Footer />
    </>
  );
}
