"use client";
import { useEffect, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable } from "@/components/ui/Interactions";
import { apiFetch } from "@/services/api";
import { getAdminDashboardStats, type AdminDashboardStats } from "@/services/adminDashboard";
import { getAdminSettlements, type AdminSettlement } from "@/services/adminSettlements";
import { getAdminProperties } from "@/services/adminProperties";

function formatMoney(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function AdminDashboardSection0() {
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [pendingQueueLoading, setPendingQueueLoading] = useState(true);
  const [exportMetricsOpen, setExportMetricsOpen] = useState(false);
  const [exportingMetrics, setExportingMetrics] = useState(false);
  const [outstanding, setOutstanding] = useState<AdminSettlement[]>([]);
  const [outstandingLoading, setOutstandingLoading] = useState(true);
  const [outstandingError, setOutstandingError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const data = await getAdminDashboardStats();
        if (!cancelled) setDashboardStats(data);
      } catch (e) {
        if (!cancelled) setDashboardError(e instanceof Error ? e.message : "Failed to load dashboard statistics");
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    }
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function loadQueue() {
      setPendingQueueLoading(true);
      try {
        const res = await getAdminProperties({ status: "pending", page: 1, page_size: 3 });
        if (!cancelled) setPendingQueue(res.items);
      } catch {
        if (!cancelled) setPendingQueue([]);
      } finally {
        if (!cancelled) setPendingQueueLoading(false);
      }
    }
    loadQueue();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function loadOutstanding() {
      setOutstandingLoading(true);
      setOutstandingError(null);
      try {
        const list = await getAdminSettlements({ status: "unpaid", page: 1, page_size: 3 });
        if (!cancelled) setOutstanding(list.items);
      } catch (e) {
        if (!cancelled) setOutstandingError(e instanceof Error ? e.message : "Failed to load outstanding settlements");
      } finally {
        if (!cancelled) setOutstandingLoading(false);
      }
    }
    loadOutstanding();
    return () => {
      cancelled = true;
    };
  }, []);

  function doDownload(blob: Blob, fileName: string) {
    if (exportingMetrics) return;
    setExportingMetrics(true);
    setExportMetricsOpen(false);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportingMetrics(false);
    }, 500);
  }
  function exportMetricsExcel() {
    const now = new Date();
    const fileName = `StayLeb_Metrics_${now.toISOString().slice(0, 10)}.xls`;
    if (!dashboardStats) return;
    const ds = dashboardStats;
    const html = `<html><head><meta charset="UTF-8"><style>body{font-family:Calibri;color:#111c2d} th{background:#0f3d3e;color:white;padding:10px} td{padding:8px;border:1px solid #bec9c8} tr:nth-child(even) td{background:#f9f9ff}</style></head><body><h2 style="color:#46B1B1;">StayLeb — Admin Metrics</h2><p>Generated ${now.toLocaleString()} | Users: ${ds.users.total} | Pending: ${ds.properties.pending} | Approved: ${ds.properties.approved}</p><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody><tr><td>Total Users</td><td>${ds.users.total}</td></tr><tr><td>Owners</td><td>${ds.users.owners}</td></tr><tr><td>Clients</td><td>${ds.users.clients}</td></tr><tr><td>Active Users</td><td>${ds.users.active}</td></tr><tr><td>Inactive Users</td><td>${ds.users.inactive}</td></tr><tr><td>Total Properties</td><td>${ds.properties.total}</td></tr><tr><td>Pending Properties</td><td>${ds.properties.pending}</td></tr><tr><td>Approved Properties</td><td>${ds.properties.approved}</td></tr><tr><td>Rejected Properties</td><td>${ds.properties.rejected}</td></tr><tr><td>Total Bookings</td><td>${ds.bookings.total}</td></tr><tr><td>Pending Bookings</td><td>${ds.bookings.pending}</td></tr><tr><td>Confirmed Bookings</td><td>${ds.bookings.confirmed}</td></tr><tr><td>Cancelled Bookings</td><td>${ds.bookings.cancelled}</td></tr><tr><td>Completed Bookings</td><td>${ds.bookings.completed}</td></tr><tr><td>Total Revenue</td><td>${formatMoney(ds.financials.total_revenue)}</td></tr><tr><td>Platform Commission</td><td>${formatMoney(ds.financials.platform_commission)}</td></tr><tr><td>Owner Earnings</td><td>${formatMoney(ds.financials.owner_earnings)}</td></tr><tr><td>Outstanding Cash Commission</td><td>${formatMoney(ds.financials.outstanding_cash_commission)}</td></tr><tr><td>Total Reviews</td><td>${ds.reviews.total}</td></tr><tr><td>Average Rating</td><td>${Number(ds.reviews.average_rating).toFixed(2)}</td></tr></tbody></table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    doDownload(blob, fileName);
  }
  function exportMetricsCSV() {
    const now = new Date();
    const fileName = `StayLeb_Metrics_${now.toISOString().slice(0, 10)}.csv`;
    if (!dashboardStats) return;
    const ds = dashboardStats;
    const csv = `StayLeb Metrics,Generated ${now.toLocaleString()}\nMetric,Value\nTotal Users,${ds.users.total}\nOwners,${ds.users.owners}\nClients,${ds.users.clients}\nActive Users,${ds.users.active}\nInactive Users,${ds.users.inactive}\nTotal Properties,${ds.properties.total}\nPending Properties,${ds.properties.pending}\nApproved Properties,${ds.properties.approved}\nRejected Properties,${ds.properties.rejected}\nTotal Bookings,${ds.bookings.total}\nPending Bookings,${ds.bookings.pending}\nConfirmed Bookings,${ds.bookings.confirmed}\nCancelled Bookings,${ds.bookings.cancelled}\nCompleted Bookings,${ds.bookings.completed}\nTotal Revenue,${ds.financials.total_revenue}\nPlatform Commission,${ds.financials.platform_commission}\nOwner Earnings,${ds.financials.owner_earnings}\nOutstanding Cash Commission,${ds.financials.outstanding_cash_commission}\nTotal Reviews,${ds.reviews.total}\nAverage Rating,${Number(ds.reviews.average_rating).toFixed(2)}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    doDownload(blob, fileName);
  }
  function exportMetricsPDF() {
    const now = new Date();
    if (!dashboardStats) return;
    const ds = dashboardStats;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Metrics</title><style>body{font-family:Inter;padding:24px} th{background:#0f3d3e;color:white;padding:10px} td{border:1px solid #bec9c8;padding:8px} h1{color:#46B1B1}</style></head><body><h1>StayLeb Metrics</h1><p>Generated ${now.toLocaleString()}</p><table border="1" style="border-collapse:collapse; width:100%"><tr><th>Metric</th><th>Value</th></tr><tr><td>Total Users</td><td>${ds.users.total}</td></tr><tr><td>Owners</td><td>${ds.users.owners}</td></tr><tr><td>Clients</td><td>${ds.users.clients}</td></tr><tr><td>Total Revenue</td><td>${formatMoney(ds.financials.total_revenue)}</td></tr><tr><td>Platform Commission</td><td>${formatMoney(ds.financials.platform_commission)}</td></tr><tr><td>Outstanding Cash Commission</td><td>${formatMoney(ds.financials.outstanding_cash_commission)}</td></tr></table><button onclick="window.print()" style="margin-top:16px;background:#0f3d3e;color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;">Print / Save as PDF</button></body></html>`);
    win.document.close();
  }
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
<h1 className={"font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight mt-1"}>{"Admin Platform Overview"}</h1>
<p className={"font-body-md text-body-md text-[#46B1B1]"}>{"System-wide operational metrics, pending review queues, and commission balances."}</p>
</div>
  <div className={"flex items-center gap-space-xs shrink-0 relative"}>
<div className="relative">
<button onClick={() => setExportMetricsOpen((v) => !v)} className="inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 transition-all">
<Icon name="file_download" className="material-symbols-outlined text-[18px] text-white" />
<span>Export Metrics</span>
<Icon name={exportMetricsOpen ? "expand_less" : "expand_more"} className="material-symbols-outlined text-[14px] text-white/80" />
</button>
{exportMetricsOpen && (
<>
<button className="fixed inset-0 z-10" aria-label="Close export menu" onClick={() => setExportMetricsOpen(false)} tabIndex={-1} />
<div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20">
<p className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-[#46B1B1]/60">Choose format</p>
<button onClick={exportMetricsExcel} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left">
<span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center"><Icon name="table_view" className="material-symbols-outlined text-[18px]" /></span>
<span className="flex flex-col"><strong className="text-sm text-[#46B1B1]">Excel</strong><span className="text-xs text-[#46B1B1]/70">Styled .xls</span></span>
</button>
<button onClick={exportMetricsCSV} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left">
<span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Icon name="description" className="material-symbols-outlined text-[18px]" /></span>
<span className="flex flex-col"><strong className="text-sm text-[#46B1B1]">CSV</strong><span className="text-xs text-[#46B1B1]/70">Raw .csv</span></span>
</button>
<button onClick={exportMetricsPDF} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left">
<span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 grid place-items-center"><Icon name="picture_as_pdf" className="material-symbols-outlined text-[18px]" /></span>
<span className="flex flex-col"><strong className="text-sm text-[#46B1B1]">PDF</strong><span className="text-xs text-[#46B1B1]/70">Print preview</span></span>
</button>
</div>
</>
)}
</div>
<Link className={"inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"} data-path={"settlements"} href={"/admin/settlements"}>
<Icon name="account_balance_wallet" className="material-symbols-outlined text-[18px] text-white" />
<span>{"Reconciliation Run"}</span>
</Link>
</div>
</div>
<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl"}>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Total Users"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="group" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{dashboardLoading ? "…" : String(dashboardStats?.users.total ?? 0)}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span className="font-caption text-caption">Live</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>Live</span>
<span>{dashboardStats ? `${dashboardStats.users.owners} owners · ${dashboardStats.users.clients} clients` : "All users"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Pending Approvals"}</span>
<span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span>{"\n          Action Required\n        "}</span>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-tertiary"}>{dashboardLoading ? "…" : `${dashboardStats?.properties.pending ?? 0} Properties`}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"Awaiting inspection & verification"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>{dashboardStats ? `${dashboardStats.properties.total} total` : "—"}</span>
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
<div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{dashboardLoading ? "…" : `${dashboardStats?.properties.approved ?? 0} Live`}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{dashboardStats ? `${dashboardStats.users.owners} owners · ${dashboardStats.users.clients} clients` : "All users"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>Live</span>
<span>{dashboardStats ? `Active: ${dashboardStats.users.active}` : ""}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Pending Cash Commission"}</span>
<div className={"w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed"}>
<Icon name="receipt" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{dashboardLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : dashboardError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{formatMoney(dashboardStats?.financials.outstanding_cash_commission ?? "0.00")}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" USD"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
{dashboardLoading ? (
  <span>Loading…</span>
) : dashboardError ? (
  <span className="text-rose-600 text-xs">{dashboardError}</span>
) : (
  <>
    <span className={"font-semibold text-tertiary"}>{dashboardStats?.bookings.total ?? 0}</span>{" total bookings"}
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
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Gross Booking Volume"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary"}>
<Icon name="payments" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{dashboardLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : dashboardError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{formatMoney(dashboardStats?.financials.total_revenue)}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" USD"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{dashboardStats ? `${dashboardStats.bookings.total} bookings` : "All-time platform total"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>{dashboardStats ? `Confirmed: ${dashboardStats.bookings.confirmed}` : "Global"}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Commission Captured"}</span>
<div className={"w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container"}>
<Icon name="percent" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{dashboardLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : dashboardError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-primary"}>{formatMoney(dashboardStats?.financials.platform_commission)}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" USD"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"Platform commission"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-secondary font-medium"}>{dashboardError ? "Unavailable" : `${dashboardStats?.bookings.completed ?? 0} completed`}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Net Owner Payouts"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="account_balance" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{dashboardLoading ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>…</div>
) : dashboardError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{formatMoney(dashboardStats?.financials.owner_earnings)}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" USD"}</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
<span>{"Owner earnings"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-primary font-medium"}>{dashboardError ? "Unavailable" : `${dashboardStats?.properties.rejected ?? 0} rejected`}</span>
<span>{"Live data"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Active Guest Reviews"}</span>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="reviews" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
{dashboardLoading ? (
  <div className="flex items-center gap-2 py-2">
    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <span className="text-sm text-[#46B1B1]/70">Loading…</span>
  </div>
) : dashboardError ? (
  <div className={"font-label-sm text-label-sm text-rose-600"}>Unavailable</div>
) : dashboardStats?.reviews.total === 0 ? (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]/60"}>0<span className="text-sm font-normal text-[#46B1B1]/70"> reviews</span></div>
) : (
  <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{dashboardStats?.reviews.total ?? 0}<span className="text-sm font-normal text-[#46B1B1]/70"> reviews</span></div>
)}
<div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
{dashboardLoading ? (
  <span className="text-[#46B1B1]/60">Loading…</span>
) : dashboardError ? (
  <span className="text-rose-600 text-xs">{dashboardError}</span>
) : (dashboardStats?.reviews.total ?? 0) === 0 ? (
  <span className="text-[#46B1B1]/60">No reviews yet</span>
) : (
  <>
    <span className={"inline-flex items-center gap-1 font-semibold text-primary"}>
      <Icon name="star" className="material-symbols-outlined text-[14px] text-amber-500" /> {Number(dashboardStats?.reviews.average_rating ?? 0).toFixed(2)} / 5.0
    </span>
    <span className="text-xs text-[#46B1B1]/70">overall</span>
  </>
)}
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
<span className={"text-secondary font-medium"}>{dashboardStats ? `${dashboardStats.reviews.total} total` : "Unavailable"}</span>
<span>{"Live data"}</span>
</div>
</div>
</div>
<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl"}>
<section className={"lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
<div className={"p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"}></div>
<div>
<h2 className={"font-title-md text-title-md text-[#46B1B1] tracking-tight"}>{"Pending Property Approvals Queue"}</h2>
<p className={"font-caption text-caption text-[#46B1B1]"}>{"Verify Lebanese permit credentials, pricing, and photo fidelity before marketplace indexing"}</p>
</div>
</div>
<Link className={"inline-flex items-center gap-1 text-[#46B1B1] font-label-sm text-label-sm hover:underline font-semibold"} data-path={"property-approvals"} href={"/admin/properties"}>
<span>{`View All Pending (${dashboardStats?.properties.pending ?? 0})`}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[16px]" />
</Link>
</div>
<div className={"overflow-x-auto"}>
{pendingQueue.length === 0 ? (
  <div className="p-8 text-center text-[#46B1B1]">{dashboardLoading ? "Loading…" : "No pending properties — queue is clear."}</div>
) : (
<DataTable className={"w-full text-left"}>
<thead className={"bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider"}>
<tr>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Property & Location"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Host / Owner"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Base Rate"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Submission"}</th>
<th className={"py-3 px-space-md text-[#46B1B1]"}>{"Review Status"}</th>
<th className={"py-3 px-space-md text-right text-[#46B1B1]"}>{"Action"}</th>
</tr>
</thead>
<tbody className={"divide-y divide-transparent font-body-md text-body-md text-[#46B1B1]"}>
{pendingQueue.map((p: any) => (
<RecordRow key={p.id} className={"hover:bg-surface-container transition-colors group"} initialStatus={""}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-high shadow-xs"}>
<LocalImage className={"w-full h-full object-cover"} src={p.images?.[0]?.image_url || "/images/52db83fea695d506.jpg"} alt={p.title} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#46B1B1] truncate group-hover:text-primary transition-colors"}>{p.title}</span>
<span className={"font-caption text-caption text-[#46B1B1] flex items-center gap-1"}>
<Icon name="location_on" className="material-symbols-outlined text-[13px] text-outline" /> {p.location} • {p.property_type}
</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<div className={"flex items-center gap-1.5"}>
<div className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-caption flex items-center justify-center font-semibold"}>{String(p.owner_id).slice(-2)}</div>
<span className={"font-label-sm text-label-sm text-[#46B1B1] font-medium"}>Owner #{p.owner_id}</span>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<div className={"font-semibold text-primary font-label-md text-label-md"}>${Number(p.price_per_night).toFixed(0)} <span className={"font-normal text-caption text-[#46B1B1]"}>{"/ night"}</span></div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-caption text-caption text-[#46B1B1] bg-surface-container-low px-2 py-1 rounded"}>{new Date(p.created_at).toLocaleDateString()}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span> Pending Review
</span>
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 shadow-xs transition-colors"} href={`/admin/properties/${p.id}`}>
<span>Review Property</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[14px] text-white" />
</Link>
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
<span>{"Lebanese Ministry of Tourism registry validation enabled for all pending listings."}</span>
</div>
<button
  onClick={() => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>StayLeb Verification Guidelines</title><style>
      body{font-family:Inter, Arial, sans-serif; color:#46B1B1; padding:32px; line-height:1.6; max-width:800px; margin:auto;}
      h1{color:#46B1B1; font-size:24px; border-bottom:3px solid #0f3d3e; padding-bottom:8px; margin:0 0 8px 0;}
      .subtitle{color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:24px;}
      h2{color:#46B1B1; font-size:16px; margin:24px 0 12px 0; border-left:4px solid #157375; padding-left:12px;}
      h3{color:#46B1B1; font-size:14px; margin:16px 0 8px 0;}
      table{width:100%; border-collapse:collapse; font-size:12px; margin:12px 0;}
      th{background:#0f3d3e; color:white; padding:10px 8px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.5px;}
      td{padding:10px 8px; border:1px solid #e2e8f0; vertical-align:top;}
      tr:nth-child(even) td{background:#f8fafc;}
      .check{color:#0f8554; font-weight:bold;}
      .cross{color:#ba1a1a; font-weight:bold;}
      .box{background:#f0f3ff; border:1px solid #d8e3fb; border-radius:8px; padding:12px 16px; margin:12px 0; font-size:12px;}
      .footer{margin-top:32px; border-top:1px solid #e2e8f0; padding-top:12px; font-size:10px; color:#64748b; display:flex; justify-content:space-between;}
      @media print{ button{display:none} }
    </style></head><body>
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
        <div style="width:48px; height:48px; background:#0f3d3e; color:white; display:grid; place-items:center; border-radius:12px; font-weight:800; font-size:18px;">SL</div>
        <div>
          <div style="font-size:20px; font-weight:800; color:#46B1B1; letter-spacing:-0.5px;">StayLeb</div>
          <div style="font-size:10px; color:#46B1B1; letter-spacing:2px; text-transform:uppercase; font-weight:700;">Lebanon Stays • Ministry Decree 4123</div>
        </div>
      </div>
      <h1>Property Verification Guidelines</h1>
      <div class="subtitle">For Admin Reviewers • Version 2.4 • Effective: September 2026 • Confidential</div>
      <p style="font-size:12px; color:#475569; background:#f8fafc; padding:12px; border-radius:8px; border-left:4px solid #0f3d3e;"><strong>Purpose:</strong> Ensure every chalet and furnished house meets Lebanese Ministry of Tourism Decree 4123, safety, and StayLeb quality standards before marketplace activation. Properties remain unlisted until <strong>manually approved</strong>.</p>
      
      <h2>1. Mandatory 28-Point Checklist</h2>
      <table>
        <tr><th style="width:36px;">#</th><th>Category</th><th>Requirement</th><th style="width:80px;">Check</th></tr>
        <tr><td>1</td><td><strong>Ownership Proof</strong></td><td>Lebanese cadastral extract or title deed (≤3 months) + host ID matching owner_id. Verify via Ministry registry.</td><td><span class="check">☐ Pass</span> / <span class="cross">☐ Fail</span></td></tr>
        <tr><td>2</td><td><strong>Photo Fidelity</strong></td><td>Min. 5 high-res landscape photos (≥1920px), daylight, no filters, no stock. Cover must show exterior façade + mountain/coast context.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
        <tr><td>3</td><td><strong>Pricing Fairness</strong></td><td>Nightly rate within ±20% of district baseline (Faraya $150-300, Batroun $120-250, Chouf $100-200). Flag outliers.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
        <tr><td>4</td><td><strong>Safety & Utilities</strong></td><td>Declare EDL vs. private generator hours, water cistern, fire extinguisher, first-aid kit. 24/7 power backup required.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
        <tr><td>5</td><td><strong>Amenities Accuracy</strong></td><td>Selected amenities (Wi-Fi, pool, fireplace, etc.) must be visible in photos and described accurately.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
        <tr><td>6</td><td><strong>House Rules Clarity</strong></td><td>At least one rule (pets, smoking, parties, quiet hours) with clear allowed/not allowed + value if applicable.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
        <tr><td>7</td><td><strong>Seasonal Pricing</strong></td><td>If present, seasonal windows must not overlap, have valid date range, and price &gt;0. No more than 5 windows.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
        <tr><td>8</td><td><strong>Location Precision</strong></td><td>District + address must be precise (e.g., "Plot 89B, Zaarour Ridge, Metn") with Google Maps verifiable.</td><td><span class="check">☐</span> / <span class="cross">☐</span></td></tr>
      </table>

      <h2>2. Decision Matrix</h2>
      <table>
        <tr><th>Outcome</th><th>When to Use</th><th>System Effect</th></tr>
        <tr><td><strong style="color:#0f8554;">Approve & Publish</strong></td><td>All 8 checks pass. No major issues.</td><td>Status → <strong>approved</strong>, immediately searchable, host notified.</td></tr>
        <tr><td><strong style="color:#ba1a1a;">Reject</strong></td><td>Any check fails (e.g., blurry cover, ownership mismatch, missing utilities).</td><td>Status → <strong>rejected</strong>, host receives itemized reason (min 10 chars), can edit & resubmit.</td></tr>
        <tr><td><strong>Pending</strong></td><td>Needs clarification (e.g., ambiguous address).</td><td>Keep pending, request info via host liaison.</td></tr>
      </table>

      <h2>3. Photo & Content Standards</h2>
      <div class="box"><strong>Cover Photo:</strong> Must show full exterior with mountain/coast context, daylight, no people, no text overlay. <strong>Interior:</strong> At least 2 photos (living room with fireplace, master bedroom). <strong>Reject if:</strong> Blurry, dark, stock watermark, or amenity not visible (e.g., pool claimed but not in photo).</div>

      <h2>4. Pricing & Legal Notes</h2>
      <ul style="font-size:12px; margin:8px 0; padding-left:18px;">
        <li>Historical commission rates are immutable — changing global commission does not retroactively affect existing bookings.</li>
        <li>All prices in Fresh USD, displayed with 2 decimals. Verify against seasonal windows for overlaps.</li>
        <li>Min nights ≥1, max guests ≥1, bedrooms ≥0 as per schema.</li>
      </ul>

      <h2>5. Reviewer Workflow (SLA 12h)</h2>
      <ol style="font-size:12px; padding-left:18px;">
        <li>Open <strong>Admin → Property Approvals → Pending</strong> queue.</li>
        <li>Click <strong>Review Property</strong> → inspect <em>Visual Media, Specs, Narrative, Amenities, House Rules, Seasonal Pricing</em>.</li>
        <li>Use <strong>Approve & Publish</strong> or <strong>Reject</strong> (provide 10+ char reason). Decision is audited with your admin ID.</li>
        <li>Host receives notification and can view status in <strong>Owner → My Properties</strong>.</li>
      </ol>

      <div class="footer">
        <span>StayLeb Hospitality Technologies SAL • Beirut, Lebanon • stayleb.com • support@stayleb.com</span>
        <span>Page 1 • Generated ${new Date().toLocaleDateString()}</span>
      </div>
      <p style="font-size:9px; color:#94a3b8; text-align:center; margin-top:8px;">Confidential — Internal Use Only • Ministry Decree 4123 Compliance • Version 2.4</p>
    </body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }}
  className="text-primary hover:text-[#46B1B1] font-label-sm text-label-sm font-semibold transition-colors"
>
  Download Verification Guidelines (PDF)
</button>
</div>
</section>
<section className={"lg:col-span-4 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-md justify-between"}>
{(() => {
  const total = dashboardStats?.bookings.total ?? 0;
  const pending = dashboardStats?.bookings.pending ?? 0;
  const confirmed = dashboardStats?.bookings.confirmed ?? 0;
  const cancelled = dashboardStats?.bookings.cancelled ?? 0;
  const completed = dashboardStats?.bookings.completed ?? 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const confirmedPct = total > 0 ? (confirmed / total) * 100 : 0;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <>
      <div>
        <div className={"flex items-center justify-between mb-space-sm"}>
          <div className={"flex items-center gap-space-xs"}>
            <Icon name="donut_large" className="material-symbols-outlined text-primary text-[20px]" />
            <h3 className={"font-title-md text-title-md text-[#46B1B1]"}>{"Booking Status Overview"}</h3>
          </div>
          <span className={"font-caption text-caption uppercase px-2 py-0.5 bg-surface-container rounded font-semibold text-outline"}>{dashboardLoading ? "…" : `${total} total`}</span>
        </div>
        <p className={"font-body-md text-body-md text-[#46B1B1] mb-space-md"}>{"Distribution of bookings by current status."}</p>
        {dashboardLoading ? (
          <div className="p-6 text-center text-sm text-[#46B1B1]">Loading…</div>
        ) : dashboardError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">Unavailable — {dashboardError}</div>
        ) : (
          <>
            <div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
              <div className={"flex items-center justify-between mb-space-xs"}>
                <span className={"font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5"}>
                  <span className={"w-2.5 h-2.5 rounded-full bg-amber-400"}></span>{" Pending"}
                </span>
                <span className={"font-label-sm text-label-sm text-amber-600 font-bold"}>{pendingPct.toFixed(1)}%</span>
              </div>
              <div className={"font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1"}>{pending}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" bookings"}</span></div>
              <p className={"font-caption text-caption text-[#46B1B1]"}>{"Awaiting confirmation"}</p>
            </div>
            <div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
              <div className={"flex items-center justify-between mb-space-xs"}>
                <span className={"font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5"}>
                  <span className={"w-2.5 h-2.5 rounded-full bg-primary"}></span>{" Confirmed"}
                </span>
                <span className={"font-label-sm text-label-sm text-primary font-bold"}>{confirmedPct.toFixed(1)}%</span>
              </div>
              <div className={"font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1"}>{confirmed}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" bookings"}</span></div>
              <p className={"font-caption text-caption text-[#46B1B1]"}>{"Active reservations"}</p>
            </div>
            <div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
              <div className={"flex items-center justify-between mb-space-xs"}>
                <span className={"font-label-sm text-label-sm text-[#46B1B1] font-semibold flex items-center gap-1.5"}>
                  <span className={"w-2.5 h-2.5 rounded-full bg-emerald-500"}></span>{" Completed"}
                </span>
                <span className={"font-label-sm text-label-sm text-emerald-600 font-bold"}>{completedPct.toFixed(1)}%</span>
              </div>
              <div className={"font-headline-sm text-headline-sm font-bold text-[#46B1B1] mb-1"}>{completed}<span className={"text-label-sm font-normal text-[#46B1B1]"}>{" bookings"}</span></div>
              <p className={"font-caption text-caption text-[#46B1B1]"}>{"Finished stays"}</p>
            </div>
            <div className={"w-full bg-surface-container h-3 rounded-full overflow-hidden flex shadow-inner mb-space-sm"}>
              <div className={"bg-amber-400 h-full transition-all"} style={{"width": `${pendingPct}%`}}></div>
              <div className={"bg-primary h-full transition-all"} style={{"width": `${confirmedPct}%`}}></div>
              <div className={"bg-emerald-500 h-full transition-all"} style={{"width": `${completedPct}%`}}></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#46B1B1]/70 mt-1"><span>Cancelled: {cancelled}</span><span>Total: {total}</span></div>
          </>
        )}
      </div>
      <div className={"pt-space-sm flex items-center justify-between text-caption font-caption text-outline"}>
        <span>{dashboardStats ? `Total: ${dashboardStats.bookings.total} bookings` : "Total: Unavailable"}</span>
        <span className={"font-semibold text-primary"}>{"Live data"}</span>
      </div>
    </>
  );
})()}
</section>
</div>
<section className={"flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"}>
<div className={"p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<Icon name="pending_actions" className="material-symbols-outlined text-tertiary text-[20px]" />
<h2 className={"font-title-md text-title-md text-[#46B1B1] tracking-tight"}>{"Outstanding Cash Commission Balances"}</h2>
</div>
<p className={"font-caption text-caption text-[#46B1B1]"}>{"Hosts with collected guest cash payments requiring platform 10% commission remittance"}</p>
</div>
<Link className={"inline-flex items-center gap-space-xxs px-space-md py-2 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-md text-label-md hover:bg-surface-container-highest transition-colors font-semibold"} data-path={"settlements"} href={"/admin/settlements"}>
<Icon name="account_tree" className="material-symbols-outlined text-[18px]" />
<span>{"Open Settlements Ledger"}</span>
</Link>
</div>
  <div className="overflow-x-auto">
{outstandingLoading ? (
  <div className="p-8 flex flex-col items-center gap-3">
    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-[#46B1B1]">Loading outstanding settlements…</p>
  </div>
) : outstandingError ? (
  <div className="p-8 text-center">
    <Icon name="error" className="material-symbols-outlined text-rose-400 text-[28px] mb-2" />
    <p className="text-sm text-rose-600">{outstandingError}</p>
    <p className="text-xs text-[#46B1B1]/70 mt-1">Unable to load data</p>
  </div>
) : outstanding.length === 0 ? (
  <div className="p-8 text-center">
    <Icon name="check_circle" className="material-symbols-outlined text-emerald-500 text-[28px] mb-2" />
    <p className="text-sm font-semibold text-[#46B1B1]">No outstanding cash commissions</p>
    <p className="text-xs text-[#46B1B1]/70 mt-1">All cash commissions are settled.</p>
  </div>
) : (
<DataTable className="w-full text-left">
<thead className="bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider">
<tr>
<th className="py-3 px-space-md text-[#46B1B1]">Host / Property Reserved</th>
<th className="py-3 px-space-md text-[#46B1B1]">Settlement</th>
<th className="py-3 px-space-md text-[#46B1B1]">Booking</th>
<th className="py-3 px-space-md text-[#46B1B1]">Commission Owed</th>
<th className="py-3 px-space-md text-[#46B1B1]">Remittance Status</th>
<th className="py-3 px-space-md text-right text-[#46B1B1]">Settlement Action</th>
</tr>
</thead>
<tbody className={"divide-y divide-transparent font-body-md text-body-md text-[#46B1B1]"}>
{outstanding.map((s) => (
<RecordRow key={s.id} className={"hover:bg-surface-container transition-colors"} initialStatus={"Outstanding"}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold flex items-center justify-center"}>{s.owner.full_name.slice(0,2).toUpperCase()}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#46B1B1]"}>{s.owner.full_name}</span>
<span className={"font-caption text-caption text-[#46B1B1] truncate"}>{s.property.title} · {s.property.location}</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm font-mono text-primary font-semibold bg-surface-container px-2 py-1 rounded"}>#{s.id}</span>
<div className="text-xs text-[#46B1B1]/60">Booking #SL-{String(s.booking_id).padStart(4,"0")}</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm font-mono text-primary font-semibold bg-surface-container px-2 py-1 rounded"}>#SL-{String(s.booking_id).padStart(4,"0")}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-md text-label-md font-bold text-tertiary"}>{formatMoney(s.commission_amount)}</span>
<div className="text-xs text-[#46B1B1]/60">Settlement #{s.id}</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 font-label-sm text-label-sm shadow-xs transition-colors"} data-path={"settlements"} href={"/admin/settlements"}>
<span>{"View in Settlements"}</span>
<Icon name="open_in_new" className="material-symbols-outlined text-[14px] text-white" />
</Link>
</td>
</RecordRow>
))}
</tbody>
</DataTable>
)}
</div>
<div className={"p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm"}>
<div className={"flex items-center gap-space-xs text-caption font-caption text-[#46B1B1]"}>
<Icon name="info" className="material-symbols-outlined text-[16px] text-tertiary" />
<span>{outstandingLoading ? "Loading…" : outstandingError ? "Unavailable" : `Showing top ${outstanding.length} outstanding records. Total outstanding cash commission is ${formatMoney(dashboardStats?.financials.outstanding_cash_commission ?? "0.00")} USD.`}</span>
</div>
<div className={"flex items-center gap-space-xs"}>
<Link className={"px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary/90 transition-colors font-semibold shadow-sm"} data-path={"settlements"} href={"/admin/settlements"}>{"\n          Open Full Queue\n        "}</Link>
</div>
</div>
</section>

</div></main></div>
</>; }
