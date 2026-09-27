import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ActionButton } from "@/components/ui/Interactions";

export function PasswordResetSuccessSection0() { return <>
<main className={"w-full min-h-screen bg-surface flex flex-col justify-center"}><div className={"flex flex-col w-full"}>
<div className={"w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surface"}>

<div className={"lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-18 bg-surface z-10"}>



<main className={"w-full max-w-md mx-auto my-auto py-8"}>

<div className={"relative w-16 h-16 rounded-full bg-secondary-container/40 flex items-center justify-center mb-6 shadow-sm"}>
<div className={"absolute inset-0 rounded-full bg-secondary-container/20 animate-ping opacity-75"}></div>
<div className={"w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow"}>
<Icon name="check" className="material-symbols-outlined text-[28px]" />
</div>
</div>

<div className={"space-y-3 mb-6"}>
<h1 className={"font-headline-lg text-headline-lg text-on-surface tracking-tight"}>{"\n            Password Reset Successfully\n          "}</h1>
<p className={"font-body-lg text-body-lg text-on-surface-variant leading-relaxed"}>{"\n            Your account credentials have been updated securely. You can now sign in using your new password to access your bookings or manage your properties.\n          "}</p>
</div>

<div className={"p-4 rounded-xl bg-surface-container-low shadow-sm mb-8 flex items-start gap-3.5"}>
<Icon name="shield_lock" className="material-symbols-outlined text-primary text-[22px] mt-0.5" />
<div className={"flex flex-col gap-0.5"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>{"\n              Session Security Active\n            "}</span>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"\n              All previous active sessions have been signed out to protect your account integrity.\n            "}</p>
</div>
</div>

<div className={"flex flex-col gap-3"}>
<Link href="/auth/login" className={"w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:brightness-105 active:scale-[0.99]"}>
<span>Back to Login</span>
<Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
</Link>
<ActionButton className={"w-full h-11 rounded-xl bg-transparent text-on-surface-variant font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 hover:bg-surface-container-low hover:text-on-surface"} actionLabel={"help_outline Need help with your account?"} aria-label={"help_outline Need help with your account?"}>
<Icon name="help_outline" className="material-symbols-outlined text-[18px]" />
<span>{"Need help with your account?"}</span>
</ActionButton>
</div>

<div className={"mt-8 pt-6 flex items-center justify-between text-on-surface-variant"}>
<div className={"flex items-center gap-2"}>
<Icon name="verified_user" className="material-symbols-outlined text-[16px] text-secondary" />
<span className={"font-caption text-caption"}>{"Identity Confirmed"}</span>
</div>
<span className={"font-caption text-caption text-outline"}>{"\u00b7"}</span>
<div className={"flex items-center gap-2"}>
<Icon name="devices" className="material-symbols-outlined text-[16px] text-secondary" />
<span className={"font-caption text-caption"}>{"Devices Synced"}</span>
</div>
<span className={"font-caption text-caption text-outline"}>{"\u00b7"}</span>
<div className={"flex items-center gap-2"}>
<Icon name="schedule" className="material-symbols-outlined text-[16px] text-secondary" />
<span className={"font-caption text-caption"}>{"Updated Just Now"}</span>
</div>
</div>
</main>

<footer className={"w-full pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-caption text-caption"}>
<p>{"\u00a9 2025 StayLeb Technologies Ltd. All rights reserved."}</p>
<div className={"flex items-center gap-4"}>
<ActionButton className={"hover:text-primary transition-colors"} actionLabel={"Privacy Policy"} aria-label={"Privacy Policy"}>{"Privacy Policy"}</ActionButton>
<span className={"text-outline"}>{"\u00b7"}</span>
<ActionButton className={"hover:text-primary transition-colors"} actionLabel={"Terms of Service"} aria-label={"Terms of Service"}>{"Terms of Service"}</ActionButton>
<span className={"text-outline"}>{"\u00b7"}</span>
<ActionButton className={"hover:text-primary transition-colors"} actionLabel={"Support Concierge"} aria-label={"Support Concierge"}>{"Support Concierge"}</ActionButton>
</div>
</footer>
</div>

<div className={"hidden lg:relative lg:col-span-6 lg:flex flex-col justify-between p-12 overflow-hidden bg-surface-container-highest"}>

<div className={"absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out hover:scale-105"} data-alt={"Sun-drenched Mediterranean traditional Lebanese heritage stone villa overlooking the azure Batroun coast, featuring arched limestone windows, a terracotta tiled roof, vibrant bougainvillea flowers, olive trees on an ancient stone terrace, an infinity pool reflecting the turquoise sea, and the historic Phoenician seawall in the warm golden afternoon light."} style={{"backgroundImage": "url('/images/d0ebff8a1adb7dd6.jpg')"}}></div>

<div className={"absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/25 to-inverse-surface/40"}></div>
<div className={"absolute inset-0 bg-gradient-to-r from-surface/20 via-transparent to-transparent"}></div>

<div className={"relative z-10 flex items-center justify-between w-full"}>
<div className={"px-4 py-2 rounded-full bg-surface/90 backdrop-blur-md text-on-surface flex items-center gap-2 shadow-sm"}>
<Icon name="location_on" className="material-symbols-outlined text-secondary text-[18px]" />
<span className={"font-label-sm text-label-sm font-semibold tracking-wide"}>{"Batroun Coastal Villas \u00b7 North Lebanon"}</span>
</div>
<div className={"flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-inverse-surface/60 backdrop-blur-md text-surface font-caption text-caption"}>
<Icon name="grade" className="material-symbols-outlined text-secondary-fixed text-[16px]" />
<span className={"font-semibold text-surface-bright"}>{"4.98"}</span>
<span className={"text-surface-variant/80"}>{"(240+ Verified Reviews)"}</span>
</div>
</div>

<div className={"relative z-10 my-auto self-end max-w-xs"}>
<div className={"p-4 rounded-xl bg-surface/90 backdrop-blur-md text-on-surface shadow-xl flex items-center gap-3"}>
<div className={"w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 shadow-sm"}>
<Icon name="auto_awesome" className="material-symbols-outlined text-[22px]" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md font-semibold text-on-surface"}>{"Curated Architecture"}</span>
<span className={"font-caption text-caption text-on-surface-variant"}>{"Over 480 hand-inspected Lebanese chalets"}</span>
</div>
</div>
</div>

<div className={"relative z-10 w-full max-w-xl"}>
<div className={"p-6 rounded-xl bg-surface/90 backdrop-blur-md text-on-surface shadow-2xl"}>
<div className={"flex items-center gap-2 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold mb-2"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary"}></span>{"\n            Guest & Host Portal\n          "}</div>
<h2 className={"font-title-md text-title-md font-bold text-on-surface mb-2"}>{"\n            Welcome back to StayLeb\n          "}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant leading-relaxed"}>{"\n            Seamless stays across Lebanon's most authentic hideaways \u2014 from restored stone palaces in the Chouf to cliffside sea lodges in Byblos and alpine cedar sanctuaries.\n          "}</p>

<div className={"mt-4 pt-4 flex items-center justify-between bg-surface-container-low/60 rounded-lg px-3.5 py-2.5"}>
<div className={"flex items-center gap-3"}>
<div className={"flex -space-x-2 overflow-hidden"}>
<div className={"inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-cover bg-center"} data-alt={"Portrait of an authentic Lebanese villa host in Byblos smiling warmly against a sunlit stone courtyard."} style={{"backgroundImage": "url('/images/f82e5ff594604b40.jpg')"}}></div>
<div className={"inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-cover bg-center"} data-alt={"Portrait of a Mediterranean boutique chalet manager wearing linen attire in a scenic mountain vineyard."} style={{"backgroundImage": "url('/images/0d39942aaa4476a3.jpg')"}}></div>
<div className={"inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-cover bg-center"} data-alt={"Portrait of a Lebanese hospitality specialist welcoming guests to an authentic coastal retreat."} style={{"backgroundImage": "url('/images/a98734ad853fba1a.jpg')"}}></div>
</div>
<span className={"font-caption text-caption text-on-surface font-medium"}>{"100% Superhost Verified"}</span>
</div>
<div className={"flex items-center gap-1 text-primary font-caption text-caption font-semibold"}>
<span>{"Instant Confirmation"}</span>
<Icon name="check_circle" className="material-symbols-outlined text-[15px]" />
</div>
</div>
</div>
</div>
</div>
</div>
</div></main>
</>; }
