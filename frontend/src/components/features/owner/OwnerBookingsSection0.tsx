"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable, SearchInput } from "@/components/ui/Interactions";
import { getMyProperties, type PropertyResponse } from "@/services/owner";
import { getPropertyBookings, getOwnerCashRequests, approveBooking, rejectBooking } from "@/services/bookings";
import { getPaymentByBooking, markCashPaymentPaid, type PaymentResponse } from "@/services/payments";
import type { BookingResponse } from "@/services/bookings";

function formatPrice(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function bookingStatusColor(s: string) {
  const v = s?.toLowerCase();
  if (v === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (v === "confirmed" || v === "paid") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (v === "cancelled") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (v === "rejected") return "bg-slate-100 text-slate-600 border border-slate-200";
  return "bg-slate-100 text-slate-600";
}
function paymentBadge(p?: PaymentResponse | null) {
  if (!p) return { label: "No payment", cls: "bg-slate-100 text-slate-500 border border-slate-200" };
  const s = p.payment_status.toLowerCase();
  if (p.payment_method === "cash" && s === "pending") return { label: "Cash · Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200" };
  if (p.payment_method === "cash" && s === "cancelled") return { label: "Cash · Cancelled", cls: "bg-slate-100 text-slate-600 border border-slate-200" };
  if (s === "paid") return { label: `${p.payment_method} · Paid`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
  if (s === "pending") return { label: `${p.payment_method} · Pending`, cls: "bg-amber-50 text-amber-700 border border-amber-200" };
  if (s === "refunded") return { label: `${p.payment_method} · Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
  if (s === "partially_refunded") return { label: `${p.payment_method} · Partially Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
  if (s === "failed") return { label: `${p.payment_method} · Failed`, cls: "bg-rose-50 text-rose-700 border border-rose-200" };
  if (s === "cancelled") return { label: `${p.payment_method} · Cancelled`, cls: "bg-slate-100 text-slate-600 border border-slate-200" };
  return { label: `${p.payment_method} · ${p.payment_status}`, cls: "bg-slate-100 text-slate-600" };
}

export function OwnerBookingsSection0() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [payments, setPayments] = useState<Record<string, PaymentResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cash_pending" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const props = await getMyProperties();
      setProperties(props);
      if (props.length === 0) {
        setBookings([]);
        setPayments({});
        setLoading(false);
        return;
      }
      // Fetch bookings per property in parallel with timeout handling
      const results = await Promise.all(
        props.map((p) =>
          Promise.race([
            getPropertyBookings(p.id).catch(() => [] as BookingResponse[]),
            new Promise<BookingResponse[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
          ]).catch(() => [] as BookingResponse[])
        )
      );
      const flat = results.flat();
      const byId = new Map<number, BookingResponse>();
      flat.forEach((b) => byId.set(b.id, b));
      try {
        const cash = await Promise.race([
          getOwnerCashRequests(),
          new Promise<BookingResponse[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ]).catch(() => [] as BookingResponse[]);
        (cash as BookingResponse[]).forEach((b) => {
          if (!byId.has(b.id)) byId.set(b.id, b);
        });
      } catch {}
      const all = Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(all);
      setLoading(false);

      // Fetch payments in background — do not block booking display
      all.forEach(async (b) => {
        try {
          const pay = (await Promise.race([
            getPaymentByBooking(b.id),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
          ])) as PaymentResponse;
          setPayments((prev) => ({ ...prev, [String(b.id)]: pay }));
        } catch {}
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const counts = useMemo(() => {
    const all = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length;
    const cashPending = bookings.filter((b) => b.status === "confirmed" && payments[String(b.id)]?.payment_method === "cash" && payments[String(b.id)]?.payment_status === "pending").length;
    return { all, pending, confirmed, cancelled, cashPending };
  }, [bookings, payments]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter === "pending") list = list.filter((b) => b.status === "pending");
    else if (filter === "confirmed") list = list.filter((b) => b.status === "confirmed");
    else if (filter === "cash_pending") list = list.filter((b) => b.status === "confirmed" && payments[String(b.id)]?.payment_method === "cash" && payments[String(b.id)]?.payment_status === "pending");
    else if (filter === "cancelled") list = list.filter((b) => b.status === "cancelled" || b.status === "rejected");
    if (propertyFilter !== "all") list = list.filter((b) => String(b.property_id) === propertyFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => `#${b.id}`.toLowerCase().includes(q) || `#sl-${String(b.id).padStart(4, "0")}`.toLowerCase().includes(q) || String(b.property_id).includes(q) || b.status.toLowerCase().includes(q));
    }
    return list;
  }, [bookings, filter, search, propertyFilter]);

  async function handleApprove(id: number) {
    const booking = bookings.find((b) => b.id === id);
    const title = booking ? `Approve booking #${id}?` : `Approve cash booking?`;
    const res = await Swal.fire({
      title,
      html: `<div style="text-align:left;font-size:13px;color:#1E293B">Approving will confirm the booking (status → <strong>confirmed</strong>). The payment will <strong>remain</strong> <span style="color:#92400E">Pending Cash</span> — it is <strong>not</strong> marked as paid. Commission becomes owed.</div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#157375",
      customClass: { popup: "rounded-2xl" },
    });
    if (!res.isConfirmed) return;
    setActionId(String(id));
    try {
      await approveBooking(id);
      await loadAll();
      await Swal.fire({ title: "Approved", text: `Booking #${id} is now confirmed. Payment remains Pending Cash.`, icon: "success", confirmButtonColor: "#157375" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Approve failed";
      await Swal.fire({ title: "Approve failed", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: number) {
    const res = await Swal.fire({
      title: `Reject booking #${id}?`,
      html: `<div style="text-align:left;font-size:13px;color:#1E293B">Rejecting will set status → <strong>rejected</strong> and release dates for other guests. This cannot be undone.</div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Keep",
      confirmButtonColor: "#E11D48",
      customClass: { popup: "rounded-2xl" },
    });
    if (!res.isConfirmed) return;
    setActionId(String(id));
    try {
      await rejectBooking(id);
      await loadAll();
      await Swal.fire({ title: "Rejected", text: `Booking #${id} was rejected.`, icon: "success", confirmButtonColor: "#157375" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reject failed";
      await Swal.fire({ title: "Reject failed", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setActionId(null);
    }
  }

  async function handleMarkPaid(id: number) {
    const b = bookings.find((x) => x.id === id);
    const total = b ? formatPrice(b.total_price) : "";
    const res = await Swal.fire({
      title: "Confirm cash payment",
      html: `<div style="text-align:left;font-size:13px;line-height:1.6;color:#1E293B"><p style="font-weight:600;color:#157375;margin-bottom:8px">Only confirm this after you have actually received the cash payment from the client.</p><div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px"><div style="display:flex;justify-content:space-between"><span>Booking</span><strong>#SL-${String(id).padStart(4, "0")}</strong></div><div style="display:flex;justify-content:space-between;margin-top:6px"><span>Total</span><strong>${total}</strong></div><div style="display:flex;justify-content:space-between;margin-top:6px"><span>Method</span><strong>Cash</strong></div></div><p style="font-size:12px;color:#64748B;margin-top:8px">This sets payment to <strong>paid</strong> and records <em>paid_at</em>.</p></div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Cash Received",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#157375",
      customClass: { popup: "rounded-2xl" },
    });
    if (!res.isConfirmed) return;
    setActionId(String(id));
    try {
      await markCashPaymentPaid(id);
      await loadAll();
      await Swal.fire({ title: "Cash payment confirmed successfully.", text: `Payment for booking #SL-${String(id).padStart(4, "0")} is now paid.`, icon: "success", confirmButtonColor: "#157375" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to mark as paid";
      await Swal.fire({ title: "Failed to confirm payment", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setActionId(null);
    }
  }

  const propMap = useMemo(() => {
    const m: Record<number, PropertyResponse> = {};
    properties.forEach((p) => (m[p.id] = p));
    return m;
  }, [properties]);

  if (loading) {
    return (
      <main className="w-full pt-6 min-h-screen bg-background flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading your bookings…</p>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="w-full pt-6 min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-rose-400 mb-2" />
          <p className="text-sm text-rose-600 mb-3">{error}</p>
          <button onClick={loadAll} className="px-5 py-2 rounded-lg bg-primary text-white text-sm">Retry</button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={"w-full  pt-6 min-h-screen bg-background"}>
        <div className={"flex flex-col w-full"}>
          <div className={"p-space-lg max-w-[1400px] w-full mx-auto space-y-space-lg"}>
            <div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-md"}>
              <div className={"space-y-space-xxs"}>
                <nav className={"flex items-center gap-space-xs text-on-surface-variant font-caption text-caption mb-1"}>
                  <Link href="/owner" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Icon name="space_dashboard" className="material-symbols-outlined text-[14px]" />
                    <span>Dashboard</span>
                  </Link>
                  <span className={"text-outline-variant font-semibold"}>{"/"}</span>
                  <span className={"text-on-surface font-semibold text-caption"}>{"Bookings"}</span>
                </nav>
                <h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"Bookings Management"}</h1>
                <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>Manage guest reservations across your properties. Data from <code className="bg-slate-100 px-1 rounded">GET /bookings/property/&#123;id&#125;</code> + <code className="bg-slate-100 px-1 rounded">GET /bookings/owner/cash-requests</code>.</p>
              </div>
              <div className={"flex items-center gap-space-xs self-start md:self-auto"}>
                <button onClick={loadAll} className={"inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md text-on-surface font-label-md text-label-md transition-all"}>
                  <Icon name="refresh" className="material-symbols-outlined text-[18px] text-primary" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className={"grid grid-cols-1 md:grid-cols-3 gap-space-md"}>
              <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"}>
                <div className={"space-y-1"}>
                  <span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>Total Bookings</span>
                  <div className={"flex items-baseline gap-space-xs"}>
                    <span className={"font-display text-display text-on-surface tracking-tight"}>{counts.all}</span>
                    <span className={"font-label-sm text-label-sm text-secondary font-semibold"}>Live from backend</span>
                  </div>
                  <p className={"font-caption text-caption text-outline"}>Across {properties.length} propert{properties.length === 1 ? "y" : "ies"}</p>
                </div>
                <div className={"w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center"}>
                  <Icon name="hotel" className="material-symbols-outlined text-[26px]" />
                </div>
              </div>
              <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"}>
                <div className={"space-y-1"}>
                  <div className={"flex items-center gap-space-xs"}>
                    <span className={"font-caption text-caption uppercase tracking-wider text-tertiary-container font-semibold"}>Awaiting Owner Approval</span>
                    <span className={"w-2 h-2 rounded-full bg-tertiary-container animate-pulse"}></span>
                  </div>
                  <div className={"flex items-baseline gap-space-xs"}>
                    <span className={"font-display text-display text-on-surface tracking-tight"}>{bookings.filter((b) => b.status === "pending").length}</span>
                    <span className={"px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>{bookings.filter((b) => { const pay = payments[String(b.id)]; return b.status === "pending" && pay?.payment_method === "cash" && pay?.payment_status === "pending"; }).length} pending cash</span>
                  </div>
                  <p className={"font-caption text-caption text-outline"}>GET /bookings/owner/cash-requests</p>
                </div>
                <div className={"w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary-container flex items-center justify-center"}>
                  <Icon name="pending_actions" className="material-symbols-outlined text-[26px]" />
                </div>
              </div>
              <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"}>
                <div className={"space-y-1"}>
                  <span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>Confirmed Arrivals</span>
                  <div className={"flex items-baseline gap-space-xs"}>
                    <span className={"font-display text-display text-on-surface tracking-tight"}>{counts.confirmed}</span>
                    <span className={"font-label-sm text-label-sm text-primary font-semibold"}>Guaranteed</span>
                  </div>
                  <p className={"font-caption text-caption text-outline"}>{counts.cancelled} cancelled/rejected</p>
                </div>
                <div className={"w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center"}>
                  <Icon name="verified_user" className="material-symbols-outlined text-[26px]" />
                </div>
              </div>
            </div>

            <div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col"}>
              <div className={"px-space-md pt-space-md bg-surface-container-low/40 flex items-center gap-2 overflow-x-auto"}>
                {(
                  [
                    { key: "all", label: "All", count: counts.all },
                    { key: "pending", label: "Pending", count: counts.pending },
                    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
                    { key: "cash_pending", label: "Cash Awaiting Payment", count: counts.cashPending },
                    { key: "cancelled", label: "Cancelled / Rejected", count: counts.cancelled },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setFilter(t.key as any)}
                    className={`px-space-md py-2.5 rounded-t-lg font-label-md text-label-md flex items-center gap-space-xs whitespace-nowrap ${filter === t.key ? "bg-surface-container-lowest text-primary font-bold shadow-sm" : "hover:bg-surface-container-low text-on-surface-variant"}`}
                  >
                    <span>{t.label}</span>
                    <span className={`px-2 py-0.5 rounded-full font-caption text-caption ${filter === t.key ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}`}>{t.count}</span>
                  </button>
                ))}
              </div>

              <div className={"p-space-md bg-surface-container-low/20 grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center"}>
                <div className={"md:col-span-5 relative"}>
                  <Icon name="search" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={"w-full pl-10 pr-space-md h-11 bg-surface-container-lowest rounded-xl text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm placeholder:text-outline-variant"}
                    placeholder="Search by #SL- ID, property or status"
                  />
                </div>
                <div className={"md:col-span-4 relative"}>
                  <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} className={"w-full appearance-none h-11 pl-space-md pr-10 bg-surface-container-lowest rounded-xl text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm cursor-pointer"}>
                    <option value="all">All Properties ({properties.length})</option>
                    {properties.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.title} · {p.location}
                      </option>
                    ))}
                  </select>
                  <Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]" />
                </div>
                <div className={"md:col-span-3 flex items-center gap-2"}>
                  <span className="text-xs text-slate-500">{filtered.length} of {bookings.length} shown</span>
                  {(search || propertyFilter !== "all" || filter !== "all") && (
                    <button onClick={() => { setSearch(""); setPropertyFilter("all"); setFilter("all"); }} className="text-xs text-primary underline ml-auto">
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <Icon name="inbox" className="material-symbols-outlined text-[36px] text-slate-400 mb-2" />
                  <h3 className="font-title-md text-title-md text-on-surface">No bookings found for your properties.</h3>
                  <p className="text-sm text-slate-500 mt-1">Bookings will appear here once clients reserve your approved properties.</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-slate-500">No {filter} bookings match your filters.</p>
                  <button onClick={() => { setFilter("all"); setSearch(""); }} className="mt-2 text-sm text-primary underline">Clear filters</button>
                </div>
              ) : (
                <div className={"w-full overflow-x-auto"}>
                  <DataTable className={"w-full text-left border-collapse"}>
                    <thead>
                      <tr className={"bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider"}>
                        <th className={"py-3.5 px-space-md font-semibold"}>Booking Ref & Property</th>
                        <th className={"py-3.5 px-space-md font-semibold"}>Dates & Nights</th>
                        <th className={"py-3.5 px-space-md font-semibold"}>Payment</th>
                        <th className={"py-3.5 px-space-md font-semibold text-right"}>Total</th>
                        <th className={"py-3.5 px-space-md font-semibold"}>Booking Status</th>
                        <th className={"py-3.5 px-space-md font-semibold text-right"}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={"divide-y divide-slate-100"}>
                      {filtered.map((b) => {
                        const prop = propMap[b.property_id];
                        const pay = payments[String(b.id)];
                        const payInfo = paymentBadge(pay);
                        const isPendingCash = b.status === "pending" && pay?.payment_method === "cash" && pay?.payment_status === "pending";
                        const isConfirmedCashPending = b.status === "confirmed" && pay?.payment_method === "cash" && pay?.payment_status === "pending";
                        return (
                          <tr key={b.id} className={isPendingCash ? "bg-amber-50/40 hover:bg-amber-50/60" : isConfirmedCashPending ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "bg-white hover:bg-surface-container-low/30"}>
                            <td className={"py-3.5 px-space-md"}>
                              <div className="flex flex-col">
                                <Link href={`/owner/bookings/${b.id}`} className="font-mono font-bold text-primary hover:underline">
                                  #SL-{String(b.id).padStart(4, "0")}
                                </Link>
                                <span className="text-sm font-medium text-on-surface truncate max-w-[190px]">{prop?.title || `Property #${b.property_id}`}</span>
                                <span className="text-xs text-slate-500">{prop?.location || ""} · {b.guests} guests</span>
                              </div>
                            </td>
                            <td className={"py-3.5 px-space-md text-sm"}>
                              <div className="font-medium text-on-surface">{b.check_in} → {b.check_out}</div>
                              <div className="text-xs text-slate-500">{b.number_of_nights} nights</div>
                              {b.status === "cancelled" && b.cancelled_at && <div className="text-xs text-rose-600">Cancelled {new Date(b.cancelled_at).toLocaleDateString()}</div>}
                            </td>
                            <td className={"py-3.5 px-space-md"}>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payInfo.cls}`}>{payInfo.label}</span>
                              {b.status === "cancelled" && b.cancellation_fee && (
                                <div className="text-xs text-slate-500 mt-1">Fee {formatPrice(b.cancellation_fee)} · Refund {formatPrice(b.refund_amount)}</div>
                              )}
                              {pay && (pay.payment_status === "refunded" || pay.payment_status === "partially_refunded") && (
                                <div className="text-xs text-emerald-700">Refunded {formatPrice(pay.refunded_amount)}</div>
                              )}
                            </td>
                            <td className={"py-3.5 px-space-md text-right"}>
                              <div className="font-semibold text-on-surface">{formatPrice(b.total_price)}</div>
                              {isPendingCash && <div className="text-xs text-amber-700">Cash pending</div>}
                            </td>
                            <td className={"py-3.5 px-space-md"}>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bookingStatusColor(b.status)}`}>{b.status}</span>
                              {isPendingCash && <div className="text-xs text-amber-700 mt-1">Awaiting approval</div>}
                            </td>
                            <td className={"py-3.5 px-space-md text-right"}>
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/owner/bookings/${b.id}`} className="px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high">
                                  View
                                </Link>
                                {isPendingCash && (
                                  <>
                                    <button
                                      disabled={actionId === String(b.id)}
                                      onClick={() => handleApprove(b.id)}
                                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center disabled:opacity-50"
                                      title="Approve"
                                    >
                                      <Icon name="check" className="material-symbols-outlined text-[18px]" />
                                    </button>
                                    <button
                                      disabled={actionId === String(b.id)}
                                      onClick={() => handleReject(b.id)}
                                      className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center disabled:opacity-50"
                                      title="Reject"
                                    >
                                      <Icon name="close" className="material-symbols-outlined text-[18px]" />
                                    </button>
                                  </>
                                )}
                                {isConfirmedCashPending && (
                                  <button
                                    disabled={actionId === String(b.id)}
                                    onClick={() => handleMarkPaid(b.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#157375] text-white text-xs font-semibold hover:bg-[#0f5a5b] flex items-center gap-1 disabled:opacity-50"
                                    title="Confirm Cash Received"
                                  >
                                    {actionId === String(b.id) ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="verified" className="material-symbols-outlined text-[14px]" />}
                                    <span className="hidden sm:inline">Confirm Cash Received</span>
                                    <span className="sm:hidden">Paid</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </DataTable>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
