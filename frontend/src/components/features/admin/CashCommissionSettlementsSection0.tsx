import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable, SearchInput, FilterSelect } from "@/components/ui/Interactions";

export function CashCommissionSettlementsSection0() { return <>
<div className={""}><main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}><div className={"flex flex-col w-full"}>

<div className={"relative w-full overflow-hidden"}>
<div className={"absolute -top-24 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"}></div>
<div className={"absolute top-48 left-1/3 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"}></div>

<div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl"}>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-space-xs font-label-sm text-label-sm text-[#157375] mb-space-xxs"}>
<span className={"hover:text-primary transition-colors cursor-pointer"}>{"Administration"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px] text-outline" />
<span className={"text-primary font-semibold"}>{"Cash Settlements"}</span>
</div>
<div className={"flex items-center gap-space-sm mt-space-xxs"}>
<h1 className={"font-headline-lg text-headline-lg text-[#157375] tracking-tight"}>{"Cash Commission Settlements Ledger"}</h1>
<span className={"inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-caption text-caption font-semibold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary"}></span>{"\n            Cash on Arrival\n          "}</span>
</div>
<p className={"font-body-md text-body-md text-[#157375] mt-1 max-w-3xl"}>{"\n          Track and reconcile platform commissions owed by property owners for approved Cash on Arrival reservations. Reconcile offline Lebanese cash collections into ledger state.\n        "}</p>
</div>
<div className={"flex items-center gap-space-xs self-start md:self-auto"}>
<ActionButton className={"inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest text-[#157375] font-label-md text-label-md shadow-sm hover:shadow-md transition-all active:scale-[0.98]"} actionLabel={"download Export Ledger CSV"} aria-label={"download Export Ledger CSV"}>
<Icon name="download" className="material-symbols-outlined text-[18px] text-primary" />
<span>{"Export Ledger CSV"}</span>
</ActionButton>
<ActionButton className={"inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container transition-all active:scale-[0.98]"} actionLabel={"add_circle Manual Reconcile"} aria-label={"add_circle Manual Reconcile"}>
<Icon name="add_circle" className="material-symbols-outlined text-[18px]" />
<span>{"Manual Reconcile"}</span>
</ActionButton>
</div>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter-lg mb-space-xl"}>

<div className={"relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<div>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Total Outstanding"}</span>
<div className={"flex items-baseline gap-1 mt-1"}>
<span className={"font-headline-lg text-headline-lg text-[#157375] font-bold"}>{"$680.00"}</span>
<span className={"font-caption text-caption text-[#157375] uppercase font-semibold"}>{"USD"}</span>
</div>
</div>
<div className={"w-11 h-11 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-sm"}>
<Icon name="pending_actions" className="material-symbols-outlined text-[24px]" />
</div>
</div>
<div className={"mt-space-md pt-space-xs flex items-center gap-space-xs"}>
<span className={"inline-flex items-center justify-center w-2 h-2 rounded-full bg-tertiary"}></span>
<span className={"font-label-sm text-label-sm font-semibold text-tertiary"}>{"12 Bookings"}</span>
<span className={"font-body-md text-caption text-[#157375]"}>{"awaiting host settlement"}</span>
</div>
</div>

<div className={"relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<div>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Settled (Past 30 Days)"}</span>
<div className={"flex items-baseline gap-1 mt-1"}>
<span className={"font-headline-lg text-headline-lg text-primary font-bold"}>{"$3,140.00"}</span>
<span className={"font-caption text-caption text-[#157375] uppercase font-semibold"}>{"USD"}</span>
</div>
</div>
<div className={"w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm"}>
<Icon name="task_alt" className="material-symbols-outlined text-[24px]" />
</div>
</div>
<div className={"mt-space-md pt-space-xs flex items-center gap-space-xs"}>
<span className={"inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary"}></span>
<span className={"font-label-sm text-label-sm font-semibold text-primary"}>{"38 Bookings"}</span>
<span className={"font-body-md text-caption text-[#157375]"}>{"fully reconciled"}</span>
</div>
</div>

