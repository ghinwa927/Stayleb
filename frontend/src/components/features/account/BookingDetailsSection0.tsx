"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton } from "@/components/ui/Interactions";
import { getBooking, cancelBooking } from "@/services/bookings";
import type { BookingResponse } from "@/services/bookings";
import { getPaymentByBooking } from "@/services/payments";
import type { PaymentResponse } from "@/services/payments";
import { getPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
import { getReviewByBooking, type Review } from "@/services/reviews";

function formatPrice(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDateLong(dateStr: string) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "pending") return { bg: "bg-amber-50 text-amber-700", icon: "hourglass_top", label: "Pending" };
  if (s === "confirmed" || s === "paid") return { bg: "bg-emerald-50 text-emerald-700", icon: "check_circle", label: "Confirmed" };
  if (s === "completed") return { bg: "bg-blue-50 text-blue-700", icon: "task_alt", label: "Completed" };
  if (s === "cancelled") return { bg: "bg-rose-50 text-rose-700", icon: "cancel", label: "Cancelled" };
  if (s === "rejected") return { bg: "bg-rose-50 text-rose-700", icon: "block", label: "Rejected" };
  return { bg: "bg-slate-100 text-slate-700", icon: "info", label: status };
}

function paymentStatusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "paid") return { bg: "bg-emerald-50 text-emerald-700", label: "Paid" };
  if (s === "pending") return { bg: "bg-amber-50 text-amber-700", label: "Pending" };
  if (s === "failed") return { bg: "bg-rose-50 text-rose-700", label: "Failed" };
  if (s === "cancelled") return { bg: "bg-slate-100 text-slate-700", label: "Cancelled" };
  if (s === "refunded") return { bg: "bg-emerald-50 text-emerald-700", label: "Refunded" };
  if (s === "partially_refunded") return { bg: "bg-emerald-50 text-emerald-700", label: "Partially Refunded" };
  return { bg: "bg-slate-100 text-slate-600", label: status || "Unknown" };
}

function getDaysBeforeCheckIn(checkInStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = new Date(checkInStr + "T12:00:00");
  const diff = Math.ceil((checkIn.getTime() - today.getTime()) / 86400000);
  return diff;
}

function getCancellationTier(days: number): { pct: number; refundPct: number; label: string; shortLabel: string } {
  if (days >= 10) return { pct: 0, refundPct: 100, label: "10+ days before check-in — Full refund — 0% deduction", shortLabel: "Full refund — no deduction" };
  if (days >= 5) return { pct: 10, refundPct: 90, label: "5–9 days before check-in — 90% refund — 10% deduction", shortLabel: "90% refund — 10% deduction" };
  if (days >= 0) return { pct: 30, refundPct: 70, label: "Less than 5 days before check-in — 70% refund — 30% deduction", shortLabel: "70% refund — 30% deduction" };
  return { pct: 100, refundPct: 0, label: "On or after check-in — Cancellation unavailable", shortLabel: "Unavailable" };
}

