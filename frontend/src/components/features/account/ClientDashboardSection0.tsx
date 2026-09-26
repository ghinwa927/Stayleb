"use client";
import { useEffect, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";
import { getMyBookings } from "@/services/bookings";
import type { BookingResponse } from "@/services/bookings";
import { getPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
import { getReviewByBooking, type Review } from "@/services/reviews";
import { getFavorites, type FavoritePropertyItem } from "@/services/favorites";
import { AISearchSection } from "@/components/features/market/AISearchSection";
import Swal from "sweetalert2";

function formatPrice(v: string | number) {
  const n = Number(v);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return dateStr; }
}

function statusConfig(status: string) {
  const s = status?.toLowerCase();
  if (s === "pending") return { bg: "bg-amber-50 text-amber-700", label: "Pending" };
  if (s === "confirmed" || s === "paid") return { bg: "bg-emerald-50 text-emerald-700", label: "Confirmed" };
  if (s === "completed") return { bg: "bg-blue-50 text-blue-700", label: "Completed" };
  if (s === "cancelled" || s === "rejected") return { bg: "bg-rose-50 text-rose-700", label: s === "cancelled" ? "Cancelled" : "Rejected" };
  return { bg: "bg-slate-100 text-slate-700", label: status };
}

export function ClientDashboardSection0() {
  const [bookings, setBookings] = useState<BookingResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propsMap, setPropsMap] = useState<Record<number, PropertyResponse>>({});
  const [reviewMap, setReviewMap] = useState<Record<number, Review | null | undefined>>({});
  const [favorites, setFavorites] = useState<FavoritePropertyItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBookings();
        if (!cancelled) setBookings(data);
        const unique = [...new Set(data.map((b) => b.property_id))];
        const map: Record<number, PropertyResponse> = {};
        await Promise.all(
          unique.map(async (pid) => {
            try {
              const p = await getPublicProperty(pid);
              map[pid] = p;
            } catch {}
          })
        );
        if (!cancelled) setPropsMap(map);
        const completed = data.filter((b) => b.status === "completed");
        if (completed.length > 0) {
          const reviews = await Promise.all(
            completed.map(async (b) => {
              try {
                const r = await getReviewByBooking(b.id);
                return { id: b.id, review: r };
              } catch {
                return { id: b.id, review: null };
              }
            })
          );
          if (!cancelled) {
            const m: Record<number, Review | null> = {};
            reviews.forEach(({ id, review }) => { m[id] = review; });
            setReviewMap(m);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Load favorites from backend
  useEffect(() => {
    let cancelled = false;
    async function loadFavorites() {
      setFavoritesLoading(true);
      try {
        const response = await getFavorites();
        if (!cancelled) setFavorites(response.items);
      } catch (e) {
        // Silently fail - favorites are not critical for dashboard
        console.error('Failed to load favorites:', e);
      } finally {
        if (!cancelled) setFavoritesLoading(false);
      }
    }
    loadFavorites();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Link href="/search" className="text-primary underline mt-4 inline-block">Discover stays</Link>
        </div>
      </main>
    );
  }

  const list = bookings ?? [];
  const upcoming = list.filter((b) => b.status === "pending" || b.status === "confirmed" || b.status === "paid");
  const completed = list.filter((b) => b.status === "completed");
  const pendingCount = list.filter((b) => b.status === "pending").length;
  const confirmedCount = list.filter((b) => b.status === "confirmed" || b.status === "paid").length;
  const completedCount = completed.length;

  const recentCompleted = completed.slice(0, 1);

  // Favorites from backend
  const favProperties = favorites.slice(0, 3).map((item) => item.property);

  return (
    <>
      <main className="w-full min-h-screen bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <section className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-headline-lg font-headline-lg text-[#157375] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-body-lg font-body-lg text-on-surface-variant">
                  Ready to find your next stay in Lebanon? Browse verified chalets and mountain retreats.
                </p>
              </div>
            </section>

            {/* AI Search - Prominent at top */}
            <section className="bg-gradient-to-br from-primary via-primary/10 to-secondary/5 rounded-3xl p-6 md:p-8 shadow-xl border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                      <Icon name="auto_awesome" className="material-symbols-outlined text-[22px]" />
                    </span>
                    <span className="text-caption font-caption text-primary uppercase font-semibold tracking-wider">AI Search</span>
                  </div>
                  <h2 className="text-headline-lg font-headline-lg text-[#157375] font-bold tracking-tight">
                    Find your perfect stay with AI
                  </h2>
                  <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
                    Describe your ideal stay in your own words — <span className="font-semibold text-primary">"chalet in Faraya with fireplace for 4 guests"</span> — and let AI find the perfect match from verified properties.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <AISearchSection />
                </div>
              </div>
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-on-surface-variant/60">
                <span>Powered by StayLeb AI</span>
                <span>Results from verified properties only</span>
              </div>
            </section>

            {recentCompleted.length > 0 && (
              <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                {recentCompleted.map((b) => {
                  const prop = propsMap[b.property_id];
                  const review = reviewMap[b.id];
                  return (
                    <div key={b.id} className="flex items-start md:items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                        <Icon name={review ? "check_circle" : "rate_review"} className="material-symbols-outlined text-[24px]" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-title-md font-title-md text-[#157375]">
                            How was your recent stay{favProperties.length ? "" : ""}?
                          </h3>
                          {prop && (
                            <span className="px-2 py-0.5 rounded-md bg-surface-container text-caption font-caption text-on-surface-variant font-medium">
                              {prop.title} · {formatDate(b.check_out)}
                            </span>
                          )}
                        </div>
                        <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl">
                          Share your authentic feedback on Cleanliness, Wi-Fi speed, 24/7 Solar power stability, and host hospitality to help Lebanese travelers.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {!review && (
                          <Link className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all active:scale-[0.98]" href={`/account/bookings/${b.id}/review`}>
                            Write Review
                          </Link>
                        )}
                        <ActionButton className="px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors text-label-md font-label-md" actionLabel="Dismiss" aria-label="Dismiss">
                          Dismiss
                        </ActionButton>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-md font-headline-md text-[#157375]">Your Active Bookings</h2>
                <ActionButton className="text-label-md font-label-md text-primary-container font-semibold hover:underline flex items-center gap-1" actionLabel={`All Trips (${list.length}) chevron_right`} aria-label={`All Trips (${list.length}) chevron_right`}>
                  <span>All Trips ({list.length})</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[16px]" />
                </ActionButton>
              </div>
              <div className="flex items-center space-x-1 text-sm bg-white rounded-full p-1.5 border w-fit shadow-sm flex-wrap gap-1">
                <button type="button" className={`px-4 py-1.5 rounded-full font-medium transition-colors bg-primary text-white shadow-sm`}>{list.length} total</button>
                <button type="button" className={`px-4 py-1.5 rounded-full font-medium transition-colors text-slate-600 hover:bg-slate-100`}>{pendingCount} pending</button>
                <button type="button" className={`px-4 py-1.5 rounded-full font-medium transition-colors text-slate-600 hover:bg-slate-100`}>{confirmedCount} confirmed</button>
                <button type="button" className={`px-4 py-1.5 rounded-full font-medium transition-colors text-slate-600 hover:bg-slate-100`}>{completedCount} completed</button>
              </div>

              {upcoming.length === 0 ? (
                <div className="p-12 bg-surface-container-lowest rounded-xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                    <Icon name="travel_explore" className="material-symbols-outlined text-[32px]" />
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface">No upcoming bookings</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">When you book a StayLeb chalet, your reservation details will appear here.</p>
                  <Link className="px-6 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md inline-block shadow-sm" href="/account/properties">Discover Properties</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcoming.map((b) => {
                    const prop = propsMap[b.property_id];
                    const img = prop?.images?.find((i) => i.is_primary)?.image_url || prop?.images?.[0]?.image_url || "/images/e1e779f8d5dc0f92.jpg";
                    const statusCfg = statusConfig(b.status);
                    const paymentLabel = b.status === "pending" ? "Awaiting payment" : "Paid";
                    return (
                      <article key={b.id} className="booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all p-5 md:p-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                          <div className="relative w-full lg:w-72 h-48 rounded-lg overflow-hidden shrink-0">
                            <LocalImage className="w-full h-full object-cover" src={img} alt={prop?.title || "Property"} />
                            <div className="absolute top-3 left-3">
                              <RecordStatus className={`px-2.5 py-1 rounded-full ${statusCfg.bg} text-label-sm font-label-sm font-semibold flex items-center gap-1 shadow-sm`} initial={statusCfg.label} />
                            </div>
                            <div className="absolute bottom-3 left-3 bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface text-caption font-caption px-2 py-0.5 rounded">
                              {prop?.location || "Lebanon"}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between gap-4 w-full">
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium ${statusCfg.bg}`}>{statusCfg.label}</span>
                                <span className="font-body-md text-body-md font-semibold text-primary">{formatPrice(b.total_price)} total · {b.number_of_nights} nights</span>
                              </div>
                              <h2 className="font-title-md text-title-md text-on-surface">{prop?.title || `Property #${b.property_id}`}</h2>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-on-surface-variant font-body-md text-body-md text-sm">
                                <span className="flex items-center gap-1"><Icon name="calendar_month" className="text-[16px]"/> {formatDate(b.check_in)} → {formatDate(b.check_out)}</span>
                                <span className="flex items-center gap-1"><Icon name="group" className="text-[16px]"/> {b.guests} guests</span>
                                <span className="flex items-center gap-1"><Icon name="payments" className="text-[16px]"/> {paymentLabel}</span>
                              </div>
                            </div>
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                              <span className="text-xs text-slate-500">Created {formatDate(b.created_at)}</span>
                              <div className="flex items-center gap-2">
                                <Link className="px-5 py-2.5 rounded-lg font-label-md text-label-md bg-primary text-white hover:opacity-95 shadow-sm" href={`/account/bookings/${b.id}?booking_id=${b.id}`}>View Details</Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-headline-md font-headline-md text-[#157375]">Your Saved Properties</h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">Chalets and seaside villas you have favorited</p>
                </div>
                <ActionButton className="text-label-md font-label-md text-primary-container font-semibold hover:underline flex items-center gap-1" actionLabel={`View All Favorites (${favorites.length}) chevron_right`} aria-label={`View All Favorites (${favorites.length}) chevron_right`}>
                  <span>View All Favorites ({favorites.length})</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[16px]" />
                </ActionButton>
              </div>

              {favorites.length === 0 ? (
                <div className="p-12 bg-surface-container-lowest rounded-xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                    <Icon name="favorite_border" className="material-symbols-outlined text-[32px]" />
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface">No saved stays yet</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Save chalets and furnished houses you like while browsing StayLeb. Your saved getaways will stay synced here for effortless comparison and group sharing.</p>
                  <Link className="px-6 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md inline-block shadow-sm" href="/account/properties">Discover Properties</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favProperties.map((prop: PropertyResponse) => {
                    if (!prop) return null;
                    const img = prop.images?.find((i: PropertyResponse["images"][0]) => i.is_primary)?.image_url || prop.images?.[0]?.image_url || "/images/e8899428208cea05.jpg";
                    return (
                      <article key={prop.id} className="group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_32px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1">
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container">
                          <LocalImage className="w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]" src={img} alt={prop.title} />
                          <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
                            <span className="px-2.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#157375] font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5">
                              <Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />Verified Host
                            </span>
                            <div className="pointer-events-auto"><FavoriteButton id={String(prop.id)} onClick={() => {}} /></div>
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
            </section>

            <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Icon name="shield" className="material-symbols-outlined text-[20px] text-primary-container" />
                    <span className="text-caption font-caption text-primary-container uppercase font-semibold tracking-wider">StayLeb Quality Guarantee</span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-[#157375] font-semibold">Looking for a specific Lebanese region?</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                    Every property on StayLeb is vetted in-person. We confirm 24/7 electricity via solar systems, high-speed fiber internet, and genuine Lebanese host hospitality.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link className="px-5 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all active:scale-[0.98]" href="/account/properties">
                    Discover Properties
                  </Link>
                  <ActionButton className="px-4 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-[#157375] font-label-md text-label-md transition-colors" actionLabel="Ask StayLeb Concierge" aria-label="Ask StayLeb Concierge">
                    Ask StayLeb Concierge
                  </ActionButton>
                </div>
              </div>
            </section>

            <footer className="pt-8 pb-12 text-center text-body-md font-body-md text-outline space-y-3">
              <div className="flex items-center justify-center gap-6 text-label-sm font-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5"><Icon name="solar_power" className="material-symbols-outlined text-[16px] text-primary-container" /> 24/7 Verified Solar</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Icon name="verified_user" className="material-symbols-outlined text-[16px] text-primary-container" /> Verified Hosts</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Icon name="payments" className="material-symbols-outlined text-[16px] text-primary-container" /> Flexible Cash or Online</span>
              </div>
              <p className="text-caption font-caption text-outline">© 2024 StayLeb. Crafted for discovering authenticated stays across Lebanon.</p>
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}