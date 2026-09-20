import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable, SearchInput } from "@/components/ui/Interactions";

export function OwnerBookingsSection0() { return <>
<main className={"w-full  pt-6 min-h-screen bg-background"}><div className={"flex flex-col w-full"}>
<div className={"p-space-lg max-w-[1400px] w-full mx-auto space-y-space-lg"}>

<div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-md"}>
<div className={"space-y-space-xxs"}>
<nav className={"flex items-center gap-space-xs text-on-surface-variant font-caption text-caption mb-1"}>
<ActionButton className={"hover:text-primary transition-colors flex items-center gap-1"} actionLabel={"space_dashboard Dashboard"} aria-label={"space_dashboard Dashboard"}>
<Icon name="space_dashboard" className="material-symbols-outlined text-[14px]" />
<span>{"Dashboard"}</span>
</ActionButton>
<span className={"text-outline-variant font-semibold"}>{"/"}</span>
<span className={"text-on-surface font-semibold text-caption"}>{"Bookings"}</span>
</nav>
<h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"Bookings Management"}</h1>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>{"\n          Manage guest reservations across your properties. Review pending Cash requests and inspect confirmed bookings.\n        "}</p>
</div>

<div className={"flex items-center gap-space-xs self-start md:self-auto"}>
<ActionButton className={"inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md text-on-surface font-label-md text-label-md transition-all"} actionLabel={"download Export CSV"} aria-label={"download Export CSV"}>
<Icon name="download" className="material-symbols-outlined text-[18px] text-primary" />
<span>{"Export CSV"}</span>
</ActionButton>
<ActionButton className={"inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md text-on-surface font-label-md text-label-md transition-all"} actionLabel={"calendar_month Calendar View"} aria-label={"calendar_month Calendar View"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-primary" />
<span>{"Calendar View"}</span>
</ActionButton>
</div>
</div>

<div className={"grid grid-cols-1 md:grid-cols-3 gap-space-md"}>

<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex items-center justify-between"}>
<div className={"space-y-1"}>
<span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Total Active Reservations"}</span>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-display text-display text-on-surface tracking-tight"}>{"4"}</span>
<span className={"font-label-sm text-label-sm text-secondary font-semibold"}>{"Live in pipeline"}</span>
</div>
<p className={"font-caption text-caption text-outline"}>{"Across 3 mountain chalets"}</p>
</div>
<div className={"w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center"}>
<Icon name="hotel" className="material-symbols-outlined text-[26px]" />
</div>
</div>

