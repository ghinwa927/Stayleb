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
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-[#ECFDF5] text-[#059669] border border-[#059669]/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
        Approved — Live on StayLeb
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
        Pending Admin Review
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
        Rejected — Action Required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-[#F1F5F9] text-[#475569]">
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
        <main className="w-full pt-6 px-space-lg pb-space-xl min-h-screen bg-surface-container-low">
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
              <div className="flex items-center p-1 bg-surface-container-high rounded-xl overflow-x-auto max-w-full">
                {[
                  { key: "all", label: "All Properties", count: counts.all },
                  { key: "approved", label: "Approved / Live", count: counts.approved },
                  { key: "pending", label: "Pending Review", count: counts.pending },
                  { key: "rejected", label: "Rejected", count: counts.rejected },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as typeof filter)}
                    className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md whitespace-nowrap transition-all ${filter === tab.key ? "bg-surface-container-lowest text-primary shadow-sm font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-caption text-caption ${filter === tab.key ? "bg-surface-container text-primary" : "bg-surface-container-low text-on-surface-variant"}`}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-space-sm w-full lg:w-auto">
                <div className="relative flex-1 lg:w-72">
                  <Icon name="search" className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl outline-none placeholder:text-outline shadow-sm focus:shadow-md transition-shadow" placeholder="Filter by name, region..." type="text" aria-label="Filter by name, region..." />
                </div>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm ${toast.ok ? "bg-[#ECFDF5] text-[#065F46] border border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/20"}`}>
                <Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
                <span>{toast.text}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[#FFF1F2] border border-[#E11D48]/20 flex items-start gap-3">
                <Icon name="error" className="material-symbols-outlined text-[#E11D48] text-[20px] mt-0.5" />
                <div className="flex-1">
                  <p className="font-label-md text-label-md font-semibold text-[#E11D48]">Failed to load properties</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error}</p>
                  <button onClick={load} className="mt-3 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white border border-primary text-sm font-medium shadow-sm">Retry</button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col gap-space-lg">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-sm flex flex-col xl:flex-row gap-space-lg animate-pulse">
                    <div className="w-full xl:w-72 h-48 rounded-xl bg-surface-container" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/3 bg-surface-container rounded" />
                      <div className="h-4 w-1/2 bg-surface-container rounded" />
                      <div className="grid grid-cols-5 gap-2 pt-4">
                        <div className="h-12 bg-surface rounded-xl" />
                        <div className="h-12 bg-surface rounded-xl" />
                        <div className="h-12 bg-surface rounded-xl" />
                        <div className="h-12 bg-surface rounded-xl" />
                        <div className="h-12 bg-surface rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && properties.length === 0 && (
              <div className="flex flex-col items-center justify-center p-space-xl bg-surface-container-lowest rounded-2xl shadow-sm text-center my-space-lg">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-space-md">
                  <Icon name="cottage" className="material-symbols-outlined text-[32px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xxs">List your first property on StayLeb</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">All chalets and furnished houses in Lebanon are submitted directly to our curation team for local compliance and quality verification before going live.</p>
                <Link href="/owner/properties/new" className="flex items-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md py-space-sm px-space-lg rounded-xl transition-all shadow-md">
                  <Icon name="add" className="material-symbols-outlined text-[20px]" />
                  <span>Add Property</span>
                </Link>
              </div>
            )}

            {/* No results for filter/search */}
            {!loading && !error && filtered.length === 0 && properties.length > 0 && (
              <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                <Icon name="search_off" className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2" />
                <p className="font-title-sm text-title-sm font-semibold text-on-surface">No properties match your filters</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Try adjusting search or filter tabs.</p>
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
                    <div key={property.id} className="property-card bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col xl:flex-row gap-space-lg items-start xl:items-center relative overflow-hidden">
                      {property.status === "pending" && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D97706]" />}
                      {property.status === "rejected" && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#E11D48]" />}
                      <div className="relative w-full xl:w-72 h-48 shrink-0 rounded-xl overflow-hidden bg-surface-container">
                        {primary ? (
                          <LocalImage className="w-full h-full object-cover" src={primary.image_url} alt={property.title} data-alt={property.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                            <Icon name="image" className="material-symbols-outlined text-[32px]" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md font-caption text-caption font-semibold px-2 py-1 rounded-md text-on-surface shadow-sm capitalize">{property.property_type.replace("_", " ")}</span>
                        <span className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 text-on-surface font-caption text-caption shadow-sm">ID #{property.id}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs mb-space-sm">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-space-xs flex-wrap mb-1">
                              <StatusBadge status={property.status} />
                              {property.status === "approved" && <span className="font-caption text-caption text-on-surface-variant flex items-center gap-0.5"><Icon name="verified" className="material-symbols-outlined text-[14px] text-primary" /> Verified</span>}
                              {property.status === "rejected" && property.rejection_reason && <span className="font-caption text-caption text-[#E11D48] truncate max-w-[220px]" title={property.rejection_reason}>· {property.rejection_reason.slice(0, 60)}</span>}
                            </div>
                            <h2 className="font-title-md text-title-md font-bold text-on-surface tracking-tight truncate">{property.title}</h2>
                            <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-body-md mt-0.5">
                              <Icon name="location_on" className="material-symbols-outlined text-[16px] text-primary" />
                              <span className="truncate">{property.location}{property.address ? ` · ${property.address}` : ""}</span>
                            </div>
                          </div>
                          <div className="sm:text-right mt-space-xs sm:mt-0 shrink-0">
                            <div className="flex sm:flex-col items-baseline sm:items-end gap-1">
                              <span className="font-headline-md text-headline-md font-bold text-primary">${Number(price).toFixed(2)}</span>
                              <span className="font-caption text-caption text-on-surface-variant">base / night</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs py-space-sm my-space-xs bg-surface rounded-xl px-space-md">
                          <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Bedrooms</span><span className="font-label-md text-label-md font-semibold text-on-surface">{property.bedrooms} Bedrooms</span></div>
                          <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Bed Arrangement</span><span className="font-label-md text-label-md font-semibold text-on-surface">{property.beds} Beds</span></div>
                          <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Bathrooms</span><span className="font-label-md text-label-md font-semibold text-on-surface">{property.bathrooms} Baths</span></div>
                          <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Capacity</span><span className="font-label-md text-label-md font-semibold text-on-surface">Max {property.max_guests} Guests</span></div>
                          <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Stay Policy</span><span className="font-label-md text-label-md font-semibold text-on-surface">Min {property.min_nights} Nights</span></div>
                        </div>

                        {property.status === "pending" && (
                          <div className="flex items-center gap-space-xs p-space-sm bg-[#FFFBEB] border border-[#D97706]/10 rounded-xl mb-space-sm text-on-surface-variant font-body-md text-body-md">
                            <Icon name="info" className="material-symbols-outlined text-[18px] text-[#D97706] shrink-0" />
                            <span className="text-xs leading-relaxed text-[#92400E]">Awaiting StayLeb Admin verification before public listing. Updated {new Date(property.updated_at).toLocaleDateString()}.</span>
                          </div>
                        )}
                        {property.status === "rejected" && property.rejection_reason && (
                          <div className="flex items-start gap-space-xs p-space-sm bg-[#FFF1F2] border border-[#E11D48]/10 rounded-xl mb-space-sm">
                            <Icon name="error" className="material-symbols-outlined text-[18px] text-[#E11D48] shrink-0 mt-0.5" />
                            <div><p className="font-label-sm text-label-sm font-semibold text-[#E11D48]">Rejection reason</p><p className="font-body-sm text-body-sm text-[#881337] mt-0.5">{property.rejection_reason}</p></div>
                          </div>
                        )}

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
                            <Link href={`/owner/properties/${property.id}/preview`} className="px-space-md py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white border border-primary font-label-md text-label-md font-semibold transition-colors inline-flex items-center gap-1 shadow-sm">
                              <Icon name="visibility" className="material-symbols-outlined text-[16px]" /> Preview
                            </Link>
                            <Link href={`/owner/properties/${property.id}/edit`} className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-[#46B1B1] border border-surface-container-highest font-label-md text-label-md font-semibold transition-colors shadow-sm">Edit Listing</Link>
                            <Link href={`/owner/availability?property=${property.id}`} className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-[#46B1B1] border border-surface-container-highest font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm">
                              <Icon name="calendar_today" className="material-symbols-outlined text-[16px]" /> Availability
                            </Link>
                            <button onClick={() => setDeleteTarget(property)} className="p-1.5 rounded-lg bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-[#E11D48]/20 transition-colors" title="Delete property" aria-label={`Delete ${property.title}`}>
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
