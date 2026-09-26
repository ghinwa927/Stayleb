"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
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
  if (v === "pending") return { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500", text: "Pending" };
  if (v === "confirmed" || v === "paid") return { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", text: "Confirmed" };
  if (v === "cancelled") return { cls: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500", text: "Cancelled" };
  if (v === "rejected") return { cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400", text: "Rejected" };
  return { cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400", text: s };
}
function paymentBadge(p?: PaymentResponse | null) {
  if (!p) return { label: "No payment", cls: "bg-slate-100 text-slate-500 border border-slate-200", dot: "bg-slate-400" };
  const s = p.payment_status.toLowerCase();
  if (p.payment_method === "cash" && s === "pending") return { label: "Cash · Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" };
  if (p.payment_method === "cash" && s === "cancelled") return { label: "Cash · Cancelled", cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
  if (s === "paid") return { label: `${p.payment_method} · Paid`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" };
  if (s === "pending") return { label: `${p.payment_method} · Pending`, cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" };
  if (s === "refunded") return { label: `${p.payment_method} · Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" };
  if (s === "partially_refunded") return { label: `${p.payment_method} · Partially Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" };
  if (s === "failed") return { label: `${p.payment_method} · Failed`, cls: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500" };
  if (s === "cancelled") return { label: `${p.payment_method} · Cancelled`, cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
  return { label: `${p.payment_method} · ${p.payment_status}`, cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
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
  const [approveModalId, setApproveModalId] = useState<number | null>(null);
  const [rejectModalId, setRejectModalId] = useState<number | null>(null);
  const [markPaidModalId, setMarkPaidModalId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  function showSuccess(title: string, message: string) {
    setNotification({ type: "success", title, message });
    setTimeout(() => setNotification(null), 4000);
  }
  function showError(title: string, message: string) {
    setNotification({ type: "error", title, message });
    setTimeout(() => setNotification(null), 5000);
  }

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

  async function confirmApprove(id: number) {
    setApproveModalId(null);
    setActionId(String(id));
    try {
      await approveBooking(id);
      await loadAll();
      showSuccess("Approved", `Booking #${id} is now confirmed. Payment remains Pending Cash.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Approve failed";
      showError("Approve failed", msg);
    } finally {
      setActionId(null);
    }
  }

  async function confirmReject(id: number) {
    setRejectModalId(null);
    setActionId(String(id));
    try {
      await rejectBooking(id);
      await loadAll();
      showSuccess("Rejected", `Booking #${id} was rejected.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reject failed";
      showError("Reject failed", msg);
    } finally {
      setActionId(null);
    }
  }

  async function confirmMarkPaid(id: number) {
    setMarkPaidModalId(null);
    setActionId(String(id));
    try {
      await markCashPaymentPaid(id);
      await loadAll();
      showSuccess("Cash payment confirmed successfully.", `Payment for booking #SL-${String(id).padStart(4, "0")} is now paid.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to mark as paid";
      showError("Failed to confirm payment", msg);
    } finally {
      setActionId(null);
    }
  }

  const propMap = useMemo(() => {
    const m: Record<number, PropertyResponse> = {};
    properties.forEach((p) => (m[p.id] = p));
    return m;
  }, [properties]);

  const approveBookingTarget = approveModalId !== null ? bookings.find((b) => b.id === approveModalId) : null;
  const rejectBookingTarget = rejectModalId !== null ? bookings.find((b) => b.id === rejectModalId) : null;
  const markPaidBookingTarget = markPaidModalId !== null ? bookings.find((b) => b.id === markPaidModalId) : null;

  if (loading) {
    return (
      <main className="w-full pt-6 min-h-screen bg-surface-container-low flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#46B1B1]">Loading your bookings…</p>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="w-full pt-6 min-h-screen bg-surface-container-low flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-rose-400 mb-2" />
          <p className="text-sm text-rose-600 mb-3">{error}</p>
          <button onClick={loadAll} className="px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors">Retry</button>
        </div>
      </main>
    );
  }

  return (
    <>
      {notification && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl shadow-xl p-4 max-w-sm border ${notification.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <div className="flex items-start gap-3">
            <Icon name={notification.type === "success" ? "check_circle" : "error"} className={`material-symbols-outlined text-[24px] ${notification.type === "success" ? "text-emerald-500" : "text-rose-500"}`} />
            <div>
              <p className={`font-semibold text-sm ${notification.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{notification.title}</p>
              <p className={`text-xs mt-0.5 ${notification.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-auto p-1 rounded hover:bg-white/50">
              <Icon name="close" className={`material-symbols-outlined text-[16px] ${notification.type === "success" ? "text-emerald-600" : "text-rose-600"}`} />
            </button>
          </div>
        </div>
      )}

      {approveModalId !== null && (
        <Modal title={approveBookingTarget ? `Approve booking #${approveModalId}?` : "Approve cash booking?"} onClose={() => setApproveModalId(null)}>
          <div className="text-[#46B1B1] text-sm mb-6">
            <p className="mb-3">Approving will confirm the booking (status → <strong>confirmed</strong>). The payment will <strong>remain</strong> <span className="text-amber-700 font-semibold">Pending Cash</span> — it is <strong>not</strong> marked as paid. Commission becomes owed.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setApproveModalId(null)} className="px-4 py-2 rounded-lg bg-surface-container text-[#46B1B1] font-label-sm hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
            <button onClick={() => confirmApprove(approveModalId)} className="px-4 py-2 rounded-lg bg-primary text-white font-label-sm hover:bg-primary/90 shadow-sm transition-colors">
              Approve
            </button>
          </div>
        </Modal>
      )}

      {rejectModalId !== null && (
        <Modal title={`Reject booking #${rejectModalId}?`} onClose={() => setRejectModalId(null)}>
          <div className="text-[#46B1B1] text-sm mb-6">
            <p>Rejecting will set status → <strong>rejected</strong> and release dates for other guests. This cannot be undone.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRejectModalId(null)} className="px-4 py-2 rounded-lg bg-surface-container text-[#46B1B1] font-label-sm hover:bg-surface-container-high transition-colors">
              Keep
            </button>
            <button onClick={() => confirmReject(rejectModalId)} className="px-4 py-2 rounded-lg bg-rose-600 text-white font-label-sm hover:bg-rose-700 shadow-sm transition-colors">
              Reject
            </button>
          </div>
        </Modal>
      )}

      {markPaidModalId !== null && markPaidBookingTarget && (
        <Modal title="Confirm cash payment" onClose={() => setMarkPaidModalId(null)}>
          <div className="text-[#46B1B1] text-sm mb-6 space-y-3">
            <p className="font-semibold text-[#46B1B1]">Only confirm this after you have actually received the cash payment from the client.</p>
            <div className="bg-surface-container-low border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between"><span>Booking</span><strong className="font-mono">#SL-{String(markPaidModalId).padStart(4, "0")}</strong></div>
              <div className="flex justify-between"><span>Total</span><strong>{formatPrice(markPaidBookingTarget.total_price)}</strong></div>
              <div className="flex justify-between"><span>Method</span><strong>Cash</strong></div>
            </div>
            <p className="text-xs text-[#46B1B1]/70">This sets payment to <strong>paid</strong> and records <em>paid_at</em>.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setMarkPaidModalId(null)} className="px-4 py-2 rounded-lg bg-surface-container text-[#46B1B1] font-label-sm hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
            <button onClick={() => confirmMarkPaid(markPaidModalId)} className="px-4 py-2 rounded-lg bg-primary text-white font-label-sm hover:bg-primary/90 shadow-sm transition-colors">
              Confirm Cash Received
            </button>
          </div>
        </Modal>
      )}

      <main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
        <div className={"flex flex-col w-full max-w-[1400px] mx-auto"}>
          <div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl"}>
            <div className={"flex flex-col gap-space-xxs"}>
              <div className={"flex items-center gap-space-xs text-[#46B1B1] font-label-sm text-label-sm"}>
                <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold"}>
                  <span className={"w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"}></span>
                  Live Sync Active
                </span>
                <span>•</span>
                <span>Lebanon Standard Time (UTC+03:00)</span>
              </div>
              <h1 className={"font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight mt-1"}>{"Bookings Management"}</h1>
              <p className={"font-body-md text-body-md text-[#46B1B1]"}>{"Manage guest reservations, approve cash bookings, and track stay statuses."}</p>
            </div>
            <div className={"flex items-center gap-space-xs shrink-0"}>
              <button onClick={loadAll} className="inline-flex items-center gap-space-xxs px-space-md py-2.5 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md text-[#46B1B1] font-label-md text-label-md transition-all">
                <Icon name="refresh" className="material-symbols-outlined text-[18px] text-primary" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl"}>
            <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
              <div className={"flex items-start justify-between"}>
                <span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Total Bookings"}</span>
                <div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
                  <Icon name="hotel" className="material-symbols-outlined text-[20px]" />
                </div>
              </div>
              <div className={"mt-space-sm"}>
                <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{counts.all}</div>
                <div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
                  <span className="font-caption text-caption">Live</span>
                </div>
              </div>
              <div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
                <span className={"text-primary font-medium"}>Live</span>
                <span>Across {properties.length} propert{properties.length === 1 ? "y" : "ies"}</span>
              </div>
            </div>
            <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
              <div className={"flex items-start justify-between"}>
                <span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Awaiting Approval"}</span>
                <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>
                  <span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span>
                  Action Required
                </span>
              </div>
              <div className={"mt-space-sm"}>
                <div className={"font-headline-md text-headline-md font-bold text-tertiary"}>{counts.pending}</div>
                <div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
                  <span>Pending cash payments</span>
                </div>
              </div>
              <div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
                <span className={"text-tertiary font-medium"}>{bookings.filter((b) => { const pay = payments[String(b.id)]; return b.status === "pending" && pay?.payment_method === "cash" && pay?.payment_status === "pending"; }).length} cash</span>
                <span>Pending cash payments</span>
              </div>
            </div>
            <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
              <div className={"flex items-start justify-between"}>
                <span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Confirmed Arrivals"}</span>
                <div className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
                  <Icon name="verified_user" className="material-symbols-outlined text-[20px]" />
                </div>
              </div>
              <div className={"mt-space-sm"}>
                <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{counts.confirmed}</div>
                <div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
                  <span>Guaranteed reservations</span>
                </div>
              </div>
              <div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
                <span className={"text-primary font-medium"}>{counts.confirmed} confirmed</span>
                <span>{counts.cancelled} cancelled/rejected</span>
              </div>
            </div>
            <div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"}>
              <div className={"flex items-start justify-between"}>
                <span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Cash Awaiting Payment"}</span>
                <div className={"w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed"}>
                  <Icon name="payments" className="material-symbols-outlined text-[20px]" />
                </div>
              </div>
              <div className={"mt-space-sm"}>
                <div className={"font-headline-md text-headline-md font-bold text-[#46B1B1]"}>{counts.cashPending}</div>
                <div className={"flex items-center gap-1.5 mt-1 text-[#46B1B1] font-label-sm text-label-sm"}>
                  <span>Confirmed · Cash on arrival</span>
                </div>
              </div>
              <div className={"mt-space-xs pt-space-xs flex items-center justify-between text-caption font-caption text-[#46B1B1]"}>
                <span className={"text-tertiary font-medium"}>{counts.cashPending} pending</span>
                <span>Cash on arrival</span>
              </div>
            </div>
          </div>

          <section className={"flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"}>
            <div className={"p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright"}>
              <div className="flex flex-wrap gap-2 items-center">
                {(
                  [
                    { key: "all", label: "All", count: counts.all },
                    { key: "pending", label: "Pending", count: counts.pending },
                    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
                    { key: "cash_pending", label: "Cash Awaiting", count: counts.cashPending },
                    { key: "cancelled", label: "Cancelled-Rejected", count: counts.cancelled },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setFilter(t.key as any)}
                    className={`px-space-md py-2 rounded-lg font-label-md text-label-md flex items-center gap-space-xs whitespace-nowrap transition-all ${filter === t.key ? "bg-primary text-white shadow-sm hover:bg-primary/90" : "bg-surface-container text-[#46B1B1] hover:bg-surface-container-high"}`}
                  >
                    <span>{t.label}</span>
                    <span className={`px-2 py-0.5 rounded-full font-caption text-caption ${filter === t.key ? "bg-white/20 text-white" : "bg-surface-container-high text-[#46B1B1]"}`}>{t.count}</span>
                  </button>
                ))}
              </div>
              <div className={"flex items-center gap-space-xs"}>
                <span className="text-xs text-[#46B1B1]/70">{filtered.length} of {bookings.length} shown</span>
              </div>
            </div>

            <div className={"p-space-md bg-surface-container-low/20 grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center"}>
              <div className={"md:col-span-5 relative"}>
                <Icon name="search" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={"w-full pl-10 pr-space-md h-11 bg-surface-container-lowest rounded-xl text-[#46B1B1] font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm placeholder:text-outline-variant border border-transparent focus:border-secondary"}
                  placeholder="Search by #SL- ID, property or status"
                />
              </div>
              <div className={"md:col-span-4 relative"}>
                <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} className={"w-full appearance-none h-11 pl-space-md pr-10 bg-surface-container-lowest rounded-xl text-[#46B1B1] font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm cursor-pointer border border-transparent focus:border-secondary"}>
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
                {(search || propertyFilter !== "all" || filter !== "all") && (
                  <button onClick={() => { setSearch(""); setPropertyFilter("all"); setFilter("all"); }} className="text-xs text-primary underline ml-auto hover:text-[#46B1B1]">
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Icon name="inbox" className="material-symbols-outlined text-[36px] text-[#46B1B1]/40 mb-2" />
                <h3 className="font-title-md text-title-md text-[#46B1B1]">No bookings found for your properties.</h3>
                <p className="text-sm text-[#46B1B1]/70 mt-1">Bookings will appear here once clients reserve your approved properties.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-[#46B1B1]/70">No {filter} bookings match your filters.</p>
                <button onClick={() => { setFilter("all"); setSearch(""); }} className="mt-2 text-sm text-primary underline hover:text-[#46B1B1]">Clear filters</button>
              </div>
            ) : (
              <div className={"w-full overflow-x-auto"}>
                <DataTable className={"w-full text-left"}>
                  <thead className={"bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider"}>
                    <tr>
                      <th className={"py-3 px-space-md text-[#46B1B1]"}>Booking Ref & Property</th>
                      <th className={"py-3 px-space-md text-[#46B1B1]"}>Dates & Nights</th>
                      <th className={"py-3 px-space-md text-[#46B1B1]"}>Payment</th>
                      <th className={"py-3 px-space-md text-right text-[#46B1B1]"}>Total</th>
                      <th className={"py-3 px-space-md text-[#46B1B1]"}>Booking Status</th>
                      <th className={"py-3 px-space-md text-right text-[#46B1B1]"}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={"divide-y divide-transparent font-body-md text-body-md text-[#46B1B1]"}>
                    {filtered.map((b) => {
                      const prop = propMap[b.property_id];
                      const pay = payments[String(b.id)];
                      const payInfo = paymentBadge(pay);
                      const statusInfo = bookingStatusColor(b.status);
                      const isPendingCash = b.status === "pending" && pay?.payment_method === "cash" && pay?.payment_status === "pending";
                      const isConfirmedCashPending = b.status === "confirmed" && pay?.payment_method === "cash" && pay?.payment_status === "pending";
                      return (
                        <RecordRow key={b.id} className={`hover:bg-surface-container transition-colors group ${isPendingCash ? "bg-amber-50/40" : isConfirmedCashPending ? "bg-emerald-50/20" : ""}`} initialStatus={statusInfo.text}>
                          <td className={"py-3.5 px-space-md"}>
                            <div className="flex flex-col">
                              <Link href={`/owner/bookings/${b.id}`} className="font-mono font-bold text-primary hover:underline">
                                #SL-{String(b.id).padStart(4, "0")}
                              </Link>
                              <span className="text-sm font-medium text-[#46B1B1] truncate max-w-[190px]">{prop?.title || `Property #${b.property_id}`}</span>
                              <span className="text-xs text-[#46B1B1]/70 flex items-center gap-1">
                                <Icon name="location_on" className="material-symbols-outlined text-[13px] text-outline" />
                                {prop?.location || ""} · {b.guests} guests
                              </span>
                            </div>
                          </td>
                          <td className={"py-3.5 px-space-md text-sm whitespace-nowrap"}>
                            <div className="font-medium text-[#46B1B1]">{b.check_in} → {b.check_out}</div>
                            <div className="text-xs text-[#46B1B1]/70">{b.number_of_nights} nights</div>
                            {b.status === "cancelled" && b.cancelled_at && <div className="text-xs text-rose-600">Cancelled {new Date(b.cancelled_at).toLocaleDateString()}</div>}
                          </td>
                          <td className={"py-3.5 px-space-md whitespace-nowrap"}>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${payInfo.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${payInfo.dot}`}></span>
                              {payInfo.label}
                            </span>
                            {b.status === "cancelled" && b.cancellation_fee && (
                              <div className="text-xs text-[#46B1B1]/70 mt-1">Fee {formatPrice(b.cancellation_fee)} · Refund {formatPrice(b.refund_amount)}</div>
                            )}
                            {pay && (pay.payment_status === "refunded" || pay.payment_status === "partially_refunded") && (
                              <div className="text-xs text-emerald-700">Refunded {formatPrice(pay.refunded_amount)}</div>
                            )}
                          </td>
                          <td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
                            <div className="font-semibold text-[#46B1B1]">{formatPrice(b.total_price)}</div>
                            {isPendingCash && <div className="text-xs text-amber-700">Cash pending</div>}
                          </td>
                          <td className={"py-3.5 px-space-md whitespace-nowrap"}>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                              {statusInfo.text}
                            </span>
                            <RecordStatus className={"mt-1 block text-xs"} initial={statusInfo.text}>
                              {isPendingCash && <span className="text-amber-700">Awaiting approval</span>}
                            </RecordStatus>
                          </td>
                          <td className={"py-3.5 px-space-md text-right whitespace-nowrap"}>
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/owner/bookings/${b.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors">
                                View
                                <Icon name="arrow_forward" className="material-symbols-outlined text-[14px]" />
                              </Link>
                              {isPendingCash && (
                                <>
                                  <button
                                    disabled={actionId === String(b.id)}
                                    onClick={() => setApproveModalId(b.id)}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center disabled:opacity-50 transition-colors"
                                    title="Approve"
                                  >
                                    <Icon name="check" className="material-symbols-outlined text-[18px]" />
                                  </button>
                                  <button
                                    disabled={actionId === String(b.id)}
                                    onClick={() => setRejectModalId(b.id)}
                                    className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center disabled:opacity-50 transition-colors"
                                    title="Reject"
                                  >
                                    <Icon name="close" className="material-symbols-outlined text-[18px]" />
                                  </button>
                                </>
                              )}
                              {isConfirmedCashPending && (
                                <button
                                  disabled={actionId === String(b.id)}
                                  onClick={() => setMarkPaidModalId(b.id)}
                                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50 shadow-sm transition-colors"
                                  title="Confirm Cash Received"
                                >
                                  {actionId === String(b.id) ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="verified" className="material-symbols-outlined text-[14px]" />}
                                  <span className="hidden sm:inline">Confirm Cash Received</span>
                                  <span className="sm:hidden">Paid</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </RecordRow>
                      );
                    })}
                  </tbody>
                </DataTable>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
