import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable, FilterSelect } from "@/components/ui/Interactions";

export function OwnerEarningsCommissionSection0() { return <>
<main className={"w-full  pt-6 min-h-screen bg-background"}><div className={"flex flex-col w-full"}>
<div className={"px-space-md sm:px-space-lg lg:px-margin-lg py-space-lg max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg"}>

<div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-md"}>
<div className={"flex flex-col gap-space-xxs"}>
<div className={"flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm"}>
<Link className={"hover:text-primary transition-colors"} data-path={"dashboard"} href={"/owner"}>{"Dashboard"}</Link>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px] text-outline" />
<span className={"text-on-surface font-semibold"}>{"Earnings / Commission"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1"}>{"Earnings & Platform Commission"}</h1>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-3xl"}>{"\n          Track revenue across confirmed bookings, platform commission rates captured at reservation time, and outstanding Cash commission balances.\n        "}</p>
</div>
<div className={"flex items-center gap-space-xs shrink-0 self-start md:self-auto"}>
<ActionButton className={"flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-container-high transition-all text-on-surface font-label-md text-label-md"} id={"exportLedgerBtn"} actionLabel={"download Export Audit Report"} aria-label={"download Export Audit Report"}>
<Icon name="download" className="material-symbols-outlined text-[18px] text-primary" />
<span>{"Export Audit Report"}</span>
</ActionButton>
<ActionButton className={"flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary shadow-sm hover:bg-primary-container transition-all font-label-md text-label-md"} actionLabel={"account_balance Ledger Statement"} aria-label={"account_balance Ledger Statement"}>
<Icon name="account_balance" className="material-symbols-outlined text-[18px]" />
<span>{"Ledger Statement"}</span>
</ActionButton>
</div>
</div>