<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex items-center justify-between"}>
<div className={"space-y-1"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-caption text-caption uppercase tracking-wider text-tertiary-container font-semibold"}>{"Awaiting Owner Approval"}</span>
<span className={"w-2 h-2 rounded-full bg-tertiary-container animate-pulse"}></span>
</div>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-display text-display text-on-surface tracking-tight"}>{"1"}</span>
<span className={"px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>{"$480.00 Cash"}</span>
</div>
<p className={"font-caption text-caption text-outline"}>{"Action required within 18 hours"}</p>
</div>
<div className={"w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary-container flex items-center justify-center"}>
<Icon name="pending_actions" className="material-symbols-outlined text-[26px]" />
</div>
</div>

<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex items-center justify-between"}>
<div className={"space-y-1"}>
<span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Confirmed Arrivals"}</span>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-display text-display text-on-surface tracking-tight"}>{"3"}</span>
<span className={"font-label-sm text-label-sm text-primary font-semibold"}>{"Guaranteed"}</span>
</div>
<p className={"font-caption text-caption text-outline"}>{"Next guest arriving tomorrow at 15:00"}</p>
</div>
<div className={"w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center"}>
<Icon name="verified_user" className="material-symbols-outlined text-[26px]" />
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col"}>

<div className={"px-space-md pt-space-md bg-surface-container-low/40 flex items-center justify-between flex-wrap gap-space-sm"}>
<div className={"flex items-center gap-1 overflow-x-auto"}>
<ActionButton className={"px-space-md py-2.5 rounded-t-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-bold shadow-sm flex items-center gap-space-xs"} actionLabel={"All 6"} aria-label={"All 6"}>
<span>{"All"}</span>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption"}>{"6"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-2.5 rounded-t-lg hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-space-xs"} actionLabel={"Pending Approval 1"} aria-label={"Pending Approval 1"}>
<span>{"Pending Approval"}</span>
<span className={"px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>{"1"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-2.5 rounded-t-lg hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-space-xs"} actionLabel={"Confirmed 3"} aria-label={"Confirmed 3"}>
<RecordStatus initial={"Confirmed"}></RecordStatus>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption"}>{"3"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-2.5 rounded-t-lg hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-space-xs"} actionLabel={"Completed 1"} aria-label={"Completed 1"}>
<RecordStatus initial={"Completed"}></RecordStatus>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption"}>{"1"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-2.5 rounded-t-lg hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-space-xs"} actionLabel={"Cancelled / Rejected 1"} aria-label={"Cancelled / Rejected 1"}>
<span>{"Cancelled / Rejected"}</span>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption"}>{"1"}</span>
</ActionButton>
</div>
<div className={"flex items-center gap-space-xs pb-space-xs"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Live synchronization"}</span>
<span className={"w-2 h-2 rounded-full bg-primary animate-ping"}></span>
</div>
</div>

<div className={"p-space-md bg-surface-container-low/20 grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center"}>

<div className={"md:col-span-5 relative"}>
<Icon name="search" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
<SearchInput className={"w-full pl-10 pr-space-md h-11 bg-surface-container-lowest rounded-xl text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm placeholder:text-outline-variant"} placeholder={"Search by guest name, phone, or reference (#SLB-...)"} type={"text"} name={"search-by-guest-name,-phone,-or-reference-(#slb-...)"} aria-label={"Search by guest name, phone, or reference (#SLB-...)"}></SearchInput>
</div>

<div className={"md:col-span-4 relative"}>
<select className={"w-full appearance-none h-11 pl-space-md pr-10 bg-surface-container-lowest rounded-xl text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm cursor-pointer"} aria-label={"Select an option"}>
<option value={"all"}>{"All Properties (Cedar Peak, Faqra Crest, Faraya Luxe)"}</option>
<option value={"p1"}>{"Cedar Peak Stone Chalet \u00b7 Faqra"}</option>
<option value={"p2"}>{"Faqra Crest Modern Villa \u00b7 Club Area"}</option>
<option value={"p3"}>{"Faraya Luxe Loft 402 \u00b7 Mzaar"}</option>
</select>
<Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]" />
</div>

<div className={"md:col-span-3 relative"}>
<ActionButton className={"w-full h-11 px-space-md bg-surface-container-lowest rounded-xl text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center justify-between shadow-sm transition-colors"} actionLabel={"date_range Sep 01 \u2013 Nov 30, 2024 calendar_today"} aria-label={"date_range Sep 01 \u2013 Nov 30, 2024 calendar_today"}>
<div className={"flex items-center gap-space-xs truncate"}>
<Icon name="date_range" className="material-symbols-outlined text-[18px] text-primary" />
<span className={"truncate"}>{"Sep 01 \u2013 Nov 30, 2024"}</span>
</div>
<Icon name="calendar_today" className="material-symbols-outlined text-outline text-[18px]" />
</ActionButton>
</div>
</div>

<div className={"mx-space-md mt-space-md p-space-md rounded-xl bg-tertiary-fixed/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0"}>
<Icon name="notification_important" className="material-symbols-outlined text-[20px]" />
</div>
<div>
<div className={"flex items-center gap-space-xs"}>
<h2 className={"font-title-md text-title-md text-tertiary font-bold"}>{"1 Cash Reservation Pending Confirmation"}</h2>
<span className={"px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-caption text-caption"}>{"Oct 18 \u2013 21"}</span>
</div>
<p className={"font-body-md text-body-md text-on-tertiary-fixed-variant"}>{"\n              Maya Haddad requested to pay $480.00 in cash upon arrival at Cedar Peak Stone Chalet. Accept to block the dates on your calendar.\n            "}</p>
</div>
</div>
<div className={"flex items-center gap-space-xs flex-shrink-0"}>
<Link className={"px-space-md py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all shadow-sm font-semibold flex items-center gap-1.5"} href={"/account/bookings/stay-002/pending"}>
<Icon name="rule" className="material-symbols-outlined text-[18px]" />
<span>{"Review Request"}</span>
</Link>
</div>
</div>

