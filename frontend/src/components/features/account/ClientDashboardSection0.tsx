import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { FavoriteButton } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";

export function ClientDashboardSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>



<div className={"max-w-[1280px] mx-auto w-full px-margin md:px-margin-md lg:px-margin-lg py-8 space-y-10"}>

<section className={"space-y-6"}>
<div className={"space-y-1"}>
<h1 className={"text-headline-lg font-headline-lg text-on-surface tracking-tight"}>{"\n          Welcome back, Maya\n        "}</h1>
<p className={"text-body-lg font-body-lg text-on-surface-variant"}>{"\n          Ready to find your next stay in Lebanon? Browse verified chalets and mountain retreats.\n        "}</p>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm p-2 sm:p-3 space-y-3"}>
<div className={"grid grid-cols-1 md:grid-cols-12 gap-2 items-center"}>

<div className={"md:col-span-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"}>
<Icon name="location_on" className="material-symbols-outlined text-primary-container text-[22px]" />
<div className={"flex flex-col min-w-0"}>
<span className={"text-caption font-caption text-outline font-semibold uppercase tracking-wider"}>{"Destination"}</span>
<input className={"bg-transparent text-body-md font-body-md text-on-surface focus:outline-none placeholder-outline truncate font-medium"} placeholder={"Where to? Batroun, Faraya, Chouf..."} type={"text"} name={"where-to?-batroun,-faraya,-chouf..."} defaultValue={"Batroun, Faraya, Chouf"} aria-label={"Where to? Batroun, Faraya, Chouf..."} />
</div>
</div>

<div className={"md:col-span-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"}>
<Icon name="calendar_month" className="material-symbols-outlined text-primary-container text-[22px]" />
<div className={"flex flex-col min-w-0"}>
<span className={"text-caption font-caption text-outline font-semibold uppercase tracking-wider"}>{"Dates"}</span>
<span className={"text-body-md font-body-md text-on-surface font-medium truncate"}>{"Oct 12 \u2013 Oct 15, 2024"}</span>
</div>
</div>

<div className={"md:col-span-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"}>
<div className={"flex-1 flex items-center gap-2.5 px-3 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"}>
<Icon name="group" className="material-symbols-outlined text-primary-container text-[20px]" />
<div className={"flex flex-col min-w-0"}>
<span className={"text-caption font-caption text-outline font-semibold uppercase tracking-wider"}>{"Guests"}</span>
<span className={"text-body-md font-body-md text-on-surface font-medium truncate"}>{"4 Guests"}</span>
</div>
</div>
<Link className={"h-12 sm:h-auto sm:self-stretch px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98]"} href={"/search"}>
<Icon name="search" className="material-symbols-outlined text-[18px]" />
<span className={"whitespace-nowrap font-medium"}>{"Search Stays"}</span>
</Link>
</div>
</div>

<div className={"pt-2 px-2 flex flex-wrap items-center gap-3"}>
<div className={"flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm font-semibold"}>
<Icon name="auto_awesome" className="material-symbols-outlined text-[16px] text-tertiary" />
<span>{"AI Smart Search"}</span>
</div>
<ActionButton className={"text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors text-left flex items-center gap-2 group"} actionLabel={"Try: \"Secluded mountain stone chalet in Faqra with heated outdoor pool and fiber internet\" arrow_forward"} aria-label={"Try: \"Secluded mountain stone chalet in Faqra with heated outdoor pool and fiber internet\" arrow_forward"}>
<span className={"text-outline"}>{"Try:"}</span>
<span className={"italic underline decoration-dotted decoration-outline group-hover:decoration-primary"}>{"\"Secluded mountain stone chalet in Faqra with heated outdoor pool and fiber internet\""}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[14px] text-tertiary group-hover:translate-x-0.5 transition-transform" />
</ActionButton>
</div>
</div>
</section>

