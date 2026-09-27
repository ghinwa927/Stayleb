"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getOwnerReviews, getOwnerReviewStats, type OwnerReview, type OwnerReviewStats, reportOwnerReview } from "@/services/reviews";
import { getMyProperties, type PropertyResponse } from "@/services/owner";

function formatRating(v: string | number | null | undefined) {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toFixed(2);
}

function formatScore(v: string | number | null | undefined) {
  const n = Number(v);
  if (v === null || v === undefined || isNaN(n)) return "—";
  return n.toFixed(1);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function Stars({ value, className = "text-[16px]" }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          className={`material-symbols-outlined ${className} ${i <= rounded ? "text-amber-500" : "text-surface-container-high"}`}
        />
      ))}
    </span>
  );
}

function scoreTone(v: number) {
  if (v >= 4.5) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v >= 4.0) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

const CRITERIA: { key: keyof Omit<OwnerReviewStats, "total_reviews">; label: string; hint: string }[] = [
  { key: "overall_rating", label: "Overall experience", hint: "General satisfaction" },
  { key: "cleanliness_rating", label: "Cleanliness", hint: "Hygiene & upkeep" },
  { key: "privacy_rating", label: "Privacy", hint: "Seclusion & quiet" },
  { key: "wifi_rating", label: "Wi-Fi reliability", hint: "Speed & stability" },
  { key: "hot_water_rating", label: "Hot water & power", hint: "Utilities" },
  { key: "location_rating", label: "Location & views", hint: "Setting & access" },
  { key: "value_rating", label: "Value for money", hint: "Price fairness" },
];

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
  const [reportTarget, setReportTarget] = useState<OwnerReview | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

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

  async function handleReport() {
    if (!reportTarget) return;
    const reason = reportReason.trim();
    if (reason.length < 5) {
      setReportError("Please provide at least 5 characters.");
      return;
    }
    if (reason.length > 500) {
      setReportError("Reason must be at most 500 characters.");
      return;
    }
    setReportBusy(true);
    setReportError(null);
    try {
      await reportOwnerReview(reportTarget.id, reason);
      setReportSuccess("Report submitted — the review is now flagged for admin review. It remains visible while being investigated.");
      setReportTarget(null);
      setReportReason("");
      const res = await getOwnerReviews({
        property_id: selectedProperty !== "all" ? selectedProperty : undefined,
        search: search || undefined,
        page,
        page_size: pageSize,
      });
      setReviews(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      try {
        const s = await getOwnerReviewStats(selectedProperty !== "all" ? selectedProperty : undefined);
        setStats(s);
      } catch {}
      setTimeout(() => setReportSuccess(null), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to report review";
      setReportError(msg);
    } finally {
      setReportBusy(false);
    }
  }

  const portfolioRating = stats ? Number(stats.overall_rating) : 0;
  const totalReviews = stats?.total_reviews ?? 0;
  const hasFilters = searchInput.trim() !== "" || selectedProperty !== "all";

  const pageNumbers = useMemo(() => {
    const tp = Math.max(totalPages || 1, 1);
    const cur = Math.min(Math.max(page, 1), tp);
    const window = 1;
    const set = new Set<number>([1, tp, cur]);
    for (let i = cur - window; i <= cur + window; i++) if (i >= 1 && i <= tp) set.add(i);
    return [...set].sort((a, b) => a - b);
  }, [page, totalPages]);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setSelectedProperty("all");
    setPage(1);
  }

  function retry() {
    setPage((p) => p);
    setError(null);
    setLoading(true);
    getOwnerReviews({
      property_id: selectedProperty !== "all" ? selectedProperty : undefined,
      search: search || undefined,
      page,
      page_size: pageSize,
    })
      .then((res) => {
        setReviews(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load reviews"))
      .finally(() => setLoading(false));
  }

  return (
    <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
      <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-space-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xxs">
            <div className="flex items-center gap-space-xs text-[#46B1B1] font-label-sm text-label-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                Live Sync Active
              </span>
              <span>•</span>
              <span>Lebanon Standard Time (UTC+03:00)</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight mt-1">Guest reviews</h1>
            <p className="font-body-md text-body-md text-[#1E293B]">
              Verified feedback across the seven StayLeb quality standards. Reviews come from confirmed stays and cannot be edited by hosts.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {properties.length} {properties.length === 1 ? "property" : "properties"}
            </span>
            <Link
              href="/owner/reviews"
              className="inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Icon name="refresh" className="material-symbols-outlined text-[18px]" />
              <span>Refresh</span>
            </Link>
          </div>
        </div>

        {/* Filter toolbar */}
        <section className="rounded-2xl border border-transparent bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-label="Filter reviews">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label htmlFor="review-search" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#46B1B1]/70">
                Search reviews
              </label>
              <div className="relative">
                <Icon name="search" className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-[#46B1B1]/40" />
                <input
                  id="review-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by property, location or comment…"
                  className="h-11 w-full rounded-xl border border-transparent bg-surface-container-low pl-10 pr-10 text-[14px] text-[#46B1B1] outline-none transition-all placeholder:text-[#46B1B1]/40 focus:border-primary/20 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#46B1B1]/40 transition-colors hover:bg-surface-container-high hover:text-[#46B1B1]"
                  >
                    <Icon name="close" className="material-symbols-outlined text-[17px]" />
                  </button>
                )}
              </div>
            </div>
            <div className="w-full lg:w-80">
              <label htmlFor="review-property" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#46B1B1]/70">
                Property
              </label>
              <div className="relative">
                <select
                  id="review-property"
                  value={selectedProperty}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-surface-container-low pl-4 pr-10 text-[14px] font-medium text-[#46B1B1] outline-none transition-all focus:border-primary/20 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All properties{stats ? ` (${stats.total_reviews})` : ""}</option>
                  {properties.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.title} · {p.location}
                    </option>
                  ))}
                </select>
                <Icon name="expand_more" className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#46B1B1]/40" />
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-transparent bg-surface-container-lowest px-4 text-[13px] font-semibold text-[#46B1B1] transition-colors hover:bg-surface-container-low"
              >
                <Icon name="filter_alt_off" className="material-symbols-outlined text-[18px]" />
                Clear
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-surface-container-low pt-3 text-[12.5px] text-[#46B1B1]/70">
            <span>
              <strong className="font-semibold text-[#1E293B]">{total}</strong> {total === 1 ? "review" : "reviews"}
              {search ? (
                <>
                  {" "}matching <strong className="font-semibold text-[#1E293B]">“{search}”</strong>
                </>
              ) : null}
            </span>
            <span>Page {page} of {totalPages || 1}</span>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12" aria-label="Rating summary">
          <div className="flex flex-col rounded-2xl border border-transparent bg-surface-container-lowest p-6 shadow-sm lg:col-span-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#46B1B1]/70">Portfolio rating</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1 text-[11px] font-semibold text-on-secondary-container">
                <Icon name="hotel_class" className="material-symbols-outlined text-[13px]" />
                {portfolioRating >= 4.5 ? "Top tier host" : portfolioRating >= 4.0 ? "Strong host" : "Growing host"}
              </span>
            </div>
            {statsLoading ? (
              <div className="flex flex-1 flex-col justify-center gap-3 py-8">
                <div className="h-10 w-28 animate-pulse rounded-lg bg-surface-container-high" />
                <div className="h-4 w-40 animate-pulse rounded bg-surface-container-high" />
                <div className="h-2 w-full animate-pulse rounded-full bg-surface-container-high" />
              </div>
            ) : !stats || totalReviews === 0 ? (
              <div className="flex flex-1 flex-col justify-center py-8">
                <div className="text-[44px] font-bold leading-none tracking-tight text-surface-container-high">—</div>
                <Stars value={0} />
                <p className="mt-3 text-[13.5px] text-[#46B1B1]/70">No verified reviews yet. Averages will appear after your first completed stay.</p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-center py-2">
                <div className="flex items-end gap-3">
                  <span className="text-[52px] font-bold leading-none tracking-tight text-[#46B1B1]">{formatRating(stats.overall_rating)}</span>
                  <div className="pb-1.5">
                    <Stars value={portfolioRating} />
                    <div className="mt-0.5 text-[12px] text-[#46B1B1]/70">out of 5.0</div>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#46B1B1]">
                  Based on <strong className="font-semibold text-[#46B1B1]">{totalReviews} verified {totalReviews === 1 ? "stay" : "stays"}</strong>
                </p>
              </div>
            )}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-container-low p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-[#46B1B1] shadow-sm">
                <Icon name="verified_user" className="material-symbols-outlined text-[21px]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#46B1B1]">StayLeb verified standard</div>
                <div className="text-[12px] text-[#46B1B1]/70">Seven quality benchmarks, enforced on every stay</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-transparent bg-surface-container-lowest p-6 shadow-sm lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                  <Icon name="equalizer" className="material-symbols-outlined text-[19px]" />
                </div>
                <h2 className="text-[15px] font-bold text-[#46B1B1]">Evaluation breakdown</h2>
              </div>
              <span className="rounded-full border border-transparent bg-surface-container-low px-2.5 py-1 text-[11.5px] font-semibold text-[#46B1B1]">
                Target 4.80+ per criterion
              </span>
            </div>
            {statsLoading ? (
              <div className="grid flex-1 grid-cols-1 content-center gap-4 py-8 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-container-high" />
                    <div className="h-2 animate-pulse rounded-full bg-surface-container-high" />
                  </div>
                ))}
              </div>
            ) : !stats || totalReviews === 0 ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <p className="max-w-sm text-center text-[13.5px] text-[#46B1B1]/70">Criterion averages will appear here once guests submit their first evaluations.</p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                {CRITERIA.map((c) => {
                  const n = Number(stats[c.key]);
                  const pct = isNaN(n) ? 0 : Math.min(100, Math.max(0, (n / 5) * 100));
                  return (
                    <div key={c.key} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <div className="text-[13.5px] font-semibold text-[#1E293B]">{c.label}</div>
                          <div className="text-[11.5px] text-[#46B1B1]/40">{c.hint}</div>
                        </div>
                        <div className="shrink-0 text-[13.5px] font-bold text-[#46B1B1]">
                          {formatScore(stats[c.key])}
                          <span className="ml-0.5 text-[11.5px] font-normal text-[#46B1B1]/40">/ 5</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-container-high" role="progressbar" aria-valuenow={isNaN(n) ? 0 : n} aria-valuemin={0} aria-valuemax={5} aria-label={c.label}>
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Policy note */}
        <aside className="flex items-start gap-3.5 rounded-2xl border border-transparent bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
            <Icon name="policy" className="material-symbols-outlined text-[20px]" />
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-[#46B1B1]">Immutable review policy</div>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[#46B1B1]">
              Hosts cannot edit, delete or publicly dispute guest reviews. If a review breaches platform terms or contains
              inappropriate content, file a moderation request — StayLeb Admin will investigate while the review stays visible.
            </p>
          </div>
        </aside>

        {/* Reviews list */}
        <section className="flex flex-col gap-4" aria-label="Guest reviews">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[17px] font-bold text-[#46B1B1]">Verified evaluations</h2>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[12px] font-semibold text-white">{total}</span>
            </div>
            <span className="hidden text-[12.5px] text-[#46B1B1]/70 sm:block">Newest first · {pageSize} per page</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-transparent bg-surface-container-lowest p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-full bg-surface-container-high" />
                    <div className="flex-1">
                      <div className="h-3.5 w-40 animate-pulse rounded bg-surface-container-high" />
                      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-surface-container-high" />
                    </div>
                    <div className="h-8 w-16 animate-pulse rounded-lg bg-surface-container-high" />
                  </div>
                  <div className="mt-4 h-3.5 w-full animate-pulse rounded bg-surface-container-high" />
                  <div className="mt-2 h-3.5 w-5/6 animate-pulse rounded bg-surface-container-high" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest text-rose-600 shadow-sm">
                <Icon name="error" className="material-symbols-outlined text-[22px]" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-rose-900">Couldn&apos;t load reviews</div>
                <p className="mt-1 text-[13px] text-rose-700">{error}</p>
              </div>
              <button onClick={retry} className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-rose-700">
                <Icon name="refresh" className="material-symbols-outlined text-[17px]" />
                Try again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-14 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high text-[#46B1B1]/40">
                <Icon name="rate_review" className="material-symbols-outlined text-[30px]" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#46B1B1]">{hasFilters ? "No matching reviews" : "No reviews yet"}</h3>
              <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-[#46B1B1]/70">
                {hasFilters
                  ? "Try a different search term or property filter — or clear the filters to see everything."
                  : "Evaluations from completed stays will appear here as soon as guests submit them."}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90">
                  <Icon name="filter_alt_off" className="material-symbols-outlined text-[17px]" />
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4" id="reviews-feed">
              {reviews.map((rev) => {
                const overall = Number(rev.overall_rating);
                const flagged = rev.moderation_status === "flagged";
                const detailRatings = [
                  { label: "Cleanliness", value: rev.cleanliness_rating },
                  { label: "Privacy", value: rev.privacy_rating },
                  { label: "Wi-Fi", value: rev.wifi_rating },
                  { label: "Hot water", value: rev.hot_water_rating },
                  { label: "Location", value: rev.location_rating },
                  { label: "Value", value: rev.value_rating },
                ];
                return (
                  <article key={rev.id} className="overflow-hidden rounded-2xl border border-transparent bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex flex-col gap-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[14px] font-bold text-primary">
                            G
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[14px] font-bold text-[#46B1B1]">Verified guest</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                <Icon name="verified" className="material-symbols-outlined text-[13px]" />
                                Verified stay
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#46B1B1]/70">
                              <span>{formatDate(rev.created_at)}</span>
                              <span aria-hidden="true">·</span>
                              <span>Booking #SL-{String(rev.booking_id).padStart(4, "0")}</span>
                              <span aria-hidden="true">·</span>
                              <span>Review #{rev.id}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[14px] font-bold ${scoreTone(isNaN(overall) ? 0 : overall)}`}>
                          <Icon name="star" className="material-symbols-outlined text-[16px]" />
                          {formatScore(rev.overall_rating)}
                          <span className="text-[11.5px] font-medium opacity-70">/ 5</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#46B1B1]">
                          <Icon name="home" className="material-symbols-outlined text-[17px] text-[#46B1B1]/40" />
                          {rev.property.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#46B1B1]/70">
                          <Icon name="location_on" className="material-symbols-outlined text-[15px] text-[#46B1B1]/40" />
                          {rev.property.location}
                        </span>
                      </div>

                      {rev.comment ? (
                        <blockquote className="rounded-xl border-l-[3px] border-primary bg-surface-container-low px-4 py-3 text-[14px] leading-relaxed text-[#1E293B]">
                          “{rev.comment}”
                        </blockquote>
                      ) : (
                        <p className="rounded-xl bg-surface-container-low px-4 py-3 text-[13px] italic text-[#46B1B1]/40">Guest left a rating without a written comment.</p>
                      )}

                      <details className="group rounded-xl border border-surface-container-low bg-surface-container-low/60">
                        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[12.5px] font-semibold text-[#46B1B1] transition-colors hover:text-[#46B1B1] [&::-webkit-details-marker]:hidden">
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="tune" className="material-symbols-outlined text-[16px]" />
                            Detailed scores
                          </span>
                          <Icon name="expand_more" className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-surface-container-low px-4 py-3.5 sm:grid-cols-3">
                          {detailRatings.map((d) => (
                            <div key={d.label} className="flex items-center justify-between gap-2 text-[12.5px]">
                              <span className="text-[#46B1B1]/70">{d.label}</span>
                              <span className="font-bold text-[#1E293B]">{formatScore(d.value)}<span className="font-normal text-[#46B1B1]/40">/5</span></span>
                            </div>
                          ))}
                        </div>
                      </details>

                      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-surface-container-low pt-4">
                        <div>
                          {flagged ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700">
                              <Icon name="flag" className="material-symbols-outlined text-[14px]" />
                              Reported — under admin review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#46B1B1]/40">
                              <Icon name="lock" className="material-symbols-outlined text-[14px]" />
                              Immutable · cannot be edited or removed by hosts
                            </span>
                          )}
                        </div>
                        {flagged ? (
                          <span className="text-[12px] font-semibold text-amber-700">Already reported</span>
                        ) : (
                          <button
                            onClick={() => {
                              setReportTarget(rev);
                              setReportReason("");
                              setReportError(null);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-surface-container-lowest px-3 py-1.5 text-[12.5px] font-semibold text-[#46B1B1] shadow-sm transition-colors hover:border-outline-variant hover:bg-surface-container-low hover:text-[#46B1B1]"
                          >
                            <Icon name="flag" className="material-symbols-outlined text-[15px]" />
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-transparent bg-surface-container-lowest px-5 py-4 shadow-sm sm:flex-row" aria-label="Pagination">
              <span className="text-[13px] text-[#46B1B1]/70">
                Page <strong className="font-semibold text-[#46B1B1]">{page}</strong> of <strong className="font-semibold text-[#46B1B1]">{totalPages}</strong>
                <span className="ml-1.5 hidden text-[#46B1B1]/40 sm:inline">· {total} reviews</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg px-3 text-[13px] font-semibold transition-colors ${page <= 1 ? "cursor-not-allowed bg-surface-container-high text-[#46B1B1]/40" : "bg-surface-container-lowest text-[#46B1B1] ring-1 ring-surface-container-high hover:bg-surface-container-low"}`}
                >
                  <Icon name="chevron_left" className="material-symbols-outlined text-[18px]" />
                  Prev
                </button>
                {pageNumbers.map((n, i) => {
                  const prev = pageNumbers[i - 1];
                  const gap = prev !== undefined && n - prev > 1;
                  return (
                    <span key={n} className="flex items-center gap-1.5">
                      {gap && <span className="px-0.5 text-[#46B1B1]/40">…</span>}
                      <button
                        onClick={() => setPage(n)}
                        aria-current={n === page ? "page" : undefined}
                        className={`h-9 min-w-9 rounded-lg px-2.5 text-[13px] font-semibold transition-colors ${n === page ? "bg-primary text-white" : "bg-surface-container-lowest text-[#46B1B1] ring-1 ring-surface-container-high hover:bg-surface-container-low"}`}
                      >
                        {n}
                      </button>
                    </span>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg px-3 text-[13px] font-semibold transition-colors ${page >= totalPages ? "cursor-not-allowed bg-surface-container-high text-[#46B1B1]/40" : "bg-primary text-white hover:bg-primary/90"}`}
                >
                  Next
                  <Icon name="chevron_right" className="material-symbols-outlined text-[18px]" />
                </button>
              </div>
            </nav>
          )}
        </section>
      </div>

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm" onClick={() => setReportTarget(null)} role="dialog" aria-modal="true" aria-label="Report review">
          <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="flag" className="material-symbols-outlined text-[21px]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#46B1B1]">Report review #{reportTarget.id}</h3>
                  <p className="mt-0.5 text-[12.5px] text-[#46B1B1]/70">{reportTarget.property.title} · stays visible during investigation</p>
                </div>
              </div>
              <button onClick={() => setReportTarget(null)} aria-label="Close" className="rounded-lg p-1.5 text-[#46B1B1]/40 transition-colors hover:bg-surface-container-high hover:text-[#46B1B1]">
                <Icon name="close" className="material-symbols-outlined text-[20px]" />
              </button>
            </div>
            <div className="mt-4">
              <label htmlFor="report-reason" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#46B1B1]/70">
                Reason for report
              </label>
              <textarea
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explain what violates platform terms (5–500 characters)…"
                maxLength={500}
                rows={4}
                className="w-full resize-none rounded-xl border border-transparent bg-surface-container-low p-3 text-[13.5px] text-[#46B1B1] outline-none transition-all placeholder:text-[#46B1B1]/40 focus:border-primary/20 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-1.5 flex justify-between text-[12px] text-[#46B1B1]/40">
                <span>{reportReason.length} / 500</span>
                <span>Minimum 5 characters</span>
              </div>
            </div>
            {reportError && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700">{reportError}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setReportTarget(null)} disabled={reportBusy} className="rounded-xl border border-transparent bg-surface-container-lowest px-4 py-2.5 text-[13px] font-semibold text-[#46B1B1] transition-colors hover:bg-surface-container-low disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reportBusy || reportReason.trim().length < 5}
                className="rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reportBusy ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
      {reportSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-2.5 rounded-2xl bg-primary px-4 py-3.5 text-[13px] font-medium text-white shadow-2xl" role="status">
          <Icon name="check_circle" className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-emerald-400" />
          <span>{reportSuccess}</span>
        </div>
      )}
    </main>
  );
}
