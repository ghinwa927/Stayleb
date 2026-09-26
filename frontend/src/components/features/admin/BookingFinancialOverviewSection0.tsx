"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getAdminBookings, type AdminBooking, type AdminBookingFilters, getAdminBookingStats, type AdminBookingStats } from "@/services/adminBookings";
import { getAdminProperties } from "@/services/adminProperties";
import { getBooking } from "@/services/bookings";
import { getPaymentByBooking } from "@/services/payments";

function formatPrice(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function bookingBadge(s: string) {
  const v = s.toLowerCase();
  if (v === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (v === "confirmed") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (v === "cancelled") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (v === "rejected") return "bg-slate-100 text-[#46B1B1] border border-slate-200";
  if (v === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  return "bg-slate-100 text-[#46B1B1]";
}
function paymentBadge(method: string | undefined, status: string | undefined) {
  if (!method || !status) return { label: "No payment", cls: "bg-slate-100 text-[#46B1B1] border" };
  const m = method.toLowerCase();
  const s = status.toLowerCase();
  if (s === "paid") return { label: `${m} · Paid`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
  if (s === "pending") return { label: `${m} · Pending`, cls: "bg-amber-50 text-amber-700 border border-amber-200" };
  if (s === "failed") return { label: `${m} · Failed`, cls: "bg-rose-50 text-rose-700 border border-rose-200" };
  if (s === "refunded") return { label: `${m} · Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
  if (s === "partially_refunded") return { label: `${m} · Partially Refunded`, cls: "bg-amber-50 text-amber-700 border border-amber-200" };
  if (s === "cancelled") return { label: `${m} · Cancelled`, cls: "bg-slate-100 text-[#46B1B1] border" };
  return { label: `${m} · ${s}`, cls: "bg-slate-100 text-[#46B1B1] border" };
}

export function BookingFinancialOverviewSection0() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [bookingStatus, setBookingStatus] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Analytics (booking stats)
  const [analyticsStats, setAnalyticsStats] = useState<AdminBookingStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsFromDate, setAnalyticsFromDate] = useState("");
  const [analyticsToDate, setAnalyticsToDate] = useState("");
  const [analyticsPropertyId, setAnalyticsPropertyId] = useState<string>("");
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<"day" | "month" | "">("");
  const [analyticsDateError, setAnalyticsDateError] = useState<string | null>(null);
  const [propertyOptions, setPropertyOptions] = useState<{ id: number; title: string }[]>([]);

  // Detail modal
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [detailPaymentLoading, setDetailPaymentLoading] = useState(false);
  const [detailPayment, setDetailPayment] = useState<any>(null);

  async function fetchData(p: number, filters: AdminBookingFilters) {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminBookings({ ...filters, page: p, page_size: pageSize });
      setItems(res.items);
      setPage(res.page);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial and filter change
  useEffect(() => {
    const filters: AdminBookingFilters = {};
    if (bookingStatus) filters.booking_status = bookingStatus;
    if (paymentMethod) filters.payment_method = paymentMethod;
    if (paymentStatus) filters.payment_status = paymentStatus;
    if (search) filters.search = search;
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    fetchData(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingStatus, paymentMethod, paymentStatus, search, fromDate, toDate]);

  // Analytics property options — increased limit to avoid truncation
  useEffect(() => {
    getAdminProperties({ page: 1, page_size: 200 })
      .then((res) => setPropertyOptions(res.items.map((p) => ({ id: p.id, title: p.title }))))
      .catch(() => setPropertyOptions([]));
  }, []);

  // Analytics stats
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (analyticsFromDate && analyticsToDate && analyticsFromDate > analyticsToDate) {
      setAnalyticsDateError("Start date cannot be after end date.");
      return;
    }
    setAnalyticsDateError(null);
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    getAdminBookingStats({
      from_date: analyticsFromDate || undefined,
      to_date: analyticsToDate || undefined,
      property_id: analyticsPropertyId ? Number(analyticsPropertyId) : undefined,
      group_by: analyticsGroupBy || undefined,
    })
      .then(setAnalyticsStats)
      .catch((e) => setAnalyticsError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setAnalyticsLoading(false));
  }, [analyticsFromDate, analyticsToDate, analyticsPropertyId, analyticsGroupBy]);

  function handlePage(next: number) {
    if (next < 1 || next > totalPages) return;
    const filters: AdminBookingFilters = {};
    if (bookingStatus) filters.booking_status = bookingStatus;
    if (paymentMethod) filters.payment_method = paymentMethod;
    if (paymentStatus) filters.payment_status = paymentStatus;
    if (search) filters.search = search;
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    fetchData(next, filters);
  }

  function handleSearchSubmit() {
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setBookingStatus("");
    setPaymentMethod("");
    setPaymentStatus("");
    setSearch("");
    setSearchInput("");
    setFromDate("");
    setToDate("");
  }

  async function openDetails(b: AdminBooking) {
    setSelected(b);
    setDetailPayment(null);
    setDetailPaymentLoading(true);
    try {
      if (!b.payment) {
        const pay = (await Promise.race([
          getPaymentByBooking(b.id),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
        ]).catch(() => null)) as any;
        setDetailPayment(pay);
      } else {
        const pay = (await Promise.race([
          getPaymentByBooking(b.id),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
        ]).catch(() => null)) as any;
        if (pay) setDetailPayment(pay);
        else setDetailPayment(b.payment);
      }
    } catch {
      setDetailPayment(b.payment);
    } finally {
      setDetailPaymentLoading(false);
    }
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-space-xxs">
                  <div className="flex items-center gap-space-xs font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                    <span>Administration</span>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <span className="text-primary font-bold">Booking & Financial Overview</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Platform Bookings & Financial Ledger</h1>
                  <p className="font-body-md text-body-md text-[#46B1B1] max-w-3xl">
                    All platform bookings with live financial details.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const filters: AdminBookingFilters = {};
                    if (bookingStatus) filters.booking_status = bookingStatus;
                    if (paymentMethod) filters.payment_method = paymentMethod;
                    if (paymentStatus) filters.payment_status = paymentStatus;
                    if (search) filters.search = search;
                    if (fromDate) filters.from_date = fromDate;
                    if (toDate) filters.to_date = toDate;
                    fetchData(page, filters);
                  }} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border text-sm font-medium hover:bg-slate-50 text-[#46B1B1]">
                    <Icon name="refresh" className="material-symbols-outlined text-[18px] text-[#46B1B1]" /> Refresh
                  </button>
                </div>
              </div>

              {/* Analytics — real booking stats */}
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="analytics" className="material-symbols-outlined text-primary text-[20px]" />
                  <h2 className="font-title-md text-title-md text-[#46B1B1]">Booking & Financial Analytics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">From date</label>
                    <input type="date" value={analyticsFromDate} onChange={(e) => setAnalyticsFromDate(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">To date</label>
                    <input type="date" value={analyticsToDate} onChange={(e) => setAnalyticsToDate(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Property</label>
                    <select value={analyticsPropertyId} onChange={(e) => setAnalyticsPropertyId(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]">
                      <option value="">All properties</option>
                      {propertyOptions.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.title} — #{p.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Group by</label>
                    <select value={analyticsGroupBy} onChange={(e) => setAnalyticsGroupBy(e.target.value as any)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]">
                      <option value="">No grouping</option>
                      <option value="day">Day</option>
                      <option value="month">Month</option>
                    </select>
                  </div>
                </div>
                {analyticsDateError && <div className="mt-2 text-xs bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg">{analyticsDateError}</div>}
                {analyticsLoading ? (
                  <div className="mt-4 p-6 flex justify-center">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : analyticsError ? (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-sm text-rose-700 rounded-lg">{analyticsError}</div>
                ) : analyticsStats ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Total Bookings</div>
                        <div className="text-xl font-bold text-[#46B1B1] mt-1">{analyticsStats.total_bookings}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Gross Booking Volume</div>
                        <div className="text-xl font-bold text-[#46B1B1] mt-1">{formatPrice(analyticsStats.gross_booking_volume)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Platform Commission</div>
                        <div className="text-xl font-bold text-primary mt-1">{formatPrice(analyticsStats.platform_commission)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Owner Earnings</div>
                        <div className="text-xl font-bold text-emerald-600 mt-1">{formatPrice(analyticsStats.owner_earnings)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Stripe Gross</div>
                        <div className="text-xl font-bold text-[#46B1B1] mt-1">{formatPrice(analyticsStats.stripe_gross)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Cash Gross</div>
                        <div className="text-xl font-bold text-[#46B1B1] mt-1">{formatPrice(analyticsStats.cash_gross)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Outstanding Cash Commission</div>
                        <div className="text-xl font-bold text-amber-600 mt-1">{formatPrice(analyticsStats.pending_cash_commission)}</div>
                        <div className="text-xs text-[#46B1B1]/60 mt-1">Owner collected cash, commission not yet settled</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border">
                        <div className="text-xs uppercase tracking-wider text-[#46B1B1]/70 font-semibold">Pending Cash Settlements</div>
                        <div className="text-xl font-bold text-[#46B1B1] mt-1">{analyticsStats.pending_cash_bookings}</div>
                        <div className="text-xs text-[#46B1B1]/60 mt-1">Bookings</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                      <div className="bg-white rounded-lg p-2 border text-center">
                        <div className="text-xs text-[#46B1B1]/70">Pending</div>
                        <div className="font-bold text-amber-600">{analyticsStats.booking_statuses.pending}</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border text-center">
                        <div className="text-xs text-[#46B1B1]/70">Confirmed</div>
                        <div className="font-bold text-emerald-600">{analyticsStats.booking_statuses.confirmed}</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border text-center">
                        <div className="text-xs text-[#46B1B1]/70">Cancelled</div>
                        <div className="font-bold text-rose-600">{analyticsStats.booking_statuses.cancelled}</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border text-center">
                        <div className="text-xs text-[#46B1B1]/70">Rejected</div>
                        <div className="font-bold text-slate-600">{analyticsStats.booking_statuses.rejected}</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border text-center">
                        <div className="text-xs text-[#46B1B1]/70">Completed</div>
                        <div className="font-bold text-primary">{analyticsStats.booking_statuses.completed}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#46B1B1]">Breakdown by {analyticsGroupBy || "period"}</h3>
                        <span className="text-xs text-[#46B1B1]/60">{analyticsStats.breakdown.length} {analyticsGroupBy || "period"}s</span>
                      </div>
                      {analyticsStats.breakdown.length === 0 ? (
                        <div className="mt-2 text-xs text-[#46B1B1]/60 bg-white border rounded-lg p-3">
                          {analyticsGroupBy ? "No data for selected period — select grouping to see time-series." : "Select Day or Month grouping to view breakdown."}
                        </div>
                      ) : (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-surface-container text-xs uppercase tracking-wider text-[#46B1B1]">
                                <th className="py-2 px-3">Period</th>
                                <th className="py-2 px-3 text-right">Bookings</th>
                                <th className="py-2 px-3 text-right">Gross Booking Volume</th>
                                <th className="py-2 px-3 text-right">Platform Commission</th>
                                <th className="py-2 px-3 text-right">Owner Earnings</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                              {analyticsStats.breakdown.map((row) => {
                                const maxGross = Math.max(...analyticsStats.breakdown.map((r) => Number(r.gross_booking_volume) || 0), 1);
                                const width = (Number(row.gross_booking_volume) / maxGross) * 100;
                                return (
                                  <tr key={row.period} className="hover:bg-slate-50">
                                    <td className="py-2 px-3 font-mono text-[#46B1B1]">{row.period}</td>
                                    <td className="py-2 px-3 text-right text-[#46B1B1]">{row.total_bookings}</td>
                                    <td className="py-2 px-3 text-right font-semibold text-[#46B1B1]">
                                      <div className="flex items-center justify-end gap-2">
                                        {formatPrice(row.gross_booking_volume)}
                                        <span className="hidden sm:inline-block w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                          <span className="block h-full bg-primary" style={{ width: `${width}%` }} />
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-right text-primary">{formatPrice(row.platform_commission)}</td>
                                    <td className="py-2 px-3 text-right text-emerald-600">{formatPrice(row.owner_earnings)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Filters — server-side */}
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Booking status</label>
                    <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]">
                      <option value="">All</option>
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Payment method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]">
                      <option value="">All</option>
                      <option value="stripe">stripe</option>
                      <option value="cash">cash</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">Payment status</label>
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]">
                      <option value="">All</option>
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="failed">failed</option>
                      <option value="refunded">refunded</option>
                      <option value="partially_refunded">partially_refunded</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">From date</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[#46B1B1] uppercase tracking-wider">To date</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1]" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="flex-1 flex gap-2">
                    <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()} placeholder="Search client name, email, property title/location, booking ID" className="flex-1 h-10 px-3 rounded-lg border bg-white text-sm text-[#46B1B1] placeholder:text-[#46B1B1]/50" />
                    <button onClick={handleSearchSubmit} className="px-4 h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-[#115E60]">Search</button>
                  </div>
                  <button onClick={clearFilters} className="px-4 h-10 rounded-lg bg-white border text-sm hover:bg-slate-50">Clear</button>
                </div>
                <div className="text-xs text-[#46B1B1] mt-2">All filters are applied instantly to the booking list.</div>
              </div>

              {/* Table */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
                {loading ? (
                  <div className="p-12 flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#46B1B1]">Loading bookings…</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <Icon name="error" className="material-symbols-outlined text-rose-400 text-[28px] mb-2" />
                    <p className="text-sm text-rose-600">{error}</p>
                    <button onClick={() => {
                      const filters: AdminBookingFilters = {};
                      if (bookingStatus) filters.booking_status = bookingStatus;
                      if (paymentMethod) filters.payment_method = paymentMethod;
                      if (paymentStatus) filters.payment_status = paymentStatus;
                      if (search) filters.search = search;
                      if (fromDate) filters.from_date = fromDate;
                      if (toDate) filters.to_date = toDate;
                      fetchData(page, filters);
                    }} className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm">Retry</button>
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-12 text-center">
                    <Icon name="inbox" className="material-symbols-outlined text-[#46B1B1]/60 text-[32px] mb-2" />
                    <h3 className="font-semibold text-[#46B1B1]">No bookings found</h3>
                    <p className="text-sm text-[#46B1B1] mt-1">No results for current filters. Try clearing filters or adjusting search.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                      <thead>
                        <tr className="bg-surface-container text-[#46B1B1] font-label-sm text-label-sm uppercase tracking-wider text-xs">
                          <th className="py-3 px-3 font-semibold">Booking ID</th>
                          <th className="py-3 px-3 font-semibold">Client</th>
                          <th className="py-3 px-3 font-semibold">Property</th>
                          <th className="py-3 px-3 font-semibold">Check-in</th>
                          <th className="py-3 px-3 font-semibold">Check-out</th>
                          <th className="py-3 px-3 font-semibold text-center">Nights</th>
                          <th className="py-3 px-3 font-semibold text-center">Guests</th>
                          <th className="py-3 px-3 font-semibold text-right">Total</th>
                          <th className="py-3 px-3 font-semibold">Booking status</th>
                          <th className="py-3 px-3 font-semibold">Payment</th>
                          <th className="py-3 px-3 font-semibold text-right">Commission %</th>
                          <th className="py-3 px-3 font-semibold text-right">Commission</th>
                          <th className="py-3 px-3 font-semibold text-right">Owner earnings</th>
                          <th className="py-3 px-3 font-semibold">Created</th>
                          <th className="py-3 px-3 font-semibold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {items.map((b) => {
                          const pBadge = paymentBadge(b.payment?.payment_method, b.payment?.payment_status);
                          return (
                            <tr key={b.id} className="hover:bg-surface-container-low/40">
                              <td className="py-3 px-3 font-mono font-bold text-primary">#SL-{String(b.id).padStart(4, "0")}</td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-[#46B1B1] truncate max-w-[160px]">{b.client.full_name}</div>
                                <div className="text-xs text-[#46B1B1] truncate max-w-[160px]">{b.client.email}</div>
                                {b.client.phone && <div className="text-xs text-[#46B1B1]">{b.client.phone}</div>}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-[#46B1B1] truncate max-w-[150px]">{b.property.title}</div>
                                <div className="text-xs text-[#46B1B1]">{b.property.location}</div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-[#46B1B1]">{b.check_in}</td>
                              <td className="py-3 px-3 whitespace-nowrap text-[#46B1B1]">{b.check_out}</td>
                              <td className="py-3 px-3 text-center text-[#46B1B1]">{b.number_of_nights}</td>
                              <td className="py-3 px-3 text-center text-[#46B1B1]">{b.guests}</td>
                              <td className="py-3 px-3 text-right font-semibold text-[#46B1B1]">{formatPrice(b.total_price)}</td>
                              <td className="py-3 px-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${bookingBadge(b.status)}`}>{b.status}</span></td>
                              <td className="py-3 px-3">
                                {b.payment ? (
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${pBadge.cls}`}>{pBadge.label}</span>
                                    <span className="text-xs text-[#46B1B1]">{formatPrice(b.payment.amount)}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#46B1B1]/60 bg-slate-100 border px-2 py-1 rounded-full">No payment</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right text-[#46B1B1]">{Number(b.commission_percentage).toFixed(2)}%</td>
                              <td className="py-3 px-3 text-right font-medium text-[#46B1B1]">{formatPrice(b.commission_amount)}</td>
                              <td className="py-3 px-3 text-right font-bold text-emerald-700">{formatPrice(b.owner_earnings)}</td>
                              <td className="py-3 px-3 text-xs text-[#46B1B1] whitespace-nowrap">{new Date(b.created_at).toLocaleDateString()}</td>
                              <td className="py-3 px-3 text-center">
                                <button onClick={() => openDetails(b)} className="px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high border">View</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination —  */}
                <div className="p-4 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3 border-t">
                  <div className="text-xs text-[#46B1B1]">
                    {total > 0 ? (
                      <>Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> bookings — page <strong>{page}</strong> of <strong>{totalPages}</strong> (page_size {pageSize})</>
                    ) : (
                      <>No bookings</>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={page <= 1} onClick={() => handlePage(page - 1)} className={`px-3 py-1.5 rounded-lg border text-sm ${page <= 1 ? "bg-slate-100 text-[#46B1B1]/60 cursor-not-allowed" : "bg-white hover:bg-slate-50"}`}>
                      Previous
                    </button>
                    <span className="text-xs text-[#46B1B1]">Page {page} / {totalPages || 1}</span>
                    <button disabled={page >= totalPages} onClick={() => handlePage(page + 1)} className={`px-3 py-1.5 rounded-lg border text-sm ${page >= totalPages ? "bg-slate-100 text-[#46B1B1]/60 cursor-not-allowed" : "bg-white hover:bg-slate-50"}`}>
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail modal */}
              {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
                  <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-title-md text-title-md font-bold text-[#46B1B1]">Booking #SL-{String(selected.id).padStart(4, "0")} details</h3>
                        <p className="text-xs text-[#46B1B1]">Booking and payment details</p>
                      </div>
                      <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#157375] hover:text-[#157375]">
                        <Icon name="close" className="material-symbols-outlined text-[20px] text-[#157375]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <h4 className="font-semibold text-[#46B1B1]">Booking</h4>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">ID</span><span className="font-mono font-bold text-[#157375]">#SL-{String(selected.id).padStart(4, "0")}</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${bookingBadge(selected.status)}`}>{selected.status}</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Client</span><span className="font-medium text-[#157375]">{selected.client.full_name} ({selected.client.email})</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Property</span><span className="font-medium text-[#157375]">{selected.property.title} · {selected.property.location}</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Dates</span><span className="text-[#157375]">{selected.check_in} → {selected.check_out} ({selected.number_of_nights} nights)</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Guests</span><span className="text-[#157375]">{selected.guests}</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Total</span><span className="font-bold text-primary">{formatPrice(selected.total_price)}</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Commission</span><span className="text-[#157375]">{Number(selected.commission_percentage).toFixed(2)}% · {formatPrice(selected.commission_amount)}</span></div>
                        <div className="flex justify-between"><span className="text-[#46B1B1]">Owner earnings</span><span className="font-bold text-emerald-700">{formatPrice(selected.owner_earnings)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-[#46B1B1]">Created</span><span className="text-[#157375]">{new Date(selected.created_at).toLocaleString()}</span></div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <h4 className="font-semibold text-[#46B1B1]">Payment details</h4>
                        {selected.payment ? (
                          <>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Method</span><span className="capitalize text-[#157375]">{selected.payment.payment_method}</span></div>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${paymentBadge(selected.payment.payment_method, selected.payment.payment_status).cls}`}>{selected.payment.payment_status.replace("_", " ")}</span></div>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Amount</span><span className="font-semibold text-[#157375]">{formatPrice(selected.payment.amount)}</span></div>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Paid at</span><span className="text-xs text-[#157375]">{selected.payment.paid_at ? new Date(selected.payment.paid_at).toLocaleString() : "—"}</span></div>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Stripe PI</span><span className="font-mono text-xs truncate max-w-[140px] text-[#157375]">{selected.payment.stripe_payment_id || "—"}</span></div>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Stripe refund</span><span className="font-mono text-xs truncate max-w-[140px] text-[#157375]">{selected.payment.stripe_refund_id || "—"}</span></div>
                            <div className="flex justify-between"><span className="text-[#46B1B1]">Refunded</span><span className="font-semibold text-emerald-700">{formatPrice(selected.payment.refunded_amount)}</span></div>
                          </>
                        ) : (
                          <p className="text-xs text-[#46B1B1] bg-white border p-2 rounded-lg">No payment recorded for this booking.</p>
                        )}
                        {detailPaymentLoading && <p className="text-xs text-[#46B1B1]">Refreshing payment details…</p>}
                      </div>
                    </div>

                    {/* Cancellation / refund — separate from original financials */}
                    {(selected.status === "cancelled" || selected.cancellation_fee || selected.refund_amount) && (
                      <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4">
                        <h4 className="font-semibold text-rose-700 text-sm flex items-center gap-2"><Icon name="cancel" className="material-symbols-outlined text-[18px]" /> Cancellation / Refund (current data)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                          <div className="bg-white rounded-lg p-3"><div className="text-xs text-[#46B1B1] uppercase tracking-wider font-semibold">Cancelled at</div><div className="font-medium">{selected.cancelled_at ? new Date(selected.cancelled_at).toLocaleString() : "—"}</div></div>
                          <div className="bg-white rounded-lg p-3"><div className="text-xs text-[#46B1B1] uppercase tracking-wider font-semibold">Cancellation %</div><div className="font-bold">{selected.cancellation_percentage ? `${Number(selected.cancellation_percentage).toFixed(0)}%` : "—"}</div></div>
                          <div className="bg-white rounded-lg p-3"><div className="text-xs text-[#46B1B1] uppercase tracking-wider font-semibold">Cancellation fee</div><div className="font-semibold text-amber-700">{selected.cancellation_fee ? formatPrice(selected.cancellation_fee) : "—"}</div></div>
                          <div className="bg-white rounded-lg p-3"><div className="text-xs text-[#46B1B1] uppercase tracking-wider font-semibold">Refund amount</div><div className="font-bold text-emerald-700">{selected.refund_amount ? formatPrice(selected.refund_amount) : "—"}</div></div>
                          <div className="bg-white rounded-lg p-3"><div className="text-xs text-[#46B1B1] uppercase tracking-wider font-semibold">Cancellation commission</div><div className="font-semibold">{formatPrice(selected.cancellation_commission_amount)}</div></div>
                          <div className="bg-white rounded-lg p-3"><div className="text-xs text-[#46B1B1] uppercase tracking-wider font-semibold">Owner cancellation earnings</div><div className="font-semibold">{formatPrice(selected.owner_cancellation_earnings)}</div></div>
                        </div>
                        <p className="text-xs text-[#46B1B1] mt-2">Original commission {formatPrice(selected.commission_amount)} / owner earnings {formatPrice(selected.owner_earnings)} are preserved separately from cancellation earnings. Booking status ({selected.status}) and payment status ({selected.payment?.payment_status || "no payment"}) are distinct.</p>
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-[#157375] hover:text-[#157375]">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
