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
        popup: "rounded-xl",
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
        customClass: { popup: "rounded-xl" },
        width: 520,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Cancellation failed";
      await Swal.fire({
        title: "Cancellation failed",
        text: msg.includes("not be cancelled") || msg.includes("cannot be cancelled") ? msg : msg.includes("Refund") || msg.includes("refund") ? "We couldn't process your refund. Your booking has not been cancelled. Please try again." : msg,
        icon: "error",
        confirmButtonColor: "#157375",
        customClass: { popup: "rounded-xl" },
      });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F4F7FB] py-5 sm:py-7">
        <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 sm:p-8 animate-pulse">
            <div className="h-4 w-24 bg-[#EAF1F6] rounded" />
            <div className="mt-3 h-8 w-72 max-w-full bg-[#EAF1F6] rounded" />
            <div className="mt-3 h-4 w-96 max-w-full bg-[#EAF1F6] rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            <div className="lg:col-span-8 space-y-5 min-w-0">
              <div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-52 bg-[#EAF1F6] rounded-2xl" /></div>
              <div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-32 bg-[#EAF1F6] rounded-2xl" /></div>
            </div>
            <div className="lg:col-span-4 min-w-0">
              <div className="bg-white rounded-[22px] border border-[#E3ECF3] p-6 animate-pulse"><div className="h-40 bg-[#EAF1F6] rounded-2xl" /></div>
            </div>
          </div>
          <p className="text-center text-sm text-[#64748B]">Loading booking #{bookingId}…</p>
        </div>
      </main>
    );
  }

  if (error) {
    const isAuthError = /401|unauthorized|session expired/i.test(error);
    const isForbidden = /403|forbidden|not allowed/i.test(error);
    const isNotFound = /404|not found/i.test(error);
    return (
      <main className="w-full min-h-screen bg-[#F4F7FB] flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6 bg-white border border-[#E3ECF3] rounded-[22px] shadow-sm p-8 sm:p-10">
          <Icon name={isNotFound ? "search_off" : isAuthError || isForbidden ? "lock" : "error"} className="material-symbols-outlined text-[36px] text-[#64748B] mb-3" />
          <h2 className="text-[19px] text-[#1E293B] font-extrabold mb-2">
            {isNotFound ? "Booking not found" : isAuthError ? "Please log in" : isForbidden ? "Not authorized" : "Failed to load booking"}
          </h2>
          <p className="text-sm text-[#64748B] mb-4">{error}</p>
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
            <Link href="/search" className="px-5 py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm">
              Discover stays
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="w-full min-h-screen bg-[#F4F7FB] flex items-center justify-center py-16">
        <div className="text-center bg-white border border-[#E3ECF3] rounded-[22px] shadow-sm p-8 sm:p-10">
          <p className="text-sm text-[#64748B]">No booking data available.</p>
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
      <main className={"w-full min-h-screen bg-[#F4F7FB] flex flex-col"}>
        <div className={"flex flex-col w-full"}>
          <div className={"max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5"}>
            <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
              <nav className={"flex items-center gap-2 text-[13px] font-semibold text-[#1E293B] flex-wrap"} aria-label="Breadcrumb">
                <Link href="/account/bookings" className={"hover:text-[#157375] transition-colors flex items-center gap-1.5"}>
                  <span aria-hidden="true">{"←"}</span>
                  <span>{"Back to My Bookings"}</span>
                </Link>
                <span className={"text-[#CBD5E1] font-normal"}>{"/"}</span>
                <span className={"text-[#64748B] font-medium truncate max-w-[180px]"}>{propertyTitle}</span>
                <span className={"text-[#CBD5E1] font-normal"}>{"/"}</span>
                <span className={"text-[#157375] font-bold"}>{"Booking #SL-" + String(booking.id).padStart(4, "0")}</span>
              </nav>

              <div className={"flex items-center shrink-0"}>
                <ActionButton
                  className={"inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#E3ECF3] text-[#1E293B] hover:text-[#157375] hover:border-[#46B1B1]/50 font-label-sm text-label-sm font-semibold shadow-sm transition-all"}
                  actionLabel={"print Print Receipt"}
                  aria-label={"print Print Receipt"}
                  hint={"window.print()"}
                >
                  <Icon name="print" className="material-symbols-outlined text-[16px]" />
                  <span>{"Print Receipt"}</span>
                </ActionButton>
              </div>
            </div>

            <div className={"relative overflow-hidden bg-white border border-[#E3ECF3] rounded-[22px] shadow-[0_2px_14px_rgba(21,115,117,0.06)]"}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-[58%] bg-cover bg-no-repeat"
                style={{ backgroundImage: `url("/images/header_view_booking.png")`, backgroundPosition: 'right center' }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
              <div className={"relative p-6 sm:p-8 space-y-2"}>
                <p className={"text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#46B1B1]"}>{"Booking"}</p>
                <div className={"flex items-center flex-wrap gap-3"}>
                  <h1 className={"text-[28px] sm:text-[34px] font-extrabold tracking-tight text-[#1E293B]"}>{"Booking Details"}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold tracking-wide ${badge.bg}`}>
                    <Icon name={badge.icon} className="material-symbols-outlined text-[16px]" />
                    {badge.label}
                  </span>
                  {payment ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold ${payBadge.bg}`}>
                      <Icon name={payment.payment_method === "cash" ? "payments" : "credit_card"} className="material-symbols-outlined text-[15px]" />
                      {payMethodLabel} · {payBadge.label}
                    </span>
                  ) : (
                    <span className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 font-label-sm text-label-sm font-bold"}>
                      <Icon name="hourglass_top" className="material-symbols-outlined text-[15px]" />
                      {payMethodLabel}
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-[#64748B]">
                  Booking ID: <span className="font-mono font-bold text-[#1E293B]">#{booking.id}</span> <span className="mx-1 text-[#CBD5E1]">·</span> Created {new Date(booking.created_at).toLocaleString()} <span className="mx-1 text-[#CBD5E1]">·</span> Property #{booking.property_id}
                </p>
              </div>
            </div>

            <div className={"grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"}>
              <div className={"lg:col-span-8 space-y-5 min-w-0"}>
                <div className={"bg-white border border-[#E3ECF3] rounded-[22px] overflow-hidden shadow-[0_2px_14px_rgba(21,115,117,0.06)] flex flex-col sm:flex-row"}>
                  <div className={"sm:w-2/5 relative min-h-[220px] sm:min-h-[240px]"}>
                    <LocalImage className={"absolute inset-0 w-full h-full object-cover"} src={cover} alt={propertyTitle} />
                    <div className={"absolute top-3 left-3 bg-[#1E293B]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10.5px] uppercase tracking-wider font-bold"}>{propertyTypeLabel}</div>
                  </div>
                  <div className={"sm:w-3/5 p-6 sm:p-7 flex flex-col justify-center space-y-2"}>
                    <div className={"space-y-2"}>
                      <div className={"flex items-center gap-1.5 text-[#64748B] text-[13px]"}>
                        <Icon name="location_on" className="material-symbols-outlined text-[#46B1B1] text-[16px]" />
                        <span>
                          {propertyLocation}
                          {propertyAddress}
                        </span>
                      </div>
                      <h2 className={"text-[20px] font-extrabold text-[#1E293B] leading-snug"}>{propertyTitle}</h2>
                      {property && (
                        <div className={"flex items-center gap-3 pt-1"}>
                          <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11.5px] font-bold"}><Icon name="verified" className="material-symbols-outlined text-[14px]" />{"Verified Property"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={"bg-white border border-[#E3ECF3] rounded-[22px] p-6 sm:p-7 shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-6"} id={"stay-details"}>
                  <div className={"flex items-center justify-between gap-3 pb-4 border-b border-[#EAF1F6]"}>
                    <div className={"flex items-center gap-2.5"}>
                      <span className={"w-10 h-10 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
                        <Icon name="event_available" className="material-symbols-outlined text-[#157375] text-[22px]" />
                      </span>
                      <h3 className={"text-[19px] text-[#1E293B] font-extrabold tracking-tight"}>{"Stay Details"}</h3>
                    </div>
                    <span className={"text-[12.5px] text-[#157375] font-bold bg-[#46B1B1]/10 border border-[#46B1B1]/15 px-3 py-1.5 rounded-full shrink-0"}>{nights} Nights Total</span>
                  </div>

                  <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                    <div className={"bg-[#F4F7FB] border border-[#EAF1F6] rounded-2xl p-4 sm:p-5 space-y-1.5"}>
                      <div className={"flex items-center gap-2"}>
                        <span className={"w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0"}>
                          <Icon name="calendar_month" className="material-symbols-outlined text-[19px] text-[#157375]" />
                        </span>
                        <span className={"text-[11px] text-[#64748B] uppercase tracking-wider font-bold"}>{"Check-in"}</span>
                      </div>
                      <p className={"text-[16px] text-[#1E293B] font-extrabold"}>{formatDateLong(booking.check_in)}</p>
                      <p className={"text-[12.5px] text-[#64748B] flex items-center gap-1.5"}>
                        <Icon name="schedule" className="material-symbols-outlined text-[15px]" />
                        {"3:00 PM onwards"}
                      </p>
                    </div>
                    <div className={"bg-[#F4F7FB] border border-[#EAF1F6] rounded-2xl p-4 sm:p-5 space-y-1.5"}>
                      <div className={"flex items-center gap-2"}>
                        <span className={"w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0"}>
                          <Icon name="event" className="material-symbols-outlined text-[19px] text-[#157375]" />
                        </span>
                        <span className={"text-[11px] text-[#64748B] uppercase tracking-wider font-bold"}>{"Check-out"}</span>
                      </div>
                      <p className={"text-[16px] text-[#1E293B] font-extrabold"}>{formatDateLong(booking.check_out)}</p>
                      <p className={"text-[12.5px] text-[#64748B] flex items-center gap-1.5"}>
                        <Icon name="schedule" className="material-symbols-outlined text-[15px]" />
                        {"Until 11:00 AM"}
                      </p>
                    </div>
                  </div>

                  <div className={"flex items-center gap-3 p-4 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                    <span className={"w-10 h-10 rounded-full bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
                      <Icon name="group" className="material-symbols-outlined text-[#157375] text-[20px]" />
                    </span>
                    <div>
                      <p className={"text-[13.5px] font-bold text-[#1E293B]"}>{"Guests Registered"}</p>
                      <p className={"text-[13px] text-[#64748B]"}>{booking.guests} Guests · Entire Chalet reservation</p>
                    </div>
                  </div>

                  <div className={"space-y-4 pt-1"}>
                    <h4 className={"flex items-center gap-2 text-[13px] uppercase tracking-wider text-[#1E293B] font-extrabold"}><Icon name="key" className="material-symbols-outlined text-[18px] text-[#157375]" />{"Arrival & Access Protocol"}</h4>
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-3"}>
                      <div className={"flex items-start gap-3 p-4 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                        <div className={"w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#157375] shadow-sm shrink-0"}>
                          <Icon name="key" className="material-symbols-outlined text-[19px]" />
                        </div>
                        <div className={"space-y-0.5"}>
                          <p className={"text-[13.5px] font-bold text-[#1E293B]"}>{"Key Handover"}</p>
                          <p className={"text-[12.5px] text-[#64748B] leading-relaxed"}>{"Host greeting & on-site keys handover upon arrival at the gatehouse entrance."}</p>
                        </div>
                      </div>
                      <div className={"flex items-start gap-3 p-4 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                        <div className={"w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#157375] shadow-sm shrink-0"}>
                          <Icon name="shield_person" className="material-symbols-outlined text-[19px]" />
                        </div>
                        <div className={"space-y-0.5"}>
                          <p className={"text-[13.5px] font-bold text-[#1E293B]"}>{"Assigned Superhosts"}</p>
                          <p className={"text-[12.5px] text-[#64748B] leading-relaxed"}>{"Host will meet you directly at 3:00 PM on check-in day."}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={"space-y-3 pt-1"}>
                    <h4 className={"flex items-center gap-2 text-[13px] uppercase tracking-wider text-[#1E293B] font-extrabold"}><Icon name="home" className="material-symbols-outlined text-[18px] text-[#157375]" />{"Guaranteed Chalet Infrastructure"}</h4>
                    <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                      <div className={"flex items-center gap-2.5 text-[#1E293B] text-[13px] font-medium p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                        <Icon name="solar_power" className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0" />
                        <span>{"24/7 uninterrupted generator & solar grid"}</span>
                      </div>
                      <div className={"flex items-center gap-2.5 text-[#1E293B] text-[13px] font-medium p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                        <Icon name="hot_tub" className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0" />
                        <span>{"Heated outdoor year-round Jacuzzi"}</span>
                      </div>
                      <div className={"flex items-center gap-2.5 text-[#1E293B] text-[13px] font-medium p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                        <Icon name="fireplace" className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0" />
                        <span>{"Indoor seasoned cedar logs for fireplace"}</span>
                      </div>
                      <div className={"flex items-center gap-2.5 text-[#1E293B] text-[13px] font-medium p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]"}>
                        <Icon name="wifi" className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0" />
                        <span>{"High-speed optical fiber internet (80 Mbps)"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"bg-white border border-[#E3ECF3] rounded-[22px] p-6 sm:p-7 shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-4"}>
                  <div className={"flex items-center gap-2.5"}>
                    <span className={"w-10 h-10 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
                      <Icon name="policy" className="material-symbols-outlined text-[#157375] text-[21px]" />
                    </span>
                    <h3 className={"text-[19px] text-[#1E293B] font-extrabold tracking-tight"}>{"Chalet House Rules Reminder"}</h3>
                  </div>
                  <div className={"grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1"}>
                    <div className={"p-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 space-y-1.5"}>
                      <div className={"flex items-center gap-2 text-[#1E293B] text-[13.5px] font-bold"}>
                        <span className={"w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0"}>
                          <Icon name="volume_off" className="material-symbols-outlined text-[#157375] text-[18px]" />
                        </span>
                        <span>{"Quiet Hours"}</span>
                      </div>
                      <p className={"text-[12.5px] text-[#64748B] leading-relaxed"}>{"After 11:00 PM out of mountain neighborhood respect."}</p>
                    </div>
                    <div className={"p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] space-y-1.5"}>
                      <div className={"flex items-center gap-2 text-[#1E293B] text-[13.5px] font-bold"}>
                        <span className={"w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0"}>
                          <Icon name="smoke_free" className="material-symbols-outlined text-[#E11D48] text-[18px]" />
                        </span>
                        <span>{"No Smoking"}</span>
                      </div>
                      <p className={"text-[12.5px] text-[#64748B] leading-relaxed"}>{"Strictly non-smoking inside chalet. Allowed on open terraces."}</p>
                    </div>
                    <div className={"p-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 space-y-1.5"}>
                      <div className={"flex items-center gap-2 text-[#1E293B] text-[13.5px] font-bold"}>
                        <span className={"w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0"}>
                          <Icon name="pets" className="material-symbols-outlined text-[#157375] text-[18px]" />
                        </span>
                        <span>{"Pets Welcome"}</span>
                      </div>
                      <p className={"text-[12.5px] text-[#64748B] leading-relaxed"}>{"Allowed upon prior confirmation with host."}</p>
                    </div>
                  </div>
                </div>

                <div className={"bg-white border border-[#E3ECF3] rounded-[22px] p-6 sm:p-7 shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-5"}>
                  <div className={"flex items-center justify-between gap-3"}>
                    <div className={"flex items-center gap-2.5"}>
                      <span className={"w-10 h-10 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
                        <Icon name="event_busy" className="material-symbols-outlined text-[#157375] text-[21px]" />
                      </span>
                      <h3 className={"text-[19px] text-[#1E293B] font-extrabold tracking-tight"}>{"Cancellation Terms"}</h3>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 ${isCancelled ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{isCancelled ? "Cancelled" : "Flexible Policy"}</span>
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
                            <div className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">Original booking total</div>
                            <div className="font-semibold text-[#1E293B]">{formatPrice(booking.total_price)}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">Cancellation policy applied</div>
                            <div className="font-semibold text-[#1E293B]">{booking.cancellation_percentage != null ? `${Number(booking.cancellation_percentage).toFixed(0)}% deduction` : "—"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">Cancellation deduction</div>
                            <div className="font-semibold text-amber-700">{booking.cancellation_fee ? formatPrice(booking.cancellation_fee) : "—"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">Actual refund</div>
                            <div className="font-bold text-emerald-700">{booking.refund_amount ? formatPrice(booking.refund_amount) : payment?.refunded_amount ? formatPrice(payment.refunded_amount) : payment?.payment_method === "cash" ? "$0.00" : "—"}</div>
                          </div>
                        </div>
                        {payment && (
                          <div className="flex items-center justify-between text-xs bg-white rounded-lg p-3 mt-1">
                            <span className="text-[#64748B]">Payment status</span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${paymentStatusBadge(payment.payment_status).bg}`}>{paymentStatusBadge(payment.payment_status).label}</span>
                          </div>
                        )}
                        {payment?.payment_method === "cash" && (
                          <p className="text-xs text-[#64748B]">Since this cash payment was not collected, no monetary refund was required.</p>
                        )}
                        {payment?.payment_method === "stripe" && payment?.payment_status.includes("refund") && (
                          <p className="text-xs text-emerald-700">Refund processed through the original card via Stripe.</p>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B]">Original booking total {formatPrice(booking.total_price)} remains visible as historical information. This booking remains in your history.</p>
                    </div>
                  ) : (
                    <>
                      <div className={"p-4 sm:p-5 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 text-[#1E293B] space-y-2"}>
                        <div className={"flex items-start gap-3"}>
                          <Icon name="check_circle" className="material-symbols-outlined text-emerald-600 mt-0.5 text-[20px] shrink-0" />
                          <p className={"text-[13.5px] leading-relaxed"}>
                            <strong>{"Cancellation policy applies"}</strong> <span className="text-[#475569]">— booking can be cancelled before check-in with tiered fees: 0% (≥10 days), 10% (5-9 days), 30% (&lt;5 days).</span>
                          </p>
                        </div>
                      </div>

                      <div className={"pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
                        <p className={"text-[12.5px] text-[#64748B]"}>{"Need to modify or cancel your reservation dates?"}</p>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={handleCancelClick}
                            disabled={cancelling}
                            className={`px-5 py-2.5 rounded-2xl text-[13.5px] font-bold transition-all shadow-sm w-full sm:w-auto ${cancelling ? "bg-slate-200 text-[#64748B] cursor-not-allowed" : "bg-[#FFF1F2] text-[#E11D48] hover:bg-[#FFE4E6] border border-[#FECDD3]"}`}
                          >
                            {cancelling ? "Processing cancellation..." : "Cancel Booking"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#64748B] bg-slate-100 px-3 py-1.5 rounded-full">
                            {isPastCheckIn ? "Cancellation unavailable — check-in has passed" : `Cancellation unavailable — status: ${booking.status}`}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {booking.status === "completed" && (
                  <div className={"bg-white border border-[#E3ECF3] rounded-[22px] p-6 sm:p-7 shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-4"}>
                    <div className={"flex items-center gap-2.5"}>
                      <span className={"w-10 h-10 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
                        <Icon name="rate_review" className="material-symbols-outlined text-[#157375] text-[21px]" />
                      </span>
                      <h3 className={"text-[19px] text-[#1E293B] font-extrabold tracking-tight"}>{"Your Review"}</h3>
                    </div>
                    {reviewLoading ? (
                      <div className="flex items-center gap-2 py-4"><span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm text-[#64748B]">Checking review status…</span></div>
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
                            <div key={r.label} className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]">
                              <span className="font-semibold text-[13px] text-[#1E293B]">{r.label}</span>
                              <span className="flex items-center gap-1 font-bold text-amber-500">{r.value} <Icon name="star" className="text-[16px]" /></span>
                            </div>
                          ))}
                        </div>
                        {review.comment && (
                          <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#EAF1F6]">
                            <p className="text-[12.5px] font-bold text-[#1E293B] mb-1">Your comment</p>
                            <p className="text-[13.5px] text-[#475569] italic">“{review.comment}”</p>
                            <p className="text-xs text-[#64748B] mt-2">Submitted {new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        )}
                        {!review.comment && <p className="text-xs text-[#64748B]">Submitted {new Date(review.created_at).toLocaleDateString()} — no comment.</p>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[13.5px] text-[#475569] leading-relaxed">Share your verified experience for this completed stay. Your review helps future guests and will be shown on the property page.</p>
                        <Link href={`/account/bookings/${booking.id}/review`} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#157375] hover:bg-[#0E4E50] text-white text-[13.5px] font-bold transition-colors shadow-sm">
                          <Icon name="rate_review" className="material-symbols-outlined text-white text-[18px]" />
                          Write a Review
                        </Link>
                        <p className="text-xs text-[#64748B]">One review per completed booking. Ratings 1–5, comment optional.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={"lg:col-span-4 space-y-5 min-w-0"}>
                <div className={"bg-white border border-[#E3ECF3] rounded-[22px] p-6 shadow-[0_8px_30px_rgba(21,115,117,0.10)] space-y-5 lg:sticky lg:top-24"}>
                  <div className={"flex items-center justify-between gap-3 pb-4 border-b border-[#EAF1F6]"}>
                    <div className={"flex items-center gap-2.5"}>
                      <span className={"w-10 h-10 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
                        <Icon name="account_balance_wallet" className="material-symbols-outlined text-[#157375] text-[21px]" />
                      </span>
                      <h3 className={"text-[17px] text-[#1E293B] font-extrabold tracking-tight"}>{"Price Summary"}</h3>
                    </div>
                    <span className={"text-[11px] bg-[#46B1B1]/10 border border-[#46B1B1]/15 text-[#157375] px-2.5 py-1 rounded-full font-bold shrink-0"}>{"USD Currency"}</span>
                  </div>

                  <div className={"space-y-3 text-[13.5px] text-[#475569]"}>
                    <div className={"flex justify-between items-center gap-3"}>
                      <span>
                        {formatPrice(booking.price_per_night)} × {booking.number_of_nights} nights
                      </span>
                      <span className={"text-[#157375] font-bold"}>{formatPrice(booking.total_price)}</span>
                    </div>
                  </div>

                  <div className={"pt-4 border-t border-[#EAF1F6] space-y-3"}>
                    <div className={"flex justify-between items-baseline gap-3"}>
                      <span className={"text-[16px] font-extrabold text-[#1E293B]"}>{"Total"}</span>
                      <span className={"text-[22px] font-extrabold text-[#157375]"}>{formatPrice(booking.total_price)}</span>
                    </div>

                    <div className={"bg-[#F4F7FB] border border-[#EAF1F6] p-3.5 rounded-2xl space-y-2"}>
                      <div className={"flex items-center justify-between text-[#1E293B]"}>
                        <div className={"flex items-center gap-2 text-[13px] font-bold"}>
                          <Icon name={payment?.payment_method === "cash" ? "payments" : "credit_card"} className="material-symbols-outlined text-[#157375] text-[19px]" />
                          <span>{payMethodLabel}</span>
                        </div>
                        <span className={`text-[11.5px] px-2.5 py-1 rounded-full font-bold ${payBadge.bg}`}>{payBadge.label}</span>
                      </div>
                      {!payment && (
                        <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-2 rounded-xl leading-relaxed">
                          {paymentMissing ? "No payment record yet for this booking. The booking is still pending and will show payment details after you choose Cash or Card at checkout." : "Payment information unavailable."}
                        </p>
                      )}
                      {isCancelled && payment && (
                        <div className="pt-2 border-t border-surface-container-low space-y-1 text-xs">
                          <div className="flex justify-between"><span className="text-[#64748B]">Actual refund</span><span className="font-semibold text-emerald-700">{payment.refunded_amount && Number(payment.refunded_amount) !== 0 ? formatPrice(payment.refunded_amount) : booking.refund_amount ? formatPrice(booking.refund_amount) : payment.payment_method === "cash" ? "$0.00" : formatPrice(0)}</span></div>
                        </div>
                      )}
                    </div>
                    {isCancelled && (
                      <p className="text-xs text-[#64748B]">Booking remains in your history. Original total {formatPrice(booking.total_price)} preserved.</p>
                    )}
                  </div>
                </div>

                <div className={"relative overflow-hidden bg-white border border-[#E3ECF3] rounded-[22px] p-6 shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-4"}>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-no-repeat opacity-90"
                    style={{ backgroundImage: `url("/images/side_card.png")`, backgroundSize: 'contain', backgroundPosition: 'bottom right' }}
                  />
                  <div className={"relative flex items-start gap-3"}>
                    <div className={"w-11 h-11 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center text-[#157375] shrink-0"}>
                      <Icon name="verified_user" className="material-symbols-outlined text-[22px]" />
                    </div>
                    <div className={"space-y-1"}>
                      <h4 className={"text-[15px] font-extrabold text-[#1E293B] tracking-tight"}>{"StayLeb Protection Shield"}</h4>
                      <p className={"text-[12.5px] text-[#475569] leading-relaxed"}>{"Every reservation includes 24/7 localized Beirut mountain support, utility continuity guarantee, and emergency property rebooking assistance."}</p>
                    </div>
                  </div>
                  <div className={"relative pt-3 border-t border-[#EAF1F6] flex items-center justify-between text-[#475569] text-[12.5px]"}>
                    <span>{"Direct Support Hotline:"}</span>
                    <span className={"flex items-center gap-1.5 font-bold text-[#157375]"}><Icon name="call" className="material-symbols-outlined text-[16px]" />{"+961 1 998 877"}</span>
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

