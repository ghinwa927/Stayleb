import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton } from "@/components/ui/Interactions";

export function BookingDetailsSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>



<div className={"max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8"}>

<div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
<nav className={"flex items-center space-x-2 text-on-surface-variant font-label-sm text-label-sm"}>
<ActionButton className={"hover:text-primary transition-colors flex items-center gap-1"} actionLabel={"arrow_back Back to My Bookings"} aria-label={"arrow_back Back to My Bookings"}>
<Icon name="arrow_back" className="material-symbols-outlined text-[16px]" />
<span>{"Back to My Bookings"}</span>
</ActionButton>
<span className={"text-outline-variant"}>{"/"}</span>
<span className={"text-on-surface-variant"}>{"Cedar Peak Stone Chalet"}</span>
<span className={"text-outline-variant"}>{"/"}</span>
<span className={"text-on-surface font-semibold"}>{"Booking #SLB-84920"}</span>
</nav>

<div className={"flex items-center space-x-2"}>
<ActionButton className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-sm text-label-sm shadow-sm transition-all"} actionLabel={"print Print Receipt"} aria-label={"print Print Receipt"} hint={"window.print()"}>
<Icon name="print" className="material-symbols-outlined text-[16px]" />
<span>{"Print Receipt"}</span>
</ActionButton>
<ActionButton className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-sm text-label-sm shadow-sm transition-all"} actionLabel={"share Share Itinerary"} aria-label={"share Share Itinerary"}>
<Icon name="share" className="material-symbols-outlined text-[16px]" />
<span>{"Share Itinerary"}</span>
</ActionButton>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"}>
<div className={"space-y-2"}>
<div className={"flex items-center flex-wrap gap-3"}>
<h1 className={"font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight"}>{"Booking Details"}</h1>

<span className={"inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold tracking-wide"}>
<Icon name="check_circle" className="material-symbols-outlined text-[16px] text-emerald-600" />{"\n            Confirmed\n          "}</span>
<span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-caption text-caption"}>
<Icon name="bolt" className="material-symbols-outlined text-[14px] text-primary" />{"\n            Instant Stripe Confirmation\n          "}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant flex items-center gap-2"}>{"\n          Reference Code: "}<span className={"font-semibold text-on-surface font-mono"}>{"#SLB-84920"}</span>
<span className={"text-outline-variant"}>{"\u2022"}</span>{"\n          Created on Sep 14, 2024\n        "}</p>
</div>
<div className={"flex items-center gap-3"}>
<a className={"px-4 py-2.5 rounded-xl bg-surface-container-high text-primary font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors inline-flex items-center gap-2"} href={"#stay-details"}>
<Icon name="directions" className="material-symbols-outlined text-[18px]" />{"\n          View Directions\n        "}</a>
<a className={"px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-medium hover:bg-primary-container transition-colors inline-flex items-center gap-2 shadow-sm"} href={"#host-card"}>
<Icon name="chat" className="material-symbols-outlined text-[18px]" />{"\n          Message Host\n        "}</a>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>

<div className={"lg:col-span-8 space-y-6"}>

