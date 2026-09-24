"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getAdminReviews, getAdminReviewStats, restoreAdminReview, removeAdminReview, type AdminReview, type AdminReviewStats } from "@/services/reviews";

function moderationBadge(status: string) {
  if (status === "flagged") return { label: "Reported", cls: "bg-amber-50 text-amber-700 border border-amber-200" };
  if (status === "removed") return { label: "Removed", cls: "bg-rose-50 text-rose-700 border border-rose-200" };
  return { label: "Visible", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
}

export function ReviewModerationSection0() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [moderationFilter, setModerationFilter] = useState<"all" | "visible" | "flagged" | "removed">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [flaggedCount, setFlaggedCount] = useState<number | null>(null);
  const [removedCount, setRemovedCount] = useState<number | null>(null);
  const [actionBusy, setActionBusy] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "keep" | "remove"; review: AdminReview } | null>(null);

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
    async function loadStats() {
      setStatsLoading(true);
      try {
        const s = await getAdminReviewStats();
        if (!cancelled) setStats(s);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    loadStats();
    return () => { cancelled = true; };
  }, []);

  // Fetch flagged/removed counts
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      try {
        const [flaggedRes, removedRes] = await Promise.all([
          getAdminReviews({ moderation_status: "flagged", page: 1, page_size: 1 }),
          getAdminReviews({ moderation_status: "removed", page: 1, page_size: 1 }),
        ]);
        if (!cancelled) {
          setFlaggedCount(flaggedRes.total);
          setRemovedCount(removedRes.total);
        }
      } catch {
        if (!cancelled) {
          setFlaggedCount(null);
          setRemovedCount(null);
        }
      }
    }
    loadCounts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const moderation_status = moderationFilter === "all" ? undefined : moderationFilter === "flagged" ? "flagged" as const : moderationFilter === "visible" ? "visible" as const : "removed" as const;
        const res = await getAdminReviews({ search: search || undefined, rating: ratingFilter, moderation_status, page, page_size: pageSize });
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
    load();
    return () => { cancelled = true; };
  }, [search, ratingFilter, moderationFilter, page]);

  const handleRatingFilter = (rating: number | undefined) => {
    setRatingFilter(rating);
    setPage(1);
  };

  const handleModerationFilter = (val: typeof moderationFilter) => {
    setModerationFilter(val);
    setPage(1);
  };

  async function handleKeep(review: AdminReview) {
    setActionBusy(review.id);
    setActionError(null);
    try {
      await restoreAdminReview(review.id);
      setActionSuccess(`Review #${review.id} kept — report dismissed and review remains visible.`);
      setConfirmAction(null);
      setSelected(null);
      // refresh current list and counts
      const moderation_status = moderationFilter === "all" ? undefined : moderationFilter === "flagged" ? "flagged" as const : moderationFilter === "visible" ? "visible" as const : "removed" as const;
      const res = await getAdminReviews({ search: search || undefined, rating: ratingFilter, moderation_status, page, page_size: pageSize });
      setReviews(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      // refresh flagged/removed counts
      const [flaggedRes, removedRes] = await Promise.all([
        getAdminReviews({ moderation_status: "flagged", page: 1, page_size: 1 }),
        getAdminReviews({ moderation_status: "removed", page: 1, page_size: 1 }),
      ]);
      setFlaggedCount(flaggedRes.total);
      setRemovedCount(removedRes.total);
      // refresh stats
      try {
        const s = await getAdminReviewStats();
        setStats(s);
      } catch {}
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to keep review");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleRemove(review: AdminReview) {
    setActionBusy(review.id);
    setActionError(null);
    try {
      await removeAdminReview(review.id);
      setActionSuccess(`Review #${review.id} removed — it will no longer appear publicly and will not contribute to ratings.`);
      setConfirmAction(null);
      setSelected(null);
      const moderation_status = moderationFilter === "all" ? undefined : moderationFilter === "flagged" ? "flagged" as const : moderationFilter === "visible" ? "visible" as const : "removed" as const;
      const res = await getAdminReviews({ search: search || undefined, rating: ratingFilter, moderation_status, page, page_size: pageSize });
      // if current page becomes empty and not first page, go to previous page
      if (res.items.length === 0 && page > 1 && res.total > 0) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        setReviews(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      }
      const [flaggedRes, removedRes] = await Promise.all([
        getAdminReviews({ moderation_status: "flagged", page: 1, page_size: 1 }),
        getAdminReviews({ moderation_status: "removed", page: 1, page_size: 1 }),
      ]);
      setFlaggedCount(flaggedRes.total);
      setRemovedCount(removedRes.total);
      try {
        const s = await getAdminReviewStats();
        setStats(s);
      } catch {}
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to remove review");
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs font-caption text-caption uppercase tracking-wider text-[#46B1B1] font-semibold mb-space-xxs">
                  <span>Administration</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-bold">Review Moderation</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Guest Reviews & Moderation Queue</h1>
                <p className="font-body-md text-body-md text-[#46B1B1] mt-space-xxs">Investigate owner-reported reviews and decide to keep or remove them. Flagged reviews remain visible until a decision is made.</p>
              </div>
              <div className="flex items-center gap-space-sm self-start md:self-auto">
                <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-lowest shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">Moderation Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption uppercase tracking-wider text-[#46B1B1] font-semibold">Total Verified Reviews</span>
                  <Icon name="verified" className="material-symbols-outlined text-primary text-[22px]" />
                </div>
                <div className="mt-space-sm">
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-[#46B1B1]/70">Loading…</span>
                    </div>
                  ) : (
                    <>
                      <div className="font-display text-display text-[#46B1B1] leading-none tracking-tight">{stats?.total_reviews ?? "—"}</div>
                      <div className="flex items-center gap-space-xxs mt-space-xs text-primary font-label-sm text-label-sm">
                        <span>Excludes removed</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption uppercase tracking-wider text-[#46B1B1] font-semibold">Platform Average Rating</span>
                  <Icon name="star" className="material-symbols-outlined text-amber-500 text-[22px]" />
                </div>
                <div className="mt-space-sm">
                  {statsLoading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-display text-display text-[#46B1B1] leading-none tracking-tight">{stats ? Number(stats.overall_rating).toFixed(2) : "—"}</span>
                        <span className="font-title-md text-title-md text-[#46B1B1]">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-space-xxs mt-space-xs text-[#46B1B1] font-label-sm text-label-sm">
                        <span>Across all 7 criteria</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption uppercase tracking-wider text-[#46B1B1] font-semibold">Reported</span>
                  <Icon name="flag" className="material-symbols-outlined text-amber-500 text-[22px]" />
                </div>
                <div className="mt-space-sm">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-display text-display text-amber-600 leading-none tracking-tight">{flaggedCount ?? "—"}</span>
                    <span className="font-label-md text-label-md text-[#46B1B1]/70 font-medium">flagged</span>
                  </div>
                  <div className="flex items-center gap-space-xxs mt-space-xs text-amber-700 font-label-sm text-label-sm">
                    <span>Awaiting decision</span>
                  </div>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption uppercase tracking-wider text-[#46B1B1] font-semibold">Removed</span>
                  <Icon name="policy" className="material-symbols-outlined text-rose-500 text-[22px]" />
                </div>
                <div className="mt-space-sm">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-display text-display text-rose-600 leading-none tracking-tight">{removedCount ?? "—"}</span>
                    <span className="font-label-md text-label-md text-[#46B1B1]/70 font-medium">removed</span>
                  </div>
                  <div className="flex items-center gap-space-xxs mt-space-xs text-rose-700 font-label-sm text-label-sm">
                    <span>No longer public</span>
                  </div>
                </div>
              </div>
            </div>

            {actionSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <Icon name="check_circle" className="material-symbols-outlined text-[18px]" />
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
                <span>{actionError}</span>
                <button onClick={() => setActionError(null)} className="text-xs underline">Dismiss</button>
              </div>
            )}

            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm mb-space-md flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-surface-container-low rounded-full p-1">
                  {[
                    ["all", "All"],
                    ["visible", "Visible"],
                    ["flagged", "Reported"],
                    ["removed", "Removed"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleModerationFilter(key as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${moderationFilter === key ? "bg-white text-[#46B1B1] border border-[#46B1B1] shadow-sm" : "text-[#46B1B1] hover:bg-white"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div className="flex items-center bg-surface-container-low rounded-lg p-1">
                  <button
                    onClick={() => handleRatingFilter(undefined)}
                    className={`px-space-sm py-1.5 rounded-md font-label-sm text-label-sm ${!ratingFilter ? "bg-surface-container-lowest shadow-sm text-[#46B1B1] font-semibold" : "text-[#46B1B1]/70 hover:text-[#46B1B1]"}`}
                  >
                    All Ratings
                  </button>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRatingFilter(r)}
                      className={`px-2 py-1.5 rounded-md font-label-sm text-label-sm flex items-center gap-1 ${ratingFilter === r ? "bg-surface-container-lowest shadow-sm text-[#46B1B1] font-semibold" : "text-[#46B1B1]/70 hover:text-[#46B1B1]"}`}
                    >
                      {r} <Icon name="star" className="text-amber-500 text-[14px]" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-space-sm">
                <div className="flex flex-1 items-center gap-space-xs bg-surface-container-low rounded-lg px-space-sm py-2">
                  <Icon name="search" className="material-symbols-outlined text-outline text-[20px]" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by client, property, or comment..."
                    className="w-full bg-transparent outline-none font-body-md text-body-md text-[#46B1B1] placeholder:text-outline"
                  />
                </div>
                <button onClick={() => { setSearchInput(""); handleRatingFilter(undefined); handleModerationFilter("all"); }} className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-sm text-[#46B1B1]">
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              {loading ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[#46B1B1]/70">Loading reviews…</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <Icon name="error" className="material-symbols-outlined text-rose-400 text-[28px] mb-2" />
                  <p className="text-sm text-rose-600">{error}</p>
                  <button onClick={() => { setSearchInput(""); handleRatingFilter(undefined); setPage(1); }} className="mt-3 px-4 py-2 rounded-lg bg-white text-[#46B1B1] border border-[#46B1B1] text-sm">Clear filters</button>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 text-center">
                  <Icon name="rate_review" className="material-symbols-outlined text-[#46B1B1]/60 text-[32px] mb-2" />
                  <h3 className="font-semibold text-[#46B1B1]">No reviews found</h3>
                  <p className="text-sm text-[#46B1B1]/70 mt-1">Try adjusting search, rating or moderation filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/70 text-[#46B1B1] font-caption text-caption uppercase tracking-wider font-semibold">
                        <th className="py-space-sm px-space-md">Review ID</th>
                        <th className="py-space-sm px-space-md">Client</th>
                        <th className="py-space-sm px-space-md">Property</th>
                        <th className="py-space-sm px-space-md">Overall</th>
                        <th className="py-space-sm px-space-md">Moderation</th>
                        <th className="py-space-sm px-space-md min-w-[280px]">Comment</th>
                        <th className="py-space-sm px-space-md">Date</th>
                        <th className="py-space-sm px-space-md text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-[#46B1B1]">
                      {reviews.map((rev) => {
                        const badge = moderationBadge(rev.moderation_status);
                        return (
                        <tr key={rev.id} className="hover:bg-surface-container-low/40">
                          <td className="py-space-md px-space-md font-mono text-sm">#{rev.id}</td>
                          <td className="py-space-md px-space-md">
                            <div className="font-medium text-sm">{rev.client.full_name}</div>
                            <div className="text-xs text-[#46B1B1]/70">{rev.client.email}</div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-medium text-sm">{rev.property.title}</div>
                            <div className="text-xs text-[#46B1B1]/70">{rev.property.location}</div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{rev.overall_rating}</span>
                              <Icon name="star" className="text-amber-500 text-[16px]" />
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>{badge.label}</span>
                            {rev.moderation_status === "flagged" && rev.report_reason && (
                              <div className="text-xs text-amber-700 mt-1 line-clamp-2 max-w-[180px]" title={rev.report_reason}>Reason: {rev.report_reason}</div>
                            )}
                          </td>
                          <td className="py-space-md px-space-md max-w-md">
                            {rev.comment ? <p className="text-sm italic line-clamp-3">“{rev.comment}”</p> : <span className="text-xs text-[#46B1B1]/60">No comment</span>}
                            {rev.moderation_status === "flagged" && rev.reported_at && (
                              <div className="text-xs text-[#46B1B1]/60 mt-1">Reported {new Date(rev.reported_at).toLocaleString()}</div>
                            )}
                          </td>
                          <td className="py-space-md px-space-md text-xs whitespace-nowrap">{new Date(rev.created_at).toLocaleDateString()}</td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => setSelected(rev)} className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-xs font-medium text-[#46B1B1]">
                                View
                              </button>
                              {rev.moderation_status === "flagged" && (
                                <>
                                  <button
                                    onClick={() => setConfirmAction({ type: "keep", review: rev })}
                                    disabled={actionBusy === rev.id}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold disabled:opacity-50"
                                  >
                                    Keep
                                  </button>
                                  <button
                                    onClick={() => setConfirmAction({ type: "remove", review: rev })}
                                    disabled={actionBusy === rev.id}
                                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-space-md bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <div className="text-sm text-[#46B1B1]/70">
                  Showing <strong>{reviews.length}</strong> of <strong>{total}</strong> reviews — page {page} of {totalPages || 1}
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded-lg border text-sm ${page <= 1 ? "bg-slate-100 text-[#46B1B1]/60 cursor-not-allowed" : "bg-white hover:bg-slate-50"}`}>
                    Previous
                  </button>
                  <span className="text-xs text-[#46B1B1]/70">Page {page} / {totalPages || 1}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={`px-3 py-1.5 rounded-lg border text-sm ${page >= totalPages ? "bg-slate-100 text-[#46B1B1]/60 cursor-not-allowed" : "bg-white hover:bg-slate-50"}`}>
                    Next
                  </button>
                </div>
              </div>
            </div>

            {selected && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-[#46B1B1]">Review #{selected.id} details</h3>
                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                      <Icon name="close" className="material-symbols-outlined text-[20px]" />
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-[#46B1B1]/70">Booking</span><span className="font-mono">#{selected.booking_id}</span></div>
                    <div className="flex justify-between"><span className="text-[#46B1B1]/70">Moderation</span><span className={`px-2 py-1 rounded-full text-xs font-semibold border ${moderationBadge(selected.moderation_status).cls}`}>{moderationBadge(selected.moderation_status).label}</span></div>
                    <div className="flex justify-between"><span className="text-[#46B1B1]/70">Client</span><span>{selected.client.full_name} ({selected.client.email})</span></div>
                    <div className="flex justify-between"><span className="text-[#46B1B1]/70">Property</span><span>{selected.property.title} · {selected.property.location}</span></div>
                    {selected.moderation_status === "flagged" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Report details</div>
                        <div className="text-sm text-amber-900 mt-1"><span className="font-semibold">Reason:</span> {selected.report_reason || "—"}</div>
                        <div className="text-xs text-amber-700 mt-1">Reported: {selected.reported_at ? new Date(selected.reported_at).toLocaleString() : "—"}</div>
                      </div>
                    )}
                    {selected.moderation_status === "removed" && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Removed review</div>
                        <div className="text-sm text-rose-900 mt-1">Report: {selected.report_reason || "—"}</div>
                        <div className="text-xs text-rose-700">Reported: {selected.reported_at ? new Date(selected.reported_at).toLocaleString() : "—"}</div>
                        <div className="text-xs text-rose-700">Moderated: {selected.moderated_at ? new Date(selected.moderated_at).toLocaleString() : "—"}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Overall: <strong className="text-[#46B1B1]">{selected.overall_rating}/5</strong></div>
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Cleanliness: <strong className="text-[#46B1B1]">{selected.cleanliness_rating}/5</strong></div>
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Privacy: <strong className="text-[#46B1B1]">{selected.privacy_rating}/5</strong></div>
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Wi-Fi: <strong className="text-[#46B1B1]">{selected.wifi_rating}/5</strong></div>
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Hot Water: <strong className="text-[#46B1B1]">{selected.hot_water_rating}/5</strong></div>
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Location: <strong className="text-[#46B1B1]">{selected.location_rating}/5</strong></div>
                      <div className="bg-slate-50 p-2 rounded text-[#46B1B1]">Value: <strong className="text-[#46B1B1]">{selected.value_rating}/5</strong></div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-xs font-semibold text-[#46B1B1]/70 uppercase tracking-wider">Comment</div>
                      <p className="text-sm italic mt-1">{selected.comment || "No comment"}</p>
                    </div>
                    <div className="text-xs text-[#46B1B1]/70">Created: {new Date(selected.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    {selected.moderation_status === "flagged" ? (
                      <>
                        <button onClick={() => { setConfirmAction({ type: "keep", review: selected }); }} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">Keep Review</button>
                        <button onClick={() => { setConfirmAction({ type: "remove", review: selected }); }} className="px-4 py-2 rounded-xl bg-white text-[#46B1B1] border border-[#46B1B1] text-sm font-semibold">Remove Review</button>
                      </>
                    ) : null}
                    <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm">Close</button>
                  </div>
                </div>
              </div>
            )}

            {confirmAction && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)}>
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confirmAction.type === "keep" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      <Icon name={confirmAction.type === "keep" ? "visibility" : "delete"} className="material-symbols-outlined text-[20px]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1E293B]">{confirmAction.type === "keep" ? "Keep Review?" : "Remove Review?"}</h3>
                      <p className="text-xs text-[#64748B]">Review #{confirmAction.review.id} · {confirmAction.review.property.title}</p>
                    </div>
                  </div>
                  {confirmAction.type === "keep" ? (
                    <p className="text-sm text-[#1E293B]">This will dismiss the report and restore the review to <span className="font-semibold text-emerald-700">Visible</span>. It will remain public and continue contributing to ratings.</p>
                  ) : (
                    <p className="text-sm text-[#1E293B]">This review will be <span className="font-semibold text-rose-700">removed</span> — it will no longer appear publicly, will not be shown to the owner, and will no longer contribute to property ratings. This is a moderation action, not a database deletion.</p>
                  )}
                  {confirmAction.review.report_reason && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-xs font-semibold text-amber-800">Owner report reason</div>
                      <p className="text-sm text-amber-900 mt-1">“{confirmAction.review.report_reason}”</p>
                      <p className="text-xs text-amber-700 mt-1">Reported {confirmAction.review.reported_at ? new Date(confirmAction.review.reported_at).toLocaleString() : ""}</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-5">
                    <button onClick={() => setConfirmAction(null)} disabled={!!actionBusy} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-medium">Cancel</button>
                    <button
                      onClick={() => confirmAction.type === "keep" ? handleKeep(confirmAction.review) : handleRemove(confirmAction.review)}
                      disabled={!!actionBusy}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold text-[#46B1B1] ${confirmAction.type === "keep" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-50`}
                    >
                      {actionBusy ? "Processing…" : confirmAction.type === "keep" ? "Keep Review" : "Remove Review"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
