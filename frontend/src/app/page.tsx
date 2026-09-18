import { SearchBar } from "@/components/features/SearchBar";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyBrowser } from "@/components/features/PropertyBrowser";
import { Action, DataScope } from "@/components/ui/Controls";

export const metadata: Metadata = { title: "Client Home & Browse" };

export default function Page() {
  return <DataScope>
<main className="w-full  bg-surface min-h-screen screen-main" id="main-content">
<div className="flex flex-col w-full">
<section className="relative w-full overflow-hidden -mt-20 pt-28 pb-16 bg-surface-container">
<div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{"backgroundImage": "url('/images/6ee9647a63d61e70.jpg')"}}>

</div>
<div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/50 to-on-surface/30">

</div>
<div className="absolute -top-32 right-10 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl pointer-events-none">

</div>
<div className="relative max-w-7xl mx-auto px-gutter flex flex-col items-center text-center">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-sm mb-space-lg text-on-surface">
<span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse">

</span>
<span className="font-label-md text-label-md tracking-wide uppercase text-primary">
{"Verified Lebanese Retreats"}
</span>
<span className="text-outline-variant">
{"•"}
</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-primary" aria-hidden="true">
{"bolt"}
</span>
{" 24/7 Power Guaranteed "}
</span>
</div>
<h1 className="font-display-lg text-display-lg md:text-[46px] md:leading-[54px] text-surface-bright tracking-tight max-w-4xl mx-auto drop-shadow-sm">
{" Discover Handpicked Chalets & Mountain Lodges Across Lebanon "}
</h1>
<p className="mt-space-md font-body-lg text-body-lg text-surface-container-low max-w-2xl mx-auto drop-shadow">
{" Authentic coastal retreats, snowy mountain escapes, and traditional stone houses — verified with 24/7 solar power and verified Lebanese hosts. "}
</p>
<SearchBar />
<div className="w-full max-w-5xl mt-space-md bg-tertiary-fixed/90 backdrop-blur-md rounded-xl p-3 px-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm shadow-sm text-left">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary-container shadow-sm flex-shrink-0">
<span className="material-symbols-outlined text-[20px] text-tertiary" aria-hidden="true">
{"auto_awesome"}
</span>
</div>
<div>
<span className="font-title-md text-body-md text-on-tertiary-fixed font-semibold">
{"Ask StayLeb AI"}
</span>
<span className="text-tertiary font-body-sm text-body-sm ml-1.5 hidden md:inline">
{"— \"Quiet stone chalet with private pool in Batroun with uninterrupted sea sunset views\""}
</span>
</div>
</div>
<Link className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md hover:bg-surface-bright shadow-sm transition-colors flex-shrink-0" href="/ai-search">
<span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
{"arrow_back_ios_new"}
</span>
<span>
{"Try AI Search"}
</span>
</Link>
</div>
</div>
</section>
<section className="w-full bg-surface-container-lowest py-space-md shadow-sm">
<div className="max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md overflow-x-auto no-scrollbar">
<div className="flex items-center gap-space-sm flex-nowrap shrink-0">
<Action className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-secondary-fixed-dim text-on-secondary-container shadow-sm flex items-center gap-1" type="button" value="" intent="filter">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"explore"}
</span>
<span>
{"All Lebanon"}
</span>
</Action>
<Link className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1" href="/search?region=Batroun">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"waves"}
</span>
<span>
{"Batroun Coast"}
</span>
</Link>
<Link className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1" href="/search?region=Faraya">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"ac_unit"}
</span>
<span>
{"Faraya & Mzaar"}
</span>
</Link>
<Link className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1" href="/search?region=Sour">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"beach_access"}
</span>
<span>
{"Sour Sands"}
</span>
</Link>
<Link className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1" href="/search?region=Byblos">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"castle"}
</span>
<span>
{"Byblos & Jbeil"}
</span>
</Link>
<Link className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1" href="/search?region=Faraya">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"forest"}
</span>
<span>
{"Chouf & Cedars"}
</span>
</Link>
<Link className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1" href="/search?region=Byblos">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"sailing"}
</span>
<span>
{"Jounieh Bay"}
</span>
</Link>
</div>
<div className="hidden lg:flex items-center gap-space-xs shrink-0">
<Link className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors" href="/search/filters">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"tune"}
</span>
<span>
{"More Filters"}
</span>
</Link>
</div>
</div>
</section>
<PropertyBrowser mode="home" />
<section className="max-w-7xl mx-auto w-full px-gutter py-space-xl">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<div className="flex items-center gap-space-xs text-primary font-label-md text-label-md tracking-wider uppercase mb-1">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"map"}
</span>
<span>
{"Regional Gateways"}
</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">
{"Explore Popular Lebanese Regions"}
</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">
{"From mountain ski peaks to ancient Phoenician shores, find your favorite Lebanese micro-climate"}
</p>
</div>
<span className="text-on-surface-variant font-body-sm text-body-sm">
{"4 Main Clusters • 140+ Properties"}
</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
<Link className="md:col-span-7 relative h-72 rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all" href="/properties/azure-coast">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{"backgroundImage": "url('/images/ecccc6c8e6eb031c.jpg')"}}>

</div>
<div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/30 to-transparent">

