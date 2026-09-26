"use client";
import { PropertyCard as SearchPropertyCard } from '@/components/features/market/ListingSearch';
import type { PropertySearchResponse } from '@/services/properties';

export function PropertyCard({ property, showFavorite = false }: { readonly property: PropertySearchResponse['items'][number]; showFavorite?: boolean }) {
  return <SearchPropertyCard property={property} showFavorite={showFavorite} />;
}
