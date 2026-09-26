"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, getRules, type PropertyResponse, type Rule } from "@/services/owner";

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "approved") return <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#059669]/10 font-label-sm text-label-sm font-semibold">Approved — Live on StayLeb</span>;
  if (s === "pending") return <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/10 font-label-sm text-label-sm font-semibold">Pending Admin Review</span>;
  if (s === "rejected") return <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10 font-label-sm text-label-sm font-semibold">Rejected — Action Required</span>;
  return <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] font-label-sm text-label-sm">{status}</span>;
}

export function PropertyPreviewSection0() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rulesMap, setRulesMap] = useState<Record<number, { name: string; description: string | null }>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOwnerProperty(id)
      .then(setProperty)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getRules()
      .then((rs: Rule[]) => {
        const m: Record<number, { name: string; description: string | null }> = {};
        rs.forEach((r) => (m[r.id] = { name: r.name, description: r.description }));
        setRulesMap(m);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><span className="text-sm text-[#46B1B1]">Loading preview…</span></div>
        </div>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
        <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-error/20 text-center">
            <Icon name="error" className="material-symbols-outlined text-[32px] text-error mb-2" />
            <h2 className="font-title-md text-title-md font-bold text-[#46B1B1]">Failed to load preview</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error || "Property not found"}</p>
            <button onClick={() => router.push("/owner/properties")} className="mt-4 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm">Back to properties</button>
          </div>
        </div>
      </div>
    );
  }

  const primary = property.images.find((im) => im.is_primary) || property.images[0];
  const otherImages = property.images.slice(0, 5);

  return (
    <>
      <div className="">
        <main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
          <div className="flex flex-col w-full max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-primary-container text-on-primary shadow-md p-space-md mb-space-lg">
              <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-secondary-fixed opacity-10 pointer-events-none blur-2xl" />
              <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
                <div className="flex items-start md:items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-on-primary/15 backdrop-blur-md flex items-center justify-center shrink-0"><Icon name="visibility" className="material-symbols-outlined text-secondary-fixed text-[22px]" /></div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs flex-wrap"><span className="font-title-md text-title-md text-on-primary font-bold tracking-tight">OWNER PREVIEW MODE</span><StatusBadge status={property.status} /></div>
                    <p className="font-body-md text-body-md text-on-primary-container">Preview Mode — This is how your listing appears to guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0 flex-wrap">
                  <Link href={`/owner/properties/${property.id}/edit`} className="px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary/90 hover:text-white text-white border border-primary/10 transition-all font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm"><Icon name="edit" className="material-symbols-outlined text-[18px]" /> Edit Listing</Link>
                  <Link href={`/owner/availability?property=${property.id}`} className="px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary/90 hover:text-white text-white border border-primary/10 transition-all font-label-md text-label-md font-semibold flex items-center gap-1"><Icon name="calendar_month" className="material-symbols-outlined text-[18px]" /> Manage Availability</Link>
                  <Link href="/owner/properties" className="px-space-sm py-space-xs rounded-xl text-white/70 hover:text-white hover:bg-primary transition-all font-label-md text-label-md flex items-center gap-0.5"><Icon name="arrow_back" className="material-symbols-outlined text-[18px]" /> Properties</Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs mb-space-md">
              <div className="flex flex-col">
                <nav className="flex items-center gap-1 font-caption text-caption text-on-surface-variant mb-space-xxs"><span>Dashboard</span><Icon name="chevron_right" className="material-symbols-outlined text-[14px]" /><span>My Properties</span><Icon name="chevron_right" className="material-symbols-outlined text-[14px]" /><span className="text-[#46B1B1] font-semibold truncate max-w-[160px]">{property.title}</span><Icon name="chevron_right" className="material-symbols-outlined text-[14px]" /><span className="text-primary font-bold">Public Preview</span></nav>
                <div className="flex items-baseline gap-space-sm flex-wrap"><h1 className="font-headline-lg text-headline-lg text-[#46B1B1] font-bold">Owner Preview — {property.title}</h1><span className="text-on-surface-variant font-caption text-caption">Property #{property.id}</span></div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Review how your {property.status === "approved" ? "approved" : property.status} listing is presented to prospective clients.</p>
              </div>
              <div className="flex items-center gap-space-xs self-start md:self-auto">
                <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-high text-[#46B1B1] font-caption text-caption font-semibold"><span className="w-2 h-2 rounded-full bg-secondary" /> {property.status === "approved" ? "Instant Booking Enabled" : "Preview Only"}</span>
                <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption"><Icon name="lock" className="material-symbols-outlined text-[14px]" /> Read-Only View</span>
              </div>
            </div>

            {property.status === "rejected" && property.rejection_reason && (
              <div className="mb-space-md p-4 rounded-xl bg-[#FFF1F2] border border-[#E11D48]/20 flex items-start gap-3">
                <Icon name="error" className="material-symbols-outlined text-[#E11D48] text-[20px] mt-0.5" />
                <div><p className="font-label-md text-label-md font-semibold text-[#E11D48]">Rejection reason</p><p className="font-body-md text-body-md text-[#881337] mt-1">{property.rejection_reason}</p><Link href={`/owner/properties/${property.id}/edit`} className="inline-flex mt-2 px-3 py-1.5 rounded-lg bg-[#E11D48] text-white text-sm font-medium hover:bg-[#BE123C]">Fix and resubmit</Link></div>
              </div>
            )}
            {property.status === "pending" && (
              <div className="mb-space-md p-3 rounded-xl bg-[#FFFBEB] border border-[#D97706]/20 flex items-center gap-2 text-sm text-[#92400E]"><Icon name="hourglass_top" className="material-symbols-outlined text-[18px]" /> Awaiting StayLeb Admin verification before public listing. Updated {new Date(property.updated_at).toLocaleString()}.</div>
            )}

            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md md:p-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm pb-space-md">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs flex-wrap mb-1"><span className="px-space-xs py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-bold tracking-wide uppercase capitalize">{property.property_type.replace("_", " ")} · {property.status}</span><span className="px-space-xs py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium">{property.location}</span></div>
                  <h2 className="font-headline-md text-headline-md text-[#46B1B1] font-bold">{property.title}</h2>
                  <div className="flex items-center gap-space-sm mt-1 flex-wrap font-body-md text-body-md text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><Icon name="location_on" className="material-symbols-outlined text-primary text-[18px]" /> {property.location}{property.address ? ` · ${property.address}` : ""}</span>
                    <span>•</span>
                    <span className="text-primary font-medium">${Number(property.price_per_night).toFixed(2)} / night</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button disabled className="p-space-xs rounded-xl bg-surface-container-low text-[#46B1B1] font-label-md text-label-md flex items-center gap-1 opacity-60"><Icon name="share" className="material-symbols-outlined text-[18px]" /> Share</button>
                  <span className="px-3 py-1.5 rounded-xl bg-surface-container-high text-[#46B1B1] font-caption text-caption font-semibold">ID #{property.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-space-xs h-[360px] md:h-[460px] rounded-2xl overflow-hidden mb-space-lg">
                {otherImages.length > 0 ? (
                  <>
                    <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-surface-container">
                      <img src={otherImages[0].image_url} alt={property.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-3 left-3 px-space-xs py-1 rounded-md bg-surface-container-lowest/90 backdrop-blur-md font-caption text-caption text-[#46B1B1] font-semibold">Primary Cover {otherImages[0].is_primary ? "· Primary" : ""}</span>
                    </div>
                    {otherImages.slice(1, 4).map((img, idx) => (
                      <div key={idx} className="relative group overflow-hidden bg-surface-container"><img src={img.image_url} alt={`Property ${idx + 2}`} className="w-full h-full object-cover" /><span className="absolute bottom-2 left-2 px-space-xxs py-0.5 rounded bg-surface-container-lowest/80 text-[#46B1B1] font-caption text-caption">{img.is_primary ? "Primary" : `Photo ${idx + 2}`}</span></div>
                    ))}
                    <div className="relative group overflow-hidden bg-surface-container">
                      {otherImages[4] ? <img src={otherImages[4].image_url} alt="More" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant"><Icon name="photo_library" className="material-symbols-outlined text-[24px]" /></div>}
                      <span className="absolute bottom-3 right-3 px-space-sm py-1.5 rounded-xl bg-surface-container-lowest text-[#46B1B1] font-label-md text-label-md font-semibold shadow-md">View All {property.images.length} Photos</span>
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-4 md:row-span-2 flex items-center justify-center bg-surface-container text-on-surface-variant flex-col gap-2">
                    <Icon name="image" className="material-symbols-outlined text-[40px]" />
                    <span className="font-label-md text-label-md">No images uploaded yet</span>
                    <Link href={`/owner/properties/${property.id}/images`} className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm">Manage Images</Link>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-space-lg items-start">
                <div className="w-full flex flex-col gap-space-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-sm p-space-md bg-surface-container-low rounded-xl">
                    <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Bedrooms</span><span className="font-title-md text-title-md font-bold text-[#46B1B1]">{property.bedrooms} Rooms</span></div>
                    <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Beds</span><span className="font-title-md text-title-md font-bold text-[#46B1B1]">{property.beds} Beds</span></div>
                    <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Bathrooms</span><span className="font-title-md text-title-md font-bold text-[#46B1B1]">{property.bathrooms} Full</span></div>
                    <div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Capacity</span><span className="font-title-md text-title-md font-bold text-[#46B1B1]">{property.max_guests} Guests Max</span></div>
                    <div className="flex flex-col col-span-2 sm:col-span-1"><span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Minimum Stay</span><span className="font-title-md text-title-md text-primary font-bold">{property.min_nights} Nights</span></div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-[#46B1B1]">About this {property.property_type.replace("_", " ")}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{property.description}</p>
                  </div>

                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <div className="flex items-center justify-between"><h3 className="font-headline-sm text-headline-sm font-bold text-[#46B1B1]">Amenities & Features</h3><span className="font-caption text-caption text-white bg-primary px-2.5 py-0.5 rounded-full font-semibold border border-primary">{property.amenities.length} Verified Features</span></div>
                    {property.amenities.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
                        {property.amenities.map((a) => (
                          <div key={a.id} className="flex items-center gap-3 p-3 bg-white border border-primary/10 rounded-xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all"><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><Icon name="check_circle" className="material-symbols-outlined text-white text-[18px]" /></div><span className="font-label-md text-label-md font-semibold text-[#46B1B1]">{a.name}</span></div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body-sm text-body-sm text-[#46B1B1]/70">No amenities selected. <Link href={`/owner/properties/${property.id}/amenities`} className="text-[#46B1B1] hover:underline font-semibold">Configure amenities</Link></p>
                    )}
                  </div>

                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <h3 className="font-title-md text-title-md font-bold text-[#46B1B1]">House Rules & Policies</h3>
                    {property.property_rules.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                        {property.property_rules.map((pr) => {
                          const rule = rulesMap[pr.rule_id];
                          const title = rule?.name || `Rule #${pr.rule_id}`;
                          return (
                          <div key={pr.id} className="p-4 bg-white border border-primary/10 rounded-xl flex items-start gap-3 shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${pr.allowed ? "bg-[#059669] text-white" : "bg-[#E11D48] text-white"}`}><Icon name={pr.allowed ? "check_circle" : "block"} className="material-symbols-outlined text-[18px] text-white" /></div>
                            <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-[#46B1B1]">{title} · <span className={pr.allowed ? "text-[#059669]" : "text-[#E11D48]"}>{pr.allowed ? "Allowed" : "Not Allowed"}</span></span>{pr.value && <span className="font-caption text-caption font-medium text-[#46B1B1] bg-primary/5 px-2 py-0.5 rounded-full w-fit mt-1">{pr.value}</span>}</div>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <p className="font-body-sm text-body-sm text-[#46B1B1]/70">No rules configured.</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <h3 className="font-title-md text-title-md font-bold text-[#46B1B1]">Seasonal Pricing</h3>
                    {property.seasonal_prices.length ? (
                      <div className="flex flex-col gap-2">
                        {property.seasonal_prices.map((s) => (
                          <div key={s.id} className="p-space-sm bg-white border border-primary/10 rounded-xl flex items-center justify-between shadow-sm">
                            <div><p className="font-label-md text-label-md font-semibold text-[#46B1B1]">{s.season_name}</p><p className="font-caption text-caption text-[#46B1B1]/70">{s.start_date} → {s.end_date}</p></div>
                            <span className="font-title-sm text-title-sm font-bold text-[#46B1B1]">${Number(s.price_per_night).toFixed(2)}/night</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body-sm text-body-sm text-[#46B1B1]/70">No seasonal pricing. Base price ${Number(property.price_per_night).toFixed(2)}/night applies year-round. <Link href={`/owner/properties/${property.id}/pricing`} className="text-[#46B1B1] hover:underline font-semibold">Manage pricing</Link></p>
                    )}
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
