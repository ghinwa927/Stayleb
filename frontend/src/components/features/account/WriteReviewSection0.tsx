import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RatingInput } from "@/components/ui/RatingInput";
import { ActionButton } from "@/components/ui/Interactions";

export function WriteReviewSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>



<div className={"max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12"}>

<nav aria-label={"Breadcrumb"} className={"flex items-center space-x-2 text-on-surface-variant font-label-sm mb-6"}>
<Link className={"hover:text-primary transition-colors"} href={"/account/bookings"}>{"My Bookings"}</Link>
<Icon name="chevron_right" className="material-symbols-outlined text-xs text-outline" />
<Link className={"hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-none"} href={"/properties/cedar-peak"}>{"Batroun Sunset Seaside Villa"}</Link>
<Icon name="chevron_right" className="material-symbols-outlined text-xs text-outline" />
<span className={"text-on-surface font-semibold"}>{"Write Review"}</span>
</nav>

<div className={"mb-8"}>
<h1 className={"font-display text-on-surface text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2"}>{"\n        How was your stay at Batroun Sunset Seaside Villa?\n      "}</h1>
<p className={"font-body-lg text-on-surface-variant max-w-3xl"}>{"\n        Your verified feedback helps fellow travelers choose authentic Lebanese chalets and rewards dedicated local hosts.\n      "}</p>
</div>

<div className={"bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-5"}>
<div className={"w-full sm:w-44 h-28 sm:h-28 rounded-lg overflow-hidden shrink-0 relative"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Batroun Sunset Seaside Villa showing a breathtaking traditional Lebanese stone terrace with panoramic Mediterranean sea view, crystal blue private infinity pool reflecting golden hour sunset lights and bougainvillea."} src={"/images/3fc149349e4ccf50.jpg"} alt={"Lebanese holiday home"} />
<span className={"absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-caption text-[10px] backdrop-blur-sm"}>{"Batroun Coast"}</span>
</div>
<div className={"flex-1 w-full flex flex-col justify-between"}>
<div className={"flex flex-col sm:flex-row sm:items-start justify-between gap-2"}>
<div>
<div className={"flex items-center gap-2 mb-1"}>
<span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-xs bg-surface-container text-secondary font-medium"}>
<Icon name="verified" className="material-symbols-outlined text-[14px]" />{"\n                Verified Stay\n              "}</span>
<span className={"inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-xs bg-surface-container-high text-primary font-semibold"}>{"\n                Completed Stay\n              "}</span>
</div>
<h2 className={"font-headline-sm text-on-surface text-lg sm:text-xl font-bold"}>{"Batroun Sunset Seaside Villa"}</h2>
<p className={"font-body-md text-on-surface-variant flex items-center gap-1 mt-0.5"}>
<Icon name="location_on" className="material-symbols-outlined text-base text-outline" />{"\n              Batroun Old Coastline, Lebanon\n            "}</p>
</div>
<div className={"text-left sm:text-right shrink-0"}>
<span className={"font-caption text-outline block uppercase tracking-wider"}>{"Stay Reference"}</span>
<span className={"font-label-md text-on-surface font-mono font-bold"}>{"#SL-8924-BTR"}</span>
</div>
</div>
<div className={"mt-3 pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-label-md bg-surface-container-low px-3 py-2 rounded-lg"}>
<div className={"flex items-center gap-1.5"}>
<Icon name="calendar_month" className="material-symbols-outlined text-sm text-primary" />
<span>{"Aug 12 \u2013 Aug 15, 2024"}</span>
</div>
<span className={"text-outline-variant hidden sm:inline"}>{"\u2022"}</span>
<div className={"flex items-center gap-1.5"}>
<Icon name="bedtime" className="material-symbols-outlined text-sm text-primary" />
<span>{"3 nights"}</span>
</div>
<span className={"text-outline-variant hidden sm:inline"}>{"\u2022"}</span>
<div className={"flex items-center gap-1.5"}>
<Icon name="group" className="material-symbols-outlined text-sm text-primary" />
<span>{"6 guests"}</span>
</div>
</div>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm"} id={"reviewFormSection"}>
<div className={"mb-6 pb-4 border-b-0"}>
<h3 className={"font-headline-md text-on-surface mb-1"}>{"StayLeb Seven Evaluation Criteria"}</h3>
<p className={"font-body-md text-on-surface-variant"}>{"\n          Please rate each verified amenity strictly based on your actual stay experience.\n        "}</p>
</div>

<div className={"space-y-6"}>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"1"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Overall Experience"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Rate your general impression of the property and stay."}</p>
</div>
<RatingInput criterion={"1"} />
</div>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"2"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Cleanliness"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Fresh bedding, immaculate bathrooms, clean kitchenware."}</p>
</div>
<RatingInput criterion={"2"} />
</div>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"3"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Privacy"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Seclusion, noise isolation, and private outdoor spaces."}</p>
</div>
<RatingInput criterion={"3"} />
</div>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"4"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Wi-Fi Reliability"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Internet speed and connection stability."}</p>
</div>
<RatingInput criterion={"4"} />
</div>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"5"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Hot Water & 24/7 Power"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Uninterrupted electricity, solar backup, hot water on demand."}</p>
</div>
<RatingInput criterion={"5"} />
</div>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"6"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Location & Views"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Sea or mountain vistas, accessibility, and neighborhood."}</p>
</div>
<RatingInput criterion={"6"} />
</div>

