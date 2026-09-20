import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ActionButton } from "@/components/ui/Interactions";

export function RejectedPropertySection0() { return <>
<div className={""}><main className={"relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen"}><div className={"flex flex-col w-full"}>

<div className={"mb-space-lg"}>

<div className={"flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-xs"}>
<ActionButton className={"hover:text-primary transition-colors"} actionLabel={"Dashboard"} aria-label={"Dashboard"}>{"Dashboard"}</ActionButton>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<Link className={"hover:text-primary transition-colors"} href={"/owner/properties"}>{"My Properties"}</Link>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<span className={"text-on-surface font-semibold truncate max-w-[200px]"}>{"Bcharre Cedar Slope Lodge"}</span>
</div>

<div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-sm"}>
<div>
<div className={"flex items-center gap-space-xs mb-space-xxs"}>
<span className={"font-caption text-caption uppercase tracking-wider text-error font-bold"}>{"Action Required"}</span>
<span className={"text-outline-variant"}>{"\u2022"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Listing Ref: #LB-BCH-8492"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"Revisions Required \u2014 Bcharre Cedar Slope Lodge"}</h1>
</div>
<div className={"flex items-center gap-space-xs shrink-0"}>
<span className={"inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-semibold"}>
<Icon name="error" className="material-symbols-outlined text-[18px]" />
<span>{"Rejected / Action Required"}</span>
</span>
</div>
</div>
</div>

<div className={"bg-error-container/40 rounded-xl p-space-lg mb-space-lg shadow-sm"}>
<div className={"flex flex-col lg:flex-row items-start gap-space-md"}>
<div className={"w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0"}>
<Icon name="report" className="material-symbols-outlined text-[28px]" />
</div>
<div className={"flex-1 min-w-0"}>
<div className={"flex flex-wrap items-baseline gap-space-xs mb-space-xxs"}>
<h2 className={"font-title-md text-title-md text-on-error-container font-bold"}>{"Changes required before this property can be approved"}</h2>
<span className={"font-caption text-caption text-outline px-space-xs py-0.5 rounded bg-surface-container-lowest font-medium"}>{"Verified Review Protocol"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant mb-space-md"}>{"Reviewed by StayLeb Verification Team on Sep 18, 2024"}</p>

<div className={"bg-surface-container-lowest rounded-lg p-space-md shadow-sm"}>
<div className={"flex items-center gap-space-xs mb-space-xs text-on-surface font-label-md text-label-md font-bold"}>
<Icon name="rate_review" className="material-symbols-outlined text-error text-[18px]" />
<span>{"Admin Rejection Reason:"}</span>
</div>
<div className={"space-y-space-xs pl-space-xs"}>
<div className={"flex items-start gap-space-xs text-on-surface"}>
<span className={"font-label-md text-label-md text-error font-bold shrink-0"}>{"1."}</span>
<p className={"font-body-md text-body-md text-on-surface"}>{"\n                The primary cover photo is blurry and does not clearly display the chalet's limestone exterior.\n              "}</p>
</div>
<div className={"flex items-start gap-space-xs text-on-surface"}>
<span className={"font-label-md text-label-md text-error font-bold shrink-0"}>{"2."}</span>
<p className={"font-body-md text-body-md text-on-surface"}>{"\n                The quiet hours rule contradicts the 'parties allowed' toggle selected in the rules configuration.\n              "}</p>
</div>
</div>
<div className={"mt-space-sm pt-space-sm bg-surface-container-low/60 -mx-space-md -mb-space-md px-space-md py-space-xs rounded-b-lg flex items-center gap-space-xs"}>
<Icon name="info" className="material-symbols-outlined text-primary text-[18px]" />
<p className={"font-body-md text-body-md text-on-surface-variant italic"}>{"\n              Please upload updated high-resolution exterior photography and adjust the party policy to match village guidelines.\n            "}</p>
</div>
</div>
</div>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start"}>

<div className={"lg:col-span-7 flex flex-col gap-space-lg"}>

<div className={"bg-surface-container-lowest rounded-xl p-space-lg shadow-sm"}>
<div className={"flex items-center justify-between mb-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center"}>
<Icon name="assignment_turned_in" className="material-symbols-outlined text-[20px]" />
</div>
<h3 className={"font-title-md text-title-md text-on-surface"}>{"Next Steps to Publish"}</h3>
</div>
<span className={"font-caption text-caption px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold"}>{"2 Steps"}</span>
</div>
<div className={"space-y-space-md"}>

<div className={"flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low/70 transition-all hover:bg-surface-container-low"}>
<div className={"w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-label-md shrink-0"}>{"\n              1\n            "}</div>
<div className={"flex-1"}>
<h4 className={"font-label-md text-label-md text-on-surface font-bold mb-space-xxs"}>{"Click 'Edit Property & Fix Items'"}</h4>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Navigate directly to the listing editor to replace the hero media with high-definition limestone facade images and align village quiet hours.\n              "}</p>
<div className={"mt-space-xs flex flex-wrap gap-space-xs"}>
<span className={"inline-flex items-center gap-1 font-caption text-caption bg-surface-container-high text-primary px-space-xs py-0.5 rounded"}>
<Icon name="photo_library" className="material-symbols-outlined text-[12px]" />{" Media Gallery\n                "}</span>
<span className={"inline-flex items-center gap-1 font-caption text-caption bg-surface-container-high text-primary px-space-xs py-0.5 rounded"}>
<Icon name="gavel" className="material-symbols-outlined text-[12px]" />{" Chalet Rules\n                "}</span>
</div>
</div>
</div>

<div className={"flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low/70 transition-all hover:bg-surface-container-low"}>
<div className={"w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-label-md shrink-0"}>{"\n              2\n            "}</div>
<div className={"flex-1"}>
<h4 className={"font-label-md text-label-md text-on-surface font-bold mb-space-xxs"}>{"Click 'Resubmit for Review'"}</h4>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Upon resubmission, status instantly returns to "}<span className={"font-semibold text-primary"}>{"Pending Admin Review"}</span>{". Our Mount Lebanon verification team re-evaluates within 4 to 8 operational hours.\n              "}</p>
</div>
</div>
</div>

<div className={"mt-space-lg pt-space-md flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm"}>
<Link className={"flex-1 flex items-center justify-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md py-3 px-space-lg rounded-xl transition-all shadow-md active:scale-95"} href={"/owner/properties/cedar-peak/edit"}>
<span>{"Edit Property & Resubmit"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
</Link>
<ActionButton className={"flex items-center justify-center gap-space-xs bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md py-3 px-space-md rounded-xl transition-colors"} actionLabel={"visibility View Original Submission"} aria-label={"visibility View Original Submission"}>
<Icon name="visibility" className="material-symbols-outlined text-[18px]" />
<span>{"View Original Submission"}</span>
</ActionButton>
</div>
<div className={"mt-space-md pt-space-xs flex items-center justify-between"}>
<span className={"font-caption text-caption text-outline"}>{"Need manual clarification?"}</span>
<ActionButton className={"flex items-center gap-space-xxs text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold transition-colors"} actionLabel={"support_agent Contact StayLeb Admin Support"} aria-label={"support_agent Contact StayLeb Admin Support"}>
<Icon name="support_agent" className="material-symbols-outlined text-[16px]" />
<span>{"Contact StayLeb Admin Support"}</span>
</ActionButton>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm"}>
<span className={"font-caption text-caption uppercase tracking-wider text-outline font-bold block mb-space-xs"}>{"Audit Verification Criteria"}</span>
<div className={"grid grid-cols-2 sm:grid-cols-4 gap-space-xs"}>
<div className={"bg-surface-container-low p-space-xs rounded-lg flex flex-col gap-1"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Host ID Check"}</span>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-bold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Passed\n            "}</span>
</div>
<div className={"bg-surface-container-low p-space-xs rounded-lg flex flex-col gap-1"}>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Cadastral Deed"}</span>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-bold"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{" Verified\n            "}</span>
</div>
<div className={"bg-error-container/30 p-space-xs rounded-lg flex flex-col gap-1"}>
<span className={"font-caption text-caption text-error font-medium"}>{"Cover Photo"}</span>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-error font-bold"}>
<Icon name="cancel" className="material-symbols-outlined text-[14px]" />{" Rejected\n            "}</span>
</div>
<div className={"bg-error-container/30 p-space-xs rounded-lg flex flex-col gap-1"}>
<span className={"font-caption text-caption text-error font-medium"}>{"Policy Match"}</span>
<span className={"inline-flex items-center gap-1 font-label-sm text-label-sm text-error font-bold"}>
<Icon name="cancel" className="material-symbols-outlined text-[14px]" />{" Conflict\n            "}</span>
</div>
</div>
</div>
</div>

<div className={"lg:col-span-5 flex flex-col gap-space-md"}>
<div className={"bg-surface-container-lowest rounded-xl p-space-md shadow-sm"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<span className={"font-label-md text-label-md text-on-surface font-bold"}>{"Property Snapshot"}</span>
<span className={"font-caption text-caption text-outline"}>{"Chalet Listing"}</span>
</div>

<div className={"relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-surface-container-high mb-space-sm"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Bcharre cedar slope mountain chalet with traditional Lebanese natural limestone masonry and snowy peaks in the backdrop of the Qadisha Valley, captured in natural mountain sunlight with warm wooden balconies"} src={"/images/44bf32ed45ab23ce.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"}></div>

<div className={"absolute top-space-xs left-space-xs bg-error text-on-error font-caption text-caption px-space-xs py-1 rounded shadow-sm flex items-center gap-1 font-bold"}>
<Icon name="flag" className="material-symbols-outlined text-[14px]" />
<span>{"Flagged: Update Photo"}</span>
</div>

<div className={"absolute bottom-space-xs left-space-xs right-space-xs flex items-end justify-between text-on-primary"}>
<div>
<h4 className={"font-title-md text-title-md font-bold leading-snug drop-shadow-sm"}>{"Bcharre Cedar Slope Lodge"}</h4>
<p className={"font-caption text-caption flex items-center gap-1 opacity-90"}>
<Icon name="location_on" className="material-symbols-outlined text-[14px]" />
<span>{"Bcharre, North Lebanon"}</span>
</p>
</div>
<div className={"text-right"}>
<span className={"font-caption text-caption block uppercase tracking-wide opacity-80"}>{"Base Rate"}</span>
<span className={"font-title-md text-title-md font-bold text-secondary-fixed"}>{"$190"}<span className={"font-body-md text-body-md font-normal text-on-primary/80"}>{" /night"}</span></span>
</div>
</div>
</div>

<div className={"grid grid-cols-3 gap-space-xs py-space-xs bg-surface-container-low/50 rounded-lg mb-space-sm text-center"}>
<div className={"flex flex-col items-center"}>
<Icon name="bed" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-on-surface font-bold"}>{"2 Bedrooms"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"3 Beds"}</span>
</div>
<div className={"flex flex-col items-center"}>
<Icon name="group" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-on-surface font-bold"}>{"5 Guests"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Capacity"}</span>
</div>
<div className={"flex flex-col items-center"}>
<Icon name="bathtub" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-on-surface font-bold"}>{"2 Baths"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Private"}</span>
</div>
</div>

<div className={"space-y-space-xs text-on-surface-variant font-body-md text-body-md"}>
<div className={"flex items-center justify-between py-1 bg-surface-container-lowest"}>
<span className={"text-on-surface-variant font-label-sm text-label-sm"}>{"Township"}</span>
<span className={"text-on-surface font-label-sm text-label-sm font-semibold"}>{"Bcharre Municipal District"}</span>
</div>
<div className={"flex items-center justify-between py-1 bg-surface-container-lowest"}>
<span className={"text-on-surface-variant font-label-sm text-label-sm"}>{"Primary Amenity"}</span>
<span className={"text-on-surface font-label-sm text-label-sm font-semibold"}>{"Heated Ski Storage & Fireplace"}</span>
</div>
<div className={"flex items-center justify-between py-1 bg-surface-container-lowest"}>
<span className={"text-on-surface-variant font-label-sm text-label-sm"}>{"Current State"}</span>
<span className={"text-error font-label-sm text-label-sm font-semibold"}>{"Unlisted / Hidden from Search"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-high/40 rounded-xl p-space-md"}>
<div className={"flex items-center gap-space-xs text-primary mb-space-xs"}>
<Icon name="lightbulb" className="material-symbols-outlined text-[20px]" />
<span className={"font-label-md text-label-md font-bold"}>{"Host Success Tip"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant mb-space-sm"}>{"\n          Properties in North Lebanon with natural exterior daylight photos and clear community guidelines gain 3.4x faster approval rates and 40% higher weekend bookings.\n        "}</p>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary"}></span>
<span className={"font-caption text-caption text-secondary font-semibold"}>{"Photo guide: Min 1920x1080px, landscape, unedited"}</span>
</div>
</div>
</div>
</div>
</div></main></div>
</>; }
