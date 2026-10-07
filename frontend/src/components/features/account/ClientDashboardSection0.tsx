"use client";
import { useEffect, useMemo, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";
import { getMyBookings } from "@/services/bookings";
import type { BookingResponse } from "@/services/bookings";
import { getPublicProperty, getCachedPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
import { getReviewByBooking, type Review } from "@/services/reviews";
import { useFavorites } from "@/components/features/market/ListingSearch";
import { getCachedFavorites } from "@/services/favorites";
import { AISearchSection } from "@/components/features/market/AISearchSection";
import { BookingStatusOverview } from "@/components/features/account/BookingStatusOverview";
import { ReviewReminderCard } from "@/components/features/account/ReviewReminderCard";
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

export function ClientDashboardSection0() {
  const [bookings, setBookings] = useState<BookingResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propsMap, setPropsMap] = useState<Record<number, PropertyResponse>>({});
  const [reviewMap, setReviewMap] = useState<Record<number, Review | null | undefined>>({});
  // Favorites come from FavoritesProvider (mounted by AppShell above this
  // page): one shared request, synchronized cards/counts after add/remove,
  // per-user isolation and logout clearing handled by the provider.
  const { favoriteItems, loading: favoritesLoading } = useFavorites();

  // Booking cards read through this lookup, which layers favorite property
  // data over fetched details. Derived (not stored) so later-arriving
  // favorites enrich cards automatically without extra requests or effects.
  const enrichedPropsMap = useMemo(() => {
    const next: Record<number, PropertyResponse> = { ...propsMap };
    for (const item of favoriteItems) {
      if (next[item.property.id] === undefined) {
        next[item.property.id] = item.property;
      }
    }
    return next;
  }, [propsMap, favoriteItems]);

  useEffect(() => {
    let cancelled = false;
    const propController = new AbortController();
    async function loadProperties(propertyIds: number[]) {
      // Reuse property objects already in hand (favorites payload or an
      // existing cache entry): fetch only missing unique IDs, without
      // waiting for any in-flight favorites request. Cached reads resolve
      // synchronously, so repeat visits and already-seen properties issue
      // no network calls at all.
      const known = new Set<number>();
      for (const item of getCachedFavorites()?.items ?? []) {
        if (propertyIds.includes(item.property.id)) known.add(item.property.id);
      }
      const cachedEntries: Record<number, PropertyResponse> = {};
      const missing = propertyIds.filter((pid) => {
        if (known.has(pid)) return false;
        const hit = getCachedPublicProperty(pid);
        if (hit) {
          cachedEntries[pid] = hit;
          return false;
        }
        return true;
      });
      if (!cancelled && Object.keys(cachedEntries).length > 0) {
        setPropsMap((prev) => {
          let changed = false;
          const next: Record<number, PropertyResponse> = { ...prev };
          for (const [key, prop] of Object.entries(cachedEntries)) {
            const pid = Number(key);
            if (next[pid] === undefined) {
              next[pid] = prop;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
      // Enrich cards progressively as each detail resolves; a missing or
      // unavailable property keeps its stable placeholder (see render).
      await Promise.all(
        missing.map(async (pid) => {
          try {
            const p = await getPublicProperty(pid, { signal: propController.signal });
            if (!cancelled) {
              setPropsMap((prev) => (prev[pid] === undefined ? { ...prev, [pid]: p } : prev));
            }
          } catch {}
        })
      );
    }
    async function loadReviews(completed: BookingResponse[]) {
      if (completed.length === 0) return;
      // Review checks need only booking IDs: each reminder appears as its
      // check resolves. A 404 simply means "no review yet" and keeps the
      // reminder eligible (see eligibleUnreviewedStays).
      await Promise.all(
        completed.map(async (b) => {
          let review: Review | null;
          try {
            review = await getReviewByBooking(b.id);
          } catch {
            review = null;
          }
          if (!cancelled) {
            setReviewMap((prev) => (prev[b.id] === undefined ? { ...prev, [b.id]: review } : prev));
          }
        })
      );
    }
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBookings();
        if (cancelled) return;
        setBookings(data);
        // Booking summaries render now; property details and review checks
        // enrich their sections independently as they resolve.
        setLoading(false);
        const unique = [...new Set(data.map((b) => b.property_id))];
        const completed = data.filter((b) => b.status === "completed");
        loadProperties(unique);
        loadReviews(completed);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; propController.abort(); };
  }, []);

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[#157375] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748B]">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Link href="/search" className="text-[#157375] underline mt-4 inline-block font-semibold">Discover stays</Link>
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
  const cancelledCount = list.filter((b) => b.status === "cancelled" || b.status === "rejected").length;
  const firstPending = list.find((b) => b.status === "pending") ?? null;

  const eligibleUnreviewedStays = completed
    .filter((b) => {
      const review = reviewMap[b.id];
      return review === null;
    })
    .sort((a, b) => {
      const dateA = new Date(a.check_out).getTime();
      const dateB = new Date(b.check_out).getTime();
      return dateB - dateA;
    });

  const latestReviewStay = eligibleUnreviewedStays[0]
    ? {
        booking: eligibleUnreviewedStays[0],
        property: enrichedPropsMap[eligibleUnreviewedStays[0].property_id],
      }
    : null;
  // The reminder card needs property details: it appears once they arrive
  // rather than blocking on (or crashing without) them.
  const readyReviewStay =
    latestReviewStay && latestReviewStay.property ? { booking: latestReviewStay.booking, property: latestReviewStay.property } : null;
  const additionalReviewCount = Math.max(0, eligibleUnreviewedStays.length - 1);

  const recentCompleted = completed.slice(0, 1);
  const favProperties = favoriteItems.slice(0, 3).map((item) => item.property);
  const singleFav = favProperties.length === 1 ? favProperties[0] ?? null : null;

  return (
    <>
      <main className="w-full min-h-screen bg-[#F2F5FA] flex flex-col">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 sm:space-y-7">
          {/* 1. Welcome hero */}
          <section className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] p-6 sm:p-8 lg:p-9 border border-[#E9EEF3] relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-[46%] hidden md:block pointer-events-none" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/search_hero.png" alt="" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 w-full md:hidden pointer-events-none opacity-[0.12]" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/search_hero.png" alt="" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40" />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFF5F4] text-[#157375] text-[11px] font-bold tracking-wide w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#157375]"></span>
                  Client Dashboard
                </span>
                <h1 className="text-[32px] sm:text-[38px] leading-[1.1] font-extrabold text-[#0F2432] tracking-tight">Welcome <span className="text-[#157375]">back</span></h1>
                <p className="text-[14px] sm:text-[15px] text-[#64748B] leading-relaxed max-w-xl">
                  {upcoming.length > 0 ? (
                    <>You have <strong className="text-[#0F2432]">{upcoming.length} upcoming {upcoming.length === 1 ? "trip" : "trips"}</strong>{completedCount > 0 && (<> and <strong className="text-[#0F2432]">{completedCount} completed {completedCount === 1 ? "stay" : "stays"}</strong></>)}. Ready for the next one?</>
                  ) : (
                    "Ready to find your next stay in Lebanon? Browse verified chalets and mountain retreats."
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-row flex-wrap items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                <Link className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white hover:text-white text-[14px] font-semibold shadow-[0_10px_25px_rgba(21,115,117,0.3)] transition-all active:scale-[0.98] w-full sm:w-auto" href="/search">Discover stays<Icon name="arrow_forward" className="material-symbols-outlined text-[18px] text-white" /></Link>
                <Link className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#157375] text-[14px] font-semibold shadow-sm transition-colors w-full sm:w-auto" href="/account/bookings">My bookings</Link>
              </div>
            </div>
          </section>

          {/* 2. AI Search Section */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#157375] font-bold">AI-powered property search</p>
                <h2 className="text-[26px] sm:text-[30px] font-extrabold text-[#0F2432] tracking-tight leading-tight">Describe it, we&apos;ll find it</h2>
                <p className="text-[13.5px] sm:text-[14.5px] text-[#64748B] max-w-2xl">Tell us the vibe, area and group size — StayLeb AI matches you with verified properties only.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E9EEF3] shadow-sm text-[12px] text-[#157375] font-bold shrink-0 w-fit">
                <Icon name="verified" className="material-symbols-outlined text-[17px] text-[#157375]" />
                Verified properties only
              </span>
            </div>
            <AISearchSection />
          </section>

          {/* 3. Booking Status Overview */}
          <section aria-label="Booking status overview">
            <BookingStatusOverview
              total={list.length}
              pending={pendingCount}
              confirmed={confirmedCount}
              completed={completedCount}
              cancelled={cancelledCount}
            />
          </section>

          {/* 4. Needs Your Attention */}
          {pendingCount > 0 && firstPending && (
            <section aria-label="Needs your attention" className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] p-5 sm:p-6 border border-[#E9EEF3] border-l-4 border-l-amber-400">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#FFFBEB] border border-[#FDE68A]/60 flex items-center justify-center text-[#D97706] shrink-0">
                  <Icon name="pending_actions" className="material-symbols-outlined text-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[17px] font-bold text-[#0F2432]">Needs your attention</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A]/60 text-[#B45309] text-[11px] font-bold">{pendingCount} pending</span>
                  </div>
                  <p className="text-[13.5px] text-[#64748B] mt-1 max-w-2xl">
                    You have {pendingCount} {pendingCount === 1 ? "booking" : "bookings"} awaiting payment{firstPending ? <> — including <strong className="text-[#0F2432]">{enrichedPropsMap[firstPending.property_id]?.title || `Property #${firstPending.property_id}`}</strong></> : ""}. Complete payment to secure {pendingCount === 1 ? "it" : "them"}.
                  </p>
                </div>
                <Link className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white text-[13.5px] font-semibold shadow-[0_8px_20px_rgba(21,115,117,0.25)] transition-all active:scale-[0.98] shrink-0 text-center w-full md:w-auto" href={`/account/bookings/${firstPending.id}?booking_id=${firstPending.id}`}>View booking</Link>
              </div>
            </section>
          )}

          {/* Post-stay review prompt (latest completed stay) */}
          {recentCompleted.length > 0 && (
            <section className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] p-5 sm:p-6 border border-[#E9EEF3]">
              {recentCompleted.map((b) => {
                const prop = enrichedPropsMap[b.property_id];
                const review = reviewMap[b.id];
                return (
                  <div key={b.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-[14px] bg-[#E6F4F4] flex items-center justify-center text-[#157375] shrink-0">
                      <Icon name={review ? "check_circle" : "rate_review"} className="material-symbols-outlined text-[24px]" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[16px] font-bold text-[#0F2432]">
                          How was your recent stay{favProperties.length ? "" : ""}?
                        </h3>
                        {prop && (
                          <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] text-[#64748B] font-medium">
                            {prop.title} · {formatDate(b.check_out)}
                          </span>
                        )}
                      </div>
                      <p className="text-[13.5px] text-[#64748B] max-w-2xl">
                        Share your authentic feedback on Cleanliness, Wi-Fi speed, 24/7 Solar power stability, and host hospitality to help Lebanese travelers.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                      <Link className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#46B1B1] hover:bg-[#157375] text-white text-[13.5px] font-semibold shadow-sm transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5" href={`/account/bookings/${b.id}/review`}>
                        <Icon name="rate_review" className="material-symbols-outlined text-[18px]" />
                        Write a Review
                      </Link>
                    </div>
                  </div>
                );
              })}
            </section>
            )}

          {/* 5. Thank You / Review Reminder */}
          {readyReviewStay && (
            <ReviewReminderCard
              latestStay={readyReviewStay}
              additionalCount={additionalReviewCount}
            />
          )}

          {/* 7. Your Saved Properties */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#157375] font-bold">Saved for later</p>
                <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#0F2432] tracking-tight leading-tight">Your Saved Properties</h2>
                <p className="text-[13.5px] text-[#64748B]">Chalets and seaside villas you have favorited.</p>
              </div>
              <ActionButton className="text-[13.5px] text-[#157375] font-bold hover:underline flex items-center gap-1 shrink-0" actionLabel={`View All Favorites (${favoriteItems.length}) chevron_right`} aria-label={`View All Favorites (${favoriteItems.length}) chevron_right`}>
                <span>View All Favorites ({favoriteItems.length})</span>
                <Icon name="chevron_right" className="material-symbols-outlined text-[18px]" />
              </ActionButton>
            </div>

            {favoritesLoading ? (
              <div role="status" aria-label="Loading saved stays" className="p-10 sm:p-14 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3] text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-[#E6F4F4]" />
                <p className="text-[13.5px] text-[#64748B]">Loading saved stays…</p>
              </div>
            ) : favoriteItems.length === 0 ? (
              <div className="p-10 sm:p-14 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3] text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E6F4F4] flex items-center justify-center text-[#157375]">
                  <Icon name="favorite_border" className="material-symbols-outlined text-[30px]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#0F2432]">No saved stays yet</h3>
                <p className="text-[13.5px] text-[#64748B] max-w-xl leading-relaxed">Save chalets and furnished houses you like while browsing StayLeb. Your saved getaways will stay synced here for effortless comparison and group sharing.</p>
                <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white text-[13.5px] font-semibold shadow-[0_8px_20px_rgba(21,115,117,0.25)] transition-all" href="/account/properties">Discover Properties<Icon name="arrow_forward" className="material-symbols-outlined text-[17px]" /></Link>
              </div>
            ) : singleFav ? (
              <article className="group flex flex-col md:flex-row bg-white rounded-[18px] overflow-hidden border border-[#E6EBF0] shadow-[0_2px_10px_rgba(15,40,50,0.05)] hover:shadow-[0_16px_35px_-12px_rgba(21,115,117,0.25)] transition-all">
                <div className="relative w-full md:w-72 lg:w-80 h-52 md:h-auto md:min-h-[210px] shrink-0 overflow-hidden bg-[#EEF2F6]">
                  <LocalImage className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={singleFav.images?.find((i: PropertyResponse["images"][0]) => i.is_primary)?.image_url || singleFav.images?.[0]?.image_url || "/images/e8899428208cea05.jpg"} alt={singleFav.title} />
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#157375] text-[11.5px] font-semibold shadow-sm flex items-center gap-1.5">
                      <Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />Verified Host
                    </span>
                    <div className="pointer-events-auto"><FavoriteButton id={String(singleFav.id)} /></div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#157375] text-white text-[11px] font-semibold shadow-md flex items-center gap-1">
                      <Icon name="solar_power" className="material-symbols-outlined text-[13px] text-white" />Solar 24/7
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#157375]">{singleFav.location}</span>
                      <div className="flex items-center gap-1 text-[#157375] text-[12px] font-semibold">
                        <Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
                        <span>—</span>
                      </div>
                    </div>
                    <h2 className="text-[17px] text-[#0F2432] font-bold group-hover:text-[#157375] transition-colors line-clamp-1">{singleFav.title}</h2>
                    <p className="text-[13px] text-[#64748B] line-clamp-1">{singleFav.max_guests} guests · {singleFav.beds} beds · {singleFav.bathrooms} baths</p>
                  </div>
                  <div className="pt-3 flex items-center justify-between border-t border-[#EEF2F6]">
                    <div>
                      <span className="text-[19px] font-extrabold text-[#157375]">{formatPrice(singleFav.price_per_night)}</span>
                      <span className="text-[12.5px] text-[#64748B]"> / night</span>
                    </div>
                    <Link className="px-4 py-2.5 rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white text-[13px] font-semibold transition-colors shadow-sm" href={`/properties/${singleFav.id}`}>Check Dates</Link>
                  </div>
                </div>
              </article>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {favProperties.map((prop: PropertyResponse) => {
                  if (!prop) return null;
                  const img = prop.images?.find((i: PropertyResponse["images"][0]) => i.is_primary)?.image_url || prop.images?.[0]?.image_url || "/images/e8899428208cea05.jpg";
                  return (
                    <article key={prop.id} className="group flex flex-col bg-white rounded-[18px] overflow-hidden border border-[#E6EBF0] shadow-[0_2px_10px_rgba(15,40,50,0.05)] hover:shadow-[0_16px_35px_-12px_rgba(21,115,117,0.25)] hover:-translate-y-[2px] transition-all h-full">
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#EEF2F6] shrink-0">
                        <LocalImage className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img} alt={prop.title} />
                        <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#157375] text-[11.5px] font-semibold shadow-sm flex items-center gap-1.5">
                            <Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />Verified Host
                          </span>
                          <div className="pointer-events-auto"><FavoriteButton id={String(prop.id)} /></div>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-[#157375] text-white text-[11px] font-semibold shadow-md flex items-center gap-1">
                            <Icon name="solar_power" className="material-symbols-outlined text-[13px] text-white" />Solar 24/7
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#157375]">{prop.location}</span>
                            <div className="flex items-center gap-1 text-[#157375] text-[12px] font-semibold">
                              <Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
                              <span>—</span>
                            </div>
                          </div>
                          <h2 className="text-[16px] text-[#0F2432] font-bold group-hover:text-[#157375] transition-colors line-clamp-1">{prop.title}</h2>
                          <p className="text-[13px] text-[#64748B] line-clamp-1">{prop.max_guests} guests · {prop.beds} beds · {prop.bathrooms} baths</p>
                        </div>
                        <div className="pt-3 flex items-center justify-between border-t border-[#EEF2F6]">
                          <div>
                            <span className="text-[18px] font-extrabold text-[#157375]">{formatPrice(prop.price_per_night)}</span>
                            <span className="text-[12.5px] text-[#64748B]"> / night</span>
                          </div>
                          <Link className="px-3.5 py-2 rounded-full bg-[#157375] hover:bg-[#0f5f61] text-white text-[12.5px] font-semibold transition-colors shadow-sm" href={`/properties/${prop.id}`}>Check Dates</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* 8. Bottom travel CTA */}
          <section className="bg-gradient-to-r from-[#0E5F61] via-[#157375] to-[#2A8B8D] rounded-[20px] shadow-[0_12px_30px_rgba(21,115,117,0.3)] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-[38%] hidden sm:block pointer-events-none" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/search_hero.png" alt="" className="w-full h-full object-cover object-center opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#157375] via-[#157375]/60 to-transparent" />
            </div>
            <div className="absolute -left-10 -bottom-16 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70 font-bold">Complete stay → Share experience → Discover next stay</p>
                <h3 className="text-[22px] sm:text-[26px] font-extrabold text-white tracking-tight leading-tight">Ready for your next Lebanese getaway?</h3>
                <p className="text-[13.5px] text-white/85 leading-relaxed">
                  Every StayLeb property is vetted in-person — 24/7 solar power, fast fiber internet and genuine host hospitality.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                <Link className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#157375] text-[14px] font-bold shadow-sm hover:bg-white/90 transition-all active:scale-[0.98] w-full sm:w-auto" href="/account/properties">
                  Discover Properties
                  <Icon name="arrow_forward" className="material-symbols-outlined text-[18px] text-[#157375]" />
                </Link>
                <ActionButton className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-white/40 text-white text-[14px] font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto" actionLabel="Ask StayLeb Concierge" aria-label="Ask StayLeb Concierge">
                  Ask StayLeb Concierge
                </ActionButton>
              </div>
            </div>
          </section>

          {/* 9. Footer */}
          <footer className="pt-2 pb-8 text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-[#64748B] font-medium">
              <span className="flex items-center gap-1.5"><Icon name="solar_power" className="material-symbols-outlined text-[17px] text-[#157375]" />24/7 Verified Solar</span>
              <span className="hidden sm:inline text-[#CBD5E1]">|</span>
              <span className="flex items-center gap-1.5"><Icon name="verified_user" className="material-symbols-outlined text-[17px] text-[#157375]" />Verified Hosts</span>
              <span className="hidden sm:inline text-[#CBD5E1]">|</span>
              <span className="flex items-center gap-1.5"><Icon name="payments" className="material-symbols-outlined text-[17px] text-[#157375]" />Flexible Cash or Online</span>
            </div>
            <p className="text-[11.5px] text-[#94A3B8]">© 2024 StayLeb. Crafted for discovering authenticated stays across Lebanon.</p>
          </footer>
        </div>
      </main>
    </>
  );
}