export function BookingDetailsSection0() {
  const params = useParams() as { id?: string };
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id") || params.id || null;

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMissing, setPaymentMissing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [review, setReview] = useState<Review | null | undefined>(undefined);
  const [reviewLoading, setReviewLoading] = useState(false);

  async function refreshData(id: string) {
    const b = await getBooking(id);
    setBooking(b);
    try {
      const pay = await getPaymentByBooking(id);
      setPayment(pay);
      setPaymentMissing(false);
    } catch (payErr) {
      const msg = payErr instanceof Error ? payErr.message : String(payErr);
      if (/404|not found|Payment not found/i.test(msg)) {
        setPaymentMissing(true);
        setPayment(null);
      } else {
        setPaymentMissing(true);
        setPayment(null);
      }
    }
    if (b.property_id) {
      try {
        const p = await getPublicProperty(b.property_id);
        setProperty(p);
      } catch {}
    }
  }

  useEffect(() => {
    if (!bookingId) {
      setError("Missing booking ID. Please open this page from My Bookings.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setPaymentMissing(false);
      setPayment(null);
      try {
        const b = await getBooking(bookingId as string);
        if (cancelled) return;
        setBooking(b);

        if (b.property_id) {
          getPublicProperty(b.property_id)
            .then((p) => {
              if (!cancelled) setProperty(p);
            })
            .catch(() => {});
        }

        try {
          const pay = await getPaymentByBooking(bookingId as string);
          if (!cancelled) setPayment(pay);
        } catch (payErr) {
          if (cancelled) return;
          const msg = payErr instanceof Error ? payErr.message : String(payErr);
          const isNotFound = /404|not found|Payment not found/i.test(msg);
          if (isNotFound) {
            setPaymentMissing(true);
            setPayment(null);
          } else {
            setPaymentMissing(true);
            setPayment(null);
          }
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load booking";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  useEffect(() => {
    if (!booking || booking.status !== "completed" || !bookingId) {
      setReview(undefined);
      return;
    }
    let cancelled = false;
    setReview(undefined);
    setReviewLoading(true);
    getReviewByBooking(bookingId as string)
      .then((r) => {
        if (!cancelled) setReview(r);
      })
      .catch(() => {
        if (!cancelled) setReview(null);
      })
      .finally(() => {
        if (!cancelled) setReviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking, bookingId]);

  async function handleCancelClick() {
    if (!booking || !bookingId) return;

    const days = getDaysBeforeCheckIn(booking.check_in);
    if (days < 0) {
      Swal.fire({
        title: "Cancellation unavailable",
        text: "This booking cannot be cancelled on or after the check-in date.",
        icon: "warning",
        confirmButtonColor: "#157375",
      });
      return;
    }

    const tier = getCancellationTier(days);
    const total = Number(booking.total_price);
    const fee = Number((total * tier.pct / 100).toFixed(2));
    const estimatedRefund = Number((total - fee).toFixed(2));

    const isCashUnpaid = payment?.payment_method === "cash" && payment?.payment_status === "pending";
    const isStripePaid = payment?.payment_method === "stripe" && payment?.payment_status === "paid";

    // Build policy list with highlight
    const policyRows = [
      { pct: 0, text: "10+ days before check-in", sub: "Full refund — no deduction" },
      { pct: 10, text: "5–9 days before check-in", sub: "90% refund — 10% deduction" },
      { pct: 30, text: "Less than 5 days before check-in", sub: "70% refund — 30% deduction" },
      { pct: 100, text: "On or after check-in", sub: "Cancellation unavailable" },
    ];

    const policyHtml = policyRows
      .map((r) => {
        const active = r.pct === tier.pct;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:10px;margin-bottom:6px;${active ? "background:#E4ECEE;border:1px solid #157375;" : "background:#F8FAFC;border:1px solid #E2E8F0;"}">
          <div style="text-align:left"><div style="font-size:13px;font-weight:600;color:${active ? "#157375" : "#1E293B"}">${r.text}</div><div style="font-size:11px;color:#64748B">${r.sub}</div></div>
          ${active ? '<span style="font-size:11px;font-weight:700;color:#157375;background:#fff;border:1px solid #157375;padding:2px 8px;border-radius:999px">APPLIES</span>' : ""}
        </div>`;
      })
      .join("");

    let estimateHtml = "";
    if (isCashUnpaid) {
      estimateHtml = `
        <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:12px;text-align:left;margin-top:12px">
          <div style="font-size:12px;font-weight:700;color:#92400E;margin-bottom:6px">Estimated financial effect</div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B"><span>Check-in</span><span style="font-weight:600">${formatDateLong(booking.check_in)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B;margin-top:4px"><span>Original booking total</span><span style="font-weight:600">${formatPrice(total)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B;margin-top:4px"><span>Applicable tier</span><span style="font-weight:600">${tier.shortLabel}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#92400E;margin-top:4px"><span>Cancellation deduction (${tier.pct}%)</span><span style="font-weight:600">${formatPrice(fee)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#1E293B;margin-top:8px;padding-top:8px;border-top:1px dashed #FCD34D"><span>Actual refund</span><span>$0.00</span></div>
          <div style="font-size:11px;color:#92400E;margin-top:8px;line-height:1.4">Your booking will be cancelled. Since this cash payment has not been collected, no monetary refund is required. The tier above is shown for transparency.</div>
        </div>`;
    } else if (isStripePaid) {
      estimateHtml = `
        <div style="background:#F0FDFD;border:1px solid #46B1B1;border-radius:12px;padding:12px;text-align:left;margin-top:12px">
          <div style="font-size:12px;font-weight:700;color:#157375;margin-bottom:6px">Estimated financial effect</div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B"><span>Check-in</span><span style="font-weight:600">${formatDateLong(booking.check_in)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B;margin-top:4px"><span>Original payment</span><span style="font-weight:600">${formatPrice(total)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-top:4px"><span>You are cancelling ${days} day${days === 1 ? "" : "s"} before check-in</span><span>${tier.shortLabel}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#B45309;margin-top:6px"><span>Cancellation deduction (${tier.pct}%)</span><span style="font-weight:600">${formatPrice(fee)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:#157375;margin-top:8px;padding-top:8px;border-top:1px dashed #46B1B1"><span>Estimated refund</span><span>${formatPrice(estimatedRefund)}</span></div>
          <div style="font-size:11px;color:#64748B;margin-top:8px;line-height:1.4">If you continue, your booking will be cancelled. For card payments, eligible refunds are processed through the original payment method by StayLeb. This is an estimate — final amounts are confirmed by StayLeb.</div>
        </div>`;
    } else {
      // No payment or pending/failed stripe
      const refundNote = paymentMissing || payment?.payment_status === "pending" || payment?.payment_status === "failed"
        ? "No payment was successfully collected, so no refund is required. The tier is shown for transparency."
        : `Estimated refund: ${formatPrice(estimatedRefund)}`;
      estimateHtml = `
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px;text-align:left;margin-top:12px">
          <div style="font-size:12px;font-weight:700;color:#1E293B;margin-bottom:6px">Estimated financial effect</div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B"><span>Check-in</span><span style="font-weight:600">${formatDateLong(booking.check_in)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#1E293B;margin-top:4px"><span>Original booking total</span><span style="font-weight:600">${formatPrice(total)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#64748B;margin-top:4px"><span>Applicable tier</span><span style="font-weight:600">${tier.shortLabel}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#64748B;margin-top:4px"><span>You are cancelling ${days} day${days === 1 ? "" : "s"} before check-in</span><span>${tier.pct}% deduction</span></div>
          <div style="font-size:11px;color:#64748B;margin-top:8px">${refundNote}</div>
        </div>`;
    }

    const result = await Swal.fire({
      title: "Cancel this booking?",
      html: `
        <div style="text-align:center">
          <div style="font-size:13px;color:#64748B;margin-bottom:12px">Check-in: <strong style="color:#1E293B">${formatDateLong(booking.check_in)}</strong> · ${days} day${days === 1 ? "" : "s"} remaining</div>
          ${estimateHtml}
          <div style="margin-top:12px;text-align:left">
            <div style="font-size:12px;font-weight:700;color:#1E293B;margin-bottom:6px">StayLeb cancellation policy</div>
            ${policyHtml}
          </div>
          <div style="font-size:11px;color:#64748B;margin-top:12px;background:#F1F5F9;padding:10px;border-radius:10px;text-align:left;line-height:1.5">
            <strong style="color:#1E293B">If you continue, your booking will be cancelled.</strong> For card payments, eligible refunds are processed through the original payment method. This action cannot be undone.
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancel Booking",
      cancelButtonText: "Keep Booking",
      confirmButtonColor: "#E11D48",
      cancelButtonColor: "#E2E8F0",
      customClass: {
        popup: "rounded-2xl",
        title: "text-[#1E293B]",
        confirmButton: "rounded-full px-6",
        cancelButton: "rounded-full px-6 text-[#1E293B]",
      },
      reverseButtons: true,
      width: 560,
    });

    if (!result.isConfirmed) return;

    setCancelling(true);
    try {
      // Backend is source of truth — only bookingId sent
      await cancelBooking(bookingId as string);

      // Refresh booking + payment from backend (authoritative)
      await refreshData(bookingId as string);

      // Fetch fresh values for success display (use updated state after refresh)
      // We re-read via API to avoid stale closure
      const freshBooking = await getBooking(bookingId as string);
      let freshPayment: PaymentResponse | null = null;
      try {
        freshPayment = await getPaymentByBooking(bookingId as string);
      } catch {}

      const isNowCash = freshPayment?.payment_method === "cash";
      const refundDisplay = freshBooking.refund_amount != null ? formatPrice(freshBooking.refund_amount) : isNowCash ? "$0.00" : formatPrice(0);
      const feeDisplay = freshBooking.cancellation_fee != null ? formatPrice(freshBooking.cancellation_fee) : formatPrice(0);
      const pctDisplay = freshBooking.cancellation_percentage != null ? `${Number(freshBooking.cancellation_percentage).toFixed(0)}%` : `${tier.pct}%`;
      const payStatus = freshPayment ? freshPayment.payment_status.replace("_", " ") : "cancelled";

      let successHtml = "";
      if (isNowCash) {
        successHtml = `
          <div style="text-align:left;background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;padding:14px">
            <div style="font-weight:700;color:#15803D;margin-bottom:8px">Booking Cancelled</div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span>Original payment</span><span style="font-weight:600">${formatPrice(freshBooking.total_price)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span>Cancellation deduction (${pctDisplay})</span><span>${feeDisplay}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-top:8px;padding-top:8px;border-top:1px dashed #86EFAC"><span>Refund</span><span>$0.00</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-top:6px"><span>Payment status</span><span style="font-weight:600;text-transform:capitalize">${payStatus}</span></div>
            <div style="font-size:11px;color:#15803D;margin-top:8px">Since this cash payment was not collected, no monetary refund was required.</div>
          </div>`;
      } else if (freshPayment && (freshPayment.payment_status === "partially_refunded" || freshPayment.payment_status === "refunded")) {
        const refundedAmt = freshPayment.refunded_amount ? formatPrice(freshPayment.refunded_amount) : refundDisplay;
        successHtml = `
          <div style="text-align:left;background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;padding:14px">
            <div style="font-weight:700;color:#15803D;margin-bottom:8px">Booking Cancelled</div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span>Original payment</span><span style="font-weight:600">${formatPrice(freshBooking.total_price)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span>Cancellation deduction (${pctDisplay})</span><span>${feeDisplay}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;margin-top:8px;padding-top:8px;border-top:1px dashed #86EFAC"><span>Refund</span><span>${refundedAmt}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-top:6px"><span>Payment status</span><span style="font-weight:600;text-transform:capitalize">${payStatus}</span></div>
          </div>`;
      } else {
        successHtml = `
          <div style="text-align:left;background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;padding:14px">
            <div style="font-weight:700;color:#15803D;margin-bottom:8px">Booking Cancelled</div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span>Original payment</span><span style="font-weight:600">${formatPrice(freshBooking.total_price)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span>Cancellation deduction (${pctDisplay})</span><span>${feeDisplay}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;margin-top:8px;padding-top:8px;border-top:1px dashed #86EFAC"><span>Actual refund</span><span>${refundDisplay}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748B;margin-top:6px"><span>Payment status</span><span style="font-weight:600;text-transform:capitalize">${payStatus}</span></div>
          </div>`;
      }

      await Swal.fire({
        title: "Booking cancelled",
        html: successHtml,
        icon: "success",
        confirmButtonColor: "#157375",
        confirmButtonText: "Done",
        customClass: { popup: "rounded-2xl" },
        width: 520,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Cancellation failed";
      await Swal.fire({
        title: "Cancellation failed",
        text: msg.includes("not be cancelled") || msg.includes("cannot be cancelled") ? msg : msg.includes("Refund") || msg.includes("refund") ? "We couldn't process your refund. Your booking has not been cancelled. Please try again." : msg,
        icon: "error",
        confirmButtonColor: "#157375",
        customClass: { popup: "rounded-2xl" },
      });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading booking #{bookingId}…</p>
        </div>
      </main>
    );
  }

  if (error) {
    const isAuthError = /401|unauthorized|session expired/i.test(error);
    const isForbidden = /403|forbidden|not allowed/i.test(error);
    const isNotFound = /404|not found/i.test(error);
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6">
          <Icon name={isNotFound ? "search_off" : isAuthError || isForbidden ? "lock" : "error"} className="material-symbols-outlined text-[36px] text-slate-400 mb-3" />
          <h2 className="font-title-md text-title-md text-on-surface font-semibold mb-2">
            {isNotFound ? "Booking not found" : isAuthError ? "Please log in" : isForbidden ? "Not authorized" : "Failed to load booking"}
          </h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            {isAuthError ? (
              <Link href={`/auth/login?next=${encodeURIComponent(`/account/bookings/${bookingId ?? ""}`)}`} className="px-5 py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm">
                Go to Login
              </Link>
            ) : (
              <Link href="/account/bookings" className="px-5 py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm">
                Back to My Bookings
              </Link>
            )}
            <Link href="/search" className="px-5 py-2 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
              Discover stays
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-sm text-slate-500">No booking data available.</p>
          <Link href="/account/bookings" className="text-primary underline mt-4 inline-block text-sm">
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  const badge = statusBadge(booking.status);
  const nights = booking.number_of_nights;
  const cover = property?.images?.find((i) => i.is_primary)?.image_url || property?.images?.[0]?.image_url || "/images/b349a5ea1a9bacc6.jpg";
  const propertyTitle = property?.title || `Property #${booking.property_id}`;
  const propertyLocation = property?.location || "Lebanon";
  const propertyAddress = property?.address ? ` · ${property.address}` : "";
  const propertyTypeLabel = property?.property_type ? property.property_type.replace("_", " ") : "Chalet";

  const payBadge = payment ? paymentStatusBadge(payment.payment_status) : { bg: "bg-amber-50 text-amber-700", label: "Payment not created yet" };
  const payMethodLabel = payment
    ? payment.payment_method === "cash"
      ? "Cash on Arrival"
      : payment.payment_method === "stripe"
        ? "Stripe Online"
        : payment.payment_method
    : paymentMissing
      ? "No payment record yet"
      : "Pending";

  // Whether Cancel button should be active — client UI only
  const daysBefore = getDaysBeforeCheckIn(booking.check_in);
  const isCancellableStatus = booking.status === "pending" || booking.status === "confirmed";
  const isPastCheckIn = daysBefore < 0;
  const canCancel = isCancellableStatus && !isPastCheckIn;

  const isCancelled = booking.status === "cancelled";

  return (
    <>
      <main className={"w-full min-h-screen bg-background flex flex-col justify-center"}>
        <div className={"flex flex-col w-full"}>
          <div className={"max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8"}>
            <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
              <nav className={"flex items-center space-x-2 text-on-surface-variant font-label-sm text-label-sm"}>
                <Link href="/account/bookings" className={"hover:text-primary transition-colors flex items-center gap-1"}>
                  <Icon name="arrow_back" className="material-symbols-outlined text-[16px]" />
                  <span>{"Back to My Bookings"}</span>
                </Link>
                <span className={"text-outline-variant"}>{"/"}</span>
                <span className={"text-on-surface-variant truncate max-w-[150px]"}>{propertyTitle}</span>
                <span className={"text-outline-variant"}>{"/"}</span>
                <span className={"text-[#157375] font-semibold"}>{"Booking #SL-" + String(booking.id).padStart(4, "0")}</span>
              </nav>

              <div className={"flex items-center space-x-2"}>
                <ActionButton
                  className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-sm text-label-sm shadow-sm transition-all"}
                  actionLabel={"print Print Receipt"}
                  aria-label={"print Print Receipt"}
                  hint={"window.print()"}
                >
                  <Icon name="print" className="material-symbols-outlined text-[16px]" />
                  <span>{"Print Receipt"}</span>
                </ActionButton>
              </div>
            </div>

            <div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm"}>
              <div className={"space-y-2"}>
                <div className={"flex items-center flex-wrap gap-3"}>
                  <h1 className={"font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight"}>{"Booking Details"}</h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide ${badge.bg}`}>
                    <Icon name={badge.icon} className="material-symbols-outlined text-[16px]" />
                    {badge.label}
                  </span>
                  {payment ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption ${payBadge.bg}`}>
                      <Icon name={payment.payment_method === "cash" ? "payments" : "credit_card"} className="material-symbols-outlined text-[14px]" />
                      {payMethodLabel} · {payBadge.label}
                    </span>
                  ) : (
                    <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-caption text-caption"}>
                      <Icon name="hourglass_top" className="material-symbols-outlined text-[14px]" />
                      {payMethodLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Booking ID: <span className="font-mono font-semibold text-on-surface">#{booking.id}</span> · Created {new Date(booking.created_at).toLocaleString()} · Property #{booking.property_id}
                </p>
              </div>
            </div>

            <div className={"grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>
              <div className={"lg:col-span-8 space-y-6"}>
                <div className={"bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row"}>
                  <div className={"sm:w-2/5 relative min-h-[220px] sm:min-h-full"}>
                    <LocalImage className={"w-full h-full object-cover"} src={cover} alt={propertyTitle} />
                    <div className={"absolute top-3 left-3 bg-inverse-surface/80 backdrop-blur-md px-2.5 py-1 rounded-full text-inverse-on-surface font-caption text-caption uppercase tracking-wider font-semibold"}>{propertyTypeLabel}</div>
                  </div>
                  <div className={"sm:w-3/5 p-6 sm:p-7 flex flex-col justify-between space-y-4"}>
                    <div className={"space-y-2"}>
                      <div className={"flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm"}>
                        <Icon name="location_on" className="material-symbols-outlined text-primary text-[16px]" />
                        <span>
                          {propertyLocation}
                          {propertyAddress}
                        </span>
                      </div>
                      <h2 className={"font-title-md text-title-md text-[#157375] font-bold leading-snug"}>{propertyTitle}</h2>
                      {property && (
                        <div className={"flex items-center gap-3 pt-1"}>
                          <div className={"flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold"}>
                            <Icon name="star" className="material-symbols-outlined text-[15px]" />
                            <span>{"4.98"}</span>
                          </div>
                          <span className={"text-on-surface-variant font-caption text-caption"}>{"(48 guest reviews)"}</span>
                          <span className={"text-outline-variant"}>{"•"}</span>
                          <span className={"font-caption text-caption text-primary font-medium"}>{"Verified Property"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"} id={"stay-details"}>
                  <div className={"flex items-center justify-between border-b border-surface-container-high pb-4"}>
                    <div className={"flex items-center gap-2"}>
                      <Icon name="event_available" className="material-symbols-outlined text-primary text-[24px]" />
                      <h3 className={"font-headline-sm text-headline-sm text-[#157375] font-bold"}>{"Stay Details"}</h3>
                    </div>
                    <span className={"font-label-md text-label-md text-primary font-semibold bg-surface-container px-3 py-1 rounded-full"}>{nights} Nights Total</span>
                  </div>

                  <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                    <div className={"bg-surface-container-low rounded-xl p-4.5 space-y-1"}>
                      <span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold"}>{"Check-in"}</span>
                      <p className={"font-title-md text-title-md text-[#157375] font-bold"}>{formatDateLong(booking.check_in)}</p>
                      <p className={"font-body-md text-body-md text-on-surface-variant flex items-center gap-1"}>
                        <Icon name="schedule" className="material-symbols-outlined text-[16px]" />
                        {"3:00 PM onwards"}
                      </p>
                    </div>
                    <div className={"bg-surface-container-low rounded-xl p-4.5 space-y-1"}>
                      <span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold"}>{"Check-out"}</span>
                      <p className={"font-title-md text-title-md text-[#157375] font-bold"}>{formatDateLong(booking.check_out)}</p>
                      <p className={"font-body-md text-body-md text-on-surface-variant flex items-center gap-1"}>
                        <Icon name="schedule" className="material-symbols-outlined text-[16px]" />
                        {"Until 11:00 AM"}
                      </p>
                    </div>
                  </div>

                  <div className={"flex items-center gap-3 p-4 rounded-xl bg-surface-container-low"}>
                    <Icon name="group" className="material-symbols-outlined text-primary text-[22px]" />
                    <div>
                      <p className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Guests Registered"}</p>
                      <p className={"font-body-md text-body-md text-on-surface-variant"}>{booking.guests} Guests · Entire Chalet reservation</p>
                    </div>
                  </div>

                  <div className={"space-y-4 pt-2"}>
                    <h4 className={"font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Arrival & Access Protocol"}</h4>
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      <div className={"flex items-start space-x-3.5 p-4 rounded-xl bg-surface-container"}>
                        <div className={"w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0"}>
                          <Icon name="key" className="material-symbols-outlined text-[18px]" />
                        </div>
                        <div className={"space-y-0.5"}>
                          <p className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Key Handover"}</p>
                          <p className={"font-body-md text-body-md text-on-surface-variant"}>{"Host greeting & on-site keys handover upon arrival at the gatehouse entrance."}</p>
                        </div>
                      </div>
                      <div className={"flex items-start space-x-3.5 p-4 rounded-xl bg-surface-container"}>
                        <div className={"w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0"}>
                          <Icon name="shield_person" className="material-symbols-outlined text-[18px]" />
                        </div>
                        <div className={"space-y-0.5"}>
                          <p className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Assigned Superhosts"}</p>
                          <p className={"font-body-md text-body-md text-on-surface-variant"}>{"Host will meet you directly at 3:00 PM on check-in day."}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={"space-y-3 pt-2"}>
                    <h4 className={"font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Guaranteed Chalet Infrastructure"}</h4>
                    <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                      <div className={"flex items-center gap-2.5 text-[#157375] font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
                        <Icon name="solar_power" className="material-symbols-outlined text-emerald-600 text-[20px]" />
                        <span>{"24/7 uninterrupted generator & solar grid"}</span>
                      </div>
                      <div className={"flex items-center gap-2.5 text-[#157375] font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
                        <Icon name="hot_tub" className="material-symbols-outlined text-emerald-600 text-[20px]" />
                        <span>{"Heated outdoor year-round Jacuzzi"}</span>
                      </div>
                      <div className={"flex items-center gap-2.5 text-[#157375] font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
                        <Icon name="fireplace" className="material-symbols-outlined text-emerald-600 text-[20px]" />
                        <span>{"Indoor seasoned cedar logs for fireplace"}</span>
                      </div>
                      <div className={"flex items-center gap-2.5 text-[#157375] font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
                        <Icon name="wifi" className="material-symbols-outlined text-emerald-600 text-[20px]" />
                        <span>{"High-speed optical fiber internet (80 Mbps)"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-4"}>
                  <div className={"flex items-center gap-2"}>
                    <Icon name="policy" className="material-symbols-outlined text-primary text-[22px]" />
                    <h3 className={"font-headline-sm text-headline-sm text-[#157375] font-bold"}>{"Chalet House Rules Reminder"}</h3>
                  </div>
                  <div className={"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"}>
                    <div className={"p-4 rounded-xl bg-surface-container-low space-y-1"}>
                      <div className={"flex items-center gap-2 text-[#157375] font-label-md text-label-md font-semibold"}>
                        <Icon name="volume_off" className="material-symbols-outlined text-outline text-[18px]" />
                        <span>{"Quiet Hours"}</span>
                      </div>
                      <p className={"font-body-md text-body-md text-on-surface-variant"}>{"After 11:00 PM out of mountain neighborhood respect."}</p>
                    </div>
                    <div className={"p-4 rounded-xl bg-surface-container-low space-y-1"}>
                      <div className={"flex items-center gap-2 text-[#157375] font-label-md text-label-md font-semibold"}>
                        <Icon name="smoke_free" className="material-symbols-outlined text-outline text-[18px]" />
                        <span>{"No Smoking"}</span>
                      </div>
                      <p className={"font-body-md text-body-md text-on-surface-variant"}>{"Strictly non-smoking inside chalet. Allowed on open terraces."}</p>
                    </div>
                    <div className={"p-4 rounded-xl bg-surface-container-low space-y-1"}>
                      <div className={"flex items-center gap-2 text-[#157375] font-label-md text-label-md font-semibold"}>
                        <Icon name="pets" className="material-symbols-outlined text-outline text-[18px]" />
                        <span>{"Pets Welcome"}</span>
                      </div>
                      <p className={"font-body-md text-body-md text-on-surface-variant"}>{"Allowed upon prior confirmation with host."}</p>
                    </div>
                  </div>
                </div>

                <div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"}>
                  <div className={"flex items-center justify-between"}>
                    <div className={"flex items-center gap-2"}>
                      <Icon name="event_busy" className="material-symbols-outlined text-primary text-[22px]" />
                      <h3 className={"font-headline-sm text-headline-sm text-[#157375] font-bold"}>{"Cancellation Terms"}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${isCancelled ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{isCancelled ? "Cancelled" : "Flexible Policy"}</span>
                  </div>
                  {isCancelled ? (
                    <div className={"space-y-3"}>
                      <div className={"p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2"}>
                        <div className={"flex items-center gap-2 font-label-md text-label-md font-bold text-rose-700"}>
                          <Icon name="cancel" className="material-symbols-outlined text-[18px]" />
                          <span>Status: Cancelled</span>
                          {booking.cancelled_at && <span className="font-normal text-xs text-rose-600">· {new Date(booking.cancelled_at).toLocaleString()}</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Original booking total</div>
                            <div className="font-semibold text-[#1E293B]">{formatPrice(booking.total_price)}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cancellation policy applied</div>
                            <div className="font-semibold text-[#1E293B]">{booking.cancellation_percentage != null ? `${Number(booking.cancellation_percentage).toFixed(0)}% deduction` : "—"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cancellation deduction</div>
                            <div className="font-semibold text-amber-700">{booking.cancellation_fee ? formatPrice(booking.cancellation_fee) : "—"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Actual refund</div>
                            <div className="font-bold text-emerald-700">{booking.refund_amount ? formatPrice(booking.refund_amount) : payment?.refunded_amount ? formatPrice(payment.refunded_amount) : payment?.payment_method === "cash" ? "$0.00" : "—"}</div>
                          </div>
                        </div>
                        {payment && (
                          <div className="flex items-center justify-between text-xs bg-white rounded-lg p-3 mt-1">
                            <span className="text-slate-500">Payment status</span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${paymentStatusBadge(payment.payment_status).bg}`}>{paymentStatusBadge(payment.payment_status).label}</span>
                          </div>
                        )}
                        {payment?.payment_method === "cash" && (
                          <p className="text-xs text-slate-500">Since this cash payment was not collected, no monetary refund was required.</p>
                        )}
                        {payment?.payment_method === "stripe" && payment?.payment_status.includes("refund") && (
                          <p className="text-xs text-emerald-700">Refund processed through the original card via Stripe.</p>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Original booking total {formatPrice(booking.total_price)} remains visible as historical information. This booking remains in your history.</p>
                    </div>
                  ) : (
                    <>
                      <div className={"p-4.5 rounded-xl bg-surface-container-low text-[#157375] space-y-2"}>
                        <div className={"flex items-start gap-3"}>
                          <Icon name="check_circle" className="material-symbols-outlined text-emerald-600 mt-0.5 text-[20px]" />
                          <p className={"font-body-md text-body-md"}>
                            <strong>{"Cancellation policy applies"}</strong> — booking can be cancelled before check-in with tiered fees: 0% (≥10 days), 10% (5-9 days), 30% (&lt;5 days).
                          </p>
                        </div>
                      </div>

                      <div className={"pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
                        <p className={"font-caption text-caption text-on-surface-variant"}>{"Need to modify or cancel your reservation dates?"}</p>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={handleCancelClick}
                            disabled={cancelling}
                            className={`px-4 py-2 rounded-xl font-label-md text-label-md font-semibold transition-colors shadow-sm ${cancelling ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-surface-container-high text-rose-700 hover:bg-rose-50 border border-rose-200"}`}
                          >
                            {cancelling ? "Processing cancellation..." : "Cancel Booking"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                            {isPastCheckIn ? "Cancellation unavailable — check-in has passed" : `Cancellation unavailable — status: ${booking.status}`}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {booking.status === "completed" && (
                  <div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-4"}>
                    <div className={"flex items-center gap-2"}>
                      <Icon name="rate_review" className="material-symbols-outlined text-primary text-[22px]" />
                      <h3 className={"font-headline-sm text-headline-sm text-[#157375] font-bold"}>{"Your Review"}</h3>
                    </div>
                    {reviewLoading ? (
                      <div className="flex items-center gap-2 py-4"><span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm text-slate-500">Checking review status…</span></div>
                    ) : review ? (
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold border border-emerald-200">
                          <Icon name="check_circle" className="material-symbols-outlined text-[16px]" />
                          Already reviewed
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {[
                            { label: "Overall", value: review.overall_rating },
                            { label: "Cleanliness", value: review.cleanliness_rating },
                            { label: "Privacy", value: review.privacy_rating },
                            { label: "Wi-Fi", value: review.wifi_rating },
                            { label: "Hot Water", value: review.hot_water_rating },
                            { label: "Location", value: review.location_rating },
                            { label: "Value", value: review.value_rating },
                          ].map((r) => (
                            <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                              <span className="font-medium text-[#157375]">{r.label}</span>
                              <span className="flex items-center gap-1 font-bold text-amber-500">{r.value} <Icon name="star" className="text-[16px]" /></span>
                            </div>
                          ))}
                        </div>
                        {review.comment && (
                          <div className="p-4 rounded-xl bg-surface-container-low">
                            <p className="font-label-sm text-label-sm font-semibold text-[#157375] mb-1">Your comment</p>
                            <p className="font-body-md text-body-md text-on-surface-variant italic">“{review.comment}”</p>
                            <p className="text-xs text-slate-500 mt-2">Submitted {new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        )}
                        {!review.comment && <p className="text-xs text-slate-500">Submitted {new Date(review.created_at).toLocaleDateString()} — no comment.</p>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="font-body-md text-body-md text-on-surface-variant">Share your verified experience for this completed stay. Your review helps future guests and will be shown on the property page.</p>
                        <Link href={`/account/bookings/${booking.id}/review`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-label-md text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm">
                          <Icon name="rate_review" className="material-symbols-outlined text-[18px]" />
                          Write a Review
                        </Link>
                        <p className="text-xs text-slate-500">One review per completed booking. Ratings 1–5, comment optional.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={"lg:col-span-4 space-y-6"}>
                <div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm space-y-5"}>
                  <div className={"flex items-center justify-between pb-3 border-b border-surface-container"}>
                    <h3 className={"font-title-md text-title-md text-[#157375] font-bold"}>{"Price Summary"}</h3>
                    <span className={"font-caption text-caption bg-surface-container-high text-primary px-2.5 py-1 rounded-full font-semibold"}>{"USD Currency"}</span>
                  </div>

                  <div className={"space-y-3 font-body-md text-body-md text-on-surface-variant"}>
                    <div className={"flex justify-between items-center"}>
                      <span>
                        {formatPrice(booking.price_per_night)} × {booking.number_of_nights} nights
                      </span>
                      <span className={"text-[#157375] font-medium"}>{formatPrice(booking.total_price)}</span>
                    </div>
                  </div>

                  <div className={"pt-4 border-t border-surface-container space-y-3"}>
                    <div className={"flex justify-between items-baseline"}>
                      <span className={"font-title-md text-title-md font-bold text-[#157375]"}>{"Total"}</span>
                      <span className={"font-headline-md text-headline-md font-bold text-primary"}>{formatPrice(booking.total_price)}</span>
                    </div>

                    <div className={"bg-surface-container-low p-3.5 rounded-xl space-y-2"}>
                      <div className={"flex items-center justify-between text-[#157375]"}>
                        <div className={"flex items-center gap-2 font-label-md text-label-md font-semibold"}>
                          <Icon name={payment?.payment_method === "cash" ? "payments" : "credit_card"} className="material-symbols-outlined text-primary text-[20px]" />
                          <span>{payMethodLabel}</span>
                        </div>
                        <span className={`font-caption text-caption px-2 py-0.5 rounded font-semibold ${payBadge.bg}`}>{payBadge.label}</span>
                      </div>
                      {!payment && (
                        <p className="font-caption text-caption text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg">
                          {paymentMissing ? "No payment record yet for this booking. The booking is still pending and will show payment details after you choose Cash or Card at checkout." : "Payment information unavailable."}
                        </p>
                      )}
                      {isCancelled && payment && (
                        <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                          <div className="flex justify-between"><span className="text-slate-500">Actual refund</span><span className="font-semibold text-emerald-700">{payment.refunded_amount && Number(payment.refunded_amount) !== 0 ? formatPrice(payment.refunded_amount) : booking.refund_amount ? formatPrice(booking.refund_amount) : payment.payment_method === "cash" ? "$0.00" : formatPrice(0)}</span></div>
                        </div>
                      )}
                    </div>
                    {isCancelled && (
                      <p className="text-xs text-slate-500">Booking remains in your history. Original total {formatPrice(booking.total_price)} preserved.</p>
                    )}
                  </div>
                </div>

                <div className={"bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4"}>
                  <div className={"flex items-start gap-3"}>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0"}>
                      <Icon name="verified_user" className="material-symbols-outlined text-[22px]" />
                    </div>
                    <div className={"space-y-1"}>
                      <h4 className={"font-title-md text-title-md font-bold text-[#157375]"}>{"StayLeb Protection Shield"}</h4>
                      <p className={"font-body-md text-body-md text-on-surface-variant"}>{"Every reservation includes 24/7 localized Beirut mountain support, utility continuity guarantee, and emergency property rebooking assistance."}</p>
                    </div>
                  </div>
                  <div className={"pt-2 border-t border-surface-container flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm"}>
                    <span>{"Direct Support Hotline:"}</span>
                    <span className={"font-semibold text-[#157375]"}>{"+961 1 998 877"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </>
    );
  }

