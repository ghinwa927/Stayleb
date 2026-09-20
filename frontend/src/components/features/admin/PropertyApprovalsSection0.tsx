"use client";
import { useEffect, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";
import { rejectPropertySchema } from "@/lib/validations/admin";

type Property = {
  id: number;
  title: string;
  location: string;
  property_type: string;
  price_per_night: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  min_nights: number;
  status: string;
  images: { image_url: string }[];
  owner_id: number;
  created_at: string;
};

export function PropertyApprovalsSection0() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [properties, setProperties] = useState<Property[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  async function loadCounts() {
    try {
      const [p, a, r] = await Promise.all([
        apiFetch("/admin/properties?status=pending").catch(() => []),
        apiFetch("/admin/properties?status=approved").catch(() => []),
        apiFetch("/admin/properties?status=rejected").catch(() => []),
      ]);
      setCounts({ pending: p.length, approved: a.length, rejected: r.length });
    } catch {}
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/admin/properties?status=${status}`);
      setProperties(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);
  useEffect(() => {
    loadCounts();
  }, []);

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [p.title, p.location, p.property_type].join(" ").toLowerCase().includes(q);
  });

  async function handleApprove(id: number) {
    setBusy(id);
    try {
      await apiFetch(`/admin/properties/${id}/approve`, { method: "PATCH" });
      await load();
      await loadCounts();
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
      await load();
      await loadCounts();
    } catch (e) {
      setRejectError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-lg mb-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#157375] mb-space-xxs">
                    <span>Administration</span>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px] text-outline" />
                    <span className="font-semibold text-primary">Property Approvals</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-[#157375] tracking-tight">Property Approvals Queue</h1>
                  <p className="font-body-md text-body-md text-[#157375] mt-0.5">Review newly submitted chalets and furnished houses before activating them on the public marketplace.</p>
                </div>
                <div className="flex items-center gap-space-sm self-start lg:self-auto">
                  <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-caption text-caption text-[#157375] font-medium">SLAs Active</span>
                      <span className="font-label-sm text-label-sm font-semibold text-[#157375]">Avg. Decision: 4.2h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-primary-container text-white rounded-xl p-space-md shadow-sm">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-secondary-container opacity-10 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative z-10">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center text-[#157375] flex-shrink-0">
                      <Icon name="verified_user" className="material-symbols-outlined text-[24px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-title-md text-title-md font-semibold text-on-primary">StayLeb Marketplace Screening Standards</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-lowest/25 text-[#157375] font-caption text-caption uppercase tracking-wider font-semibold">Strict</span>
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
                      className={`relative flex items-center gap-space-xs pb-space-md pt-space-xs px-space-xs font-label-md text-label-md font-semibold transition-colors ${status === key ? "text-primary" : "text-[#157375] hover:text-[#157375]"}`}
                    >
                      <span>{label.split(" ")[0]} {label.split(" ").slice(1).join(" ")}</span>
                      <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-bold ${status === key ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container text-[#157375]"}`}>
                        {key === "pending" ? counts.pending : key === "approved" ? counts.approved : counts.rejected}
                      </span>
                      {status === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-space-lg bg-surface-container-low flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
                <div className="relative flex-1 max-w-xl">
                  <Icon name="search" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline" />
                  <input
                    className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-[#157375] placeholder:text-[#157375] font-body-md text-body-md rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim transition-all"
                    placeholder="Search by property title, owner, or district..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col divide-y divide-surface-container">
                {loading ? (
                  <div className="p-8 text-center text-[#157375]">Loading {status} properties…</div>
                ) : error ? (
                  <div className="p-8 text-center text-error">{error}</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-[#157375]">No {status} properties found.</div>
                ) : (
                  filtered.map((p) => (
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
                          <div className="absolute bottom-2.5 right-2.5 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-sm text-label-sm font-bold text-[#157375] shadow-sm">
                            ${Number(p.price_per_night).toFixed(0)}<span className="font-caption text-caption text-[#157375] font-normal"> / night</span>
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-space-xs mb-1">
                            <h2 className="font-headline-sm text-headline-sm text-[#157375] tracking-tight group-hover:text-primary transition-colors truncate">{p.title}</h2>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${p.status === "pending" ? "bg-tertiary-fixed text-on-tertiary-fixed" : p.status === "approved" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === "pending" ? "bg-tertiary animate-pulse" : p.status === "approved" ? "bg-secondary" : "bg-error"}`}></span>
                              {p.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-label-md text-label-md text-[#157375] mb-space-xs">
                            <Icon name="location_on" className="material-symbols-outlined text-[18px] text-primary" />
                            <span className="font-medium text-[#157375]">{p.location}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-space-sm font-caption text-caption text-[#157375]">
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
                        </div>
                      </div>
                      <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-space-md border-t xl:border-t-0 pt-space-sm xl:pt-0 border-surface-container flex-shrink-0">
                        <div className="flex flex-col xl:items-end">
                          <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Owner ID</span>
                          <span className="font-label-md text-label-md font-semibold text-[#157375]">#{p.owner_id}</span>
                          <span className="font-caption text-caption text-[#157375]">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(p.id)}
                                disabled={busy === p.id}
                                className="h-10 px-5 bg-gradient-to-r from-[#0f3d3e] to-[#157375] hover:from-[#0a2e2f] hover:to-[#0f3d3e] text-white font-label-md text-label-md font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Icon name="check_circle" className="material-symbols-outlined text-[18px] text-white" />
                                {busy === p.id ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => setRejectId(p.id)}
                                className="h-10 px-5 bg-white border border-slate-200 text-[#1E293B] hover:bg-slate-50 hover:border-slate-300 font-label-md text-label-md font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <Icon name="close" className="material-symbols-outlined text-[16px]" />
                                Reject
                              </button>
                            </>
                          )}
                          <Link className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-[#0f3d3e] font-label-md text-label-md font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition-all" href={`/admin/properties/${p.id}`}>
                            <Icon name="visibility" className="material-symbols-outlined text-[18px] text-[#0f3d3e]" />
                            <span className="text-[#0f3d3e]">View</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {rejectId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
              <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-4">
                <h3 className="font-headline-sm text-headline-sm">Reject Property?</h3>
                <p className="font-body-md text-body-md text-[#157375]">Provide a reason for rejection. The owner will be notified.</p>
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
                  <h3 className="font-display font-bold text-[17px] text-[#0f3d3e]">Heads up</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{alertMsg}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <button onClick={() => setAlertMsg(null)} className="px-6 py-2.5 rounded-xl bg-[#0f3d3e] text-white hover:bg-[#0a2e2f] font-semibold min-w-[120px]">OK, got it</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
