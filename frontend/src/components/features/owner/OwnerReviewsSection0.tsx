import { Icon } from "@/components/ui/Icon";
import { FilterSelect } from "@/components/ui/Interactions";

export function OwnerReviewsSection0() { return <>
<main className={"w-full  pt-6 min-h-screen bg-background"}><div className={"flex flex-col w-full"}>
<div className={"p-space-lg max-w-7xl mx-auto w-full flex flex-col gap-space-lg"}>

<div className={"flex flex-col gap-space-xs"}>
<nav className={"flex items-center gap-space-xxs text-on-surface-variant font-caption text-caption"}>
<span className={"hover:text-primary cursor-pointer transition-colors"}>{"Dashboard"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<span className={"text-primary font-semibold"}>{"Reviews"}</span>
</nav>
<div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md"}>
<div className={"flex flex-col max-w-2xl"}>
<h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"Guest Reviews & Ratings"}</h1>
<p className={"font-body-md text-body-md text-on-surface-variant mt-space-xxs"}>{"\n            Inspect verified guest feedback for your properties across the seven StayLeb evaluation standards. Reviews are submitted by verified guests and are immutable.\n          "}</p>
</div>

<div className={"relative min-w-[280px]"}>
<label className={"font-caption text-caption text-on-surface-variant mb-1 block"}>{"Filtered Property"}</label>
<div className={"relative bg-surface-container-lowest rounded-xl shadow-sm hover:shadow transition-shadow"}>
<FilterSelect className={"w-full h-11 pl-space-sm pr-9 rounded-xl bg-transparent appearance-none font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer"} id={"property-filter"}>
<option value={"all"}>{"All Properties (61 reviews \u00b7 4.94 \u2605)"}</option>
<option value={"cedar"}>{"Cedar Peak Stone Chalet (42 reviews \u00b7 4.96 \u2605)"}</option>
<option value={"sour"}>{"Sour Sandy Beachfront Bungalow (19 reviews \u00b7 4.86 \u2605)"}</option>
<option value={"empty"}>{"Beit Misk Terrace Loft (0 reviews \u00b7 New)"}</option>
</FilterSelect>
<Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant text-[20px]" />
</div>
</div>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg"}>

<div className={"lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden"}>
<div className={"absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-secondary-container/40 blur-2xl pointer-events-none"}></div>
<div className={"flex flex-col"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold"}>{"Portfolio Rating"}</span>
<span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"}>
<Icon name="hotel_class" className="material-symbols-outlined text-[14px]" />{"\n              Top Tier Host\n            "}</span>
</div>
<div className={"flex items-baseline gap-space-xs mt-space-xs"}>
<span className={"font-display text-display text-primary font-bold tracking-tight"}>{"4.94"}</span>
<div className={"flex flex-col"}>
<div className={"flex text-primary"}>
<Icon name="star" className="material-symbols-outlined text-[20px]" />
<Icon name="star" className="material-symbols-outlined text-[20px]" />
<Icon name="star" className="material-symbols-outlined text-[20px]" />
<Icon name="star" className="material-symbols-outlined text-[20px]" />
<Icon name="star" className="material-symbols-outlined text-[20px]" />
</div>
<span className={"font-caption text-caption text-on-surface-variant"}>{"out of 5.0 maximum"}</span>
</div>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant mt-space-sm"}>{"\n            Calculated from "}<strong className={"text-on-surface font-semibold"}>{"61 Completed Stays"}</strong>{" with an authenticated physical stay record.\n          "}</p>
</div>
<div className={"mt-space-lg pt-space-md bg-surface-container-low p-space-sm rounded-lg flex items-center gap-space-sm"}>
<div className={"w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-sm"}>
<Icon name="verified_user" className="material-symbols-outlined text-[22px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm text-on-surface font-semibold"}>{"StayLeb Verified Standard"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Seven strict baseline benchmarks enforced"}</span>
</div>
</div>
</div>

<div className={"lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="equalizer" className="material-symbols-outlined text-primary text-[20px]" />
<span className={"font-title-md text-title-md text-on-surface font-semibold"}>{"Seven StayLeb Evaluation Criteria"}</span>
</div>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Benchmark Target: 4.80+"}</span>
</div>
<div className={"grid grid-cols-1 md:grid-cols-2 gap-x-space-lg gap-y-space-sm mt-space-xs"}>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-primary"}></span>{"1. Overall Experience"}</span>
<span className={"font-semibold text-primary"}>{"4.96 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-primary"} style={{"width": "99.2%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-primary"}></span>{"2. Cleanliness"}</span>
<span className={"font-semibold text-primary"}>{"5.00 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-primary"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-primary"}></span>{"3. Privacy"}</span>
<span className={"font-semibold text-primary"}>{"4.90 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-primary"} style={{"width": "98%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-secondary"}></span>{"4. Wi-Fi Reliability"}</span>
<span className={"font-semibold text-primary"}>{"4.80 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-secondary"} style={{"width": "96%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-primary"}></span>{"5. Hot Water & Power"}</span>
<span className={"font-semibold text-primary"}>{"5.00 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-primary"} style={{"width": "100%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-primary"}></span>{"6. Location & Views"}</span>
<span className={"font-semibold text-primary"}>{"4.90 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-primary"} style={{"width": "98%"}}></div>
</div>
</div>

<div className={"flex flex-col gap-1 md:col-span-2 md:w-1/2 md:pr-space-sm"}>
<div className={"flex justify-between items-center text-on-surface font-label-sm text-label-sm"}>
<span className={"flex items-center gap-1.5"}><span className={"w-2 h-2 rounded-full bg-secondary"}></span>{"7. Value for Money"}</span>
<span className={"font-semibold text-primary"}>{"4.80 "}<span className={"text-on-surface-variant font-normal"}>{"/ 5.0"}</span></span>
</div>
<div className={"w-full h-2 rounded-full bg-surface-container"}>
<div className={"h-2 rounded-full bg-secondary"} style={{"width": "96%"}}></div>
</div>
</div>
</div>
</div>
</div>

<div className={"bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-md shadow-sm"}>
<div className={"w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center shrink-0"}>
<Icon name="policy" className="material-symbols-outlined text-[20px]" />
</div>
<div className={"flex flex-col gap-1"}>
<span className={"font-label-md text-label-md text-on-surface font-bold"}>{"Immutable Review Policy"}</span>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>{"\n          In accordance with StayLeb marketplace rules, hosts cannot edit, delete, or publicly dispute guest reviews. If a review violates platform terms or contains inappropriate content, submit a review moderation request to StayLeb Admin.\n        "}</p>
</div>
</div>

<div className={"flex flex-col gap-space-md"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<h2 className={"font-title-md text-title-md text-on-surface font-bold"}>{"Verified Evaluations"}</h2>
<span className={"px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold"}>{"Feed"}</span>
</div>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Showing latest completed bookings"}</span>
</div>

<div className={"flex flex-col gap-space-md"} id={"reviews-feed"}>

<article className={"review-item bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row gap-space-md"} data-property={"cedar"}>
<div className={"flex md:flex-col items-center md:items-start justify-between md:justify-start gap-space-xs md:w-56 shrink-0"}>
<div className={"w-12 h-12 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center font-title-md text-title-md"}>{"\n              RK\n            "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"Rami Kanaan"}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"Verified StayLeb Guest"}</span>
<span className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Sep 12\u201315, 2024"}</span>
</div>
</div>
<div className={"flex-1 flex flex-col justify-between gap-space-sm"}>
<div className={"flex flex-col gap-space-xs"}>
<div className={"flex flex-wrap items-center justify-between gap-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"flex items-center px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold"}>{"\n                    5.0 \u2605\n                  "}</div>
<span className={"font-label-md text-label-md text-on-surface font-medium"}>{"Cedar Peak Stone Chalet"}</span>
</div>
<div className={"flex items-center gap-1 text-on-surface-variant font-caption text-caption"}>
<Icon name="verified" className="material-symbols-outlined text-[16px] text-primary" />
<span>{"Key Handover Confirmed"}</span>
</div>
</div>

<div className={"flex flex-wrap gap-space-xxs pt-1"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Cleanliness 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Privacy 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Wi-Fi 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Hot Water 5/5"}</span>
</div>
<blockquote className={"font-body-md text-body-md text-on-surface mt-space-xs leading-relaxed italic"}>{"\n                \u201cTony was an outstanding host. Handcrafted cedar architecture was even better in person. The fireplace was fully stocked with firewood and the heated outdoor jacuzzi was incredible after hiking.\u201d\n              "}</blockquote>
</div>
<div className={"flex items-center justify-between pt-space-xs text-on-surface-variant font-caption text-caption"}>
<span>{"Faqra Plateau, Mount Lebanon"}</span>
<span className={"flex items-center gap-1"}>
<Icon name="lock" className="material-symbols-outlined text-[14px]" />{"\n                Immutable Verified Review\n              "}</span>
</div>
</div>
</article>

<article className={"review-item bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row gap-space-md"} data-property={"sour"}>
<div className={"flex md:flex-col items-center md:items-start justify-between md:justify-start gap-space-xs md:w-56 shrink-0"}>
<div className={"w-12 h-12 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center font-title-md text-title-md"}>{"\n              LS\n            "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"Layal S."}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"Verified StayLeb Guest"}</span>
<span className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Aug 28\u201331, 2024"}</span>
</div>
</div>
<div className={"flex-1 flex flex-col justify-between gap-space-sm"}>
<div className={"flex flex-col gap-space-xs"}>
<div className={"flex flex-wrap items-center justify-between gap-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"flex items-center px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold"}>{"\n                    4.8 \u2605\n                  "}</div>
<span className={"font-label-md text-label-md text-on-surface font-medium"}>{"Sour Sandy Beachfront Bungalow"}</span>
</div>
<div className={"flex items-center gap-1 text-on-surface-variant font-caption text-caption"}>
<Icon name="verified" className="material-symbols-outlined text-[16px] text-primary" />
<span>{"Key Handover Confirmed"}</span>
</div>
</div>

<div className={"flex flex-wrap gap-space-xxs pt-1"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Cleanliness 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Wi-Fi 4/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Hot Water 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Location 5/5"}</span>
</div>
<blockquote className={"font-body-md text-body-md text-on-surface mt-space-xs leading-relaxed italic"}>{"\n                \u201cDirect beachfront access was wonderful. Kitchen had everything needed for family cooking. Clear instructions for the property gate.\u201d\n              "}</blockquote>
</div>
<div className={"flex items-center justify-between pt-space-xs text-on-surface-variant font-caption text-caption"}>
<span>{"Sour Natural Beach Preserve, South Lebanon"}</span>
<span className={"flex items-center gap-1"}>
<Icon name="lock" className="material-symbols-outlined text-[14px]" />{"\n                Immutable Verified Review\n              "}</span>
</div>
</div>
</article>

<article className={"review-item bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row gap-space-md"} data-property={"cedar"}>
<div className={"flex md:flex-col items-center md:items-start justify-between md:justify-start gap-space-xs md:w-56 shrink-0"}>
<div className={"w-12 h-12 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center font-title-md text-title-md"}>{"\n              JK\n            "}</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"Jad K."}</span>
<span className={"font-caption text-caption text-secondary font-medium"}>{"Verified StayLeb Guest"}</span>
<span className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Jul 10\u201314, 2024"}</span>
</div>
</div>
<div className={"flex-1 flex flex-col justify-between gap-space-sm"}>
<div className={"flex flex-col gap-space-xs"}>
<div className={"flex flex-wrap items-center justify-between gap-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"flex items-center px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold"}>{"\n                    5.0 \u2605\n                  "}</div>
<span className={"font-label-md text-label-md text-on-surface font-medium"}>{"Cedar Peak Stone Chalet"}</span>
</div>
<div className={"flex items-center gap-1 text-on-surface-variant font-caption text-caption"}>
<Icon name="verified" className="material-symbols-outlined text-[16px] text-primary" />
<span>{"Key Handover Confirmed"}</span>
</div>
</div>

<div className={"flex flex-wrap gap-space-xxs pt-1"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Overall 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Cleanliness 5/5"}</span>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>{"Privacy 5/5"}</span>
</div>
<blockquote className={"font-body-md text-body-md text-on-surface mt-space-xs leading-relaxed italic"}>{"\n                \u201cPerfection in Faraya. Reliable 24/7 power backup and high-speed fiber internet made remote work effortless.\u201d\n              "}</blockquote>
</div>
<div className={"flex items-center justify-between pt-space-xs text-on-surface-variant font-caption text-caption"}>
<span>{"Faraya Heights, Mount Lebanon"}</span>
<span className={"flex items-center gap-1"}>
<Icon name="lock" className="material-symbols-outlined text-[14px]" />{"\n                Immutable Verified Review\n              "}</span>
</div>
</div>
</article>
</div>

<div className={"hidden bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-center justify-center text-center"} id={"empty-state-block"}>
<div className={"w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-space-sm"}>
<Icon name="rate_review" className="material-symbols-outlined text-[32px]" />
</div>
<h3 className={"font-title-md text-title-md text-on-surface font-semibold"}>{"No reviews yet for this listing"}</h3>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-md mt-space-xxs"}>{"\n          Reviews from completed stays will automatically appear here once guests submit their evaluation.\n        "}</p>
</div>
</div>

<div className={"flex flex-col sm:flex-row items-center justify-between gap-space-xs p-space-md rounded-xl bg-surface-container-lowest text-on-surface-variant font-caption text-caption shadow-sm"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="verified" className="material-symbols-outlined text-secondary text-[18px]" />
<span>{"All 61 reviews validated against authentic booking hashes and Lebanese host standards."}</span>
</div>
<span>{"Powered by StayLeb Transparency Protocol"}</span>
</div>
</div>
</div>
</main>
</>; }
