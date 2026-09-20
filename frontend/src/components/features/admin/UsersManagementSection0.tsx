"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton } from "@/components/ui/Interactions";
import { apiFetch } from "@/services/api";

type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
};

export function UsersManagementSection0() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<"all" | "client" | "owner" | "active" | "blocked">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter === "client") params.set("role", "client");
      if (filter === "owner") params.set("role", "owner");
      if (filter === "active") params.set("is_active", "true");
      if (filter === "blocked") params.set("is_active", "false");
      const q = params.toString() ? `?${params}` : "";
      const data = await apiFetch(`/admin/users${q}`);
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [u.full_name, u.email, u.phone || "", u.role].join(" ").toLowerCase().includes(q);
  });

  const total = users.length;
  // For counts we need all users, not filtered. Fetch separately or compute from current list if filter is all
  // Quick counts from loaded data (when filter=all, it's accurate)
  const clients = users.filter((u) => u.role === "client").length;
  const owners = users.filter((u) => u.role === "owner").length;
  const blocked = users.filter((u) => !u.is_active).length;

  async function handleBlock(u: User) {
    setBusyId(u.id);
    try {
      const endpoint = u.is_active ? `/admin/users/${u.id}/block` : `/admin/users/${u.id}/unblock`;
      await apiFetch(endpoint, { method: "PATCH" });
      setBlockTarget(null);
      await load();
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function showToast(msg: string) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f3d3e;color:white;padding:12px 20px;border-radius:10px;box-shadow:0 8px 20px rgba(0,0,0,0.15);font-size:13px;z-index:9999;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function doDownload(blob: Blob, fileName: string) {
    // prevent double download from React StrictMode / double click
    if (exporting) return;
    setExporting(true);
    setExportOpen(false);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // delay removal to ensure single download
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 500);
  }

  function exportExcel() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const fileName = `StayLeb_Users_Registry_${now.toISOString().slice(0, 10)}.xls`;
    const filterLabel = filter === "all" ? "All Users" : filter.charAt(0).toUpperCase() + filter.slice(1);
    const searchNote = search ? ` • Search: "${search}"` : "";
    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><style>
  body{font-family:Calibri, Arial, sans-serif; color:#111c2d;}
  .header{margin-bottom:12px;}
  .brand{font-size:22px; font-weight:800; color:#0f3d3e; letter-spacing:-0.5px;}
  .subtitle{font-size:11px; color:#2f8d8e; letter-spacing:2.5px; text-transform:uppercase; font-weight:700; margin-top:-2px;}
  .meta{font-size:10px; color:#3e4949; margin:8px 0 14px 0; background:#f0f3ff; padding:8px 12px; border-radius:6px;}
  .meta strong{color:#0f3d3e;}
  table{border-collapse:collapse; width:100%; font-size:11px;}
  th{background:#0f3d3e; color:#ffffff; font-weight:700; text-align:left; padding:10px 8px; border:1px solid #0f3d3e; letter-spacing:0.3px;}
  td{padding:8px 8px; border:1px solid #bec9c8; vertical-align:middle;}
  tr:nth-child(even) td{background:#f9f9ff;}
  .footer{margin-top:14px; font-size:9px; color:#6e7979; border-top:1px solid #bec9c8; padding-top:8px; display:flex; justify-content:space-between;}
  .summary{margin-top:10px; display:flex; gap:12px; font-size:10px;}
  .summary div{background:#f0f3ff; border:1px solid #d8e3fb; border-radius:8px; padding:8px 12px; text-align:center; min-width:90px;}
  .summary strong{font-size:14px; color:#0f3d3e; display:block;}
</style></head>
<body>
  <div class="header">
    <div class="brand">StayLeb <span style="font-weight:400; color:#3a9a9e;">— Lebanon Stays</span></div>
    <div class="subtitle">User Registry • Confidential</div>
    <div class="meta"><strong>Generated:</strong> ${dateStr} at ${timeStr} &nbsp;|&nbsp; <strong>Filter:</strong> ${filterLabel}${searchNote} &nbsp;|&nbsp; <strong>Records:</strong> ${filtered.length} of ${total}</div>
    <div class="summary"><div><strong>${total}</strong>Total</div><div><strong>${clients}</strong>Clients</div><div><strong>${owners}</strong>Owners</div><div><strong style="color:#ba1a1a;">${blocked}</strong>Blocked</div></div>
  </div>
  <table><thead><tr><th>ID</th><th>Full Name</th><th>Email Address</th><th>Role</th><th>Phone</th><th>Status</th></tr></thead><tbody>
      ${filtered.map((u) => `<tr><td style="font-weight:600; color:#0f3d3e;">${u.id}</td><td style="font-weight:600;">${u.full_name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td><td>${u.email}</td><td>${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td><td style="font-family:monospace;">${(u.phone || "—").replace(/&/g, "&amp;")}</td><td style="font-weight:700; color:${u.is_active ? "#006e6e" : "#93000a"};">${u.is_active ? "● Active" : "● Blocked"}</td></tr>`).join("")}
      ${filtered.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:20px; color:#6e7979;">No records</td></tr>` : ""}
  </tbody></table>
  <div class="footer"><span>StayLeb Hospitality • Decree 4123 • stayleb.com</span><span>Page 1 • ${fileName}</span></div>
</body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    doDownload(blob, fileName);
    showToast(`✓ Exported ${filtered.length} records (Excel)`);
  }

  function exportCSV() {
    const now = new Date();
    const fileName = `StayLeb_Users_Registry_${now.toISOString().slice(0, 10)}.csv`;
    const header = ["StayLeb User Registry", `Generated ${now.toLocaleString()}`, `Filter: ${filter}${search ? ` Search:${search}` : ""}`, `Records: ${filtered.length}/${total}`].join(" | ");
    const cols = ["ID", "Full Name", "Email Address", "Role", "Phone", "Status", "ID Label"];
    const rows = [header, "", cols.join(","), ...filtered.map((u) => [String(u.id), `"${u.full_name.replaceAll('"', '""')}"`, u.email, u.role, `"${(u.phone || "").replaceAll('"', '""')}"`, u.is_active ? "Active" : "Blocked", `ID:${u.id}`].join(","))];
    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    doDownload(blob, fileName);
    showToast(`✓ Exported ${filtered.length} records (CSV)`);
  }

  function exportPDF() {
    const now = new Date();
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = filtered
      .map(
        (u) => `<tr><td style="padding:8px; border:1px solid #bec9c8;">${u.id}</td><td style="padding:8px; border:1px solid #bec9c8; font-weight:600;">${u.full_name}</td><td style="padding:8px; border:1px solid #bec9c8;">${u.email}</td><td style="padding:8px; border:1px solid #bec9c8; text-transform:capitalize;">${u.role}</td><td style="padding:8px; border:1px solid #bec9c8; font-family:monospace;">${u.phone || "—"}</td><td style="padding:8px; border:1px solid #bec9c8; color:${u.is_active ? "#006e6e" : "#93000a"}; font-weight:700;">${u.is_active ? "Active" : "Blocked"}</td></tr>`
      )
      .join("");
    win.document.write(`
<html><head><title>StayLeb User Registry</title><style>
  body{font-family:Inter, Arial, sans-serif; color:#111c2d; padding:24px;}
  h1{color:#0f3d3e; font-size:20px; margin:0 0 4px 0;}
  .meta{font-size:11px; color:#3e4949; background:#f0f3ff; padding:8px 12px; border-radius:6px; margin:8px 0 16px 0;}
  table{border-collapse:collapse; width:100%; font-size:11px;}
  th{background:#0f3d3e; color:white; padding:10px 8px; text-align:left;}
  td{border:1px solid #bec9c8; padding:8px;}
  @media print{ button{display:none} }
</style></head><body>
  <h1>StayLeb — User Registry</h1>
  <div style="font-size:10px; color:#2f8d8e; letter-spacing:2px; text-transform:uppercase; font-weight:700;">Confidential • ${now.toLocaleDateString()}</div>
  <div class="meta">Filter: ${filter} ${search ? `• Search: "${search}"` : ""} • Records: ${filtered.length}/${total}</div>
  <table><thead><tr><th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
  <p style="font-size:9px; color:#6e7979; margin-top:16px; text-align:center; border-top:1px solid #bec9c8; padding-top:8px;">StayLeb Hospitality • ${now.toISOString().slice(0, 10)} • stayleb.com — Confidential</p>
  <button onclick="window.print()" style="margin-top:16px; background:#0f3d3e; color:white; border:none; padding:10px 18px; border-radius:8px; cursor:pointer;">Print / Save as PDF</button>
</body></html>`);
    win.document.close();
    // win.print will be triggered by button, also show toast in opener
    showToast(`Opened print preview for ${filtered.length} records (PDF)`);
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
              <div className="flex flex-col gap-space-xxs">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#157375] mb-space-xxs">
                  <span>Administration</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-semibold">Users Management</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#157375] tracking-tight">User Accounts & Access Management</h1>
                <p className="font-body-md text-body-md text-[#157375] max-w-2xl">
                  Inspect client travelers and property owners across Lebanon. Enforce administrative access controls and observe operational status.
                </p>
              </div>
              <div className="flex items-center gap-space-sm flex-shrink-0 relative">
                <button
                  type="button"
                  onClick={() => setExportOpen((v) => !v)}
                  className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-white hover:bg-[#0a2e2f] transition-colors font-label-md text-label-md shadow-sm"
                >
                  <Icon name="download" className="material-symbols-outlined text-[18px] text-white" />
                  <span>Export Registry</span>
                  <Icon name={exportOpen ? "expand_less" : "expand_more"} className="material-symbols-outlined text-[16px] text-white/80" />
                </button>
                {exportOpen && (
                  <>
                    <button className="fixed inset-0 z-10" aria-label="Close export menu" onClick={() => setExportOpen(false)} tabIndex={-1} />
                  <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20">
                    <p className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-slate-400">Choose format</p>
                    <button type="button" onClick={exportExcel} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors disabled:opacity-50">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center"><Icon name="table_view" className="material-symbols-outlined text-[18px]" /></span>
                      <span className="flex flex-col"><strong className="text-sm text-[#157375]">Excel</strong><span className="text-xs text-[#157375]">Styled .xls • Branded</span></span>
                    </button>
                    <button type="button" onClick={exportCSV} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors disabled:opacity-50">
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Icon name="description" className="material-symbols-outlined text-[18px]" /></span>
                      <span className="flex flex-col"><strong className="text-sm text-[#157375]">CSV</strong><span className="text-xs text-[#157375]">Raw .csv • For Sheets</span></span>
                    </button>
                    <button type="button" onClick={exportPDF} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors disabled:opacity-50">
                      <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 grid place-items-center"><Icon name="picture_as_pdf" className="material-symbols-outlined text-[18px]" /></span>
                      <span className="flex flex-col"><strong className="text-sm text-[#157375]">PDF</strong><span className="text-xs text-[#157375]">Print preview • Save as PDF</span></span>
                    </button>
                    <p className="px-3 pt-2 text-[10px] text-slate-400">Single download per click • {filtered.length} records</p>
                  </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-[#157375] uppercase tracking-wider font-semibold">Total Accounts</span>
                  <span className="font-headline-md text-headline-md text-[#157375] mt-space-xxs">{loading ? "…" : total}</span>
                  <span className="font-caption text-caption text-primary font-medium mt-1">Live Lebanese Network</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <Icon name="group" className="material-symbols-outlined text-[24px]" />
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-[#157375] uppercase tracking-wider font-semibold">Client Travelers</span>
                  <span className="font-headline-md text-headline-md text-[#157375] mt-space-xxs">{loading ? "…" : clients}</span>
                  <span className="font-caption text-caption text-[#157375] mt-1">{total ? `${Math.round((clients / total) * 100)}% tenant volume` : ""}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <Icon name="travel_explore" className="material-symbols-outlined text-[24px]" />
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-[#157375] uppercase tracking-wider font-semibold">Property Owners</span>
                  <span className="font-headline-md text-headline-md text-[#157375] mt-space-xxs">{loading ? "…" : owners}</span>
                  <span className="font-caption text-caption text-[#157375] mt-1">Chalet & Villa hosts</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
                  <Icon name="villa" className="material-symbols-outlined text-[24px]" />
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-[#157375] uppercase tracking-wider font-semibold">Suspended / Blocked</span>
                  <span className="font-headline-md text-headline-md text-error mt-space-xxs">{loading ? "…" : blocked}</span>
                  <span className="font-caption text-caption text-error font-medium mt-1">Restricted administrative state</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container">
                  <Icon name="block" className="material-symbols-outlined text-[24px]" />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-space-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-container-lowest">
                <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                  {[
                    ["all", `All Users ${total}`],
                    ["client", `Clients ${clients}`],
                    ["owner", `Owners ${owners}`],
                    ["active", `Active ${total - blocked}`],
                    ["blocked", `Blocked ${blocked}`],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as typeof filter)}
                      className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 whitespace-nowrap ${filter === key ? "bg-primary-container text-on-primary font-medium shadow-sm" : "text-[#157375] hover:bg-surface-container"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-space-sm">
                  <div className="relative w-full sm:w-80">
                    <Icon name="search" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
                    <input
                      className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg font-body-md text-body-md text-[#157375] placeholder:text-outline focus:outline-none focus:bg-surface-container-highest transition-colors"
                      placeholder="Search by user name, email, or telephone (+961)..."
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                {error ? (
                  <div className="p-8 text-center text-error">{error}</div>
                ) : loading ? (
                  <div className="p-8 text-center text-[#157375]">Loading users…</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-[#157375]">No users match your search.</div>
                ) : (
                  <table className="w-full text-left font-body-md text-body-md border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-[#157375] font-label-sm text-label-sm uppercase tracking-wider">
                        <th className="py-3 px-space-md">User Account</th>
                        <th className="py-3 px-space-md">Email Address</th>
                        <th className="py-3 px-space-md">Role</th>
                        <th className="py-3 px-space-md">Telephone</th>
                        <th className="py-3 px-space-md">Status</th>
                        <th className="py-3 px-space-md text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {filtered.map((u) => (
                        <tr key={u.id} className={`hover:bg-surface-container-low/60 transition-colors ${!u.is_active ? "bg-error-container/20" : ""}`}>
                          <td className="py-3 px-space-md">
                            <div className="flex items-center gap-space-sm">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md font-semibold ${u.role === "owner" ? "bg-surface-container-high text-primary" : u.role === "admin" ? "bg-primary text-white" : "bg-secondary-fixed-dim text-on-secondary-fixed"}`}>
                                {u.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-[#157375] font-semibold">{u.full_name}</span>
                                <span className="font-caption text-caption text-[#157375]">ID: {u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-space-md text-[#157375] font-mono text-label-sm">{u.email}</td>
                          <td className="py-3 px-space-md">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${u.role === "owner" ? "bg-surface-container-high text-primary" : u.role === "admin" ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-[#157375]"}`}>
                              <Icon name={u.role === "owner" ? "villa" : u.role === "admin" ? "shield" : "person"} className="material-symbols-outlined text-[14px]" />
                              <span className="capitalize">{u.role}</span>
                            </span>
                          </td>
                          <td className="py-3 px-space-md font-mono text-label-sm text-[#157375]">{u.phone || "—"}</td>
                          <td className="py-3 px-space-md">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${u.is_active ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-secondary" : "bg-error"}`} />
                              {u.is_active ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td className="py-3 px-space-md text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                onClick={() => setBlockTarget(u)}
                                disabled={busyId === u.id}
                                className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm font-medium transition-colors ${u.is_active ? "text-error hover:bg-error-container hover:text-on-error-container" : "text-primary hover:bg-surface-container-highest"}`}
                              >
                                {busyId === u.id ? "…" : u.is_active ? "Block Account" : "Unblock Account"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <div className="font-body-md text-body-md text-[#157375]">Showing {filtered.length} of {total} registered users</div>
              </div>
            </div>

            {blockTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
                <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-space-md">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center flex-shrink-0 text-on-error-container">
                      <Icon name="gavel" className="material-symbols-outlined text-[26px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-headline-sm text-headline-sm text-[#157375] tracking-tight">{blockTarget.is_active ? "Block User Account?" : "Unblock User Account?"}</h3>
                      <p className="font-body-md text-body-md text-[#157375] mt-1">
                        {blockTarget.is_active ? "Blocking" : "Unblocking"} <span className="font-semibold text-[#157375]">{blockTarget.full_name}</span> will {blockTarget.is_active ? "immediately restrict their ability to log in" : "restore their access"}. 
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-space-sm mt-space-xs">
                    <button onClick={() => setBlockTarget(null)} className="px-space-md py-2.5 rounded-lg bg-surface-container text-[#157375] hover:bg-surface-container-high transition-colors font-label-md text-label-md">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleBlock(blockTarget)}
                      disabled={busyId === blockTarget.id}
                      className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md shadow-sm font-semibold flex items-center gap-1.5 ${blockTarget.is_active ? "bg-error text-on-error hover:bg-on-error-container" : "bg-primary text-on-primary hover:bg-primary-container"}`}
                    >
                      <Icon name="lock" className="material-symbols-outlined text-[18px]" />
                      <span>{blockTarget.is_active ? "Confirm Block Account" : "Confirm Unblock"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {alertMsg && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4" onClick={() => setAlertMsg(null)}>
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                      <Icon name="error" className="material-symbols-outlined text-[28px]" />
                    </div>
                    <h3 className="font-display font-bold text-[17px] text-[#0f3d3e]">Heads up</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{alertMsg}</p>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button onClick={() => setAlertMsg(null)} className="px-6 py-2.5 rounded-xl bg-[#0f3d3e] text-white hover:bg-[#0a2e2f] font-semibold min-w-[120px]">OK, got it</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
