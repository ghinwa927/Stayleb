"use client";
import { useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable } from "@/components/ui/Interactions";
import Swal from "sweetalert2";
import { getAdminSettlements, getAdminSettlementStats, settleAdminCommission, type AdminSettlement, type AdminSettlementStats } from "@/services/adminSettlements";
import { getAdminUsers } from "@/services/adminUsers";

function formatMoney(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

export function CashCommissionSettlementsSection0() {
  const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
  const [stats, setStats] = useState<AdminSettlementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ownerId, setOwnerId] = useState<string>("all");
  const [ownerOptions, setOwnerOptions] = useState<{ id: number; full_name: string; email: string }[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [settlingId, setSettlingId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load owner options (only Owner-role users) — increased limit to avoid truncation
  useEffect(() => {
    getAdminUsers({ role: "owner", page: 1, page_size: 200 })
      .then((res) => setOwnerOptions(res.items.map((u) => ({ id: u.id, full_name: u.full_name, email: u.email }))))
      .catch(() => setOwnerOptions([]));
  }, []);

  // Validate date range
  useEffect(() => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("From date cannot be after To date.");
    } else {
      setDateError(null);
    }
  }, [fromDate, toDate]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await getAdminSettlementStats();
      setStats(s);
    } catch (e) {
      // keep stats null, show error in cards
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSettlements = useCallback(async () => {
    if (dateError) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminSettlements({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
        owner_id: ownerId !== "all" ? Number(ownerId) : undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page,
        page_size: pageSize,
      });
      setSettlements(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settlements");
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, ownerId, fromDate, toDate, dateError, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, ownerId, fromDate, toDate]);

  async function handleSettle(settlement: AdminSettlement) {
    const res = await Swal.fire({
      title: "Confirm commission settlement",
      html: `<div style="text-align:left;font-size:13px;line-height:1.6;color:#46B1B1">
        <p style="font-weight:600;color:#46B1B1;margin-bottom:8px">Confirm that StayLeb has received this commission from the owner.</p>
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px;margin:8px 0">
          <div style="display:flex;justify-content:space-between"><span>Settlement ID</span><strong>#${settlement.id}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Booking ID</span><strong>#SL-${String(settlement.booking_id).padStart(4,"0")}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Owner</span><strong>${settlement.owner.full_name} (${settlement.owner.email})</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Property</span><strong>${settlement.property.title} · ${settlement.property.location}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Commission</span><strong>${formatMoney(settlement.commission_amount)}</strong></div>
        </div>
        <p style="font-size:12px;color:#64748B;margin-top:8px">This will mark the settlement as <strong>paid</strong> and set <em>paid_at</em>. This action cannot be undone.</p>
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Settlement",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#157375",
      customClass: { popup: "rounded-2xl" },
    });
    if (!res.isConfirmed) return;
    setSettlingId(settlement.id);
    try {
      await settleAdminCommission(settlement.id);
      await Swal.fire({ title: "Settlement confirmed", text: `Commission for booking #SL-${String(settlement.booking_id).padStart(4,"0")} marked as settled.`, icon: "success", confirmButtonColor: "#157375" });
      // Refresh list and stats
      await Promise.all([fetchSettlements(), fetchStats()]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to settle";
      await Swal.fire({ title: "Failed", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setSettlingId(null);
    }
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="relative w-full overflow-hidden">
              <div className="absolute -top-24 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-48 left-1/3 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#46B1B1] mb-space-xxs">
                    <span className="hover:text-primary transition-colors cursor-pointer">Administration</span>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px] text-outline" />
                    <span className="text-primary font-semibold">Cash Settlements</span>
                  </div>
                  <div className="flex items-center gap-space-sm mt-space-xxs">
                    <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Cash Commission Settlements Ledger</h1>
                    <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-caption text-caption font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Cash on Arrival
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-[#46B1B1] mt-1 max-w-3xl">
                    Track and reconcile platform commissions owed by property owners for approved Cash on Arrival reservations. Reconcile offline Lebanese cash collections into ledger state.
                  </p>
                </div>
                <div className="flex items-center gap-space-xs self-start md:self-auto">
                  <button
                    onClick={async () => {
                      if (settlements.length === 0) {
                        Swal.fire({ title: "No data", text: "No settlements to export", icon: "info", confirmButtonColor: "#157375" });
                        return;
                      }
                      const header = "Settlement ID,Booking ID,Owner,Email,Property,Location,Commission,Status,Paid At,Created At\n";
                      const rows = settlements.map((s) => `${s.id},${s.booking_id},"${s.owner.full_name}","${s.owner.email}","${s.property.title}","${s.property.location}",${s.commission_amount},${s.status},${s.paid_at || ""},${s.created_at}`).join("\n");
                      const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `settlements_${new Date().toISOString().slice(0,10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest text-[#46B1B1] font-label-md text-label-md shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <Icon name="download" className="material-symbols-outlined text-[18px] text-primary" />
                    <span>Export Ledger CSV</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter-lg mb-space-xl">
                <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Total Outstanding</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        {statsLoading ? (
                          <span className="font-headline-lg text-headline-lg text-[#46B1B1]">…</span>
                        ) : stats ? (
                          <span className="font-headline-lg text-headline-lg text-[#46B1B1] font-bold">{formatMoney(stats.outstanding_commission)}</span>
                        ) : (
                          <span className="font-label-sm text-rose-600">Unavailable</span>
                        )}
                        <span className="font-caption text-caption text-[#46B1B1] uppercase font-semibold">USD</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-sm">
                      <Icon name="pending_actions" className="material-symbols-outlined text-[24px]" />
                    </div>
                  </div>
                  <div className="mt-space-md pt-space-xs flex items-center gap-space-xs">
                    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="font-label-sm text-label-sm font-semibold text-tertiary">{stats ? `${stats.unpaid_count} Bookings` : "—"}</span>
                    <span className="font-body-md text-caption text-[#46B1B1]">awaiting host settlement</span>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Settled Total</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        {statsLoading ? (
                          <span className="font-headline-lg text-headline-lg text-primary">…</span>
                        ) : stats ? (
                          <span className="font-headline-lg text-headline-lg text-primary font-bold">{formatMoney(stats.settled_commission)}</span>
                        ) : (
                          <span className="font-label-sm text-rose-600">Unavailable</span>
                        )}
                        <span className="font-caption text-caption text-[#46B1B1] uppercase font-semibold">USD</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm">
                      <Icon name="task_alt" className="material-symbols-outlined text-[24px]" />
                    </div>
                  </div>
                  <div className="mt-space-md pt-space-xs flex items-center gap-space-xs">
                    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-label-sm text-label-sm font-semibold text-primary">{stats ? `${stats.paid_count} Bookings` : "—"}</span>
                    <span className="font-body-md text-caption text-[#46B1B1]">settled</span>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Total Settlements</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        {statsLoading ? (
                          <span className="font-headline-lg text-headline-lg text-[#46B1B1]">…</span>
                        ) : stats ? (
                          <span className="font-headline-lg text-headline-lg text-[#46B1B1] font-bold">{stats.total_settlements}</span>
                        ) : (
                          <span className="font-label-sm text-rose-600">Live data</span>
                        )}
                        <span className="font-caption text-caption text-[#46B1B1] font-semibold">Records</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center text-[#46B1B1] shadow-sm">
                      <Icon name="receipt_long" className="material-symbols-outlined text-[24px]" />
                    </div>
                  </div>
                  <div className="mt-space-md pt-space-xs flex items-center gap-space-xs text-xs text-[#46B1B1]">
                    <span>Unpaid: {stats?.unpaid_count ?? "—"} · Paid: {stats?.paid_count ?? "—"}</span>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Average Commission</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        {statsLoading ? (
                          <span className="font-headline-lg text-headline-lg text-[#46B1B1]">…</span>
                        ) : stats && stats.total_settlements > 0 ? (
                          <span className="font-headline-lg text-headline-lg text-[#46B1B1] font-bold">{formatMoney((Number(stats.outstanding_commission) + Number(stats.settled_commission)) / stats.total_settlements)}</span>
                        ) : (
                          <span className="font-label-sm text-[#46B1B1]/70">—</span>
                        )}
                        <span className="font-caption text-caption text-[#46B1B1] uppercase font-semibold">USD</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                      <Icon name="bar_chart" className="material-symbols-outlined text-[24px]" />
                    </div>
                  </div>
                  <div className="mt-space-md pt-space-xs flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-caption text-caption text-[#46B1B1]">Per settled booking</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                    <Icon name="info" className="material-symbols-outlined text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-[#46B1B1]">Cash on Arrival Settlement Protocol</span>
                    <span className="font-body-md text-caption text-[#46B1B1]">Lebanon local transactions are settled in USD banknotes or certified OMT/Whish agent clearance. No credit card debits apply.</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs self-stretch md:self-auto justify-end">
                  <span className="font-caption text-caption font-semibold text-[#46B1B1] ml-1">Live data</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${statusFilter === "all" ? "bg-surface-container-lowest shadow-sm text-[#46B1B1]" : "text-[#46B1B1]/70 hover:text-[#46B1B1]"}`}
                    >
                      All {stats ? `(${stats.total_settlements})` : ""}
                    </button>
                    <button
                      onClick={() => setStatusFilter("unpaid")}
                      className={`px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === "unpaid" ? "bg-surface-container-lowest shadow-sm text-[#46B1B1]" : "text-[#46B1B1]/70 hover:text-[#46B1B1]"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Unpaid {stats ? `(${stats.unpaid_count})` : ""}
                    </button>
                    <button
                      onClick={() => setStatusFilter("paid")}
                      className={`px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === "paid" ? "bg-surface-container-lowest shadow-sm text-[#46B1B1]" : "text-[#46B1B1]/70 hover:text-[#46B1B1]"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Paid {stats ? `(${stats.paid_count})` : ""}
                    </button>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                  <div className="flex items-center gap-2 text-xs text-[#46B1B1]/70">
                    <span>{total} settlements</span>
                    <span>•</span>
                    <span>Page {page} of {totalPages || 1}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Search</label>
                    <div className="relative mt-1">
                      <Icon name="search" className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-outline" />
                      <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Owner, email, property, settlement or booking ID"
                        className="w-full h-11 pl-10 pr-space-md bg-surface-container-low rounded-xl font-body-md text-body-md text-[#46B1B1] placeholder:text-outline outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Owner</label>
                    <select
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      className="w-full mt-1 h-11 px-3 rounded-xl border bg-white text-sm text-[#46B1B1] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="all">All Owners</option>
                      {ownerOptions.map((o) => (
                        <option key={o.id} value={String(o.id)}>
                          {o.full_name} — {o.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full mt-1 h-11 px-3 rounded-xl border bg-white text-sm text-[#46B1B1] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full mt-1 h-11 px-3 rounded-xl border bg-white text-sm text-[#46B1B1] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearch("");
                        setStatusFilter("all");
                        setOwnerId("all");
                        setFromDate("");
                        setToDate("");
                      }}
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-[#46B1B1] text-sm font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
                {dateError && <div className="text-xs bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg">{dateError}</div>}
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl">
                {loading ? (
                  <div className="p-12 flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#46B1B1]">Loading settlements…</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <Icon name="error" className="material-symbols-outlined text-rose-400 text-[28px] mb-2" />
                    <p className="text-sm text-rose-600">{error}</p>
                    <button onClick={() => { fetchSettlements(); fetchStats(); }} className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm">Retry</button>
                  </div>
                ) : settlements.length === 0 ? (
                  <div className="p-12 text-center">
                    <Icon name="inbox" className="material-symbols-outlined text-[#46B1B1]/60 text-[32px] mb-2" />
                    <h3 className="font-semibold text-[#46B1B1]">
                      {search || ownerId !== "all" || fromDate || toDate
                        ? "No commission settlements match the selected filters."
                        : statusFilter === "unpaid"
                        ? "No outstanding cash commissions."
                        : statusFilter === "paid"
                        ? "No settled cash commissions."
                        : "No cash commission settlements found."}
                    </h3>
                    <p className="text-sm text-[#46B1B1]/70 mt-1">
                      {search || ownerId !== "all" || fromDate || toDate
                        ? "Try adjusting your filters or clearing them to see more results."
                        : "Settlements appear after an Owner confirms cash received (payment → paid)."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider select-none">
                          <th className="py-space-md px-space-md">Settlement ID</th>
                          <th className="py-space-md px-space-md">Booking ID</th>
                          <th className="py-space-md px-space-md">Owner</th>
                          <th className="py-space-md px-space-md">Property</th>
                          <th className="py-space-md px-space-md text-right">Commission</th>
                          <th className="py-space-md px-space-md text-center">Status</th>
                          <th className="py-space-md px-space-md">Created</th>
                          <th className="py-space-md px-space-md">Settled</th>
                          <th className="py-space-md px-space-md text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md text-[#46B1B1]">
                        {settlements.map((s) => (
                          <tr key={s.id} className="border-t border-slate-100 hover:bg-surface-container-low/40">
                            <td className="py-space-md px-space-md font-mono text-sm font-semibold text-primary">#{s.id}</td>
                            <td className="py-space-md px-space-md font-mono text-sm font-semibold text-[#46B1B1]">#SL-{String(s.booking_id).padStart(4, "0")}</td>
                            <td className="py-space-md px-space-md">
                              <div className="font-medium text-sm">{s.owner.full_name}</div>
                              <div className="text-xs text-[#46B1B1]/70 truncate max-w-[180px]">{s.owner.email}</div>
                              {s.owner.phone && <div className="text-xs text-[#46B1B1]/50">{s.owner.phone}</div>}
                            </td>
                            <td className="py-space-md px-space-md">
                              <div className="font-medium text-sm">{s.property.title}</div>
                              <div className="text-xs text-[#46B1B1]/70">{s.property.location}</div>
                            </td>
                            <td className="py-space-md px-space-md text-right font-bold text-[#46B1B1]">{formatMoney(s.commission_amount)}</td>
                            <td className="py-space-md px-space-md text-center">
                              {s.status === "unpaid" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">Outstanding</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">Settled</span>
                              )}
                            </td>
                            <td className="py-space-md px-space-md text-xs">{formatDate(s.created_at)}</td>
                            <td className="py-space-md px-space-md text-xs">{s.paid_at ? formatDate(s.paid_at) : "—"}</td>
                            <td className="py-space-md px-space-md text-right">
                              {s.status === "unpaid" ? (
                                <button
                                  onClick={() => handleSettle(s)}
                                  disabled={settlingId === s.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-[#0f5a5b] text-xs font-semibold shadow-sm disabled:opacity-50"
                                >
                                  {settlingId === s.id ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="verified" className="material-symbols-outlined text-[14px]" />}
                                  Mark as Settled
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">Settled {s.paid_at ? formatDate(s.paid_at) : ""}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-surface-container-low px-space-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                  <div className="font-caption text-caption text-[#46B1B1]">
                    Showing <span className="font-semibold">{settlements.length}</span> of <span className="font-semibold">{total}</span> settlements · Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages || 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`h-9 px-3 rounded-lg border text-sm ${page <= 1 ? "bg-slate-100 text-[#46B1B1]/60 cursor-not-allowed" : "bg-white hover:bg-slate-50 text-[#46B1B1]"}`}>
                      Previous
                    </button>
                    <span className="text-xs text-[#46B1B1]">Page {page} / {totalPages || 1}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={`h-9 px-3 rounded-lg border text-sm ${page >= totalPages ? "bg-slate-100 text-[#46B1B1]/60 cursor-not-allowed" : "bg-white hover:bg-slate-50 text-[#46B1B1]"}`}>
                      Next
                    </button>
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