<div className={"p-4 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"}>
<div className={"max-w-md"}>
<div className={"flex items-center gap-2"}>
<span className={"w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold"}>{"7"}</span>
<h4 className={"font-title-md text-on-surface"}>{"Value for Money"}</h4>
</div>
<p className={"font-body-md text-on-surface-variant text-sm mt-1 ml-8"}>{"Fairness of pricing relative to amenities provided."}</p>
</div>
<RatingInput criterion={"7"} />
</div>
</div>

<div className={"mt-8 pt-6 border-t-0"}>
<label className={"block font-title-md text-on-surface mb-1"} htmlFor={"reviewComment"}>{"\n          Tell us more about your stay "}<span className={"text-outline font-normal text-sm"}>{"(optional)"}</span>
</label>
<p className={"font-body-md text-on-surface-variant text-sm mb-3"}>{"\n          What did you love most? Mention specific details like the sunset deck, pool, host hospitality, or solar reliability...\n        "}</p>
<div className={"relative"}>
<textarea className={"w-full p-4 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:bg-surface-container transition-all resize-none shadow-inner"} id={"reviewComment"} placeholder={"What did you love most? Mention specific details like the sunset deck, pool, host hospitality, or solar reliability..."} rows={5} defaultValue={"Hands down the best weekend getaway in Batroun! The sunset terrace was breathtaking, the private pool was crystal clear, and the 24/7 solar power meant zero interruptions. Tony made sure we had fresh morning manousheh. We will definitely be back!"} aria-label={"What did you love most? Mention specific details like the sunset deck, pool, host hospitality, or solar reliability..."}></textarea>
<div className={"flex justify-between items-center mt-2 px-1 text-outline font-caption"}>
<span>{"Minimum 0 characters"}</span>
<span id={"charCount"}>{"282 / 1,000 characters"}</span>
</div>
</div>
</div>

<div className={"mt-8 p-4 rounded-xl bg-surface-container flex items-start gap-3.5"}>
<Icon name="policy" className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5" />
<div className={"font-body-md text-on-surface text-sm"}>
<span className={"font-semibold text-primary"}>{"Important:"}</span>{" In accordance with StayLeb marketplace rules, once submitted, reviews cannot be edited or deleted by the client. Exactly one review is permitted per completed stay.\n        "}</div>
</div>

<div className={"mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-4"}>
<ActionButton className={"w-full sm:w-auto text-center px-6 py-3 rounded-lg font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} actionLabel={"Cancel"} aria-label={"Cancel"}>{"\n          Cancel\n        "}</ActionButton>
<ActionButton className={"w-full sm:w-auto px-8 py-3 rounded-lg bg-primary-container text-on-primary font-label-md font-semibold hover:bg-primary transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2"} id={"submitReviewBtn"} type={"button"} actionLabel={"Submit Review arrow_forward"} aria-label={"Submit Review arrow_forward"}>
<span>{"Submit Review"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-sm" />
</ActionButton>
</div>
</div>

<div className={"hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm"} id={"successStateModal"}>
<div className={"bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl transform transition-all text-center"}>
<div className={"w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-4"}>
<Icon name="check" className="material-symbols-outlined text-3xl font-bold" />
</div>
<span className={"inline-flex items-center gap-1 px-3 py-1 rounded-full font-caption text-xs bg-surface-container text-secondary font-semibold uppercase tracking-wider mb-2"}>{"\n          Verified Review Recorded\n        "}</span>
<h3 className={"font-headline-md text-on-surface mb-2"}>{"\n          Thanks for sharing your experience!\n        "}</h3>
<p className={"font-body-md text-on-surface-variant mb-6 text-sm sm:text-base leading-relaxed"}>{"\n          Your verified review for "}<strong className={"text-on-surface"}>{"Batroun Sunset Seaside Villa"}</strong>{" has been submitted and is now visible on the property page.\n        "}</p>

<div className={"bg-surface-container-low rounded-xl p-4 mb-6 text-left space-y-2"}>
<div className={"flex justify-between items-center text-sm font-label-md"}>
<span className={"text-on-surface-variant"}>{"Client"}</span>
<span className={"font-semibold text-on-surface"}>{"Maya Haddad"}</span>
</div>
<div className={"flex justify-between items-center text-sm font-label-md"}>
<span className={"text-on-surface-variant"}>{"StayLeb Rating"}</span>
<div className={"flex items-center gap-1 text-tertiary"}>
<Icon name="star" className="material-symbols-outlined text-sm" />
<span className={"font-bold text-on-surface"}>{"4.9 / 5.0"}</span>
</div>
</div>
<div className={"flex justify-between items-center text-sm font-label-md"}>
<span className={"text-on-surface-variant"}>{"Submission Status"}</span>
<span className={"font-caption text-xs px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold"}>{"Immutable & Public"}</span>
</div>
</div>
<div className={"flex flex-col sm:flex-row items-center gap-3"}>
<ActionButton className={"w-full py-3 px-5 rounded-lg bg-primary-container text-on-primary font-label-md font-semibold hover:bg-primary transition-colors text-center shadow-sm"} actionLabel={"Back to My Bookings"} aria-label={"Back to My Bookings"}>{"\n            Back to My Bookings\n          "}</ActionButton>
<Link className={"w-full py-3 px-5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md font-medium text-center"} href={"/properties/cedar-peak"}>{"\n            Explore More Chalets\n          "}</Link>
</div>
</div>
</div>
</div>


</div></main>
</>; }
