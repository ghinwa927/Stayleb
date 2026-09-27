"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ActionButton } from "@/components/ui/Interactions";
import type { BookingResponse } from "@/services/bookings";
import type { PropertyResponse } from "@/services/owner";

interface ReviewReminderCardProps {
  latestStay: {
    booking: BookingResponse;
    property: PropertyResponse;
  } | null;
  additionalCount: number;
}

export function ReviewReminderCard({ latestStay, additionalCount }: ReviewReminderCardProps) {
  if (!latestStay) return null;

  const { booking, property } = latestStay;
  const stayDates = `${new Date(booking.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(booking.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow border border-surface-container-low relative overflow-hidden">
      {/* Terracotta accent line + soft wash */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D1A695] via-[#D1A695]/60 to-transparent" />
      <div className="absolute -right-14 -bottom-14 w-52 h-52 rounded-full bg-tertiary/20 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon name="rate_review" className="material-symbols-outlined text-white text-[26px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                <Icon name="event_available" className="material-symbols-outlined text-[14px]" />
                Stay Completed
              </span>
            </div>
            <h3 className="text-headline-sm font-headline-sm text-[#157375] font-bold tracking-tight truncate">
              Thank you for staying at {latestStay.property.title}
            </h3>
            <p className="text-body-md text-[#64748B] mt-1 max-w-xl">
              We'd appreciate your review. Share your experience with other StayLeb guests.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low">
                <Icon name="location_on" className="material-symbols-outlined text-[14px] text-primary" />
                {latestStay.property.location}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low">
                <Icon name="calendar_month" className="material-symbols-outlined text-[14px] text-primary" />
                {new Date(latestStay.booking.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – {new Date(latestStay.booking.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href={`/account/bookings/${latestStay.booking.id}/review`}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary-container hover:bg-primary text-white font-label-md text-label-md font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Icon name="rate_review" className="material-symbols-outlined text-[18px]" />
            Write a Review
          </Link>

          {additionalCount > 0 && (
            <Link
              href={`/account/bookings?status=completed`}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-tertiary-fixed/60 hover:bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-2"
            >
              {additionalCount} more {additionalCount === 1 ? "stay" : "stays"} waiting for your feedback
              <Icon name="arrow_forward" className="material-symbols-outlined text-[16px]" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}