"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { isAuthenticated } from '@/lib/authGuard';
import { getBooking } from '@/services/bookings';
import type { BookingResponse, BookingPreviewResponse } from '@/services/bookings';

type Stay = { checkIn: string; checkOut: string; adults: number; children: number; method: 'Card' | 'Cash'; name: string; email: string; };
const initial: Stay = { checkIn:'2026-09-25',checkOut:'2026-09-28',adults:2,children:2,method:'Card',name:'Maya Haddad',email:'maya.haddad@example.com' };
export type BookingDraft = { propertyId: string; checkIn: string; checkOut: string; guests: number };

// Helper: check if booking is a temporary checkout hold (pending with expires_at)
function isTemporaryCheckoutHold(booking: BookingResponse | null): boolean {
  if (!booking) return false;
  return booking.status === 'pending' && !!booking.expires_at;
}

// Helper: get seconds until expires_at, null if not applicable or expired
function getExpiresAtSecondsRemaining(booking: BookingResponse | null): number | null {
  if (!booking?.expires_at) return null;
  const expires = new Date(booking.expires_at).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((expires - now) / 1000));
  return diff;
}

const BookingContext = createContext<{
  stay: Stay;
  update: (patch: Partial<Stay>) => void;
  draft: BookingDraft | null;
  setDraft: (d: BookingDraft | null) => void;
  clearDraft: () => void;
  preview: BookingPreviewResponse | null;
  setPreview: (p: BookingPreviewResponse | null) => void;
  booking: BookingResponse | null;
  setBooking: (b: BookingResponse | null) => void;
  bookingLoading: boolean;
  isTemporaryCheckoutHold: (booking: BookingResponse | null) => boolean;
  getExpiresAtSecondsRemaining: (booking: BookingResponse | null) => number | null;
}>({stay:initial,update:()=>{}, draft:null, setDraft:()=>{}, clearDraft:()=>{}, preview:null, setPreview:()=>{}, booking:null, setBooking:()=>{}, bookingLoading:false, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining});

const DRAFT_KEY = 'stayleb-booking-draft';
const PREVIEW_KEY = 'stayleb-booking-preview';

export function BookingProvider({children}:{children:ReactNode}) {
 const [stay,setStay]=useState(initial);
 const [draft, setDraftState] = useState<BookingDraft | null>(null);
 const [preview, setPreviewState] = useState<BookingPreviewResponse | null>(null);
 const [booking, setBooking] = useState<BookingResponse | null>(null);
 const [bookingLoading, setBookingLoading] = useState(false);
 const router=useRouter(); const pathname=usePathname();

 // Hydrate draft/preview from sessionStorage on client only (avoid hydration mismatch)
 useEffect(()=>{
   try{
     const raw = sessionStorage.getItem(DRAFT_KEY);
     if(raw){ const parsed = JSON.parse(raw); if(parsed && parsed.propertyId && parsed.checkIn && parsed.checkOut && typeof parsed.guests === 'number') setDraftState(parsed); }
   }catch{}
   try{
     const raw = sessionStorage.getItem(PREVIEW_KEY);
     if(raw) setPreviewState(JSON.parse(raw));
   }catch{}
 },[]);

 const setDraft = (d: BookingDraft | null) => {
   setDraftState(d);
   try{
     if(d) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
     else sessionStorage.removeItem(DRAFT_KEY);
   }catch{}
 };
 const setPreview = (p: BookingPreviewResponse | null) => {
   setPreviewState(p);
   try{
     if(p) sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(p));
     else sessionStorage.removeItem(PREVIEW_KEY);
   }catch{}
 };
 const clearDraft = () => { setDraft(null); setPreview(null); };

 useEffect(()=>{ if(typeof window!=='undefined' && !isAuthenticated()){
   Swal.fire({
     title: 'Please log in to book',
     text: 'You need to log in before you can continue to booking. Sign in to reserve your stay.',
     icon: 'info',
     showCancelButton: true,
     confirmButtonText: 'Go to Login',
     cancelButtonText: 'Continue as Guest',
     confirmButtonColor: '#3a9a9e',
     cancelButtonColor: '#e7eeff',
   }).then((result)=>{
     if(result.isConfirmed) router.replace('/auth/login?next='+encodeURIComponent(pathname));
     else router.replace('/search');
   });
 } },[pathname,router]);

 // Load booking if booking_id in query or session (only after actual booking creation)
 useEffect(()=>{
   const getBid = ()=>{
     if (typeof window==='undefined') return null;
     const qs = new URLSearchParams(window.location.search);
     return qs.get('booking_id') || sessionStorage.getItem('stayleb-latest-booking-id') || localStorage.getItem('stayleb-latest-booking-id');
   };
   const bid = getBid();
   if (!bid) return;
   try {
     const cached = typeof window!=='undefined' ? sessionStorage.getItem('stayleb-latest-booking') : null;
     if (cached) { const parsed = JSON.parse(cached); if (String(parsed.id)===String(bid)) { setBooking(parsed); } }
   } catch {}
   setBookingLoading(true);
   getBooking(bid).then(b=> setBooking(b)).catch(()=>{}).finally(()=> setBookingLoading(false));
 },[pathname]);

 return <BookingContext.Provider value={{stay,update:patch=>setStay(current=>({...current,...patch})), draft, setDraft, clearDraft, preview, setPreview, booking, setBooking, bookingLoading, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining}}>{children}</BookingContext.Provider>;
}
export function useBooking() {
 const {stay,update,draft,setDraft,clearDraft,preview,setPreview,booking, setBooking, bookingLoading, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining}=useContext(BookingContext);
 // If real booking exists, derive nights/lodging/total from booking
 if (booking) {
   const nights = booking.number_of_nights;
   const lodging = Number(booking.total_price);
   return {stay,update,draft,setDraft,clearDraft,preview,setPreview,nights,lodging,total:lodging, booking, setBooking, bookingLoading, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining };
 }
 // If draft exists, derive nights from draft (for preview)
 if (draft) {
   const nights = draft.checkIn && draft.checkOut && draft.checkOut > draft.checkIn ? Math.max(0,Math.round((Date.parse(draft.checkOut)-Date.parse(draft.checkIn))/86400000)) : 0;
   const lodging = preview ? Number(preview.total_price) : 0;
   const total = preview ? Number(preview.total_price) : lodging;
   return {stay,update,draft,setDraft,clearDraft,preview,setPreview,nights,lodging,total, booking: null, setBooking, bookingLoading, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining};
 }
   const nights=Math.max(0,Math.round((Date.parse(stay.checkOut)-Date.parse(stay.checkIn))/86400000));
   const lodging=0;
   return {stay,update,draft,setDraft,clearDraft,preview,setPreview,nights,lodging,total:0, booking: null, setBooking, bookingLoading, isTemporaryCheckoutHold, getExpiresAtSecondsRemaining};
}
export const money=(value:number | string)=> new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value));
