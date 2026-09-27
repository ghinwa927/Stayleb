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
      <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[#157375] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748B]">Loading favorites…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Link href="/account/properties" className="text-[#157375] font-semibold underline mt-4 inline-block">Discover Properties</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="w-full min-h-screen bg-[#F2F5FA] flex flex-col">
        <div className="flex flex-col w-full">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-[22px] border border-[#E9EEF3] bg-gradient-to-r from-white via-[#F4F9FA] to-[#E8F3F3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] px-6 sm:px-8 py-7 sm:py-9">
              <div className="absolute inset-y-0 right-0 w-[52%] hidden md:block pointer-events-none" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/favorites_hero.png" alt="" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#F4F9FA] via-[#F4F9FA]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-y-0 right-0 w-full md:hidden pointer-events-none opacity-[0.12]" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/favorites_hero.png" alt="" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40" />
              </div>
              <div className="relative max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#157375]">Saved for later · Synced across devices</p>
                <h1 className="text-[30px] sm:text-[38px] leading-[1.1] font-extrabold text-[#0F2432] tracking-tight mt-2">Favorites</h1>
                <p className="text-[13.5px] sm:text-[15px] text-[#64748B] mt-2">
                  <span className="font-bold text-[#0F2432]">{favorites.length}</span> saved {favorites.length === 1 ? "stay" : "stays"} across Lebanon. Check live availability and book directly.
                </p>
              </div>
            </section>

            {favorites.length === 0 ? (
              <div className="p-10 sm:p-14 bg-white rounded-[22px] border border-[#E9EEF3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E6F4F4] flex items-center justify-center text-[#157375]">
                  <Icon name="favorite" className="material-symbols-outlined text-[30px]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#0F2432]">No saved stays yet</h3>
                <p className="text-[13.5px] text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Save chalets and furnished houses you like while browsing StayLeb. Your saved getaways will stay synced here for effortless comparison and group sharing.
                </p>
                <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white text-[13.5px] font-semibold shadow-[0_8px_20px_rgba(21,115,117,0.25)] transition-all" href="/account/properties">
                  Discover Properties<Icon name="arrow_forward" className="material-symbols-outlined text-[17px] text-white" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="favorites-grid">
                {favorites.map((item) => {
                  const prop = item.property;
                  const img = prop.images?.find((i: PropertyResponse["images"][0]) => i.is_primary)?.image_url || prop.images?.[0]?.image_url || "/images/e8899428208cea05.jpg";
                  return (
                    <article key={prop.id} className="group flex flex-col bg-white rounded-[20px] overflow-hidden border border-[#E9EEF3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] hover:shadow-[0_16px_35px_-12px_rgba(21,115,117,0.25)] hover:-translate-y-[2px] transition-all h-full">
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#EEF2F6] shrink-0">
                        <LocalImage className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img} alt={prop.title} />
                        <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#157375] text-[11.5px] font-semibold shadow-sm flex items-center gap-1.5">
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
                          <span className="px-2.5 py-1 rounded-full bg-[#46B1B1] text-white text-[11px] font-semibold shadow-md flex items-center gap-1">
                            <Icon name="solar_power" className="material-symbols-outlined text-[13px] text-white" />Solar 24/7
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#64748B] truncate">{prop.location}</span>
                          <span className="flex items-center gap-1 text-[13.5px] font-bold text-[#0F2432] shrink-0">
                            <Icon name="star" className="material-symbols-outlined text-[#F59E0B] text-[17px]" />
                            —
                          </span>
                        </div>
                        <h2 className="text-[17px] font-bold text-[#0F2432] group-hover:text-[#157375] transition-colors line-clamp-1 mt-1.5">{prop.title}</h2>
                        <p className="text-[12.5px] text-[#64748B] mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Icon name="group" className="material-symbols-outlined text-[15px]" />{prop.max_guests} guests</span>
                          <span className="text-[#CBD5E1]">·</span>
                          <span className="inline-flex items-center gap-1"><Icon name="bed" className="material-symbols-outlined text-[15px]" />{prop.beds} beds</span>
                          <span className="text-[#CBD5E1]">·</span>
                          <span className="inline-flex items-center gap-1"><Icon name="bathtub" className="material-symbols-outlined text-[15px]" />{prop.bathrooms} baths</span>
                        </p>
                        <div className="mt-auto pt-4 mt-4 border-t border-[#EEF2F6] flex items-center justify-between gap-3">
                          <p className="min-w-0">
                            <span className="text-[19px] font-extrabold text-[#157375] tracking-tight">{formatPrice(prop.price_per_night)}</span>
                            <span className="text-[12px] text-[#64748B]"> / night</span>
                          </p>
                          <Link className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#157375] hover:bg-[#0f5f61] text-white text-[12.5px] font-bold transition-all shadow-[0_6px_16px_rgba(21,115,117,0.3)] shrink-0" href={`/properties/${prop.id}`}><Icon name="calendar_month" className="material-symbols-outlined text-[16px] text-white" />Check Dates</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="pt-0">
              <div className="relative overflow-hidden bg-white rounded-[20px] border border-[#E9EEF3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] px-6 sm:px-8 py-6 sm:py-0 sm:min-h-[128px] flex items-center">
                <div className="relative z-10 flex items-center gap-4 sm:gap-5 max-w-xl py-1">
                  <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E6F4F4] flex items-center justify-center text-[#157375] shrink-0">
                    <Icon name="cloud_done" className="material-symbols-outlined text-[30px]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#0F2432] tracking-tight">Your favorites are synced</h3>
                    <p className="text-[#64748B] mt-1 text-[13px] sm:text-[13.5px]">Your saved properties are stored in your StayLeb account and accessible from any device.</p>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 w-[46%] sm:w-[38%] pointer-events-none" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/favorites_footer.png" alt="" className="absolute inset-0 w-full h-full object-contain object-right-bottom opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/55 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}