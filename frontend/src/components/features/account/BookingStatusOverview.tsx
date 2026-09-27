"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface BookingStatusOverviewProps {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

function pct(count: number, total: number) {
  if (total <= 0) return "0.0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

export function BookingStatusOverview({ total, pending, confirmed, completed, cancelled }: BookingStatusOverviewProps) {
  const safeTotal = Math.max(0, total);
  const segments = [
    { key: "pending", count: pending, className: "bg-amber-400" },
    { key: "confirmed", count: confirmed, className: "bg-primary" },
    { key: "completed", count: completed, className: "bg-emerald-500" },
    { key: "cancelled", count: cancelled, className: "bg-slate-300" },
  ].filter((s) => s.count > 0 && safeTotal > 0);

  const blocks = [
    { key: "pending", label: "Pending", note: "Awaiting payment", count: pending, card: "bg-[#FFF7ED] border-[#FED7AA]/60", chip: "bg-white text-[#EA580C] shadow-sm", icon: "schedule", pctColor: "text-[#0F766E]" },
    { key: "confirmed", label: "Confirmed", note: "Active stays", count: confirmed, card: "bg-[#EFF6FF] border-[#BFDBFE]/60", chip: "bg-white text-[#0284C7] shadow-sm", icon: "check_circle", pctColor: "text-[#0F766E]" },
    { key: "completed", label: "Completed", note: "Finished stays", count: completed, card: "bg-[#F0FDF4] border-[#BBF7D0]/60", chip: "bg-white text-[#16A34A] shadow-sm", icon: "task_alt", pctColor: "text-[#0F766E]" },
  ];

  return (
    <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] p-5 sm:p-6 lg:p-7 border border-[#E9EEF3]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[13px] bg-[#E6F4F4] flex items-center justify-center text-[#157375] shrink-0">
            <Icon name="equalizer" className="material-symbols-outlined text-[22px]" />
          </div>
          <div>
            <h2 className="text-[19px] sm:text-[21px] font-bold text-[#0F2432] tracking-tight">Booking Status Overview</h2>
            <p className="text-[13px] text-[#64748B]">Distribution of your bookings by current status.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#157375] text-white text-[12px] font-bold shrink-0 shadow-[0_6px_16px_rgba(21,115,117,0.3)]">
          {safeTotal} TOTAL
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mt-5">
        {blocks.map((b) => (
          <div key={b.key} className={`rounded-[16px] border ${b.card} p-4`}>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#64748B] font-bold">
                <span className={`w-8 h-8 rounded-full ${b.chip} flex items-center justify-center`}>
                  <Icon name={b.icon} className="material-symbols-outlined text-[19px]" />
                </span>
                {b.label}
              </span>
              <span className={`text-[13px] font-bold ${b.pctColor}`}>{pct(b.count, safeTotal)}</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-[28px] leading-none font-extrabold text-[#0F2432]">{b.count}</span>
              <span className="text-[13px] text-[#64748B]">{b.count === 1 ? "booking" : "bookings"}</span>
            </div>
            <p className="mt-1 text-[12px] text-[#64748B]">{b.note}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-5 h-2 rounded-full bg-[#F1F5F9] overflow-hidden flex"
        role="img"
        aria-label={`${pending} pending, ${confirmed} confirmed, ${completed} completed, ${cancelled} cancelled out of ${safeTotal} bookings`}
      >
        {segments.map((s) => (
          <div key={s.key} className={`h-full ${s.className}`} style={{ width: `${safeTotal > 0 ? (s.count / safeTotal) * 100 : 0}%` }} />
        ))}
      </div>

      <div className="mt-4 pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F6]">
        <p className="text-[13.5px] text-[#64748B]">
          Cancelled: <strong className="text-[#0F2432]">{cancelled}</strong>
          <span className="mx-2 text-[#CBD5E1]">•</span>
          Total: <strong className="text-[#0F2432]">{safeTotal}</strong>
        </p>
        <Link className="inline-flex items-center gap-1 text-[13.5px] font-bold text-[#157375] hover:underline" href="/account/bookings">
          View all bookings
          <Icon name="arrow_forward" className="material-symbols-outlined text-[17px]" />
        </Link>
      </div>
    </div>
  );
}
