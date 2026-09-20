import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function RoleSelectionSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>
<div className={"w-full min-h-screen bg-surface flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"}>



<main className={"w-full max-w-5xl mx-auto my-8 sm:my-10"}>
<div className={"grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"} id={"role-selection-group"}>

<div className={"group flex flex-col rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-primary-container"}>

<div className={"relative h-52 sm:h-56 w-full overflow-hidden bg-surface-container-highest"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} src={"/images/f27f13ff2e5685c8.jpg"} alt={"Seaside Lebanese vacation stay in Batroun with Mediterranean arches"} />
<div className={"absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"}></div>
<div className={"absolute top-3.5 right-3.5"}>
<span className={"px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-sm backdrop-blur-sm"}>{"\n              Client / Traveler\n            "}</span>
</div>
<div className={"absolute bottom-3.5 left-4 flex items-center gap-1.5 text-on-primary font-caption text-caption drop-shadow"}>
<Icon name="beach_access" className="material-symbols-outlined text-[18px]" />
<span className={""}>{"Coast & Mountains"}</span>
</div>
</div>

<div className={"p-6 flex-1 flex flex-col justify-between"}>
<div>
<h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-2 tracking-tight"}>{"\n              Book a Chalet or Furnished House\n            "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6"}>{"\n              Discover, save, and reserve exclusive alpine chalets and coastal villas across Lebanon. Enjoy verified 24/7 power and seamless check-ins.\n            "}</p>
</div>
<div className={"pt-2"}>
<Link className={"w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors duration-150 active:scale-[0.98] shadow-sm"} href={"/auth/register"}>
<span className={""}>{"Create Client Account"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5" />
</Link>
<div className={"mt-2.5 text-center text-outline font-caption text-caption"}>{"\n              Instant booking confirmation & flexible payment\n            "}</div>
</div>
</div>
</div>

<div className={"group flex flex-col rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-secondary"}>

<div className={"relative h-52 sm:h-56 w-full overflow-hidden bg-surface-container-highest"}>
<LocalImage className={"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} src={"/images/e14f6d4a2a0b926d.jpg"} alt={"Luxury Lebanese mountain chalet exterior with panoramic scenic valley views"} />
<div className={"absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"}></div>
<div className={"absolute top-3.5 right-3.5"}>
<span className={"px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm shadow-sm backdrop-blur-sm"}>{"\n              Host & Owner\n            "}</span>
</div>
<div className={"absolute bottom-3.5 left-4 flex items-center gap-1.5 text-on-primary font-caption text-caption drop-shadow"}>
<Icon name="villa" className="material-symbols-outlined text-[18px]" />
<span className={""}>{"Faraya, Zaarour & Beyond"}</span>
</div>
</div>

<div className={"p-6 flex-1 flex flex-col justify-between"}>
<div>
<h2 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-2 tracking-tight"}>{"\n              List My Property\n            "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6"}>{"\n              Manage your stone villa or chalet, customize dynamic seasonal pricing, sync calendars, and welcome verified Lebanese and international guests.\n            "}</p>
</div>
<div className={"pt-2"}>
<Link className={"w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] bg-secondary text-on-secondary hover:bg-primary transition-colors duration-150 active:scale-[0.98] font-label-md text-label-md shadow-sm"} href={"/auth/register/owner"}>
<span className={""}>{"Create Owner Account"}</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5" />
</Link>
<div className={"mt-2.5 text-center text-outline font-caption text-caption"}>{"\n              0% onboarding fee & dedicated concierge setup\n            "}</div>
</div>
</div>
</div>
</div>
</main>

<footer className={"w-full max-w-2xl mx-auto flex flex-col items-center gap-4 text-center pb-2"}>
<div className={"inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant text-caption font-caption"}>
<Icon name="admin_panel_settings" className="material-symbols-outlined text-[18px] text-outline flex-shrink-0" />
<span className={""}><span className={"font-semibold text-on-surface"}>{"Administrative Staff:"}</span>{" Internal administrator portals are provisioned directly by StayLeb Operations and cannot be established through public registration."}</span>
</div>
<div className={"flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-on-surface-variant font-body-md text-body-md"}>
<span className={""}>{"Already have an account?"}</span>
<Link className={"font-semibold text-primary hover:text-primary-container transition-colors underline underline-offset-4"} href={"/auth/login"}>{"\n        Log In\n      "}</Link>
<span className={"text-outline"}>{"\u2022"}</span>
<a className={"text-outline hover:text-on-surface font-caption text-caption transition-colors"} href={"#terms"}>{"Terms"}</a>
<span className={"text-outline"}>{"\u2022"}</span>
<a className={"text-outline hover:text-on-surface font-caption text-caption transition-colors"} href={"#privacy"}>{"Privacy"}</a>
<span className={"text-outline"}>{"\u2022"}</span>
<a className={"text-outline hover:text-on-surface font-caption text-caption transition-colors"} href={"#help"}>{"Support"}</a>
</div>
</footer>
</div>
</div>
</main>
</>; }