<div className={"relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<div>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Hosts With Due Balances"}</span>
<div className={"flex items-baseline gap-1 mt-1"}>
<span className={"font-headline-lg text-headline-lg text-[#157375] font-bold"}>{"8"}</span>
<span className={"font-caption text-caption text-[#157375] font-semibold"}>{"Hosts"}</span>
</div>
</div>
<div className={"w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center text-[#157375] shadow-sm"}>
<Icon name="real_estate_agent" className="material-symbols-outlined text-[24px]" />
</div>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between"}>
<div className={"flex -space-x-2 overflow-hidden"}>
<div className={"inline-block h-6 w-6 rounded-full bg-primary-container text-on-primary-container text-center font-caption text-[10px] font-bold leading-6"}>{"TK"}</div>
<div className={"inline-block h-6 w-6 rounded-full bg-secondary text-on-secondary text-center font-caption text-[10px] font-bold leading-6"}>{"MA"}</div>
<div className={"inline-block h-6 w-6 rounded-full bg-tertiary text-on-tertiary text-center font-caption text-[10px] font-bold leading-6"}>{"ZH"}</div>
<div className={"inline-block h-6 w-6 rounded-full bg-surface-dim text-[#157375] text-center font-caption text-[10px] font-bold leading-6"}>{"+5"}</div>
</div>
<span className={"font-label-sm text-label-sm text-primary font-medium cursor-pointer hover:underline"}>{"Inspect Hosts"}</span>
</div>
</div>

<div className={"relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"}>
<div className={"flex items-start justify-between"}>
<div>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-semibold"}>{"Total Cash Volume"}</span>
<div className={"flex items-baseline gap-1 mt-1"}>
<span className={"font-headline-lg text-headline-lg text-[#157375] font-bold"}>{"$14,130.00"}</span>
<span className={"font-caption text-caption text-[#157375] uppercase font-semibold"}>{"USD"}</span>
</div>
</div>
<div className={"w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm"}>
<Icon name="bar_chart" className="material-symbols-outlined text-[24px]" />
</div>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between"}>
<div className={"flex items-center gap-1 font-caption text-caption text-[#157375]"}>
<span>{"Avg. Commission Rate:"}</span>
<span className={"font-semibold text-[#157375]"}>{"10.0%"}</span>
</div>
<span className={"inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-caption text-caption font-semibold"}>{"Non-Stripe"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0"}>
<Icon name="info" className="material-symbols-outlined text-[20px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Cash on Arrival Settlement Protocol"}</span>
<span className={"font-body-md text-caption text-[#157375]"}>{"\n            Lebanon local transactions are settled in USD banknotes or certified OMT/Whish agent clearance. No credit card debits apply.\n          "}</span>
</div>
</div>
<div className={"flex items-center gap-space-xs self-stretch md:self-auto justify-end"}>
<div className={"h-2 w-32 bg-surface-container-high rounded-full overflow-hidden flex"}>
<div className={"bg-primary h-full"} style={{"width": "82%"}}></div>
<div className={"bg-tertiary-fixed-dim h-full"} style={{"width": "18%"}}></div>
</div>
<span className={"font-caption text-caption font-semibold text-[#157375] ml-1"}>{"82% Cleared"}</span>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md"}>

<div className={"flex items-center bg-surface-container-low p-1 rounded-xl"}>
<ActionButton className={"status-tab px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-semibold text-[#157375] bg-surface-container-lowest shadow-sm transition-all"} id={"tab-all"} actionLabel={"All Entries (50)"} aria-label={"All Entries (50)"} hint={"filterStatus('all')"}>{"\n          All Entries (50)\n        "}</ActionButton>
<ActionButton className={"status-tab px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-medium text-[#157375] hover:text-[#157375] transition-all flex items-center gap-1.5"} id={"tab-outstanding"} actionLabel={"Outstanding 12"} aria-label={"Outstanding 12"} hint={"filterStatus('outstanding')"}>
<RecordStatus initial={"Outstanding"}></RecordStatus>
<span className={"px-1.5 py-0.2 bg-tertiary-fixed text-on-tertiary-fixed rounded-full font-caption text-[11px] font-bold"}>{"12"}</span>
</ActionButton>
<ActionButton className={"status-tab px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-medium text-[#157375] hover:text-[#157375] transition-all flex items-center gap-1.5"} id={"tab-settled"} actionLabel={"Settled 38"} aria-label={"Settled 38"} hint={"filterStatus('settled')"}>
<RecordStatus initial={"Settled"}></RecordStatus>
<span className={"px-1.5 py-0.2 bg-secondary-container text-on-secondary-container rounded-full font-caption text-[11px] font-bold"}>{"38"}</span>
</ActionButton>
</div>