<div className={"p-space-md sm:p-space-lg rounded-[16px] bg-surface-container-low shadow-sm flex flex-col sm:flex-row items-start gap-space-md"}>
<div className={"w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0"}>
<Icon name="verified_user" className="material-symbols-outlined text-[24px]" />
</div>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md font-bold text-primary"}>{"Platform Commission Policy"}</span>
<span className={"px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-caption text-caption uppercase tracking-wider font-semibold"}>{"Fixed Rate Lock"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n          StayLeb platform commission percentage is established by Admin and captured at the exact moment a booking is created. Historical bookings permanently retain their original captured commission rate regardless of future global adjustments.\n        "}</p>
</div>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md"}>

<div className={"p-space-lg rounded-[16px] bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"}>
<div className={"flex items-center justify-between gap-space-xs"}>
<span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Total Gross Booking Value"}</span>
<span className={"w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center"}>
<Icon name="payments" className="material-symbols-outlined text-[18px]" />
</span>
</div>
<div className={"mt-space-md"}>
<div className={"font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold"}>{"$3,820.00 "}<span className={"font-caption text-caption text-on-surface-variant"}>{"USD"}</span></div>
<p className={"font-label-sm text-label-sm text-on-surface-variant mt-1"}>{"Total value of completed & confirmed stays"}</p>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-caption text-caption"}>
<span className={"flex items-center gap-1 text-secondary font-semibold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" 6 Completed stays\n          "}</span>
<span>{"100% verified"}</span>
</div>
</div>

<div className={"p-space-lg rounded-[16px] bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"}>
<div className={"flex items-center justify-between gap-space-xs"}>
<span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Net Owner Earnings"}</span>
<span className={"w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center"}>
<Icon name="savings" className="material-symbols-outlined text-[18px]" />
</span>
</div>
<div className={"mt-space-md"}>
<div className={"font-headline-lg text-headline-lg text-primary tracking-tight font-bold"}>{"$3,438.00 "}<span className={"font-caption text-caption text-on-surface-variant"}>{"USD"}</span></div>
<p className={"font-label-sm text-label-sm text-on-surface-variant mt-1"}>{"Owner revenue after StayLeb platform commission"}</p>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-caption text-caption"}>
<span className={"flex items-center gap-1 font-medium"}>{"\n            Effective yield: "}<strong className={"text-on-surface font-semibold"}>{"90.0%"}</strong>
</span>
<span className={"text-secondary font-medium"}>{"Auto-calculated"}</span>
</div>
</div>

<div className={"p-space-lg rounded-[16px] bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"}>
<div className={"flex items-center justify-between gap-space-xs"}>
<span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Commission Deducted"}</span>
<span className={"w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center"}>
<Icon name="percent" className="material-symbols-outlined text-[18px]" />
</span>
</div>
<div className={"mt-space-md"}>
<div className={"font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold"}>{"$382.00 "}<span className={"font-caption text-caption text-on-surface-variant"}>{"USD"}</span></div>
<p className={"font-label-sm text-label-sm text-on-surface-variant mt-1"}>{"Average ~10% captured at reservation"}</p>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-caption text-caption"}>
<span>{"Captured per stay"}</span>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold"}>{"Fixed Contract"}</span>
</div>
</div>

<div className={"p-space-lg rounded-[16px] bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"}>
<div className={"absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-tertiary-fixed/40 via-transparent to-transparent pointer-events-none"}></div>
<div className={"flex items-center justify-between gap-space-xs"}>
<span className={"font-caption text-caption uppercase tracking-wider text-tertiary font-semibold"}>{"Outstanding Cash Comm."}</span>
<span className={"px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold flex items-center gap-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"}></span>{"\n            Owed to StayLeb\n          "}</span>
</div>
<div className={"mt-space-md"}>
<div className={"font-headline-lg text-headline-lg text-tertiary tracking-tight font-bold"}>{"$48.00 "}<span className={"font-caption text-caption text-on-surface-variant"}>{"USD"}</span></div>
<p className={"font-label-sm text-label-sm text-on-surface-variant mt-1"}>{"Pending periodic StayLeb Admin settlement"}</p>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between font-caption text-caption"}>
<span className={"text-tertiary font-semibold"}>{"1 Pending Cash Booking"}</span>
<span className={"text-on-surface-variant"}>{"Cycle: Bi-weekly"}</span>
</div>
</div>
</div>

<div className={"rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md"}>

<div className={"flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="table_rows" className="material-symbols-outlined text-primary text-[22px]" />
<h2 className={"font-title-md text-title-md text-on-surface font-semibold"}>{"Settlement & Earnings Ledger"}</h2>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-medium"}>{"6 Records"}</span>
</div>

<div className={"flex flex-wrap items-center gap-space-xs"}>

<div className={"relative"}>
<FilterSelect className={"h-10 pl-3 pr-8 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"} id={"filterProperty"}>
<option value={"all"}>{"All Properties (4)"}</option>
<option value={"Cedar Peak Stone Chalet"}>{"Cedar Peak Stone Chalet (Faraya)"}</option>
<option value={"Faqra Cloud Villa"}>{"Faqra Cloud Villa (Faqra)"}</option>
<option value={"Batroun Coastal Stone House"}>{"Batroun Coastal Stone House"}</option>
<option value={"Ehden Cedar Retreat"}>{"Ehden Cedar Retreat"}</option>
</FilterSelect>
<Icon name="expand_more" className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]" />
</div>

<div className={"relative"}>
<FilterSelect className={"h-10 pl-3 pr-8 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"} id={"filterMethod"}>
<option value={"all"}>{"Payment: All Methods"}</option>
<option value={"Stripe Online"}>{"Stripe Online"}</option>
<option value={"Cash on Arrival"}>{"Cash on Arrival"}</option>
</FilterSelect>
<Icon name="expand_more" className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]" />
</div>

<div className={"relative"}>
<FilterSelect className={"h-10 pl-3 pr-8 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"} id={"filterStatus"}>
<option value={"all"}>{"Settlement: All Statuses"}</option>
<option value={"Settled via Stripe"}>{"Settled via Stripe"}</option>
<option value={"Outstanding Cash"}>{"Outstanding Cash"}</option>
<option value={"Settled Cash"}>{"Settled Cash"}</option>
</FilterSelect>
<Icon name="expand_more" className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]" />
</div>
<ActionButton className={"h-10 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 transition-colors"} id={"resetFiltersBtn"} actionLabel={"restart_alt Reset"} aria-label={"restart_alt Reset"}>
<Icon name="restart_alt" className="material-symbols-outlined text-[16px]" />
<span>{"Reset"}</span>
</ActionButton>
</div>
</div>

