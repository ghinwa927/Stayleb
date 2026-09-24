"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { getBooking, approveBooking, rejectBooking } from "@/services/bookings";
import { getPaymentByBooking, markCashPaymentPaid, type PaymentResponse } from "@/services/payments";
import { getPublicProperty } from "@/services/properties";
import { getOwnerProperty, type PropertyResponse } from "@/services/owner";
import type { BookingResponse } from "@/services/bookings";

function formatPrice(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
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
  if (v === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (v === "confirmed") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (v === "cancelled") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (v === "rejected") return "bg-slate-100 text-slate-600 border border-slate-200";
  return "bg-slate-100 text-slate-600";
}
function paymentBadge(p: PaymentResponse) {
  const s = p.payment_status.toLowerCase();
  if (p.payment_method === "cash" && s === "pending") return "Cash · Pending";
  if (s === "paid") return `${p.payment_method} · Paid`;
  if (s === "pending") return `${p.payment_method} · Pending`;
  if (s === "refunded") return `${p.payment_method} · Refunded`;
  if (s === "partially_refunded") return `${p.payment_method} · Partially Refunded`;
  if (s === "cancelled") return `${p.payment_method} · Cancelled`;
  if (s === "failed") return `${p.payment_method} · Failed`;
  return `${p.payment_method} · ${p.payment_status}`;
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
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Booking request timed out — backend not responding")), 10000)),
      ]);
      setBooking(b);
      setLoading(false);
      // Fetch payment + property in parallel, non-blocking for booking display
      Promise.race([
        getPaymentByBooking(bookingId),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
      ])
        .then((pay) => setPayment(pay as PaymentResponse))
        .catch(() => setPayment(null));
      // Owner property: try owner endpoint first (works for any status), fallback to public
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

  async function handleApprove() {
    if (!bookingId) return;
    const res = await Swal.fire({
      title: `Approve cash booking #${bookingId}?`,
      html: `<div style="text-align:left;font-size:13px;line-height:1.5">Approving confirms the booking (<strong>pending → confirmed</strong>). The payment remains <strong style="color:#92400E">Pending Cash</strong> — it is <strong>not</strong> marked as paid. Commission becomes owed.</div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#157375",
      customClass: { popup: "rounded-2xl" },
    });
    if (!res.isConfirmed) return;
    setActionLoading("approve");
    try {
      const updated = await approveBooking(bookingId);
      setBooking(updated);
      try {
        const pay = await getPaymentByBooking(bookingId);
        setPayment(pay);
      } catch {}
      await Swal.fire({ title: "Approved", text: `Booking #${bookingId} confirmed. Payment remains ${payment?.payment_status || "pending"} (backend truth).`, icon: "success", confirmButtonColor: "#157375" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Approve failed";
      await Swal.fire({ title: "Approve failed", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!bookingId) return;
    const res = await Swal.fire({
      title: `Reject cash booking #${bookingId}?`,
      html: `<div style="text-align:left;font-size:13px;line-height:1.5">Rejecting sets status → <strong>rejected</strong> and releases dates for other guests. This cannot be undone.</div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Keep",
      confirmButtonColor: "#E11D48",
      customClass: { popup: "rounded-2xl" },
    });
    if (!res.isConfirmed) return;
    setActionLoading("reject");
    try {
      const updated = await rejectBooking(bookingId);
      setBooking(updated);
      try {
        const pay = await getPaymentByBooking(bookingId);
        setPayment(pay);
      } catch {}
      await Swal.fire({ title: "Rejected", text: `Booking #${bookingId} was rejected.`, icon: "success", confirmButtonColor: "#157375" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reject failed";
      await Swal.fire({ title: "Reject failed", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkPaid() {
    if (!bookingId || !booking || !payment) return;
    const total = formatPrice(booking.total_price);
    const res = await Swal.fire({
      title: "Confirm cash payment",
      html: `<div style="text-align:left;font-size:13px;line-height:1.6;color:#1E293B">
        <p style="font-weight:600;color:#157375;margin-bottom:8px">Only confirm this after you have actually received the cash payment from the client.</p>
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px;margin:8px 0">
          <div style="display:flex;justify-content:space-between"><span>Booking ID</span><strong>#SL-${String(booking.id).padStart(4, "0")}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Property</span><strong>${property?.title ? property.title.replace(/</g, "&lt;") : `Property #${booking.property_id}`}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Client</span><strong>#${booking.client_id}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Booking total</span><strong>${total}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px"><span>Payment method</span><strong>Cash</strong></div>
        </div>
        <p style="font-size:12px;color:#64748B;margin-top:8px">This will mark the payment as <strong>paid</strong> and set <em>paid_at</em>. The booking remains <strong>confirmed</strong>.</p>
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Cash Received",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#157375",
      cancelButtonColor: "#E7EEFF",
      customClass: { popup: "rounded-2xl", confirmButton: "rounded-full px-6", cancelButton: "rounded-full px-6" },
    });
    if (!res.isConfirmed) return;
    setActionLoading("markPaid");
    try {
      const updatedPayment = await markCashPaymentPaid(bookingId);
      setPayment(updatedPayment);
      // Refresh authoritative booking/payment
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
      await Swal.fire({ title: "Cash payment confirmed successfully.", text: `Payment for booking #SL-${String(booking.id).padStart(4, "0")} is now paid.`, icon: "success", confirmButtonColor: "#157375" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to mark as paid";
      await Swal.fire({ title: "Failed to confirm payment", text: msg, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="w-full pt-6 min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading booking #{bookingId}…</p>
        </div>
      </main>
    );
  }
  if (error) {
    const is403 = /403|not allowed/i.test(error);
    const is404 = /404|not found/i.test(error);
    return (
      <main className="w-full pt-6 min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Icon name={is404 ? "search_off" : is403 ? "lock" : "error"} className="material-symbols-outlined text-[36px] text-slate-400 mb-2" />
          <h2 className="font-title-md text-title-md font-bold text-on-surface mb-2">{is404 ? "Booking not found" : is403 ? "Not authorized" : "Failed to load"}</h2>
          <p className="text-sm text-slate-500 mb-4">{error}{is403 ? " — Owner can only view bookings for properties they own." : ""}</p>
          <Link href="/owner/bookings" className="px-5 py-2 rounded-lg bg-primary text-white text-sm">Back to Bookings</Link>
        </div>
      </main>
    );
  }
  if (!booking) {
    return (
      <main className="w-full pt-6 min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-slate-500">No booking data.</p>
      </main>
    );
  }

  const isPendingCash = booking.status === "pending" && payment?.payment_method === "cash" && payment?.payment_status === "pending";
  const isConfirmedCashPending = booking.status === "confirmed" && payment?.payment_method === "cash" && payment?.payment_status === "pending";
  const isCancelled = booking.status === "cancelled";
  const isRejected = booking.status === "rejected";
  const isCashPaid = payment?.payment_method === "cash" && payment?.payment_status === "paid";

  return (
    <>
      <main className={"w-full pt-6 min-h-screen bg-background"}>
        <div className={"flex flex-col w-full"}>
          <div className={"p-space-md sm:p-space-lg lg:p-margin-lg max-w-7xl mx-auto w-full space-y-space-md"}>
            <nav aria-label={"Breadcrumb"} className={"flex items-center gap-space-xxs text-body-md font-body-md"}>
              <Link className={"text-on-surface-variant hover:text-primary transition-colors"} href={"/owner"}>Dashboard</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-outline text-[16px] select-none" />
              <Link className={"text-on-surface-variant hover:text-primary transition-colors"} href={"/owner/bookings"}>Bookings</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-outline text-[16px] select-none" />
              <span className={"font-label-md text-label-md text-on-surface font-semibold"}>Booking #SL-{String(booking.id).padStart(4, "0")}</span>
            </nav>

            <div className={"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs pb-space-xs"}>
              <div>
                <div className={"flex items-center gap-space-xs flex-wrap"}>
                  <h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{isPendingCash ? "Cash Booking Request Details" : "Booking Details"}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bookingBadge(booking.status)}`}>{booking.status}</span>
                  {payment && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-xs font-medium border">{paymentBadge(payment)}</span>}
                </div>
                <p className={"font-caption text-caption text-on-surface-variant mt-1"}>Booking #SL-{String(booking.id).padStart(4, "0")} · Created {new Date(booking.created_at).toLocaleString()} · {booking.number_of_nights} nights · {booking.guests} guests</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/owner/bookings" className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-medium hover:bg-surface-container-high">Back to Bookings</Link>
              </div>
            </div>

            {isPendingCash && (
              <div className={"rounded-xl p-space-md bg-amber-50 shadow-sm flex items-start gap-space-sm text-[#92400E]"}>
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
              <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 flex items-start gap-3">
                <Icon name="cancel" className="material-symbols-outlined text-rose-600 text-[22px]" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-700 text-sm">Cancelled</p>
                  <p className="text-xs text-rose-600 mt-1">Cancelled at {booking.cancelled_at ? new Date(booking.cancelled_at).toLocaleString() : "—"} · {booking.cancellation_percentage ? `${Number(booking.cancellation_percentage).toFixed(0)}% fee` : ""}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="bg-white rounded-lg p-2"><div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Cancellation %</div><div className="font-semibold">{booking.cancellation_percentage ?? "—"}%</div></div>
                    <div className="bg-white rounded-lg p-2"><div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Fee</div><div className="font-semibold text-amber-700">{booking.cancellation_fee ? formatPrice(booking.cancellation_fee) : "—"}</div></div>
                    <div className="bg-white rounded-lg p-2"><div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Refund</div><div className="font-bold text-emerald-700">{booking.refund_amount ? formatPrice(booking.refund_amount) : payment?.refunded_amount ? formatPrice(payment.refunded_amount) : "$0.00"}</div></div>
                    <div className="bg-white rounded-lg p-2"><div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Owner earnings</div><div className="font-semibold">{booking.owner_cancellation_earnings ? formatPrice(booking.owner_cancellation_earnings) : "—"}</div></div>
                  </div>
                </div>
              </div>
            )}
            {isRejected && (
              <div className="rounded-xl p-4 bg-slate-100 border flex items-start gap-3">
                <Icon name="block" className="material-symbols-outlined text-slate-500 text-[22px]" />
                <div><p className="font-semibold text-sm">Rejected</p><p className="text-xs text-slate-500">This cash request was rejected. Dates were released.</p></div>
              </div>
            )}

            <div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start"}>
              <div className={"lg:col-span-7 space-y-space-md"}>
                <div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row gap-space-md"}>
                  <div className={"w-full sm:w-44 h-36 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container"}>
                    {property ? (
                      <LocalImage className={"w-full h-full object-cover"} src={property.images?.find((i) => i.is_primary)?.image_url || property.images?.[0]?.image_url || "/images/1424e299c7154217.jpg"} alt={property.title} />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Icon name="image" className="material-symbols-outlined text-slate-400" /></div>
                    )}
                    <span className={"absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption"}>{property?.property_type?.replace("_", " ") || "Property"}</span>
                  </div>
                  <div className={"flex-1 flex flex-col justify-between space-y-2"}>
                    <div>
                      <div className={"flex items-center justify-between"}>
                        <span className={"font-caption text-caption text-secondary font-semibold uppercase tracking-wider"}>{property?.location || `Property #${booking.property_id}`}</span>
                        {property && <span className={"flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary"}><Icon name="star" className="material-symbols-outlined text-[16px] text-amber-500" />4.96 (42)</span>}
                      </div>
                      <h2 className={"font-title-md text-title-md text-on-surface font-bold mt-0.5"}>{property?.title || `Property #${booking.property_id}`}</h2>
                      <p className={"font-caption text-caption text-on-surface-variant mt-1"}>Property #{booking.property_id} · {booking.guests} guests · Booking #{booking.id}</p>
                      {property && <p className="text-xs text-slate-500 mt-1">{property.bedrooms}BR · {property.beds} beds · {property.bathrooms} bath · {property.max_guests} max guests</p>}
                    </div>
                    <div className={"flex items-baseline gap-1 pt-space-xs"}>
                      <span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{formatPrice(property?.price_per_night || booking.price_per_night)}</span>
                      <span className={"font-caption text-caption text-on-surface-variant"}>USD / night</span>
                      <span className="ml-auto text-xs text-slate-500">{formatPrice(booking.total_price)} total</span>
                    </div>
                  </div>
                </div>

                <div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm space-y-space-sm"}>
                  <div className={"flex items-center justify-between pb-space-xxs"}>
                    <span className={"font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2"}>
                      <Icon name="calendar_month" className="material-symbols-outlined text-primary text-[20px]" />Reservation Timeline
                    </span>
                    <span className={"px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold"}>{booking.number_of_nights} Nights</span>
                  </div>
                  <div className={"grid grid-cols-1 sm:grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-low"}>
                    <div className={"space-y-1"}>
                      <span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-medium"}>Check-In</span>
                      <p className={"font-label-md text-label-md text-on-surface font-bold"}>{formatDateLong(booking.check_in)}</p>
                      <p className={"font-caption text-caption text-secondary font-semibold flex items-center gap-1"}><Icon name="schedule" className="material-symbols-outlined text-[14px]" /> 3:00 PM onwards</p>
                    </div>
                    <div className={"space-y-1 sm:border-l border-outline-variant/30 sm:pl-space-sm"}>
                      <span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-medium"}>Check-Out</span>
                      <p className={"font-label-md text-label-md text-on-surface font-bold"}>{formatDateLong(booking.check_out)}</p>
                      <p className={"font-caption text-caption text-on-surface-variant flex items-center gap-1"}><Icon name="schedule" className="material-symbols-outlined text-[14px]" /> 11:00 AM strict</p>
                    </div>
                  </div>
                  <div className={"flex items-center gap-space-xs text-xs text-slate-500 mt-1"}>
                    <span>Client ID: #{booking.client_id}</span><span>·</span><span>Booking ID: #{booking.id}</span><span>·</span><span className="capitalize">{booking.status}</span>
                    <span className="ml-auto text-[10px]">Client email/name not in GET /bookings/{`{id}`} — shown as ID only</span>
                  </div>
                </div>

                <div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm space-y-space-sm"}>
                  <span className={"font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2"}>
                    <Icon name="payments" className="material-symbols-outlined text-primary text-[20px]" />Financial Summary (Owner view)
                  </span>
                  <div className={"space-y-1 pt-2 text-sm"}>
                    <div className="flex justify-between"><span>Booking total</span><span className="font-semibold">{formatPrice(booking.total_price)}</span></div>
                    <div className="flex justify-between"><span>{booking.price_per_night ? `${formatPrice(booking.price_per_night)} × ${booking.number_of_nights} nights` : "Nights"}</span><span>{formatPrice(booking.total_price)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Commission ({Number(booking.commission_percentage).toFixed(1)}%)</span><span>{formatPrice(booking.commission_amount)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Owner earnings</span><span className="text-primary">{formatPrice(booking.owner_earnings)}</span></div>
                    {isCancelled && booking.cancellation_fee && (
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-amber-700"><span>Cancellation fee ({booking.cancellation_percentage}%)</span><span>{formatPrice(booking.cancellation_fee)}</span></div>
                        <div className="flex justify-between font-bold"><span>Refund</span><span>{formatPrice(booking.refund_amount)}</span></div>
                        {booking.owner_cancellation_earnings && <div className="flex justify-between text-xs text-slate-500"><span>Owner cancellation earnings</span><span>{formatPrice(booking.owner_cancellation_earnings)}</span></div>}
                      </div>
                    )}
                  </div>
                  {payment ? (
                    <div className="p-3 rounded-lg bg-surface-container-low space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Payment</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${payment.payment_status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : payment.payment_status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600"}`}>{paymentBadge(payment)}</span>
                      </div>
                      <div className="text-xs text-slate-600">Amount {formatPrice(payment.amount)} · Method {payment.payment_method}</div>
                      <div className="text-xs text-slate-500">Status {payment.payment_status} {payment.paid_at ? `· Paid ${new Date(payment.paid_at).toLocaleString()}` : ""}</div>
                      {(payment.payment_status === "refunded" || payment.payment_status === "partially_refunded") && <div className="text-xs text-emerald-700">Refunded {formatPrice(payment.refunded_amount)} {payment.stripe_refund_id ? `· Refund ${payment.stripe_refund_id}` : ""}</div>}
                      {isPendingCash && <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">Approving keeps payment as <strong>Pending Cash</strong> — not paid.</div>}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">No payment record yet — booking pending</div>
                  )}
                  <p className="text-xs text-slate-500">Source: GET /payments/bookings/{booking.id} {payment ? "— real backend record" : "— none yet"} · Role-aware endpoint.</p>
                </div>
              </div>

              <div className={"lg:col-span-5 space-y-space-md lg:sticky lg:top-20"}>
                <div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-md space-y-space-md"}>
                  <div className={"border-b border-surface-container-high pb-space-xs"}>
                    <div className={"flex items-center justify-between"}>
                      <h2 className={"font-title-md text-title-md text-on-surface font-bold"}>Owner Decision</h2>
                      <span className={`w-2.5 h-2.5 rounded-full ${isPendingCash || isConfirmedCashPending ? "bg-amber-500 animate-ping" : "bg-slate-300"}`}></span>
                    </div>
                    <p className={"font-caption text-caption text-on-surface-variant mt-1"}>
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

                  {isPendingCash ? (
                    <>
                      <button onClick={handleApprove} disabled={!!actionLoading} className={`w-full h-12 px-space-md rounded-xl font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${actionLoading === "approve" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-primary hover:bg-[#115E60] text-white"}`}>
                        {actionLoading === "approve" ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Approving…</> : <><Icon name="check_circle" className="material-symbols-outlined text-[20px]" /> Approve Booking Request</>}
                      </button>
                      <button onClick={handleReject} disabled={!!actionLoading} className={`w-full h-11 px-space-md rounded-xl font-label-md font-semibold flex items-center justify-center gap-2 shadow-sm ${actionLoading === "reject" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-white hover:bg-rose-50 text-[#E11D48] border"}`}>
                        {actionLoading === "reject" ? <><span className="w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" /> Rejecting…</> : <><Icon name="cancel" className="material-symbols-outlined text-[20px]" /> Reject Request</>}
                      </button>
                      <div className={"p-space-sm rounded-lg bg-surface-container flex items-start gap-space-xs text-on-surface-variant"}>
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
                      <button onClick={handleMarkPaid} disabled={!!actionLoading} className={`w-full h-12 px-space-md rounded-xl font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${actionLoading === "markPaid" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-[#157375] hover:bg-[#0f5a5b] text-white"}`}>
                        {actionLoading === "markPaid" ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming…</> : <><Icon name="verified" className="material-symbols-outlined text-[20px]" /> Confirm Cash Received</>}
                      </button>
                      <p className="text-xs text-slate-500 text-center">Only confirm after cash is in hand. This sets payment to <strong>paid</strong> and records <em>paid_at</em>.</p>
                    </>
                  ) : isCashPaid ? (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm"><Icon name="check_circle" className="material-symbols-outlined text-[18px]" /> Cash Paid</div>
                      <p className="text-xs text-emerald-700 mt-1">Payment is <strong>paid</strong>{payment?.paid_at ? ` on ${new Date(payment.paid_at).toLocaleString()}` : ""}. Booking remains <strong>confirmed</strong>.</p>
                      <div className="mt-2 text-xs text-slate-500">Paid at: {payment?.paid_at ? new Date(payment.paid_at).toLocaleString() : "—"}</div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-50 text-center text-sm text-slate-500">
                      {isCancelled ? "Cancelled bookings remain in history. No action." : isRejected ? "Rejected bookings remain in history." : `No cash action — booking status is ${booking.status}${payment ? `, payment ${payment.payment_method} ${payment.payment_status}` : ""}.`}
                      <div className="mt-3">
                        <Link href="/owner/bookings" className="text-primary underline text-xs">Back to bookings</Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className={"rounded-xl p-space-md bg-surface-container-low shadow-sm space-y-space-xs"}>
                  <span className={"font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider"}>Host Protection & Terms</span>
                  <ul className={"space-y-2 pt-1 font-caption text-caption text-on-surface-variant"}>
                    <li className={"flex items-start gap-2"}><Icon name="verified_user" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" /><span>Owner can only view bookings for properties they own (403 otherwise).</span></li>
                    <li className={"flex items-start gap-2"}><Icon name="receipt_long" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" /><span>{payment?.payment_status === "paid" ? "Payment is paid (Stripe) — do not create another PaymentIntent." : "Do not mark cash pending as paid after approval."}</span></li>
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
