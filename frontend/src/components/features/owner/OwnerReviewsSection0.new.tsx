"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getOwnerReviews, getOwnerReviewStats, type OwnerReview, type OwnerReviewStats } from "@/services/reviews";
import { getMyProperties, type PropertyResponse } from "@/services/owner";

function formatRating(v: string | number | null | undefined) {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toFixed(2);
}

export function OwnerReviewsSection0() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [reviews, setReviews] = useState<OwnerReview[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<OwnerReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    async function loadProps() {
      try {
        const props = await getMyProperties();
        if (!cancelled) setProperties(props);
      } catch {}
    }
    loadProps();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      setStatsLoading(true);
      try {
        const s = await getOwnerReviewStats(selectedProperty !== "all" ? selectedProperty : undefined);
        if (!cancelled) setStats(s);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    loadStats();
    return () => { cancelled = true; };
  }, [selectedProperty]);

  useEffect(() => {
    let cancelled = false;
    async function loadReviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOwnerReviews({
          property_id: selectedProperty !== "all" ? selectedProperty : undefined,
          search: search || undefined,
          page,
          page_size: pageSize,
        });
        if (!cancelled) {
          setReviews(res.items);
          setTotal(res.total);
          setTotalPages(res.total_pages);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, [selectedProperty, search, page]);

  const handlePropertyChange = (val: string) => {
    setSelectedProperty(val);
    setPage(1);
  };

  const portfolioRating = stats ? Number(stats.overall_rating) : 0;
  const totalReviews = stats?.total_reviews ?? 0;

  return (
    <>
      <main className="w-full pt-6 min-h-screen bg-background">
        <div className="flex flex-col w-full">
          <div className="p-space-lg max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <nav className="flex items-center gap-space-xxs text-on-surface-variant font-caption text-caption">
                <span className="hover:text-primary cursor-pointer transition-colors">Dashboard</span>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <span className="text-primary font-semibold">Reviews</span>
              </nav>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="flex flex-col max-w-2xl">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Guest Reviews & Ratings</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xxs">Inspect verified guest feedback for your properties across the seven StayLeb evaluation standards. Reviews are submitted by verified guests and are immutable.</p>
                </div>
                <div className="flex flex-col gap-2 min-w-[280px]">
                  <label className="font-caption text-caption text-on-surface-variant block">Search reviews</label>
                  <div className="relative">
                    <Icon name="search" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search property or comment..."
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-lowest border border-transparent shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <label className="font-caption text-caption text-on-surface-variant block mt-1">Filtered Property</label>
                  <div className="relative bg-surface-container-lowest rounded-xl shadow-sm hover:shadow transition-shadow">
                    <select
                      value={selectedProperty}
                      onChange={(e) => handlePropertyChange(e.target.value)}
                      className="w-full h-11 pl-space-sm pr-9 rounded-xl bg-transparent appearance-none font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Properties {stats ? `(${stats.total_reviews} reviews)` : ""}</option>
                      {properties.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.title} · {p.location}
                        </option>
                      ))}
                    </select>
                    <Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant text-[20px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-secondary-container/40 blur-2xl pointer-events-none"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Portfolio Rating</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">
                      <Icon name="hotel_class" className="material-symbols-outlined text-[14px]" /> Top Tier Host
                    </span>
                  </div>
                  {statsLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-500">Loading stats…</span>
                    </div>
                  ) : !stats || totalReviews === 0 ? (
                    <div className="flex items-baseline gap-space-xs mt-space-xs">
                      <span className="font-display text-display text-slate-400 font-bold tracking-tight">—</span>
                      <span className="font-caption text-caption text-on-surface-variant">No reviews yet</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-space-xs mt-space-xs">
                      <span className="font-display text-display text-primary font-bold tracking-tight">{formatRating(stats.overall_rating)}</span>
                      <div className="flex flex-col">
                        <div className="flex text-primary">
                          {[1,2,3,4,5].map((i) => (
                            <Icon key={i} name="star" className={`material-symbols-outlined text-[20px] ${i <= Math.round(portfolioRating) ? "text-primary" : "text-slate-300"}`} />
                          ))}
                        </div>
                        <span className="font-caption text-caption text-on-surface-variant">out of 5.0 maximum</span>
                      </div>
                    </div>
                  )}
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
                    {totalReviews > 0 ? (
                      <>Calculated from <strong className="text-on-surface font-semibold">{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</strong> with an authenticated stay record.</>
                    ) : (
                      "No verified reviews yet for your portfolio."
                    )}
                  </p>
                </div>
                <div className="mt-space-lg pt-space-md bg-surface-container-low p-space-sm rounded-lg flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Icon name="verified_user" className="material-symbols-outlined text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">StayLeb Verified Standard</span>
                    <span className="font-caption text-caption text-on-surface-variant">Seven strict baseline benchmarks enforced</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="equalizer" className="material-symbols-outlined text-primary text-[20px]" />
                    <span className="font-title-md text-title-md text-on-surface font-semibold">Seven StayLeb Evaluation Criteria</span>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">Benchmark Target: 4.80+</span>
                </div>
                {statsLoading ? (
                  <div className="py-8 flex justify-center">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !stats || totalReviews === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No ratings yet — averages will appear after your first review.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-lg gap-y-space-sm mt-space-xs">
                    {[
                      { label: "1. Overall Experience", value: stats.overall_rating },
                      { label: "2. Cleanliness", value: stats.cleanliness_rating },
                      { label: "3. Privacy", value: stats.privacy_rating },
                      { label: "4. Wi-Fi Reliability", value: stats.wifi_rating },
                      { label: "5. Hot Water & Power", value: stats.hot_water_rating },
                      { label: "6. Location & Views", value: stats.location_rating },
                      { label: "7. Value for Money", value: stats.value_rating },
                    ].map((r) => (
                      <div key={r.label} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-on-surface font-label-sm text-label-sm">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            {r.label}
                          </span>
                          <span className="font-semibold text-primary">
                            {formatRating(r.value)} <span className="text-on-surface-variant font-normal">/ 5.0</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${(Number(r.value) / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-md shadow-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                <Icon name="policy" className="material-symbols-outlined text-[20px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-on-surface font-bold">Immutable Review Policy</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">In accordance with StayLeb marketplace rules, hosts cannot edit, delete, or publicly dispute guest reviews. If a review violates platform terms or contains inappropriate content, submit a review moderation request to StayLeb Admin.</p>
              </div>
            </div>

            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">Verified Evaluations</h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">{total} total</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">Page {page} of {totalPages || 1}</span>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Loading reviews…</p>
                </div>
              ) : error ? (
                <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-space-sm">
                    <Icon name="rate_review" className="material-symbols-outlined text-[32px]" />
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold">No reviews yet</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-space-xxs">Reviews from completed stays will appear here once guests submit their evaluation.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-space-md" id="reviews-feed">
                  {reviews.map((rev) => (
                    <article key={rev.id} className="review-item bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row gap-space-md">
                      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-space-xs md:w-56 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center font-title-md text-title-md">G</div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">StayLeb Guest</span>
                          <span className="font-caption text-caption text-secondary font-medium">Verified StayLeb Guest</span>
                          <span className="font-caption text-caption text-on-surface-variant mt-1">{new Date(rev.created_at).toLocaleDateString()}</span>
                          <span className="font-caption text-caption text-on-surface-variant">Booking #SL-{String(rev.booking_id).padStart(4, "0")}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between gap-space-sm">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex flex-wrap items-center justify-between gap-space-xs">
                            <div className="flex items-center gap-space-xs">
                              <div className="flex items-center px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                                {Number(rev.overall_rating).toFixed(1)} ★
                              </div>
                              <span className="font-label-md text-label-md text-on-surface font-medium">{rev.property.title}</span>
                            </div>
                            <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption">
                              <Icon name="verified" className="material-symbols-outlined text-[16px] text-primary" />
                              <span>Verified Review</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-space-xxs pt-1">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Overall {rev.overall_rating}/5</span>
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Cleanliness {rev.cleanliness_rating}/5</span>
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Privacy {rev.privacy_rating}/5</span>
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Wi-Fi {rev.wifi_rating}/5</span>
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Hot Water {rev.hot_water_rating}/5</span>
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Location {rev.location_rating}/5</span>
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption">Value {rev.value_rating}/5</span>
                          </div>
                          <blockquote className="font-body-md text-body-md text-on-surface mt-space-xs leading-relaxed italic">
                            {rev.comment ? `“${rev.comment}”` : <span className="text-slate-400">No comment.</span>}
                          </blockquote>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-caption text-caption">
                          <span>{rev.property.location}</span>
                          <span className="flex items-center gap-1">
                            <Icon name="lock" className="material-symbols-outlined text-[14px]" />
                            Immutable Verified Review
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-space-md bg-surface-container-lowest rounded-xl">
                  <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-4 py-2 rounded-lg text-sm font-medium ${page <= 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-container"}`}>
                      Previous
                    </button>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`px-4 py-2 rounded-lg text-sm font-medium ${page >= totalPages ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-container"}`}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
