"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { getMyProperties, deleteProperty, type PropertyResponse } from "@/services/owner";

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-secondary-container text-on-secondary-container">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        Approved — Live on StayLeb
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
        Pending Admin Review
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-error-container text-on-error-container">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        Rejected — Action Required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-surface-container-high text-on-surface-variant">
      {status}
    </span>
  );
}

export function MyPropertiesSection0() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const counts = useMemo(() => {
    return {
      all: properties.length,
      approved: properties.filter((p) => p.status === "approved").length,
      pending: properties.filter((p) => p.status === "pending").length,
      rejected: properties.filter((p) => p.status === "rejected").length,
    };
  }, [properties]);

  const filtered = useMemo(() => {
    let list = properties;
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.property_type.toLowerCase().includes(q));
    }
    return list;
  }, [properties, filter, query]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProperty(deleteTarget.id);
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToast({ text: `"${deleteTarget.title}" deleted`, ok: true });
      setDeleteTarget(null);
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : "Delete failed", ok: false });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
              <div className="flex flex-col gap-space-xxs">
                <div className="flex items-center gap-space-xs text-[#46B1B1] font-label-sm text-label-sm">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    Host Dashboard
                  </span>
                  <span>•</span>
                  <span>Lebanon Portfolio Live</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight mt-1">My Properties</h1>
                <p className="font-body-md text-body-md text-[#46B1B1]/70">Manage your chalets and furnished houses, check approval statuses, and configure listings.</p>
              </div>
              <div className="flex items-center gap-space-sm shrink-0">
                <div className="hidden lg:flex items-center bg-surface-container-lowest px-space-md py-space-xs rounded-xl gap-space-sm shadow-sm">
                  <div className="flex flex-col items-end">
                    <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Portfolio</span>
                    <span className="font-label-md text-label-md text-primary font-bold">{counts.all} {counts.all === 1 ? "Property" : "Properties"}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <Icon name="cottage" className="material-symbols-outlined text-[20px]" />
                  </div>
                </div>
                <Link href="/owner/properties/new" className="inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 transition-all">
                  <Icon name="add" className="material-symbols-outlined text-[18px]" />
                  <span>Add Property</span>
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md mb-space-lg">
              <div className="relative overflow-hidden bg-surface-bright rounded-xl px-space-md py-space-xs flex flex-wrap gap-space-xs">
                {[
                  { key: "all", label: "All Properties", count: counts.all },
                  { key: "approved", label: "Approved / Live", count: counts.approved },
                  { key: "pending", label: "Pending Review", count: counts.pending },
                  { key: "rejected", label: "Rejected", count: counts.rejected },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as typeof filter)}
                    className={`relative flex items-center gap-space-xs pb-space-md pt-space-xs px-space-xs font-label-md text-label-md font-semibold transition-colors ${filter === tab.key ? "text-primary" : "text-[#46B1B1] hover:text-[#46B1B1]"} overflow-visible`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-bold ${filter === tab.key ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container text-[#46B1B1]"}`}>
                      {tab.count}
                    </span>
                    {filter === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-space-sm w-full lg:w-auto">
                <div className="relative flex-1 lg:w-72">
                  <Icon name="search" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-11 pr-4 h-11 bg-surface-container-lowest text-[#46B1B1] font-body-md text-body-md rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim transition-all placeholder:text-[#46B1B1]/60" placeholder="Filter by name, region..." type="text" aria-label="Filter by name, region..." />
                </div>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm ${toast.ok ? "bg-secondary-container text-on-secondary-container border border-secondary/20" : "bg-error-container text-on-error-container border border-error/20"}`}>
                <Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
                <span>{toast.text}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-8 text-center text-error">
                <Icon name="error" className="material-symbols-outlined text-[28px] mb-2" />
                <p className="text-sm">Failed to load properties</p>
                <p className="text-xs text-[#46B1B1]/70 mt-1">{error}</p>
                <button onClick={load} className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors">Retry</button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="p-8 text-center text-[#46B1B1]">
                <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                <p className="mt-2 text-sm">Loading properties…</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && properties.length === 0 && (
              <div className="p-8 text-center text-[#46B1B1]">
                <Icon name="cottage" className="material-symbols-outlined text-[48px] text-primary/50 mb-2" />
                <h3 className="font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1">No properties yet</h3>
                <p className="font-body-md text-body-md text-[#46B1B1]/70 max-w-md mx-auto mb-4">All chalets and furnished houses in Lebanon are submitted directly to our curation team for local compliance and quality verification before going live.</p>
                <Link href="/owner/properties/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 transition-all">
                  <Icon name="add_circle" className="material-symbols-outlined text-[18px]" /> Add Property
                </Link>
              </div>
            )}

            {/* No results for filter/search */}
            {!loading && !error && filtered.length === 0 && properties.length > 0 && (
              <div className="p-8 text-center text-[#46B1B1]">
                <Icon name="search_off" className="material-symbols-outlined text-[40px] text-primary/50 mb-2" />
                <p className="font-title-sm text-title-sm font-semibold text-[#46B1B1]">No properties match your filters</p>
                <p className="font-body-sm text-body-sm text-[#46B1B1]/70 mt-1">Try adjusting search or filter tabs.</p>
                <button onClick={() => { setFilter("all"); setQuery(""); }} className="mt-4 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white border border-primary text-sm font-medium shadow-sm">Clear filters</button>
              </div>
            )}

            {/* List */}
            {!loading && !error && filtered.length > 0 && (
              <div className="flex flex-col gap-space-lg" id="properties-container">
                {filtered.map((property) => {
                  const primary = property.images.find((img) => img.is_primary) || property.images[0];
                  const price = typeof property.price_per_night === "string" ? property.price_per_night : String(property.price_per_night);
                  return (
                    <div key={property.id} className="property-card bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-sm hover:bg-surface-bright transition-all group flex flex-col xl:flex-row gap-space-lg items-start xl:items-center relative overflow-hidden">
                      {property.status === "pending" && <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary" />}
                      {property.status === "rejected" && <div className="absolute top-0 left-0 w-1.5 h-full bg-error" />}
                      <div className="relative w-full h-48 shrink-0 rounded-xl overflow-hidden bg-surface-container">
                        {primary ? (
                          <LocalImage className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={primary.image_url} alt={property.title} data-alt={property.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                            <Icon name="image" className="material-symbols-outlined text-[32px]" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-on-surface/80 backdrop-blur-md text-surface text-[11px] font-caption px-2 py-0.5 rounded-full font-medium shadow-sm">
                          <Icon name="cottage" className="material-symbols-outlined text-[13px] text-secondary-fixed" />
                          <span className="capitalize">{property.property_type.replace("_", " ")}</span>
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-sm text-label-sm font-bold text-[#46B1B1] shadow-sm">
                          ${Number(price).toFixed(0)}<span className="font-caption text-caption text-[#46B1B1] font-normal"> / night</span>
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs mb-space-sm">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-space-xs flex-wrap mb-1">
                              <StatusBadge status={property.status} />
                              {property.status === "approved" && <span className="font-caption text-caption text-on-surface-variant flex items-center gap-0.5"><Icon name="verified" className="material-symbols-outlined text-[14px] text-primary" /> Verified</span>}
                              {property.status === "rejected" && property.rejection_reason && <span className="font-caption text-caption text-error truncate max-w-[220px]" title={property.rejection_reason}>· {property.rejection_reason.slice(0, 60)}</span>}
                            </div>
                            <h2 className="font-headline-sm text-headline-sm text-[#46B1B1] tracking-tight group-hover:text-primary transition-colors truncate">{property.title}</h2>
                            <div className="flex items-center gap-1 font-label-md text-label-md text-[#46B1B1] mb-space-xs">
                              <Icon name="location_on" className="material-symbols-outlined text-[18px] text-primary" />
                              <span className="font-medium text-[#46B1B1]">{property.location}</span>
                              {property.address && <span className="text-[#46B1B1]/60 text-xs truncate">· {property.address}</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-space-sm font-caption text-caption text-[#46B1B1]">
                              <span className="flex items-center gap-1">
                                <Icon name="bed" className="material-symbols-outlined text-[14px]" />
                                {property.bedrooms} Bedrooms
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Icon name="bathtub" className="material-symbols-outlined text-[14px]" />
                                {property.bathrooms} Baths
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Icon name="groups" className="material-symbols-outlined text-[14px]" />
                                {property.max_guests} Guests
                              </span>
                            </div>
                            {property.status === "rejected" && property.rejection_reason && (
                              <p className="mt-2 text-xs text-error bg-error-container/30 px-2 py-1 rounded">Reason: {property.rejection_reason}</p>
                            )}
                          </div>
                          <div className="sm:text-right mt-space-xs sm:mt-0 shrink-0">
                            <div className="flex sm:flex-col items-baseline sm:items-end gap-1">
                              <span className="font-headline-md text-headline-md font-bold text-primary">${Number(price).toFixed(2)}</span>
                              <span className="font-caption text-caption text-on-surface-variant">base / night</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                          <div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption">
                            <Icon name="schedule" className="material-symbols-outlined text-[16px] text-secondary" />
                            <span>Updated {new Date(property.updated_at).toLocaleDateString()}</span>
                            <span className="text-outline-variant">·</span>
                            <span>{property.images.length} {property.images.length === 1 ? "image" : "images"}</span>
                            <span className="text-outline-variant">·</span>
                            <span>{property.amenities.length} amenities</span>
                          </div>
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <Link href={`/owner/properties/${property.id}/preview`} className="h-10 px-4 bg-gradient-to-r from-[#46B1B1] to-[#3A9E9E] hover:from-[#3A9E9E] hover:to-[#0f3d3e] text-white font-label-md text-label-md font-semibold rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-1">
                              <Icon name="visibility" className="material-symbols-outlined text-[18px]" /> Preview
                            </Link>
                            <Link href={`/owner/properties/${property.id}/edit`} className="h-10 px-4 bg-gradient-to-r from-[#46B1B1] to-[#3A9E9E] hover:from-[#3A9E9E] hover:to-[#0f3d3e] text-white font-label-md text-label-md font-semibold rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-1">
                              <Icon name="edit" className="material-symbols-outlined text-[16px]" />
                              <span>Edit Listing</span>
                            </Link>
                            <Link href={`/owner/availability?property=${property.id}`} className="h-10 px-4 bg-gradient-to-r from-[#46B1B1] to-[#3A9E9E] hover:from-[#3A9E9E] hover:to-[#0f3d3e] text-white font-label-md text-label-md font-semibold rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-1">
                              <Icon name="calendar_today" className="material-symbols-outlined text-[16px]" />
                              <span>Availability</span>
                            </Link>
                            <button onClick={() => setDeleteTarget(property)} className="h-10 w-10 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 transition-all flex items-center justify-center" title="Delete property" aria-label={`Delete ${property.title}`}>
                              <Icon name="delete" className="material-symbols-outlined text-[18px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-space-xl pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-md text-[#46B1B1]/70 font-caption text-caption">
              <div className="flex items-center gap-space-md">
                <span className="flex items-center gap-1"><Icon name="payments" className="material-symbols-outlined text-[14px] text-primary" /> Host payouts processed in fresh USD</span>
                <span>·</span>
                <span>Live portfolio management</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span>StayLeb Host Dashboard</span>
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold text-[#46B1B1]">All systems operational</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {deleteTarget && (
        <Modal title="Delete property?" onClose={() => !deleting && setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="font-body-md text-body-md text-on-surface-variant">You are about to delete <strong className="text-on-surface">{deleteTarget.title}</strong>. This action cannot be undone and will remove all associated images, seasonal pricing and blocked dates.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button disabled={deleting} onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl bg-surface-container text-[#46B1B1] border border-surface-container-highest hover:bg-surface-container-high font-label-md text-label-md transition-colors disabled:opacity-50 font-semibold">Cancel</button>
              <button disabled={deleting} onClick={confirmDelete} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white border border-primary disabled:opacity-50 font-label-md text-label-md font-semibold transition-colors flex items-center gap-2 shadow-sm">
                {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="delete" className="material-symbols-outlined text-[18px]" />}
                {deleting ? "Deleting…" : "Delete property"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}