import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";

export function FavoritesSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>



<div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10"}>

<div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2"}>
<div className={"space-y-2"}>
<div className={"flex items-center gap-2"}>
<span className={"px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"}>{"\n            Saved Collections\n          "}</span>
<span className={"text-on-surface-variant text-caption"}>{"\u2022 Synced Across Devices"}</span>
</div>
<h1 className={"font-display text-display text-on-surface tracking-tight"}>{"Favorites"}</h1>
<p className={"font-body-lg text-body-lg text-on-surface-variant max-w-2xl"}>
<span id={"saved-count"}>{"4"}</span>{" saved chalets and furnished houses across Lebanon. Check live availability and book directly.\n        "}</p>
</div>

<div className={"flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0"} id={"filter-pill-group"}>
<ActionButton className={"filter-pill active px-4 py-2 rounded-full font-label-md text-label-md font-semibold bg-primary-container text-on-primary shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"} data-filter={"all"} actionLabel={"All Saved (4)"} aria-label={"All Saved (4)"}>
<span>{"All Saved"}</span>
<span className={"text-on-primary-container text-label-sm font-normal"} id={"pill-count-all"}>{"(4)"}</span>
</ActionButton>
<ActionButton className={"filter-pill px-4 py-2 rounded-full font-label-md text-label-md font-medium bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"} data-filter={"mountain"} actionLabel={"filter_hdr Mountain Chalets (2)"} aria-label={"filter_hdr Mountain Chalets (2)"}>
<Icon name="filter_hdr" className="material-symbols-outlined text-[16px]" />
<span>{"Mountain Chalets"}</span>
<span className={"text-outline text-label-sm font-normal"} id={"pill-count-mountain"}>{"(2)"}</span>
</ActionButton>
<ActionButton className={"filter-pill px-4 py-2 rounded-full font-label-md text-label-md font-medium bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"} data-filter={"coastal"} actionLabel={"water Coastal Stays (2)"} aria-label={"water Coastal Stays (2)"}>
<Icon name="water" className="material-symbols-outlined text-[16px]" />
<span>{"Coastal Stays"}</span>
<span className={"text-outline text-label-sm font-normal"} id={"pill-count-coastal"}>{"(2)"}</span>
</ActionButton>
</div>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"} id={"favorites-grid"}>

<article className={"property-card flex flex-col bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"} data-category={"coastal"} data-id={"fav-1"}>

<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Batroun seaside modern limestone villa with private infinity pool overlooking the Mediterranean sea during glowing golden hour sunset, authentic weathered stone and sleek glass"} src={"/images/1c19d7f467a0af3f.jpg"} alt={"Lebanese holiday home"} />

<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold shadow-xs flex items-center gap-1"}>
<Icon name="verified" className="material-symbols-outlined text-primary text-[14px]" />{"\n              Verified Host\n            "}</span>
<FavoriteButton id={"cedar-peak"} />
</div>

<div className={"absolute bottom-3 left-3 flex items-center gap-1.5"}>
<span className={"px-2 py-0.5 rounded-full bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption font-medium flex items-center gap-1"}>
<Icon name="solar_power" className="material-symbols-outlined text-[13px] text-secondary-fixed" />{"\n              Solar 24/7\n            "}</span>
</div>
</div>

