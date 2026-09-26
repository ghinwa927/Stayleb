"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { DataTable } from "@/components/ui/Interactions";
import { getMyProperties, type PropertyResponse } from "@/services/owner";
import { getOwnerDashboardStats, type OwnerDashboardStats } from "@/services/ownerDashboard";

function formatMoney(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatRating(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return n.toFixed(2);
}

export function OwnerDashboardSection0() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  async function loadStats() {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getOwnerDashboardStats();
      setStats(data);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : "Failed to load dashboard statistics");
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadProperties() {
    setPropertiesLoading(true);
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await getOwnerDashboardStats();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setStatsError(e instanceof Error ? e.message : "Failed to load dashboard statistics");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPropertiesLoading(true);
      try {
        const data = await getMyProperties();
        if (!cancelled) setProperties(data);
      } catch {
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setPropertiesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasStats = !!stats;
  const hasReviews = hasStats && stats.total_reviews > 0;

  return <>
<div className={""}><main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}><div className={"flex flex-col w-full"}>
<div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl"}>
<div className={"flex flex-col gap-space-xxs"}>
<div className={"flex items-center gap-space-xs text-[#46B1B1] font-label-sm text-label-sm"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"}></span>{"\n          Live Sync Active\n        "}</span>
<span>{"\u2022"}</span>
<span>{"Lebanon Standard Time (UTC+03:00)"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight mt-1"}>{"Owner Dashboard"}</h1>
<p className={"font-body-md text-body-md text-[#46B1B1]"}>{"Overview of your listed chalets, approval statuses, and upcoming reservations across Lebanon."}</p>
</div>
  <div className={"flex items-center gap-space-xs shrink-0 relative"}>
<Link className={"inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"} data-path={"availability"} href={"/owner/availability"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-white" />
<span>{"Availability Matrix"}</span>
</Link>
<Link className={"inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"} data-path={"properties-new"} href={"/owner/properties/new"}>
<Icon name="add_circle" className="material-symbols-outlined text-[18px] text-white" />
<span>{"+ Add Property"}</span>
</Link>
</div>
</div>

{statsError ? (
  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-rose-200 flex items-center justify-between gap-space-md mb-space-xl">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600"><Icon name="error" className="material-symbols-outlined text-[20px]" /></div>
      <div>
        <p className="font-label-md text-label-md font-semibold text-rose-600">Unable to load dashboard statistics</p>
        <p className="font-body-md text-body-md text-[#46B1B1]/70">{statsError}</p>
      </div>
    </div>
    <button onClick={() => loadStats()} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-label-sm text-label-sm shadow-sm shrink-0">Retry</button>
  </div>
) : null}

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl"}>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Total Properties"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="domain" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{statsLoading ? "…" : String(stats?.total_properties ?? 0)}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"All listings in portfolio"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>Live</span>
<span>{stats ? `${stats.approved_properties} approved · ${stats.pending_properties} pending` : "All properties"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Pending Properties"}</span>
<span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span>{"\n          Action Required\n        "}</span>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-tertiary"}>{statsLoading ? "…" : `${stats?.pending_properties ?? 0} Pending`}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"Awaiting admin review & verification"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>{stats ? `${stats.total_properties} total` : "—"}</span>
<span>Total properties</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Approved Properties"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="villa" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{statsLoading ? "…" : `${stats?.approved_properties ?? 0} Live`}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"Active marketplace listings"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>Live</span>
<span>{stats ? `Rejected: ${stats.rejected_properties}` : ""}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Outstanding Commission"}</span>
<div className={"w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed"}>
<Icon name="receipt" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{statsLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : statsError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{formatMoney(stats?.outstanding_cash_commission ?? "0.00")}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" USD"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
{statsLoading ? (
  <span>Loading…</span>
) : statsError ? (
  <span className="text-rose-600 text-xs">{statsError}</span>
) : (
  <>
    <span className={"font-semibold text-tertiary"}>{stats?.total_bookings ?? 0}</span>{" total bookings"}
  </>
)}
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-tertiary font-medium"}>{"Cash On Arrival"}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Total Bookings"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary"}>
<Icon name="receipt_long" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{statsLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : statsError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{stats?.total_bookings ?? 0}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" bookings"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{stats ? `${stats.upcoming_bookings} upcoming` : "All-time bookings"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>{stats ? `Upcoming: ${stats.upcoming_bookings}` : "Global"}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Upcoming Bookings"}</span>
<div className={"w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container"}>
<Icon name="event_upcoming" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{statsLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : statsError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-primary"}>{stats?.upcoming_bookings ?? 0}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" stays"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
{stats && stats.pending_cash_requests > 0 ? (
  <><span className="font-semibold text-amber-600">{stats.pending_cash_requests}</span>{" pending cash requests"}</>
) : (
  <span>{"No pending cash requests"}</span>
)}
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-secondary font-medium"}>{statsError ? "Unavailable" : `${stats?.pending_cash_requests ?? 0} cash pending`}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Owner Earnings"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="payments" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{statsLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : statsError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{formatMoney(stats?.owner_earnings)}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" USD"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"Net earnings after commission"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>{statsError ? "Unavailable" : `Revenue: ${formatMoney(stats?.total_revenue ?? "0.00")}`}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Portfolio Rating"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="star" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{statsLoading ? (
  <div className="flex items-center gap-2 py-2">
    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <span className="text-sm text-[#46B1B1]/70">Loading…</span>
  </div>
) : statsError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (stats?.total_reviews ?? 0) === 0 ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]/60"}>0<span className="text-sm font-normal text-[#46B1B1]/70"> reviews</span></div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{formatRating(stats?.portfolio_rating ?? 0)}<span className="text-sm font-normal text-[#46B1B1]/70"> / 5.0</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
{statsLoading ? (
  <span className="text-[#46B1B1]/60">Loading…</span>
) : statsError ? (
  <span className="text-rose-600 text-xs">{statsError}</span>
) : (stats?.total_reviews ?? 0) === 0 ? (
  <span className="text-[#46B1B1]/60">No reviews yet</span>
) : (
  <>
    <span className={"inline-flex items-center gap-1 font-semibold text-primary"}>
      <Icon name="star" className="material-symbols-outlined text-[14px] text-amber-500" /> {stats?.total_reviews ?? 0} reviews
    </span>
    <span className="text-xs text-[#46B1B1]/70">verified</span>
  </>
)}
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-secondary font-medium"}>{stats ? `${stats.total_reviews} total` : "Unavailable"}</span>
<span>{"Live data"}</span>
</div>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl"}>
<section className={"lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
<div className={"p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-2.5 h-2.5 rounded-full bg-primary animate-pulse"}></div>
<div>
<h2 className={"font-title-md text-title-md text-[#46B1B1] tracking-tight"}>{"My Properties Overview"}</h2>
<p className={"font-caption text-caption text-[#46B1B1]"}>{"Manage rates, seasonal availability calendars, and listing statuses."}</p>
</div>
</div>
<Link className={"inline-flex items-center gap-1 text-[#46B1B1] font-label-sm text-label-sm hover:underline font-semibold"} data-path={"properties"} href={"/owner/properties"}>
<span>{`View All (${stats?.total_properties ?? properties.length})`}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[16px]" />
</Link>
</div>
<div className={"overflow-x-auto"}>
{propertiesLoading ? (
  <div className="p-8 flex flex-col items-center gap-3">
    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-[#46B1B1]">Loading properties…</p>
  </div>
) : properties.length === 0 ? (
  <div className="p-8 text-center">
    <Icon name="cottage" className="material-symbols-outlined text-[#46B1B1]/50 text-[36px] mb-2" />
    <p className="text-sm font-semibold text-[#46B1B1]">No properties yet</p>
    <p className="text-xs text-[#46B1B1]/70 mt-1">List your first property to see it here.</p>
    <Link href="/owner/properties/new" className="inline-flex mt-3 items-center gap-1 px-space-md py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 shadow-sm transition-all">
      <Icon name="add_circle" className="material-symbols-outlined text-[16px]" /> Add Property
    </Link>
  </div>
) : (
<DataTable className={"w-full text-left"}>
<thead className={"bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider"}>
<tr>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Property & Location"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Specs"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Base Rate"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Status"}</th>
<th className={"py-3 px-space-md text-right text-[#46B1B1]"}>{"Actions"}</th>
</tr>
</thead>
<tbody className={"divide-y divide-transparent font-body-md text-body-md text-[#46B1B1]"}>
{properties.slice(0, 3).map((p: any) => (
<RecordRow key={p.id} className={"hover:bg-surface-container transition-colors group"} initialStatus={p.status}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-high shadow-xs"}>
<LocalImage className={"w-full h-full object-cover"} src={p.images?.[0]?.image_url || "/images/52db83fea695d506.jpg"} alt={p.title} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#46B1B1] truncate group-hover:text-primary transition-colors"}>{p.title}</span>
<span className={"font-caption text-caption text-[#46B1B1] flex items-center gap-1"}>
<Icon name="location_on" className="material-symbols-outlined text-[13px] text-outline" /> {p.location} • {p.property_type?.replace("_", " ")}
</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-caption text-caption text-[#46B1B1]"}>{p.bedrooms}BR · {p.beds} beds · {p.max_guests} guests</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<div className={"font-semibold text-primary font-label-md text-label-md"}>${Number(p.price_per_night).toFixed(0)} <span className={"font-normal text-caption text-[#46B1B1]"}>{"/ night"}</span></div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
{p.status === "approved" ? (
  <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-caption text-caption font-semibold"}>
    <span className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}></span> Approved / Live
  </span>
) : p.status === "pending" ? (
  <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>
    <span className={"w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"}></span> Pending Review
  </span>
) : (
  <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-caption text-caption font-semibold"}>
    <span className={"w-1.5 h-1.5 rounded-full bg-rose-500"}></span> Rejected
  </span>
)}
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<div className="flex items-center justify-end gap-1">
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors"} href={`/owner/properties/${p.id}/edit`}>
  <Icon name="edit" className="material-symbols-outlined text-[14px]" />
</Link>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors"} href={`/owner/availability?property=${p.id}`}>
  <Icon name="event_upcoming" className="material-symbols-outlined text-[14px]" />
</Link>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 shadow-xs transition-colors"} href={`/owner/properties/${p.id}/preview`}>
  <span>Preview</span>
  <Icon name="arrow_forward" className="material-symbols-outlined text-[14px] text-white" />
</Link>
</div>
</td>
</RecordRow>
))}
</tbody>
</DataTable>
)}
</div>
<div className={"p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm mt-auto"}>
<div className={"flex items-center gap-2 text-[#46B1B1] font-caption text-caption"}>
<Icon name="verified" className="material-symbols-outlined text-[18px] text-primary" />
<span>{"Ministry of Tourism verification applies to all approved Lebanese listings."}</span>
</div>
{properties.length > 3 && (
  <Link href="/owner/properties" className="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 shadow-sm transition-all">
    <span>{`View All ${stats?.total_properties ?? properties.length} Properties`}</span>
    <Icon name="arrow_forward" className="material-symbols-outlined text-[14px] text-white" />
  </Link>
)}
</div>
</section>
<section className={"lg:col-span-4 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-md justify-between"}>
{(() => {
  const total = stats?.total_properties ?? 0;
  const approved = stats?.approved_properties ?? 0;
  const pending = stats?.pending_properties ?? 0;
  const rejected = stats?.rejected_properties ?? 0;
  const approvedPct = total > 0 ? (approved / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const rejectedPct = total > 0 ? (rejected / total) * 100 : 0;
  return (
    <>
      <div>
        <div className={"flex items-center justify-between mb-space-sm"}>
          <div className={"flex items-center gap-space-xs"}>
            <Icon name="donut_large" className="material-symbols-outlined text-primary text-[20px]" />
            <h3 className={"font-title-md text-title-md text-[#46B1B1]"}>{"Property Status"}</h3>
          </div>
          <span className={"font-caption text-caption uppercase px-2 py-0.5 bg-surface-container rounded font-semibold text-outline"}>{statsLoading ? "…" : `${total} total`}</span>
        </div>
        <p className={"font-body-md text-body-md text-[#46B1B1] mb-space-md"}>{"Distribution of listings by current admin review status."}</p>
        {statsLoading ? (
          <div className="p-6 text-center text-sm text-[#46B1B1]">Loading…</div>
        ) : statsError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">Unavailable — {statsError}</div>
        ) : total === 0 ? (
          <div className="p-6 text-center text-sm text-[#46B1B1]/60">No properties listed yet.</div>
        ) : (
          <>
            <div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
              <div className={"flex items-center justify-between mb-space-xs"}>
                <span className={"font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5"}>
                  <span className={"w-2.5 h-2.5 rounded-full bg-emerald-500"}></span>{" Approved"}
                </span>
                <span className={"font-label-sm text-label-sm text-emerald-600 font-bold"}>{approvedPct.toFixed(1)}%</span>
              </div>
              <div className={"font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1"}>{approved}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" listings"}</span></div>
              <p className={"font-caption text-caption text-[#46B1B1]"}>{"Live in marketplace"}</p>
            </div>
            <div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
              <div className={"flex items-center justify-between mb-space-xs"}>
                <span className={"font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5"}>
                  <span className={"w-2.5 h-2.5 rounded-full bg-tertiary"}></span>{" Pending"}
                </span>
                <span className={"font-label-sm text-label-sm text-tertiary font-bold"}>{pendingPct.toFixed(1)}%</span>
              </div>
              <div className={"font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1"}>{pending}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" listings"}</span></div>
              <p className={"font-caption text-caption text-[#46B1B1]"}>{"Awaiting admin review"}</p>
            </div>
            <div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
              <div className={"flex items-center justify-between mb-space-xs"}>
                <span className={"font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5"}>
                  <span className={"w-2.5 h-2.5 rounded-full bg-rose-500"}></span>{" Rejected"}
                </span>
                <span className={"font-label-sm text-label-sm text-rose-600 font-bold"}>{rejectedPct.toFixed(1)}%</span>
              </div>
              <div className={"font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1"}>{rejected}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" listings"}</span></div>
              <p className={"font-caption text-caption text-[#46B1B1]"}>{"Edit & resubmit"}</p>
            </div>
            <div className={"w-full bg-surface-container h-3 rounded-full overflow-hidden flex shadow-inner mb-space-sm"}>
              <div className={"bg-emerald-500 h-full transition-all"} style={{"width": `${approvedPct}%`}}></div>
              <div className={"bg-tertiary h-full transition-all"} style={{"width": `${pendingPct}%`}}></div>
              <div className={"bg-rose-500 h-full transition-all"} style={{"width": `${rejectedPct}%`}}></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#46B1B1]/70 mt-1"><span>Total: {total}</span><span>Portfolio</span></div>
          </>
        )}
      </div>
      <div className={"pt-space-sm flex items-center justify-between text-caption font-caption text-outline"}>
        <span>{stats ? `Total: ${stats.total_properties} listings` : "Total: Unavailable"}</span>
        <span className={"font-semibold text-primary"}>{"Live data"}</span>
      </div>
    </>
  );
})()}
</section>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-2 gap-space-md mb-space-xl"}>
<section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between mb-space-sm">
<div className="flex items-center gap-space-xs">
<Icon name="request_quote" className="material-symbols-outlined text-amber-500 text-[20px]" />
<h3 className="font-title-md text-title-md text-[#46B1B1]">Cash Requests</h3>
</div>
<Link href="/owner/bookings" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors font-semibold">
  View All <Icon name="arrow_forward" className="material-symbols-outlined text-[14px]" />
</Link>
</div>
{statsLoading ? (
  <div className="mt-2 h-6 w-32 bg-surface-container rounded animate-pulse" />
) : hasStats ? (
  stats.pending_cash_requests > 0 ? (
    <div className="mt-space-sm">
      <div className="p-space-md rounded-xl bg-surface-container-low mb-space-sm">
        <div className="flex items-center justify-between mb-space-xs">
          <span className="font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> Pending Review
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-amber-600">{stats.pending_cash_requests}</span>
        </div>
        <p className="font-caption text-caption text-[#46B1B1]">{stats.pending_cash_requests === 1 ? "request" : "requests"} waiting for admin review</p>
      </div>
      <Link href="/owner/bookings" className="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 shadow-sm transition-all">
        <Icon name="receipt_long" className="material-symbols-outlined text-[16px]" /> View Cash Requests
      </Link>
    </div>
  ) : (
    <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-low text-center">
      <Icon name="check_circle" className="material-symbols-outlined text-emerald-500 text-[28px] mb-1" />
      <p className="font-body-md text-body-md text-[#46B1B1] font-semibold">No pending cash requests</p>
      <p className="font-caption text-caption text-[#46B1B1]/70 mt-1">All cash payments are settled.</p>
    </div>
  )
) : (
  <p className="font-body-md text-body-md text-[#46B1B1]/60 mt-2">—</p>
)}
</section>

<section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between mb-space-sm">
<div className="flex items-center gap-space-xs">
<Icon name="account_balance_wallet" className="material-symbols-outlined text-tertiary text-[20px]" />
<h3 className="font-title-md text-title-md text-[#46B1B1]">Outstanding StayLeb Commission</h3>
</div>
<Link href="/owner/earnings" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors font-semibold">
  Earnings <Icon name="arrow_forward" className="material-symbols-outlined text-[14px]" />
</Link>
</div>
{statsLoading ? (
  <div className="mt-2 h-6 w-24 bg-surface-container rounded animate-pulse" />
) : hasStats ? (
  Number(stats.outstanding_cash_commission) > 0 ? (
    <div className="mt-space-sm">
      <div className="p-space-md rounded-xl bg-tertiary-fixed/50 border border-tertiary/20 mb-space-sm">
        <p className="font-caption text-caption text-on-tertiary-fixed mb-space-xs font-semibold uppercase tracking-wider">Commission Owed</p>
        <p className="font-headline-md text-headline-md font-bold text-on-tertiary-fixed">{formatMoney(stats.outstanding_cash_commission)}<span className="text-label-sm font-normal text-on-tertiary-fixed/80"> USD</span></p>
      </div>
      <Link href="/owner/earnings" className="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 shadow-sm transition-all">
        <Icon name="payments" className="material-symbols-outlined text-[16px]" /> View Earnings & Commission
      </Link>
    </div>
  ) : (
    <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-low text-center">
      <Icon name="check_circle" className="material-symbols-outlined text-emerald-500 text-[28px] mb-1" />
      <p className="font-body-md text-body-md text-[#46B1B1] font-semibold">No outstanding commission</p>
      <p className="font-caption text-caption text-[#46B1B1]/70 mt-1">All platform commissions are settled.</p>
    </div>
  )
) : (
  <p className="font-body-md text-body-md text-[#46B1B1]/60 mt-2">—</p>
)}
</section>
</div>

<section className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl">
<div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright">
<div>
<div className="flex items-center gap-space-xs">
<Icon name="reviews" className="material-symbols-outlined text-amber-500 text-[20px]" />
<h2 className="font-title-md text-title-md text-[#46B1B1] tracking-tight">Recent Reviews</h2>
</div>
{statsLoading ? (
  <p className="font-caption text-caption text-[#46B1B1] flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading review stats…</p>
) : hasStats && hasReviews ? (
  <p className="font-caption text-caption text-[#46B1B1]">
    Portfolio rating <strong className="text-[#46B1B1]">{formatRating(stats.portfolio_rating)} / 5.0</strong> from {stats.total_reviews} {stats.total_reviews === 1 ? "review" : "reviews"}
  </p>
) : (
  <p className="font-caption text-caption text-[#46B1B1]">No verified reviews yet</p>
)}
</div>
<Link href="/owner/reviews" className="inline-flex items-center gap-space-xxs px-space-md py-2 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-md text-label-md hover:bg-surface-container-highest transition-colors font-semibold">
<Icon name="rate_review" className="material-symbols-outlined text-[18px]" />
<span>All Reviews</span>
</Link>
</div>
<div className="p-space-md">
{hasStats && hasReviews ? (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col items-center text-center">
      <div className="flex items-center gap-1 mb-space-xs">
        <Icon name="star" className="material-symbols-outlined text-[18px] text-amber-500 fill-amber-500" />
        <span className="font-headline-md text-headline-md font-bold text-[#46B1B1]">{formatRating(stats.portfolio_rating)}</span>
      </div>
      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Overall Rating</span>
      <span className="font-caption text-caption text-[#46B1B1]/70 mt-1">/ 5.0 maximum</span>
    </div>
    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col items-center text-center">
      <div className="font-headline-md text-headline-md font-bold text-[#46B1B1] mb-space-xs">{stats.total_reviews}</div>
      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Total Reviews</span>
      <span className="font-caption text-caption text-[#46B1B1]/70 mt-1">verified guest stays</span>
    </div>
    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col items-center text-center">
      <div className="flex mb-space-xs">
        {[1,2,3,4,5].map((s) => (
          <Icon key={s} name="star" className={`material-symbols-outlined text-[20px] ${s <= Math.round(Number(stats.portfolio_rating)) ? "text-amber-500 fill-amber-500" : "text-[#46B1B1]/20"}`} />
        ))}
      </div>
      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Star Breakdown</span>
      <span className="font-caption text-caption text-[#46B1B1]/70 mt-1">rounded distribution</span>
    </div>
  </div>
) : (
  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
    {statsLoading ? (
      <p className="font-body-md text-body-md text-[#46B1B1]/70">Loading…</p>
    ) : (
      <div className="text-center py-4">
        <Icon name="rate_review" className="material-symbols-outlined text-[#46B1B1]/40 text-[36px] mb-2" />
        <p className="font-body-md text-body-md text-[#46B1B1]/70 italic">No verified reviews yet. Reviews from completed stays will appear here once guests submit their evaluation.</p>
      </div>
    )}
  </div>
)}
</div>
<div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs text-caption font-caption text-[#46B1B1]">
  <Icon name="info" className="material-symbols-outlined text-[16px] text-primary" />
  <span>Reviews are collected post-checkout and verified against completed booking records.</span>
</div>
<Link href="/owner/reviews" className="px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 transition-colors font-semibold shadow-sm">
  Open Reviews Dashboard
</Link>
</div>
</section>

</div></main></div>
</>; }
