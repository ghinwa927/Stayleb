import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton } from "@/components/ui/Interactions";

export function MyBookingsSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>

<nav className={"sticky top-0 z-50 w-full bg-surface-container-lowest shadow-sm"}>
<div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between"}>

<div className={"flex items-center space-x-8"}>
<Link className={"flex items-center space-x-2 text-primary-container font-headline-sm text-headline-sm"} href={"/properties/cedar-peak"}>
<Icon name="holiday_village" className="material-symbols-outlined text-primary text-[28px]" />
<span className={"tracking-tight text-on-surface font-display text-[22px] font-bold"}>{"Stay"}<span className={"text-primary-container"}>{"Leb"}</span></span>
</Link>
<div className={"hidden md:flex items-center space-x-6"}>
<ActionButton className={"font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"} actionLabel={"Dashboard"} aria-label={"Dashboard"}>{"Dashboard"}</ActionButton>
<ActionButton className={"font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"} actionLabel={"Discover"} aria-label={"Discover"}>{"Discover"}</ActionButton>
<Link className={"font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"} href={"/account/favorites"}>{"Favorites"}</Link>
<Link className={"relative font-label-md text-label-md text-primary font-semibold py-6"} href={"/account/bookings"}>{"\n            My Bookings\n            "}<span className={"absolute bottom-0 left-0 right-0 h-[3px] bg-primary-container rounded-t-full"}></span>
</Link>
</div>
</div>

<div className={"flex items-center space-x-4"}>
<ActionButton className={"hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors"} actionLabel={"auto_awesome AI Smart Search \u2318K"} aria-label={"auto_awesome AI Smart Search \u2318K"}>
<Icon name="auto_awesome" className="material-symbols-outlined text-tertiary-container text-[18px]" />
<span className={"font-label-sm text-label-sm font-medium"}>{"AI Smart Search"}</span>
<kbd className={"font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline shadow-sm"}>{"\u2318K"}</kbd>
</ActionButton>
<div className={"flex items-center space-x-3 pl-2"}>
<div className={"text-right hidden xl:block"}>
<div className={"font-label-sm text-label-sm font-semibold text-on-surface"}>{"Maya Haddad"}</div>
<div className={"font-caption text-caption text-outline"}>{"Beirut, Lebanon"}</div>
</div>
<div className={"relative"}>
<LocalImage className={"w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-surface-container-high"} data-alt={"Close up professional portrait of Maya Haddad, a Lebanese traveler with warm friendly eyes and dark wavy hair, illuminated by soft golden morning light against an unfocused stone terrace background."} src={"/images/baa7932f0bd9759c.jpg"} alt={"Lebanese holiday home"} />
<span className={"absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest"}></span>
</div>
</div>
</div>
</div>
</nav>

<div className={"max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8"}>