<div className={"flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm flex-1 max-w-2xl justify-end"}>

<div className={"relative min-w-[180px]"}>
<FilterSelect className={"w-full h-11 pl-space-md pr-8 bg-surface-container-low rounded-xl font-label-sm text-label-sm text-[#157375] outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"} id={"host-filter"}>
<option value={""}>{"All Hosts & Owners"}</option>
<option value={"Tony Karam"}>{"Tony Karam (HST-7048)"}</option>
<option value={"Michel Aoun"}>{"Michel Aoun (HST-3102)"}</option>
<option value={"Zeina Haddad"}>{"Zeina Haddad (HST-9022)"}</option>
</FilterSelect>
<Icon name="unfold_more" className="material-symbols-outlined absolute right-2.5 top-3 text-[18px] text-outline pointer-events-none" />
</div>

<div className={"relative flex-1"}>
<Icon name="search" className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-outline" />
<SearchInput className={"w-full h-11 pl-10 pr-space-md bg-surface-container-low rounded-xl font-body-md text-body-md text-[#157375] placeholder:text-outline outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"} id={"search-input"} placeholder={"Search #REQ-XXXX-CSH or host..."} type={"text"} name={"search-input"} aria-label={"Search #REQ-XXXX-CSH or host..."}></SearchInput>
</div>

<ActionButton className={"h-11 px-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-[#157375] hover:text-[#157375] transition-colors flex items-center justify-center"} title={"Reset Filters"} actionLabel={"restart_alt"} aria-label={"restart_alt"} hint={"resetFilters()"}>
<Icon name="restart_alt" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"}>
<div className={"overflow-x-auto"}>
<DataTable className={"w-full text-left border-collapse"}>
<thead>
<tr className={"bg-surface-container-low text-[#157375] font-caption text-caption uppercase tracking-wider select-none"}>
<th className={"py-space-md px-space-md"}>{"Booking Reference"}</th>
<th className={"py-space-md px-space-md"}>{"Host / Owner"}</th>
<th className={"py-space-md px-space-md"}>{"Property Details"}</th>
<th className={"py-space-md px-space-md text-right"}>{"Booking Value"}</th>
<th className={"py-space-md px-space-md text-center"}>{"Rate"}</th>
<th className={"py-space-md px-space-md text-right"}>{"Commission Owed"}</th>
<th className={"py-space-md px-space-md text-center"}>{"Status"}</th>
<th className={"py-space-md px-space-md text-right"}>{"Action"}</th>
</tr>
</thead>
<tbody className={"font-body-md text-body-md text-[#157375]"} id={"settlements-table-body"}>