<section className={"bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"}>
<div className={"flex items-start md:items-center gap-4"}>
<div className={"w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0"}>
<Icon name="rate_review" className="material-symbols-outlined text-[24px]" />
</div>
<div className={"space-y-1"}>
<div className={"flex items-center gap-2 flex-wrap"}>
<h3 className={"text-title-md font-title-md text-on-surface"}>{"How was your recent stay in Batroun?"}</h3>
<span className={"px-2 py-0.5 rounded-md bg-surface-container text-caption font-caption text-on-surface-variant font-medium"}>{"Batroun Sunset Seaside Villa \u00b7 Sep 10, 2024"}</span>
</div>
<p className={"text-body-md font-body-md text-on-surface-variant max-w-2xl"}>{"\n            Share your authentic feedback on Cleanliness, Wi-Fi speed, 24/7 Solar power stability, and host hospitality to help Lebanese travelers.\n          "}</p>
</div>
</div>
<div className={"flex items-center gap-3 shrink-0"}>
<Link className={"px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all active:scale-[0.98]"} href={"/account/bookings/stay-001/review"}>{"\n          Write Review\n        "}</Link>
<ActionButton className={"px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors text-label-md font-label-md"} actionLabel={"Dismiss"} aria-label={"Dismiss"}>{"\n          Dismiss\n        "}</ActionButton>
</div>
</section>

<section className={"space-y-4"}>
<div className={"flex items-center justify-between"}>
<h2 className={"text-headline-md font-headline-md text-on-surface"}>{"Your Active Bookings"}</h2>
<ActionButton className={"text-label-md font-label-md text-primary-container font-semibold hover:underline flex items-center gap-1"} actionLabel={"All Trips (4) chevron_right"} aria-label={"All Trips (4) chevron_right"}>
<span>{"All Trips (4)"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[16px]" />
</ActionButton>
</div>
<div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>

<article className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row transition-shadow hover:shadow-md"}>
<div className={"sm:w-2/5 relative h-52 sm:h-auto shrink-0"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Cedar Peak Stone Chalet in Faraya Mount Lebanon surrounded by pine trees and limestone cliffs with high altitude view in warm afternoon daylight."} src={"/images/cc398eaf524c9007.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3"}>
<RecordStatus className={"px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-label-sm font-label-sm font-semibold flex items-center gap-1 shadow-sm"} initial={"Confirmed"}></RecordStatus>
</div>
<div className={"absolute bottom-3 left-3 bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface text-caption font-caption px-2 py-0.5 rounded"}>{"\n              High Altitude (1,850m)\n            "}</div>
</div>
<div className={"p-5 flex-1 flex flex-col justify-between space-y-4"}>
<div className={"space-y-2"}>
<div className={"flex items-start justify-between gap-2"}>
<div>
<span className={"text-caption font-caption text-primary-container font-semibold uppercase tracking-wider"}>{"Upcoming Stay"}</span>
<h3 className={"text-title-md font-title-md text-on-surface font-semibold line-clamp-1"}>{"Cedar Peak Stone Chalet"}</h3>
</div>
</div>
<div className={"space-y-1.5 text-body-md font-body-md text-on-surface-variant"}>
<div className={"flex items-center gap-2"}>
<Icon name="location_on" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"truncate"}>{"Faraya Mzaar, Mount Lebanon"}</span>
</div>
<div className={"flex items-center gap-2"}>
<Icon name="calendar_today" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium text-on-surface"}>{"Sep 25 \u2013 Sep 28, 2024 \u00b7 3 nights"}</span>
</div>
<div className={"flex items-center gap-2"}>
<Icon name="group" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"4 Guests (2 adults, 2 kids)"}</span>
</div>
</div>
</div>
<div className={"pt-3 flex items-center justify-between gap-3"}>
<div className={"flex flex-col"}>
<span className={"text-caption font-caption text-outline"}>{"Payment Status"}</span>
<span className={"text-label-sm font-label-sm font-medium text-on-surface flex items-center gap-1"}>
<Icon name="credit_card" className="material-symbols-outlined text-[14px] text-emerald-700" />{"\n                  Paid Online ($620)\n                "}</span>
</div>
<Link className={"px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all"} href={"/account/bookings/stay-001"}>{"\n                View Booking Details\n              "}</Link>
</div>
</div>
</article>

