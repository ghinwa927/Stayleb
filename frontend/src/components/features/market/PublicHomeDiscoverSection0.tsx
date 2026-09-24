import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ActionButton } from "@/components/ui/Interactions";

export function PublicHomeDiscoverSection0() { return <>
<div className={"w-full bg-background flex flex-col"}>

<section className={"relative w-full pt-10 pb-12 lg:pb-16 px-margin md:px-margin-md lg:px-margin-lg bg-surface-container-low overflow-hidden"}><div className={"absolute -top-24 right-0 w-[580px] h-[580px] rounded-full bg-secondary-container/40 blur-3xl pointer-events-none -z-0"}></div><div className={"absolute top-48 -left-20 w-[420px] h-[420px] rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none -z-0"}></div><div className={"relative max-w-4xl mx-auto z-10 flex flex-col items-center text-center"}><div className={"inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container-lowest shadow-sm mb-space-sm animate-fade-in"}><Icon name="verified" className="material-symbols-outlined text-primary text-[18px]" /><span className={"font-label-sm text-label-sm text-on-surface font-semibold tracking-wide"}>{"100% Curated & Verified Lebanese Properties"}</span></div><h1 className={"font-display text-display text-on-surface tracking-tight mb-space-xs"}><span className={"block"}>{"Find your perfect stay"}</span><span className={"text-primary block"}>{"across Lebanon"}</span></h1><p className={"font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-space-md"}>{"Discover handpicked chalets and furnished homes from the Mediterranean coast to alpine peaks. Book instantly or reserve with Cash on Arrival."}</p><div className={"w-full bg-surface-container-lowest p-space-md rounded-[24px] shadow-xl text-left border border-surface-container"}><div className={"grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center"}><div className={"md:col-span-4 flex flex-col"}><label className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-bold mb-space-xxs"}>{"Destination"}</label><div className={"relative flex items-center"}><Icon name="location_on" className="material-symbols-outlined absolute left-3 text-primary text-[20px]" /><input className={"w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-inner"} id={"searchLocation"} placeholder={"Cedars, Batroun, Faqra..."} type={"text"} name={"searchLocation"} defaultValue={"Faraya, Mount Lebanon"} aria-label={"Cedars, Batroun, Faqra..."} /></div></div><div className={"md:col-span-3 flex flex-col"}><label className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-bold mb-space-xxs"}>{"Dates"}</label><ActionButton className={"w-full h-11 px-space-sm rounded-lg bg-surface-container-low flex items-center justify-between text-left hover:bg-surface-container-high transition-colors"} type={"button"} actionLabel={"calendar_todayJul 18 \u2013 235n"} aria-label={"calendar_todayJul 18 \u2013 235n"}><div className={"flex items-center gap-space-xs truncate"}><Icon name="calendar_today" className="material-symbols-outlined text-primary text-[18px]" /><span className={"font-label-md text-label-md text-on-surface truncate"}>{"Jul 18 \u2013 23"}</span></div><span className={"font-caption text-caption bg-surface-container-lowest px-space-xxs py-0.5 rounded text-on-surface-variant font-semibold"}>{"5n"}</span></ActionButton></div><div className={"md:col-span-2 flex flex-col"}><label className={"font-caption text-caption uppercase tracking-wider text-on-surface-variant font-bold mb-space-xxs"}>{"Guests"}</label><ActionButton className={"w-full h-11 px-space-sm rounded-lg bg-surface-container-low flex items-center justify-between text-left hover:bg-surface-container-high transition-colors"} type={"button"} actionLabel={"group4expand_more"} aria-label={"group4expand_more"}><div className={"flex items-center gap-space-xs"}><Icon name="group" className="material-symbols-outlined text-primary text-[18px]" /><span className={"font-label-md text-label-md text-on-surface"}>{"4"}</span></div><Icon name="expand_more" className="material-symbols-outlined text-outline text-[16px]" /></ActionButton></div><div className={"md:col-span-3 flex items-end pt-2 md:pt-0"}><Link className={"w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"} href={"/search"}><Icon name="search" className="material-symbols-outlined text-[20px]" /><span className={""}>{"Search Stays"}</span></Link></div></div></div><div className={"w-full max-w-2xl mx-auto mt-space-sm p-space-xs md:px-space-sm md:py-space-xs rounded-xl bg-surface-container-lowest/80 border border-surface-container shadow-sm flex flex-wrap items-center justify-between gap-space-xs"}><div className={"flex items-center gap-space-xs truncate max-w-md"}><Icon name="auto_awesome" className="material-symbols-outlined text-tertiary text-[18px]" /><span className={"font-caption text-caption uppercase tracking-wider font-bold text-tertiary"}>{"Ask StayLeb AI:"}</span><span className={"font-body-md text-body-md text-on-surface truncate"}>{"\u201cStone chalet in Faraya with private jacuzzi\u201d"}</span></div><Link className={"px-space-sm py-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold hover:bg-tertiary hover:text-on-tertiary shadow-sm transition-all flex items-center gap-1 shrink-0"} href={"/ai-search"}><Icon name="magic_button" className="material-symbols-outlined text-[14px]" /><span className={""}>{"Try Prompt"}</span></Link></div><div className={"flex flex-wrap items-center justify-center gap-space-md mt-space-md text-on-surface-variant font-label-sm text-label-sm"}><div className={"flex items-center gap-space-xxs"}><Icon name="payments" className="material-symbols-outlined text-primary text-[18px]" /><span className={""}>{"Cash on Arrival or Card"}</span></div><div className={"flex items-center gap-space-xxs"}><Icon name="cottage" className="material-symbols-outlined text-primary text-[18px]" /><span className={""}>{"Authentic Stone Architecture"}</span></div><div className={"flex items-center gap-space-xxs"}><Icon name="support_agent" className="material-symbols-outlined text-primary text-[18px]" /><span className={""}>{"24/7 Local Host Assistance"}</span></div></div></div></section>