<div className={"w-full overflow-x-auto"}>
<DataTable className={"w-full text-left min-w-[960px] border-collapse"}>
<thead>
<tr className={"bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm rounded-xl"}>
<th className={"py-3 px-4 font-semibold rounded-l-xl"}>{"Booking Ref & Date"}</th>
<th className={"py-3 px-4 font-semibold"}>{"Property"}</th>
<th className={"py-3 px-4 font-semibold"}>{"Payment Method"}</th>
<th className={"py-3 px-4 font-semibold text-right"}>{"Gross Value"}</th>
<th className={"py-3 px-4 font-semibold text-right"}>{"Captured Commission"}</th>
<th className={"py-3 px-4 font-semibold text-right"}>{"Net Earnings"}</th>
<th className={"py-3 px-4 font-semibold rounded-r-xl"}>{"Settlement Status"}</th>
</tr>
</thead>
<tbody className={"font-body-md text-body-md text-on-surface divide-y-0"} id={"ledgerTableBody"}>

<RecordRow className={"hover:bg-surface-container-low/50 transition-colors"} data-method={"Stripe Online"} data-property={"Cedar Peak Stone Chalet"} data-status={"Settled via Stripe"} initialStatus={""}>
<td className={"py-3.5 px-4 font-label-md text-label-md"}>
<div className={"font-semibold text-primary"}>{"#SLB-84920"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Sep 14, 2024"}</div>
</td>
<td className={"py-3.5 px-4"}>
<div className={"font-medium text-on-surface"}>{"Cedar Peak Stone Chalet"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Faraya Heights \u00b7 2 Nights"}</div>
</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"}>
<Icon name="credit_card" className="material-symbols-outlined text-[15px] text-primary" />{"\n                  Stripe Online\n                "}</span>
</td>
<td className={"py-3.5 px-4 text-right font-medium text-on-surface"}>{"$740.00 USD"}</td>
<td className={"py-3.5 px-4 text-right"}>
<div className={"font-semibold text-on-surface"}>{"$74.00 USD"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"10.0% captured"}</div>
</td>
<td className={"py-3.5 px-4 text-right font-bold text-primary"}>{"$666.00 USD"}</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{"\n                  Automatically Settled\n                "}</span>
<div className={"font-caption text-caption text-on-surface-variant mt-0.5"}>{"Retained at Checkout"}</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/50 transition-colors"} data-method={"Cash on Arrival"} data-property={"Cedar Peak Stone Chalet"} data-status={"Outstanding Cash"} initialStatus={""}>
<td className={"py-3.5 px-4 font-label-md text-label-md"}>
<div className={"font-semibold text-primary"}>{"#SLB-84812"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Sep 11, 2024"}</div>
</td>
<td className={"py-3.5 px-4"}>
<div className={"font-medium text-on-surface"}>{"Cedar Peak Stone Chalet"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Faraya Heights \u00b7 1 Night"}</div>
</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-medium"}>
<Icon name="local_atm" className="material-symbols-outlined text-[15px]" />{"\n                  Cash on Arrival\n                "}</span>
</td>
<td className={"py-3.5 px-4 text-right font-medium text-on-surface"}>{"$480.00 USD"}</td>
<td className={"py-3.5 px-4 text-right"}>
<div className={"font-semibold text-tertiary"}>{"$48.00 USD"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"10.0% captured"}</div>
</td>
<td className={"py-3.5 px-4 text-right font-bold text-on-surface"}>{"$432.00 USD"}</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold"}>
<Icon name="schedule" className="material-symbols-outlined text-[14px] text-tertiary" />{"\n                  Owed to Admin\n                "}</span>
<div className={"font-caption text-caption text-tertiary font-medium mt-0.5"}>{"$48.00 USD Pending"}</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/50 transition-colors"} data-method={"Cash on Arrival"} data-property={"Faqra Cloud Villa"} data-status={"Settled Cash"} initialStatus={""}>
<td className={"py-3.5 px-4 font-label-md text-label-md"}>
<div className={"font-semibold text-primary"}>{"#SLB-84299"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Sep 04, 2024"}</div>
</td>
<td className={"py-3.5 px-4"}>
<div className={"font-medium text-on-surface"}>{"Faqra Cloud Villa"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Faqra Club Area \u00b7 3 Nights"}</div>
</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"}>
<Icon name="local_atm" className="material-symbols-outlined text-[15px]" />{"\n                  Cash on Arrival\n                "}</span>
</td>
<td className={"py-3.5 px-4 text-right font-medium text-on-surface"}>{"$1,200.00 USD"}</td>
<td className={"py-3.5 px-4 text-right"}>
<div className={"font-semibold text-on-surface"}>{"$120.00 USD"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"10.0% captured"}</div>
</td>
<td className={"py-3.5 px-4 text-right font-bold text-on-surface"}>{"$1,080.00 USD"}</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold"}>
<Icon name="receipt_long" className="material-symbols-outlined text-[14px]" />{"\n                  Settled with Admin\n                "}</span>
<div className={"font-caption text-caption text-on-surface-variant mt-0.5"}>{"Ref: #SET-402"}</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/50 transition-colors"} data-method={"Stripe Online"} data-property={"Batroun Coastal Stone House"} data-status={"Settled via Stripe"} initialStatus={""}>
<td className={"py-3.5 px-4 font-label-md text-label-md"}>
<div className={"font-semibold text-primary"}>{"#SLB-83815"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Aug 28, 2024"}</div>
</td>
<td className={"py-3.5 px-4"}>
<div className={"font-medium text-on-surface"}>{"Batroun Coastal Stone House"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Old Souk Seaside \u00b7 2 Nights"}</div>
</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"}>
<Icon name="credit_card" className="material-symbols-outlined text-[15px] text-primary" />{"\n                  Stripe Online\n                "}</span>
</td>
<td className={"py-3.5 px-4 text-right font-medium text-on-surface"}>{"$550.00 USD"}</td>
<td className={"py-3.5 px-4 text-right"}>
<div className={"font-semibold text-on-surface"}>{"$55.00 USD"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"10.0% captured"}</div>
</td>
<td className={"py-3.5 px-4 text-right font-bold text-primary"}>{"$495.00 USD"}</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{"\n                  Automatically Settled\n                "}</span>
<div className={"font-caption text-caption text-on-surface-variant mt-0.5"}>{"Retained at Checkout"}</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/50 transition-colors"} data-method={"Stripe Online"} data-property={"Ehden Cedar Retreat"} data-status={"Settled via Stripe"} initialStatus={""}>
<td className={"py-3.5 px-4 font-label-md text-label-md"}>
<div className={"font-semibold text-primary"}>{"#SLB-83190"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Aug 19, 2024"}</div>
</td>
<td className={"py-3.5 px-4"}>
<div className={"font-medium text-on-surface"}>{"Ehden Cedar Retreat"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Horsh Forest View \u00b7 1 Night"}</div>
</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"}>
<Icon name="credit_card" className="material-symbols-outlined text-[15px] text-primary" />{"\n                  Stripe Online\n                "}</span>
</td>
<td className={"py-3.5 px-4 text-right font-medium text-on-surface"}>{"$390.00 USD"}</td>
<td className={"py-3.5 px-4 text-right"}>
<div className={"font-semibold text-on-surface"}>{"$39.00 USD"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"10.0% captured"}</div>
</td>
<td className={"py-3.5 px-4 text-right font-bold text-primary"}>{"$351.00 USD"}</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{"\n                  Automatically Settled\n                "}</span>
<div className={"font-caption text-caption text-on-surface-variant mt-0.5"}>{"Retained at Checkout"}</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/50 transition-colors"} data-method={"Cash on Arrival"} data-property={"Cedar Peak Stone Chalet"} data-status={"Settled Cash"} initialStatus={""}>
<td className={"py-3.5 px-4 font-label-md text-label-md"}>
<div className={"font-semibold text-primary"}>{"#SLB-82740"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Aug 10, 2024"}</div>
</td>
<td className={"py-3.5 px-4"}>
<div className={"font-medium text-on-surface"}>{"Cedar Peak Stone Chalet"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"Faraya Heights \u00b7 1 Night"}</div>
</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"}>
<Icon name="local_atm" className="material-symbols-outlined text-[15px]" />{"\n                  Cash on Arrival\n                "}</span>
</td>
<td className={"py-3.5 px-4 text-right font-medium text-on-surface"}>{"$460.00 USD"}</td>
<td className={"py-3.5 px-4 text-right"}>
<div className={"font-semibold text-on-surface"}>{"$46.00 USD"}</div>
<div className={"font-caption text-caption text-on-surface-variant"}>{"10.0% captured"}</div>
</td>
<td className={"py-3.5 px-4 text-right font-bold text-on-surface"}>{"$414.00 USD"}</td>
<td className={"py-3.5 px-4"}>
<span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold"}>
<Icon name="receipt_long" className="material-symbols-outlined text-[14px]" />{"\n                  Settled with Admin\n                "}</span>
<div className={"font-caption text-caption text-on-surface-variant mt-0.5"}>{"Ref: #SET-394"}</div>
</td>
</RecordRow>
</tbody>
</DataTable>
</div>

<div className={"p-space-sm rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-on-surface-variant"}>
<div className={"flex items-center gap-space-md"}>
<span>{"Displaying "}<strong className={"text-on-surface"} id={"visibleCount"}>{"6"}</strong>{" confirmed bookings"}</span>
<span>{"Currency: "}<strong>{"USD ($)"}</strong></span>
</div>
<div className={"flex items-center gap-space-md"}>
<span>{"Platform Commission standard: "}<strong className={"text-on-surface"}>{"10%"}</strong></span>
<span className={"text-primary font-medium flex items-center gap-1"}>
<Icon name="lock" className="material-symbols-outlined text-[14px]" />{"\n            Immutable historical rates\n          "}</span>
</div>
</div>
</div>

<div className={"rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg"}>
<div className={"flex items-start gap-space-md max-w-3xl"}>
<div className={"w-12 h-12 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 shadow-sm"}>
<Icon name="handshake" className="material-symbols-outlined text-[26px]" />
</div>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-space-xs"}>
<h3 className={"font-title-md text-title-md font-bold text-on-surface"}>{"How Cash Commission Settlement Works"}</h3>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold"}>{"In-Person Collection"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n            For Cash on Arrival bookings, you as the host collect 100% of guest payment in person at check-in. The platform commission is recorded in your ledger as an outstanding balance and settled with StayLeb Admin during periodic scheduled reconciliations.\n          "}</p>
</div>
</div>

<div className={"w-full lg:w-auto p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs shrink-0 min-w-[260px]"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Next Reconciliation"}</span>
<RecordStatus className={"px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"} initial={"Active"}></RecordStatus>
</div>
<div className={"font-title-md text-title-md text-on-surface font-bold"}>{"Oct 01, 2024"}</div>
<div className={"flex items-center justify-between font-label-sm text-label-sm pt-space-xxs"}>
<span className={"text-on-surface-variant"}>{"Amount to Clear:"}</span>
<span className={"font-bold text-tertiary"}>{"$48.00 USD"}</span>
</div>
</div>
</div>
</div>
</div>
</main>
</>; }
