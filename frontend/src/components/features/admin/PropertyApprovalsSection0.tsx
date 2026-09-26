"use client";
import { useEffect, useState, useCallback } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";
import { rejectPropertySchema } from "@/lib/validations/admin";
import { getAdminProperties } from "@/services/adminProperties";
import { getAdminDashboardStats } from "@/services/adminDashboard";
import type { PropertyResponse } from "@/services/owner";

export function PropertyApprovalsSection0() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [items, setItems] = useState<PropertyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [approveTarget, setApproveTarget] = useState<PropertyResponse | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Debounce location 400ms
  useEffect(() => {
    const t = setTimeout(() => setLocation(locationInput.trim()), 400);
    return () => clearTimeout(t);
  }, [locationInput]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [status, search, location]);

  const loadCounts = useCallback(async () => {
    try {
      const stats = await getAdminDashboardStats();
      setCounts({
        pending: stats.properties.pending,
        approved: stats.properties.approved,
        rejected: stats.properties.rejected,
      });
    } catch {
      // fallback: keep previous - do not block UI
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminProperties({
        status,
        search: search || undefined,
        location: location || undefined,
        page,
        page_size: pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      // keep tab counts in sync without extra fetch - update current tab's total from response
      // global counts remain from dashboard, but this ensures badge reflects filtered total when search/location active
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load properties");
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [status, search, location, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  async function handleApprove(id: number) {
    setBusy(id);
    try {
      await apiFetch(`/admin/properties/${id}/approve`, { method: "PATCH" });
      // if current page becomes empty after approve, go to previous page if not first
      const willBeEmpty = items.length === 1 && page > 1;
      if (willBeEmpty) setPage((p) => Math.max(1, p - 1));
      else await load();
      await loadCounts();
      if (!willBeEmpty) {
        // load already triggered via page change or direct
      }
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Approve failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const [rejectError, setRejectError] = useState("");
  async function handleReject() {
    const parsed = rejectPropertySchema.safeParse({ rejection_reason: rejectReason });
    if (!parsed.success) {
      setRejectError(parsed.error.issues[0].message);
      return;
    }
    setRejectError("");
    if (!rejectId) return;
    setBusy(rejectId);
    try {
      await apiFetch(`/admin/properties/${rejectId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejection_reason: parsed.data.rejection_reason }),
      });
      setRejectId(null);
      setRejectReason("");
      setRejectError("");
      const willBeEmpty = items.length === 1 && page > 1;
      if (willBeEmpty) setPage((p) => Math.max(1, p - 1));
      else await load();
      await loadCounts();
    } catch (e) {
      setRejectError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(null);
    }
  }

  const emptyMessage =
    status === "pending"
      ? search || location
        ? "No pending properties match your filters."
        : "No pending properties found."
      : status === "approved"
      ? search || location
        ? "No approved properties match your filters."
        : "No approved properties found."
      : search || location
      ? "No rejected properties match your search."
      : "No rejected properties found.";

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-lg mb-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#46B1B1] mb-space-xxs">
                    <span>Administration</span>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px] text-outline" />
                    <span className="font-semibold text-primary">Property Approvals</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Property Approvals Queue</h1>
                  <p className="font-body-md text-body-md text-[#46B1B1] mt-0.5">Review newly submitted chalets and furnished houses before activating them on the public marketplace.</p>
                </div>
                <div className="flex items-center gap-space-sm self-start lg:self-auto">
                  <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-caption text-caption text-[#46B1B1] font-medium">SLAs Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-primary-container text-white rounded-xl p-space-md shadow-sm">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-secondary-container opacity-10 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative z-10">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center text-[#46B1B1] flex-shrink-0">
                      <Icon name="verified_user" className="material-symbols-outlined text-[24px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-title-md text-title-md font-semibold text-on-primary">StayLeb Marketplace Screening Standards</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-lowest/25 text-[#46B1B1] font-caption text-caption uppercase tracking-wider font-semibold">Strict</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-primary/90 mt-0.5 max-w-4xl">Properties remain strictly unlisted and hidden from public search until manually approved by StayLeb administration.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl">
              <div className="px-space-lg pt-space-md bg-surface-bright flex flex-wrap items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs overflow-x-auto">
                  {[
                    ["pending", `Pending Review ${counts.pending}`],
                    ["approved", `Approved / Live ${counts.approved}`],
                    ["rejected", `Rejected / Revisions Required ${counts.rejected}`],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setStatus(key as typeof status)}
                      className={`relative flex items-center gap-space-xs pb-space-md pt-space-xs px-space-xs font-label-md text-label-md font-semibold transition-colors ${status === key ? "text-primary" : "text-[#46B1B1] hover:text-[#46B1B1]"}`}
                    >
                      <span>{label.split(" ")[0]} {label.split(" ").slice(1).join(" ")}</span>
                      <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-bold ${status === key ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container text-[#46B1B1]"}`}>
                        {key === "pending" ? counts.pending : key === "approved" ? counts.approved : counts.rejected}
                      </span>
                      {status === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#46B1B1]/70 hidden sm:block">{total} {status} • Page {page} of {totalPages || 1}</span>
              </div>

              <div className="p-space-lg bg-surface-container-low flex flex-col gap-space-sm">
                <div className="flex flex-col md:flex-row gap-space-sm">
                  <div className="relative flex-1">
                    <Icon name="search" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline" />
                    <input
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-[#46B1B1] placeholder:text-[#46B1B1]/60 font-body-md text-body-md rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim transition-all"
                      placeholder="Search by title, location, address, or description..."
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <div className="relative flex-1 max-w-xs">
                    <Icon name="location_on" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline" />
                    <input
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-[#46B1B1] placeholder:text-[#46B1B1]/60 font-body-md text-body-md rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim transition-all"
                      placeholder="Filter by location..."
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-11 px-3 rounded-lg border bg-white text-sm text-[#46B1B1] min-w-[110px]"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  {(search || location) && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setLocationInput("");
                      }}
                      className="h-11 px-4 rounded-lg bg-surface-container-lowest border text-sm text-[#46B1B1] hover:bg-surface-container"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-[#46B1B1]/70">
                  <span>{loading ? "Loading…" : `${total} ${status} properties`}{search ? ` • search: "${search}"` : ""}{location ? ` • location: "${location}"` : ""}</span>
                  <span className="hidden sm:inline">Page {page} of {totalPages || 1} • {pageSize} per page</span>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-surface-container">
                {loading ? (
                  <div className="p-8 text-center text-[#46B1B1]">Loading {status} properties…</div>
                ) : error ? (
                  <div className="p-8 text-center text-error">{error}</div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center text-[#46B1B1]">{emptyMessage}</div>
                ) : (
                  items.map((p) => (
                    <div key={p.id} className="p-space-lg hover:bg-surface-bright transition-all group flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg flex-1 min-w-0">
                        <div className="relative w-full sm:w-56 h-36 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-surface-container">
                          <LocalImage
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={p.images?.[0]?.image_url || "/images/681cce9bd90b9457.jpg"}
                            alt={p.title}
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-on-surface/80 backdrop-blur-md text-surface text-[11px] font-caption px-2 py-0.5 rounded-full font-medium shadow-sm">
                            <Icon name="cottage" className="material-symbols-outlined text-[13px] text-secondary-fixed" />
                            <span className="capitalize">{p.property_type.replace("_", " ")}</span>
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-sm text-label-sm font-bold text-[#46B1B1] shadow-sm">
                            ${Number(p.price_per_night).toFixed(0)}<span className="font-caption text-caption text-[#46B1B1] font-normal"> / night</span>
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-space-xs mb-1">
                            <h2 className="font-headline-sm text-headline-sm text-[#46B1B1] tracking-tight group-hover:text-primary transition-colors truncate">{p.title}</h2>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${p.status === "pending" ? "bg-tertiary-fixed text-on-tertiary-fixed" : p.status === "approved" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === "pending" ? "bg-tertiary animate-pulse" : p.status === "approved" ? "bg-secondary" : "bg-error"}`}></span>
                              {p.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-label-md text-label-md text-[#46B1B1] mb-space-xs">
                            <Icon name="location_on" className="material-symbols-outlined text-[18px] text-primary" />
                            <span className="font-medium text-[#46B1B1]">{p.location}</span>
                            {p.address && <span className="text-[#46B1B1]/60 text-xs truncate">• {p.address}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-space-sm font-caption text-caption text-[#46B1B1]">
                            <span className="flex items-center gap-1">
                              <Icon name="bed" className="material-symbols-outlined text-[14px]" />
                              {p.bedrooms} Bedrooms
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Icon name="bathtub" className="material-symbols-outlined text-[14px]" />
                              {p.bathrooms} Baths
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Icon name="groups" className="material-symbols-outlined text-[14px]" />
                              {p.max_guests} Guests
                            </span>
                          </div>
                          {p.status === "rejected" && p.rejection_reason && (
                            <p className="mt-2 text-xs text-error bg-error-container/30 px-2 py-1 rounded">Reason: {p.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-space-md border-t xl:border-t-0 pt-space-sm xl:pt-0 border-surface-container flex-shrink-0">
                        <div className="flex flex-col xl:items-end">
                          <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Owner ID</span>
                          <span className="font-label-md text-label-md font-semibold text-[#46B1B1]">#{p.owner_id}</span>
                          <span className="font-caption text-caption text-[#46B1B1]">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === "pending" && (
                            <>
                              <button
                                onClick={() => setApproveTarget(p)}
                                disabled={busy === p.id}
                                className="h-10 px-5 bg-gradient-to-r from-[#46B1B1] to-[#3A9E9E] hover:from-[#3A9E9E] hover:to-[#0f3d3e] text-white font-label-md text-label-md font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Icon name="check_circle" className="material-symbols-outlined text-[18px] text-white" />
                                {busy === p.id ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => setRejectId(p.id)}
                                className="h-10 px-5 bg-white border border-slate-200 text-[#46B1B1] hover:bg-slate-50 hover:border-slate-300 font-label-md text-label-md font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <Icon name="close" className="material-symbols-outlined text-[16px]" />
                                Reject
                              </button>
                            </>
                          )}
                          <Link className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-[#46B1B1] font-label-md text-label-md font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition-all" href={`/admin/properties/${p.id}`}>
                            <Icon name="visibility" className="material-symbols-outlined text-[18px] text-[#46B1B1]" />
                            <span className="text-[#46B1B1]">View</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <div className="font-body-md text-body-md text-[#46B1B1]">Showing {items.length} of {total} {status} properties • Page {page} of {totalPages || 1}</div>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded-lg border text-sm ${page <= 1 ? "bg-slate-100 text-[#46B1B1]/40 cursor-not-allowed" : "bg-white hover:bg-slate-50 text-[#46B1B1]"}`}>
                    Previous
                  </button>
                  <span className="text-xs text-[#46B1B1]">Page {page} / {totalPages || 1}</span>
                  <button disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)} className={`px-3 py-1.5 rounded-lg border text-sm ${page >= totalPages ? "bg-slate-100 text-[#46B1B1]/40 cursor-not-allowed" : "bg-white hover:bg-slate-50 text-[#46B1B1]"}`}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
          {approveTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
              <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-4">
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0 text-on-secondary-container">
                    <Icon name="verified" className="material-symbols-outlined text-[26px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-headline-sm text-headline-sm text-[#46B1B1] tracking-tight">Approve Property?</h3>
                    <p className="font-body-md text-body-md text-[#46B1B1] mt-1">
                      Are you sure you want to approve <span className="font-semibold text-[#46B1B1]">“{approveTarget.title}”</span> in {approveTarget.location}? This will publish the listing to the marketplace and notify the owner.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setApproveTarget(null)} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-[#46B1B1]">Cancel</button>
                  <button
                    onClick={() => {
                      const id = approveTarget.id;
                      setApproveTarget(null);
                      handleApprove(id);
                    }}
                    disabled={busy === approveTarget.id}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 font-semibold flex items-center gap-1.5"
                  >
                    <Icon name="check_circle" className="material-symbols-outlined text-[18px]" />
                    {busy === approveTarget.id ? "Approving…" : "Confirm Approve"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {rejectId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
              <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-4">
                <h3 className="font-headline-sm text-headline-sm">Reject Property?</h3>
                <p className="font-body-md text-body-md text-[#46B1B1]">Provide a reason for rejection. The owner will be notified.</p>
                <textarea
                  className={`w-full min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${rejectError ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30" : "border-outline-variant focus:ring-[#0f3d3e]/20"}`}
                  placeholder="Rejection reason (min 10 characters)..."
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); if (rejectError) setRejectError(""); }}
                />
                {rejectError && <p className="text-xs text-red-600 -mt-2">{rejectError}</p>}
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setRejectId(null); setRejectReason(""); setRejectError(""); }} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high">Cancel</button>
                  <button onClick={handleReject} disabled={busy === rejectId} className="px-4 py-2 rounded-lg bg-error text-white hover:bg-red-700 disabled:opacity-50">Confirm Reject</button>
                </div>
              </div>
            </div>
          )}
          {alertMsg && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4" onClick={() => setAlertMsg(null)}>
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                    <Icon name="error" className="material-symbols-outlined text-[28px]" />
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-[#46B1B1]">Heads up</h3>
                  <p className="text-sm text-[#46B1B1] mt-2 leading-relaxed">{alertMsg}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <button onClick={() => setAlertMsg(null)} className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold min-w-[120px]">OK, got it</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
