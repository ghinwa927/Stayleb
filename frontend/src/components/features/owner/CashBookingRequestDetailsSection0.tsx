import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ActionButton } from "@/components/ui/Interactions";

export function CashBookingRequestDetailsSection0() { return <>
<main className={"w-full  pt-6 min-h-screen bg-background"}><div className={"flex flex-col w-full"}>
<div className={"p-space-md sm:p-space-lg lg:p-margin-lg max-w-7xl mx-auto w-full space-y-space-md"}>

<nav aria-label={"Breadcrumb"} className={"flex items-center gap-space-xxs text-body-md font-body-md"}>
<Link className={"text-on-surface-variant hover:text-primary transition-colors"} data-path={"dashboard"} href={"/owner"}>{"Dashboard"}</Link>
<Icon name="chevron_right" className="material-symbols-outlined text-outline text-[16px] select-none" />
<ActionButton className={"text-on-surface-variant hover:text-primary transition-colors"} data-path={"owner-bookings"} actionLabel={"Bookings"} aria-label={"Bookings"}>{"Bookings"}</ActionButton>
<Icon name="chevron_right" className="material-symbols-outlined text-outline text-[16px] select-none" />
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"Request #REQ-9102-CSH"}</span>
</nav>

<div className={"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs pb-space-xs"}>
<div>
<div className={"flex items-center gap-space-xs flex-wrap"}>
<h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"Cash Booking Request Details"}</h1>
<span className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-amber-50 text-[#D97706] font-label-sm text-label-sm font-semibold tracking-wide shadow-sm"}>
<span className={"w-2 h-2 rounded-full bg-[#D97706] animate-pulse"}></span>{"\n            Pending Owner Approval\n          "}</span>
</div>
<p className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Submitted on Wednesday, Oct 16, 2024 at 14:22 EEST \u2022 Temporary hold expires in 18h 38m"}</p>
</div>
<div className={"flex items-center gap-2"}>
<span className={"font-caption text-caption font-semibold px-space-xs py-1 rounded-lg bg-surface-container text-on-surface-variant uppercase tracking-wider"}>{"Ref ID: CSH-9102"}</span>
</div>
</div>

<div className={"rounded-xl p-space-md bg-amber-50 shadow-sm flex items-start gap-space-sm text-[#92400E]"}>
<Icon name="warning" className="material-symbols-outlined text-[24px] text-[#D97706] flex-shrink-0 mt-0.5" />
<div className={"flex-1 space-y-1"}>
<p className={"font-label-md text-label-md font-semibold text-[#78350F]"}>{"Action Required: Cash on Arrival Reservation"}</p>
<p className={"font-body-md text-body-md text-[#92400E] leading-relaxed"}>{"\n          These dates ("}<span className={"font-semibold"}>{"Oct 18 \u2013 Oct 21, 2024"}</span>{") are temporarily held on your calendar. Approving confirms the booking and marks platform commission as owed. Rejecting immediately releases the dates for other guests.\n        "}</p>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start"}>

<div className={"lg:col-span-7 space-y-space-md"}>

<div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row gap-space-md"}>
<div className={"w-full sm:w-44 h-36 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Modern whitewashed coastal beachfront bungalow on the sandy shores of Sour Tyre Lebanon Mediterranean Sea sunlit clear blue sky terracotta pots wooden deck coastal furniture"} src={"/images/1424e299c7154217.jpg"} alt={"Lebanese holiday home"} />
<span className={"absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption"}>{"Furnished House"}</span>
</div>
<div className={"flex-1 flex flex-col justify-between space-y-2"}>
<div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption text-secondary font-semibold uppercase tracking-wider"}>{"Sour Coast, South Lebanon"}</span>
<span className={"flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-amber-500" />{"\n                  4.96 (42)\n                "}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface font-bold mt-0.5"}>{"Sour Sandy Beachfront Bungalow"}</h2>
<p className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Listing #BGL-402 \u2022 Instant Cash Accepted Host"}</p>
</div>
<div className={"flex items-baseline gap-1 pt-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$160.00"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"USD / night base rate"}</span>
</div>
</div>
</div>

<div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm space-y-space-sm"}>
<div className={"flex items-center justify-between pb-space-xxs"}>
<span className={"font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2"}>
<Icon name="calendar_month" className="material-symbols-outlined text-primary text-[20px]" />{"\n              Reservation Timeline\n            "}</span>
<span className={"px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold"}>{"3 Nights"}</span>
</div>
<div className={"grid grid-cols-1 sm:grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-low"}>
<div className={"space-y-1"}>
<span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-medium"}>{"Check-In"}</span>
<p className={"font-label-md text-label-md text-on-surface font-bold"}>{"Friday, Oct 18, 2024"}</p>
<p className={"font-caption text-caption text-secondary font-semibold flex items-center gap-1"}>
<Icon name="schedule" className="material-symbols-outlined text-[14px]" />{" 3:00 PM onwards\n              "}</p>
</div>
<div className={"space-y-1 sm:border-l border-outline-variant/30 sm:pl-space-sm"}>
<span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-medium"}>{"Check-Out"}</span>
<p className={"font-label-md text-label-md text-on-surface font-bold"}>{"Monday, Oct 21, 2024"}</p>
<p className={"font-caption text-caption text-on-surface-variant flex items-center gap-1"}>
<Icon name="schedule" className="material-symbols-outlined text-[14px]" />{" 11:00 AM strict\n              "}</p>
</div>
</div>

<div className={"p-space-sm rounded-lg bg-surface-container flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="lock_clock" className="material-symbols-outlined text-secondary text-[20px]" />
<span className={"font-caption text-caption text-on-surface"}>{"Dates Held: "}<strong className={"text-on-surface font-semibold"}>{"Oct 18, 19, 20"}</strong>{" (Check-out Oct 21)"}</span>
</div>
<span className={"font-caption text-caption text-primary font-semibold"}>{"Block Active"}</span>
</div>
</div>

<div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm space-y-space-sm"}>
<span className={"font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2"}>
<Icon name="person" className="material-symbols-outlined text-primary text-[20px]" />{"\n            Primary Guest Information\n          "}</span>
<div className={"flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-title-md"}>{"\n                MH\n              "}</div>
<div className={"space-y-0.5"}>
<div className={"flex items-center gap-2"}>
<h3 className={"font-label-md text-label-md text-on-surface font-bold"}>{"Maya Haddad"}</h3>
<span className={"inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-caption text-caption font-semibold"}>
<Icon name="verified" className="material-symbols-outlined text-[12px]" />{"\n                    Verified Client\n                  "}</span>
</div>
<p className={"font-caption text-caption text-on-surface-variant"}>{"Member since Jun 2022 \u2022 6 completed stays across Lebanon"}</p>
</div>
</div>
</div>
<div className={"grid grid-cols-2 sm:grid-cols-4 gap-space-xs pt-space-xxs"}>
<div className={"p-space-xs rounded-lg bg-surface-container"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Total Party"}</span>
<p className={"font-label-md text-label-md font-bold text-on-surface"}>{"4 Guests"}</p>
</div>
<div className={"p-space-xs rounded-lg bg-surface-container"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Adults"}</span>
<p className={"font-label-md text-label-md font-bold text-on-surface"}>{"2 Adults"}</p>
</div>
<div className={"p-space-xs rounded-lg bg-surface-container"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Children"}</span>
<p className={"font-label-md text-label-md font-bold text-on-surface"}>{"2 Children"}</p>
</div>
<div className={"p-space-xs rounded-lg bg-surface-container"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Infants"}</span>
<p className={"font-label-md text-label-md font-bold text-on-surface"}>{"0"}</p>
</div>
</div>
</div>

<div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-sm space-y-space-sm"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2"}>
<Icon name="payments" className="material-symbols-outlined text-primary text-[20px]" />{"\n              Financial Summary & Settlement Structure\n            "}</span>
<span className={"font-caption text-caption font-semibold px-2 py-0.5 rounded bg-surface-container-highest text-primary"}>{"Cash on Arrival (USD)"}</span>
</div>
<div className={"space-y-space-xs pt-space-xs"}>
<div className={"flex items-center justify-between text-body-md font-body-md text-on-surface"}>
<span>{"Accommodation Rate ($160.00 \u00d7 3 nights)"}</span>
<span className={"font-semibold text-on-surface"}>{"$480.00 USD"}</span>
</div>
<div className={"flex items-center justify-between text-body-md font-body-md text-on-surface"}>
<span>{"Cleaning & Linen Fee"}</span>
<span className={"font-semibold text-emerald-600"}>{"Included ($0.00)"}</span>
</div>
<div className={"flex items-center justify-between text-body-md font-body-md text-on-surface"}>
<span>{"Security Deposit (On-site hold)"}</span>
<span className={"font-semibold text-on-surface-variant"}>{"$100.00 USD (Direct)"}</span>
</div>
<div className={"p-space-sm rounded-lg bg-surface-container-low space-y-2 mt-2"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="handshake" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-md text-label-md font-bold text-primary"}>{"Guest Direct Cash Payment"}</span>
</div>
<span className={"font-title-md text-title-md font-bold text-primary"}>{"$480.00 USD"}</span>
</div>
<p className={"font-caption text-caption text-on-surface-variant"}>{"\n                Guest will pay $480.00 USD directly to you in physical USD notes upon key handover and check-in.\n              "}</p>
</div>
<div className={"p-space-sm rounded-lg bg-tertiary-container/10 space-y-1.5 mt-2"}>
<div className={"flex items-center justify-between text-body-md font-body-md"}>
<span className={"font-medium text-tertiary"}>{"StayLeb Platform Commission (10%)"}</span>
<span className={"font-bold text-tertiary"}>{"$48.00 USD"}</span>
</div>
<p className={"font-caption text-caption text-on-tertiary-fixed-variant leading-relaxed"}>{"\n                StayLeb platform commission (10% captured at booking = $48.00 USD) will become an outstanding commission balance upon approval, payable during periodic Admin settlement.\n              "}</p>
</div>
</div>
</div>
</div>

<div className={"lg:col-span-5 space-y-space-md lg:sticky lg:top-20"}>

<div className={"rounded-xl p-space-md bg-surface-container-lowest shadow-md space-y-space-md"}>
<div className={"border-b border-surface-container-high pb-space-xs"}>
<div className={"flex items-center justify-between"}>
<h2 className={"font-title-md text-title-md text-on-surface font-bold"}>{"Owner Decision"}</h2>
<span className={"w-2.5 h-2.5 rounded-full bg-secondary animate-ping"}></span>
</div>
<p className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Accept or decline this reservation request. Action is irrevocable."}</p>
</div>

<ActionButton className={"w-full h-12 px-space-md rounded-xl bg-primary hover:bg-[#115E60] active:scale-[0.98] text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"} type={"button"} actionLabel={"check_circle Approve Booking Request"} aria-label={"check_circle Approve Booking Request"} hint={"openModal('approvalModal')"}>
<Icon name="check_circle" className="material-symbols-outlined text-[20px]" />{"\n            Approve Booking Request\n          "}</ActionButton>

<ActionButton className={"w-full h-11 px-space-md rounded-xl bg-white hover:bg-rose-50 active:scale-[0.98] text-[#E11D48] shadow-sm font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"} type={"button"} actionLabel={"cancel Reject Request"} aria-label={"cancel Reject Request"} hint={"openModal('rejectionModal')"}>
<Icon name="cancel" className="material-symbols-outlined text-[20px]" />{"\n            Reject Request\n          "}</ActionButton>

<div className={"p-space-sm rounded-lg bg-surface-container flex items-start gap-space-xs text-on-surface-variant"}>
<Icon name="policy" className="material-symbols-outlined text-outline text-[18px] flex-shrink-0 mt-0.5" />
<p className={"font-caption text-caption leading-relaxed"}>{"\n              No counter-offers, date changes, or price negotiation. StayLeb enforces transparent fixed rates.\n            "}</p>
</div>
</div>

<div className={"rounded-xl p-space-md bg-surface-container-low shadow-sm space-y-space-xs"}>
<span className={"font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider"}>{"Host Protection & Terms"}</span>
<ul className={"space-y-2 pt-1 font-caption text-caption text-on-surface-variant"}>
<li className={"flex items-start gap-2"}>
<Icon name="verified_user" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" />
<span>{"Host cancellation policies apply once approved."}</span>
</li>
<li className={"flex items-start gap-2"}>
<Icon name="receipt_long" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" />
<span>{"Electronic receipt is automatically issued to the client upon your confirmation."}</span>
</li>
<li className={"flex items-start gap-2"}>
<Icon name="info" className="material-symbols-outlined text-secondary text-[16px] mt-0.5" />
<span>{"Dates unlock immediately if rejected, making them re-bookable instantly."}</span>
</li>
</ul>
</div>
</div>
</div>
</div>

<div className={"hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/40 backdrop-blur-sm"} id={"approvalModal"}>
<div className={"w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg shadow-xl space-y-space-md animate-in fade-in zoom-in duration-150"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0"}>
<Icon name="task_alt" className="material-symbols-outlined text-[24px]" />
</div>
<div>
<h3 className={"font-title-md text-title-md font-bold text-on-surface"}>{"Approve Cash Booking?"}</h3>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Reservation #REQ-9102-CSH"}</span>
</div>
</div>
<div className={"p-space-sm rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface space-y-2"}>
<p className={"leading-relaxed"}>{"\n          Approving will confirm "}<strong className={"text-on-surface font-semibold"}>{"Maya Haddad's"}</strong>{" reservation, lock "}<strong className={"text-on-surface font-semibold"}>{"Oct 18\u201321"}</strong>{" on your calendar, and record "}<strong className={"text-primary font-semibold"}>{"$48.00 USD"}</strong>{" platform commission as owed.\n        "}</p>
<div className={"flex items-center justify-between pt-2 border-t border-outline-variant/30 font-caption text-caption text-on-surface-variant"}>
<span>{"Expected Cash on Arrival"}</span>
<span className={"font-bold text-primary"}>{"$480.00 USD"}</span>
</div>
</div>
<div className={"flex items-center justify-end gap-space-xs pt-space-xs"}>
<ActionButton className={"h-10 px-space-md rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors cursor-pointer"} type={"button"} actionLabel={"Cancel"} aria-label={"Cancel"} hint={"closeModal('approvalModal')"}>{"\n          Cancel\n        "}</ActionButton>
<ActionButton className={"h-10 px-space-md rounded-lg bg-primary hover:bg-[#115E60] text-on-primary font-label-md text-label-md font-bold shadow-sm transition-all cursor-pointer"} type={"button"} actionLabel={"Confirm Approval"} aria-label={"Confirm Approval"} hint={"handleApproval()"}>{"\n          Confirm Approval\n        "}</ActionButton>
</div>
</div>
</div>

<div className={"hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/40 backdrop-blur-sm"} id={"rejectionModal"}>
<div className={"w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg shadow-xl space-y-space-md animate-in fade-in zoom-in duration-150"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-10 h-10 rounded-full bg-rose-100 text-[#E11D48] flex items-center justify-center flex-shrink-0"}>
<Icon name="block" className="material-symbols-outlined text-[24px]" />
</div>
<div>
<h3 className={"font-title-md text-title-md font-bold text-on-surface"}>{"Reject Cash Booking?"}</h3>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Reservation #REQ-9102-CSH"}</span>
</div>
</div>
<div className={"p-space-sm rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface space-y-2"}>
<p className={"leading-relaxed"}>{"\n          Rejecting will decline the reservation and immediately release "}<strong className={"text-on-surface font-semibold"}>{"Oct 18\u201321"}</strong>{" back to "}<span className={"text-emerald-700 font-semibold"}>{"Available"}</span>{" on your public calendar.\n        "}</p>
<p className={"font-caption text-caption text-on-surface-variant"}>{"\n          No platform fees will be incurred. The guest will receive an automatic notification.\n        "}</p>
</div>
<div className={"flex items-center justify-end gap-space-xs pt-space-xs"}>
<ActionButton className={"h-10 px-space-md rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors cursor-pointer"} type={"button"} actionLabel={"Go Back"} aria-label={"Go Back"} hint={"closeModal('rejectionModal')"}>{"\n          Go Back\n        "}</ActionButton>
<ActionButton className={"h-10 px-space-md rounded-lg bg-[#E11D48] hover:bg-rose-700 text-white font-label-md text-label-md font-bold shadow-sm transition-all cursor-pointer"} type={"button"} actionLabel={"Confirm Rejection"} aria-label={"Confirm Rejection"} hint={"handleRejection()"}>{"\n          Confirm Rejection\n        "}</ActionButton>
</div>
</div>
</div>


</div></main>
</>; }