<article className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row transition-shadow hover:shadow-md"}>
<div className={"sm:w-2/5 relative h-52 sm:h-auto shrink-0"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Sour sandy beachfront bungalow with Mediterranean sea view, wooden deck, palm shadows, and warm coastal sun in South Lebanon."} src={"/images/9b564abf5a215b52.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3"}>
<span className={"px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-label-sm font-label-sm font-semibold flex items-center gap-1 shadow-sm"}>
<span className={"w-2 h-2 rounded-full bg-amber-600 animate-pulse"}></span>{"\n                Pending Approval\n              "}</span>
</div>
<div className={"absolute bottom-3 left-3 bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface text-caption font-caption px-2 py-0.5 rounded"}>{"\n              Direct Coastline\n            "}</div>
</div>
<div className={"p-5 flex-1 flex flex-col justify-between space-y-4"}>
<div className={"space-y-2"}>
<div>
<span className={"text-caption font-caption text-amber-800 font-semibold uppercase tracking-wider"}>{"Awaiting Host"}</span>
<h3 className={"text-title-md font-title-md text-on-surface font-semibold line-clamp-1"}>{"Sour Sandy Beachfront Bungalow"}</h3>
</div>
<div className={"space-y-1.5 text-body-md font-body-md text-on-surface-variant"}>
<div className={"flex items-center gap-2"}>
<Icon name="location_on" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"truncate"}>{"Al Jamous Coast, Sour (Tyre)"}</span>
</div>
<div className={"flex items-center gap-2"}>
<Icon name="calendar_today" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium text-on-surface"}>{"Oct 18 \u2013 Oct 21, 2024 \u00b7 3 nights"}</span>
</div>
<div className={"flex items-center gap-2"}>
<Icon name="group" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"5 Guests"}</span>
</div>
</div>
<div className={"p-2.5 rounded-xl bg-amber-50/70 text-on-surface text-caption font-caption leading-relaxed flex items-start gap-2"}>
<Icon name="schedule" className="material-symbols-outlined text-[16px] text-amber-800 shrink-0 mt-0.5" />
<span>{"Waiting for owner approval. Requested dates are temporarily on hold for you."}</span>
</div>
</div>
<div className={"pt-2 flex items-center justify-between gap-3"}>
<div className={"flex flex-col"}>
<span className={"text-caption font-caption text-outline"}>{"Selected Payment"}</span>
<span className={"text-label-sm font-label-sm font-medium text-on-surface flex items-center gap-1"}>
<Icon name="payments" className="material-symbols-outlined text-[14px] text-amber-800" />{"\n                  Cash on Arrival ($480)\n                "}</span>
</div>
<Link className={"px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all"} href={"/account/bookings/stay-002/pending"}>{"\n                View Request\n              "}</Link>
</div>
</div>
</article>
</div>
</section>

