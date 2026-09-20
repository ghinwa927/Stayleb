import { Icon } from "@/components/ui/Icon";
import { RecordRow, RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, DataTable, SearchInput } from "@/components/ui/Interactions";

export function ReviewModerationSection0() { return <>
<div className={""}><main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}><div className={"flex flex-col w-full"}>

<div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg"}>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-space-xs font-caption text-caption uppercase tracking-wider text-[#157375] font-semibold mb-space-xxs"}>
<span>{"Administration"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<span className={"text-primary font-bold"}>{"Review Moderation"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-[#157375] tracking-tight"}>{"Guest Reviews & Moderation Queue"}</h1>
<p className={"font-body-md text-body-md text-[#157375] mt-space-xxs"}>{"\n        Oversee verified guest evaluations across the platform. Remove policy-violating or inappropriate reviews.\n      "}</p>
</div>

<div className={"flex items-center gap-space-sm self-start md:self-auto"}>
<div className={"flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-lowest shadow-sm"}>
<span className={"w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"}></span>
<span className={"font-label-sm text-label-sm font-semibold text-[#157375]"}>{"Queue Active"}</span>
<span className={"text-outline text-[12px]"}>{"\u2022"}</span>
<span className={"font-caption text-caption text-[#157375]"}>{"Sync 2m ago"}</span>
</div>
<ActionButton className={"flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm"} actionLabel={"priority_high Inspect Flagged (1)"} aria-label={"priority_high Inspect Flagged (1)"} hint={"filterQueue('flagged')"}>
<Icon name="priority_high" className="material-symbols-outlined text-[18px]" />
<span>{"Inspect Flagged (1)"}</span>
</ActionButton>
</div>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg"}>

<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-[#157375] font-semibold"}>{"Total Verified Reviews"}</span>
<Icon name="verified" className="material-symbols-outlined text-primary text-[22px]" />
</div>
<div className={"mt-space-sm"}>
<div className={"font-display text-display text-[#157375] leading-none tracking-tight"}>{"412"}</div>
<div className={"flex items-center gap-space-xxs mt-space-xs text-primary font-label-sm text-label-sm"}>
<Icon name="trending_up" className="material-symbols-outlined text-[16px]" />
<span>{"+18% from last month"}</span>
</div>
</div>
</div>

<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-[#157375] font-semibold"}>{"Platform Average Rating"}</span>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[22px]" />
</div>
<div className={"mt-space-sm"}>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-display text-display text-[#157375] leading-none tracking-tight"}>{"4.88"}</span>
<span className={"font-title-md text-title-md text-[#157375]"}>{"/ 5.0"}</span>
</div>
<div className={"flex items-center gap-space-xxs mt-space-xs text-[#157375] font-label-sm text-label-sm"}>
<span>{"Across all 7 stay metrics"}</span>
</div>
</div>
</div>

<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden"}>
<div className={"absolute -right-3 -top-3 w-16 h-16 bg-amber-500/10 rounded-full blur-lg pointer-events-none"}></div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-amber-700 font-semibold"}>{"Flagged for Moderation"}</span>
<Icon name="flag" className="material-symbols-outlined text-amber-600 text-[22px]" />
</div>
<div className={"mt-space-sm"}>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-display text-display text-amber-700 leading-none tracking-tight"}>{"1"}</span>
<span className={"font-label-md text-label-md text-amber-800 font-medium"}>{"Under Inspection"}</span>
</div>
<div className={"flex items-center gap-space-xxs mt-space-xs text-amber-700 font-label-sm text-label-sm"}>
<Icon name="schedule" className="material-symbols-outlined text-[16px]" />
<span>{"Requires Immediate Review"}</span>
</div>
</div>
</div>

<div className={"p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption uppercase tracking-wider text-[#157375] font-semibold"}>{"Removed Violations"}</span>
<Icon name="policy" className="material-symbols-outlined text-error text-[22px]" />
</div>
<div className={"mt-space-sm"}>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-display text-display text-[#157375] leading-none tracking-tight"}>{"4"}</span>
<span className={"font-label-md text-label-md text-[#157375] font-medium"}>{"Archived"}</span>
</div>
<div className={"flex items-center gap-space-xxs mt-space-xs text-[#157375] font-label-sm text-label-sm"}>
<span>{"100% conduct compliance"}</span>
</div>
</div>
</div>
</div>

<div className={"rounded-xl bg-surface-container-highest/60 p-space-md mb-space-lg flex flex-col sm:flex-row items-start sm:items-center gap-space-md shadow-sm"}>
<div className={"w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0"}>
<Icon name="gavel" className="material-symbols-outlined text-[24px]" />
</div>
<div className={"flex-1"}>
<h3 className={"font-label-md text-label-md font-bold text-[#157375] tracking-tight"}>{"Review Moderation Protocol"}</h3>
<p className={"font-body-md text-body-md text-[#157375] mt-0.5"}>{"\n        Verified StayLeb reviews are immutable for both Guests and Property Owners. Only Platform Administrators may remove reviews that contain offensive language, hate speech, or verified violations of StayLeb marketplace conduct.\n      "}</p>
</div>
<div className={"flex items-center gap-space-xs self-stretch sm:self-auto justify-end"}>
<span className={"font-caption text-caption uppercase tracking-wider text-primary font-bold px-space-xs py-1 rounded bg-secondary-container text-on-secondary-container"}>{"Immutable Ledger"}</span>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl p-space-sm shadow-sm mb-space-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm"}>
<div className={"flex flex-1 items-center gap-space-xs bg-surface-container-low rounded-lg px-space-sm py-2"}>
<Icon name="search" className="material-symbols-outlined text-outline text-[20px]" />
<SearchInput className={"w-full bg-transparent outline-none font-body-md text-body-md text-[#157375] placeholder:text-outline"} id={"searchInput"} placeholder={"Search by client, property, host, or keyword..."} type={"text"} name={"searchInput"} aria-label={"Search by client, property, host, or keyword..."}></SearchInput>
</div>
<div className={"flex flex-wrap items-center gap-space-xs"}>
<div className={"flex items-center bg-surface-container-low rounded-lg p-1"}>
<ActionButton className={"filter-btn px-space-sm py-1.5 rounded-md font-label-sm text-label-sm bg-surface-container-lowest shadow-sm text-[#157375] font-semibold transition-all"} actionLabel={"All Reviews (4)"} aria-label={"All Reviews (4)"} hint={"setFilter('all', this)"}>{"All Reviews (4)"}</ActionButton>
<ActionButton className={"filter-btn px-space-sm py-1.5 rounded-md font-label-sm text-label-sm text-[#157375] hover:text-[#157375] transition-all flex items-center gap-1"} actionLabel={"Flagged"} aria-label={"Flagged"} hint={"setFilter('flagged', this)"}>
<RecordStatus initial={"Flagged"}></RecordStatus>
<span className={"w-2 h-2 rounded-full bg-amber-500"}></span>
</ActionButton>
<ActionButton className={"filter-btn px-space-sm py-1.5 rounded-md font-label-sm text-label-sm text-[#157375] hover:text-[#157375] transition-all"} actionLabel={"Published"} aria-label={"Published"} hint={"setFilter('published', this)"}>{"Published"}</ActionButton>
</div>
<div className={"h-6 w-px bg-outline-variant hidden sm:block"}></div>
<ActionButton className={"flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high font-label-sm text-label-sm text-[#157375] transition-colors"} actionLabel={"tune Filter by 7 Criteria"} aria-label={"tune Filter by 7 Criteria"}>
<Icon name="tune" className="material-symbols-outlined text-[18px]" />
<span>{"Filter by 7 Criteria"}</span>
</ActionButton>
<ActionButton className={"flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high font-label-sm text-label-sm text-[#157375] transition-colors"} actionLabel={"file_download Export Log"} aria-label={"file_download Export Log"}>
<Icon name="file_download" className="material-symbols-outlined text-[18px]" />
<span>{"Export Log"}</span>
</ActionButton>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col"}>
<div className={"overflow-x-auto"}>
<DataTable className={"w-full text-left border-collapse"} id={"reviewsTable"}>
<thead>
<tr className={"bg-surface-container-low/70 text-[#157375] font-caption text-caption uppercase tracking-wider font-semibold"}>
<th className={"py-space-sm px-space-md"}>{"Client / Reviewer"}</th>
<th className={"py-space-sm px-space-md"}>{"Property & Host"}</th>
<th className={"py-space-sm px-space-md"}>{"Rating & Criteria Snapshot"}</th>
<th className={"py-space-sm px-space-md min-w-[280px]"}>{"Review Comment"}</th>
<th className={"py-space-sm px-space-md"}>{"Date"}</th>
<th className={"py-space-sm px-space-md"}>{"Status"}</th>
<th className={"py-space-sm px-space-md text-right"}>{"Actions"}</th>
</tr>
</thead>
<tbody className={"divide-y divide-surface-container-low font-body-md text-body-md text-[#157375]"}>

<RecordRow className={"hover:bg-surface-container-low/40 transition-colors review-row"} data-client={"Layal S."} data-prop={"Sour Sandy Beachfront Bungalow Tony K."} data-status={"published"} initialStatus={"Published"}>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center text-label-md shrink-0"}>{"\n                  LS\n                "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Layal S."}</span>
<span className={"inline-flex items-center gap-1 font-caption text-caption text-primary"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Verified Client\n                  "}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Sour Sandy Beachfront Bungalow"}</span>
<span className={"font-caption text-caption text-[#157375]"}>{"Host: Tony K."}</span>
<span className={"font-caption text-caption text-outline"}>{"Sour, South Lebanon"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-title-md text-title-md font-bold text-[#157375]"}>{"4.8"}</span>
<div className={"flex items-center text-amber-500"}>
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star_half" className="material-symbols-outlined text-[16px]" />
</div>
</div>
<div className={"flex flex-wrap gap-1 mt-1"}>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Cleanliness 5/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Wi-Fi 4/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Hot Water 5/5"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<p className={"font-body-md text-body-md text-[#157375] max-w-md line-clamp-3"}>{"\n                \u201cDirect beachfront access was wonderful. Kitchen had everything needed for family cooking. Clear instructions for the property gate.\u201d\n              "}</p>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm text-[#157375]"}>{"Aug 31, 2024"}</span>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold"} initial={"Published"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-top text-right whitespace-nowrap"}>
<div className={"flex items-center justify-end gap-space-xs"}>
<ActionButton className={"px-space-xs py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Inspect Criteria"} aria-label={"Inspect Criteria"} hint={"openCriteriaDrawer('Layal S.', 'Sour Sandy Beachfront Bungalow', 'Tony K.', 4.8, [5, 5, 5, 4, 5, 5, 4.6])"}>{"\n                  Inspect Criteria\n                "}</ActionButton>
<ActionButton className={"px-space-xs py-1.5 rounded-lg hover:bg-error-container hover:text-error font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Remove"} aria-label={"Remove"} hint={"openRemoveModal('Layal S.', 'Sour Sandy Beachfront Bungalow', 'Direct beachfront access was wonderful. Kitchen had everything needed for family cooking...')"}>{"\n                  Remove\n                "}</ActionButton>
</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/40 transition-colors review-row"} data-client={"Rami Kanaan"} data-prop={"Cedar Peak Stone Chalet Tony K."} data-status={"published"} initialStatus={"Published"}>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-label-md shrink-0"}>{"\n                  RK\n                "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Rami Kanaan"}</span>
<span className={"inline-flex items-center gap-1 font-caption text-caption text-primary"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Verified Client\n                  "}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Cedar Peak Stone Chalet"}</span>
<span className={"font-caption text-caption text-[#157375]"}>{"Host: Tony K."}</span>
<span className={"font-caption text-caption text-outline"}>{"Bcharre, North Lebanon"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-title-md text-title-md font-bold text-[#157375]"}>{"5.0"}</span>
<div className={"flex items-center text-amber-500"}>
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
</div>
</div>
<div className={"flex flex-wrap gap-1 mt-1"}>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Cleanliness 5/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Privacy 5/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Wi-Fi 5/5"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<p className={"font-body-md text-body-md text-[#157375] max-w-md line-clamp-3"}>{"\n                \u201cTony was an outstanding host. Handcrafted cedar architecture was even better in person. The fireplace was fully stocked with firewood.\u201d\n              "}</p>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm text-[#157375]"}>{"Sep 15, 2024"}</span>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold"} initial={"Published"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-top text-right whitespace-nowrap"}>
<div className={"flex items-center justify-end gap-space-xs"}>
<ActionButton className={"px-space-xs py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Inspect Criteria"} aria-label={"Inspect Criteria"} hint={"openCriteriaDrawer('Rami Kanaan', 'Cedar Peak Stone Chalet', 'Tony K.', 5.0, [5, 5, 5, 5, 5, 5, 5])"}>{"\n                  Inspect Criteria\n                "}</ActionButton>
<ActionButton className={"px-space-xs py-1.5 rounded-lg hover:bg-error-container hover:text-error font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Remove"} aria-label={"Remove"} hint={"openRemoveModal('Rami Kanaan', 'Cedar Peak Stone Chalet', 'Tony was an outstanding host. Handcrafted cedar architecture was even better in person...')"}>{"\n                  Remove\n                "}</ActionButton>
</div>
</td>
</RecordRow>

<RecordRow className={"bg-amber-500/5 hover:bg-amber-500/10 transition-colors review-row"} data-client={"Tariq Mansour"} data-prop={"Faqra Crest Modern Villa Walid J."} data-status={"flagged"} initialStatus={""}>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold flex items-center justify-center text-label-md shrink-0"}>{"\n                  TM\n                "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Tariq Mansour"}</span>
<span className={"inline-flex items-center gap-1 font-caption text-caption text-primary"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Verified Client\n                  "}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Faqra Crest Modern Villa"}</span>
<span className={"font-caption text-caption text-[#157375]"}>{"Host: Walid J."}</span>
<span className={"font-caption text-caption text-outline"}>{"Keserwan, Mount Lebanon"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-title-md text-title-md font-bold text-error"}>{"1.8"}</span>
<div className={"flex items-center text-amber-500"}>
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
</div>
</div>
<div className={"flex flex-wrap gap-1 mt-1"}>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Overall 1/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Cleanliness 2/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Wi-Fi 1/5"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col gap-1 max-w-md"}>
<p className={"font-body-md text-body-md text-[#157375]"}>{"\n                  \u201cTerrible experience, the host is a complete scam artist and should be jailed [contains explicit profanity and personal slander]...\u201d\n                "}</p>
<span className={"inline-flex items-center gap-1 font-caption text-caption font-semibold text-amber-800"}>
<Icon name="warning" className="material-symbols-outlined text-[14px]" />{" Automatic trigger: Defamatory terminology detected\n                "}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm text-[#157375]"}>{"Oct 12, 2024"}</span>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-label-sm text-label-sm font-bold"}>
<span className={"w-1.5 h-1.5 rounded-full bg-amber-600"}></span>{"\n                Flagged for Review\n              "}</span>
</td>
<td className={"py-space-md px-space-md align-top text-right whitespace-nowrap"}>
<div className={"flex items-center justify-end gap-space-xs"}>
<ActionButton className={"px-space-xs py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Inspect Criteria"} aria-label={"Inspect Criteria"} hint={"openCriteriaDrawer('Tariq Mansour', 'Faqra Crest Modern Villa', 'Walid J.', 1.8, [1, 2, 3, 1, 2, 2, 1.5])"}>{"\n                  Inspect Criteria\n                "}</ActionButton>
<ActionButton className={"px-space-sm py-1.5 rounded-lg bg-error hover:bg-red-700 text-on-error font-label-sm text-label-sm font-semibold shadow-sm transition-colors flex items-center gap-1"} actionLabel={"delete Remove Review"} aria-label={"delete Remove Review"} hint={"openRemoveModal('Tariq Mansour', 'Faqra Crest Modern Villa', 'Terrible experience, the host is a complete scam artist and should be jailed [contains explicit profanity and personal slander]...')"}>
<Icon name="delete" className="material-symbols-outlined text-[16px]" />
<span>{"Remove Review"}</span>
</ActionButton>
</div>
</td>
</RecordRow>

<RecordRow className={"hover:bg-surface-container-low/40 transition-colors review-row"} data-client={"Jad K."} data-prop={"Cedar Peak Stone Chalet Tony K."} data-status={"published"} initialStatus={"Published"}>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-9 h-9 rounded-full bg-surface-variant text-[#157375] font-bold flex items-center justify-center text-label-md shrink-0"}>{"\n                  JK\n                "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Jad K."}</span>
<span className={"inline-flex items-center gap-1 font-caption text-caption text-primary"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Verified Client\n                  "}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-[#157375]"}>{"Cedar Peak Stone Chalet"}</span>
<span className={"font-caption text-caption text-[#157375]"}>{"Host: Tony K."}</span>
<span className={"font-caption text-caption text-outline"}>{"Bcharre, North Lebanon"}</span>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-title-md text-title-md font-bold text-[#157375]"}>{"5.0"}</span>
<div className={"flex items-center text-amber-500"}>
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
<Icon name="star" className="material-symbols-outlined text-[16px]" />
</div>
</div>
<div className={"flex flex-wrap gap-1 mt-1"}>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Overall 5/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Cleanliness 5/5"}</span>
<span className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-[#157375]"}>{"Hot Water 5/5"}</span>
</div>
</div>
</td>
<td className={"py-space-md px-space-md align-top"}>
<p className={"font-body-md text-body-md text-[#157375] max-w-md line-clamp-3"}>{"\n                \u201cPerfection in Faraya. Reliable 24/7 power backup and high-speed fiber internet made remote work effortless.\u201d\n              "}</p>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm text-[#157375]"}>{"Jul 14, 2024"}</span>
</td>
<td className={"py-space-md px-space-md align-top whitespace-nowrap"}>
<RecordStatus className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold"} initial={"Published"}></RecordStatus>
</td>
<td className={"py-space-md px-space-md align-top text-right whitespace-nowrap"}>
<div className={"flex items-center justify-end gap-space-xs"}>
<ActionButton className={"px-space-xs py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Inspect Criteria"} aria-label={"Inspect Criteria"} hint={"openCriteriaDrawer('Jad K.', 'Cedar Peak Stone Chalet', 'Tony K.', 5.0, [5, 5, 5, 5, 5, 5, 5])"}>{"\n                  Inspect Criteria\n                "}</ActionButton>
<ActionButton className={"px-space-xs py-1.5 rounded-lg hover:bg-error-container hover:text-error font-label-sm text-label-sm text-[#157375] font-medium transition-colors"} actionLabel={"Remove"} aria-label={"Remove"} hint={"openRemoveModal('Jad K.', 'Cedar Peak Stone Chalet', 'Perfection in Faraya. Reliable 24/7 power backup...')"}>{"\n                  Remove\n                "}</ActionButton>
</div>
</td>
</RecordRow>
</tbody>
</DataTable>
</div>

<div className={"p-space-md bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-[#157375]"}>
<div>{"Showing "}<span className={"font-semibold text-[#157375]"}>{"4"}</span>{" of "}<span className={"font-semibold text-[#157375]"}>{"412"}</span>{" Platform Reviews"}</div>
<div className={"flex items-center gap-space-xxs"}>
<ActionButton className={"px-space-sm py-1 rounded-lg bg-surface-container-lowest text-[#157375] shadow-sm font-medium hover:bg-surface-container"} actionLabel={"Previous"} aria-label={"Previous"}>{"Previous"}</ActionButton>
<ActionButton className={"w-8 h-8 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center shadow-sm"} actionLabel={"1"} aria-label={"1"}>{"1"}</ActionButton>
<ActionButton className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-[#157375] font-medium flex items-center justify-center hover:bg-surface-container shadow-sm"} actionLabel={"2"} aria-label={"2"}>{"2"}</ActionButton>
<ActionButton className={"w-8 h-8 rounded-lg bg-surface-container-lowest text-[#157375] font-medium flex items-center justify-center hover:bg-surface-container shadow-sm"} actionLabel={"3"} aria-label={"3"}>{"3"}</ActionButton>
<span className={"px-1 text-outline"}>{"..."}</span>
<ActionButton className={"px-space-sm py-1 rounded-lg bg-surface-container-lowest text-[#157375] shadow-sm font-medium hover:bg-surface-container"} actionLabel={"Next"} aria-label={"Next"}>{"Next"}</ActionButton>
</div>
</div>
</div>

<div className={"fixed inset-0 bg-inverse-surface/40 backdrop-blur-[4px] z-50 hidden transition-opacity"} id={"criteriaDrawer"}>
<div className={"absolute right-0 top-0 h-full w-full max-w-lg bg-surface-container-lowest shadow-2xl p-space-lg flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 translate-x-full"} id={"drawerContent"}>
<div>
<div className={"flex items-center justify-between pb-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="analytics" className="material-symbols-outlined text-primary text-[24px]" />
<h3 className={"font-headline-sm text-headline-sm text-[#157375]"}>{"7-Criteria Analysis"}</h3>
</div>
<ActionButton className={"w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[#157375] hover:text-[#157375]"} actionLabel={"close"} aria-label={"close"} hint={"closeCriteriaDrawer()"}>
<Icon name="close" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</div>
<div className={"p-space-md rounded-xl bg-surface-container-low mb-space-md"}>
<div className={"font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold mb-1"}>{"Review Target"}</div>
<div className={"font-title-md text-title-md text-[#157375] font-bold"} id={"drawerPropName"}>{"Cedar Peak Stone Chalet"}</div>
<div className={"font-body-md text-body-md text-[#157375] mt-0.5"} id={"drawerClientName"}>{"Evaluated by Rami Kanaan"}</div>
</div>
<div className={"flex items-center justify-between p-space-md rounded-xl bg-primary text-on-primary mb-space-lg"}>
<div>
<div className={"font-caption text-caption uppercase tracking-wider font-semibold opacity-80"}>{"Aggregate Rating"}</div>
<div className={"font-display text-display font-bold leading-tight"} id={"drawerOverallScore"}>{"5.0"}</div>
</div>
<div className={"flex items-center text-amber-300"}>
<Icon name="star" className="material-symbols-outlined text-[28px]" />
<Icon name="star" className="material-symbols-outlined text-[28px]" />
<Icon name="star" className="material-symbols-outlined text-[28px]" />
<Icon name="star" className="material-symbols-outlined text-[28px]" />
<Icon name="star" className="material-symbols-outlined text-[28px]" />
</div>
</div>

<h4 className={"font-label-md text-label-md font-bold text-[#157375] uppercase tracking-wider mb-space-sm"}>{"Individual Metric Scores"}</h4>
<div className={"space-y-space-sm"} id={"criteriaList"}>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="hotel" className="material-symbols-outlined text-[16px] text-primary" />{" 1. Overall Experience"}</span>
<span className={"font-bold text-[#157375]"} id={"score-0"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-0"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="cleaning_services" className="material-symbols-outlined text-[16px] text-primary" />{" 2. Cleanliness"}</span>
<span className={"font-bold text-[#157375]"} id={"score-1"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-1"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="visibility_off" className="material-symbols-outlined text-[16px] text-primary" />{" 3. Privacy"}</span>
<span className={"font-bold text-[#157375]"} id={"score-2"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-2"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="wifi" className="material-symbols-outlined text-[16px] text-primary" />{" 4. Wi-Fi & Connectivity"}</span>
<span className={"font-bold text-[#157375]"} id={"score-3"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-3"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="water_heater" className="material-symbols-outlined text-[16px] text-primary" />{" 5. Hot Water & Utilities"}</span>
<span className={"font-bold text-[#157375]"} id={"score-4"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-4"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="pin_drop" className="material-symbols-outlined text-[16px] text-primary" />{" 6. Location & Access"}</span>
<span className={"font-bold text-[#157375]"} id={"score-5"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-5"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between font-label-sm text-label-sm"}>
<span className={"text-[#157375] font-semibold flex items-center gap-1.5"}><Icon name="payments" className="material-symbols-outlined text-[16px] text-primary" />{" 7. Value for Money"}</span>
<span className={"font-bold text-[#157375]"} id={"score-6"}>{"5.0 / 5"}</span>
</div>
<div className={"w-full bg-surface-container rounded-full h-2 overflow-hidden"}>
<div className={"bg-primary h-2 rounded-full"} id={"bar-6"} style={{"width": "100%"}}></div>
</div>
</div>
</div>
</div>
<div className={"pt-space-md"}>
<ActionButton className={"w-full py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container font-label-md text-label-md font-semibold text-[#157375] transition-colors"} actionLabel={"Close Inspection"} aria-label={"Close Inspection"} hint={"closeCriteriaDrawer()"}>{"\n          Close Inspection\n        "}</ActionButton>
</div>
</div>
</div>

<div className={"fixed inset-0 bg-inverse-surface/50 backdrop-blur-[4px] z-50 hidden flex items-center justify-center p-space-md"} id={"removeModal"}>
<div className={"w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl p-space-lg flex flex-col relative animate-in fade-in zoom-in-95 duration-200"}>
<div className={"flex items-center gap-space-sm text-error mb-space-sm"}>
<div className={"w-10 h-10 rounded-xl bg-error-container flex items-center justify-center shrink-0"}>
<Icon name="gavel" className="material-symbols-outlined text-[24px]" />
</div>
<div>
<h3 className={"font-headline-sm text-headline-sm text-[#157375] font-bold"}>{"Remove Inappropriate Review?"}</h3>
<p className={"font-caption text-caption text-[#157375] uppercase tracking-wider font-semibold"}>{"Moderation Enforcement Action"}</p>
</div>
</div>

<div className={"bg-surface-container-low rounded-xl p-space-md my-space-sm"}>
<div className={"flex items-center justify-between mb-1"}>
<span className={"font-label-md text-label-md font-bold text-[#157375]"} id={"modalReviewer"}>{"Tariq Mansour"}</span>
<span className={"font-caption text-caption text-error font-semibold uppercase px-2 py-0.5 rounded bg-error-container"}>{"Flagged Content"}</span>
</div>
<div className={"font-label-sm text-label-sm text-[#157375] mb-space-xs"} id={"modalProperty"}>{"Faqra Crest Modern Villa"}</div>
<p className={"font-body-md text-body-md italic text-[#157375] bg-surface-container-lowest p- space-sm p-3 rounded-lg shadow-sm"} id={"modalSnippet"}>{"\n          \u201cTerrible experience, the host is a complete scam artist and should be jailed [contains explicit profanity and personal slander]...\u201d\n        "}</p>
</div>

<div className={"p-space-sm rounded-lg bg-amber-500/10 mb-space-md flex items-start gap-space-xs"}>
<Icon name="warning" className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5" />
<p className={"font-label-sm text-label-sm text-amber-900 leading-snug"}>
<strong>{"Mandatory Confirmation Notice:"}</strong>{" Removing this review will unpublish it from the public chalet listing and recalculate the host's 7-criteria aggregate score. This action cannot be undone.\n        "}</p>
</div>

<div className={"flex flex-col gap-space-xxs mb-space-lg"}>
<label className={"font-label-sm text-label-sm font-bold text-[#157375]"}>{"Moderation Justification"}</label>
<div className={"relative"}>
<select className={"w-full h-11 px-space-sm pr-10 rounded-lg bg-surface-container-low text-[#157375] font-body-md text-body-md appearance-none outline-none focus:ring-2 focus:ring-primary"} id={"justificationSelect"} aria-label={"justificationSelect"}>
<option value={"profanity"}>{"Violation of StayLeb Community Standards (Profanity / Defamation)"}</option>
<option value={"harassment"}>{"Targeted Harassment or Discrimination"}</option>
<option value={"false_stay"}>{"Fraudulent Review / Non-Stay Claim"}</option>
<option value={"blackmail"}>{"Extortion or Threat against Host"}</option>
<option value={"other"}>{"Other Severe Conduct Infraction"}</option>
</select>
<Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-outline" />
</div>
</div>

<div className={"flex items-center justify-end gap-space-sm"}>
<ActionButton className={"px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-md text-label-md font-semibold text-[#157375] transition-colors"} actionLabel={"Keep Review"} aria-label={"Keep Review"} hint={"closeRemoveModal()"}>{"\n          Keep Review\n        "}</ActionButton>
<ActionButton className={"px-space-md py-2.5 rounded-lg bg-[#E11D48] hover:bg-rose-700 text-white font-label-md text-label-md font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5"} actionLabel={"delete_forever Confirm & Remove Review"} aria-label={"delete_forever Confirm & Remove Review"} hint={"confirmRemoval()"}>
<Icon name="delete_forever" className="material-symbols-outlined text-[18px]" />
<span>{"Confirm & Remove Review"}</span>
</ActionButton>
</div>
</div>
</div>

<div className={"fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-2xl flex items-center gap-space-sm transition-all duration-300 transform translate-y-20 opacity-0 z-50"} id={"toastNotification"}>
<Icon name="check_circle" className="material-symbols-outlined text-emerald-400" />
<span className={"font-label-md text-label-md"} id={"toastMessage"}>{"Action completed successfully."}</span>
</div>
</div>
</main></div>
</>; }