<section className={"w-full py-space-md px-margin md:px-margin-md lg:px-margin-lg bg-surface-container-lowest shadow-sm border-y border-surface-container"}>
<div className={"max-w-7xl mx-auto flex items-center justify-between gap-space-sm overflow-x-auto pb-1 no-scrollbar"}>
<div className={"flex items-center gap-space-xs"}>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm shrink-0 flex items-center gap-space-xs"} actionLabel={"villa All Regions"} aria-label={"villa All Regions"}>
<Icon name="villa" className="material-symbols-outlined text-[18px]" />
<span className={""}>{"All Regions"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors shrink-0 flex items-center gap-space-xs"} actionLabel={"downhill_skiing Faraya Mountain"} aria-label={"downhill_skiing Faraya Mountain"}>
<Icon name="downhill_skiing" className="material-symbols-outlined text-[18px] text-primary" />
<span className={""}>{"Faraya Mountain"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors shrink-0 flex items-center gap-space-xs"} actionLabel={"cabin Faqra Chalets"} aria-label={"cabin Faqra Chalets"}>
<Icon name="cabin" className="material-symbols-outlined text-[18px] text-primary" />
<span className={""}>{"Faqra Chalets"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors shrink-0 flex items-center gap-space-xs"} actionLabel={"surfing Batroun Coast"} aria-label={"surfing Batroun Coast"}>
<Icon name="surfing" className="material-symbols-outlined text-[18px] text-primary" />
<span className={""}>{"Batroun Coast"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors shrink-0 flex items-center gap-space-xs"} actionLabel={"park Chouf Cedar Hills"} aria-label={"park Chouf Cedar Hills"}>
<Icon name="park" className="material-symbols-outlined text-[18px] text-primary" />
<span className={""}>{"Chouf Cedar Hills"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors shrink-0 flex items-center gap-space-xs"} actionLabel={"fort Byblos Shores"} aria-label={"fort Byblos Shores"}>
<Icon name="fort" className="material-symbols-outlined text-[18px] text-primary" />
<span className={""}>{"Byblos Shores"}</span>
</ActionButton>
<ActionButton className={"px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors shrink-0 flex items-center gap-space-xs"} actionLabel={"beach_access Sour Beach Houses"} aria-label={"beach_access Sour Beach Houses"}>
<Icon name="beach_access" className="material-symbols-outlined text-[18px] text-primary" />
<span className={""}>{"Sour Beach Houses"}</span>
</ActionButton>
</div>

<ActionButton className={"hidden lg:flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-dim font-label-md text-label-md text-on-surface transition-colors shrink-0"} actionLabel={"tune Filters (Pool, Jacuzzi, View)"} aria-label={"tune Filters (Pool, Jacuzzi, View)"}>
<Icon name="tune" className="material-symbols-outlined text-[18px]" />
<span className={""}>{"Filters (Pool, Jacuzzi, View)"}</span>
</ActionButton>
</div>
</section>

<section className={"max-w-7xl mx-auto w-full px-margin md:px-margin-md lg:px-margin-lg pt-space-xl pb-space-lg"}>
<div className={"flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-xs"}>
<div>
<div className={"flex items-center gap-space-xxs text-primary font-caption text-caption uppercase tracking-wider font-bold mb-space-xxs"}>
<span className={""}>{"High Altitude Getaways"}</span>
<Icon name="landscape" className="material-symbols-outlined text-[16px]" />
</div>
<h2 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"\n          Featured Mountain Chalets in Faraya & Faqra\n        "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant mt-space-xxs"}>{"\n          Stone hearths, mountain views, heated outdoor jacuzzi, and proximity to ski slopes.\n        "}</p>
</div>
<ActionButton className={"inline-flex items-center gap-space-xxs font-label-md text-label-md text-primary font-bold hover:underline shrink-0"} actionLabel={"Explore all 48 mountain retreats arrow_forward"} aria-label={"Explore all 48 mountain retreats arrow_forward"}>
<span className={""}>{"Explore all 48 mountain retreats"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg"}>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Authentic Lebanese stone chalet exterior in Faraya snow-capped mountains with warm chimney smoke, cedar wood detailing, outdoor wooden deck, crisp twilight alpine lighting in deep teal and warm amber tones, ultra-realistic luxury hospitality photography."} src={"/images/d449bb0512aa1291.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="local_fire_department" className="material-symbols-outlined text-primary text-[14px]" />
<span className={""}>{"Fireplace & Spa"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Faraya Mzaar, Lebanon\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.96"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(42)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Cedar Peak Stone Chalet\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"6 guests"}</span>{" \u2022 "}<span className={""}>{"3 beds"}</span>{" \u2022 "}<span className={""}>{"Heated Jacuzzi"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$220"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Modern alpine glass lodge in Faqra Club Lebanon with panoramic snow mountain view, minimalist stone interior, glowing fireplace, outdoor fire pit, luxury Lebanese mountain retreat architectural shot in daylight."} src={"/images/6e6d991dd82c4800.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="bolt" className="material-symbols-outlined text-secondary text-[14px]" />
<span className={""}>{"24/7 Power Solars"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Faqra Club, Lebanon\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.98"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(56)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Faqra Modern Glass Villa\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"8 guests"}</span>{" \u2022 "}<span className={""}>{"4 beds"}</span>{" \u2022 "}<span className={""}>{"Infinity Heated Pool"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$340"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Cozy ski-in ski-out timber lodge at Mzaar Lebanon ski slope with wooden beams, large French balcony overlooking ski lifts, snowy pine trees, golden hour soft sunlight reflecting on snowy slopes."} src={"/images/c4e47327f7f5e916.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="downhill_skiing" className="material-symbols-outlined text-primary text-[14px]" />
<span className={""}>{"Ski-in/Ski-out"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Mzaar Snowline, Kfardebian\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.91"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(29)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Mzaar Snowline Lodge\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"4 guests"}</span>{" \u2022 "}<span className={""}>{"2 beds"}</span>{" \u2022 "}<span className={""}>{"Slope Access"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$180"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Traditional Lebanese red-roofed stone chalet surrounded by Lebanese cedar and pine trees in Faraya, sunset light casting pink and ochre sky, stone patio with outdoor barbecue grill and dining setup."} src={"/images/2d9438527f6e6b41.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="local_florist" className="material-symbols-outlined text-tertiary text-[14px]" />
<span className={""}>{"Pine Forest"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Faraya Woods, Mount Lebanon\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.88"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(34)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Sunstone Pine Retreat\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"5 guests"}</span>{" \u2022 "}<span className={""}>{"2 beds"}</span>{" \u2022 "}<span className={""}>{"Private Garden"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$165"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>
</div>
</section>

<section className={"w-full bg-surface-container-low py-space-xl my-space-md"}><div className={"max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg"}><div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center"}><div className={"lg:col-span-5 flex flex-col"}><div className={"inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface-container-lowest text-primary font-caption text-caption uppercase tracking-wider font-bold mb-space-xs w-fit shadow-sm"}><Icon name="map" className="material-symbols-outlined text-[16px]" /><span className={""}>{"Explore On Map"}</span></div><h2 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs"}>{"From Mediterranean Shores to 2,000m Snowy Summits"}</h2><p className={"font-body-md text-body-md text-on-surface-variant mb-space-md"}>{"Lebanon's unique geography lets you ski the slopes of Mount Lebanon in the morning and swim in the warm waters of Batroun or Sour by sunset. Every chalet on StayLeb features guaranteed electricity backup and reliable high-speed Wi-Fi."}</p><div className={"grid grid-cols-3 gap-space-sm py-space-sm border-t border-surface-container"}><div className={"flex flex-col"}><span className={"font-headline-md text-headline-md text-primary font-bold"}>{"140+"}</span><span className={"font-caption text-caption text-on-surface-variant"}>{"Verified Chalets"}</span></div><div className={"flex flex-col"}><span className={"font-headline-md text-headline-md text-secondary font-bold"}>{"99.4%"}</span><span className={"font-caption text-caption text-on-surface-variant"}>{"Power Reliability"}</span></div><div className={"flex flex-col"}><span className={"font-headline-md text-headline-md text-primary font-bold"}>{"4.9/5"}</span><span className={"font-caption text-caption text-on-surface-variant"}>{"Guest Rating"}</span></div></div></div><div className={"lg:col-span-7"}><div className={"relative rounded-2xl overflow-hidden shadow-md border border-surface-container"}><LocalImage src={"/images/region-guide.svg"} alt={"Map of Lebanon with chalets across Faraya, Faqra, Batroun, Byblos, Chouf, and Cedars"} className={"w-full h-80 object-cover"} /><div className={"absolute bottom-4 left-4 right-4 bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-xl shadow-lg flex items-center justify-between"}><div className={"flex items-center gap-space-xs"}><Icon name="map" className="material-symbols-outlined text-primary text-[22px]" /><div><div className={"font-label-md text-label-md text-on-surface font-bold"}>{"Interactive Region Guide"}</div><div className={"font-caption text-caption text-on-surface-variant"}>{"Explore chalets by altitude, distance to beach, & amenities"}</div></div></div><ActionButton className={"px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-all shadow-sm"} actionLabel={"Open Map"} aria-label={"Open Map"} hint={"triggerSearchPulse()"}>{"Open Map"}</ActionButton></div></div></div></div></div></section>

<section className={"max-w-7xl mx-auto w-full px-margin md:px-margin-md lg:px-margin-lg pt-space-lg pb-space-xl"}>
<div className={"flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-xs"}>
<div>
<div className={"flex items-center gap-space-xxs text-secondary font-caption text-caption uppercase tracking-wider font-bold mb-space-xxs"}>
<span className={""}>{"Mediterranean Sunsets"}</span>
<Icon name="wb_sunny" className="material-symbols-outlined text-[16px]" />
</div>
<h2 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"\n          Coastal Escapes & Seafront Homes\n        "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant mt-space-xxs"}>{"\n          Handcrafted coastal homes in Batroun, Byblos, and Sour with direct sea access.\n        "}</p>
</div>
<ActionButton className={"inline-flex items-center gap-space-xxs font-label-md text-label-md text-primary font-bold hover:underline shrink-0"} actionLabel={"Explore all 64 coastal homes arrow_forward"} aria-label={"Explore all 64 coastal homes arrow_forward"}>
<span className={""}>{"Explore all 64 coastal homes"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg"}>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Luxury Mediterranean seafront villa in Batroun Lebanon with infinity swimming pool overlooking crystal turquoise waters, limestone sun deck, bougainvillea flowers, sunny bright afternoon lighting."} src={"/images/96f63bbb8a8d8a91.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="pool" className="material-symbols-outlined text-secondary text-[14px]" />
<span className={""}>{"Private Infinity Pool"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Batroun Old Coastline\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.99"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(68)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Batroun Sunset Seaside Villa\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"6 guests"}</span>{" \u2022 "}<span className={""}>{"3 beds"}</span>{" \u2022 "}<span className={""}>{"Sea Walk Access"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$275"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Historic vaulted stone heritage house in ancient Byblos Jbeil port with arched windows, traditional blue wooden shutters, view over the ancient Phoenician port, warm midday Mediterranean sunlight."} src={"/images/d904a60be042998b.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="history_edu" className="material-symbols-outlined text-primary text-[14px]" />
<span className={""}>{"Phoenician Heritage"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Byblos Port (Jbeil)\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.94"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(31)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Byblos Old Port Stone House\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"4 guests"}</span>{" \u2022 "}<span className={""}>{"2 beds"}</span>{" \u2022 "}<span className={""}>{"Historic Arches"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$195"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Charming sandy beach bungalow right on Tyre Sour coastline Lebanon with blue wooden pergola, white hammock, fine golden sand, turquoise clean calm water, sunny Mediterranean summer vibes."} src={"/images/5f4437f697c2418a.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="beach_access" className="material-symbols-outlined text-secondary text-[14px]" />
<span className={""}>{"Sandy Beachfront"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Sour (Tyre) Coast\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.89"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(27)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Sour White Sand Haven\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"5 guests"}</span>{" \u2022 "}<span className={""}>{"2 beds"}</span>{" \u2022 "}<span className={""}>{"Private Deck"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$150"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"}>
<div className={"relative w-full aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} data-alt={"Cliffside seaside bungalow in Amchit Lebanon surrounded by olive and lemon trees, private rock stairs leading directly to sea water, romantic sunset lighting, authentic Lebanese coast feeling."} src={"/images/c35dab55eabec218.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1 shadow-sm"}>
<Icon name="sailing" className="material-symbols-outlined text-primary text-[14px]" />
<span className={""}>{"Cliff Sea Access"}</span>
</div>
</div>
<div className={"p-space-md flex flex-col flex-1 justify-between"}>
<div>
<div className={"flex items-center justify-between mb-space-xxs"}>
<span className={"font-caption text-caption text-on-surface-variant font-medium flex items-center gap-1"}>
<Icon name="location_pin" className="material-symbols-outlined text-[14px] text-primary" />{"\n                Amchit Cliffs, Mount Lebanon\n              "}</span>
<div className={"flex items-center gap-0.5 font-label-sm text-label-sm text-on-surface font-bold"}>
<Icon name="star" className="material-symbols-outlined text-amber-500 text-[16px]" />
<span className={""}>{"4.92"}</span>
<span className={"font-caption text-caption text-on-surface-variant font-normal"}>{"(45)"}</span>
</div>
</div>
<h3 className={"font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors"}>{"\n              Amchit Seaside Bungalow\n            "}</h3>
<p className={"font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-2"}>
<span className={""}>{"3 guests"}</span>{" \u2022 "}<span className={""}>{"1 bed"}</span>{" \u2022 "}<span className={""}>{"Sunset Deck"}</span>
</p>
</div>
<div className={"pt-space-sm mt-space-sm border-t border-surface-container flex items-center justify-between"}>
<div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"}>{"$135"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"/ night"}</span>
</div>
<Link className={"px-space-sm py-space-xxs rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all"} href={"/market/book/cedar-peak"}>{"\n              Instant Book\n            "}</Link>
</div>
</div>
</div>
</div>
</section>

<section className={"max-w-7xl mx-auto w-full px-margin md:px-margin-md lg:px-margin-lg pb-space-xl"}>
<div className={"bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary p-space-lg md:p-space-xl rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-lg"}>
<div className={"max-w-2xl"}>
<div className={"flex items-center gap-space-xs mb-space-xxs text-secondary-container"}>
<Icon name="handshake" className="material-symbols-outlined" />
<span className={"font-label-sm text-label-sm font-bold uppercase tracking-wider"}>{"Ahlan Wa Sahlan"}</span>
</div>
<h3 className={"font-headline-lg text-headline-lg font-bold tracking-tight mb-space-xs text-on-primary"}>{"\n          Lebanese Hospitality, Standardized for Peace of Mind\n        "}</h3>
<p className={"font-body-md text-body-md text-on-primary-container"}>{"\n          Experience world-renowned Lebanese generosity without the unpredictability. Every booking comes with verified host identity, guaranteed power backup schedule, fresh bedding, and crystal-clear cancellation policies.\n        "}</p>
</div>
<div className={"flex flex-col sm:flex-row items-center gap-space-sm shrink-0 w-full md:w-auto"}>
<Link className={"w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-surface-container-high transition-all shadow-md"} href={"/auth/register/owner"}>{"\n          Become a StayLeb Host\n        "}</Link>
<Link className={"w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-primary/40 hover:bg-primary/60 text-on-primary font-label-md text-label-md font-bold transition-all"} href={"/auth/login"}>{"\n          Member Sign In\n        "}</Link>
</div>
</div>
</section>

<div className={"fixed inset-0 z-50 bg-inverse-surface/50 backdrop-blur-sm hidden items-center justify-center p-space-md"} id={"authDemoModal"}>
<div className={"bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-2xl p-space-lg flex flex-col relative animate-scale-up"}>
<ActionButton className={"absolute top-4 right-4 text-outline hover:text-on-surface"} actionLabel={"close"} aria-label={"close"} hint={"closeAuthModal()"}>
<Icon name="close" className="material-symbols-outlined text-[20px]" />
</ActionButton>
<div className={"flex items-center gap-space-xs mb-space-xs"}>
<div className={"w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center"}>
<Icon name="lock" className="material-symbols-outlined text-[22px]" />
</div>
<div>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"} id={"authModalTitle"}>{"Sign In to Continue"}</h4>
<p className={"font-caption text-caption text-on-surface-variant"}>{"StayLeb Verified Booking Portal"}</p>
</div>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant mb-space-md"} id={"authModalDescription"}>{"\n        Create an account or log in to secure your reservation, message verified Lebanese hosts, or save your favorite retreats.\n      "}</p>
<div className={"flex flex-col gap-space-xs mb-space-md"}>
<ActionButton className={"w-full h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs transition-colors"} actionLabel={"Continue with Google"} aria-label={"Continue with Google"}>
<svg className={"w-5 h-5"} viewBox={"0 0 24 24"}>
<path d={"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"} fill={"#4285F4"}></path>
<path d={"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"} fill={"#34A853"}></path>
<path d={"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"} fill={"#FBBC05"}></path>
<path d={"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"} fill={"#EA4335"}></path>
</svg>
<span className={""}>{"Continue with Google"}</span>
</ActionButton>
<ActionButton className={"w-full h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs transition-colors"} actionLabel={"mail Continue with Email"} aria-label={"mail Continue with Email"}>
<Icon name="mail" className="material-symbols-outlined text-[20px]" />
<span className={""}>{"Continue with Email"}</span>
</ActionButton>
</div>
<div className={"text-center font-caption text-caption text-on-surface-variant"}>
<span className={""}>{"By proceeding, you agree to StayLeb\u2019s Terms and Lebanon Guest Protection Policy."}</span>
</div>
</div>
</div>

<div className={"fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl transform translate-y-24 opacity-0 transition-all duration-300 flex items-center gap-space-xs font-label-md text-label-md pointer-events-none"} id={"stayToast"}>
<Icon name="check_circle" className="material-symbols-outlined text-secondary-fixed text-[20px]" />
<span id={"toastMessage"} className={""}>{"Action completed"}</span>
</div>
</div>
</>; }
