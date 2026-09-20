import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton } from "@/components/ui/Interactions";

export function PropertyPendingReviewSection0() { return <>
<div className={""}><main className={"relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen"}><div className={"flex flex-col w-full"}>
<div className={"flex flex-col gap-space-lg w-full max-w-7xl mx-auto"}>

<div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-sm"}>
<div className={"flex flex-col gap-space-xxs"}>
<nav className={"flex items-center gap-space-xs font-caption text-caption text-on-surface-variant tracking-wider uppercase"}>
<ActionButton className={"hover:text-primary transition-colors"} actionLabel={"Dashboard"} aria-label={"Dashboard"}>{"Dashboard"}</ActionButton>
<span>{"/"}</span>
<Link className={"hover:text-primary transition-colors"} href={"/owner/properties"}>{"My Properties"}</Link>
<span>{"/"}</span>
<span className={"text-on-surface font-semibold"}>{"Zaarour Pine Ridge Chalet"}</span>
</nav>
<div className={"flex items-center gap-space-sm flex-wrap"}>
<h1 className={"font-headline-lg text-headline-lg text-on-surface"}>{"Property Submission Pending Review"}</h1>
<span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-amber-50 text-amber-700 shadow-sm"}>
<span className={"w-2 h-2 rounded-full bg-amber-500 animate-pulse"}></span>{"\n            Pending Admin Review\n          "}</span>
</div>
</div>
<div className={"flex items-center gap-space-xs shrink-0"}>
<ActionButton className={"flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-all font-label-md text-label-md shadow-sm"} actionLabel={"visibility View Submitted Details"} aria-label={"visibility View Submitted Details"}>
<Icon name="visibility" className="material-symbols-outlined text-[18px]" />
<span>{"View Submitted Details"}</span>
</ActionButton>
<ActionButton className={"flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary transition-all font-label-md text-label-md shadow-sm"} actionLabel={"arrow_back Back to My Properties"} aria-label={"arrow_back Back to My Properties"}>
<Icon name="arrow_back" className="material-symbols-outlined text-[18px]" />
<span>{"Back to My Properties"}</span>
</ActionButton>
</div>
</div>

<div className={"flex items-start gap-space-md p-space-md rounded-2xl bg-surface-container-low shadow-sm relative overflow-hidden"}>
<div className={"absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"}></div>
<div className={"w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm"}>
<Icon name="verified_user" className="material-symbols-outlined text-[22px]" />
</div>
<div className={"flex flex-col gap-1 pr-6"}>
<div className={"flex items-center gap-2"}>
<span className={"font-title-md text-title-md text-on-surface"}>{"Safe Hosting & Manual Quality Screening"}</span>
<span className={"font-caption text-caption px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium"}>{"Standard Protocol"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>{"\n          Your listing has been safely submitted to StayLeb Operations. Our team manually verifies every Lebanese property for accurate representation, amenity claims, and contact reliability before activating public discovery.\n        "}</p>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start"}>

<div className={"lg:col-span-5 flex flex-col gap-space-lg"}>

<div className={"flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden group"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Modern alpine A-frame stone and cedar chalet in Zaarour mountain peaks of Mount Lebanon, surrounded by snow-capped pine ridges during warm sunset glow with architectural floor-to-ceiling glass windows and private stone terrace, editorial architectural photograph, pristine lighting"} src={"/images/07c04d6fa141e663.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-black/20"}></div>
<div className={"absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-caption text-caption flex items-center gap-1 shadow-sm"}>
<Icon name="pin_drop" className="material-symbols-outlined text-[15px] text-primary" />
<span>{"Metn Crest"}</span>
</div>
<div className={"absolute bottom-3 left-4 right-4 flex items-end justify-between"}>
<div>
<span className={"font-caption text-caption text-on-primary/80 uppercase tracking-widest block"}>{"Chalet"}</span>
<span className={"font-headline-sm text-headline-sm text-on-primary font-bold drop-shadow-sm"}>{"Zaarour Pine Ridge"}</span>
</div>
<div className={"text-right"}>
<span className={"font-headline-md text-headline-md text-on-primary font-bold leading-none"}>{"$185"}</span>
<span className={"font-caption text-caption text-on-primary/80 block"}>{"/ night"}</span>
</div>
</div>
</div>
<div className={"p-space-md flex flex-col gap-space-md"}>
<div className={"flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium"}>{"Submission Timestamp"}</span>
<span className={"font-label-sm text-label-sm text-on-surface font-medium"}>{"Today at 3:15 PM"}</span>
</div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium"}>{"Submitted By"}</span>
<div className={"flex items-center gap-1.5"}>
<span className={"w-5 h-5 rounded-full bg-primary flex items-center justify-center font-caption text-[10px] text-on-primary font-bold"}>{"TK"}</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>{"Tony K. (Host ID #8841)"}</span>
</div>
</div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium"}>{"Geographic Jurisdiction"}</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>{"Zaarour Mountain Crest, Metn"}</span>
</div>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium"}>{"Electricity & Heat Class"}</span>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-medium"}>
<Icon name="bolt" className="material-symbols-outlined text-[16px]" />{"\n                  24/7 Solar + Dedicated Generator\n                "}</span>
</div>
</div>

<div className={"flex items-center gap-2 pt-space-xs flex-wrap"}>
<span className={"px-2.5 py-1 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface flex items-center gap-1"}>
<Icon name="bed" className="material-symbols-outlined text-[14px] text-outline" />{" 3 Bedrooms\n              "}</span>
<span className={"px-2.5 py-1 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface flex items-center gap-1"}>
<Icon name="bathtub" className="material-symbols-outlined text-[14px] text-outline" />{" 2 Bathrooms\n              "}</span>
<span className={"px-2.5 py-1 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface flex items-center gap-1"}>
<Icon name="pool" className="material-symbols-outlined text-[14px] text-outline" />{" Heated Alpine Tub\n              "}</span>
<span className={"px-2.5 py-1 rounded-lg bg-surface-container-low font-caption text-caption text-on-surface flex items-center gap-1"}>
<Icon name="fireplace" className="material-symbols-outlined text-[14px] text-outline" />{" Wood Fireplace\n              "}</span>
</div>
</div>
</div>

<div className={"p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs"}>
<div className={"flex items-center gap-2"}>
<Icon name="shield_lock" className="material-symbols-outlined text-secondary text-[20px]" />
<span className={"font-title-md text-title-md text-on-surface"}>{"Host Guarantee Standard"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n            StayLeb operates under regulated Lebanese tourism agreements. Once approved, your chalet gains the \"Lebanon Certified Stay\" badge, granting access to international travelers and foreign currency deposits.\n          "}</p>
</div>
</div>

<div className={"lg:col-span-7 flex flex-col gap-space-lg"}>

<div className={"p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md"}>
<div className={"flex items-center justify-between"}>
<div className={"flex flex-col"}>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>{"Review Checklist Progress"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{"StayLeb trust desk audit sequence"}</span>
</div>
<div className={"flex items-center gap-2"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Completion"}</span>
<span className={"font-label-md text-label-md text-primary font-bold"}>{"3 of 4 Underway"}</span>
</div>
</div>

<div className={"w-full bg-surface-container-high h-2 rounded-full overflow-hidden"}>
<div className={"bg-primary h-full rounded-full transition-all duration-700"} style={{"width": "65%"}}></div>
</div>

<div className={"flex flex-col gap-space-sm pt-space-xs"}>

<div className={"flex items-start justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"}>
<div className={"flex items-start gap-space-sm"}>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5"}>
<Icon name="location_on" className="material-symbols-outlined text-[18px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"1. Identity & Location Verification"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{"Validation of Metn property coordinates, title/lease deed and Tony K. host dossier."}</span>
</div>
</div>
<span className={"shrink-0 ml-4 px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-primary/10 text-primary font-medium flex items-center gap-1"}>
<Icon name="progress_activity" className="material-symbols-outlined text-[14px] animate-spin" />{"\n                In Progress\n              "}</span>
</div>

<div className={"flex items-start justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"}>
<div className={"flex items-start gap-space-sm"}>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5"}>
<Icon name="photo_camera" className="material-symbols-outlined text-[18px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"2. Photographed Amenities Inspection"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{"Resolution check on high-altitude views, terrace integrity, and heated tub functioning."}</span>
</div>
</div>
<span className={"shrink-0 ml-4 px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-primary/10 text-primary font-medium flex items-center gap-1"}>
<Icon name="progress_activity" className="material-symbols-outlined text-[14px] animate-spin" />{"\n                In Progress\n              "}</span>
</div>

<div className={"flex items-start justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"}>
<div className={"flex items-start gap-space-sm"}>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5"}>
<Icon name="power" className="material-symbols-outlined text-[18px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"3. Power & Utility Continuity Standard"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{"Testing uninterrupted secondary generator automatic transfer switch (ATS) & high-speed Wi-Fi assurance."}</span>
</div>
</div>
<span className={"shrink-0 ml-4 px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-primary/10 text-primary font-medium flex items-center gap-1"}>
<Icon name="progress_activity" className="material-symbols-outlined text-[14px] animate-spin" />{"\n                In Progress\n              "}</span>
</div>

<div className={"flex items-start justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"}>
<div className={"flex items-start gap-space-sm"}>
<div className={"w-8 h-8 rounded-lg bg-surface-container-high text-outline flex items-center justify-center shrink-0 mt-0.5"}>
<Icon name="gavel" className="material-symbols-outlined text-[18px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"4. House Rules Compliance"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{"Evaluating quiet hour policies, woodstove security, pet allowance, and security deposit terms."}</span>
</div>
</div>
<RecordStatus className={"shrink-0 ml-4 px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant font-medium"} initial={"Pending"}></RecordStatus>
</div>
</div>
</div>

<div className={"p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md"}>
<div className={"flex items-center gap-2"}>
<Icon name="help_center" className="material-symbols-outlined text-primary text-[22px]" />
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>{"What happens next?"}</h2>
</div>
<div className={"grid grid-cols-1 md:grid-cols-2 gap-space-md"}>

<div className={"flex flex-col gap-space-xs p-space-md rounded-xl bg-emerald-50/50 relative overflow-hidden"}>
<div className={"flex items-center gap-2 text-emerald-800 font-label-md text-label-md font-bold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[20px] text-emerald-600" />
<span>{"If Approved"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Listing immediately becomes "}<strong className={"text-on-surface"}>{"Live on StayLeb marketplace"}</strong>{" and searchable via both standard criteria and our natural-language AI Lebanese itinerary finder.\n              "}</p>
</div>

<div className={"flex flex-col gap-space-xs p-space-md rounded-xl bg-amber-50/50 relative overflow-hidden"}>
<div className={"flex items-center gap-2 text-amber-900 font-label-md text-label-md font-bold"}>
<Icon name="edit_note" className="material-symbols-outlined text-[20px] text-amber-600" />
<span>{"If Revisions Needed"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                You'll receive an itemized Admin notification detailing necessary modifications (e.g. higher-res solar inverter photo, firewood rules) and can update and resubmit instantly.\n              "}</p>
</div>
</div>

<div className={"pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-xl"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="support_agent" className="material-symbols-outlined text-primary text-[20px]" />
<span className={"font-caption text-caption text-on-surface"}>{"Need to upload emergency utility certificates or revised photos right away?"}</span>
</div>
<ActionButton className={"font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors shrink-0"} actionLabel={"Message Operations Team \u2192"} aria-label={"Message Operations Team \u2192"}>{"\n              Message Operations Team \u2192\n            "}</ActionButton>
</div>
</div>
</div>
</div>
</div>
</div></main></div>
</>; }