<div className={"bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row"}>
<div className={"sm:w-2/5 relative min-h-[220px] sm:min-h-full"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Scenic luxury stone chalet in Faraya Mzaar Mount Lebanon with panoramic snow-capped mountain ridge, outdoor steaming cedar hot tub jacuzzi, and wooden sun deck at golden hour."} src={"/images/b349a5ea1a9bacc6.jpg"} alt={"Lebanese holiday home"} />
<div className={"absolute top-3 left-3 bg-inverse-surface/80 backdrop-blur-md px-2.5 py-1 rounded-full text-inverse-on-surface font-caption text-caption uppercase tracking-wider font-semibold"}>{"\n              Chalet\n            "}</div>
</div>
<div className={"sm:w-3/5 p-6 sm:p-7 flex flex-col justify-between space-y-4"}>
<div className={"space-y-2"}>
<div className={"flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm"}>
<Icon name="location_on" className="material-symbols-outlined text-primary text-[16px]" />
<span>{"Faraya Mzaar, Mount Lebanon (1,850m Altitude)"}</span>
</div>
<h2 className={"font-title-md text-title-md text-on-surface font-bold leading-snug"}>{"Cedar Peak Stone Chalet & Heated Outdoor Spa"}</h2>
<div className={"flex items-center gap-3 pt-1"}>
<div className={"flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold"}>
<Icon name="star" className="material-symbols-outlined text-[15px]" />
<span>{"4.98"}</span>
</div>
<span className={"text-on-surface-variant font-caption text-caption"}>{"(48 guest reviews)"}</span>
<span className={"text-outline-variant"}>{"\u2022"}</span>
<span className={"font-caption text-caption text-primary font-medium"}>{"Superhost Property"}</span>
</div>
</div>
<div className={"pt-2"}>
<ActionButton className={"inline-flex items-center gap-1.5 text-primary font-label-md text-label-md font-semibold hover:underline group"} actionLabel={"View Property Listing arrow_forward"} aria-label={"View Property Listing arrow_forward"}>
<span>{"View Property Listing"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform" />
</ActionButton>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"} id={"stay-details"}>
<div className={"flex items-center justify-between border-b border-surface-container-high pb-4"}>
<div className={"flex items-center gap-2"}>
<Icon name="event_available" className="material-symbols-outlined text-primary text-[24px]" />
<h3 className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>{"Stay Details"}</h3>
</div>
<span className={"font-label-md text-label-md text-primary font-semibold bg-surface-container px-3 py-1 rounded-full"}>{"\n              3 Nights Total\n            "}</span>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
<div className={"bg-surface-container-low rounded-xl p-4.5 space-y-1"}>
<span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold"}>{"Check-in"}</span>
<p className={"font-title-md text-title-md text-on-surface font-bold"}>{"Wednesday, Sep 25, 2024"}</p>
<p className={"font-body-md text-body-md text-on-surface-variant flex items-center gap-1"}>
<Icon name="schedule" className="material-symbols-outlined text-[16px]" />{"\n                3:00 PM onwards\n              "}</p>
</div>
<div className={"bg-surface-container-low rounded-xl p-4.5 space-y-1"}>
<span className={"font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold"}>{"Check-out"}</span>
<p className={"font-title-md text-title-md text-on-surface font-bold"}>{"Saturday, Sep 28, 2024"}</p>
<p className={"font-body-md text-body-md text-on-surface-variant flex items-center gap-1"}>
<Icon name="schedule" className="material-symbols-outlined text-[16px]" />{"\n                Until 11:00 AM\n              "}</p>
</div>
</div>

<div className={"flex items-center gap-3 p-4 rounded-xl bg-surface-container-low"}>
<Icon name="group" className="material-symbols-outlined text-primary text-[22px]" />
<div>
<p className={"font-label-md text-label-md font-semibold text-on-surface"}>{"Guests Registered"}</p>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"4 Guests (2 adults, 2 kids) \u00b7 Entire Chalet reservation"}</p>
</div>
</div>

<div className={"space-y-4 pt-2"}>
<h4 className={"font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Arrival & Access Protocol"}</h4>
<div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
<div className={"flex items-start space-x-3.5 p-4 rounded-xl bg-surface-container"}>
<div className={"w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0"}>
<Icon name="key" className="material-symbols-outlined text-[18px]" />
</div>
<div className={"space-y-0.5"}>
<p className={"font-label-md text-label-md font-semibold text-on-surface"}>{"Key Handover"}</p>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Host greeting & on-site keys handover upon arrival at the gatehouse entrance."}</p>
</div>
</div>
<div className={"flex items-start space-x-3.5 p-4 rounded-xl bg-surface-container"}>
<div className={"w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0"}>
<Icon name="shield_person" className="material-symbols-outlined text-[18px]" />
</div>
<div className={"space-y-0.5"}>
<p className={"font-label-md text-label-md font-semibold text-on-surface"}>{"Assigned Superhosts"}</p>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Tony & Carole will meet you directly at 3:00 PM on Wednesday."}</p>
</div>
</div>
</div>
</div>

<div className={"space-y-3 pt-2"}>
<h4 className={"font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold"}>{"Guaranteed Chalet Infrastructure"}</h4>
<div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
<div className={"flex items-center gap-2.5 text-on-surface font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
<Icon name="solar_power" className="material-symbols-outlined text-emerald-600 text-[20px]" />
<span>{"24/7 uninterrupted generator & solar grid"}</span>
</div>
<div className={"flex items-center gap-2.5 text-on-surface font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
<Icon name="hot_tub" className="material-symbols-outlined text-emerald-600 text-[20px]" />
<span>{"Heated outdoor year-round Jacuzzi"}</span>
</div>
<div className={"flex items-center gap-2.5 text-on-surface font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
<Icon name="fireplace" className="material-symbols-outlined text-emerald-600 text-[20px]" />
<span>{"Indoor seasoned cedar logs for fireplace"}</span>
</div>
<div className={"flex items-center gap-2.5 text-on-surface font-body-md text-body-md p-2.5 rounded-lg bg-surface-container-low"}>
<Icon name="wifi" className="material-symbols-outlined text-emerald-600 text-[20px]" />
<span>{"High-speed optical fiber internet (80 Mbps)"}</span>
</div>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-4"}>
<div className={"flex items-center gap-2"}>
<Icon name="policy" className="material-symbols-outlined text-primary text-[22px]" />
<h3 className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>{"Chalet House Rules Reminder"}</h3>
</div>
<div className={"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"}>
<div className={"p-4 rounded-xl bg-surface-container-low space-y-1"}>
<div className={"flex items-center gap-2 text-on-surface font-label-md text-label-md font-semibold"}>
<Icon name="volume_off" className="material-symbols-outlined text-outline text-[18px]" />
<span>{"Quiet Hours"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"After 11:00 PM out of mountain neighborhood respect."}</p>
</div>
<div className={"p-4 rounded-xl bg-surface-container-low space-y-1"}>
<div className={"flex items-center gap-2 text-on-surface font-label-md text-label-md font-semibold"}>
<Icon name="smoke_free" className="material-symbols-outlined text-outline text-[18px]" />
<span>{"No Smoking"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Strictly non-smoking inside chalet. Allowed on open terraces."}</p>
</div>
<div className={"p-4 rounded-xl bg-surface-container-low space-y-1"}>
<div className={"flex items-center gap-2 text-on-surface font-label-md text-label-md font-semibold"}>
<Icon name="pets" className="material-symbols-outlined text-outline text-[18px]" />
<span>{"Pets Welcome"}</span>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Allowed upon prior confirmation with host Tony."}</p>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-2"}>
<Icon name="event_busy" className="material-symbols-outlined text-primary text-[22px]" />
<h3 className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>{"Cancellation Terms"}</h3>
</div>
<span className={"px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold"}>{"\n              Flexible Policy\n            "}</span>
</div>
<div className={"p-4.5 rounded-xl bg-surface-container-low text-on-surface space-y-2"}>
<div className={"flex items-start gap-3"}>
<Icon name="check_circle" className="material-symbols-outlined text-emerald-600 mt-0.5 text-[20px]" />
<p className={"font-body-md text-body-md"}>
<strong>{"Free cancellation up to 7 days before check-in"}</strong>{" (Wednesday, Sep 18, 2024 at 3:00 PM). Full 100% refund processed immediately back to original payment card.\n              "}</p>
</div>
<div className={"flex items-start gap-3 pt-1"}>
<Icon name="info" className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[20px]" />
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                After Sep 18, 2024, standard 50% seasonal cancellation terms apply minus non-refundable mountain prep costs.\n              "}</p>
</div>
</div>

<div className={"pt-2 flex items-center justify-between"}>
<p className={"font-caption text-caption text-on-surface-variant"}>{"Need to modify or cancel your reservation dates?"}</p>
<ActionButton className={"px-4 py-2 rounded-xl bg-surface-container-high text-error hover:bg-error-container hover:text-on-error-container font-label-md text-label-md font-semibold transition-colors"} id={"openCancelModalBtn"} type={"button"} actionLabel={"Cancel Booking"} aria-label={"Cancel Booking"}>{"\n              Cancel Booking\n            "}</ActionButton>
</div>
</div>
</div>

<div className={"lg:col-span-4 space-y-6"}>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm space-y-5"}>
<div className={"flex items-center justify-between pb-3 border-b border-surface-container"}>
<h3 className={"font-title-md text-title-md text-on-surface font-bold"}>{"Price Summary"}</h3>
<span className={"font-caption text-caption bg-surface-container-high text-primary px-2.5 py-1 rounded-full font-semibold"}>{"\n              USD Currency\n            "}</span>
</div>

<div className={"space-y-3 font-body-md text-body-md text-on-surface-variant"}>
<div className={"flex justify-between items-center"}>
<span>{"$220 \u00d7 3 nights (base ski rate)"}</span>
<span className={"text-on-surface font-medium"}>{"$660.00"}</span>
</div>
<div className={"flex justify-between items-center"}>
<span>{"Cleaning & firewood supply fee"}</span>
<span className={"text-on-surface font-medium"}>{"$40.00"}</span>
</div>
<div className={"flex justify-between items-center"}>
<span className={"flex items-center gap-1"}>{"\n                StayLeb Service Fee\n                "}<Icon name="celebration" className="material-symbols-outlined text-[15px] text-tertiary" />
</span>
<span className={"text-emerald-700 font-medium"}>{"$0.00 (Promotional Launch)"}</span>
</div>
</div>

<div className={"pt-4 border-t border-surface-container space-y-3"}>
<div className={"flex justify-between items-baseline"}>
<span className={"font-title-md text-title-md font-bold text-on-surface"}>{"Total Paid"}</span>
<span className={"font-headline-md text-headline-md font-bold text-primary"}>{"$700.00"}</span>
</div>

<div className={"bg-surface-container-low p-3.5 rounded-xl space-y-2"}>
<div className={"flex items-center justify-between text-on-surface"}>
<div className={"flex items-center gap-2 font-label-md text-label-md font-semibold"}>
<Icon name="credit_card" className="material-symbols-outlined text-primary text-[20px]" />
<span>{"Visa ending in \u00b7\u00b7\u00b7\u00b74242"}</span>
</div>
<span className={"font-caption text-caption text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold"}>{"\n                  Paid in Full\n                "}</span>
</div>
<p className={"font-caption text-caption text-on-surface-variant"}>{"\n                Payment secured via Stripe. Instant automated transaction ID: "}<span className={"font-mono text-on-surface"}>{"ch_3Pl90A81"}</span>
</p>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm space-y-5"} id={"host-card"}>
<div className={"flex items-center justify-between"}>
<h3 className={"font-title-md text-title-md text-on-surface font-bold"}>{"Your Host"}</h3>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Verified Superhost"}</span>
</div>
<div className={"flex items-center space-x-4"}>
<div className={"w-14 h-14 rounded-full overflow-hidden bg-surface-container-high shrink-0 shadow-sm"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Portrait photo of chalet host Tony K., a friendly Lebanese man in his 40s wearing a warm outdoor fleece jacket against a Lebanese mountain background."} src={"/images/eca4b3a051601322.jpg"} alt={"Lebanese holiday home"} />
</div>
<div>
<h4 className={"font-title-md text-title-md font-bold text-on-surface"}>{"Tony K."}</h4>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Hosting since 2019 \u00b7 Typically responds within 15 min"}</p>
</div>
</div>
<div className={"p-4 rounded-xl bg-surface-container-low space-y-3"}>
<p className={"font-body-md text-body-md text-on-surface"}>{"\n              Need assistance with snow access, 4x4 guidance, or road directions?\n            "}</p>
<a className={"inline-flex items-center gap-2 text-primary font-label-md text-label-md font-semibold hover:underline"} href={"tel:+9613456789"}>
<Icon name="phone_enabled" className="material-symbols-outlined text-[18px]" />
<span>{"Call Tony (+961 3 456 789)"}</span>
</a>
</div>
<a className={"w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs"} href={"https://wa.me/9613456789"} rel={"noopener noreferrer"} target={"_blank"}>
<Icon name="chat_bubble" className="material-symbols-outlined text-[18px]" />
<span>{"WhatsApp Host"}</span>
</a>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4"}>
<div className={"flex items-start gap-3"}>
<div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0"}>
<Icon name="verified_user" className="material-symbols-outlined text-[22px]" />
</div>
<div className={"space-y-1"}>
<h4 className={"font-title-md text-title-md font-bold text-on-surface"}>{"StayLeb Protection Shield"}</h4>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n                Every reservation includes 24/7 localized Beirut mountain support, utility continuity guarantee, and emergency property rebooking assistance.\n              "}</p>
</div>
</div>
<div className={"pt-2 border-t border-surface-container flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm"}>
<span>{"Direct Support Hotline:"}</span>
<span className={"font-semibold text-on-surface"}>{"+961 1 998 877"}</span>
</div>
</div>
</div>
</div>
</div>

<div className={"fixed inset-0 z-50 hidden items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-sm transition-opacity"} id={"cancellationModal"}>
<div className={"bg-surface-container-lowest max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transform transition-transform scale-100"}>

<div className={"flex items-start justify-between"}>
<div className={"w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0"}>
<Icon name="warning" className="material-symbols-outlined text-[24px]" />
</div>
<ActionButton className={"text-outline hover:text-on-surface p-1 rounded-lg"} id={"closeCancelModalBtn"} actionLabel={"close"} aria-label={"close"}>
<Icon name="close" className="material-symbols-outlined text-[20px]" />
</ActionButton>
</div>

<div className={"space-y-2"}>
<h3 className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>{"Cancel this reservation?"}</h3>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>{"\n          Are you sure you want to cancel your stay at "}<strong>{"Cedar Peak Stone Chalet"}</strong>{"? Your booking status will change to "}<RecordStatus className={"font-semibold text-error"} initial={"Cancelled"}></RecordStatus>{" and the reserved dates will be released immediately to other travelers.\n        "}</p>
<div className={"p-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md mt-3"}>
<span className={"font-semibold text-emerald-700"}>{"Full 100% Refund:"}</span>{" As today is prior to September 18, 2024, the full $700.00 will be credited back to your Visa card within 3-5 business days.\n        "}</div>
<p className={"font-caption text-caption text-outline"}>{"\n          Bookings are permanently preserved in your account history for accounting and receipts.\n        "}</p>
</div>

<div className={"flex flex-col sm:flex-row items-center justify-end gap-3 pt-2"}>
<ActionButton className={"w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"} id={"dismissCancelModalBtn"} type={"button"} actionLabel={"Keep Booking"} aria-label={"Keep Booking"}>{"\n          Keep Booking\n        "}</ActionButton>
<ActionButton className={"w-full sm:w-auto px-5 py-2.5 rounded-xl bg-error text-on-error font-label-md text-label-md font-semibold hover:bg-red-700 transition-colors shadow-sm"} id={"confirmCancellationBtn"} type={"button"} actionLabel={"Confirm Cancellation"} aria-label={"Confirm Cancellation"}>{"\n          Confirm Cancellation\n        "}</ActionButton>
</div>
</div>
</div>

<div className={"fixed bottom-6 right-6 z-50 hidden bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3"} id={"cancelNotification"}>
<Icon name="check_circle" className="material-symbols-outlined text-emerald-400" />
<span className={"font-label-md text-label-md"}>{"Booking #SLB-84920 cancelled. Refund initiated."}</span>
</div>

</div></main>
</>; }
