"use client";
import { useEffect, useState } from "react";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getMyBookings } from "@/services/bookings";
import type { BookingResponse } from "@/services/bookings";
import { getPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
import { getReviewByBooking, type Review } from "@/services/reviews";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function MyBookingsSection0() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [bookings, setBookings] = useState<BookingResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propsMap, setPropsMap] = useState<Record<number, PropertyResponse>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "completed">(() => {
    const urlFilter = searchParams.get("status");
    const validFilters = ["all", "pending", "confirmed", "cancelled", "completed"] as const;
    return (validFilters.includes(urlFilter as any) ? urlFilter : "all") as "all" | "pending" | "confirmed" | "cancelled" | "completed";
  });
  const [reviewMap, setReviewMap] = useState<Record<number, Review | null | undefined>>({});

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      setLoading(true); setError(null);
      try{
        const data = await getMyBookings();
        if(!cancelled) setBookings(data);
        // fetch properties
        const unique = [...new Set(data.map(b=>b.property_id))];
        const map: Record<number, PropertyResponse> = {};
        await Promise.all(unique.map(async pid=>{
          try{ const p = await getPublicProperty(pid); map[pid]=p; } catch{}
        }));
        if(!cancelled) setPropsMap(map);
        // For completed bookings, check review status (404 = not reviewed)
        const completed = data.filter(b=>b.status==="completed");
        if (completed.length>0) {
          const reviews = await Promise.all(completed.map(async b=>{
            try{ const r = await getReviewByBooking(b.id); return { id:b.id, review:r }; } catch{ return { id:b.id, review:null }; }
          }));
          if(!cancelled){
            const m: Record<number, Review|null> = {};
            reviews.forEach(({id, review})=>{ m[id]=review; });
            setReviewMap(m);
          }
        }
      }catch(e){ if(!cancelled) setError(e instanceof Error? e.message:'Failed to load bookings');}
      finally{ if(!cancelled) setLoading(false); }
    }
    load();
    return ()=>{cancelled=true;}
  },[]);

  const setFilterWithUrl = (newFilter: "all" | "pending" | "confirmed" | "cancelled" | "completed") => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("status");
    } else {
      params.set("status", newFilter);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (loading) return <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16"><span className="w-8 h-8 border-2 border-[#157375] border-t-transparent rounded-full animate-spin"/><p className="ml-3 text-sm text-[#64748B]">Loading bookings…</p></main>;
  if (error) return <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16"><div className="text-center"><p className="text-red-600 text-sm">{error}</p><Link href="/search" className="text-[#157375] font-semibold underline mt-4 inline-block">Discover stays</Link></div></main>;
  const list = bookings ?? [];
  const counts = { all: list.length, pending: list.filter(b=>b.status==='pending').length, confirmed: list.filter(b=>b.status==='confirmed' || b.status==='paid').length, cancelled: list.filter(b=>b.status==='cancelled' || b.status==='rejected').length, completed: list.filter(b=>b.status==='completed').length };
  const filtered = filter === "all" ? list : filter === "pending" ? list.filter(b=>b.status==='pending') : filter === "confirmed" ? list.filter(b=>b.status==='confirmed' || b.status==='paid') : filter === "completed" ? list.filter(b=>b.status==='completed') : list.filter(b=>b.status==='cancelled' || b.status==='rejected');

  const tabs = [
    { key: "all" as const, label: "Total", count: counts.all, icon: "luggage", activeIcon: "text-white", idleIcon: "text-[#157375]" },
    { key: "pending" as const, label: "Pending", count: counts.pending, icon: "schedule", activeIcon: "text-white", idleIcon: "text-[#D97706]" },
    { key: "confirmed" as const, label: "Confirmed", count: counts.confirmed, icon: "check_circle", activeIcon: "text-white", idleIcon: "text-[#059669]" },
    { key: "completed" as const, label: "Completed", count: counts.completed, icon: "event_available", activeIcon: "text-white", idleIcon: "text-[#2563EB]" },
    { key: "cancelled" as const, label: "Cancelled", count: counts.cancelled, icon: "cancel", activeIcon: "text-white", idleIcon: "text-[#DC2626]" },
  ];

  function statusMeta(status: string) {
    if (status === "pending") return { label: "Pending", pill: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]", icon: "schedule" };
    if (status === "confirmed" || status === "paid") return { label: "Confirmed", pill: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]", icon: "check_circle" };
    if (status === "completed") return { label: "Completed", pill: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]", icon: "event_available" };
    return { label: "Cancelled", pill: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]", icon: "cancel" };
  }

  return <>
  <main className="w-full min-h-screen bg-[#F2F5FA] flex flex-col"><div className="flex flex-col w-full">
  <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
  {/* Page hero */}
  <section className="relative overflow-hidden rounded-[22px] border border-[#E9EEF3] bg-gradient-to-r from-white via-[#F4F9FA] to-[#E8F3F3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] px-6 sm:px-8 py-7 sm:py-9">
    <div className="absolute inset-y-0 right-0 w-[52%] hidden md:block pointer-events-none" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/search_hero.png" alt="" className="w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#F4F9FA] via-[#F4F9FA]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent" />
    </div>
    <div className="absolute inset-y-0 right-0 w-full md:hidden pointer-events-none opacity-[0.12]" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/search_hero.png" alt="" className="w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40" />
    </div>
    <div className="relative max-w-2xl">
      <div className="flex items-center gap-2 text-[#157375]"><Icon name="luggage" className="material-symbols-outlined text-[20px]" /><span className="text-[11px] font-bold uppercase tracking-[0.16em]">Travel Registry</span></div>
      <h1 className="text-[30px] sm:text-[38px] leading-[1.1] font-extrabold text-[#0F2432] tracking-tight mt-2">My Bookings</h1>
      <p className="text-[13.5px] sm:text-[15px] text-[#64748B] mt-2 max-w-xl">Track payments, revisit past stays and manage every reservation in one place.</p>
    </div>
  </section>

  {/* Status filter bar */}
  <div className="bg-white rounded-[20px] border border-[#E9EEF3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] p-2 sm:p-2.5 overflow-x-auto">
    <div className="flex items-stretch gap-1 min-w-max sm:min-w-0 sm:grid sm:grid-cols-5" role="tablist" aria-label="Filter bookings by status">
      {tabs.map((t, i) => {
        const active = filter === t.key;
        return (
          <div key={t.key} className="flex items-stretch min-w-max sm:min-w-0 flex-1">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilterWithUrl(t.key)}
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-[14px] font-semibold transition-all w-full whitespace-nowrap ${active ? "bg-[#157375] text-white shadow-[0_8px_20px_rgba(21,115,117,0.3)]" : "bg-white text-[#0F2432] hover:bg-[#F1F8F8]"}`}
            >
              <Icon name={t.icon} className={`material-symbols-outlined text-[22px] ${active ? t.activeIcon : t.idleIcon}`} />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[16px] font-extrabold">{t.count}</span>
                <span className={`text-[12px] font-medium ${active ? "text-white/90" : "text-[#64748B]"}`}>{t.label}</span>
              </span>
            </button>
            {i < tabs.length - 1 && <span className="hidden sm:block w-px self-stretch my-2 ml-1 bg-[#EEF2F6]" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  </div>

  {list.length===0 ? (
    <div className="p-10 sm:p-14 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3] text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#E6F4F4] flex items-center justify-center text-[#157375]"><Icon name="travel_explore" className="material-symbols-outlined text-[30px]" /></div>
      <h3 className="text-[18px] font-bold text-[#0F2432]">No bookings yet</h3>
      <p className="text-[13.5px] text-[#64748B] max-w-md">When you book a StayLeb chalet, your reservation details will appear here.</p>
      <Link className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#157375] hover:bg-[#0f5f61] text-white text-[13.5px] font-semibold shadow-[0_8px_20px_rgba(21,115,117,0.25)] transition-all" href="/account/properties">Discover Properties<Icon name="arrow_forward" className="material-symbols-outlined text-[17px]" /></Link>
    </div>
   ) : filtered.length===0 ? (
     <div className="p-10 sm:p-12 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3] text-center space-y-3">
       <div className="w-14 h-14 mx-auto rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#157375]"><Icon name="search_off" className="material-symbols-outlined text-[26px]" /></div>
       <p className="text-[14px] font-bold text-[#0F2432]">No {filter} bookings found.</p>
       <p className="text-[13px] text-[#64748B]">Try a different status to see your other reservations.</p>
       <button type="button" onClick={()=>setFilterWithUrl("all")} className="text-[13.5px] font-bold text-[#157375] hover:underline">Show all bookings</button>
     </div>
   ) : (
     <div className="space-y-5">
       {filtered.map(b=>{
        const prop = propsMap[b.property_id];
        const img = prop?.images?.find(i=>i.is_primary)?.image_url || prop?.images?.[0]?.image_url || '/images/e1e779f8d5dc0f92.jpg';
        const meta = statusMeta(b.status);
        return (
           <article key={b.id} className="bg-white rounded-[20px] border border-[#E9EEF3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] hover:shadow-[0_16px_35px_-12px_rgba(21,115,117,0.22)] transition-all p-4 sm:p-5">
             <div className="flex flex-col md:flex-row gap-5 items-stretch">
               <div className="relative w-full md:w-[280px] lg:w-[300px] h-52 md:h-auto md:min-h-[216px] rounded-[14px] overflow-hidden shrink-0 bg-[#EEF2F6]">
                 <LocalImage className="absolute inset-0 w-full h-full object-cover" src={img} alt={prop?.title || 'Property'} />
                 <div className="absolute inset-x-0 bottom-0 bg-[#0B1E24]/72 backdrop-blur-[2px] px-3.5 py-2 flex items-center justify-between text-white text-[12px] font-medium">
                   <span className="flex items-center gap-1.5 truncate"><Icon name="location_on" className="material-symbols-outlined text-[16px] text-white shrink-0" />{prop?.location || 'Lebanon'}</span>
                   <span className="flex items-center gap-1.5 shrink-0 ml-2 border-l border-white/25 pl-2.5"><Icon name="confirmation_number" className="material-symbols-outlined text-[16px] text-white" />Code: #SL-{b.id.toString().padStart(4,'0')}</span>
                 </div>
               </div>
               <div className="flex-1 min-w-0 flex flex-col">
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold w-fit ${meta.pill}`}><Icon name={meta.icon} className="material-symbols-outlined text-[16px]" />{meta.label}</span>
                 <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0F2432] tracking-tight mt-2.5 line-clamp-1">{prop?.title || `Property #${b.property_id}`}</h2>
                 <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2.5 text-[13px] text-[#475569]">
                   <span className="flex items-center gap-1.5"><Icon name="calendar_month" className="material-symbols-outlined text-[18px] text-[#64748B]" />{b.check_in} → {b.check_out}</span>
                   <span className="flex items-center gap-1.5"><Icon name="group" className="material-symbols-outlined text-[18px] text-[#64748B]" />{b.guests} {Number(b.guests) === 1 ? 'guest' : 'guests'}</span>
                   <span className="flex items-center gap-1.5"><Icon name="payments" className="material-symbols-outlined text-[18px] text-[#64748B]" />{b.status==='pending' ? 'Awaiting payment' : 'Paid'}</span>
                 </div>
                 <div className="border-t border-[#EEF2F6] mt-3.5 pt-3">
                   <span className="flex items-center gap-1.5 text-[12.5px] text-[#64748B]"><Icon name="description" className="material-symbols-outlined text-[17px]" />Created {new Date(b.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
               <div className="md:w-[190px] lg:w-[210px] shrink-0 flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-3 md:gap-3 md:border-l md:border-[#EEF2F6] md:pl-5 pt-4 md:pt-1 border-t md:border-t-0 border-[#EEF2F6]">
                 <div className="md:text-left">
                   <p className="text-[24px] sm:text-[26px] font-extrabold text-[#157375] tracking-tight leading-none">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(b.total_price))}</p>
                   <p className="text-[12.5px] text-[#64748B] mt-1.5">total · {b.number_of_nights} nights</p>
                 </div>
                 <div className="flex flex-col gap-2 w-auto md:w-full md:mt-2">
                   <Link className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#46B1B1] to-[#157375] hover:brightness-[1.05] text-white text-[13.5px] font-bold shadow-[0_8px_20px_rgba(21,115,117,0.3)] transition-all active:scale-[0.99] whitespace-nowrap" href={`/account/bookings/${b.id}?booking_id=${b.id}`}>View Details<Icon name="arrow_forward" className="material-symbols-outlined text-[17px] text-white" /></Link>
                   {b.status==="completed" && (
                     reviewMap[b.id] === undefined ? (
                       <span className="px-4 py-2 text-xs text-[#64748B] text-center">Checking review…</span>
                     ) : reviewMap[b.id] ? (
                       <span className="inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-[#ECFDF5] text-[#047857] text-[12.5px] font-bold border border-[#A7F3D0]">Reviewed ✓</span>
                     ) : (
                       <Link className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-[#157375]/40 text-[#157375] text-[12.5px] font-bold hover:bg-[#157375] hover:text-white hover:border-[#157375] transition-all whitespace-nowrap" href={`/account/bookings/${b.id}/review`}>Write Review</Link>
                     )
                   )}
                 </div>
               </div>
             </div>
           </article>
        );
      })}
    </div>
  )}

  </div>
  </div></main>
  </>;
}
