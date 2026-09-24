"use client";
import { useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";
import { getAdminUsers, blockAdminUser, unblockAdminUser, type AdminUser } from "@/services/adminUsers";

type Props = {
  lockedRole?: "owner" | "client" | "admin";
};

export function UsersManagementSection0({ lockedRole }: Props) {
  const isOwnerView = lockedRole === "owner";
  const [items, setItems] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "owner" | "admin">(lockedRole ?? "all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page when filters/search/sort/date change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, sort, search, createdFrom, createdTo]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number | boolean> = {};
      const effectiveRole = isOwnerView ? "owner" : roleFilter !== "all" ? roleFilter : undefined;
      if (effectiveRole) (params as any).role = effectiveRole;
      if (statusFilter !== "all") (params as any).is_active = statusFilter === "active";
      if (search) (params as any).search = search;
      if (sort) (params as any).sort = sort;
      if (createdFrom) (params as any).created_from = createdFrom;
      if (createdTo) (params as any).created_to = createdTo;
      (params as any).page = page;
      (params as any).page_size = pageSize;
      const res = await getAdminUsers(params as any);
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [isOwnerView, roleFilter, statusFilter, search, sort, createdFrom, createdTo, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBlock(u: AdminUser) {
    setBusyId(u.id);
    try {
      if (u.is_active) await blockAdminUser(u.id);
      else await unblockAdminUser(u.id);
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
    const fileName = isOwnerView ? `StayLeb_Owners_Registry_${now.toISOString().slice(0, 10)}.xls` : `StayLeb_Users_Registry_${now.toISOString().slice(0, 10)}.xls`;
    const roleLabel = isOwnerView ? "Owners" : roleFilter === "all" ? "All Users" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1);
    const statusLabel = statusFilter === "all" ? "" : ` • ${statusFilter}`;
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
</style></head>
<body>
  <div class="header">
    <div class="brand">StayLeb <span style="font-weight:400; color:#3a9a9e;">— Lebanon Stays</span></div>
    <div class="subtitle">${isOwnerView ? "Owners Registry" : "User Registry"} • Confidential</div>
    <div class="meta"><strong>Generated:</strong> ${dateStr} at ${timeStr} &nbsp;|&nbsp; <strong>Filter:</strong> ${roleLabel}${statusLabel}${searchNote} &nbsp;|&nbsp; <strong>Records:</strong> ${items.length} of ${total} (page ${page}/${totalPages || 1})</div>
  </div>
  <table><thead><tr><th>ID</th><th>Full Name</th><th>Email Address</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead><tbody>
      ${items.map((u) => `<tr><td style="font-weight:600; color:#0f3d3e;">${u.id}</td><td style="font-weight:600;">${u.full_name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td><td>${u.email}</td><td>${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td><td style="font-family:monospace;">${(u.phone || "—").replace(/&/g, "&amp;")}</td><td style="font-weight:700; color:${u.is_active ? "#006e6e" : "#93000a"};">${u.is_active ? "● Active" : "● Blocked"}</td><td>${u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td></tr>`).join("")}
      ${items.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding:20px; color:#6e7979;">No records</td></tr>` : ""}
  </tbody></table>
  <div class="footer"><span>StayLeb Hospitality • Decree 4123 • stayleb.com</span><span>Page ${page} • ${fileName}</span></div>
</body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    doDownload(blob, fileName);
    showToast(`✓ Exported ${items.length} records (Excel)`);
  }

  function exportCSV() {
    const now = new Date();
    const fileName = isOwnerView ? `StayLeb_Owners_Registry_${now.toISOString().slice(0, 10)}.csv` : `StayLeb_Users_Registry_${now.toISOString().slice(0, 10)}.csv`;
    const header = ["StayLeb " + (isOwnerView ? "Owners" : "User") + " Registry", `Generated ${now.toLocaleString()}`, `Filter: ${isOwnerView ? "owner" : roleFilter} ${statusFilter !== "all" ? statusFilter : ""}${search ? ` Search:${search}` : ""}`, `Page: ${page}/${totalPages || 1} Records: ${items.length}/${total}`].join(" | ");
    const cols = ["ID", "Full Name", "Email Address", "Role", "Phone", "Status", "Joined"];
    const rows = [header, "", cols.join(","), ...items.map((u) => [String(u.id), `"${u.full_name.replaceAll('"', '""')}"`, u.email, u.role, `"${(u.phone || "").replaceAll('"', '""')}"`, u.is_active ? "Active" : "Blocked", u.created_at ? new Date(u.created_at).toLocaleDateString() : ""].join(","))];
    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    doDownload(blob, fileName);
    showToast(`✓ Exported ${items.length} records (CSV)`);
  }

  function exportPDF() {
    const now = new Date();
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = items
      .map(
        (u) => `<tr><td style="padding:8px; border:1px solid #bec9c8;">${u.id}</td><td style="padding:8px; border:1px solid #bec9c8; font-weight:600;">${u.full_name}</td><td style="padding:8px; border:1px solid #bec9c8;">${u.email}</td><td style="padding:8px; border:1px solid #bec9c8; text-transform:capitalize;">${u.role}</td><td style="padding:8px; border:1px solid #bec9c8; font-family:monospace;">${u.phone || "—"}</td><td style="padding:8px; border:1px solid #bec9c8; color:${u.is_active ? "#006e6e" : "#93000a"}; font-weight:700;">${u.is_active ? "Active" : "Blocked"}</td><td style="padding:8px; border:1px solid #bec9c8;">${u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td></tr>`
      )
      .join("");
    win.document.write(`
<html><head><title>StayLeb ${isOwnerView ? "Owners" : "User"} Registry</title><style>
  body{font-family:Inter, Arial, sans-serif; color:#111c2d; padding:24px;}
  h1{color:#0f3d3e; font-size:20px; margin:0 0 4px 0;}
  .meta{font-size:11px; color:#3e4949; background:#f0f3ff; padding:8px 12px; border-radius:6px; margin:8px 0 16px 0;}
  table{border-collapse:collapse; width:100%; font-size:11px;}
  th{background:#0f3d3e; color:white; padding:10px 8px; text-align:left;}
  td{border:1px solid #bec9c8; padding:8px;}
  @media print{ button{display:none} }
</style></head><body>
  <h1>StayLeb — ${isOwnerView ? "Owners" : "User"} Registry</h1>
  <div style="font-size:10px; color:#2f8d8e; letter-spacing:2px; text-transform:uppercase; font-weight:700;">Confidential • ${now.toLocaleDateString()}</div>
  <div class="meta">Filter: ${isOwnerView ? "owner" : roleFilter} ${statusFilter !== "all" ? `• ${statusFilter}` : ""} ${search ? `• Search: "${search}"` : ""} • Page ${page}/${totalPages || 1} • Records: ${items.length}/${total}</div>
  <table><thead><tr><th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead><tbody>${rows}</tbody></table>
  <p style="font-size:9px; color:#6e7979; margin-top:16px; text-align:center; border-top:1px solid #bec9c8; padding-top:8px;">StayLeb Hospitality • ${now.toISOString().slice(0, 10)} • stayleb.com — Confidential</p>
  <button onclick="window.print()" style="margin-top:16px; background:#0f3d3e; color:white; border:none; padding:10px 18px; border-radius:8px; cursor:pointer;">Print / Save as PDF</button>
</body></html>`);
    win.document.close();
    showToast(`Opened print preview for ${items.length} records (PDF)`);
  }

  const title = isOwnerView ? "Property Owners Registry" : "User Accounts & Access Management";
  const subtitle = isOwnerView ? "Inspect and manage property owners across Lebanon. Enforce access controls and verify owner standing." : "Inspect client travelers and property owners across Lebanon. Enforce administrative access controls and observe operational status.";
  const breadcrumb = isOwnerView ? "Owners" : "Users Management";

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
              <div className="flex flex-col gap-space-xxs">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#46B1B1] mb-space-xxs">
                  <span>Administration</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-semibold">{breadcrumb}</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">{title}</h1>
                <p className="font-body-md text-body-md text-[#46B1B1] max-w-2xl">{subtitle}</p>
              </div>
              <div className="flex items-center gap-space-sm flex-shrink-0 relative">
                <button
                  type="button"
                  onClick={() => setExportOpen((v) => !v)}
                  className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-label-md text-label-md shadow-sm"
                >
                  <Icon name="download" className="material-symbols-outlined text-[18px] text-white" />
                  <span>Export Registry</span>
                  <Icon name={exportOpen ? "expand_less" : "expand_more"} className="material-symbols-outlined text-[16px] text-white/80" />
                </button>
                {exportOpen && (
                  <>
                    <button className="fixed inset-0 z-10" aria-label="Close export menu" onClick={() => setExportOpen(false)} tabIndex={-1} />
                    <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20">
                      <p className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-[#46B1B1]/60">Choose format</p>
                      <button type="button" onClick={exportExcel} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors disabled:opacity-50">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center"><Icon name="table_view" className="material-symbols-outlined text-[18px]" /></span>
                        <span className="flex flex-col"><strong className="text-sm text-[#46B1B1]">Excel</strong><span className="text-xs text-[#46B1B1]">Styled .xls • Branded</span></span>
                      </button>
                      <button type="button" onClick={exportCSV} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors disabled:opacity-50">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Icon name="description" className="material-symbols-outlined text-[18px]" /></span>
                        <span className="flex flex-col"><strong className="text-sm text-[#46B1B1]">CSV</strong><span className="text-xs text-[#46B1B1]">Raw .csv • For Sheets</span></span>
                      </button>
                      <button type="button" onClick={exportPDF} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low text-left transition-colors disabled:opacity-50">
                        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 grid place-items-center"><Icon name="picture_as_pdf" className="material-symbols-outlined text-[18px]" /></span>
                        <span className="flex flex-col"><strong className="text-sm text-[#46B1B1]">PDF</strong><span className="text-xs text-[#46B1B1]">Print preview • Save as PDF</span></span>
                      </button>
                      <p className="px-3 pt-2 text-[10px] text-[#46B1B1]/60">Single download per click • {items.length} of {total} records • Page {page}/{totalPages || 1}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-space-md flex flex-col gap-space-sm">
                <div className="flex flex-col lg:flex-row gap-space-sm">
                  <div className="flex flex-col sm:flex-row gap-space-sm flex-1">
                    <div className="relative flex-1">
                      <Icon name="search" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-lg font-body-md text-body-md text-[#46B1B1] placeholder:text-outline focus:outline-none focus:bg-surface-container-highest transition-colors"
                        placeholder={isOwnerView ? "Search owners by name, email, or phone…" : "Search by user name, email, or phone…"}
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                    <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-[42px] px-3 rounded-lg border bg-white text-sm text-[#46B1B1] min-w-[160px]">
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="name_asc">Name A → Z</option>
                      <option value="name_desc">Name Z → A</option>
                    </select>
                  </div>
                  <div className="flex gap-space-sm">
                    <input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} className="h-[42px] px-3 rounded-lg border bg-white text-sm text-[#46B1B1]" placeholder="From" />
                    <input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} className="h-[42px] px-3 rounded-lg border bg-white text-sm text-[#46B1B1]" placeholder="To" />
                    {(search || createdFrom || createdTo || roleFilter !== "all" || statusFilter !== "all" || sort !== "newest") && (
                      <button onClick={() => { setSearchInput(""); setSearch(""); setCreatedFrom(""); setCreatedTo(""); setRoleFilter(isOwnerView ? "owner" as any : "all"); setStatusFilter("all"); setSort("newest"); }} className="h-[42px] px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-[#46B1B1] text-sm">Clear</button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isOwnerView && (
                    <div className="flex items-center gap-1 bg-surface-container-low rounded-full p-1">
                      {(["all", "client", "owner", "admin"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRoleFilter(r as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${roleFilter === r ? "bg-primary text-white shadow-sm" : "text-[#46B1B1] hover:bg-white"}`}
                        >
                          {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 bg-surface-container-low rounded-full p-1">
                    {(["all", "active", "blocked"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === s ? "bg-primary text-white shadow-sm" : "text-[#46B1B1] hover:bg-white"}`}
                      >
                        {s === "all" ? "All Status" : s === "active" ? "Active" : "Blocked"}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[#46B1B1]/70 ml-2">{loading ? "Loading…" : `${total} ${isOwnerView ? "owners" : "users"} found`}</span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                {error ? (
                  <div className="p-8 text-center text-error">{error}</div>
                ) : loading ? (
                  <div className="p-8 text-center text-[#46B1B1]">Loading {isOwnerView ? "owners" : "users"}…</div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center text-[#46B1B1]">{isOwnerView ? "No owners found." : "No users found."} {search || createdFrom || createdTo ? "No users match your filters." : ""}</div>
                ) : (
                  <table className="w-full text-left font-body-md text-body-md border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-[#46B1B1] font-label-sm text-label-sm uppercase tracking-wider">
                        <th className="py-3 px-space-md">User Account</th>
                        <th className="py-3 px-space-md">Email Address</th>
                        <th className="py-3 px-space-md">Role</th>
                        <th className="py-3 px-space-md">Telephone</th>
                        <th className="py-3 px-space-md">Joined</th>
                        <th className="py-3 px-space-md">Status</th>
                        <th className="py-3 px-space-md text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {items.map((u) => (
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
                                <span className="font-label-md text-label-md text-[#46B1B1] font-semibold">{u.full_name}</span>
                                <span className="font-caption text-caption text-[#46B1B1]">ID: {u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-space-md text-[#46B1B1] font-mono text-label-sm">{u.email}</td>
                          <td className="py-3 px-space-md">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${u.role === "owner" ? "bg-surface-container-high text-primary" : u.role === "admin" ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-[#46B1B1]"}`}>
                              <Icon name={u.role === "owner" ? "villa" : u.role === "admin" ? "shield" : "person"} className="material-symbols-outlined text-[14px]" />
                              <span className="capitalize">{u.role}</span>
                            </span>
                          </td>
                          <td className="py-3 px-space-md font-mono text-label-sm text-[#46B1B1]">{u.phone || "—"}</td>
                          <td className="py-3 px-space-md text-label-sm text-[#46B1B1] whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
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
                <div className="font-body-md text-body-md text-[#46B1B1]">Showing {items.length} of {total} {isOwnerView ? "owners" : "users"} • Page {page} of {totalPages || 1}</div>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded-lg border text-sm ${page <= 1 ? "bg-slate-100 text-[#46B1B1]/40 cursor-not-allowed" : "bg-white hover:bg-slate-50 text-[#46B1B1]"}`}>
                    Previous
                  </button>
                  <span className="text-xs text-[#46B1B1]">Page {page} / {totalPages || 1}</span>
                  <button disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)} className={`px-3 py-1.5 rounded-lg border text-sm ${page >= totalPages ? "bg-slate-100 text-[#46B1B1]/40 cursor-not-allowed" : "bg-white hover:bg-slate-50 text-[#46B1B1]"}`}>
                    Next
                  </button>
                </div>
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
                      <h3 className="font-headline-sm text-headline-sm text-[#46B1B1] tracking-tight">{blockTarget.is_active ? "Block User Account?" : "Unblock User Account?"}</h3>
                      <p className="font-body-md text-body-md text-[#46B1B1] mt-1">
                        {blockTarget.is_active ? "Blocking" : "Unblocking"} <span className="font-semibold text-[#46B1B1]">{blockTarget.full_name}</span> will {blockTarget.is_active ? "immediately restrict their ability to log in" : "restore their access"}. 
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-space-sm mt-space-xs">
                    <button onClick={() => setBlockTarget(null)} className="px-space-md py-2.5 rounded-lg bg-surface-container text-[#46B1B1] hover:bg-surface-container-high transition-colors font-label-md text-label-md">
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
                    <h3 className="font-display font-bold text-[17px] text-[#46B1B1]">Heads up</h3>
                    <p className="text-sm text-[#46B1B1] mt-2 leading-relaxed">{alertMsg}</p>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button onClick={() => setAlertMsg(null)} className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold min-w-[120px]">OK, got it</button>
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