<div className={"w-full overflow-x-auto mt-space-sm"}>
<DataTable className={"w-full text-left border-collapse"}>
<thead>
<tr className={"bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider"}>
<th className={"py-3.5 px-space-md font-semibold"}>{"Booking Ref & Property"}</th>
<th className={"py-3.5 px-space-md font-semibold"}>{"Client / Guest"}</th>
<th className={"py-3.5 px-space-md font-semibold"}>{"Stay Dates & Nights"}</th>
<th className={"py-3.5 px-space-md font-semibold"}>{"Payment Method"}</th>
<th className={"py-3.5 px-space-md font-semibold"}>{"Total"}</th>
<th className={"py-3.5 px-space-md font-semibold"}>{"Status"}</th>
<th className={"py-3.5 px-space-md font-semibold text-right"}>{"Actions"}</th>
</tr>
</thead>
<tbody className={"divide-y-0"}>

<RecordRow className={"bg-tertiary-fixed/10 hover:bg-tertiary-fixed/20 transition-colors"} initialStatus={""}>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-start gap-space-xs"}>
<div className={"w-2 h-2 rounded-full bg-tertiary-container mt-1.5"}></div>
<div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-on-surface"}>{"#REQ-9102-CSH"}</span>
<span className={"px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>{"Cash On Arrival"}</span>
</div>
<span className={"font-body-md text-body-md text-on-surface-variant block mt-0.5"}>{"Cedar Peak Stone Chalet"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-caption"}>{"MH"}</div>
<div>
<span className={"font-label-md text-label-md font-semibold text-on-surface block"}>{"Maya Haddad"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"2 Guests \u00b7 Beirut, LB"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<span className={"font-label-md text-label-md text-on-surface block font-medium"}>{"Oct 18 \u2013 Oct 21, 2024"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"3 nights \u00b7 Weekend stay"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="payments" className="material-symbols-outlined text-tertiary-container text-[18px]" />
<span className={"font-label-md text-label-md text-on-surface"}>{"Cash on Arrival"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"font-title-md text-title-md font-bold text-on-surface block"}>{"$480.00"}</span>
<span className={"font-caption text-caption text-outline"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary-container"}></span>
<span>{"Pending Approval"}</span>
</span>
</td>
<td className={"py-space-md px-space-md align-middle text-right"}>
<div className={"flex items-center justify-end gap-space-xs"}>
<Link className={"px-space-sm py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-all shadow-sm"} href={"/account/bookings/stay-002/pending"}>{"\n                    Review Request\n                  "}</Link>
<ActionButton className={"w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed flex items-center justify-center transition-colors"} title={"Quick Approve"} actionLabel={"check"} aria-label={"check"}>
<Icon name="check" className="material-symbols-outlined text-[18px]" />
</ActionButton>
<ActionButton className={"w-8 h-8 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error flex items-center justify-center transition-colors"} title={"Reject Request"} actionLabel={"close"} aria-label={"close"}>
<Icon name="close" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors"} initialStatus={"Confirmed"}>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-primary"}>{"#SLB-84920"}</span>
<span className={"px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption"}>{"Instant Book"}</span>
</div>
<span className={"font-body-md text-body-md text-on-surface-variant block mt-0.5"}>{"Cedar Peak Stone Chalet"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-caption"}>{"RK"}</div>
<div>
<span className={"font-label-md text-label-md font-semibold text-on-surface block"}>{"Rami Kanaan"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"4 Guests \u00b7 Verified ID"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<span className={"font-label-md text-label-md text-on-surface block font-medium"}>{"Sep 25 \u2013 Sep 28, 2024"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"3 nights \u00b7 Check-in 15:00"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="credit_card" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-md text-label-md text-on-surface"}>{"Stripe / Online"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"font-title-md text-title-md font-bold text-primary block"}>{"$740.00"}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"Paid in full"}</span>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<RecordStatus className={"inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"} initial={"Confirmed"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-middle text-right"}>

<ActionButton className={"px-space-md py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-all"} actionLabel={"View Details"} aria-label={"View Details"}>{"\n                  View Details\n                "}</ActionButton>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors"} initialStatus={"Confirmed"}>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-primary"}>{"#SLB-84918"}</span>
</div>
<span className={"font-body-md text-body-md text-on-surface-variant block mt-0.5"}>{"Faqra Crest Modern Villa"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-caption"}>{"SM"}</div>
<div>
<span className={"font-label-md text-label-md font-semibold text-on-surface block"}>{"Sarah Mouzannar"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"6 Guests \u00b7 Repeat Guest"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<span className={"font-label-md text-label-md text-on-surface block font-medium"}>{"Oct 02 \u2013 Oct 06, 2024"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"4 nights \u00b7 Family stay"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="credit_card" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-md text-label-md text-on-surface"}>{"Stripe / Online"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"font-title-md text-title-md font-bold text-primary block"}>{"$1,450.00"}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"Paid in full"}</span>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<RecordStatus className={"inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"} initial={"Confirmed"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-middle text-right"}>
<ActionButton className={"px-space-md py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-all"} actionLabel={"View Details"} aria-label={"View Details"}>{"\n                  View Details\n                "}</ActionButton>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors"} initialStatus={"Confirmed"}>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-primary"}>{"#SLB-84880"}</span>
</div>
<span className={"font-body-md text-body-md text-on-surface-variant block mt-0.5"}>{"Faraya Luxe Loft 402"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-caption"}>{"JA"}</div>
<div>
<span className={"font-label-md text-label-md font-semibold text-on-surface block"}>{"Jad Abou Rjeily"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"2 Guests"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<span className={"font-label-md text-label-md text-on-surface block font-medium"}>{"Oct 11 \u2013 Oct 13, 2024"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"2 nights \u00b7 Weekend"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="credit_card" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-md text-label-md text-on-surface"}>{"Stripe / Online"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"font-title-md text-title-md font-bold text-primary block"}>{"$390.00"}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"Paid in full"}</span>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<RecordStatus className={"inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"} initial={"Confirmed"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-middle text-right"}>
<ActionButton className={"px-space-md py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-all"} actionLabel={"View Details"} aria-label={"View Details"}>{"\n                  View Details\n                "}</ActionButton>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors"} initialStatus={"Settled"}>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-on-surface"}>{"#SLB-84710"}</span>
</div>
<span className={"font-body-md text-body-md text-on-surface-variant block mt-0.5"}>{"Cedar Peak Stone Chalet"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-caption"}>{"KE"}</div>
<div>
<span className={"font-label-md text-label-md font-semibold text-on-surface block"}>{"Karim El-Khoury"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"5 Guests"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<span className={"font-label-md text-label-md text-on-surface block font-medium"}>{"Aug 10 \u2013 Aug 14, 2024"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"4 nights \u00b7 Past stay"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="credit_card" className="material-symbols-outlined text-outline text-[18px]" />
<span className={"font-label-md text-label-md text-on-surface"}>{"Stripe / Online"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"font-title-md text-title-md font-bold text-on-surface block"}>{"$980.00"}</span>
<RecordStatus className={"font-caption text-caption text-outline"} initial={"Settled"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<RecordStatus className={"inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-caption text-caption font-semibold"} initial={"Completed"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-middle text-right"}>
<div className={"flex items-center justify-end gap-space-xs"}>
<ActionButton className={"px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-all"} actionLabel={"View Details"} aria-label={"View Details"}>{"\n                    View Details\n                  "}</ActionButton>
<ActionButton className={"px-space-sm py-1.5 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-highest transition-all flex items-center gap-1"} actionLabel={"View Review 5.0 \u2605"} aria-label={"View Review 5.0 \u2605"}>
<span>{"View Review"}</span>
<span className={"text-tertiary-container font-bold"}>{"5.0 \u2605"}</span>
</ActionButton>
</div>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors opacity-80"} initialStatus={""}>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-outline line-through"}>{"#REQ-8302"}</span>
<span className={"font-caption text-caption text-error font-medium"}>{"Cash Request"}</span>
</div>
<span className={"font-body-md text-body-md text-on-surface-variant block mt-0.5"}>{"Faraya Luxe Loft 402"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container text-outline flex items-center justify-center font-bold text-caption"}>{"HN"}</div>
<div>
<span className={"font-label-md text-label-md font-medium text-on-surface block"}>{"Hadi Nasser"}</span>
<span className={"font-caption text-caption text-outline"}>{"3 Guests"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div>
<span className={"font-label-md text-label-md text-outline block"}>{"Jul 02 \u2013 Jul 05, 2024"}</span>
<span className={"font-caption text-caption text-outline"}>{"3 nights"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="money_off" className="material-symbols-outlined text-outline text-[18px]" />
<span className={"font-label-md text-label-md text-outline"}>{"Cash on Arrival"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"font-title-md text-title-md font-semibold text-outline line-through block"}>{"$560.00"}</span>
<span className={"font-caption text-caption text-error"}>{"Uncollected"}</span>
</td>
<td className={"py-space-md px-space-md align-middle"}>
<span className={"inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-error"}></span>
<span>{"Rejected"}</span>
</span>
</td>
<td className={"py-space-md px-space-md align-middle text-right"}>
<div className={"flex flex-col items-end gap-1"}>
<ActionButton className={"px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-all"} actionLabel={"View Record"} aria-label={"View Record"}>{"\n                    View Record\n                  "}</ActionButton>
<span className={"font-caption text-caption text-outline italic"}>{"Owner Rejected \u00b7 Dates Released"}</span>
</div>
</td>
</RecordRow>
</tbody>
</DataTable>
</div>

<div className={"p-space-md bg-surface-container-low/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm"}>
<div className={"flex items-center gap-space-xs text-on-surface-variant font-body-md text-body-md"}>
<span>{"Showing"}</span>
<span className={"font-bold text-on-surface"}>{"1\u20136"}</span>
<span>{"of"}</span>
<span className={"font-bold text-on-surface"}>{"6"}</span>
<span>{"reservations"}</span>
</div>
<div className={"flex items-center gap-space-xs"}>
<ActionButton className={"w-9 h-9 rounded-lg bg-surface-container-lowest text-outline-variant flex items-center justify-center cursor-not-allowed"} disabled={true} actionLabel={"chevron_left"} aria-label={"chevron_left"}>
<Icon name="chevron_left" className="material-symbols-outlined text-[18px]" />
</ActionButton>
<ActionButton className={"w-9 h-9 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center"} actionLabel={"1"} aria-label={"1"}>{"\n            1\n          "}</ActionButton>
<ActionButton className={"w-9 h-9 rounded-lg bg-surface-container-lowest text-outline-variant flex items-center justify-center cursor-not-allowed"} disabled={true} actionLabel={"chevron_right"} aria-label={"chevron_right"}>
<Icon name="chevron_right" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>
</div>
</div>

<div className={"grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs"}>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-2"}>
<div className={"flex items-center gap-space-xs text-primary font-title-md text-title-md font-semibold"}>
<Icon name="verified" className="material-symbols-outlined text-secondary" />
<h3>{"Stripe Instant Confirmations"}</h3>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>{"\n          Bookings settled via credit card or digital wallets through Stripe are guaranteed instantly. The calendar dates are locked automatically to prevent double-booking across StayLeb channels.\n        "}</p>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-2"}>
<div className={"flex items-center gap-space-xs text-tertiary font-title-md text-title-md font-semibold"}>
<Icon name="schedule" className="material-symbols-outlined text-tertiary-container" />
<h3>{"Cash on Arrival Protocol"}</h3>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>{"\n          Lebanese guests opting for cash settlement require host verification. You have 24 hours to accept or decline. Upon host decline, the calendar slot is instantly released to other travelers.\n        "}</p>
</div>
</div>
</div>
</div></main>
</>; }
