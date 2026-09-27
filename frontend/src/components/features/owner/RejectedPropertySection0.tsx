"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, type PropertyResponse } from "@/services/owner";

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "rejected") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10 font-label-md text-label-md font-semibold">Rejected — Action Required</span>;
  if (s === "pending") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/10 font-label-md text-label-md font-semibold"><span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" /> Pending Admin Review</span>;
  if (s === "approved") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#059669]/10 font-label-md text-label-md font-semibold">Approved — Live</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-[#F1F5F9] text-[#475569] font-semibold">{status}</span>;
}

export function RejectedPropertySection0() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getOwnerProperty(id)
      .then(setProperty)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load property"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#157375]/20 border-t-[#157375] rounded-full animate-spin" />
          <span className="text-sm text-[#157375] font-medium">Loading property…</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-[#157375]/10 text-center">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-[#E11D48] mb-2" />
          <h2 className="font-title-md text-title-md font-bold text-[#1E293B]">Failed to load property</h2>
          <p className="font-body-sm text-body-sm text-[#64748B] mt-1">{error || "Property not found or you do not have access."}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => router.push("/owner/properties")} className="px-4 py-2 rounded-xl bg-[#157375] hover:bg-[#0f4a4c] text-white text-sm font-medium shadow-sm">Back to My Properties</button>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-white border border-[#157375]/10 text-[#157375] text-sm font-medium">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const primary = property.images.find((im) => im.is_primary) || property.images[0];
  const statusLower = property.status.toLowerCase();
  const isRejected = statusLower === "rejected";
  const rejectionReason = property.rejection_reason && property.rejection_reason.trim() ? property.rejection_reason.trim() : "No rejection reason was provided.";

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <nav className="flex items-center gap-space-xs font-caption text-caption text-[#64748B] tracking-wider uppercase mb-space-sm">
              <Link className="hover:text-[#157375] transition-colors" href="/owner/properties">My Properties</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
              <span className="text-[#157375] font-semibold truncate max-w-[200px]">{property.title}</span>
              <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
              <span className="text-[#1E293B] font-semibold">Rejected</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
              <div>
                <div className="flex items-center gap-space-xs flex-wrap mb-space-xxs">
                  <h1 className="font-headline-lg text-headline-lg text-[#1E293B] tracking-tight">Revisions Required — {property.title}</h1>
                </div>
                <div className="flex items-center gap-2 font-caption text-caption text-[#64748B] flex-wrap">
                  <span className="capitalize">{property.property_type.replace("_", " ")}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Icon name="location_on" className="material-symbols-outlined text-[14px] text-[#157375]" /> {property.location}</span>
                </div>
              </div>
              <StatusBadge status={property.status} />
            </div>

            {!isRejected && (
              <div className="mb-space-lg p-4 rounded-xl border flex items-start gap-3 bg-[#FFFBEB] border-[#D97706]/20">
                <Icon name="info" className="material-symbols-outlined text-[#D97706] text-[20px] mt-0.5" />
                <div>
                  <p className="font-label-md text-label-md font-semibold text-[#92400E]">This property status is now: {property.status}</p>
                  <p className="font-body-sm text-body-sm text-[#64748B] mt-1">
                    {statusLower === "approved" ? "This property has been approved and is live." : statusLower === "pending" ? "This property is currently under review." : `Current status: ${property.status}`}
                  </p>
                  <Link href="/owner/properties" className="inline-flex mt-2 text-sm font-medium text-[#157375] hover:underline">Back to My Properties</Link>
                </div>
              </div>
            )}

            <div className="bg-[#FFF1F2]/50 border border-[#E11D48]/10 rounded-xl p-space-lg mb-space-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] border border-[#E11D48]/10 flex items-center justify-center shrink-0 text-[#E11D48]">
                  <Icon name="report" className="material-symbols-outlined text-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-title-md text-title-md text-[#881337] font-bold">Admin Rejection Reason</h2>
                  <p className="font-body-md text-body-md text-[#881337] mt-2 whitespace-pre-wrap break-words">{rejectionReason}</p>
                  {!property.rejection_reason?.trim() && (
                    <p className="font-body-sm text-body-sm text-[#64748B] mt-2 italic">No additional details were provided by the admin.</p>
                  )}
                  <p className="font-caption text-caption text-[#64748B] mt-3">Status: {property.status} · Updated {new Date(property.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                  <h3 className="font-title-md text-title-md text-[#1E293B] font-bold mb-space-sm">Next Steps to Publish</h3>
                  <ol className="space-y-3 font-body-md text-body-md text-[#64748B]">
                    <li className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[#157375] text-white flex items-center justify-center font-bold text-sm shrink-0">1</span><span>Click <strong className="text-[#1E293B]">Edit & Resubmit</strong> to fix the issues above.</span></li>
                    <li className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[#E4ECEE] text-[#1E293B] flex items-center justify-center font-bold text-sm shrink-0">2</span><span>Save your changes — the property will automatically return to <strong className="text-[#157375]">Pending Admin Review</strong> and be re-evaluated.</span></li>
                  </ol>
                  <div className="mt-space-lg flex flex-col sm:flex-row gap-3">
                    <Link href={`/owner/properties/${property.id}/edit`} className="flex-1 inline-flex items-center justify-center gap-2 bg-[#157375] hover:bg-[#0f4a4c] text-white font-label-md text-label-md py-3 px-6 rounded-xl shadow-md transition-colors">
                      Edit & Resubmit <Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
                    </Link>
                    <Link href="/owner/properties" className="inline-flex items-center justify-center gap-2 bg-white border border-[#157375]/10 text-[#157375] hover:bg-[#E4ECEE] font-label-md text-label-md py-3 px-5 rounded-xl transition-colors">
                      Back to My Properties
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                  <p className="font-label-md text-label-md text-[#1E293B] font-bold mb-3">Property Snapshot</p>
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#E4ECEE] mb-3">
                    {primary ? (
                      <LocalImage className="w-full h-full object-cover" src={primary.image_url} alt={property.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#64748B]"><Icon name="image" className="material-symbols-outlined text-[32px]" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                      <div>
                        <p className="font-title-sm text-title-sm font-bold leading-snug drop-shadow-sm line-clamp-1">{property.title}</p>
                        <p className="font-caption text-caption flex items-center gap-1 opacity-90"><Icon name="location_on" className="material-symbols-outlined text-[12px]" /> {property.location}</p>
                      </div>
                      <span className="font-title-sm text-title-sm font-bold">${Number(property.price_per_night).toFixed(2)}<span className="font-body-sm text-body-sm font-normal opacity-80"> /night</span></span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-[#E4ECEE]"><p className="font-bold text-[#1E293B]">{property.bedrooms} Bedrooms</p><p className="text-[#64748B]">{property.beds} Beds</p></div>
                    <div className="p-2 rounded-lg bg-[#E4ECEE]"><p className="font-bold text-[#1E293B]">Max {property.max_guests}</p><p className="text-[#64748B]">Guests</p></div>
                    <div className="p-2 rounded-lg bg-[#E4ECEE]"><p className="font-bold text-[#1E293B]">{property.bathrooms} Baths</p><p className="text-[#64748B]">Private</p></div>
                  </div>
                  <div className="mt-3">
                    <Link href={`/owner/properties/${property.id}/preview`} className="inline-flex items-center gap-1 text-sm font-medium text-[#157375] hover:underline"><Icon name="visibility" className="material-symbols-outlined text-[16px]" /> View Preview</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
