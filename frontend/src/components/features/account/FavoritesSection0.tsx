import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";

export function FavoritesSection0() { return <>
<main className={"w-full min-h-screen bg-[#f8f9ff] flex flex-col"}><div className={"flex flex-col w-full"}>

<div className={"max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8"}>

<div className={"space-y-3 pb-2"}>
<div className={"flex items-center gap-2"}>
<span className={"px-3 py-1 rounded-full bg-[#157375]/10 text-[#157375] font-label-sm text-label-sm font-semibold border border-[#157375]/15"}>{"Saved Collections"}</span>
<span className={"w-1 h-1 rounded-full bg-[#157375]/30"}></span>
<span className={"text-[#157375]/60 text-caption font-medium"}>{"Synced Across Devices"}</span>
</div>
<h1 className={"font-display text-[32px] md:text-[40px] font-bold tracking-tight text-[#157375]"}>{"Favorites"}</h1>
<p className={"font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed"}>
<span id={"saved-count"} className={"font-semibold text-[#157375]"}>{"4"}</span>{" saved chalets and furnished houses across Lebanon. Check live availability and book directly."}</p>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"} id={"favorites-grid"}>

<article className={"group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_32px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1"} data-category={"coastal"} data-id={"fav-1"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"} data-alt={"Batroun seaside modern limestone villa with private infinity pool"} src={"/images/1c19d7f467a0af3f.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#157375] font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5"}>
<Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />{"Verified Host"}</span>
<div className={"pointer-events-auto"}><FavoriteButton id={"cedar-peak"} /></div>
</div>
<div className={"absolute bottom-3 left-3"}>
<span className={"px-2.5 py-1 rounded-full bg-[#157375] text-white font-caption text-caption font-semibold shadow-md flex items-center gap-1"}>
<Icon name="solar_power" className="material-symbols-outlined text-[13px] text-white" />{"Solar 24/7"}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-bold tracking-[0.08em] uppercase text-[#157375]/70"}>{"Batroun Old Coastline"}</span>
<div className={"flex items-center gap-1 text-[#157375] font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.99"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(68)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-[#157375] font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"Batroun Sunset Seaside Villa"}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"6 guests · 3 beds · Private Pool"}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between border-t border-surface-container-low"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-[#157375]"}>{"$275"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3.5 py-2 rounded-full bg-[#157375] text-white font-label-sm text-label-sm font-semibold hover:bg-[#0f5a5b] transition-colors shadow-sm"} href={"/properties/cedar-peak"}>{"Check Dates"}</Link>
</div>
</div>
</article>

<article className={"group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_32px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1"} data-category={"mountain"} data-id={"fav-2"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"} data-alt={"Traditional high-mountain Lebanese stone chalet in Faraya"} src={"/images/434360383b69d1de.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#157375] font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5"}>
<Icon name="downhill_skiing" className="material-symbols-outlined text-[#157375] text-[14px]" />{"Ski-in / Out"}</span>
<div className={"pointer-events-auto"}><FavoriteButton id={"cedar-peak"} /></div>
</div>
<div className={"absolute bottom-3 left-3"}>
<span className={"px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#157375] font-caption text-caption font-semibold shadow-sm flex items-center gap-1"}>
<Icon name="hot_tub" className="material-symbols-outlined text-[13px] text-[#157375]" />{"Heated Jacuzzi"}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-bold tracking-[0.08em] uppercase text-[#157375]/70"}>{"Faraya Mzaar"}</span>
<div className={"flex items-center gap-1 text-[#157375] font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.96"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(42)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-[#157375] font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"Cedar Peak Stone Chalet"}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"6 guests · 3 beds · Heated Jacuzzi"}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between border-t border-surface-container-low"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-[#157375]"}>{"$220"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3.5 py-2 rounded-full bg-[#157375] text-white font-label-sm text-label-sm font-semibold hover:bg-[#0f5a5b] transition-colors shadow-sm"} href={"/properties/cedar-peak"}>{"Check Dates"}</Link>
</div>
</div>
</article>

<article className={"group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_32px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1"} data-category={"coastal"} data-id={"fav-3"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"} data-alt={"Chic coastal chalet in Batroun"} src={"/images/cc7063e3aa92819c.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#157375] font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5"}>
<Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />{"Superhost"}</span>
<div className={"pointer-events-auto"}><FavoriteButton id={"cedar-peak"} /></div>
</div>
<div className={"absolute bottom-3 left-3"}>
<span className={"px-2.5 py-1 rounded-full bg-[#157375] text-white font-caption text-caption font-semibold shadow-md"}>{"24/7 Power"}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-bold tracking-[0.08em] uppercase text-[#157375]/70"}>{"Batroun Seaside"}</span>
<div className={"flex items-center gap-1 text-[#157375] font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.97"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(44)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-[#157375] font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"Azure Horizon Waterfront Chalet"}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"5 guests · 3 beds · Poolside Grill"}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between border-t border-surface-container-low"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-[#157375]"}>{"$310"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3.5 py-2 rounded-full bg-[#157375] text-white font-label-sm text-label-sm font-semibold hover:bg-[#0f5a5b] transition-colors shadow-sm"} href={"/properties/cedar-peak"}>{"Check Dates"}</Link>
</div>
</div>
</article>

<article className={"group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_2px_16px_rgba(17,28,45,0.06)] hover:shadow-[0_12px_32px_rgba(17,28,45,0.12)] border border-white transition-all duration-500 hover:-translate-y-1"} data-category={"mountain"} data-id={"fav-4"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"} data-alt={"Architectural modern villa in Faqra Club"} src={"/images/f53376837ee8e65c.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none"}>
<span className={"px-2.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#157375] font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5"}>
<Icon name="verified" className="material-symbols-outlined text-[#157375] text-[14px]" />{"Verified Host"}</span>
<div className={"pointer-events-auto"}><FavoriteButton id={"cedar-peak"} /></div>
</div>
<div className={"absolute bottom-3 left-3"}>
<span className={"px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#157375] font-caption text-caption font-semibold shadow-sm"}>{"Heated Infinity Pool"}</span>
</div>
</div>
<div className={"p-4 flex flex-col flex-1 justify-between gap-4"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center justify-between gap-2"}>
<span className={"font-caption text-caption font-bold tracking-[0.08em] uppercase text-[#157375]/70"}>{"Faqra Club, Mount Lebanon"}</span>
<div className={"flex items-center gap-1 text-[#157375] font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[15px]" />
<span>{"4.98"}</span>
<span className={"text-on-surface-variant font-normal"}>{"(56)"}</span>
</div>
</div>
<h2 className={"font-title-md text-title-md text-[#157375] font-semibold group-hover:text-primary transition-colors line-clamp-1"}>{"Faqra Modern Glass Villa"}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant line-clamp-1"}>{"8 guests · 4 beds · 24/7 Solar"}</p>
</div>
<div className={"pt-3 flex items-baseline justify-between border-t border-surface-container-low"}>
<div>
<span className={"font-headline-sm text-headline-sm font-bold text-[#157375]"}>{"$340"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{" / night"}</span>
</div>
<Link className={"px-3.5 py-2 rounded-full bg-[#157375] text-white font-label-sm text-label-sm font-semibold hover:bg-[#0f5a5b] transition-colors shadow-sm"} href={"/properties/cedar-peak"}>{"Check Dates"}</Link>
</div>
</div>
</article>
</div>

<div className={"pt-6 space-y-4"}>

<div className={"hidden flex-col items-center justify-center text-center p-10 sm:p-14 rounded-[20px] bg-white border border-surface-container-low shadow-[0_2px_16px_rgba(17,28,45,0.06)]"} id={"empty-state-panel"}>
<div className={"relative w-20 h-20 mb-5 flex items-center justify-center mx-auto"}>
<div className={"absolute inset-0 rounded-full bg-[#157375]/10"}></div>
<div className={"w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative"}>
<Icon name="favorite_border" className="material-symbols-outlined text-[28px] text-[#157375]" />
</div>
</div>
<h3 className={"font-headline-md text-headline-md text-[#157375] font-bold tracking-tight mb-2"}>{"No saved stays yet"}</h3>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed"}>{"Save chalets and furnished houses you like while browsing StayLeb. Your saved getaways will stay synced here for effortless comparison and group sharing."}</p>
<div className={"flex flex-col sm:flex-row items-center gap-3 justify-center"}>
<Link className={"w-full sm:w-auto px-6 py-3 rounded-full bg-[#157375] text-white font-label-md text-label-md font-semibold hover:bg-[#0f5a5b] transition-colors shadow-[0_4px_16px_rgba(21,115,117,0.25)] flex items-center justify-center gap-2"} href={"/search"}>
<Icon name="explore" className="material-symbols-outlined text-[18px]" />{"Discover Properties"}</Link>
<ActionButton className={"w-full sm:w-auto px-6 py-3 rounded-full bg-surface-container text-[#157375] font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"} actionLabel={"auto_awesome Try AI Smart Search"} aria-label={"auto_awesome Try AI Smart Search"}>
<Icon name="auto_awesome" className="material-symbols-outlined text-[18px]" />{"Try AI Smart Search"}</ActionButton>
</div>
</div>
</div>
</div>

</div></main>
</>; }