<RecordRow className={"table-row-item hover:bg-surface-container-low/60 transition-colors"} data-host={"Tony Karam"} data-ref={"#REQ-9102-CSH"} data-status={"outstanding"} initialStatus={"Outstanding"}>
<td className={"py-space-md px-space-md font-mono text-label-sm font-semibold text-primary"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="payments" className="material-symbols-outlined text-[16px] text-outline" />
<span>{"#REQ-9102-CSH"}</span>
</div>
<span className={"font-caption text-caption text-[#157375] font-sans"}>{"Oct 18, 2024"}</span>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-caption"}>{"TK"}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375] truncate"}>{"Tony Karam"}</span>
<span className={"font-caption text-caption text-outline"}>{"HST-7048"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Sour Sandy Beachfront Bungalow"}</span>
<span className={"font-caption text-caption text-[#157375] flex items-center gap-1"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[14px]" />{"\n                    3 nights \u00b7 Oct 18\u201321, 2024\n                  "}</span>
</div>
</td>
<td className={"py-space-md px-space-md text-right font-label-md text-label-md font-semibold text-[#157375]"}>{"\n                $480.00 "}<span className={"font-caption text-caption text-[#157375] font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center font-mono text-label-sm text-[#157375]"}>{"\n                10.0%\n              "}</td>
<td className={"py-space-md px-space-md text-right font-headline-sm text-headline-sm font-bold text-tertiary"}>{"\n                $48.00 "}<span className={"font-caption text-caption font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md text-right"}>
<ActionButton className={"inline-flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm font-medium shadow-sm transition-all active:scale-95 whitespace-nowrap"} actionLabel={"done_all Mark as Settled"} aria-label={"done_all Mark as Settled"} hint={"openSettleModal('Tony Karam', '#REQ-9102-CSH', '$48.00 USD')"}>
<Icon name="done_all" className="material-symbols-outlined text-[16px]" />
<span>{"Mark as Settled"}</span>
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"table-row-item hover:bg-surface-container-low/60 transition-colors"} data-host={"Michel Aoun"} data-ref={"#REQ-8841-CSH"} data-status={"outstanding"} initialStatus={"Outstanding"}>
<td className={"py-space-md px-space-md font-mono text-label-sm font-semibold text-primary"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="payments" className="material-symbols-outlined text-[16px] text-outline" />
<span>{"#REQ-8841-CSH"}</span>
</div>
<span className={"font-caption text-caption text-[#157375] font-sans"}>{"Oct 10, 2024"}</span>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-caption"}>{"MA"}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375] truncate"}>{"Michel Aoun"}</span>
<span className={"font-caption text-caption text-outline"}>{"HST-3102"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Faqra Snow Heights Chalet"}</span>
<span className={"font-caption text-caption text-[#157375] flex items-center gap-1"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[14px]" />{"\n                    4 nights \u00b7 Oct 10\u201314, 2024\n                  "}</span>
</div>
</td>
<td className={"py-space-md px-space-md text-right font-label-md text-label-md font-semibold text-[#157375]"}>{"\n                $920.00 "}<span className={"font-caption text-caption text-[#157375] font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center font-mono text-label-sm text-[#157375]"}>{"\n                10.0%\n              "}</td>
<td className={"py-space-md px-space-md text-right font-headline-sm text-headline-sm font-bold text-tertiary"}>{"\n                $92.00 "}<span className={"font-caption text-caption font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md text-right"}>
<ActionButton className={"inline-flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm font-medium shadow-sm transition-all active:scale-95 whitespace-nowrap"} actionLabel={"done_all Mark as Settled"} aria-label={"done_all Mark as Settled"} hint={"openSettleModal('Michel Aoun', '#REQ-8841-CSH', '$92.00 USD')"}>
<Icon name="done_all" className="material-symbols-outlined text-[16px]" />
<span>{"Mark as Settled"}</span>
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"table-row-item hover:bg-surface-container-low/60 transition-colors"} data-host={"Zeina Haddad"} data-ref={"#REQ-8790-CSH"} data-status={"outstanding"} initialStatus={"Outstanding"}>
<td className={"py-space-md px-space-md font-mono text-label-sm font-semibold text-primary"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="payments" className="material-symbols-outlined text-[16px] text-outline" />
<span>{"#REQ-8790-CSH"}</span>
</div>
<span className={"font-caption text-caption text-[#157375] font-sans"}>{"Oct 05, 2024"}</span>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-caption"}>{"ZH"}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375] truncate"}>{"Zeina Haddad"}</span>
<span className={"font-caption text-caption text-outline"}>{"HST-9022"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Kfaraabida Sunset Villa"}</span>
<span className={"font-caption text-caption text-[#157375] flex items-center gap-1"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[14px]" />{"\n                    2 nights \u00b7 Oct 05\u201307, 2024\n                  "}</span>
</div>
</td>
<td className={"py-space-md px-space-md text-right font-label-md text-label-md font-semibold text-[#157375]"}>{"\n                $750.00 "}<span className={"font-caption text-caption text-[#157375] font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center font-mono text-label-sm text-[#157375]"}>{"\n                10.0%\n              "}</td>
<td className={"py-space-md px-space-md text-right font-headline-sm text-headline-sm font-bold text-tertiary"}>{"\n                $75.00 "}<span className={"font-caption text-caption font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"} initial={"Outstanding"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md text-right"}>
<ActionButton className={"inline-flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm font-medium shadow-sm transition-all active:scale-95 whitespace-nowrap"} actionLabel={"done_all Mark as Settled"} aria-label={"done_all Mark as Settled"} hint={"openSettleModal('Zeina Haddad', '#REQ-8790-CSH', '$75.00 USD')"}>
<Icon name="done_all" className="material-symbols-outlined text-[16px]" />
<span>{"Mark as Settled"}</span>
</ActionButton>
</td>
</RecordRow>

<RecordRow className={"table-row-item hover:bg-surface-container-low/60 transition-colors"} data-host={"Tony Karam"} data-ref={"#REQ-8429-CSH"} data-status={"settled"} initialStatus={"Settled"}>
<td className={"py-space-md px-space-md font-mono text-label-sm font-semibold text-primary"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="check_circle" className="material-symbols-outlined text-[16px] text-secondary" />
<span>{"#REQ-8429-CSH"}</span>
</div>
<span className={"font-caption text-caption text-[#157375] font-sans"}>{"Sep 04, 2024"}</span>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-caption"}>{"TK"}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375] truncate"}>{"Tony Karam"}</span>
<span className={"font-caption text-caption text-outline"}>{"HST-7048"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Faqra Cloud Villa"}</span>
<span className={"font-caption text-caption text-[#157375] flex items-center gap-1"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[14px]" />{"\n                    3 nights \u00b7 Sep 04\u201307, 2024\n                  "}</span>
</div>
</td>
<td className={"py-space-md px-space-md text-right font-label-md text-label-md font-semibold text-[#157375]"}>{"\n                $1,200.00 "}<span className={"font-caption text-caption text-[#157375] font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center font-mono text-label-sm text-[#157375]"}>{"\n                10.0%\n              "}</td>
<td className={"py-space-md px-space-md text-right font-headline-sm text-headline-sm font-bold text-primary"}>{"\n                $120.00 "}<span className={"font-caption text-caption font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"} initial={"Settled"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md text-right"}>
<div className={"flex flex-col items-end"}>
<ActionButton className={"inline-flex items-center gap-1 px-space-sm py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-[#157375] font-label-sm text-label-sm font-medium transition-all"} actionLabel={"receipt View Receipt"} aria-label={"receipt View Receipt"} hint={"showReceiptAlert('#SET-402', 'Sep 10, 2024', '$120.00 USD')"}>
<Icon name="receipt" className="material-symbols-outlined text-[16px] text-primary" />
<span>{"View Receipt"}</span>
</ActionButton>
<span className={"font-caption text-caption text-outline mt-0.5"}>{"Sep 10, 2024 \u00b7 Ref #SET-402"}</span>
</div>
</td>
</RecordRow>

<RecordRow className={"table-row-item hover:bg-surface-container-low/60 transition-colors"} data-host={"Tony Karam"} data-ref={"#REQ-8274-CSH"} data-status={"settled"} initialStatus={"Settled"}>
<td className={"py-space-md px-space-md font-mono text-label-sm font-semibold text-primary"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="check_circle" className="material-symbols-outlined text-[16px] text-secondary" />
<span>{"#REQ-8274-CSH"}</span>
</div>
<span className={"font-caption text-caption text-[#157375] font-sans"}>{"Aug 10, 2024"}</span>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-caption"}>{"TK"}</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375] truncate"}>{"Tony Karam"}</span>
<span className={"font-caption text-caption text-outline"}>{"HST-7048"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Cedar Peak Stone Chalet"}</span>
<span className={"font-caption text-caption text-[#157375] flex items-center gap-1"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[14px]" />{"\n                    1 night \u00b7 Aug 10\u201311, 2024\n                  "}</span>
</div>
</td>
<td className={"py-space-md px-space-md text-right font-label-md text-label-md font-semibold text-[#157375]"}>{"\n                $460.00 "}<span className={"font-caption text-caption text-[#157375] font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center font-mono text-label-sm text-[#157375]"}>{"\n                10.0%\n              "}</td>
<td className={"py-space-md px-space-md text-right font-headline-sm text-headline-sm font-bold text-primary"}>{"\n                $46.00 "}<span className={"font-caption text-caption font-normal"}>{"USD"}</span>
</td>
<td className={"py-space-md px-space-md text-center"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"} initial={"Settled"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md text-right"}>
<div className={"flex flex-col items-end"}>
<ActionButton className={"inline-flex items-center gap-1 px-space-sm py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-[#157375] font-label-sm text-label-sm font-medium transition-all"} actionLabel={"receipt View Receipt"} aria-label={"receipt View Receipt"} hint={"showReceiptAlert('#SET-394', 'Aug 15, 2024', '$46.00 USD')"}>
<Icon name="receipt" className="material-symbols-outlined text-[16px] text-primary" />
<span>{"View Receipt"}</span>
</ActionButton>
<span className={"font-caption text-caption text-outline mt-0.5"}>{"Aug 15, 2024 \u00b7 Ref #SET-394"}</span>
</div>
</td>
</RecordRow>
</tbody>
</DataTable>
</div>

<div className={"bg-surface-container-low px-space-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm"}>
<div className={"font-caption text-caption text-[#157375]"}>{"\n          Showing "}<span className={"font-semibold text-[#157375]"}>{"5"}</span>{" of "}<span className={"font-semibold text-[#157375]"}>{"50"}</span>{" total cash settlement records\n        "}</div>
<div className={"flex items-center gap-space-xs"}>
<ActionButton className={"h-9 px-space-sm rounded-lg bg-surface-container-lowest text-[#157375] hover:text-[#157375] font-label-sm text-label-sm shadow-sm disabled:opacity-50"} disabled={true} actionLabel={"Previous"} aria-label={"Previous"}>{"\n            Previous\n          "}</ActionButton>
<div className={"flex items-center gap-1"}>
<span className={"h-9 w-9 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-semibold"}>{"1"}</span>
<span className={"h-9 w-9 rounded-lg bg-surface-container-lowest text-[#157375] hover:bg-surface-container-high font-label-sm text-label-sm flex items-center justify-center cursor-pointer transition-colors"}>{"2"}</span>
<span className={"h-9 w-9 rounded-lg bg-surface-container-lowest text-[#157375] hover:bg-surface-container-high font-label-sm text-label-sm flex items-center justify-center cursor-pointer transition-colors"}>{"3"}</span>
</div>
<ActionButton className={"h-9 px-space-sm rounded-lg bg-surface-container-lowest text-[#157375] hover:text-primary font-label-sm text-label-sm shadow-sm transition-colors"} actionLabel={"Next"} aria-label={"Next"}>{"\n            Next\n          "}</ActionButton>
</div>
</div>
</div>

<div className={"grid grid-cols-1 md:grid-cols-3 gap-gutter-lg"}>
<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm"}>
<div className={"flex items-center gap-space-xs mb-space-xxs text-primary"}>
<Icon name="local_atm" className="material-symbols-outlined text-[20px]" />
<span className={"font-label-md text-label-md font-semibold"}>{"Banknote Quality Policy"}</span>
</div>
<p className={"font-caption text-caption text-[#157375]"}>{"\n          Per StayLeb host governance, settlements cleared in Cash USD must be clean, un-torn series notes (2013+). Damaged notes are subject to standard exchange cuts.\n        "}</p>
</div>
<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm"}>
<div className={"flex items-center gap-space-xs mb-space-xxs text-secondary"}>
<Icon name="schedule" className="material-symbols-outlined text-[20px]" />
<span className={"font-label-md text-label-md font-semibold"}>{"14-Day Reconciliation SLA"}</span>
</div>
<p className={"font-caption text-caption text-[#157375]"}>{"\n          Hosts must clear accumulated balances above $150 USD every 14 days to keep their property listing calendar instant-bookable across Lebanon regions.\n        "}</p>
</div>
<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm"}>
<div className={"flex items-center gap-space-xs mb-space-xxs text-tertiary"}>
<Icon name="verified_user" className="material-symbols-outlined text-[20px]" />
<span className={"font-label-md text-label-md font-semibold"}>{"Offline Verification Node"}</span>
</div>
<p className={"font-caption text-caption text-[#157375]"}>{"\n          Every completed settlement creates a cryptographically stamped internal journal ID linked to the regional representative who verified physical tender.\n        "}</p>
</div>
</div>
</div>

<div className={"fixed inset-0 z-50 flex items-center justify-center hidden bg-on-surface/40 backdrop-blur-sm p-space-md transition-opacity"} id={"settlement-modal"}>
<div className={"bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-xl relative animate-in fade-in zoom-in duration-200"}>

<div className={"flex items-start justify-between mb-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"}>
<Icon name="price_check" className="material-symbols-outlined text-[22px]" />
</div>
<div className={"flex flex-col"}>
<h3 className={"font-headline-sm text-headline-sm text-[#157375]"}>{"Confirm Commission Settlement"}</h3>
<span className={"font-caption text-caption text-[#157375]"}>{"StayLeb Cash-on-Arrival Ledger Entry"}</span>
</div>
</div>
<ActionButton className={"w-8 h-8 rounded-lg text-outline hover:text-[#157375] hover:bg-surface-container-high transition-colors flex items-center justify-center"} actionLabel={"close"} aria-label={"close"} hint={"closeSettleModal()"}>
<Icon name="close" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</div>

<div className={"space-y-space-md mb-space-lg"}>

<div className={"bg-surface-container-low rounded-xl p-space-md flex items-center justify-between"}>
<div className={"flex flex-col"}>
<span className={"font-caption text-caption uppercase text-outline font-semibold"}>{"Target Host"}</span>
<span className={"font-label-md text-label-md font-bold text-[#157375]"} id={"modal-host-name"}>{"Tony Karam"}</span>
<span className={"font-mono text-caption text-primary mt-0.5"} id={"modal-booking-ref"}>{"#REQ-9102-CSH"}</span>
</div>
<div className={"text-right"}>
<span className={"font-caption text-caption uppercase text-outline font-semibold"}>{"Amount to Clear"}</span>
<div className={"font-headline-md text-headline-md font-bold text-primary"} id={"modal-amount-due"}>{"$48.00 USD"}</div>
</div>
</div>

<div className={"flex flex-col gap-1.5"}>
<label className={"font-label-sm text-label-sm font-semibold text-[#157375]"} htmlFor={"settlement-audit-input"}>{"\n            Settlement Reference / Audit Notes "}<span className={"text-tertiary"}>{"*"}</span>
</label>
<div className={"relative"}>
<Icon name="description" className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline" />
<input className={"w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low font-body-md text-body-md text-[#157375] outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"} id={"settlement-audit-input"} placeholder={"e.g. In-person host office clearance, receipt #SET-409"} type={"text"} name={"settlement-audit-input"} defaultValue={"In-person host office clearance, receipt #SET-409"} aria-label={"e.g. In-person host office clearance, receipt #SET-409"} />
</div>
<span className={"font-caption text-caption text-[#157375]"}>{"Include agent name, regional branch, or physical receipt counterfoil number."}</span>
</div>

<div className={"p-space-md rounded-xl bg-surface-container-high/60 flex items-start gap-space-xs text-[#157375]"}>
<Icon name="verified" className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5" />
<p className={"font-caption text-caption leading-relaxed"}>{"\n            Marking this as settled updates the host's ledger balance and closes the collection cycle. No online banking or automatic debit is executed.\n          "}</p>
</div>
</div>

<div className={"flex items-center justify-end gap-space-sm"}>
<ActionButton className={"px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-[#157375] font-label-md text-label-md font-medium transition-all"} actionLabel={"Cancel"} aria-label={"Cancel"} hint={"closeSettleModal()"}>{"\n          Cancel\n        "}</ActionButton>
<ActionButton className={"inline-flex items-center gap-1.5 px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-md active:scale-95 transition-all"} actionLabel={"check Confirm Settlement"} aria-label={"check Confirm Settlement"} hint={"confirmSettlementAction()"}>
<Icon name="check" className="material-symbols-outlined text-[18px]" />
<span>{"Confirm Settlement"}</span>
</ActionButton>
</div>
</div>
</div>

<div className={"fixed bottom-6 right-6 z-50 hidden bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-xs transition-all transform translate-y-2"} id={"toast-notif"}>
<Icon name="check_circle" className="material-symbols-outlined text-[20px] text-primary-fixed-dim" />
<span className={"font-label-md text-label-md font-medium"} id={"toast-message"}>{"Commission reconciled successfully!"}</span>
</div>
</div>
</main></div>
</>; }
