"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { getBooking, approveBooking, rejectBooking } from "@/services/bookings";
import { getPaymentByBooking, markCashPaymentPaid, type PaymentResponse } from "@/services/payments";
import { getPublicProperty } from "@/services/properties";
import { getOwnerProperty, type PropertyResponse } from "@/services/owner";
import type { BookingResponse } from "@/services/bookings";

function formatPrice(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function formatCancellationAmount(value: string | null | undefined) {
  if (value === null || value === undefined || String(value).trim() === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount) ? formatPrice(amount) : "—";
}
function formatCancellationPercentage(value: string | null | undefined) {
  if (value === null || value === undefined || String(value).trim() === "") return "—";
  const percentage = Number(value);
  if (!Number.isFinite(percentage)) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(percentage)}%`;
}
function formatCancellationDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}
function formatDateLong(d: string) {
  try {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}
function bookingBadge(s: string) {
  const v = s.toLowerCase();
  if (v === "pending") return { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500", text: "Pending" };
  if (v === "confirmed") return { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", text: "Confirmed" };
  if (v === "cancelled") return { cls: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500", text: "Cancelled" };
  if (v === "rejected") return { cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400", text: "Rejected" };
  return { cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400", text: s };
}
function paymentBadgeInfo(p: PaymentResponse) {
  const s = p.payment_status.toLowerCase();
  if (p.payment_method === "cash" && s === "pending") return { label: "Cash · Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" };
  if (s === "paid") return { label: `${p.payment_method} · Paid`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" };
  if (s === "pending") return { label: `${p.payment_method} · Pending`, cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" };
  if (s === "refunded") return { label: `${p.payment_method} · Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" };
  if (s === "partially_refunded") return { label: `${p.payment_method} · Partially Refunded`, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" };
  if (s === "cancelled") return { label: `${p.payment_method} · Cancelled`, cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
  if (s === "failed") return { label: `${p.payment_method} · Failed`, cls: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500" };
  return { label: `${p.payment_method} · ${p.payment_status}`, cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
}

export function CashBookingRequestDetailsSection0() {
  const params = useParams() as { id?: string };
  const bookingId = params.id || null;

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | "markPaid" | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  function showSuccess(title: string, message: string) {
    setNotification({ type: "success", title, message });
    setTimeout(() => setNotification(null), 4000);
  }
  function showError(title: string, message: string) {
    setNotification({ type: "error", title, message });
    setTimeout(() => setNotification(null), 5000);
  }

  async function load() {
    if (!bookingId) {
      setError("Missing booking ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const b = await Promise.race([
        getBooking(bookingId),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Unable to load booking details. Please try again.")), 10000)),
      ]);
      setBooking(b);
      setLoading(false);
      Promise.race([
        getPaymentByBooking(bookingId),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
      ])
        .then((pay) => setPayment(pay as PaymentResponse))
        .catch(() => setPayment(null));
      Promise.race([
        getOwnerProperty(b.property_id).catch(() => getPublicProperty(b.property_id)),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
      ])
        .then((prop) => setProperty(prop as PropertyResponse))
        .catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  async function handleApproveConfirm() {
    if (!bookingId) return;
    setApproveModalOpen(false);
    setActionLoading("approve");
    try {
      const updated = await approveBooking(bookingId);
      setBooking(updated);
      try {
        const pay = await getPaymentByBooking(bookingId);
        setPayment(pay);
      } catch {}
      showSuccess("Approved", `Booking #${bookingId} confirmed. Payment remains pending.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Approve failed";
      showError("Approve failed", msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectConfirm() {
    if (!bookingId) return;
    setRejectModalOpen(false);
    setActionLoading("reject");
    try {
      const updated = await rejectBooking(bookingId);
      setBooking(updated);
      try {
        const pay = await getPaymentByBooking(bookingId);
        setPayment(pay);
      } catch {}
      showSuccess("Rejected", `Booking #${bookingId} was rejected.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reject failed";
      showError("Reject failed", msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkPaidConfirm() {
    if (!bookingId || !booking || !payment) return;
    setMarkPaidModalOpen(false);
    setActionLoading("markPaid");
    try {
      const updatedPayment = await markCashPaymentPaid(bookingId);
      setPayment(updatedPayment);
      try {
        const freshBooking = await getBooking(bookingId);
        setBooking(freshBooking);
      } catch {}
      try {
        const freshPayment = await getPaymentByBooking(bookingId);
        setPayment(freshPayment);
      } catch {
        setPayment(updatedPayment);
      }
      showSuccess("Cash payment confirmed successfully.", `Payment for booking #SL-${String(booking.id).padStart(4, "0")} is now paid.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to mark as paid";
      showError("Failed to confirm payment", msg);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="w-full pt-6 min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#46B1B1]">Loading booking #{bookingId}…</p>
        </div>
      </main>
    );
  }
  if (error) {
    const is403 = /403|not allowed/i.test(error);
    const is404 = /404|not found/i.test(error);
    return (
      <main className="w-full pt-6 min-h-screen bg-surface-container-low flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Icon name={is404 ? "search_off" : is403 ? "lock" : "error"} className="material-symbols-outlined text-[36px] text-[#46B1B1]/40 mb-2" />
          <h2 className="font-title-md text-title-md font-bold text-[#46B1B1] mb-2">{is404 ? "Booking not found" : is403 ? "Not authorized" : "Failed to load"}</h2>
          <p className="text-sm text-[#46B1B1]/70 mb-4">{error}{is403 ? " — Only bookings for your own properties are visible." : ""}</p>
          <Link href="/owner/bookings" className="px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <Icon name="arrow_back" className="material-symbols-outlined text-[16px]" />
            Back to Bookings
          </Link>
        </div>
      </main>
    );
  }
  if (!booking) {
    return (
      <main className="w-full pt-6 min-h-screen bg-surface-container-low flex items-center justify-center">
        <p className="text-sm text-[#46B1B1]/70">No booking data.</p>
      </main>
    );
  }

  const isPendingCash = booking.status === "pending" && payment?.payment_method === "cash" && payment?.payment_status === "pending";
  const isConfirmedCashPending = booking.status === "confirmed" && payment?.payment_method === "cash" && payment?.payment_status === "pending";
  const isCancelled = booking.status === "cancelled";
  const isRejected = booking.status === "rejected";
  const isCashPaid = payment?.payment_method === "cash" && payment?.payment_status === "paid";
  const bookingBadgeInfo = bookingBadge(booking.status);

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

      {approveModalOpen && (
        <Modal title={`Approve cash booking #${bookingId}?`} onClose={() => setApproveModalOpen(false)}>
          <div className="text-[#46B1B1] text-sm mb-6">
            <p>Approving confirms the booking (<strong>pending → confirmed</strong>). The payment remains <strong style="color:#92400E">Pending Cash</strong> — it is <strong>not</strong> marked as paid. Commission becomes owed.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setApproveModalOpen(false)} className="px-4 py-2 rounded-lg bg-surface-container text-[#46B1B1] font-label-sm hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
            <button onClick={handleApproveConfirm} className="px-4 py-2 rounded-lg bg-primary text-white font-label-sm hover:bg-primary/90 shadow-sm transition-colors">
              Approve
            </button>
          </div>
        </Modal>
      )}

      {rejectModalOpen && (
        <Modal title={`Reject cash booking #${bookingId}?`} onClose={() => setRejectModalOpen(false)}>
          <div className="text-[#46B1B1] text-sm mb-6">
            <p>Rejecting sets status → <strong>rejected</strong> and releases dates for other guests. This cannot be undone.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 rounded-lg bg-surface-container text-[#46B1B1] font-label-sm hover:bg-surface-container-high transition-colors">
              Keep
            </button>
            <button onClick={handleRejectConfirm} className="px-4 py-2 rounded-lg bg-rose-600 text-white font-label-sm hover:bg-rose-700 shadow-sm transition-colors">
              Reject
            </button>
          </div>
        </Modal>
      )}

      {markPaidModalOpen && booking && payment && (
        <Modal title="Confirm cash payment" onClose={() => setMarkPaidModalOpen(false)}>
          <div className="text-[#46B1B1] text-sm mb-6 space-y-3">
            <p className="font-semibold text-[#46B1B1]">Only confirm this after you have actually received the cash payment from the client.</p>
            <div className="bg-surface-container-low border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between"><span>Booking ID</span><strong className="font-mono">#SL-{String(booking.id).padStart(4, "0")}</strong></div>
              <div className="flex justify-between"><span>Property</span><strong>{property?.title || `Property #${booking.property_id}`}</strong></div>
              <div className="flex justify-between"><span>Client</span><strong>Booking Guest #{booking.client_id}</strong></div>
              <div className="flex justify-between"><span>Booking total</span><strong>{formatPrice(booking.total_price)}</strong></div>
              <div className="flex justify-between"><span>Payment method</span><strong>Cash</strong></div>
            </div>
            <p className="text-xs text-[#46B1B1]/70">This will mark the payment as <strong>paid</strong> and set <em>paid_at</em>. The booking remains <strong>confirmed</strong>.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setMarkPaidModalOpen(false)} className="px-4 py-2 rounded-lg bg-surface-container text-[#46B1B1] font-label-sm hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
            <button onClick={handleMarkPaidConfirm} className="px-4 py-2 rounded-lg bg-primary text-white font-label-sm hover:bg-primary/90 shadow-sm transition-colors">
              Confirm Cash Received
            </button>
          </div>
        </Modal>
      )}

      <main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
        <div className={"flex flex-col w-full max-w-7xl mx-auto"}>
          <nav aria-label={"Breadcrumb"} className={"flex items-center gap-space-xxs text-body-md font-body-md text-[#46B1B1] mb-space-md"}>
            <Link className={"text-[#46B1B1]/70 hover:text-primary transition-colors flex items-center gap-1"} href={"/owner"}>
              <Icon name="space_dashboard" className="material-symbols-outlined text-[14px]" />
              Dashboard
            </Link>
            <Icon name="chevron_right" className="material-symbols-outlined text-outline text-[16px] select-none" />
            <Link className={"text-[#46B1B1]/70 hover:text-primary transition-colors"} href={"/owner/bookings"}>Bookings</Link>
            <Icon name="chevron_right" className="material-symbols-outlined text-outline text-[16px] select-none" />
            <span className={"font-label-md text-label-md text-[#46B1B1] font-semibold"}>Booking #SL-{String(booking.id).padStart(4, "0")}</span>
          </nav>

          <div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl"}>
            <div className={"flex flex-col gap-space-xxs"}>
              <div className="flex items-center gap-space-xs flex-wrap">
                <h1 className={"font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight"}>{isPendingCash ? "Cash Booking Request Details" : "Booking Details"}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bookingBadgeInfo.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${bookingBadgeInfo.dot}`}></span>
                  {bookingBadgeInfo.text}
                </span>
                {payment && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${paymentBadgeInfo(payment).cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${paymentBadgeInfo(payment).dot}`}></span>
                    {paymentBadgeInfo(payment).label}
                  </span>
                )}
              </div>
              <p className={"font-body-md text-body-md text-[#46B1B1] mt-1"}>Booking #SL-{String(booking.id).padStart(4, "0")} · Created {new Date(booking.created_at).toLocaleString()} · {booking.number_of_nights} nights · {booking.guests} guests</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md text-[#46B1B1] font-label-md text-label-md transition-all">
                <Icon name="refresh" className="material-symbols-outlined text-[18px] text-primary" />
                Refresh
              </button>
              <Link href="/owner/bookings" className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md shadow-sm hover:bg-primary/90 transition-all">
                <Icon name="arrow_back" className="material-symbols-outlined text-[18px]" />
                Back to Bookings
              </Link>
            </div>
          </div>

          {isPendingCash && (
            <div className={"rounded-xl p-space-md bg-amber-50 shadow-sm flex items-start gap-space-sm text-[#92400E] mb-space-xl"}>
              <Icon name="warning" className="material-symbols-outlined text-[24px] text-[#D97706] flex-shrink-0 mt-0.5" />
              <div className={"flex-1 space-y-1"}>
                <p className={"font-label-md text-label-md font-semibold text-[#78350F]"}>Action Required: Cash on Arrival Reservation</p>
                <p className={"font-body-md text-body-md text-[#92400E] leading-relaxed"}>
                  These dates (<span className={"font-semibold"}>{formatDateLong(booking.check_in)} – {formatDateLong(booking.check_out)}</span>) are temporarily held. Approving confirms the booking and marks platform commission as owed. Rejecting releases the dates.
                </p>
              </div>
            </div>
          )}
          {isCancelled && (
            <section aria-labelledby="cancellation-details" className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm mb-space-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <Icon name="cancel" className="material-symbols-outlined text-rose-600 text-[22px] shrink-0" />
                  <div>
                    <h2 id="cancellation-details" className="font-label-md text-label-md font-bold text-[#46B1B1]">Cancellation Details</h2>
                    <p className="mt-1 text-xs text-rose-700">Cancelled on <span className="font-semibold">{formatCancellationDate(booking.cancelled_at)}</span></p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                  Cancellation deduction <strong className="ml-1">{formatCancellationPercentage(booking.cancellation_percentage)}</strong>
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-lg border border-rose-100 bg-white p-3">
                  <div className="font-semibold uppercase tracking-wider text-[10px] text-[#46B1B1]/60">Cancellation Fee</div>
                  <div className="mt-1 font-semibold text-amber-700">{formatCancellationAmount(booking.cancellation_fee)}</div>
                </div>
                <div className="rounded-lg border border-rose-100 bg-white p-3">
                  <div className="font-semibold uppercase tracking-wider text-[10px] text-[#46B1B1]/60">Client Refund</div>
                  <div className="mt-1 font-bold text-emerald-700">{formatCancellationAmount(booking.refund_amount)}</div>
                </div>
                <div className="rounded-lg border border-rose-100 bg-white p-3">
                  <div className="font-semibold uppercase tracking-wider text-[10px] text-[#46B1B1]/60">StayLeb Commission</div>
                  <div className="mt-1 font-semibold text-primary">{formatCancellationAmount(booking.cancellation_commission_amount)}</div>
                </div>
                <div className="rounded-lg border border-rose-100 bg-white p-3">
                  <div className="font-semibold uppercase tracking-wider text-[10px] text-[#46B1B1]/60">Your Cancellation Earnings</div>
                  <div className="mt-1 font-semibold text-emerald-700">{formatCancellationAmount(booking.owner_cancellation_earnings)}</div>
                </div>
              </div>
            </section>
          )}
          {isRejected && (
            <div className="rounded-xl p-4 bg-slate-100 border flex items-start gap-3 mb-space-xl">
              <Icon name="block" className="material-symbols-outlined text-slate-500 text-[22px]" />
              <div><p className="font-semibold text-sm text-[#46B1B1]">Rejected</p><p className="text-xs text-[#46B1B1]/70">This cash request was rejected. Dates were released.</p></div>
            </div>
          )}

          <div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start"}>
            <div className={"lg:col-span-7 space-y-space-md"}>
              <div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
                <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright">
                  <div className={"flex items-center gap-space-xs"}>
                    <Icon name="villa" className="material-symbols-outlined text-primary text-[20px]" />
                    <div>
                      <h2 className={"font-title-md text-title-md text-[#46B1B1] tracking-tight"}>{"Property Snapshot"}</h2>
                      <p className={"font-caption text-caption text-[#46B1B1]"}>Reserved property details and pricing</p>
                    </div>
                  </div>
                  <span className={"px-2 py-0.5 rounded-full bg-surface-container text-[#46B1B1] font-caption text-caption font-semibold"}>
                    {property?.property_type?.replace("_", " ") || "Property"}
                  </span>
                </div>
                <div className="p-space-md flex flex-col sm:flex-row gap-space-md">
                  <div className={"w-full sm:w-44 h-36 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container"}>
                    {property ? (
                      <LocalImage className={"w-full h-full object-cover"} src={property.images?.find((i) => i.is_primary)?.image_url || property.images?.[0]?.image_url || "/images/1424e299c7154217.jpg"} alt={property.title} />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Icon name="image" className="material-symbols-outlined text-slate-400" /></div>
                    )}
                  </div>
                  <div className={"flex-1 flex flex-col justify-between space-y-2"}>
                    <div>
                      <div className={"flex items-center justify-between"}>
                        <span className={"font-caption text-caption text-secondary font-semibold uppercase tracking-wider flex items-center gap-1"}>
                          <Icon name="location_on" className="material-symbols-outlined text-[14px]" />
                          {property?.location || `Property #${booking.property_id}`}
                        </span>
                      </div>
                      <h2 className={"font-title-md text-title-md text-[#46B1B1] font-bold mt-0.5"}>{property?.title || `Property #${booking.property_id}`}</h2>
                      <p className={"font-caption text-caption text-[#46B1B1]/70 mt-1"}>Property #{booking.property_id} · {booking.guests} guests · Booking #{booking.id}</p>
                      {property && <p className="text-xs text-[#46B1B1]/70 mt-1">{property.bedrooms}BR · {property.beds} beds · {property.bathrooms} bath · {property.max_guests} max guests</p>}
                    </div>
                    <div className={"flex items-baseline gap-1 pt-space-xs"}>
                      <span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{formatPrice(property?.price_per_night || booking.price_per_night)}</span>
                      <span className={"font-caption text-caption text-[#46B1B1]/70"}>USD / night</span>
                      <span className="ml-auto text-xs text-[#46B1B1]/70">{formatPrice(booking.total_price)} total</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
                <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright">
                  <div className={"flex items-center gap-space-xs"}>
                    <Icon name="calendar_month" className="material-symbols-outlined text-primary text-[20px]" />
                    <div>
                      <h2 className={"font-title-md text-title-md text-[#46B1B1] tracking-tight"}>{"Reservation Timeline"}</h2>
                      <p className={"font-caption text-caption text-[#46B1B1]"}>Stay dates and guest information</p>
                    </div>
                  </div>
                  <span className={"px-space-xs py-0.5 rounded-full bg-surface-container-high text-[#46B1B1] font-label-sm text-label-sm font-bold"}>{booking.number_of_nights} Nights</span>
                </div>
                <div className="p-space-md space-y-space-sm">
                  <div className={"grid grid-cols-1 sm:grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-low"}>
                    <div className={"space-y-1"}>
                      <span className={"font-caption text-caption text-[#46B1B1]/70 uppercase tracking-wider font-medium"}>Check-In</span>
                      <p className={"font-label-md text-label-md text-[#46B1B1] font-bold"}>{formatDateLong(booking.check_in)}</p>
                    </div>
                    <div className={"space-y-1 sm:border-l border-outline-variant/30 sm:pl-space-sm"}>
                      <span className={"font-caption text-caption text-[#46B1B1]/70 uppercase tracking-wider font-medium"}>Check-Out</span>
                      <p className={"font-label-md text-label-md text-[#46B1B1] font-bold"}>{formatDateLong(booking.check_out)}</p>
                    </div>
                  </div>
                  <div className={"flex items-center gap-space-xs text-xs text-[#46B1B1]/70"}>
                    <span>Client ID: #{booking.client_id}</span><span>·</span><span>Booking ID: #{booking.id}</span><span>·</span><span className="capitalize">{booking.status}</span>
                  </div>
                </div>
              </div>

              <div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
                <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-bright">
                  <div className={"flex items-center gap-space-xs"}>
                    <Icon name="payments" className="material-symbols-outlined text-primary text-[20px]" />
                    <div>
                      <h2 className={"font-title-md text-title-md text-[#46B1B1] tracking-tight"}>{"Financial Summary"}</h2>
                      <p className={"font-caption text-caption text-[#46B1B1]"}>Owner view — pricing, commission, and earnings</p>
                    </div>
                  </div>
                </div>
                <div className="p-space-md space-y-space-sm">
                  <div className={"space-y-1.5 pt-2 text-sm text-[#46B1B1]"}>
                    <div className="flex justify-between"><span>Booking total</span><span className="font-semibold">{formatPrice(booking.total_price)}</span></div>
                    <div className="flex justify-between"><span>{booking.price_per_night ? `${formatPrice(booking.price_per_night)} × ${booking.number_of_nights} nights` : "Nights"}</span><span>{formatPrice(booking.total_price)}</span></div>
                    <div className="flex justify-between text-[#46B1B1]/70"><span>Commission ({Number(booking.commission_percentage).toFixed(1)}%)</span><span>{formatPrice(booking.commission_amount)}</span></div>
                    <div className="flex justify-between font-semibold pt-1 border-t border-surface-container"><span>Owner earnings</span><span className="text-primary">{formatPrice(booking.owner_earnings)}</span></div>
                    {isCancelled && (
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-[#46B1B1]/70"><span>Cancellation deduction</span><span>{formatCancellationPercentage(booking.cancellation_percentage)}</span></div>
                        <div className="flex justify-between text-amber-700"><span>Cancellation fee</span><span>{formatCancellationAmount(booking.cancellation_fee)}</span></div>
                        <div className="flex justify-between font-bold"><span>Client refund</span><span>{formatCancellationAmount(booking.refund_amount)}</span></div>
                        <div className="flex justify-between text-primary"><span>StayLeb commission</span><span>{formatCancellationAmount(booking.cancellation_commission_amount)}</span></div>
                        <div className="flex justify-between text-xs text-[#46B1B1]/70"><span>Your cancellation earnings</span><span>{formatCancellationAmount(booking.owner_cancellation_earnings)}</span></div>
                      </div>
                    )}
                  </div>
                  {payment ? (
                    <div className="p-3 rounded-lg bg-surface-container-low space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#46B1B1]">Payment</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold inline-flex items-center gap-1 ${paymentBadgeInfo(payment).cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${paymentBadgeInfo(payment).dot}`}></span>
                          {paymentBadgeInfo(payment).label}
                        </span>
                      </div>
                      <div className="text-xs text-[#46B1B1]/70">Amount {formatPrice(payment.amount)} · Method {payment.payment_method}</div>
                      <div className="text-xs text-[#46B1B1]/70">Status {payment.payment_status} {payment.paid_at ? `· Paid ${new Date(payment.paid_at).toLocaleString()}` : ""}</div>
                      {(payment.payment_status === "refunded" || payment.payment_status === "partially_refunded") && <div className="text-xs text-emerald-700">Refunded {formatPrice(payment.refunded_amount)} {payment.stripe_refund_id ? `· Refund ${payment.stripe_refund_id}` : ""}</div>}
                      {isPendingCash && <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">Approving keeps payment as <strong>Pending Cash</strong> — not paid.</div>}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">No payment record yet — booking pending</div>
                  )}
                </div>
              </div>
            </div>

            <div className={"lg:col-span-5 space-y-space-md lg:sticky lg:top-20"}>
              <div className={"bg-surface-container-lowest rounded-xl shadow-md overflow-hidden"}>
                <div className="p-space-md border-b border-surface-container-high bg-surface-bright">
                  <div className={"flex items-center justify-between"}>
                    <div className="flex items-center gap-space-xs">
                      <Icon name="task_alt" className="material-symbols-outlined text-primary text-[20px]" />
                      <h2 className={"font-title-md text-title-md text-[#46B1B1] font-bold"}>Owner Decision</h2>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${isPendingCash || isConfirmedCashPending ? "bg-amber-500 animate-ping" : "bg-slate-300"}`}></span>
                  </div>
                  <p className={"font-caption text-caption text-[#46B1B1] mt-1"}>
                    {isPendingCash
                      ? "Accept or decline this reservation request. Action is irrevocable."
                      : isConfirmedCashPending
                        ? "Booking is confirmed — waiting for cash payment to be collected."
                        : isCancelled
                          ? "This booking is cancelled — no action."
                          : isRejected
                            ? "This booking was rejected."
                            : isCashPaid
                              ? "Cash payment has been confirmed as received."
                              : "This booking is not pending cash — no approve/reject."}
                  </p>
                </div>
                <div className="p-space-md space-y-space-md">
                  {isPendingCash ? (
                    <>
                      <button onClick={() => setApproveModalOpen(true)} disabled={!!actionLoading} className={`w-full h-12 px-space-md rounded-xl font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${actionLoading === "approve" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-white"}`}>
                        {actionLoading === "approve" ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Approving…</> : <><Icon name="check_circle" className="material-symbols-outlined text-[20px]" /> Approve Booking Request</>}
                      </button>
                      <button onClick={() => setRejectModalOpen(true)} disabled={!!actionLoading} className={`w-full h-11 px-space-md rounded-xl font-label-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${actionLoading === "reject" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-white hover:bg-rose-50 text-[#E11D48] border border-rose-200"}`}>
                        {actionLoading === "reject" ? <><span className="w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" /> Rejecting…</> : <><Icon name="cancel" className="material-symbols-outlined text-[20px]" /> Reject Request</>}
                      </button>
                      <div className={"p-space-sm rounded-lg bg-surface-container flex items-start gap-space-xs text-[#46B1B1]"}>
                        <Icon name="policy" className="material-symbols-outlined text-outline text-[18px] flex-shrink-0 mt-0.5" />
                        <p className={"font-caption text-caption leading-relaxed"}>Approving = <strong>confirmed</strong> but payment stays <strong>Pending Cash</strong>. Commission becomes owed.</p>
                      </div>
                    </>
                  ) : isConfirmedCashPending ? (
                    <>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                        <div className="flex items-center gap-2 font-semibold"><Icon name="payments" className="material-symbols-outlined text-[18px]" /> Cash Awaiting Payment</div>
                        <p className="text-xs mt-1 text-amber-700">Booking is <strong>confirmed</strong>. Payment method <strong>Cash</strong> is still <strong>pending</strong>. Confirm only after you have physically received <strong>{formatPrice(booking.total_price)}</strong> from the client.</p>
                      </div>
                      <button onClick={() => setMarkPaidModalOpen(true)} disabled={!!actionLoading} className={`w-full h-12 px-space-md rounded-xl font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${actionLoading === "markPaid" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-white"}`}>
                        {actionLoading === "markPaid" ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming…</> : <><Icon name="verified" className="material-symbols-outlined text-[20px]" /> Confirm Cash Received</>}
                      </button>
                      <p className="text-xs text-[#46B1B1]/70 text-center">Only confirm after cash is in hand. This sets payment to <strong>paid</strong> and records <em>paid_at</em>.</p>
                    </>
                  ) : isCashPaid ? (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm"><Icon name="check_circle" className="material-symbols-outlined text-[18px]" /> Cash Paid</div>
                      <p className="text-xs text-emerald-700 mt-1">Payment is <strong>paid</strong>{payment?.paid_at ? ` on ${new Date(payment.paid_at).toLocaleString()}` : ""}. Booking remains <strong>confirmed</strong>.</p>
                      <div className="mt-2 text-xs text-emerald-700/80">Paid at: {payment?.paid_at ? new Date(payment.paid_at).toLocaleString() : "—"}</div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-surface-container-low text-center text-sm text-[#46B1B1]/70">
                      {isCancelled ? "Cancelled bookings remain in history. No action." : isRejected ? "Rejected bookings remain in history." : `No cash action — booking status is ${booking.status}${payment ? `, payment ${payment.payment_method} ${payment.payment_status}` : ""}.`}
                      <div className="mt-3">
                        <Link href="/owner/bookings" className="text-primary underline text-xs hover:text-[#46B1B1]">Back to bookings</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"}>
                <div className="p-space-md border-b border-surface-container-high bg-surface-bright">
                  <span className={"font-label-sm text-label-sm font-bold text-[#46B1B1] uppercase tracking-wider flex items-center gap-2"}>
                    <Icon name="shield" className="material-symbols-outlined text-secondary text-[16px]" />
                    Host Protection & Terms
                  </span>
                </div>
                <div className="p-space-md">
                  <ul className={"space-y-2 font-caption text-caption text-[#46B1B1]/80"}>
                    <li className={"flex items-start gap-2"}><Icon name="verified_user" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" /><span>Only bookings for your own properties are visible.</span></li>
                    <li className={"flex items-start gap-2"}><Icon name="receipt_long" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" /><span>{payment?.payment_status === "paid" ? "Payment is paid — do not create another PaymentIntent." : "Do not mark cash pending as paid after approval."}</span></li>
                    <li className={"flex items-start gap-2"}><Icon name="info" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" /><span>Dates unlock immediately if rejected.</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
