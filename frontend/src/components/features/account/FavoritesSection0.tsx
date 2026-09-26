"use client";
import { useEffect, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";
import { getFavorites, removeFavorite, type FavoriteListResponse, type FavoritePropertyItem } from "@/services/favorites";
import type { PropertyResponse } from "@/services/owner";
import Swal from "sweetalert2";

function formatPrice(v: string | number) {
  const n = Number(v);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function FavoritesSection0() {
  const [favorites, setFavorites] = useState<FavoritePropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFavorites();
      setFavorites(response.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (propertyId: number) => {
    const originalFavorites = [...favorites];
    // Optimistic update
    setFavorites(prev => prev.filter(item => item.property.id !== propertyId));

    try {
      await removeFavorite(propertyId);
      Swal.fire({
        title: 'Removed from favorites',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      // Rollback on error
      setFavorites(originalFavorites);
      Swal.fire({
        title: 'Error',
        text: e instanceof Error ? e.message : 'Failed to remove from favorites',
        icon: 'error',
        confirmButtonColor: '#157375',
      });
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#f8f9ff] flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading favorites…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-[#f8f9ff] flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Link href="/account/properties" className="text-primary underline mt-4 inline-block">Discover Properties</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="w-full min-h-screen bg-[#f8f9ff] flex flex-col">
        <div className="flex flex-col w-full">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
            <div className="space-y-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#157375]/10 text-[#157375] font-label-sm text-label-sm font-semibold border border-[#157375]/15">Saved Properties</span>
                <span className="w-1 h-1 rounded-full bg-[#157375]/30" />
                <span className="text-[#157375]/60 text-caption font-medium">Synced across devices</span>
              </div>
              <h1 className="font-display text-[32px] md:text-[40px] font-bold tracking-tight text-[#157375]">Favorites</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                <span className="font-semibold text-[#157375]">{favorites.length}</span> saved chalets and furnished houses across Lebanon. Check live availability and book directly.
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="p-12 bg-white rounded-[20px] border border-surface-container-low shadow-[0_2px_16px_rgba(17,28,45,0.06)] text-center flex flex-col items-center justify-center space-y-4">
                <div className="relative w-20 h-20 mb-5 flex items-center justify-center mx-auto">
                  <div className="absolute inset-0 rounded-full bg-[#157375]/10" />
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative">
                    <Icon name="favorite_border" className="material-symbols-outlined text-[28px] text-[#157375]" />
                  </div>
                </div>
                <h3 className="font-headline-md text-headline-md text-[#157375] font-bold tracking-tight mb-2">No saved stays yet</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
                  Save chalets and furnished houses you like while browsing StayLeb. Your saved getaways will stay synced here for effortless comparison and group sharing.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                  <Link className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#157375] text-white font-label-md text-label-md font-semibold hover:bg-[#0f5a5b] transition-colors shadow-[0_4px_16px_rgba(21,115,117,0.25)] flex items-center justify-center gap-2" href="/account/properties">
                    <Icon name="explore" className="material-symbols-outlined text-[18px]" />Discover Properties
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="favorites-grid">
                {favorites.map((item) => {
                  const prop = item.property;
                  const img = prop.images?.find((i: PropertyResponse["images"][0]) => i.is_primary)?.image_url || prop.images?.[0]?.image_url || "/images/e8899428208cea05.jpg";
                  return (
                    <article key={prop.id} className="group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_32px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1">
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container">
                        <LocalImage className="w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]" src={img} alt={prop.title} />
                        <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#157375] font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5">
                            <Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />Verified Host
                          </span>
                          <div className="pointer-events-auto">
                            <FavoriteButton 
                              id={String(prop.id)} 
                              onClick={() => handleRemoveFavorite(prop.id)}
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-[#157375] text-white font-caption text-caption font-semibold shadow-md flex items-center gap-1">
                            <Icon name="solar_power" className="material-symbols-outlined text-[13px] text-white" />Solar 24/7
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-caption text-caption font-bold tracking-[0.08em] uppercase text-[#157375]/70">{prop.location}</span>
                            <div className="flex items-center gap-1 text-[#157375] font-label-sm text-label-sm font-semibold">
                              <Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
                              <span>—</span>
                            </div>
                          </div>
                          <h2 className="font-title-md text-title-md text-[#157375] font-semibold group-hover:text-primary transition-colors line-clamp-1">{prop.title}</h2>
                          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1">{prop.max_guests} guests · {prop.beds} beds · {prop.bathrooms} baths</p>
                        </div>
                        <div className="pt-3 flex items-baseline justify-between border-t border-surface-container-low">
                          <div>
                            <span className="font-headline-sm text-headline-sm font-bold text-[#157375]">{formatPrice(prop.price_per_night)}</span>
                            <span className="font-body-md text-body-md text-on-surface-variant"> / night</span>
                          </div>
                          <Link className="px-3.5 py-2 rounded-full bg-[#157375] text-white font-label-sm text-label-sm font-semibold hover:bg-[#0f5a5b] transition-colors shadow-sm" href={`/properties/${prop.id}`}>Check Dates</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="pt-6 space-y-4">
              <div className="p-6 bg-white rounded-[20px] border border-surface-container-low shadow-[0_2px_16px_rgba(17,28,45,0.06)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-title-md text-title-md text-[#157375]">Your favorites are synced</h3>
                    <p className="text-on-surface-variant mt-1 text-sm">Your saved properties are stored in your StayLeb account and accessible from any device.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}