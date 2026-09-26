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

export function MyBookingsSection0() {
  const [bookings, setBookings] = useState<BookingResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propsMap, setPropsMap] = useState<Record<number, PropertyResponse>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "completed">("all");
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

  if (loading) return <main className="w-full min-h-screen bg-background flex items-center justify-center py-16"><span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/><p className="ml-3 text-sm">Loading bookings…</p></main>;
  if (error) return <main className="w-full min-h-screen bg-background flex items-center justify-center py-16"><div className="text-center"><p className="text-red-600 text-sm">{error}</p><Link href="/search" className="text-primary underline mt-4 inline-block">Discover stays</Link></div></main>;
  const list = bookings ?? [];
  const counts = { all: list.length, pending: list.filter(b=>b.status==='pending').length, confirmed: list.filter(b=>b.status==='confirmed' || b.status==='paid').length, cancelled: list.filter(b=>b.status==='cancelled' || b.status==='rejected').length, completed: list.filter(b=>b.status==='completed').length };
  const filtered = filter === "all" ? list : filter === "pending" ? list.filter(b=>b.status==='pending') : filter === "confirmed" ? list.filter(b=>b.status==='confirmed' || b.status==='paid') : filter === "completed" ? list.filter(b=>b.status==='completed') : list.filter(b=>b.status==='cancelled' || b.status==='rejected');

  return <>
 <main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>
 <div className={"max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8"}>
 <div className={"flex flex-col md:flex-row md:items-end justify-between gap-6"}>
 <div className={"space-y-1.5"}>
 <div className={"flex items-center space-x-2 text-primary"}><Icon name="luggage" className="material-symbols-outlined text-[18px]" /><span className={"font-label-sm text-label-sm uppercase tracking-wider font-semibold"}>Travel Registry</span></div>
 <h1 className={"font-headline-lg text-headline-lg text-on-surface"}>My Bookings</h1>
 <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>Manage your reservations — server as source of truth.</p>
 </div>
 </div>

   <div className={"flex items-center space-x-1 text-sm bg-white rounded-full p-1.5 border w-fit shadow-sm flex-wrap gap-1"}>
    <button type="button" onClick={()=>setFilter("all")} className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter==="all" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{counts.all} total</button>
    <button type="button" onClick={()=>setFilter("pending")} className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter==="pending" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{counts.pending} pending</button>
    <button type="button" onClick={()=>setFilter("confirmed")} className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter==="confirmed" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{counts.confirmed} confirmed</button>
    <button type="button" onClick={()=>setFilter("completed")} className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter==="completed" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{counts.completed} completed</button>
    <button type="button" onClick={()=>setFilter("cancelled")} className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter==="cancelled" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{counts.cancelled} cancelled</button>
  </div>

 {list.length===0 ? (
   <div className="p-12 bg-surface-container-lowest rounded-xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
     <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary"><Icon name="travel_explore" className="material-symbols-outlined text-[32px]" /></div>
     <h3 className="font-title-md text-title-md text-on-surface">No bookings yet</h3>
     <p className="font-body-md text-body-md text-on-surface-variant">When you book a StayLeb chalet, your reservation details will appear here.</p>
     <Link className="px-6 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md inline-block shadow-sm" href="/account/properties">Discover Properties</Link>
   </div>
  ) : filtered.length===0 ? (
    <div className="p-8 bg-surface-container-lowest rounded-xl shadow-sm text-center">
      <p className="font-body-md text-body-md text-on-surface-variant">No {filter} bookings found.</p>
      <button type="button" onClick={()=>setFilter("all")} className="mt-3 text-primary underline text-sm">Show all bookings</button>
    </div>
  ) : (
    <div className="space-y-6">
      {filtered.map(b=>{
       const prop = propsMap[b.property_id];
       const img = prop?.images?.find(i=>i.is_primary)?.image_url || prop?.images?.[0]?.image_url || '/images/e1e779f8d5dc0f92.jpg';
        const statusColor = b.status==='pending' ? 'bg-amber-50 text-amber-700' : b.status==='confirmed' || b.status==='paid' ? 'bg-emerald-50 text-emerald-700' : b.status==='cancelled' || b.status==='rejected' ? 'bg-rose-50 text-rose-700' : b.status==='completed' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700';
       return (
         <article key={b.id} className="booking-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all p-5 md:p-6">
           <div className="flex flex-col lg:flex-row gap-6 items-start">
             <div className="relative w-full lg:w-72 h-48 rounded-lg overflow-hidden shrink-0">
               <LocalImage className="w-full h-full object-cover" src={img} alt={prop?.title || 'Property'} />
               <div className="absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded-lg text-inverse-on-surface flex items-center justify-between text-caption font-caption">
                 <span>{prop?.location || 'Lebanon'}</span><span>Code: #SL-{b.id.toString().padStart(4,'0')}</span>
               </div>
             </div>
             <div className="flex-1 flex flex-col justify-between gap-4 w-full">
               <div>
                 <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                   <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium ${statusColor}`}>{b.status}</span>
                   <span className="font-body-md text-body-md font-semibold text-primary">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(b.total_price))} total · {b.number_of_nights} nights</span>
                 </div>
                 <h2 className="font-title-md text-title-md text-on-surface">{prop?.title || `Property #${b.property_id}`}</h2>
                 <div className="flex flex-wrap items-center gap-3 mt-2 text-on-surface-variant font-body-md text-body-md text-sm">
                   <span className="flex items-center gap-1"><Icon name="calendar_month" className="text-[16px]"/> {b.check_in} → {b.check_out}</span>
                   <span className="flex items-center gap-1"><Icon name="group" className="text-[16px]"/> {b.guests} guests</span>
                   <span className="flex items-center gap-1"><Icon name="payments" className="text-[16px]"/> {b.status==='pending' ? 'Awaiting payment' : 'Paid'}</span>
                 </div>
               </div>
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">Created {new Date(b.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <Link className="px-5 py-2.5 rounded-lg font-label-md text-label-md bg-primary text-white hover:opacity-95 shadow-sm" href={`/account/bookings/${b.id}?booking_id=${b.id}`}>View Details</Link>
                    {b.status==="completed" && (
                      reviewMap[b.id] === undefined ? (
                        <span className="px-4 py-2 text-xs text-slate-400">Checking review…</span>
                      ) : reviewMap[b.id] ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-medium border border-emerald-200">Reviewed ✓</span>
                      ) : (
                        <Link className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary hover:text-white transition-colors" href={`/account/bookings/${b.id}/review`}>Write a Review</Link>
                      )
                    )}
                  </div>
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