<div className={"flex flex-col md:flex-row md:items-end justify-between gap-6"}>
<div className={"space-y-1.5"}>
<div className={"flex items-center space-x-2 text-primary"}>
<Icon name="luggage" className="material-symbols-outlined text-[18px]" />
<span className={"font-label-sm text-label-sm uppercase tracking-wider font-semibold"}>{"Travel Registry"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-on-surface"}>{"My Bookings"}</h1>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>{"\n          Manage your reservations, view real-time host confirmation statuses, and review completed Lebanese getaways.\n        "}</p>
</div>

<div className={"flex items-center space-x-4 p-3.5 rounded-xl bg-surface-container-lowest shadow-sm self-start md:self-auto"}>
<div className={"w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary"}>
<Icon name="verified_user" className="material-symbols-outlined" />
</div>
<div className={"text-left"}>
<div className={"font-caption text-caption text-outline uppercase tracking-wider font-medium"}>{"Guest Protection"}</div>
<div className={"font-label-md text-label-md font-semibold text-on-surface"}>{"StayLeb Secure Guarantee"}</div>
</div>
</div>
</div>

<div className={"flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none"}>
<ActionButton className={"tab-btn active px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center space-x-2 bg-primary-container text-on-primary shadow-sm"} data-tab={"all"} actionLabel={"All Bookings 5"} aria-label={"All Bookings 5"} hint={"filterBookings('all')"}>
<span>{"All Bookings"}</span>
<span className={"px-1.5 py-0.5 rounded-full font-caption text-caption bg-on-primary-container text-on-primary-fixed"}>{"5"}</span>
</ActionButton>
<ActionButton className={"tab-btn px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center space-x-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-sm"} data-tab={"upcoming"} actionLabel={"Upcoming 1"} aria-label={"Upcoming 1"} hint={"filterBookings('upcoming')"}>
<span>{"Upcoming"}</span>
<span className={"px-1.5 py-0.5 rounded-full font-caption text-caption bg-surface-container-high text-on-surface-variant"}>{"1"}</span>
</ActionButton>
<ActionButton className={"tab-btn px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center space-x-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-sm"} data-tab={"pending"} actionLabel={"Pending Approval 1"} aria-label={"Pending Approval 1"} hint={"filterBookings('pending')"}>
<span>{"Pending Approval"}</span>
<span className={"px-1.5 py-0.5 rounded-full font-caption text-caption bg-surface-container-high text-on-surface-variant"}>{"1"}</span>
</ActionButton>
<ActionButton className={"tab-btn px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center space-x-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-sm"} data-tab={"completed"} actionLabel={"Completed 2"} aria-label={"Completed 2"} hint={"filterBookings('completed')"}>
<RecordStatus initial={"Completed"}></RecordStatus>
<span className={"px-1.5 py-0.5 rounded-full font-caption text-caption bg-surface-container-high text-on-surface-variant"}>{"2"}</span>
</ActionButton>
<ActionButton className={"tab-btn px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center space-x-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-sm"} data-tab={"cancelled"} actionLabel={"Cancelled / Rejected 1"} aria-label={"Cancelled / Rejected 1"} hint={"filterBookings('cancelled')"}>
<span>{"Cancelled / Rejected"}</span>
<span className={"px-1.5 py-0.5 rounded-full font-caption text-caption bg-surface-container-high text-on-surface-variant"}>{"1"}</span>
</ActionButton>
</div>

<div className={"space-y-6"} id={"bookings-list"}>

<article className={"booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 md:p-6"} data-category={"upcoming"}>
<div className={"flex flex-col lg:flex-row gap-6 items-start"}>

<div className={"relative w-full lg:w-72 h-48 sm:h-52 rounded-lg overflow-hidden shrink-0"}>
<LocalImage className={"w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"} data-alt={"Rustic traditional Lebanese stone chalet nestled in the Faraya Mzaar mountains with pine trees, wooden roof rafters, warm interior lights glowing through double-pane glass windows during a clear dusk."} src={"/images/e1e779f8d5dc0f92.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm"}>
<Icon name="verified" className="material-symbols-outlined text-[15px] text-primary" />
<span className={"font-label-sm text-label-sm font-semibold text-on-surface"}>{"Superhost"}</span>
</div>
<div className={"absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded-lg text-inverse-on-surface flex items-center justify-between text-caption font-caption"}>
<span>{"Faraya Heights"}</span>
<span>{"Code: #SL-8841"}</span>
</div>
</div>

<div className={"flex-1 flex flex-col justify-between h-full space-y-4 w-full"}>
<div>
<div className={"flex flex-wrap items-center justify-between gap-2 mb-2"}>
<RecordStatus className={"inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium bg-emerald-50 text-emerald-700"} initial={"Confirmed"}></RecordStatus>
<span className={"font-body-md text-body-md font-semibold text-primary"}>{"\n                  Paid Online (Stripe) \u00b7 $700 total\n                "}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface hover:text-primary transition-colors cursor-pointer"}>{"\n                Cedar Peak Stone Chalet, Faraya Mzaar\n              "}</h2>
<div className={"flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-on-surface-variant font-body-md text-body-md"}>
<div className={"flex items-center space-x-1.5"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium text-on-surface"}>{"Sep 25 \u2013 Sep 28, 2024"}</span>
<span className={"text-outline"}>{"\u00b7"}</span>
<span>{"3 nights"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="group" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"4 guests"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="location_on" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"Faraya Mzaar, Mount Lebanon"}</span>
</div>
</div>
</div>

<div className={"p-3.5 rounded-lg bg-surface-container-low flex items-center space-x-3 text-on-surface"}>
<Icon name="key" className="material-symbols-outlined text-primary-container text-[20px] shrink-0" />
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Automatic confirmation upon payment. Check-in passcode and directions sent to your email.\n              "}</p>
</div>

<div className={"pt-2 flex flex-wrap items-center justify-between gap-3"}>
<div className={"flex items-center space-x-2 text-outline font-caption text-caption"}>
<Icon name="bolt" className="material-symbols-outlined text-[16px] text-primary" />
<span>{"Instant Check-in Ready"}</span>
</div>
<div className={"flex items-center space-x-3"}>
<ActionButton className={"px-4 py-2.5 rounded-lg font-label-md text-label-md bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center space-x-1.5"} actionLabel={"receipt_long Download Receipt"} aria-label={"receipt_long Download Receipt"}>
<Icon name="receipt_long" className="material-symbols-outlined text-[18px]" />
<span>{"Download Receipt"}</span>
</ActionButton>
<Link className={"px-5 py-2.5 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary hover:opacity-95 transition-all shadow-sm"} href={"/account/bookings/stay-001"}>{"\n                  View Booking Details\n                "}</Link>
</div>
</div>
</div>
</div>
</article>

<article className={"booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 md:p-6"} data-category={"pending"}>
<div className={"flex flex-col lg:flex-row gap-6 items-start"}>

<div className={"relative w-full lg:w-72 h-48 sm:h-52 rounded-lg overflow-hidden shrink-0"}>
<LocalImage className={"w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"} data-alt={"Sun-drenched wooden beachfront bungalow resting directly upon the pale golden sands of Sour Lebanon, turquoise Mediterranean waters rippling in the background under an afternoon sun."} src={"/images/09f47e4a9a817bd9.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded-lg text-inverse-on-surface flex items-center justify-between text-caption font-caption"}>
<span>{"Sour Coastal Reserve"}</span>
<span>{"Code: #SL-9102"}</span>
</div>
</div>

<div className={"flex-1 flex flex-col justify-between h-full space-y-4 w-full"}>
<div>
<div className={"flex flex-wrap items-center justify-between gap-2 mb-2"}>
<span className={"inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium bg-amber-50 text-amber-700"}>
<span className={"w-2 h-2 rounded-full bg-amber-500 animate-pulse"}></span>
<span>{"Pending Approval"}</span>
</span>
<span className={"font-body-md text-body-md font-semibold text-tertiary"}>{"\n                  Cash on Arrival \u00b7 $480 total\n                "}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface hover:text-primary transition-colors cursor-pointer"}>{"\n                Sour Sandy Beachfront Bungalow, Sour Coast\n              "}</h2>
<div className={"flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-on-surface-variant font-body-md text-body-md"}>
<div className={"flex items-center space-x-1.5"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium text-on-surface"}>{"Oct 18 \u2013 Oct 21, 2024"}</span>
<span className={"text-outline"}>{"\u00b7"}</span>
<span>{"3 nights"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="group" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"5 guests"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="payments" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"Pay Owner in USD"}</span>
</div>
</div>
</div>

<div className={"p-3.5 rounded-lg bg-surface-container-low flex items-center space-x-3 text-on-surface"}>
<Icon name="hourglass_top" className="material-symbols-outlined text-amber-600 text-[20px] shrink-0" />
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Waiting for Owner approval. Requested dates are temporarily reserved until response.\n              "}</p>
</div>

<div className={"pt-2 flex flex-wrap items-center justify-between gap-3"}>
<div className={"flex items-center space-x-2 text-outline font-caption text-caption"}>
<Icon name="schedule" className="material-symbols-outlined text-[16px]" />
<span>{"Response expected within 12h"}</span>
</div>
<div className={"flex items-center space-x-3"}>
<ActionButton className={"px-4 py-2.5 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/40 transition-colors"} actionLabel={"Cancel Request"} aria-label={"Cancel Request"}>{"\n                  Cancel Request\n                "}</ActionButton>
<Link className={"px-5 py-2.5 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary hover:opacity-95 transition-all shadow-sm"} href={"/account/bookings/stay-002/pending"}>{"\n                  View Request Details\n                "}</Link>
</div>
</div>
</div>
</div>
</article>

<article className={"booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 md:p-6"} data-category={"completed"}>
<div className={"flex flex-col lg:flex-row gap-6 items-start"}>

<div className={"relative w-full lg:w-72 h-48 sm:h-52 rounded-lg overflow-hidden shrink-0"}>
<LocalImage className={"w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"} data-alt={"Modern seaside villa overlooking Batroun rocky shoreline with floor-to-ceiling glass, sunset orange hues illuminating outdoor limestone patio and infinity plunge pool."} src={"/images/eb62f4fc5895ac9d.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded-lg text-inverse-on-surface flex items-center justify-between text-caption font-caption"}>
<span>{"Batroun Coastal"}</span>
<span>{"Code: #SL-7719"}</span>
</div>
</div>

<div className={"flex-1 flex flex-col justify-between h-full space-y-4 w-full"}>
<div>
<div className={"flex flex-wrap items-center justify-between gap-2 mb-2"}>
<span className={"inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium bg-slate-100 text-slate-700"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />
<RecordStatus initial={"Completed"}></RecordStatus>
</span>
<span className={"font-body-md text-body-md font-semibold text-on-surface"}>{"\n                  Paid Online (Stripe) \u00b7 $825\n                "}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface hover:text-primary transition-colors cursor-pointer"}>{"\n                Batroun Sunset Seaside Villa, Batroun Old Coastline\n              "}</h2>
<div className={"flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-on-surface-variant font-body-md text-body-md"}>
<div className={"flex items-center space-x-1.5"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium text-on-surface"}>{"Aug 12 \u2013 Aug 15, 2024"}</span>
<span className={"text-outline"}>{"\u00b7"}</span>
<span>{"3 nights"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="group" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"6 guests"}</span>
</div>
</div>
</div>

<div className={"p-4 rounded-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
<div className={"space-y-1"}>
<div className={"flex items-center space-x-1.5 text-primary-container font-label-sm text-label-sm font-semibold"}>
<Icon name="rate_review" className="material-symbols-outlined text-[18px]" />
<span>{"Review StayLeb Host & Amenities"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                  How was your stay? Submit your review for Cleanliness, Wi-Fi, Solar & Hospitality.\n                "}</p>
</div>
<Link className={"px-4 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary hover:opacity-90 shrink-0 transition-all shadow-sm"} href={"/account/bookings/stay-001/review"}>{"\n                Write Review\n              "}</Link>
</div>

<div className={"pt-1 flex items-center justify-between"}>
<div className={"text-outline font-caption text-caption"}>{"Completed on Aug 15, 2024"}</div>
<ActionButton className={"text-primary font-label-md text-label-md hover:underline"} actionLabel={"View Stay Receipt"} aria-label={"View Stay Receipt"}>{"\n                View Stay Receipt\n              "}</ActionButton>
</div>
</div>
</div>
</article>

<article className={"booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 md:p-6"} data-category={"completed"}>
<div className={"flex flex-col lg:flex-row gap-6 items-start"}>

<div className={"relative w-full lg:w-72 h-48 sm:h-52 rounded-lg overflow-hidden shrink-0"}>
<LocalImage className={"w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"} data-alt={"Restored old Lebanese stone lodge nestled in Kfar Aabida surrounded by wild olive groves and bougainvillea blossoms, rustic wooden shutters on arched stone windows."} src={"/images/2a9970f9289fac2c.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded-lg text-inverse-on-surface flex items-center justify-between text-caption font-caption"}>
<span>{"Kfar Aabida"}</span>
<span>{"Code: #SL-6401"}</span>
</div>
</div>

<div className={"flex-1 flex flex-col justify-between h-full space-y-4 w-full"}>
<div>
<div className={"flex flex-wrap items-center justify-between gap-2 mb-2"}>
<span className={"inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium bg-slate-100 text-slate-700"}>
<Icon name="check_circle" className="material-symbols-outlined text-[14px]" />
<RecordStatus initial={"Completed"}></RecordStatus>
</span>
<span className={"font-body-md text-body-md font-semibold text-on-surface"}>{"\n                  Paid Online (Stripe) \u00b7 $560\n                "}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface hover:text-primary transition-colors cursor-pointer"}>{"\n                Kfar Aabida Coastal Stone Lodge\n              "}</h2>
<div className={"flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-on-surface-variant font-body-md text-body-md"}>
<div className={"flex items-center space-x-1.5"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"font-medium text-on-surface"}>{"Jul 04 \u2013 Jul 07, 2024"}</span>
<span className={"text-outline"}>{"\u00b7"}</span>
<span>{"3 nights"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="group" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"4 guests"}</span>
</div>
</div>
</div>

<div className={"p-3.5 rounded-lg bg-surface-container flex items-center justify-between"}>
<div className={"flex items-center space-x-2.5"}>
<div className={"flex text-amber-500"}>
<Icon name="star" className="material-symbols-outlined text-[18px]" />
<Icon name="star" className="material-symbols-outlined text-[18px]" />
<Icon name="star" className="material-symbols-outlined text-[18px]" />
<Icon name="star" className="material-symbols-outlined text-[18px]" />
<Icon name="star" className="material-symbols-outlined text-[18px]" />
</div>
<span className={"font-label-sm text-label-sm font-semibold text-on-surface"}>{"5.0"}</span>
<span className={"text-outline"}>{"\u00b7"}</span>
<span className={"font-body-md text-body-md text-on-surface-variant"}>{"Review Submitted \u00b7 Thank you for your feedback"}</span>
</div>
<span className={"font-caption text-caption text-outline hidden sm:inline"}>{"Finalized"}</span>
</div>

<div className={"pt-2 flex items-center justify-between"}>
<span className={"font-caption text-caption text-outline"}>{"Verified Guest Review"}</span>
<Link className={"px-4 py-2 rounded-lg font-label-md text-label-md bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"} href={"/account/bookings/stay-001"}>{"\n                View Booking Details\n              "}</Link>
</div>
</div>
</div>
</article>

<article className={"booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 md:p-6"} data-category={"cancelled"}>
<div className={"flex flex-col lg:flex-row gap-6 items-start"}>

<div className={"relative w-full lg:w-72 h-48 sm:h-52 rounded-lg overflow-hidden shrink-0 grayscale"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Historical sandstone house in Byblos ancient port quarter with bougainvillea draped along stone walls, quiet cobblestone alley in the historic district."} src={"/images/4c370b80f422b00a.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute inset-0 bg-on-surface/30"}></div>
<div className={"absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded-lg text-inverse-on-surface flex items-center justify-between text-caption font-caption"}>
<span>{"Byblos Old Port"}</span>
<span>{"Code: #SL-5210"}</span>
</div>
</div>

<div className={"flex-1 flex flex-col justify-between h-full space-y-4 w-full"}>
<div>
<div className={"flex flex-wrap items-center justify-between gap-2 mb-2"}>
<span className={"inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium bg-rose-50 text-rose-700"}>
<Icon name="cancel" className="material-symbols-outlined text-[14px]" />
<span>{"Rejected"}</span>
</span>
<span className={"font-body-md text-body-md text-outline"}>{"\n                  Cash on Arrival Request\n                "}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface line-through opacity-70"}>{"\n                Phoenician Old Port Stone House, Byblos\n              "}</h2>
<div className={"flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-on-surface-variant font-body-md text-body-md"}>
<div className={"flex items-center space-x-1.5"}>
<Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-outline" />
<span>{"Jun 20 \u2013 Jun 22, 2024"}</span>
<span className={"text-outline"}>{"\u00b7"}</span>
<span>{"2 nights"}</span>
</div>
<div className={"flex items-center space-x-1.5"}>
<Icon name="lock_open" className="material-symbols-outlined text-[18px] text-outline" />
<span className={"text-error font-medium"}>{"Dates Released"}</span>
</div>
</div>
</div>

<div className={"p-3.5 rounded-lg bg-surface-container-low space-y-1"}>
<div className={"font-label-sm text-label-sm font-medium text-error"}>{"Host Note:"}</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Owner was unable to accommodate dates due to private maintenance. Dates released.\n              "}</p>
</div>

<div className={"pt-2 flex flex-wrap items-center justify-between gap-3"}>
<div className={"flex items-center space-x-1.5 text-outline font-caption text-caption"}>
<Icon name="history" className="material-symbols-outlined text-[14px]" />
<span>{"Booking history is permanently preserved \u2014 reservations are never deleted."}</span>
</div>
<ActionButton className={"px-5 py-2.5 rounded-lg font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:opacity-90 transition-all font-semibold shadow-sm"} actionLabel={"Find Similar Stays"} aria-label={"Find Similar Stays"}>{"\n                Find Similar Stays\n              "}</ActionButton>
</div>
</div>
</div>
</article>
</div>

<div className={"hidden p-12 bg-surface-container-lowest rounded-xl shadow-sm text-center flex-col items-center justify-center space-y-4"} id={"empty-state-box"}>
<div className={"w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary"}>
<Icon name="travel_explore" className="material-symbols-outlined text-[32px]" />
</div>
<div className={"space-y-1 max-w-sm"}>
<h3 className={"font-title-md text-title-md text-on-surface"}>{"No bookings in this tab"}</h3>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n          When you book a StayLeb chalet, your reservation details will appear here.\n        "}</p>
</div>
<Link className={"px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-95 transition-opacity inline-block shadow-sm"} href={"/search"}>{"\n        Discover Properties\n      "}</Link>
</div>

<div className={"p-6 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4"}>
<div className={"flex items-center space-x-3"}>
<Icon name="support_agent" className="material-symbols-outlined text-primary-container text-[24px]" />
<div>
<h4 className={"font-label-md text-label-md font-semibold text-on-surface"}>{"Need help with your reservation?"}</h4>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Our Lebanese concierge team is on standby 24/7 for booking modifications or emergencies."}</p>
</div>
</div>
<div className={"flex items-center space-x-3 shrink-0"}>
<ActionButton className={"px-4 py-2 rounded-lg font-label-md text-label-md bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-sm transition-colors"} actionLabel={"Support Center"} aria-label={"Support Center"}>{"\n          Support Center\n        "}</ActionButton>
<ActionButton className={"px-4 py-2 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 shadow-sm transition-opacity"} actionLabel={"WhatsApp Concierge"} aria-label={"WhatsApp Concierge"}>{"\n          WhatsApp Concierge\n        "}</ActionButton>
</div>
</div>
</div>
</div>
</main>
</>; }
