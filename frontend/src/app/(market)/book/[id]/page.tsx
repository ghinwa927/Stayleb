"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBooking } from "@/components/features/booking/BookingContext";

export default function Page(){
  const params = useParams() as {id?:string};
  const router = useRouter();
  const { draft } = useBooking();
  useEffect(()=>{
    if(!params.id) return;
    // Redirect duplicate Choose Dates step → Price & Review if draft exists, else Property Details
    if(draft && draft.propertyId === params.id){
      router.replace(`/market/book/${params.id}/summary`);
    } else {
      router.replace(`/properties/${params.id}`);
    }
  },[params.id, draft, router]);
  return <div className="p-10 text-center text-sm text-slate-500">Redirecting to booking review…</div>;
}
