"use client";
import { FavoritesProvider } from "@/components/features/market/ListingSearch";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}
