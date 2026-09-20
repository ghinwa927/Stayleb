"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";

type Property = {
  id: number;
  title: string;
  description: string;
  property_type: string;
  location: string;
  address: string | null;
  price_per_night: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  min_nights: number;
  status: string;
  rejection_reason: string | null;
  images: { image_url: string }[];
  amenities: { name: string }[];
  property_rules: { rule_id: number; allowed: boolean; value: string | null }[];
  seasonal_prices: { start_date: string; end_date: string; price_per_night: string }[];
  created_at: string;
  owner_id: number;
};

export function PropertyReviewApprovalSection0() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ? Number(params.id) : 1;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [masterRules, setMasterRules] = useState<{ id: number; name: string; category: string }[]>([]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [data, rules] = await Promise.all([
        apiFetch(`/admin/properties/${id}`),
        apiFetch("/admin/rules").catch(() => []),
      ]);
      setProperty(data);
      setMasterRules(rules);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load property");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function handleApprove() {
    setBusy("approve");
    try {
      await apiFetch(`/admin/properties/${id}/approve`, { method: "PATCH" });
      setAlertMsg("Property approved and published!");
      setTimeout(() => router.push("/admin/properties"), 1200);
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setAlertMsg("Please provide at least 10 characters for rejection reason.");
      return;
    }
    setBusy("reject");
    try {
      await apiFetch(`/admin/properties/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      setAlertMsg("Property rejected. Owner will be notified.");
      setTimeout(() => router.push("/admin/properties"), 1200);
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-[#157375]">Loading property #{id}…</div>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
        <div className="bg-error-container text-on-error-container p-4 rounded-xl">{error || "Property not found"}</div>
        <Link href="/admin/properties" className="inline-flex mt-4 text-primary hover:underline">
          ← Back to approvals
        </Link>
      </div>
    );
  }

  const p = property;

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
              <div className="flex flex-col">
                <nav className="flex items-center gap-space-xxs text-[#157375] font-caption text-caption uppercase tracking-wider mb-space-xxs">
                  <Link href="/admin/properties" className="hover:text-primary">Administration</Link>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <Link href="/admin/properties" className="hover:text-primary">Property Approvals</Link>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="font-semibold text-primary">PROP-{p.id}</span>
                </nav>
                <h1 className="font-headline-md text-headline-md text-[#157375] tracking-tight">Property Review — {p.title}</h1>
                <p className="font-body-md text-body-md text-[#157375] mt-0.5">Inspect submitted property specifications, photos, and policies. Make an official marketplace listing decision.</p>
              </div>
              <div className="flex items-center gap-space-xs self-start md:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-[#157375] font-label-sm text-label-sm font-semibold">
                  <Icon name="calendar_today" className="material-symbols-outlined text-[16px] text-primary" />
                  Submitted: {new Date(p.created_at).toLocaleDateString()}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${p.status === "pending" ? "bg-tertiary-fixed text-on-tertiary-fixed" : p.status === "approved" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                  <span className={`w-2 h-2 rounded-full ${p.status === "pending" ? "bg-tertiary animate-pulse" : p.status === "approved" ? "bg-secondary" : "bg-error"}`}></span>
                  {p.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
                  <div className="flex items-start gap-space-md">
                    <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Icon name="cabin" className="material-symbols-outlined text-[28px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-[#157375] font-semibold">{p.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold capitalize">{p.property_type.replace("_", " ")}</span>
                      </div>
                      <p className="font-body-md text-body-md text-[#157375] flex items-center gap-1 mt-1">
                        <Icon name="pin_drop" className="material-symbols-outlined text-[18px] text-primary" />
                        <span>{p.location}</span>
                        {p.address && (
                          <>
                            <span className="mx-1.5 text-outline-variant">•</span>
                            <span className="text-[#157375] font-medium">{p.address}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-lg self-stretch md:self-auto justify-between md:justify-start">
                    <div className="flex flex-col text-left">
                      <span className="font-caption text-caption text-[#157375] uppercase">Listed Host</span>
                      <span className="font-label-md text-label-md font-semibold text-[#157375]">Owner #{p.owner_id}</span>
                    </div>
                    <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-highest text-primary font-mono font-medium">#{p.owner_id}</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="photo_library" className="material-symbols-outlined text-primary text-[22px]" />
                      <span className="font-title-md text-title-md text-[#157375]">Submitted Visual Media</span>
                    </div>
                    <span className="font-caption text-caption font-semibold uppercase tracking-wider text-[#157375]">{p.images?.length || 0} Photographs</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm mt-space-xs">
                    {p.images && p.images.length > 0 ? (
                      <>
                        <div className="md:col-span-7 relative group rounded-xl overflow-hidden shadow-sm bg-surface-container h-[300px]">
                          <LocalImage className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={p.images[0].image_url} alt={p.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-90"></div>
                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[#157375] font-caption text-caption font-semibold flex items-center gap-1">
                              <Icon name="star" className="material-symbols-outlined text-[14px] text-primary" /> Cover Perspective
                            </span>
                            <span className="font-caption text-caption text-surface-container-lowest">Exterior Façade</span>
                          </div>
                        </div>
                        <div className="md:col-span-5 grid grid-rows-3 gap-space-xs h-[300px]">
                          {p.images.slice(1, 4).map((img, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm bg-surface-container">
                              <LocalImage className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={img.image_url} alt={p.title} />
                              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-transparent to-transparent"></div>
                              <span className="absolute bottom-2 left-2.5 text-surface-container-lowest font-caption text-caption font-medium">Image {idx + 2}</span>
                            </div>
                          ))}
                          {p.images.length === 1 && (
                            <div className="col-span-1 row-span-3 flex items-center justify-center bg-surface-container-low rounded-xl text-[#157375] text-sm">Only 1 image submitted</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="col-span-12 h-[200px] flex items-center justify-center bg-surface-container-low rounded-xl text-[#157375]">No images submitted</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-[#157375] uppercase font-medium">Base Nightly Rate</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-md text-headline-md font-bold text-primary">${Number(p.price_per_night).toFixed(2)}</span>
                      <span className="font-caption text-caption text-[#157375] font-medium">USD</span>
                    </div>
                    <span className="font-caption text-caption text-secondary font-medium mt-1">Standard Season Base</span>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-[#157375] uppercase font-medium">Capacity</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-md text-headline-md font-bold text-[#157375]">{p.max_guests}</span>
                      <span className="font-body-md text-body-md text-[#157375]">Guests</span>
                    </div>
                    <span className="font-caption text-caption text-[#157375] mt-1">Max Occupancy Limit</span>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-[#157375] uppercase font-medium">Rooms & Beds</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-md text-headline-md font-bold text-[#157375]">{p.bedrooms} BR</span>
                      <span className="font-caption text-caption text-[#157375] font-medium">/ {p.beds} Beds</span>
                    </div>
                    <span className="font-caption text-caption text-[#157375] mt-1">{p.bathrooms} Full Bathrooms</span>
                  </div>
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-[#157375] uppercase font-medium">Minimum Stay</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-md text-headline-md font-bold text-[#157375]">{p.min_nights}</span>
                      <span className="font-body-md text-body-md text-[#157375]">Nights</span>
                    </div>
                    <span className="font-caption text-caption text-[#157375] mt-1">Strict Reservation Policy</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-xs text-primary mb-1">
                    <Icon name="notes" className="material-symbols-outlined text-[20px]" />
                    <span className="font-title-md text-title-md text-[#157375]">Owner Listing Narrative</span>
                  </div>
                  <p className="font-body-lg text-body-lg text-[#157375] leading-relaxed bg-surface-container-low p-space-md rounded-lg">{p.description}</p>
                  {p.rejection_reason && (
                    <div className="mt-2 p-3 rounded-lg bg-error-container text-on-error-container">
                      <strong className="font-semibold">Rejection reason:</strong> {p.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="checklist" className="material-symbols-outlined text-primary text-[22px]" />
                    <h3 className="font-title-md text-title-md text-[#157375]">Amenities Configured</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                    {p.amenities && p.amenities.length > 0 ? (
                      p.amenities.map((am: any) => (
                        <div key={am.id || am.name} className="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-[#157375]">
                          <Icon name="check_circle" className="material-symbols-outlined text-[18px] text-primary" />
                          <span className="font-label-md text-label-md font-medium">{am.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-3 text-sm text-[#157375]/70">No amenities configured</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs text-primary">
                      <Icon name="gavel" className="material-symbols-outlined text-[20px]" />
                      <h3 className="font-title-md text-title-md text-[#157375]">House Rules Configured</h3>
                    </div>
                    <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-[#157375]">{p.property_rules?.length || 0} rules</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                    {p.property_rules && p.property_rules.length > 0 ? (
                      p.property_rules.map((pr: any, idx: number) => {
                        const rule = masterRules.find((m) => m.id === pr.rule_id);
                        const name = rule ? rule.name : `Rule #${pr.rule_id}`;
                        return (
                          <div key={idx} className="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-[#157375]">
                            <Icon name={pr.allowed ? "check_circle" : "block"} className={`material-symbols-outlined text-[18px] ${pr.allowed ? "text-secondary" : "text-error"} shrink-0`} />
                            <div className="flex flex-col min-w-0">
                              <span className="font-label-md text-label-md font-medium leading-tight truncate">{name}</span>
                              <span className={`font-caption text-caption font-semibold ${pr.allowed ? "text-secondary" : "text-error"}`}>{pr.allowed ? "Allowed" : "Not Allowed"}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="col-span-3 text-sm text-[#157375]/60 py-4 text-center bg-surface-container-low rounded-lg">No specific house rules configured for this property.</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-xs text-primary">
                    <Icon name="calendar_month" className="material-symbols-outlined text-[20px]" />
                    <h3 className="font-title-md text-title-md text-[#157375]">Seasonal Pricing Windows</h3>
                  </div>
                  {p.seasonal_prices && p.seasonal_prices.length > 0 ? (
                    <div className="flex flex-col gap-space-xs">
                      {p.seasonal_prices.map((sp: any, idx: number) => (
                        <div key={idx} className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-label-md text-label-md font-bold text-[#157375] flex items-center gap-1.5">
                              <Icon name="ac_unit" className="material-symbols-outlined text-[18px] text-primary" />
                              {sp.season_name ? sp.season_name.charAt(0).toUpperCase() + sp.season_name.slice(1) : `Seasonal Rate ${idx + 1}`}
                            </span>
                            <span className="font-label-md text-label-md font-bold text-primary bg-surface-container-lowest px-2.5 py-1 rounded-md shadow-sm">${Number(sp.price_per_night).toFixed(2)} / night</span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-1.5 text-[#157375] font-caption text-caption">
                              <Icon name="date_range" className="material-symbols-outlined text-[14px]" />
                              <span className="font-medium">From:</span> <span>{new Date(sp.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#157375] font-caption text-caption">
                              <Icon name="event" className="material-symbols-outlined text-[14px]" />
                              <span className="font-medium">To:</span> <span>{new Date(sp.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#157375]/60 py-6 text-center bg-surface-container-low rounded-xl">No seasonal pricing configured. Standard base rate applies.</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-space-lg sticky top-20">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
                      <h2 className="font-title-md text-title-md text-[#157375] font-semibold">Review Assessment</h2>
                    </div>
                    <span className="font-caption text-caption font-mono uppercase text-[#157375] font-medium">Vetting Phase</span>
                  </div>
                  <p className="font-body-md text-body-md text-[#157375]">Approving will immediately publish this property to the public StayLeb search index.</p>
                  {alertMsg && (
                    <div className={`p-3 rounded-lg text-sm ${alertMsg.includes("approved") ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                      {alertMsg}
                    </div>
                  )}
                  <div className="flex flex-col gap-space-xs pt-space-xs">
                    <button
                      onClick={handleApprove}
                      disabled={busy === "approve" || p.status === "approved"}
                      className="w-full flex items-center justify-center gap-2 h-12 px-space-md rounded-xl bg-primary text-white font-label-md text-label-md font-semibold hover:bg-[#0a2e2f] transition-all shadow-sm disabled:opacity-50"
                    >
                      <Icon name="check_circle" className="material-symbols-outlined text-[20px] text-white" />
                      <span>{busy === "approve" ? "Approving…" : p.status === "approved" ? "Already Approved" : "Approve & Publish Listing"}</span>
                    </button>
                    <button
                      onClick={() => setShowReject(!showReject)}
                      disabled={p.status === "rejected"}
                      className="w-full flex items-center justify-center gap-2 h-11 px-space-md rounded-xl bg-surface-container-low text-error hover:bg-error-container hover:text-on-error-container font-label-md text-label-md font-semibold transition-all disabled:opacity-50"
                    >
                      <Icon name="block" className="material-symbols-outlined text-[18px]" />
                      <span>{p.status === "rejected" ? "Already Rejected" : "Reject Property Listing"}</span>
                    </button>
                  </div>
                </div>

                {showReject && p.status !== "approved" && p.status !== "rejected" && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-error">
                        <Icon name="assignment_late" className="material-symbols-outlined text-[20px]" />
                        <h3 className="font-title-md text-title-md text-[#157375]">Listing Feedback & Rejection</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold">Action Required</span>
                    </div>
                    <p className="font-caption text-caption text-[#157375] leading-relaxed">Provide clear, itemized guidance to the host so they can edit and resubmit.</p>
                    <textarea
                      className="w-full p-3 rounded-lg bg-surface-container-low text-[#157375] focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-outline-variant resize-none"
                      placeholder="e.g., The primary cover photo is blurry. Please upload a high-resolution daylight photo. (min 10 characters)"
                      rows={4}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button onClick={() => setShowReject(false)} className="px-3 py-2 rounded-lg text-[#157375] hover:bg-surface-container">
                        Clear
                      </button>
                      <button onClick={handleReject} disabled={busy === "reject"} className="px-4 py-2 rounded-lg bg-error text-white font-semibold hover:opacity-90 disabled:opacity-50">
                        {busy === "reject" ? "Sending…" : "Send Notification & Decline"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      {alertMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f3d3e] text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {alertMsg}
        </div>
      )}
    </>
  );
}
