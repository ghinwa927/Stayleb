"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, type PropertyResponse } from "@/services/owner";

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "approved") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-[#ECFDF5] text-[#059669] border border-[#059669]/10 font-semibold">Approved</span>;
  if (s === "pending") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/10 font-semibold"><span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" /> Pending Admin Review</span>;
  if (s === "rejected") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10 font-semibold">Rejected — Action Required</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-[#F1F5F9] text-[#475569] font-semibold">{status}</span>;
}

export function PropertyPendingReviewSection0() {
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
      <div className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-[#46B1B1] font-medium">Loading property…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
        <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-primary/10 text-center">
            <Icon name="error" className="material-symbols-outlined text-[32px] text-[#E11D48] mb-2" />
            <h2 className="font-title-md text-title-md font-bold text-[#46B1B1]">Failed to load property</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error || "Property not found or you do not have access."}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => router.push("/owner/properties")} className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm">Back to My Properties</button>
              <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-white border border-primary/10 text-[#46B1B1] text-sm font-medium">Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primary = property.images.find((im) => im.is_primary) || property.images[0];
  const isPending = property.status === "pending";
  const statusLower = property.status.toLowerCase();

  return (
    <>
      <div className="">
        <main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
          <div className="flex flex-col w-full max-w-7xl mx-auto">
            <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant tracking-wider uppercase mb-space-sm">
              <Link className="hover:text-[#46B1B1] transition-colors" href="/owner/properties">My Properties</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
              <span className="text-[#46B1B1] font-semibold truncate max-w-[200px]">{property.title}</span>
              <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
              <span className="text-[#46B1B1] font-semibold">Pending Review</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
              <div className="flex flex-col gap-space-xxs">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <h1 className="font-headline-lg text-headline-lg text-[#46B1B1]">Your property is under review</h1>
                  <StatusBadge status={property.status} />
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                <Link href={`/owner/properties/${property.id}/preview`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-primary/10 text-[#46B1B1] hover:bg-primary hover:text-white font-label-md text-label-md font-medium transition-colors shadow-sm">
                  <Icon name="visibility" className="material-symbols-outlined text-[18px]" /> Preview
                </Link>
                <Link href="/owner/properties" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-label-md text-label-md font-medium shadow-sm">
                  <Icon name="arrow_back" className="material-symbols-outlined text-[18px]" /> Back to My Properties
                </Link>
              </div>
            </div>

            {!isPending && (
              <div className="mb-space-md p-4 rounded-xl border flex items-start gap-3 bg-surface-container-lowest shadow-sm" style={statusLower === "approved" ? { background: "#ECFDF5", borderColor: "#05966920" } : { background: "#FFF1F2", borderColor: "#E11D4820" }}>
                <Icon name={statusLower === "approved" ? "check_circle" : "error"} className={`material-symbols-outlined text-[20px] mt-0.5 ${statusLower === "approved" ? "text-[#059669]" : "text-[#E11D48]"}`} />
                <div>
                  <p className={`font-label-md text-label-md font-semibold ${statusLower === "approved" ? "text-[#059669]" : "text-[#E11D48]"}`}>
                    This property status is now: {property.status}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {statusLower === "approved" ? "This property has been approved and is live. You can manage it from My Properties." : statusLower === "rejected" ? "This property was rejected. Please check the rejected page for details." : "Status has changed."}
                  </p>
                  {statusLower === "rejected" && (
                    <Link href={`/owner/properties/${property.id}/rejected`} className="inline-flex mt-2 text-sm font-medium text-[#E11D48] hover:underline">View rejection details</Link>
                  )}
                </div>
              </div>
            )}

            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm mb-space-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                  <Icon name="hourglass_top" className="material-symbols-outlined text-[22px]" />
                </div>
                <div>
                  <h2 className="font-title-md text-title-md text-[#46B1B1] font-semibold mb-1">Under Admin Review</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    StayLeb is reviewing this property. You can check your properties page for status updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-5 flex flex-col gap-space-lg">
                <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden">
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container">
                    {primary ? (
                      <LocalImage className="w-full h-full object-cover" src={primary.image_url} alt={property.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-on-surface-variant">
                        <Icon name="image" className="material-symbols-outlined text-[32px]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#46B1B1] font-caption text-caption flex items-center gap-1 shadow-sm">
                      <Icon name="pin_drop" className="material-symbols-outlined text-[15px] text-primary" />
                      <span className="truncate max-w-[140px]">{property.location}</span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <span className="font-caption text-caption text-white/80 uppercase tracking-widest block capitalize">{property.property_type.replace("_", " ")}</span>
                        <span className="font-headline-sm text-headline-sm text-white font-bold drop-shadow-sm line-clamp-1">{property.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-headline-md text-headline-md text-white font-bold leading-none">${Number(property.price_per_night).toFixed(2)}</span>
                        <span className="font-caption text-caption text-white/80 block">/ night</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-space-md flex flex-col gap-space-sm">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-high font-caption text-caption text-[#46B1B1] flex items-center gap-1">
                        <Icon name="bed" className="material-symbols-outlined text-[14px] text-outline" /> {property.bedrooms} Bedrooms
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-high font-caption text-caption text-[#46B1B1] flex items-center gap-1">
                        <Icon name="bathtub" className="material-symbols-outlined text-[14px] text-outline" /> {property.bathrooms} Bathrooms
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-high font-caption text-caption text-[#46B1B1] flex items-center gap-1">
                        <Icon name="group" className="material-symbols-outlined text-[14px] text-outline" /> Max {property.max_guests} Guests
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      Updated {new Date(property.updated_at).toLocaleDateString()} · {property.images.length} {property.images.length === 1 ? "image" : "images"} · {property.amenities.length} amenities
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="verified_user" className="material-symbols-outlined text-primary text-[20px]" />
                    <span className="font-title-md text-title-md text-[#46B1B1] font-semibold">What happens next?</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Our team manually verifies property details, images, and amenities before activating public discovery. You will be notified when the review is complete.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                    <div className="p-3 rounded-xl bg-[#ECFDF5]/60 border border-[#059669]/10">
                      <p className="font-label-md text-label-md font-bold text-[#059669] flex items-center gap-1.5"><Icon name="check_circle" className="material-symbols-outlined text-[18px]" /> If Approved</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Your listing becomes live and searchable on the StayLeb marketplace.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF1F2]/60 border border-[#E11D48]/10">
                      <p className="font-label-md text-label-md font-bold text-[#E11D48] flex items-center gap-1.5"><Icon name="edit_note" className="material-symbols-outlined text-[18px]" /> If Revisions Needed</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">You will receive the admin rejection reason and can edit and resubmit.</p>
                    </div>
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