</div>
<div className="absolute bottom-0 left-0 right-0 p-space-lg flex items-end justify-between">
<div>
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-primary font-label-sm text-label-sm uppercase tracking-wider mb-2 inline-block">
{"North Coast"}
</span>
<h3 className="font-headline-md text-headline-md text-surface-bright">
{"Batroun & Koura"}
</h3>
<p className="font-body-sm text-body-sm text-surface-container-high mt-1">
{"Beach chalets, wineries & coastal nightlife"}
</p>
</div>
<div className="text-right">
<span className="font-title-md text-title-md text-surface-bright font-semibold">
{"54 Chalets"}
</span>
<div className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-primary mt-1 ml-auto group-hover:translate-x-1 transition-transform">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</div>
</div>
</div>
</Link>
<Link className="md:col-span-5 relative h-72 rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all" href="/properties/azure-coast">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{"backgroundImage": "url('/images/087d931ed8e84735.jpg')"}}>

</div>
<div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/30 to-transparent">

</div>
<div className="absolute bottom-0 left-0 right-0 p-space-lg flex items-end justify-between">
<div>
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-primary font-label-sm text-label-sm uppercase tracking-wider mb-2 inline-block">
{"Mount Lebanon"}
</span>
<h3 className="font-headline-md text-headline-md text-surface-bright">
{"Faraya & Mzaar"}
</h3>
<p className="font-body-sm text-body-sm text-surface-container-high mt-1">
{"Ski-in stone chalets & alpine views"}
</p>
</div>
<div className="text-right">
<span className="font-title-md text-title-md text-surface-bright font-semibold">
{"41 Lodges"}
</span>
<div className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-primary mt-1 ml-auto group-hover:translate-x-1 transition-transform">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</div>
</div>
</div>
</Link>
<Link className="md:col-span-5 relative h-72 rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all" href="/properties/azure-coast">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{"backgroundImage": "url('/images/dc0b315b162e2a76.jpg')"}}>

</div>
<div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/30 to-transparent">

</div>
<div className="absolute bottom-0 left-0 right-0 p-space-lg flex items-end justify-between">
<div>
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-primary font-label-sm text-label-sm uppercase tracking-wider mb-2 inline-block">
{"South Coast"}
</span>
<h3 className="font-headline-md text-headline-md text-surface-bright">
{"Sour & Naqoura"}
</h3>
<p className="font-body-sm text-body-sm text-surface-container-high mt-1">
{"Sandy shores & old quarter retreats"}
</p>
</div>
<div className="text-right">
<span className="font-title-md text-title-md text-surface-bright font-semibold">
{"28 Stays"}
</span>
<div className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-primary mt-1 ml-auto group-hover:translate-x-1 transition-transform">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</div>
</div>
</div>
</Link>
<Link className="md:col-span-7 relative h-72 rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all" href="/properties/azure-coast">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{"backgroundImage": "url('/images/a17c09290530d2aa.jpg')"}}>

</div>
<div className="absolute inset-0 bg-linear-to-t from-on-surface/90 via-on-surface/30 to-transparent">

</div>
<div className="absolute bottom-0 left-0 right-0 p-space-lg flex items-end justify-between">
<div>
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-primary font-label-sm text-label-sm uppercase tracking-wider mb-2 inline-block">
{"Historic Mount Lebanon"}
</span>
<h3 className="font-headline-md text-headline-md text-surface-bright">
{"Byblos & Amchit"}
</h3>
<p className="font-body-sm text-body-sm text-surface-container-high mt-1">
{"Cliffside villas, heritage courtyards"}
</p>
</div>
<div className="text-right">
<span className="font-title-md text-title-md text-surface-bright font-semibold">
{"36 Chalets"}
</span>
<div className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-primary mt-1 ml-auto group-hover:translate-x-1 transition-transform">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</div>
</div>
</div>
</Link>
</div>
</section>
<section className="max-w-7xl mx-auto w-full px-gutter py-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm">
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg items-center">
<div className="flex items-start gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[28px]" aria-hidden="true">
{"energy_savings_leaf"}
</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">
{"Guaranteed 24/7 Power"}
</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{" Every StayLeb property guarantees solar battery banks or automated diesel generators with verified fuel reserves. "}
</p>
</div>
</div>
<div className="flex items-start gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
<span className="material-symbols-outlined text-[28px]" aria-hidden="true">
{"support_agent"}
</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">
{"WhatsApp Host Line"}
</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{" Direct connection with Lebanese concierge and hosts for key handover, local directions, and immediate assistance. "}
</p>
</div>
</div>
<div className="flex items-start gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary-container shrink-0">
<span className="material-symbols-outlined text-[28px]" aria-hidden="true">
{"shield_person"}
</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">
{"Secure Settlement"}
</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{" Transparent Fresh USD pricing, international card payments, or local OMT / Whish cash settlement at check-in. "}
</p>
</div>
</div>
</div>
</div>
</section>
<section className="w-full bg-primary-container text-on-primary py-space-md mt-space-md">
<div className="max-w-7xl mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left">
<div className="flex items-center gap-space-sm font-label-md text-label-md tracking-wide">
<span className="material-symbols-outlined text-[20px] text-primary-fixed" aria-hidden="true">
{"verified_user"}
</span>
<span>
{"Guaranteed 24/7 Electricity & Clean Water • Direct Lebanese WhatsApp Host Line • Bank-Grade Security"}
</span>
</div>
<div className="flex items-center gap-space-md shrink-0">
<Action className="font-label-md text-label-md text-primary-fixed hover:underline flex items-center gap-1" intent="dialog" value="Read Lebanon Travel & Power Policy">
<span>
{"Read Lebanon Travel & Power Policy"}
</span>
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">
{"arrow_forward"}
</span>
</Action>
</div>
</div>
</section>
</div>
</main>
</DataScope>;
}