<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-semibold uppercase tracking-wider text-secondary"}>{"Batroun Old Coastline"}</span>
<div className={"flex items-center gap-1 text-on-surface font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.99"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(68)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"\n              Batroun Sunset Seaside Villa\n            "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"\n              6 guests \u00b7 3 beds \u00b7 Private Pool\n            "}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between bg-surface-container-low/40 -mx-4 -mb-4 px-4 py-3"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-primary"}>{"$275"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"} href={"/properties/cedar-peak"}>{"\n              Check Dates\n            "}</Link>
</div>
</div>
</article>

<article className={"property-card flex flex-col bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"} data-category={"mountain"} data-id={"fav-2"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Traditional high-mountain Lebanese stone chalet in Faraya covered in fresh snow with warm interior wooden beams glowing from double height panoramic glass windows"} src={"/images/434360383b69d1de.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold shadow-xs flex items-center gap-1"}>
<Icon name="downhill_skiing" className="material-symbols-outlined text-primary text-[14px]" />{"\n              Ski-in / Out\n            "}</span>
<FavoriteButton id={"cedar-peak"} />
</div>
<div className={"absolute bottom-3 left-3 flex items-center gap-1.5"}>
<span className={"px-2 py-0.5 rounded-full bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption font-medium flex items-center gap-1"}>
<Icon name="hot_tub" className="material-symbols-outlined text-[13px] text-tertiary-fixed" />{"\n              Heated Jacuzzi\n            "}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-semibold uppercase tracking-wider text-secondary"}>{"Faraya Mzaar"}</span>
<div className={"flex items-center gap-1 text-on-surface font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.96"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(42)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"\n              Cedar Peak Stone Chalet\n            "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"\n              6 guests \u00b7 3 beds \u00b7 Heated Jacuzzi\n            "}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between bg-surface-container-low/40 -mx-4 -mb-4 px-4 py-3"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-primary"}>{"$220"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"} href={"/properties/cedar-peak"}>{"\n              Check Dates\n            "}</Link>
</div>
</div>
</article>

<article className={"property-card flex flex-col bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"} data-category={"coastal"} data-id={"fav-3"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Chic coastal chalet in Batroun with private sun loungers, direct access to clear azure waters, whitewashed patio, and shaded outdoor Mediterranean barbecue grill"} src={"/images/cc7063e3aa92819c.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold shadow-xs flex items-center gap-1"}>
<Icon name="verified" className="material-symbols-outlined text-primary text-[14px]" />{"\n              Superhost\n            "}</span>
<FavoriteButton id={"cedar-peak"} />
</div>
<div className={"absolute bottom-3 left-3 flex items-center gap-1.5"}>
<span className={"px-2 py-0.5 rounded-full bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption font-medium flex items-center gap-1"}>
<Icon name="bolt" className="material-symbols-outlined text-[13px] text-secondary-fixed" />{"\n              24/7 Power\n            "}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-semibold uppercase tracking-wider text-secondary"}>{"Batroun Seaside"}</span>
<div className={"flex items-center gap-1 text-on-surface font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.97"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(44)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"\n              Azure Horizon Waterfront Chalet\n            "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"\n              5 guests \u00b7 3 beds \u00b7 Poolside Grill\n            "}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between bg-surface-container-low/40 -mx-4 -mb-4 px-4 py-3"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-primary"}>{"$310"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"} href={"/properties/cedar-peak"}>{"\n              Check Dates\n            "}</Link>
</div>
</div>
</article>

<article className={"property-card flex flex-col bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"} data-category={"mountain"} data-id={"fav-4"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Architectural modern villa in Faqra Club Lebanon built with dark basalt and glass, cantilevering over limestone cliffs with heated infinity pool reflecting misty mountain ridges"} src={"/images/f53376837ee8e65c.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold shadow-xs flex items-center gap-1"}>
<Icon name="verified" className="material-symbols-outlined text-primary text-[14px]" />{"\n              Verified Host\n            "}</span>
<FavoriteButton id={"cedar-peak"} />
</div>
<div className={"absolute bottom-3 left-3 flex items-center gap-1.5"}>
<span className={"px-2 py-0.5 rounded-full bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-caption text-caption font-medium flex items-center gap-1"}>
<Icon name="pool" className="material-symbols-outlined text-[13px] text-secondary-fixed" />{"\n              Heated Infinity Pool\n            "}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-semibold uppercase tracking-wider text-secondary"}>{"Faqra Club, Mount Lebanon"}</span>
<div className={"flex items-center gap-1 text-on-surface font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.98"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(56)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"\n              Faqra Modern Glass Villa\n            "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"\n              8 guests \u00b7 4 beds \u00b7 24/7 Solar\n            "}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between bg-surface-container-low/40 -mx-4 -mb-4 px-4 py-3"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-primary"}>{"$340"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"} href={"/properties/cedar-peak"}>{"\n              Check Dates\n            "}</Link>
</div>
</div>
</article>
</div>

<div className={"relative overflow-hidden rounded-xl bg-surface-container-low p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"}>
<div className={"absolute -right-12 -top-12 w-64 h-64 rounded-full bg-secondary-fixed/20 pointer-events-none blur-2xl"}></div>
<div className={"flex items-start gap-4 z-10"}>
<div className={"w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm"}>
<Icon name="electric_meter" className="material-symbols-outlined text-[26px]" />
</div>
<div className={"space-y-1"}>
<div className={"flex items-center gap-2"}>
<span className={"font-title-md text-title-md font-semibold text-on-surface"}>{"Peak Demand Alert"}</span>
<span className={"px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold"}>{"Seasonal Trend"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>{"\n            Dates looking popular for autumn & ski season. Lock in verified chalets with 24/7 solar power, high-output backup heating, and flexible 48-hour cancellation.\n          "}</p>
</div>
</div>
<div className={"flex items-center gap-3 w-full md:w-auto z-10"}>
<ActionButton className={"w-full md:w-auto px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors whitespace-nowrap shadow-xs"} actionLabel={"View Autumn Calendar"} aria-label={"View Autumn Calendar"}>{"\n          View Autumn Calendar\n        "}</ActionButton>
</div>
</div>

<div className={"pt-6 space-y-4"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-2"}>
<Icon name="visibility" className="material-symbols-outlined text-outline text-[20px]" />
<span className={"font-caption text-caption font-semibold uppercase tracking-wider text-outline"}>{"Interactive UI Preview"}</span>
</div>
<ActionButton className={"font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"} actionLabel={"sync_alt Simulate Zero Favorites State"} aria-label={"sync_alt Simulate Zero Favorites State"} hint={"toggleEmptyStateSimulation()"}>
<Icon name="sync_alt" className="material-symbols-outlined text-[16px]" />
<span id={"toggle-sim-label"}>{"Simulate Zero Favorites State"}</span>
</ActionButton>
</div>

<div className={"hidden flex-col items-center justify-center text-center p-12 sm:p-16 rounded-xl bg-surface-container-lowest shadow-sm"} id={"empty-state-panel"}>
<div className={"relative w-24 h-24 mb-6 flex items-center justify-center"}>
<div className={"absolute inset-0 rounded-full bg-surface-container-low scale-110"}></div>
<div className={"w-16 h-16 rounded-full bg-surface-container flex items-center justify-center z-10 text-outline"}>
<Icon name="favorite_border" className="material-symbols-outlined text-[36px]" />
</div>
</div>
<h3 className={"font-headline-md text-headline-md text-on-surface font-semibold mb-2"}>{"No saved stays yet"}</h3>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-md mb-8"}>{"\n          Save chalets and furnished houses you like while browsing StayLeb. Your saved getaways will stay synced here for effortless comparison and group sharing.\n        "}</p>
<div className={"flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"}>
<Link className={"w-full sm:w-auto px-6 py-3 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-xs flex items-center justify-center gap-2"} href={"/search"}>
<Icon name="explore" className="material-symbols-outlined text-[20px]" />{"\n            Discover Properties\n          "}</Link>
<ActionButton className={"w-full sm:w-auto px-6 py-3 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold hover:bg-tertiary-fixed-dim transition-all shadow-xs flex items-center justify-center gap-2"} actionLabel={"auto_awesome Try AI Smart Search"} aria-label={"auto_awesome Try AI Smart Search"}>
<Icon name="auto_awesome" className="material-symbols-outlined text-[20px] text-tertiary" />{"\n            Try AI Smart Search\n          "}</ActionButton>
</div>
</div>
</div>
</div>

</div></main>
</>; }
