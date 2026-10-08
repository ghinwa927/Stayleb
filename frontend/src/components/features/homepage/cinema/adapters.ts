"use client";
import type { PropertySearchResponse } from "@/services/properties";
import { propertyDetailsHref } from "@/lib/property-search";
import type { PropertySearchParams } from "@/services/properties";

export type SearchItem = PropertySearchResponse["items"][number];

/**
 * Presentation view-model for a cinematic stay card. Adapted from the real
 * backend search item — identifiers, images, prices and amenities all come
 * from the API response. No demo data enters here.
 */
export type StayCardModel = {
  id: number;
  title: string;
  region: string;
  typeLabel: string;
  capacityLine: string;
  amenityNames: string[];
  priceLabel: string;
  priceNote: string;
  minNights: number;
  imageUrl: string | null;
  href: string;
};

const usd = (value: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));

export function toStayCard(
  property: SearchItem,
  search: PropertySearchParams = {},
): StayCardModel {
  const image =
    property.images.find((item) => item.is_primary)?.image_url ||
    property.images[0]?.image_url ||
    null;
  const pricing = property.stay_pricing;
  return {
    id: property.id,
    title: property.title,
    region: property.location,
    typeLabel: property.property_type === "chalet" ? "Chalet" : "Furnished house",
    capacityLine: `${property.max_guests} guests · ${property.bedrooms} ${property.bedrooms === 1 ? "bedroom" : "bedrooms"} · ${property.beds} beds · ${property.bathrooms} ${property.bathrooms === 1 ? "bath" : "baths"}`,
    amenityNames: property.amenities.slice(0, 3).map((item) => item.name),
    priceLabel: usd(pricing?.average_price_per_night ?? property.price_per_night),
    priceNote: pricing
      ? `${usd(pricing.total_price)} for ${pricing.number_of_nights} nights`
      : `${property.min_nights}-night minimum`,
    minNights: property.min_nights,
    imageUrl: image,
    href: propertyDetailsHref(property.id, search),
  };
}