<section className={"space-y-5"}>
<div className={"flex items-center justify-between"}>
<div>
<h2 className={"text-headline-md font-headline-md text-on-surface"}>{"Your Saved Properties"}</h2>
<p className={"text-body-md font-body-md text-on-surface-variant"}>{"Chalets and seaside villas you have favorited"}</p>
</div>
<ActionButton className={"text-label-md font-label-md text-primary-container font-semibold hover:underline flex items-center gap-1"} actionLabel={"View All Favorites (3) chevron_right"} aria-label={"View All Favorites (3) chevron_right"}>
<span>{"View All Favorites (3)"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[16px]" />
</ActionButton>
</div>
<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"}>
<div className={"relative aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"} data-alt={"Traditional Lebanese stone guest house in Chouf Deir El Qamar with arched windows, red clay roof tiles, and cedar forest background."} src={"/images/4836917668dc6a0b.jpg"} alt={"Lebanese holiday home"} />
<FavoriteButton id={"cedar-peak"} />
<div className={"absolute bottom-3 left-3 flex gap-1.5"}>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"24/7 Solar Backup"}</span>
</div>
</div>
<div className={"p-4 flex-1 flex flex-col justify-between space-y-3"}>
<div>
<div className={"flex items-center justify-between text-body-md font-body-md mb-1"}>
<span className={"text-outline text-caption font-caption uppercase tracking-wider"}>{"Deir El Qamar, Chouf"}</span>
<div className={"flex items-center gap-1 text-emerald-800 font-semibold text-label-sm font-label-sm"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-emerald-700" />
<span>{"4.96"}</span>
<span className={"text-outline font-normal"}>{"(42)"}</span>
</div>
</div>
<h4 className={"text-title-md font-title-md text-on-surface font-semibold"}>{"Chouf Heritage Cedar Villa"}</h4>
<p className={"text-body-md font-body-md text-on-surface-variant line-clamp-1 mt-0.5"}>{"Private heated plunge pool \u00b7 Fiber Wi-Fi \u00b7 Mountain valley view"}</p>
</div>
<div className={"pt-2 flex items-baseline justify-between"}>
<div>
<span className={"text-headline-sm font-headline-sm text-primary-container font-bold"}>{"$220"}</span>
<span className={"text-body-md font-body-md text-outline"}>{" / night"}</span>
</div>
<span className={"text-label-sm font-label-sm text-emerald-800 font-medium"}>{"Instant Book"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"}>
<div className={"relative aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"} data-alt={"Modern cliffside villa in Kfaraabida Batroun with infinity pool overlooking the blue Mediterranean sea under summer sky."} src={"/images/c302edbaac2bc227.jpg"} alt={"Lebanese holiday home"} />
<FavoriteButton id={"cedar-peak"} />
<div className={"absolute bottom-3 left-3 flex gap-1.5"}>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"Sea View"}</span>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"Infinity Pool"}</span>
</div>
</div>
<div className={"p-4 flex-1 flex flex-col justify-between space-y-3"}>
<div>
<div className={"flex items-center justify-between text-body-md font-body-md mb-1"}>
<span className={"text-outline text-caption font-caption uppercase tracking-wider"}>{"Kfar Aabida, Batroun"}</span>
<div className={"flex items-center gap-1 text-emerald-800 font-semibold text-label-sm font-label-sm"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-emerald-700" />
<span>{"4.91"}</span>
<span className={"text-outline font-normal"}>{"(68)"}</span>
</div>
</div>
<h4 className={"text-title-md font-title-md text-on-surface font-semibold"}>{"The Mediterranean Cove Lodge"}</h4>
<p className={"text-body-md font-body-md text-on-surface-variant line-clamp-1 mt-0.5"}>{"Private cove access \u00b7 24/7 Power \u00b7 Sunset cocktail patio"}</p>
</div>
<div className={"pt-2 flex items-baseline justify-between"}>
<div>
<span className={"text-headline-sm font-headline-sm text-primary-container font-bold"}>{"$310"}</span>
<span className={"text-body-md font-body-md text-outline"}>{" / night"}</span>
</div>
<span className={"text-label-sm font-label-sm text-on-surface-variant"}>{"Verified Host"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"}>
<div className={"relative aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"} data-alt={"Rustic modern wooden alpine cabin in Zaarour Mount Lebanon with outdoor stone firepit surrounded by snow peak horizon."} src={"/images/269b57d3c630c5ad.jpg"} alt={"Lebanese holiday home"} />
<FavoriteButton id={"cedar-peak"} />
<div className={"absolute bottom-3 left-3 flex gap-1.5"}>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"Indoor Fireplace"}</span>
</div>
</div>
<div className={"p-4 flex-1 flex flex-col justify-between space-y-3"}>
<div>
<div className={"flex items-center justify-between text-body-md font-body-md mb-1"}>
<span className={"text-outline text-caption font-caption uppercase tracking-wider"}>{"Zaarour, Metn"}</span>
<div className={"flex items-center gap-1 text-emerald-800 font-semibold text-label-sm font-label-sm"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-emerald-700" />
<span>{"4.88"}</span>
<span className={"text-outline font-normal"}>{"(19)"}</span>
</div>
</div>
<h4 className={"text-title-md font-title-md text-on-surface font-semibold"}>{"Zaarour Peak Chalet & Spa"}</h4>
<p className={"text-body-md font-body-md text-on-surface-variant line-clamp-1 mt-0.5"}>{"Wood-burning stove \u00b7 Jacuzzi \u00b7 Fiber connection"}</p>
</div>
<div className={"pt-2 flex items-baseline justify-between"}>
<div>
<span className={"text-headline-sm font-headline-sm text-primary-container font-bold"}>{"$185"}</span>
<span className={"text-body-md font-body-md text-outline"}>{" / night"}</span>
</div>
<span className={"text-label-sm font-label-sm text-emerald-800 font-medium"}>{"Instant Book"}</span>
</div>
</div>
</div>
</div>
</section>

<section className={"space-y-5"}>
<div className={"flex items-center justify-between"}>
<div>
<h2 className={"text-headline-md font-headline-md text-on-surface"}>{"Explore More Authentic Stays"}</h2>
<p className={"text-body-md font-body-md text-on-surface-variant"}>{"Hand-picked mountain & coastal retreats verified for summer & fall getaways"}</p>
</div>
<div className={"hidden sm:flex items-center gap-2"}>
<ActionButton className={"w-9 h-9 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"} actionLabel={"west"} aria-label={"west"}>
<Icon name="west" className="material-symbols-outlined text-[20px]" />
</ActionButton>
<ActionButton className={"w-9 h-9 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"} actionLabel={"east"} aria-label={"east"}>
<Icon name="east" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</div>
</div>
<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"}>
<div className={"relative aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"} data-alt={"Faqra modern glass villa with cantilever architecture, mountain mist, and surrounding limestone karst rocks in Mount Lebanon."} src={"/images/43cce5f48ddd0b09.jpg"} alt={"Lebanese holiday home"} />
<FavoriteButton id={"cedar-peak"} />
<div className={"absolute bottom-3 left-3 flex gap-1.5"}>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"Heated Pool"}</span>
</div>
</div>
<div className={"p-4 flex-1 flex flex-col justify-between space-y-3"}>
<div>
<div className={"flex items-center justify-between text-body-md font-body-md mb-1"}>
<span className={"text-outline text-caption font-caption uppercase tracking-wider"}>{"Faqra Club, Kfardebian"}</span>
<div className={"flex items-center gap-1 text-emerald-800 font-semibold text-label-sm font-label-sm"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-emerald-700" />
<span>{"4.98"}</span>
<span className={"text-outline font-normal"}>{"(53)"}</span>
</div>
</div>
<h4 className={"text-title-md font-title-md text-on-surface font-semibold"}>{"Faqra Modern Glass Villa"}</h4>
<p className={"text-body-md font-body-md text-on-surface-variant line-clamp-1 mt-0.5"}>{"Floor-to-ceiling glass \u00b7 24/7 Generator + Solar \u00b7 Ski-in access"}</p>
</div>
<div className={"pt-2 flex items-baseline justify-between"}>
<div>
<span className={"text-headline-sm font-headline-sm text-primary-container font-bold"}>{"$380"}</span>
<span className={"text-body-md font-body-md text-outline"}>{" / night"}</span>
</div>
<span className={"text-label-sm font-label-sm text-emerald-800 font-medium"}>{"Instant Book"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"}>
<div className={"relative aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"} data-alt={"Ancient sandstone townhouse interior in Byblos historic old port with wooden beamed ceilings and Phoenician port harbor view."} src={"/images/4f5a973835372748.jpg"} alt={"Lebanese holiday home"} />
<FavoriteButton id={"cedar-peak"} />
<div className={"absolute bottom-3 left-3 flex gap-1.5"}>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"Historic Quarter"}</span>
</div>
</div>
<div className={"p-4 flex-1 flex flex-col justify-between space-y-3"}>
<div>
<div className={"flex items-center justify-between text-body-md font-body-md mb-1"}>
<span className={"text-outline text-caption font-caption uppercase tracking-wider"}>{"Old Souk, Byblos (Jbeil)"}</span>
<div className={"flex items-center gap-1 text-emerald-800 font-semibold text-label-sm font-label-sm"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-emerald-700" />
<span>{"4.94"}</span>
<span className={"text-outline font-normal"}>{"(89)"}</span>
</div>
</div>
<h4 className={"text-title-md font-title-md text-on-surface font-semibold"}>{"Byblos Old Port Stone House"}</h4>
<p className={"text-body-md font-body-md text-on-surface-variant line-clamp-1 mt-0.5"}>{"Steps from citadel \u00b7 Restored 19th-century arches \u00b7 Full kitchen"}</p>
</div>
<div className={"pt-2 flex items-baseline justify-between"}>
<div>
<span className={"text-headline-sm font-headline-sm text-primary-container font-bold"}>{"$160"}</span>
<span className={"text-body-md font-body-md text-outline"}>{" / night"}</span>
</div>
<span className={"text-label-sm font-label-sm text-on-surface-variant"}>{"Superhost"}</span>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"}>
<div className={"relative aspect-[16/10] overflow-hidden bg-surface-container"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"} data-alt={"Traditional Lebanese coastal stone bungalow terrace overlooking the Mediterranean in Batroun with lemon trees and outdoor dining table."} src={"/images/d59edec0fccd41d1.jpg"} alt={"Lebanese holiday home"} />
<FavoriteButton id={"cedar-peak"} />
<div className={"absolute bottom-3 left-3 flex gap-1.5"}>
<span className={"px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-caption font-caption font-medium"}>{"Seafront Deck"}</span>
</div>
</div>
<div className={"p-4 flex-1 flex flex-col justify-between space-y-3"}>
<div>
<div className={"flex items-center justify-between text-body-md font-body-md mb-1"}>
<span className={"text-outline text-caption font-caption uppercase tracking-wider"}>{"Kfar Aabida Coast"}</span>
<div className={"flex items-center gap-1 text-emerald-800 font-semibold text-label-sm font-label-sm"}>
<Icon name="star" className="material-symbols-outlined text-[16px] text-emerald-700" />
<span>{"4.92"}</span>
<span className={"text-outline font-normal"}>{"(34)"}</span>
</div>
</div>
<h4 className={"text-title-md font-title-md text-on-surface font-semibold"}>{"Kfar Aabida Coastal Stone Lodge"}</h4>
<p className={"text-body-md font-body-md text-on-surface-variant line-clamp-1 mt-0.5"}>{"Private sea ladder \u00b7 Rooftop stargazing pergola \u00b7 High-speed Wi-Fi"}</p>
</div>
<div className={"pt-2 flex items-baseline justify-between"}>
<div>
<span className={"text-headline-sm font-headline-sm text-primary-container font-bold"}>{"$195"}</span>
<span className={"text-body-md font-body-md text-outline"}>{" / night"}</span>
</div>
<span className={"text-label-sm font-label-sm text-emerald-800 font-medium"}>{"Instant Book"}</span>
</div>
</div>
</div>
</div>
</section>

<section className={"bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden"}>
<div className={"relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"}>
<div className={"space-y-2 max-w-xl"}>
<div className={"flex items-center gap-2"}>
<Icon name="shield" className="material-symbols-outlined text-[20px] text-primary-container" />
<span className={"text-caption font-caption text-primary-container uppercase font-semibold tracking-wider"}>{"StayLeb Quality Guarantee"}</span>
</div>
<h3 className={"text-headline-sm font-headline-sm text-on-surface font-semibold"}>{"Looking for a specific Lebanese region?"}</h3>
<p className={"text-body-md font-body-md text-on-surface-variant leading-relaxed"}>{"\n            Every property on StayLeb is vetted in-person. We confirm 24/7 electricity via solar systems, high-speed fiber internet, and genuine Lebanese host hospitality.\n          "}</p>
</div>
<div className={"flex flex-wrap items-center gap-3 shrink-0"}>
<Link className={"px-5 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all active:scale-[0.98]"} href={"/search"}>{"\n            Discover Properties\n          "}</Link>
<ActionButton className={"px-4 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"} actionLabel={"Ask StayLeb Concierge"} aria-label={"Ask StayLeb Concierge"}>{"\n            Ask StayLeb Concierge\n          "}</ActionButton>
</div>
</div>
</section>

<footer className={"pt-8 pb-12 text-center text-body-md font-body-md text-outline space-y-3"}>
<div className={"flex items-center justify-center gap-6 text-label-sm font-label-sm text-on-surface-variant"}>
<span className={"flex items-center gap-1.5"}><Icon name="solar_power" className="material-symbols-outlined text-[16px] text-primary-container" />{" 24/7 Verified Solar"}</span>
<span>{"\u2022"}</span>
<span className={"flex items-center gap-1.5"}><Icon name="verified_user" className="material-symbols-outlined text-[16px] text-primary-container" />{" Verified Hosts"}</span>
<span>{"\u2022"}</span>
<span className={"flex items-center gap-1.5"}><Icon name="payments" className="material-symbols-outlined text-[16px] text-primary-container" />{" Flexible Cash or Online"}</span>
</div>
<p className={"text-caption font-caption text-outline"}>{"\n        \u00a9 2024 StayLeb. Crafted for discovering authenticated stays across Lebanon.\n      "}</p>
</footer>
</div>
</div></main>
</>; }
