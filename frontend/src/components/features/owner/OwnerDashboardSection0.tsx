"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getMyProperties, type PropertyResponse } from "@/services/owner";

export function OwnerDashboardSection0() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProperties()
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const total = properties.length;
  const approved = properties.filter((p) => p.status === "approved").length;
  const pending = properties.filter((p) => p.status === "pending").length;
  const rejected = properties.filter((p) => p.status === "rejected").length;

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-lg text-headline-lg text-[#157375]">Owner Dashboard</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed font-caption text-caption px-space-xs py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Host ID #7048
                  </span>
                </div>
                <p className="font-body-md text-body-md text-[#157375]/70">Overview of your listed chalets, approval statuses, and upcoming reservations across Lebanon.</p>
              </div>
              <div className="flex items-center gap-space-sm self-start md:self-auto">
                <Link href="/owner/availability" className="flex items-center gap-space-xxs px-space-md py-2.5 bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md rounded-xl shadow-sm transition-all">
                  <Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-white" /> Availability Matrix
                </Link>
                <Link href="/owner/properties/new" className="flex items-center gap-space-xxs px-space-md py-2.5 bg-[#157375] hover:bg-[#0f4a4c] text-white font-label-md text-label-md rounded-xl shadow-sm transition-all">
                  <Icon name="add_circle" className="material-symbols-outlined text-[18px] text-white" /> + Add Property
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 border border-[#157375]/5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-[#157375]/60 uppercase tracking-wider">Total Properties</span>
                  <div className="w-8 h-8 rounded-lg bg-[#157375]/10 flex items-center justify-center text-[#157375]"><Icon name="domain" className="material-symbols-outlined text-[18px]" /></div>
                </div>
                <div className="my-space-xs">
                  <span className="font-display text-display text-[#157375] leading-none">{loading ? "—" : total}</span>
                  {!loading && <span className="font-caption text-caption text-[#157375]/60 ml-2">properties</span>}
                </div>
                <div className="flex items-center gap-1.5 font-caption text-caption text-[#157375]/70">
                  {loading ? (
                    <span className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                  ) : (
                    <>
                      <span className="font-semibold text-[#059669]">{approved} Approved</span>
                      <span>•</span>
                      <span className="font-semibold text-[#D97706]">{pending} Pending</span>
                      {rejected > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#E11D48]">{rejected} Rejected</span>
                        </>
                      )}
                    </>
                  )}
                </div>

              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 border border-[#157375]/5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-[#157375]/60 uppercase tracking-wider">Active Status</span>
                  <div className="w-8 h-8 rounded-lg bg-[#46B1B1]/10 flex items-center justify-center text-[#157375]"><Icon name="verified" className="material-symbols-outlined text-[18px]" /></div>
                </div>
                <div className="my-space-xs flex items-center gap-space-sm">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-[#157375] leading-none">{loading ? "—" : approved}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-caption text-caption border border-[#059669]/10">Live</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-[#D1A695] leading-none">{loading ? "—" : pending}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] font-caption text-caption border border-[#D97706]/10">Review</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-caption text-caption text-[#157375]/60">
                  <span className="w-2 h-2 rounded-full bg-[#46B1B1]" /> {rejected} Rejected or Delisted
                </div>

              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden opacity-60 border border-[#157375]/5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-[#157375]/60 uppercase tracking-wider">Pending Cash Booking</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption bg-[#F1F5F9] text-[#475569] border border-[#475569]/10">Not connected</span>
                </div>
                <div className="my-space-xs flex items-baseline gap-space-xs">
                  <span className="font-headline-lg text-headline-lg text-[#475569] leading-none">—</span>
                  <span className="font-label-md text-label-md text-[#157375]/60">Requires booking backend</span>
                </div>
                <span className="flex items-center justify-between font-label-sm text-label-sm text-[#157375]/40 pointer-events-none">
                  <span>Review Request</span>
                  <Icon name="arrow_forward" className="material-symbols-outlined text-[16px]" />
                </span>

              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between opacity-60 border border-[#157375]/5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-[#157375]/60 uppercase tracking-wider">Upcoming Bookings</span>
                  <div className="w-8 h-8 rounded-lg bg-[#157375]/10 flex items-center justify-center text-[#157375]"><Icon name="luggage" className="material-symbols-outlined text-[18px]" /></div>
                </div>
                <div className="my-space-xs"><span className="font-display text-display text-[#157375] leading-none">—</span></div>
                <div className="flex items-center gap-1.5 font-caption text-caption text-[#157375]/60 truncate">
                  <Icon name="event" className="material-symbols-outlined text-[14px] text-[#157375]" />
                  <span>Booking calendar integration — later</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-[#157375]/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-[#D1A695]/20 flex items-center justify-center shrink-0 text-[#157375]"><Icon name="payments" className="material-symbols-outlined text-[26px]" /></div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-title-md text-title-md text-[#157375]">Owner financial features — coming soon</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] font-caption text-caption font-semibold border border-[#475569]/10">Not connected</span>
                    </div>
                    <p className="font-body-md text-body-md text-[#157375]/70">Pending cash bookings, revenue, commission, and settlement reports will be connected after booking/payment backend work is complete. Current dashboard preserves design for later integration.</p>
                  </div>
                </div>
                <Link href="/owner/properties" className="px-space-md py-2.5 bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md rounded-xl transition-all shadow-sm flex items-center gap-space-xxs shrink-0">
                  <span>Manage Properties</span>
                  <Icon name="arrow_forward" className="material-symbols-outlined text-[16px] text-white" />
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-[#157375]/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-[#157375]">My Properties Overview</h2>
                  <p className="font-body-md text-body-md text-[#157375]/70">Manage rates, seasonal availability calendars, and listing statuses. <span className="font-caption text-caption text-[#059669]">Real data from backend.</span></p>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-caption text-caption text-[#157375]/60">Filtered by: All ({loading ? "…" : total})</span>
                  <Link href="/owner/properties" className="px-3 py-1.5 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white font-label-sm text-label-sm font-semibold shadow-sm transition-colors">View all</Link>
                </div>
              </div>

              <div className="flex flex-col gap-space-md">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-space-md rounded-xl bg-surface-container-low animate-pulse h-28" />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-[#157375]/20">
                    <Icon name="cottage" className="material-symbols-outlined text-[32px] text-[#157375] mb-2" />
                    <p className="font-title-sm text-title-sm font-semibold text-[#157375]">No properties yet</p>
                    <p className="font-body-sm text-body-sm text-[#157375]/70 mt-1">List your first property to see it here.</p>
                    <Link href="/owner/properties/new" className="inline-flex mt-3 px-4 py-2 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white text-sm font-medium shadow-sm">Add Property</Link>
                  </div>
                ) : (
                  properties.slice(0, 3).map((prop) => (
                    <div key={prop.id} className="p-space-md rounded-xl bg-white border border-[#157375]/10 hover:border-[#157375]/20 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                      <div className="flex items-center gap-space-md">
                        <div className="w-24 h-20 rounded-lg object-cover shadow-sm shrink-0 overflow-hidden bg-surface-container flex items-center justify-center border border-[#157375]/5">
                          {prop.images[0] ? <img src={prop.images[0].image_url} alt={prop.title} className="w-full h-full object-cover" /> : <Icon name="image" className="material-symbols-outlined text-[24px] text-[#157375]/40" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex flex-wrap items-center gap-space-xs">
                            <span className="font-title-md text-title-md text-[#157375] font-semibold truncate max-w-[220px]">{prop.title}</span>
                            <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-medium flex items-center gap-1 ${prop.status === "approved" ? "bg-[#ECFDF5] text-[#059669] border border-[#059669]/10" : prop.status === "pending" ? "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/10" : "bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${prop.status === "approved" ? "bg-[#059669]" : prop.status === "pending" ? "bg-[#D97706] animate-pulse" : "bg-[#E11D48]"}`} />
                              {prop.status === "approved" ? "Approved / Live" : prop.status === "pending" ? "Pending Review" : "Rejected"}
                            </span>
                          </div>
                          <span className="font-body-md text-body-md text-[#157375]/70 truncate">{prop.property_type.replace("_", " ")} · {prop.location}</span>
                          <div className="flex items-center gap-space-md mt-1 font-caption text-caption text-[#157375]/70">
                            <span className="font-bold text-[#157375] text-body-md">${Number(prop.price_per_night).toFixed(0)}<span className="font-normal text-caption text-[#157375]/60"> / night</span></span>
                            <span>•</span>
                            <span className="text-[#157375]/70">{prop.bedrooms}BR · {prop.beds} beds · {prop.max_guests} guests</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-xs self-end lg:self-center">
                        <Link href={`/owner/properties/${prop.id}/edit`} className="px-space-sm py-2 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"><Icon name="edit" className="material-symbols-outlined text-[16px] text-white" /> Edit</Link>
                        <Link href={`/owner/availability?property=${prop.id}`} className="px-space-sm py-2 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"><Icon name="event_upcoming" className="material-symbols-outlined text-[16px] text-white" /> Availability</Link>
                        <Link href={`/owner/properties/${prop.id}/preview`} className="px-space-sm py-2 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"><Icon name="visibility" className="material-symbols-outlined text-[16px] text-white" /> Preview</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {properties.length > 3 && (
                <div className="text-center">
                  <Link href="/owner/properties" className="inline-flex items-center gap-1 text-sm font-medium text-[#157375] hover:text-[#0f4a4c] hover:underline">View all {total} properties <Icon name="arrow_forward" className="material-symbols-outlined text-[16px]" /></Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
              <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md opacity-60 border border-[#157375]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-[#157375]">Recent Reviews</h2>
                    <p className="font-body-md text-body-md text-[#157375]/70">Verified traveler feedback — will be connected after review backend.</p>
                  </div>
                  <Link href="/owner/reviews" className="font-label-md text-label-md text-[#157375] flex items-center gap-0.5 hover:text-[#0f4a4c]">All Reviews <Icon name="chevron_right" className="material-symbols-outlined text-[16px]" /></Link>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-[#157375]/5">
                  <p className="font-body-md text-body-md text-[#157375]/70 italic">Review moderation and guest feedback will appear here once the review endpoints are connected. Design preserved for later integration.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md border border-[#157375]/5">
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-xs"><Icon name="info" className="material-symbols-outlined text-[20px] text-[#157375]" /><h3 className="font-title-md text-title-md text-[#157375]">Host Operational Notes</h3></div>
                  <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-[#157375]/5">
                    <span className="font-label-sm text-label-sm font-bold text-[#157375]">Electric Utility & Generator Guarantee</span>
                    <p className="font-body-md text-body-md text-[#157375]/70">Faraya Chalet winter power plan is active (24/7 solar + automatic generator back-up).</p>
                  </div>
                  <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-[#157375]/5">
                    <span className="font-label-sm text-label-sm font-bold text-[#157375]">Cash Payout Protocol</span>
                    <p className="font-body-md text-body-md text-[#157375]/70">For cash bookings, platform fees (10%) are automatically reconciled against your monthly ledger.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs pt-space-sm">
                  <span className="font-caption text-caption uppercase text-[#157375]/60 tracking-wider font-semibold">Quick Shortcuts</span>
                  <Link href="/owner/availability" className="flex items-center justify-between p-space-sm rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] transition-colors group">
                    <div className="flex items-center gap-space-xs"><Icon name="edit_calendar" className="material-symbols-outlined text-[18px] text-white" /><span className="font-label-md text-label-md font-semibold">Update Calendar Blocks</span></div>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[16px] text-white" />
                  </Link>
                  <Link href="/owner/properties" className="flex items-center justify-between p-space-sm rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] transition-colors group">
                    <div className="flex items-center gap-space-xs"><Icon name="cottage" className="material-symbols-outlined text-[18px] text-white" /><span className="font-label-md text-label-md font-semibold">My Properties</span></div>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[16px] text-white" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
