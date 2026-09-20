"use client";
import { useEffect, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable } from "@/components/ui/Interactions";
import { apiFetch } from "@/services/api";

export function AdminDashboardSection0() {
  const [stats, setStats] = useState({ users: 0, pending: 0, approved: 0, loading: true });
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [exportMetricsOpen, setExportMetricsOpen] = useState(false);
  const [exportingMetrics, setExportingMetrics] = useState(false);
  useEffect(() => {
    async function load() {
      try {
        const [users, pending, approved] = await Promise.all([
          apiFetch("/admin/users").catch(() => []),
          apiFetch("/admin/properties?status=pending").catch(() => []),
          apiFetch("/admin/properties?status=approved").catch(() => []),
        ]);
        setStats({ users: users.length, pending: pending.length, approved: approved.length, loading: false });
        setPendingQueue(pending.slice(0, 3));
      } catch {
        setStats((s) => ({ ...s, loading: false }));
      }
    }
    load();
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
    const html = `<html><head><meta charset="UTF-8"><style>body{font-family:Calibri;color:#111c2d} th{background:#0f3d3e;color:white;padding:10px} td{padding:8px;border:1px solid #bec9c8} tr:nth-child(even) td{background:#f9f9ff}</style></head><body><h2 style="color:#0f3d3e;">StayLeb — Admin Metrics</h2><p>Generated ${now.toLocaleString()} | Users: ${stats.users} | Pending: ${stats.pending} | Approved: ${stats.approved}</p><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody><tr><td>Total Users</td><td>${stats.users}</td></tr><tr><td>Pending Approvals</td><td>${stats.pending}</td></tr><tr><td>Approved Properties</td><td>${stats.approved}</td></tr><tr><td>Pending Cash Commission</td><td>$680.00</td></tr><tr><td>Gross Volume</td><td>$48,250.00</td></tr></tbody></table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    doDownload(blob, fileName);
  }
  function exportMetricsCSV() {
    const now = new Date();
    const fileName = `StayLeb_Metrics_${now.toISOString().slice(0, 10)}.csv`;
    const csv = `StayLeb Metrics,Generated ${now.toLocaleString()}\nMetric,Value\nTotal Users,${stats.users}\nPending Approvals,${stats.pending}\nApproved Properties,${stats.approved}\nPending Cash Commission,680.00\nGross Volume,48250.00`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    doDownload(blob, fileName);
  }
  function exportMetricsPDF() {
    const now = new Date();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Metrics</title><style>body{font-family:Inter;padding:24px} th{background:#0f3d3e;color:white;padding:10px} td{border:1px solid #bec9c8;padding:8px} h1{color:#0f3d3e}</style></head><body><h1>StayLeb Metrics</h1><p>Generated ${now.toLocaleString()}</p><table border="1" style="border-collapse:collapse; width:100%"><tr><th>Metric</th><th>Value</th></tr><tr><td>Total Users</td><td>${stats.users}</td></tr><tr><td>Pending Approvals</td><td>${stats.pending}</td></tr><tr><td>Approved Properties</td><td>${stats.approved}</td></tr></table><button onclick="window.print()" style="margin-top:16px;background:#0f3d3e;color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;">Print / Save as PDF</button></body></html>`);
    win.document.close();
  }
  return <>
<div className={""}><main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}><div className={"flex flex-col w-full"}>
<div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl"}>
<div className={"flex flex-col gap-space-xxs"}>
<div className={"flex items-center gap-space-xs text-[#157375] font-label-sm text-label-sm"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"}></span>{"\n          Live Sync Active\n        "}</span>
<span>{"\u2022"}</span>
<span>{"Lebanon Standard Time (UTC+03:00)"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-[#157375] tracking-tight mt-1"}>{"Admin Platform Overview"}</h1>
<p className={"font-body-md text-body-md text-[#157375]"}>{"System-wide operational metrics, pending review queues, and commission balances."}</p>
</div>
  <div className={"flex items-center gap-space-xs shrink-0 relative"}>
<div className="relative">
<button onClick={() => setExportMetricsOpen((v) => !v)} className="inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-[#0a2e2f] transition-all">
<Icon name="file_download" className="material-symbols-outlined text-[18px] text-white" />
<span>Export Metrics</span>
<Icon name={exportMetricsOpen ? "expand_less" : "expand_more"} className="material-symbols-outlined text-[14px] text-white/80" />
</button>
{exportMetricsOpen && (
<>
<button className="fixed inset-0 z-10" aria-label="Close export menu" onClick={() => setExportMetricsOpen(false)} tabIndex={-1} />
<div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20">
<p className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-slate-400">Choose format</p>
<button onClick={exportMetricsExcel} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left">
<span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center"><Icon name="table_view" className="material-symbols-outlined text-[18px]" /></span>
<span className="flex flex-col"><strong className="text-sm text-[#157375]">Excel</strong><span className="text-xs text-[#157375]/70">Styled .xls</span></span>
</button>
<button onClick={exportMetricsCSV} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left">
<span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Icon name="description" className="material-symbols-outlined text-[18px]" /></span>
<span className="flex flex-col"><strong className="text-sm text-[#157375]">CSV</strong><span className="text-xs text-[#157375]/70">Raw .csv</span></span>
</button>
<button onClick={exportMetricsPDF} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left">
<span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 grid place-items-center"><Icon name="picture_as_pdf" className="material-symbols-outlined text-[18px]" /></span>
<span className="flex flex-col"><strong className="text-sm text-[#157375]">PDF</strong><span className="text-xs text-[#157375]/70">Print preview</span></span>
</button>
</div>
</>
)}
</div>
<Link className={"inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-[#0a2e2f] active:scale-[0.98] transition-all"} data-path={"settlements"} href={"/admin/settlements"}>
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
<div className={"font-headline-md text-headline-md font-bold text-[#157375]"}>{stats.loading ? "…" : String(stats.users)}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span className="font-caption text-caption">Live from backend</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-primary font-medium"}>Real-time</span>
<span>{"vs last month"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Pending Approvals"}</span>
<span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span>{"\n          Action Required\n        "}</span>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-tertiary"}>{stats.loading ? "…" : `${stats.pending} Properties`}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span>{"Awaiting inspection & verification"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-tertiary font-medium"}>{"Avg wait: 4.2 hrs"}</span>
<span>{"Target < 12 hrs"}</span>
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
<div className={"font-headline-md text-headline-md font-bold text-[#157375]"}>{stats.loading ? "…" : `${stats.approved} Live`}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span>Marketplace Active in 14 Districts</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-primary font-medium"}>Real-time from backend</span>
<span>{"Mount Leb & North"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Pending Cash Commission"}</span>
<span className="text-[9px] px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">DEMO • Day 7</span>
<div className={"w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed"}>
<Icon name="receipt" className="material-symbols-outlined text-[20px]" />
</div>
</div>
<div className={"mt-space-sm"}>
<div className={"font-headline-md text-headline-md font-bold text-[#157375]"}>{"$680.00 "}<span className={"text-label-sm font-normal text-[#157375]"}>{"USD"}</span></div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span className={"font-semibold text-tertiary"}>{"12"}</span>{" outstanding collection cycles\n        "}</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-tertiary font-medium"}>{"Cash On Arrival"}</span>
<span>{"Reconciliation due"}</span>
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
<div className={"font-headline-md text-headline-md font-bold text-[#157375]"}>{"$48,250.00 "}<span className={"text-label-sm font-normal text-[#157375]"}>{"USD"}</span></div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span>{"All-time recorded volume"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-primary font-medium flex items-center gap-0.5"}>
<Icon name="arrow_upward" className="material-symbols-outlined text-[14px]" />{" +22.8%\n        "}</span>
<span>{"YTD expansion"}</span>
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
<div className={"font-headline-md text-headline-md font-bold text-primary"}>{"$4,825.00 "}<span className={"text-label-sm font-normal text-[#157375]"}>{"USD"}</span></div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span>{"Average effective rate "}<strong>{"~10.0%"}</strong></span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-secondary font-medium"}>{"85.9% Digital capture"}</span>
<span>{"Stripe + Cash"}</span>
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
<div className={"font-headline-md text-headline-md font-bold text-[#157375]"}>{"$43,425.00 "}<span className={"text-label-sm font-normal text-[#157375]"}>{"USD"}</span></div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span>{"Retained by or disbursed to hosts"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-primary font-medium"}>{"100% On-schedule"}</span>
<span>{"Zero disputes"}</span>
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
<div className={"font-headline-md text-headline-md font-bold text-[#157375]"}>{"412"}</div>
<div className={"flex items-center gap-1.5 mt-1 text-[#157375] font-label-sm text-label-sm"}>
<span className={"inline-flex items-center gap-1 font-semibold text-primary"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Clean Queue\n          "}</span>
<span>{"(0 flagged)"}</span>
</div>
</div>
<div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#157375]"}>
<span className={"text-secondary font-medium"}>{"4.88 / 5.0 Avg"}</span>
<span>{"Platform satisfaction"}</span>
</div>
</div>
</div>
<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl"}>
<section className={"lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
<div className={"p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"}></div>
<div>
<h2 className={"font-title-md text-title-md text-[#157375] tracking-tight"}>{"Pending Property Approvals Queue"}</h2>
<p className={"font-caption text-caption text-[#157375]"}>{"Verify Lebanese permit credentials, pricing, and photo fidelity before marketplace indexing"}</p>
</div>
</div>
<Link className={"inline-flex items-center gap-1 text-[#157375] font-label-sm text-label-sm hover:underline font-semibold"} data-path={"property-approvals"} href={"/admin/properties"}>
<span>{`View All Pending (${stats.pending})`}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[16px]" />
</Link>
</div>
<div className={"overflow-x-auto"}>
{pendingQueue.length === 0 ? (
  <div className="p-8 text-center text-[#157375]">{stats.loading ? "Loading…" : "No pending properties — queue is clear."}</div>
) : (
<DataTable className={"w-full text-left"}>
<thead className={"bg-surface-container-low text-[#157375] font-caption text-caption uppercase tracking-wider"}>
<tr>
<th className={"py-3 px-space-md text-[#157375]"}>{"Property & Location"}</th>
<th className={"py-3 px-space-md text-[#157375]"}>{"Host / Owner"}</th>
<th className={"py-3 px-space-md text-[#157375]"}>{"Base Rate"}</th>
<th className={"py-3 px-space-md text-[#157375]"}>{"Submission"}</th>
<th className={"py-3 px-space-md text-[#157375]"}>{"Review Status"}</th>
<th className={"py-3 px-space-md text-right text-[#157375]"}>{"Action"}</th>
</tr>
</thead>
<tbody className={"divide-y divide-transparent font-body-md text-body-md text-[#157375]"}>
{pendingQueue.map((p: any) => (
<RecordRow key={p.id} className={"hover:bg-surface-container transition-colors group"} initialStatus={""}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-high shadow-xs"}>
<LocalImage className={"w-full h-full object-cover"} src={p.images?.[0]?.image_url || "/images/52db83fea695d506.jpg"} alt={p.title} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375] truncate group-hover:text-primary transition-colors"}>{p.title}</span>
<span className={"font-caption text-caption text-[#157375] flex items-center gap-1"}>
<Icon name="location_on" className="material-symbols-outlined text-[13px] text-outline" /> {p.location} • {p.property_type}
</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<div className={"flex items-center gap-1.5"}>
<div className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-caption flex items-center justify-center font-semibold"}>{String(p.owner_id).slice(-2)}</div>
<span className={"font-label-sm text-label-sm text-[#157375] font-medium"}>Owner #{p.owner_id}</span>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<div className={"font-semibold text-primary font-label-md text-label-md"}>${Number(p.price_per_night).toFixed(0)} <span className={"font-normal text-caption text-[#157375]"}>{"/ night"}</span></div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-caption text-caption text-[#157375] bg-surface-container-low px-2 py-1 rounded"}>{new Date(p.created_at).toLocaleDateString()}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span> Pending Review
</span>
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-[#0a2e2f] shadow-xs transition-colors"} href={`/admin/properties/${p.id}`}>
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
<div className={"flex items-center gap-2 text-[#157375] font-caption text-caption"}>
<Icon name="verified" className="material-symbols-outlined text-[18px] text-primary" />
<span>{"Lebanese Ministry of Tourism registry validation enabled for all pending listings."}</span>
</div>
<button
  onClick={() => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>StayLeb Verification Guidelines</title><style>
      body{font-family:Inter, Arial, sans-serif; color:#1E293B; padding:32px; line-height:1.6; max-width:800px; margin:auto;}
      h1{color:#0f3d3e; font-size:24px; border-bottom:3px solid #0f3d3e; padding-bottom:8px; margin:0 0 8px 0;}
      .subtitle{color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:24px;}
      h2{color:#0f3d3e; font-size:16px; margin:24px 0 12px 0; border-left:4px solid #157375; padding-left:12px;}
      h3{color:#1E293B; font-size:14px; margin:16px 0 8px 0;}
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
          <div style="font-size:20px; font-weight:800; color:#0f3d3e; letter-spacing:-0.5px;">StayLeb</div>
          <div style="font-size:10px; color:#157375; letter-spacing:2px; text-transform:uppercase; font-weight:700;">Lebanon Stays • Ministry Decree 4123</div>
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
  className="text-primary hover:text-[#157375] font-label-sm text-label-sm font-semibold transition-colors"
>
  Download Verification Guidelines (PDF)
</button>
</div>
</section>
<section className={"lg:col-span-4 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-md justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="donut_large" className="material-symbols-outlined text-primary text-[20px]" />
<h3 className={"font-title-md text-title-md text-[#157375]"}>{"Payment Channel Split"}</h3>
</div>
<span className={"font-caption text-caption uppercase px-2 py-0.5 bg-surface-container rounded font-semibold text-outline"}>{"Gross"}</span>
</div>
<p className={"font-body-md text-body-md text-[#157375] mb-space-md"}>{"Breakdown of gross booking payment channels across all historical reservations."}</p>
<div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<span className={"font-label-sm text-label-sm text-[#157375] font-semibold flex items-center gap-1.5"}>
<span className={"w-2.5 h-2.5 rounded-full bg-primary"}></span>{" Stripe Digital Checkout\n            "}</span>
<span className={"font-label-sm text-label-sm text-primary font-bold"}>{"70.7%"}</span>
</div>
<div className={"font-headline-sm text-headline-sm font-bold text-[#157375] mb-1"}>{"$34,120.00 "}<span className={"text-label-sm font-normal text-[#157375]"}>{"USD"}</span></div>
<p className={"font-caption text-caption text-[#157375]"}>{"Platform commission (10%) auto-withheld at guest card capture."}</p>
</div>
<div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<span className={"font-label-sm text-label-sm text-[#157375] font-semibold flex items-center gap-1.5"}>
<span className={"w-2.5 h-2.5 rounded-full bg-tertiary"}></span>{" Approved Cash on Arrival\n            "}</span>
<span className={"font-label-sm text-label-sm text-tertiary font-bold"}>{"29.3%"}</span>
</div>
<div className={"font-headline-sm text-headline-sm font-bold text-[#157375] mb-1"}>{"$14,130.00 "}<span className={"text-label-sm font-normal text-[#157375]"}>{"USD"}</span></div>
<p className={"font-caption text-caption text-[#157375]"}>{"Reconciled via Admin bi-weekly settlement cycles & OMT/Wish slips."}</p>
</div>
<div className={"w-full bg-surface-container h-3 rounded-full overflow-hidden flex shadow-inner mb-space-sm"}>
<div className={"bg-primary h-full transition-all"} style={{"width": "70.7%"}}></div>
<div className={"bg-tertiary h-full transition-all"} style={{"width": "29.3%"}}></div>
</div>
</div>
<div className={"pt-space-sm flex items-center justify-between text-caption font-caption text-outline"}>
<span>{"Total Volume: $48,250.00"}</span>
<span className={"font-semibold text-primary"}>{"Target: 80% Digital"}</span>
</div>
</section>
</div>
<section className={"flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"}>
<div className={"p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<Icon name="pending_actions" className="material-symbols-outlined text-tertiary text-[20px]" />
<h2 className={"font-title-md text-title-md text-[#157375] tracking-tight"}>{"Outstanding Cash Commission Balances"}</h2>
</div>
<p className={"font-caption text-caption text-[#157375]"}>{"Hosts with collected guest cash payments requiring platform 10% commission remittance"}</p>
</div>
<Link className={"inline-flex items-center gap-space-xxs px-space-md py-2 rounded-lg bg-surface-container-high text-[#157375] font-label-md text-label-md hover:bg-surface-container-highest transition-colors font-semibold"} data-path={"settlements"} href={"/admin/settlements"}>
<Icon name="account_tree" className="material-symbols-outlined text-[18px]" />
<span>{"Open Settlements Ledger"}</span>
</Link>
</div>
  <div className="overflow-x-auto">
<DataTable className="w-full text-left">
<thead className="bg-surface-container-low text-[#157375] font-caption text-caption uppercase tracking-wider">
<tr>
<th className="py-3 px-space-md text-[#157375]">Host / Property Reserved</th>
<th className="py-3 px-space-md text-[#157375]">Booking Reference</th>
<th className="py-3 px-space-md text-[#157375]">Gross Value</th>
<th className="py-3 px-space-md text-[#157375]">Capture Rate</th>
<th className="py-3 px-space-md text-[#157375]">Commission Owed</th>
<th className="py-3 px-space-md text-[#157375]">Remittance Status</th>
<th className="py-3 px-space-md text-right text-[#157375]">Settlement Action</th>
</tr>
</thead>
<tbody className={"divide-y divide-transparent font-body-md text-body-md text-[#157375]"}>
<RecordRow className={"hover:bg-surface-container transition-colors"} initialStatus={"Outstanding"}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center justify-center"}>{"\n                  TK\n                "}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Tony Karam"}</span>
<span className={"font-caption text-caption text-[#157375] truncate"}>{"Sour Sandy Beachfront Bungalow"}</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm font-mono text-primary font-semibold bg-surface-container px-2 py-1 rounded"}>{"#REQ-9102-CSH"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap font-medium text-[#157375]"}>{"\n              $480.00 USD\n            "}</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"inline-flex items-center px-2 py-0.5 rounded bg-surface-container-high text-[#157375] font-caption text-caption font-semibold"}>{"10.0%"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-md text-label-md font-bold text-tertiary"}>{"$48.00 USD"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-[#0a2e2f] font-label-sm text-label-sm shadow-xs transition-colors"} data-path={"settlements"} href={"/admin/settlements"}>
<span>{"View in Settlements"}</span>
<Icon name="open_in_new" className="material-symbols-outlined text-[14px] text-white" />
</Link>
</td>
</RecordRow>
<RecordRow className={"hover:bg-surface-container transition-colors"} initialStatus={"Outstanding"}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold flex items-center justify-center"}>{"\n                  MA\n                "}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Michel Aoun"}</span>
<span className={"font-caption text-caption text-[#157375] truncate"}>{"Faqra Snow Heights Chalet"}</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm font-mono text-primary font-semibold bg-surface-container px-2 py-1 rounded"}>{"#REQ-8841-CSH"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap font-medium text-[#157375]"}>{"\n              $920.00 USD\n            "}</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"inline-flex items-center px-2 py-0.5 rounded bg-surface-container-high text-[#157375] font-caption text-caption font-semibold"}>{"10.0%"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-md text-label-md font-bold text-tertiary"}>{"$92.00 USD"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-[#0a2e2f] font-label-sm text-label-sm shadow-xs transition-colors"} data-path={"settlements"} href={"/admin/settlements"}>
<span>{"View in Settlements"}</span>
<Icon name="open_in_new" className="material-symbols-outlined text-[14px] text-white" />
</Link>
</td>
</RecordRow>
<RecordRow className={"hover:bg-surface-container transition-colors"} initialStatus={"Outstanding"}>
<td className={"py-3.5 px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold flex items-center justify-center"}>{"\n                  ZH\n                "}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Zeina Haddad"}</span>
<span className={"font-caption text-caption text-[#157375] truncate"}>{"Kfaraabida Sunset Villa"}</span>
</div>
</div>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm font-mono text-primary font-semibold bg-surface-container px-2 py-1 rounded"}>{"#REQ-8790-CSH"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap font-medium text-[#157375]"}>{"\n              $750.00 USD\n            "}</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"inline-flex items-center px-2 py-0.5 rounded bg-surface-container-high text-[#157375] font-caption text-caption font-semibold"}>{"10.0%"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<span className={"font-label-md text-label-md font-bold text-tertiary"}>{"$75.00 USD"}</span>
</td>
<td className={"py-3.5 px-space-md whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
<Link className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-[#0a2e2f] font-label-sm text-label-sm shadow-xs transition-colors"} data-path={"settlements"} href={"/admin/settlements"}>
<span>{"View in Settlements"}</span>
<Icon name="open_in_new" className="material-symbols-outlined text-[14px] text-white" />
</Link>
</td>
</RecordRow>
</tbody>
</DataTable>
</div>
<div className={"p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm"}>
<div className={"flex items-center gap-space-xs text-caption font-caption text-[#157375]"}>
<Icon name="info" className="material-symbols-outlined text-[16px] text-tertiary" />
<span>{"Showing top 3 of 12 outstanding records. Total remaining cash collection balance is $680.00 USD."}</span>
</div>
<div className={"flex items-center gap-space-xs"}>
<ActionButton className={"px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-[#0a2e2f] transition-colors shadow-sm"} actionLabel={"Send SMS Reminders (3)"} aria-label={"Send SMS Reminders (3)"}>{"\n          Send SMS Reminders (3)\n        "}</ActionButton>
<Link className={"px-3 py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-[#0a2e2f] transition-colors font-semibold shadow-sm"} data-path={"settlements"} href={"/admin/settlements"}>{"\n          Open Full Queue\n        "}</Link>
</div>
</div>
</section>
<div className={"grid grid-cols-1 md:grid-cols-3 gap-space-md pb-space-lg"}>
<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm"}>
<div className={"w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0"}>
<Icon name="gavel" className="material-symbols-outlined text-[24px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Municipal Tax Regulations"}</span>
<span className={"font-caption text-caption text-[#157375] mt-0.5"}>{"Automated 5% municipality tourist fee calculations enabled across Beirut, Jbeil & Chouf zones."}</span>
<Link className={"text-primary hover:underline font-label-sm text-label-sm mt-2 font-medium inline-flex items-center gap-0.5"} data-path={"rules"} href={"/admin/rules"}>{"\n          Configure Zones "}<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
</Link>
</div>
</div>
<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm"}>
<div className={"w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0"}>
<Icon name="security" className="material-symbols-outlined text-[24px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Host ID Verification Node"}</span>
<span className={"font-caption text-caption text-[#157375] mt-0.5"}>{"99.1% Lebanese civil identity and passport OCR validation success with zero fraud incidents."}</span>
<Link className={"text-secondary hover:underline font-label-sm text-label-sm mt-2 font-medium inline-flex items-center gap-0.5"} data-path={"users"} href={"/admin/users"}>{"\n          Review Identity Logs "}<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
</Link>
</div>
</div>
<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm"}>
<div className={"w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary shrink-0"}>
<Icon name="price_change" className="material-symbols-outlined text-[24px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Dynamic Seasonal Commission"}</span>
<span className={"font-caption text-caption text-[#157375] mt-0.5"}>{"Winter ski tier activation scheduled for Faqra, Faraya and Zaarour chalets beginning Nov 15."}</span>
<Link className={"text-tertiary hover:underline font-label-sm text-label-sm mt-2 font-medium inline-flex items-center gap-0.5"} data-path={"commission"} href={"/admin/commission"}>{"\n          Manage Rules "}<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
</Link>
</div>
</div>
</div>
</div></main></div>
</>; }
