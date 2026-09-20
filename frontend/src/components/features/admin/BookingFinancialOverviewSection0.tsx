import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable } from "@/components/ui/Interactions";

export function BookingFinancialOverviewSection0() { return <>
<div className={""}><main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}><div className={"flex flex-col w-full"}>
<div className={"flex flex-col gap-space-lg"}>

<div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md"}>
<div className={"flex flex-col gap-space-xxs"}>
<div className={"flex items-center gap-space-xs font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>
<span>{"Administration"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<span className={"text-primary font-bold"}>{"Booking & Financial Overview"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-[#157375] tracking-tight"}>{"Platform Bookings & Financial Ledger"}</h1>
<p className={"font-body-md text-body-md text-[#157375] max-w-3xl"}>{"\n          System-wide registry of client reservations, payment channels, captured commissions, and host distributions across Lebanese territories.\n        "}</p>
</div>

<div className={"flex items-center gap-space-xs shrink-0"}>
<ActionButton className={"inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest text-[#157375] rounded-xl font-label-md text-label-md shadow-sm hover:bg-surface-container transition-all"} actionLabel={"file_download Export Ledger"} aria-label={"file_download Export Ledger"}>
<Icon name="file_download" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"Export Ledger"}</span>
</ActionButton>
<ActionButton className={"inline-flex items-center gap-space-xs px-space-md py-space-xs bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-md hover:bg-primary-container transition-all"} actionLabel={"account_balance_wallet Initiate Settlement Cycle"} aria-label={"account_balance_wallet Initiate Settlement Cycle"}>
<Icon name="account_balance_wallet" className="material-symbols-outlined text-[18px]" />
<span>{"Initiate Settlement Cycle"}</span>
</ActionButton>
</div>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md"}>

<div className={"relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between group"}>
<div className={"absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"}></div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Gross Volume"}</span>
<Icon name="payments" className="material-symbols-outlined text-primary text-[22px]" />
</div>
<div className={"my-space-xs"}>
<div className={"font-headline-md text-headline-md text-[#157375] font-bold tracking-tight"}>{"$48,250.00 "}<span className={"font-caption text-caption font-normal text-outline"}>{"USD"}</span></div>
</div>
<div className={"flex items-center gap-space-xxs text-primary font-caption text-caption font-medium"}>
<Icon name="trending_up" className="material-symbols-outlined text-[14px]" />
<span>{"+14.8% vs past 30 days"}</span>
</div>
</div>

<div className={"relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between group"}>
<div className={"absolute -right-4 -bottom-4 w-24 h-24 bg-secondary-container/40 rounded-full blur-xl"}></div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Net Platform Fee"}</span>
<Icon name="percent" className="material-symbols-outlined text-on-secondary-container text-[22px]" />
</div>
<div className={"my-space-xs"}>
<div className={"font-headline-md text-headline-md text-primary font-bold tracking-tight"}>{"$4,825.00 "}<span className={"font-caption text-caption font-normal text-outline"}>{"USD"}</span></div>
</div>
<div className={"flex items-center justify-between text-[#157375] font-caption text-caption"}>
<span>{"Avg Take-Rate"}</span>
<span className={"font-label-sm text-label-sm font-semibold text-primary"}>{"10.0% fixed"}</span>
</div>
</div>

<div className={"relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between group"}>
<div className={"absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary-fixed/30 rounded-full blur-xl"}></div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Host Payable"}</span>
<Icon name="real_estate_agent" className="material-symbols-outlined text-tertiary text-[22px]" />
</div>
<div className={"my-space-xs"}>
<div className={"font-headline-md text-headline-md text-[#157375] font-bold tracking-tight"}>{"$43,425.00 "}<span className={"font-caption text-caption font-normal text-outline"}>{"USD"}</span></div>
</div>
<div className={"flex items-center gap-space-xxs font-caption text-caption text-[#157375]"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary"}></span>
<span>{"90% Allocated to Host Wallets"}</span>
</div>
</div>

<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Ledger Activity"}</span>
<Icon name="event_available" className="material-symbols-outlined text-outline text-[22px]" />
</div>
<div className={"my-space-xs flex items-baseline gap-space-xs"}>
<span className={"font-headline-md text-headline-md text-[#157375] font-bold"}>{"220"}</span>
<span className={"font-caption text-caption text-outline"}>{"Total Requests"}</span>
</div>
<div className={"grid grid-cols-3 gap-1 pt-space-xxs"}>
<div className={"flex flex-col"}>
<span className={"font-caption text-caption text-outline"}>{"Done"}</span>
<span className={"font-label-sm text-label-sm font-semibold text-[#157375]"}>{"184"}</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-caption text-caption text-outline"}>{"Upcoming"}</span>
<span className={"font-label-sm text-label-sm font-semibold text-primary"}>{"24"}</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-caption text-caption text-outline"}>{"Voided"}</span>
<span className={"font-label-sm text-label-sm font-semibold text-error"}>{"12"}</span>
</div>
</div>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-md"}>

<div className={"lg:col-span-6 bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="credit_card" className="material-symbols-outlined text-[24px]" />
</div>
<div>
<div className={"font-title-md text-title-md text-[#157375]"}>{"Stripe Online Payouts"}</div>
<div className={"font-caption text-caption text-[#157375]"}>{"Direct platform hold secured at digital reservation"}</div>
</div>
</div>
<span className={"px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"}>{"\n            Auto Disbursed\n          "}</span>
</div>
<div className={"grid grid-cols-2 gap-space-md my-space-md py-space-sm bg-surface-container-low px-space-md rounded-lg"}>
<div>
<div className={"font-caption text-caption text-outline uppercase font-semibold"}>{"Gross Captured"}</div>
<div className={"font-headline-sm text-headline-sm text-[#157375] font-bold mt-1"}>{"$34,120.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"USD"}</span></div>
</div>
<div>
<div className={"font-caption text-caption text-outline uppercase font-semibold"}>{"Admin Take (10%)"}</div>
<div className={"font-headline-sm text-headline-sm text-primary font-bold mt-1"}>{"$3,412.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"USD"}</span></div>
</div>
</div>
<div className={"flex items-center justify-between font-caption text-caption text-[#157375]"}>
<span className={"flex items-center gap-1"}>
<Icon name="verified_user" className="material-symbols-outlined text-[14px] text-primary" />{" Instant platform commission lock\n          "}</span>
<span className={"font-medium text-[#157375]"}>{"70.7% volume share"}</span>
</div>
</div>

<div className={"lg:col-span-6 bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed"}>
<Icon name="local_atm" className="material-symbols-outlined text-[24px]" />
</div>
<div>
<div className={"font-title-md text-title-md text-[#157375]"}>{"Cash on Arrival (COA)"}</div>
<div className={"font-caption text-caption text-[#157375]"}>{"Owner collected at door \u00b7 Settled via admin ledger invoice"}</div>
</div>
</div>
<span className={"px-space-xs py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-caption text-caption font-semibold"}>{"\n            Invoice Protocol\n          "}</span>
</div>
<div className={"grid grid-cols-2 gap-space-md my-space-md py-space-sm bg-surface-container-low px-space-md rounded-lg"}>
<div>
<div className={"font-caption text-caption text-outline uppercase font-semibold"}>{"Gross Collected"}</div>
<div className={"font-headline-sm text-headline-sm text-[#157375] font-bold mt-1"}>{"$14,130.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"USD"}</span></div>
</div>
<div>
<div className={"font-caption text-caption text-outline uppercase font-semibold"}>{"Receivable Cut (10%)"}</div>
<div className={"font-headline-sm text-headline-sm text-primary font-bold mt-1"}>{"$1,413.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"USD"}</span></div>
</div>
</div>
<div className={"flex items-center justify-between font-caption text-caption text-[#157375]"}>
<span className={"flex items-center gap-1"}>
<Icon name="schedule" className="material-symbols-outlined text-[14px] text-tertiary" />{" Bi-weekly balance reconciliation\n          "}</span>
<span className={"font-medium text-[#157375]"}>{"29.3% volume share"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm"}>

<div className={"relative flex-1 min-w-[280px]"}>
<Icon name="search" className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-[18px] text-outline" />
<input className={"w-full h-11 pl-10 pr-space-md bg-surface-container-low rounded-lg text-[#157375] font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"} placeholder={"Filter by ref (#SLB-..., #REQ-...), guest, or property..."} type={"text"} name={"filter-by-ref-(#slb-...,-#req-...),-guest,-or-property..."} aria-label={"Filter by ref (#SLB-..., #REQ-...), guest, or property..."} />
</div>

<div className={"flex flex-wrap items-center gap-space-xs"}>

<div className={"flex items-center gap-space-xxs px-space-sm h-11 rounded-lg bg-surface-container-low text-[#157375] font-label-md text-label-md cursor-pointer hover:bg-surface-container transition-colors"}>
<Icon name="calendar_today" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium"}>{"Sep 01, 2024 \u2013 Oct 31, 2024"}</span>
<Icon name="expand_more" className="material-symbols-outlined text-[16px] text-outline" />
</div>

<div className={"relative"}>
<select className={"appearance-none h-11 pl-space-sm pr-8 bg-surface-container-low rounded-lg text-[#157375] font-label-md text-label-md focus:outline-none cursor-pointer hover:bg-surface-container transition-colors"} aria-label={"Select an option"}>
<option>{"Payment: All (Stripe + Cash)"}</option>
<option>{"Stripe Online"}</option>
<option>{"Cash on Arrival"}</option>
</select>
<Icon name="arrow_drop_down" className="material-symbols-outlined absolute right-space-xxs top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none" />
</div>

<div className={"relative"}>
<select className={"appearance-none h-11 pl-space-sm pr-8 bg-surface-container-low rounded-lg text-[#157375] font-label-md text-label-md focus:outline-none cursor-pointer hover:bg-surface-container transition-colors"} aria-label={"Select an option"}>
<option>{"Status: All Records"}</option>
<option>{"Confirmed"}</option>
<option>{"Completed"}</option>
<option>{"Pending"}</option>
<option>{"Cancelled / Rejected"}</option>
</select>
<Icon name="arrow_drop_down" className="material-symbols-outlined absolute right-space-xxs top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none" />
</div>

<ActionButton className={"w-11 h-11 rounded-lg bg-surface-container-low flex items-center justify-center text-[#157375] hover:text-[#157375] hover:bg-surface-container transition-colors"} title={"Reset Filters"} actionLabel={"filter_list_off"} aria-label={"filter_list_off"}>
<Icon name="filter_list_off" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col"}>
<div className={"overflow-x-auto w-full"}>
<DataTable className={"w-full text-left border-collapse"}>
<thead>
<tr className={"bg-surface-container text-[#157375] font-label-sm text-label-sm uppercase tracking-wider"}>
<th className={"py-space-sm px-space-md font-semibold"}>{"Booking Ref"}</th>
<th className={"py-space-sm px-space-md font-semibold"}>{"Client / Guest"}</th>
<th className={"py-space-sm px-space-md font-semibold"}>{"Property & Host"}</th>
<th className={"py-space-sm px-space-md font-semibold"}>{"Dates & Stay"}</th>
<th className={"py-space-sm px-space-md font-semibold"}>{"Payment Channel"}</th>
<th className={"py-space-sm px-space-md font-semibold"}>{"Booking Status"}</th>
<th className={"py-space-sm px-space-md font-semibold text-right"}>{"Gross Total"}</th>
<th className={"py-space-sm px-space-md font-semibold text-right"}>{"Admin Fee"}</th>
<th className={"py-space-sm px-space-md font-semibold text-right"}>{"Host Payable"}</th>
<th className={"py-space-sm px-space-md font-semibold text-center"}>{"Action"}</th>
</tr>
</thead>
<tbody className={"divide-y-0 text-[#157375] font-body-md text-body-md"}>

<RecordRow className={"hover:bg-surface-container-low/60 transition-colors"} initialStatus={"Confirmed"}>
<td className={"py-space-sm px-space-md"}>
<span className={"font-label-md text-label-md font-bold text-primary font-mono"}>{"#SLB-84920"}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-primary"}>{"\n                    MH\n                  "}</div>
<div className={"flex flex-col"}>
<span className={"font-semibold text-[#157375] leading-tight"}>{"Maya Haddad"}</span>
<span className={"font-caption text-caption text-[#157375] leading-tight"}>{"Verified Traveler"}</span>
</div>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-medium text-[#157375] truncate max-w-[190px]"}>{"Cedar Peak Stone Chalet"}</span>
<span className={"font-caption text-caption text-outline"}>{"Owner: Tony K."}</span>
</div>
</td>
<td className={"py-space-sm px-space-md whitespace-nowrap"}>
<div className={"flex flex-col"}>
<span>{"Sep 25 \u2013 Sep 28"}</span>
<span className={"font-caption text-caption text-[#157375] font-medium"}>{"3 nights"}</span>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded"}>
<Icon name="credit_card" className="material-symbols-outlined text-[14px]" />{" Stripe Online\n                "}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<RecordStatus className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-caption text-caption font-semibold"} initial={"Confirmed"}></RecordStatus>
</td>
<td className={"py-space-sm px-space-md text-right font-medium text-[#157375] font-mono whitespace-nowrap"}>{"\n                $740.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-semibold text-primary font-mono whitespace-nowrap"}>{"\n                $74.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"(10%)"}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-bold text-[#157375] font-mono whitespace-nowrap"}>{"\n                $666.00\n              "}</td>
<td className={"py-space-sm px-space-md text-center"}>
<ActionButton className={"inline-flex items-center justify-center p-1.5 rounded-lg text-[#157375] hover:text-primary hover:bg-surface-container transition-colors"} title={"Inspect Record"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-low/20 hover:bg-surface-container-low/60 transition-colors"} initialStatus={""}>
<td className={"py-space-sm px-space-md"}>
<span className={"font-label-md text-label-md font-bold text-tertiary font-mono"}>{"#REQ-9102-CSH"}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-primary"}>{"\n                    MH\n                  "}</div>
<div className={"flex flex-col"}>
<span className={"font-semibold text-[#157375] leading-tight"}>{"Maya Haddad"}</span>
<span className={"font-caption text-caption text-[#157375] leading-tight"}>{"Verified Traveler"}</span>
</div>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-medium text-[#157375] truncate max-w-[190px]"}>{"Sour Sandy Beachfront"}</span>
<span className={"font-caption text-caption text-outline"}>{"Owner: Tony K."}</span>
</div>
</td>
<td className={"py-space-sm px-space-md whitespace-nowrap"}>
<div className={"flex flex-col"}>
<span>{"Oct 18 \u2013 Oct 21"}</span>
<span className={"font-caption text-caption text-[#157375] font-medium"}>{"3 nights"}</span>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded"}>
<Icon name="local_atm" className="material-symbols-outlined text-[14px]" />{" Cash on Arrival\n                "}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-tertiary-fixed/50 text-tertiary font-caption text-caption font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-tertiary"}></span>{" Pending Review\n                "}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-medium text-[#157375] font-mono whitespace-nowrap"}>{"\n                $480.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-semibold text-primary font-mono whitespace-nowrap"}>{"\n                $48.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"(10%)"}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-bold text-[#157375] font-mono whitespace-nowrap"}>{"\n                $432.00\n              "}</td>
<td className={"py-space-sm px-space-md text-center"}>
<ActionButton className={"inline-flex items-center justify-center p-1.5 rounded-lg text-[#157375] hover:text-primary hover:bg-surface-container transition-colors"} title={"Inspect Record"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/60 transition-colors"} initialStatus={"Confirmed"}>
<td className={"py-space-sm px-space-md"}>
<span className={"font-label-md text-label-md font-bold text-primary font-mono"}>{"#SLB-84918"}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-primary"}>{"\n                    SM\n                  "}</div>
<div className={"flex flex-col"}>
<span className={"font-semibold text-[#157375] leading-tight"}>{"Sarah Mouzannar"}</span>
<span className={"font-caption text-caption text-[#157375] leading-tight"}>{"Diplomatic Tier"}</span>
</div>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-medium text-[#157375] truncate max-w-[190px]"}>{"Faqra Crest Modern Villa"}</span>
<span className={"font-caption text-caption text-outline"}>{"Owner: Walid J."}</span>
</div>
</td>
<td className={"py-space-sm px-space-md whitespace-nowrap"}>
<div className={"flex flex-col"}>
<span>{"Oct 02 \u2013 Oct 06"}</span>
<span className={"font-caption text-caption text-[#157375] font-medium"}>{"4 nights"}</span>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded"}>
<Icon name="credit_card" className="material-symbols-outlined text-[14px]" />{" Stripe Online\n                "}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<RecordStatus className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-caption text-caption font-semibold"} initial={"Confirmed"}></RecordStatus>
</td>
<td className={"py-space-sm px-space-md text-right font-medium text-[#157375] font-mono whitespace-nowrap"}>{"\n                $1,450.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-semibold text-primary font-mono whitespace-nowrap"}>{"\n                $145.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"(10%)"}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-bold text-[#157375] font-mono whitespace-nowrap"}>{"\n                $1,305.00\n              "}</td>
<td className={"py-space-sm px-space-md text-center"}>
<ActionButton className={"inline-flex items-center justify-center p-1.5 rounded-lg text-[#157375] hover:text-primary hover:bg-surface-container transition-colors"} title={"Inspect Record"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-low/20 hover:bg-surface-container-low/60 transition-colors"} initialStatus={"Confirmed"}>
<td className={"py-space-sm px-space-md"}>
<span className={"font-label-md text-label-md font-bold text-primary font-mono"}>{"#SLB-84880"}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-primary"}>{"\n                    JA\n                  "}</div>
<div className={"flex flex-col"}>
<span className={"font-semibold text-[#157375] leading-tight"}>{"Jad Abou Rjeily"}</span>
<span className={"font-caption text-caption text-[#157375] leading-tight"}>{"Standard Account"}</span>
</div>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-medium text-[#157375] truncate max-w-[190px]"}>{"Faraya Luxe Loft"}</span>
<span className={"font-caption text-caption text-outline"}>{"Owner: Tony K."}</span>
</div>
</td>
<td className={"py-space-sm px-space-md whitespace-nowrap"}>
<div className={"flex flex-col"}>
<span>{"Oct 11 \u2013 Oct 13"}</span>
<span className={"font-caption text-caption text-[#157375] font-medium"}>{"2 nights"}</span>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded"}>
<Icon name="credit_card" className="material-symbols-outlined text-[14px]" />{" Stripe Online\n                "}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<RecordStatus className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-caption text-caption font-semibold"} initial={"Confirmed"}></RecordStatus>
</td>
<td className={"py-space-sm px-space-md text-right font-medium text-[#157375] font-mono whitespace-nowrap"}>{"\n                $390.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-semibold text-primary font-mono whitespace-nowrap"}>{"\n                $39.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"(10%)"}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-bold text-[#157375] font-mono whitespace-nowrap"}>{"\n                $351.00\n              "}</td>
<td className={"py-space-sm px-space-md text-center"}>
<ActionButton className={"inline-flex items-center justify-center p-1.5 rounded-lg text-[#157375] hover:text-primary hover:bg-surface-container transition-colors"} title={"Inspect Record"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/60 transition-colors"} initialStatus={"Completed"}>
<td className={"py-space-sm px-space-md"}>
<span className={"font-label-md text-label-md font-bold text-primary font-mono"}>{"#SLB-84710"}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-primary"}>{"\n                    KE\n                  "}</div>
<div className={"flex flex-col"}>
<span className={"font-semibold text-[#157375] leading-tight"}>{"Karim El-Khoury"}</span>
<span className={"font-caption text-caption text-[#157375] leading-tight"}>{"Repeat Guest"}</span>
</div>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-medium text-[#157375] truncate max-w-[190px]"}>{"Cedar Peak Stone Chalet"}</span>
<span className={"font-caption text-caption text-outline"}>{"Owner: Tony K."}</span>
</div>
</td>
<td className={"py-space-sm px-space-md whitespace-nowrap"}>
<div className={"flex flex-col"}>
<span>{"Aug 10 \u2013 Aug 14"}</span>
<span className={"font-caption text-caption text-[#157375] font-medium"}>{"4 nights"}</span>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-primary-fixed/40 px-2 py-0.5 rounded"}>
<Icon name="credit_card" className="material-symbols-outlined text-[14px]" />{" Stripe Online\n                "}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<RecordStatus className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-container-high text-[#157375] font-caption text-caption font-semibold"} initial={"Completed"}></RecordStatus>
</td>
<td className={"py-space-sm px-space-md text-right font-medium text-[#157375] font-mono whitespace-nowrap"}>{"\n                $980.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-semibold text-primary font-mono whitespace-nowrap"}>{"\n                $98.00 "}<span className={"font-caption text-caption text-outline font-normal"}>{"(10%)"}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-bold text-[#157375] font-mono whitespace-nowrap"}>{"\n                $882.00\n              "}</td>
<td className={"py-space-sm px-space-md text-center"}>
<ActionButton className={"inline-flex items-center justify-center p-1.5 rounded-lg text-[#157375] hover:text-primary hover:bg-surface-container transition-colors"} title={"Inspect Record"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"bg-surface-container-low/20 hover:bg-surface-container-low/60 transition-colors"} initialStatus={""}>
<td className={"py-space-sm px-space-md"}>
<span className={"font-label-md text-label-md font-bold text-outline font-mono"}>{"#REQ-8302-CSH"}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-outline"}>{"\n                    HN\n                  "}</div>
<div className={"flex flex-col"}>
<span className={"font-semibold text-[#157375] leading-tight"}>{"Hadi Nasser"}</span>
<span className={"font-caption text-caption text-[#157375] leading-tight"}>{"Non-responsive"}</span>
</div>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-medium text-[#157375] truncate max-w-[190px]"}>{"Faraya Luxe Loft"}</span>
<span className={"font-caption text-caption text-outline"}>{"Owner: Tony K."}</span>
</div>
</td>
<td className={"py-space-sm px-space-md whitespace-nowrap"}>
<div className={"flex flex-col"}>
<span>{"Jul 02 \u2013 Jul 05"}</span>
<span className={"font-caption text-caption text-[#157375] font-medium"}>{"3 nights"}</span>
</div>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-outline bg-surface-container-high px-2 py-0.5 rounded"}>
<Icon name="local_atm" className="material-symbols-outlined text-[14px]" />{" Cash on Arrival\n                "}</span>
</td>
<td className={"py-space-sm px-space-md"}>
<span className={"inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-error"}></span>{" Rejected\n                "}</span>
</td>
<td className={"py-space-sm px-space-md text-right font-medium text-outline line-through font-mono whitespace-nowrap"}>{"\n                $560.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-semibold text-outline font-mono whitespace-nowrap"}>{"\n                $0.00\n              "}</td>
<td className={"py-space-sm px-space-md text-right font-bold text-outline font-mono whitespace-nowrap"}>{"\n                $0.00\n              "}</td>
<td className={"py-space-sm px-space-md text-center"}>
<ActionButton className={"inline-flex items-center justify-center p-1.5 rounded-lg text-[#157375] hover:text-primary hover:bg-surface-container transition-colors"} title={"Inspect Record"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</td>
</RecordRow>
</tbody>
</DataTable>
</div>

<div className={"p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm"}>
<div className={"font-caption text-caption text-[#157375]"}>{"\n          Showing "}<span className={"font-semibold text-[#157375]"}>{"1"}</span>{" to "}<span className={"font-semibold text-[#157375]"}>{"6"}</span>{" of "}<span className={"font-semibold text-[#157375]"}>{"220"}</span>{" ledger entries\n        "}</div>
<div className={"flex items-center gap-space-xs"}>
<ActionButton className={"px-space-sm py-1.5 rounded-lg bg-surface-container-low text-[#157375] font-label-sm text-label-sm disabled:opacity-50 cursor-not-allowed"} disabled={true} actionLabel={"Previous"} aria-label={"Previous"}>{"\n            Previous\n          "}</ActionButton>
<div className={"flex items-center gap-1"}>
<ActionButton className={"w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold"} actionLabel={"1"} aria-label={"1"}>{"1"}</ActionButton>
<ActionButton className={"w-8 h-8 rounded-lg bg-surface-container-low text-[#157375] font-label-sm text-label-sm hover:bg-surface-container transition-colors"} actionLabel={"2"} aria-label={"2"}>{"2"}</ActionButton>
<ActionButton className={"w-8 h-8 rounded-lg bg-surface-container-low text-[#157375] font-label-sm text-label-sm hover:bg-surface-container transition-colors"} actionLabel={"3"} aria-label={"3"}>{"3"}</ActionButton>
<span className={"px-1 text-outline font-caption text-caption"}>{"..."}</span>
<ActionButton className={"w-8 h-8 rounded-lg bg-surface-container-low text-[#157375] font-label-sm text-label-sm hover:bg-surface-container transition-colors"} actionLabel={"37"} aria-label={"37"}>{"37"}</ActionButton>
</div>
<ActionButton className={"px-space-sm py-1.5 rounded-lg bg-surface-container-low text-[#157375] font-label-sm text-label-sm hover:bg-surface-container transition-colors"} actionLabel={"Next"} aria-label={"Next"}>{"\n            Next\n          "}</ActionButton>
</div>
</div>
</div>

<div className={"grid grid-cols-1 md:grid-cols-3 gap-space-md"}>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md"}>
<div className={"w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"}>
<Icon name="cabin" className="material-symbols-outlined text-[28px]" />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-caption text-caption uppercase text-outline font-semibold"}>{"Mount Lebanon Escapes"}</span>
<span className={"font-title-md text-title-md text-[#157375] font-bold truncate"}>{"$31,200.00 USD"}</span>
<span className={"font-caption text-caption text-primary font-medium"}>{"64.6% of gross bookings"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md"}>
<div className={"w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0"}>
<Icon name="beach_access" className="material-symbols-outlined text-[28px]" />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-caption text-caption uppercase text-outline font-semibold"}>{"Coastal & South Chalets"}</span>
<span className={"font-title-md text-title-md text-[#157375] font-bold truncate"}>{"$17,050.00 USD"}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"35.4% of gross bookings"}</span>
</div>
</div>
<div className={"bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-md"}>
<div className={"flex items-center gap-space-md"}>
<div className={"w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0"}>
<Icon name="receipt" className="material-symbols-outlined text-[28px]" />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-caption text-caption uppercase text-outline font-semibold"}>{"Pending COA Settling"}</span>
<span className={"font-title-md text-title-md text-[#157375] font-bold truncate"}>{"$1,413.00 USD"}</span>
<span className={"font-caption text-caption text-tertiary font-medium"}>{"4 host balances due"}</span>
</div>
</div>
<ActionButton className={"px-space-sm py-1 bg-surface-container text-primary rounded-lg font-label-sm text-label-sm font-semibold hover:bg-primary hover:text-on-primary transition-colors shrink-0"} actionLabel={"Review"} aria-label={"Review"}>{"\n          Review\n        "}</ActionButton>
</div>
</div>
</div>
</div></main></div>
</>; }
