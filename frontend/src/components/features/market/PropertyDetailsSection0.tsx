"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ActionButton } from "@/components/ui/Interactions";
import { requireAuth, isAuthenticated } from "@/lib/authGuard";
import { getPublicProperty, getAvailability } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
import type { AvailabilityResponse } from "@/services/properties";
import { useBooking } from "@/components/features/booking/BookingContext";
import { previewBooking } from "@/services/bookings";
import type { BookingPreviewResponse } from "@/services/bookings";
import { getPropertyReviews, getPropertyReviewStats, type Review, type PropertyReviewStats } from "@/services/reviews";
import { addFavorite, removeFavorite } from "@/services/favorites";
import Swal from "sweetalert2";
import { readPropertySearch, searchValidation } from "@/lib/property-search";

function formatPrice(v: string | number) { const n = Number(v); return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

// Presentation-only helpers (no business logic): map amenity names to Material Symbols.
function amenityIcon(name: string) {
  const n = name.toLowerCase();
  if (/wifi|internet/.test(n)) return 'wifi';
  if (/pool|swim/.test(n)) return 'pool';
  if (/park/.test(n)) return 'local_parking';
  if (/kitchen/.test(n)) return 'kitchen';
  if (/fireplace|fire pit|firewood/.test(n)) return 'fireplace';
  if (/garden|yard/.test(n)) return 'yard';
  if (/sea|ocean|beach/.test(n)) return 'beach_access';
  if (/mountain|view|panorama/.test(n)) return 'landscape';
  if (/tv|television|screen/.test(n)) return 'tv';
  if (/\bac\b|air cond|cooling/.test(n)) return 'ac_unit';
  if (/heat/.test(n)) return 'thermostat';
  if (/wash|laundr/.test(n)) return 'local_laundry_service';
  if (/gym|fitness/.test(n)) return 'fitness_center';
  if (/balcon|terrace|deck/.test(n)) return 'balcony';
  if (/bbq|grill/.test(n)) return 'outdoor_grill';
  if (/generator|solar|power|electric/.test(n)) return 'bolt';
  if (/coffee|espresso/.test(n)) return 'coffee';
  if (/crib|baby|child|kid/.test(n)) return 'child_care';
  if (/pet|dog|cat/.test(n)) return 'pets';
  if (/spa|jacuzzi|sauna|hot tub/.test(n)) return 'spa';
  if (/bath|tub|shower/.test(n)) return 'bathtub';
  if (/workspace|desk|office/.test(n)) return 'desk';
  if (/secur|camera/.test(n)) return 'verified_user';
  if (/breakfast|dining/.test(n)) return 'restaurant';
  if (/bar\b|minibar/.test(n)) return 'liquor';
  if (/game|billiard|pool table/.test(n)) return 'sports_esports';
  return 'check_circle';
}

// Format YYYY-MM-DD as "Jun 4" for display only.
function formatSeasonDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}`;
}

export function PropertyDetailsSection0() {
  const params = useParams() as { id?: string };
  const propertyId = params.id;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchStay] = useState(() => {
    const values = readPropertySearch(new URLSearchParams(searchParams.toString()));
    return searchValidation(values) ? { guests: values.guests } : values;
  });
  const { draft, setDraft, preview, setPreview, setBooking } = useBooking();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState(searchStay.check_in ?? "");
  const [checkOut, setCheckOut] = useState(searchStay.check_out ?? "");
  const [guests, setGuests] = useState(searchStay.guests ?? 2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [previewLocal, setPreviewLocal] = useState<BookingPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<PropertyReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('stayleb_access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          setRole(payload.role?.toLowerCase() || localStorage.getItem('stayleb_role'));
        } catch { setRole(localStorage.getItem('stayleb_role')); }
      } else setRole(localStorage.getItem('stayleb_role'));
    }
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const [prop, avail] = await Promise.all([
          getPublicProperty(propertyId as string),
          getAvailability(propertyId as string).catch(() => null),
        ]);
        if (!cancelled) {
          setProperty(prop);
          setAvailability(avail);
          // Preserve draft guest count on back navigation - don't overwrite if draft exists
          if(!searchStay.guests && draft && draft.propertyId === propertyId){
            setGuests(draft.guests);
          } else {
            setGuests(searchStay.guests ?? Math.min(2, prop.max_guests));
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load property');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [propertyId]);

  // Hydrate from draft when returning from Price & Review (back navigation preserves selections)
  useEffect(()=>{
    if(!searchStay.check_in && !searchStay.guests && draft && draft.propertyId === propertyId){
      setCheckIn(draft.checkIn);
      setCheckOut(draft.checkOut);
      setGuests(draft.guests);
      // Also restore preview if available
      if(preview) setPreviewLocal(preview);
    }
  },[draft, propertyId, preview]);

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const [rev, stats] = await Promise.all([
          getPropertyReviews(propertyId as string).catch(() => [] as Review[]),
          getPropertyReviewStats(propertyId as string).catch(() => null as PropertyReviewStats | null),
        ]);
        if (!cancelled) {
          setReviews(rev);
          setReviewStats(stats);
        }
      } catch (e) {
        if (!cancelled) setReviewsError(e instanceof Error ? e.message : "Failed to load reviews");
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // Fetch server-calculated preview whenever dates/guests are valid - ensures total matches Price & Review
  useEffect(()=>{
    if(!property || !checkIn || !checkOut || checkOut <= checkIn || !guests) { setPreviewLocal(null); setPreview(null); return; }
    const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn))/86400000);
    if(nights < property.min_nights || guests > property.max_guests || guests < 1) { setPreviewLocal(null); setPreview(null); return; }
    // Don't fetch if dates are unavailable locally - let validation handle
    let cancelled = false;
    setPreviewLoading(true);
    previewBooking({ property_id: Number(propertyId), check_in: checkIn, check_out: checkOut, guests })
      .then(p=>{ if(!cancelled){ setPreviewLocal(p); setPreview(p); } })
      .catch(()=>{ if(!cancelled) { setPreviewLocal(null); setPreview(null); } })
      .finally(()=>{ if(!cancelled) setPreviewLoading(false); });
    return ()=>{ cancelled = true; };
  },[property, checkIn, checkOut, guests, propertyId]);

  const handleFavorite = async () => {
    if (!requireAuth({ nextPath: pathname, action: "favorites", router })) return;
    const propertyIdNum = Number(propertyId);
    try {
      // We need to check current favorite status by calling the API or we can just toggle and handle the response
      // For simplicity, we'll try to add and if it fails with 409/conflict, we'll remove
      try {
        await addFavorite(propertyIdNum);
        Swal.fire({ title: 'Saved to favorites', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (addError) {
        // If add fails, try to remove (assuming it was already favorited)
        const msg = addError instanceof Error ? addError.message : '';
        if (msg.includes('already') || msg.includes('duplicate') || msg.includes('409') || msg.includes('conflict')) {
          await removeFavorite(propertyIdNum);
          Swal.fire({ title: 'Removed from favorites', icon: 'success', timer: 1200, showConfirmButton: false });
        } else {
          throw addError;
        }
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e instanceof Error ? e.message : 'Failed to update favorites', icon: 'error', confirmButtonColor: '#157375' });
    }
  };

  const isUnavailable = (dateStr: string) => {
    if (!availability) return false;
    const d = new Date(dateStr + 'T12:00:00');
    for (const b of availability.blocked_dates) {
      const s = new Date(b.start_date + 'T12:00:00'); const e = new Date(b.end_date + 'T12:00:00');
      if (d >= s && d <= e) return true;
    }
    for (const b of availability.booked_dates) {
      const s = new Date(b.check_in + 'T12:00:00'); const e = new Date(b.check_out + 'T12:00:00');
      // booked checkout is exclusive
      if (d >= s && d < e) return true;
    }
    return false;
  };
  const isBlockedDay = (dateStr: string) => {
    if (!availability) return false;
    const d = new Date(dateStr + 'T12:00:00');
    for (const b of availability.blocked_dates) {
      const s = new Date(b.start_date + 'T12:00:00'); const e = new Date(b.end_date + 'T12:00:00');
      if (d >= s && d <= e) return true;
    }
    return false;
  };
  const isBookedDay = (dateStr: string) => {
    if (!availability) return false;
    const d = new Date(dateStr + 'T12:00:00');
    for (const b of availability.booked_dates) {
      const s = new Date(b.check_in + 'T12:00:00'); const e = new Date(b.check_out + 'T12:00:00');
      if (d >= s && d < e) return true;
    }
    return false;
  };
  const handleDayClick = (iso: string) => {
    if (isUnavailable(iso)) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut("");
    } else if (checkIn && !checkOut) {
      if (iso <= checkIn) setCheckIn(iso);
      else setCheckOut(iso);
    }
  };

  const validateDates = (): string | null => {
    if (!property) return 'Property not loaded';
    if (!checkIn || !checkOut) return 'Please select check-in and check-out dates';
    if (checkOut <= checkIn) return 'Check-out must be after check-in';
    const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
    if (nights < property.min_nights) return `This property requires at least ${property.min_nights} night(s)`;
    if (guests > property.max_guests) return `Maximum guests is ${property.max_guests}`;
    if (guests < 1) return 'At least 1 guest required';
    // check unavailable
    const cur = new Date(checkIn + 'T12:00:00');
    const end = new Date(checkOut + 'T12:00:00');
    while (cur < end) {
      const iso = cur.toISOString().slice(0,10);
      if (isUnavailable(iso)) return `Dates include unavailable day: ${iso}`;
      cur.setDate(cur.getDate()+1);
    }
    if (new Date(checkIn + 'T12:00:00') < new Date(new Date().toISOString().slice(0,10)+'T12:00:00')) return 'Check-in cannot be in the past';
    return null;
  };

  const handleBooking = async () => {
    // guest gate
    const authed = isAuthenticated();
    const userRole = role;
    if (!authed) {
      Swal.fire({
        title: 'Please log in to continue with your booking.',
        text: 'You need to log in before you can continue to booking.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Continue as Guest',
        confirmButtonColor: '#157375',
      }).then((r)=>{ if(r.isConfirmed) router.push(`/auth/login?next=${encodeURIComponent(pathname)}`); });
      return;
    }
    if (userRole && userRole !== 'client') {
      Swal.fire({ title: 'Only clients can book', text: 'Your account role does not permit client bookings. Please log in as a client.', icon: 'warning' });
      return;
    }
    const err = validateDates();
    if (err) { Swal.fire({ title: 'Validation error', text: err, icon: 'warning' }); return; }
    if (!propertyId) return;
    // Do NOT create booking yet — store draft and preview then go directly to Price & Review
    // The actual POST /bookings will happen only at final payment commitment (Cash or Card)
    // Use query params as fallback to ensure dates survive navigation even if draft hydration races
    try {
      const newDraft = { propertyId: String(propertyId), checkIn, checkOut, guests } as const;
      setDraft(newDraft);
      if(previewLocal) setPreview(previewLocal);
      // Clear any stale booking that could override draft display in PriceReview
      setBooking(null);
      try {
        sessionStorage.removeItem('stayleb-latest-booking-id');
        sessionStorage.removeItem('stayleb-latest-booking');
        localStorage.removeItem('stayleb-latest-booking-id');
        sessionStorage.removeItem('stayleb-stripe-client-secret');
        sessionStorage.removeItem('stayleb-stripe-booking-id');
      } catch {}
    } catch {}
    router.push(`/market/book/${propertyId}/summary?check_in=${encodeURIComponent(checkIn)}&check_out=${encodeURIComponent(checkOut)}&guests=${guests}`);
  };

  if (loading) {
    return <main className="w-full min-h-screen bg-surface-container-low flex items-center justify-center py-16"><div className="flex flex-col items-center gap-3"><span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /><p className="text-sm text-[#64748B]">Loading property…</p></div></main>;
  }
  if (error || !property) {
    return <main className="w-full min-h-screen bg-surface-container-low flex items-center justify-center py-16"><div className="text-center"><p className="text-red-600 text-sm">{error || 'Property not found'}</p><Link href="/search" className="mt-4 inline-block text-primary underline">Back to search</Link></div></main>;
  }

  const primaryImage = property.images?.find(i=>i.is_primary)?.image_url || property.images?.[0]?.image_url || '/images/9c28520e8f40ad66.jpg';
  const gallery = property.images?.slice(0,5) || [];
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.round((Date.parse(checkOut)-Date.parse(checkIn))/86400000) : 0;
  const displayPrice = Number(property.price_per_night);
  const subtotal = nights ? nights * displayPrice : 0;

  return <>
  <main className={"w-full min-h-screen bg-[#F4F7FB] flex flex-col"}><div className={"flex flex-col w-full"}>



  <div className={"max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12"}>

  {/* Breadcrumb */}
  <nav aria-label="Breadcrumb" className={"flex items-center gap-1.5 text-[12px] font-medium text-[#64748B] mb-4 flex-wrap"}>
    <Link href="/" className="hover:text-[#157375] hover:underline transition-colors">Home</Link>
    <span aria-hidden="true" className="text-[#94A3B8]">›</span>
    <Link href="/search" className="hover:text-[#157375] hover:underline transition-colors">Search Results</Link>
    <span aria-hidden="true" className="text-[#94A3B8]">›</span>
    <span className="hover:text-[#157375] transition-colors">{property.location}</span>
    <span aria-hidden="true" className="text-[#94A3B8]">›</span>
    <span aria-current="page" className="text-[#1E293B] font-semibold truncate max-w-[220px] sm:max-w-[360px]">{property.title}</span>
  </nav>

  {/* Heading band with subtle mountain backdrop */}
  <div className={"relative overflow-hidden rounded-[22px] bg-white border border-[#E3ECF3] shadow-[0_2px_16px_rgba(21,115,117,0.06)] px-5 sm:px-7 pt-6 pb-6 mb-5"}>
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[62%]">
      <img src="/images/view_details.png" alt="" className="h-full w-full object-cover object-center opacity-70" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 55%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 55%)' }} />
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
    <div className={"relative flex flex-col lg:flex-row lg:items-end justify-between gap-4"}>
    <div className={"space-y-2 min-w-0"}>
      <div className={"flex flex-wrap items-center gap-2"}>
        <span className={"inline-flex items-center px-2.5 py-1 rounded-full bg-[#157375]/10 text-[#157375] font-caption text-caption font-bold uppercase tracking-wider"}>{property.property_type === 'chalet' ? 'Chalet' : property.property_type === 'apartment' ? 'Apartment' : property.property_type === 'villa' ? 'Villa' : 'Furnished House'}</span>
        <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F7FB] border border-[#E3ECF3] text-[#64748B] font-caption text-caption font-semibold"}><Icon name="location_on" className="material-symbols-outlined text-[13px] text-[#46B1B1]" />{property.location}</span>
      </div>
      <h1 className={"text-[26px] sm:text-[32px] leading-tight font-extrabold tracking-tight text-[#1E293B]"}>{property.title}</h1>
      <div className={"flex flex-wrap items-center gap-y-2 gap-x-4 text-[13.5px]"}>
        {reviewStats && reviewStats.total_reviews > 0 ? (
          <div className={"flex items-center gap-1.5 text-[#1E293B] font-bold"}>
            <Icon name="star" className="material-symbols-outlined text-[18px] text-amber-500" />
            <span>{Number(reviewStats.overall_rating).toFixed(1)}</span>
            <span className={"font-normal text-[#64748B]"}>({reviewStats.total_reviews} review{reviewStats.total_reviews === 1 ? '' : 's'})</span>
          </div>
        ) : (
          <div className={"flex items-center gap-1.5 text-[#64748B] font-medium"}>
            <Icon name="star" className="material-symbols-outlined text-[18px] text-[#CBD5E1]" />
            <span>New listing — no reviews yet</span>
          </div>
        )}
        <span className={"text-[#CBD5E1] hidden sm:inline"}>{"\u2022"}</span>
        <a className={"flex items-center gap-1 text-[#157375] hover:underline font-semibold"} href={"#locationSection"}>
          <Icon name="pin_drop" className="material-symbols-outlined text-[18px]" />{property.location}{property.address ? ` · ${property.address}` : ''}
        </a>
      </div>
    </div>

    <div className={"flex items-center gap-2.5 shrink-0"}>
      <button onClick={()=>{ if(navigator.share) navigator.share({title:property.title, url: window.location.href}); else { navigator.clipboard.writeText(window.location.href); Swal.fire({title:'Link copied', icon:'success', timer:1200, showConfirmButton:false}); } }} className={"flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E3ECF3] hover:border-[#46B1B1]/50 hover:bg-[#46B1B1]/[0.06] shadow-sm font-label-md text-label-md font-semibold text-[#157375] transition-all"}>
        <Icon name="share" className="material-symbols-outlined text-[18px]" />Share
      </button>
      <button type="button" onClick={handleFavorite} className={"relative group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E3ECF3] hover:border-[#46B1B1]/50 hover:bg-[#46B1B1]/[0.06] shadow-sm font-label-md text-label-md font-semibold text-[#157375] transition-all"}>
        <Icon name="favorite" className="material-symbols-outlined text-[20px] text-error transition-transform group-hover:scale-110" />
        <span className={"font-semibold"}>Save</span>
      </button>
    </div>
    </div>
  </div>

  <section className={"relative rounded-[22px] overflow-hidden shadow-[0_4px_24px_rgba(21,115,117,0.10)] mb-5 bg-white border border-[#E3ECF3] p-2"}>
  <div className={"grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 h-[380px] sm:h-[440px] lg:h-[480px]"}>
  <div className={"col-span-2 row-span-2 relative group overflow-hidden cursor-pointer rounded-[16px]"}>
  <LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} src={primaryImage} alt={property.title} />
  <div className={"absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 pointer-events-none"}></div>
  <span className={"absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[#157375] text-[12px] font-bold shadow-sm"}>{property.property_type === 'chalet' ? 'Chalet' : property.property_type === 'apartment' ? 'Apartment' : property.property_type === 'villa' ? 'Villa' : 'Furnished House'} · {property.location}</span>
  {gallery.length > 0 && (
    <span className={"absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[12px] font-semibold"}>
      <Icon name="photo_library" className="material-symbols-outlined text-[15px]" />{gallery.length} photo{gallery.length === 1 ? '' : 's'}
    </span>
  )}
  </div>
  {gallery.slice(1,5).map((img, idx) => (
    <div key={img.id ?? idx} className={"relative group overflow-hidden cursor-pointer rounded-[16px]"}>
      <LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} src={img.image_url} alt={property.title} />
      <div className={"absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"}></div>
    </div>
  ))}
  {Array.from({ length: Math.max(0, 4 - Math.max(0, gallery.length - 1)) }).map((_, i) => (
    <div key={`ph-${i}`} className={"relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#F4F7FB] to-[#E7EFF5] flex items-center justify-center"}>
      <Icon name="landscape" className="material-symbols-outlined text-[28px] text-[#46B1B1]/30" />
    </div>
  ))}
  </div>
  </section>

  <div className={"grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"}>

  <main className={"lg:col-span-8 flex flex-col gap-5 min-w-0"}>

  <div id="locationSection" className={"bg-white border border-[#E3ECF3] rounded-[20px] px-5 py-4 shadow-[0_2px_14px_rgba(21,115,117,0.06)] grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 scroll-mt-28"}>
  <div className={"flex items-center gap-3 p-2 rounded-2xl"}>
  <div className={"w-11 h-11 rounded-full bg-[#46B1B1]/10 flex items-center justify-center text-[#157375] shrink-0"}>
  <Icon name="group" className="material-symbols-outlined text-[22px]" />
  </div>
  <div className="min-w-0">
  <p className={"text-[15px] font-extrabold text-[#1E293B] leading-tight"}>{property.max_guests} Guests</p>
  <p className={"text-[12px] text-[#64748B]"}>Max capacity</p>
  </div>
  </div>
  <div className={"flex items-center gap-3 p-2 rounded-2xl"}>
  <div className={"w-11 h-11 rounded-full bg-[#46B1B1]/10 flex items-center justify-center text-[#157375] shrink-0"}>
  <Icon name="bed" className="material-symbols-outlined text-[22px]" />
  </div>
  <div className="min-w-0">
  <p className={"text-[15px] font-extrabold text-[#1E293B] leading-tight"}>{property.bedrooms} Bedrooms</p>
  <p className={"text-[12px] text-[#64748B]"}>{property.beds} beds total</p>
  </div>
  </div>
  <div className={"flex items-center gap-3 p-2 rounded-2xl"}>
  <div className={"w-11 h-11 rounded-full bg-[#46B1B1]/10 flex items-center justify-center text-[#157375] shrink-0"}>
  <Icon name="bathtub" className="material-symbols-outlined text-[22px]" />
  </div>
  <div className="min-w-0">
  <p className={"text-[15px] font-extrabold text-[#1E293B] leading-tight"}>{property.bathrooms} Bathrooms</p>
  <p className={"text-[12px] text-[#64748B]"}>{property.bathrooms} total</p>
  </div>
  </div>
  <div className={"flex items-center gap-3 p-2 rounded-2xl"}>
  <div className={"w-11 h-11 rounded-full bg-[#46B1B1]/10 flex items-center justify-center text-[#157375] shrink-0"}>
  <Icon name="calendar_month" className="material-symbols-outlined text-[22px]" />
  </div>
  <div className="min-w-0">
  <p className={"text-[15px] font-extrabold text-[#1E293B] leading-tight"}>Min. {property.min_nights} night{property.min_nights === 1 ? '' : 's'}</p>
  <p className={"text-[12px] text-[#64748B]"}>Minimum stay</p>
  </div>
  </div>
  </div>



  <section className={"p-6 sm:p-7 rounded-[20px] bg-white border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-4"}>
  <div className={"flex items-center justify-between"}>
  <h2 className={"text-[19px] font-extrabold tracking-tight text-[#1E293B]"}>About This Property</h2>
  </div>
  <div className={"text-[14.5px] text-[#475569] space-y-4 leading-[1.75]"}>
  <p>{property.description}</p>
  </div>
  <div className={"flex flex-wrap gap-2 pt-1"}>
  {[
    { icon: 'home', label: property.property_type === 'chalet' ? 'Chalet' : property.property_type === 'apartment' ? 'Apartment' : property.property_type === 'villa' ? 'Villa' : 'Furnished House' },
    { icon: 'location_on', label: property.location },
    { icon: 'group', label: `Sleeps ${property.max_guests}` },
    { icon: 'bed', label: `${property.bedrooms} Bedrooms` },
  ].map((c) => (
    <span key={c.label} className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15 text-[12.5px] font-semibold text-[#157375]"}>
      <Icon name={c.icon} className="material-symbols-outlined text-[16px]" />{c.label}
    </span>
  ))}
  </div>
  </section>

  <section className={"p-6 sm:p-7 rounded-[20px] bg-white border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-5"}>
  <div className={"flex items-center justify-between gap-3"}>
  <div>
  <h2 className={"text-[19px] font-extrabold tracking-tight text-[#1E293B]"}>Amenities & Facilities</h2>
  <p className={"text-[12.5px] text-[#64748B] mt-0.5"}>Everything included with your stay</p>
  </div>
  <span className={"inline-flex items-center px-3 py-1 rounded-full bg-[#46B1B1]/10 text-[#157375] text-[12px] font-bold shrink-0"}>{property.amenities?.length ?? 0} Featured</span>
  </div>
  {property.amenities && property.amenities.length ? (
  <div className={"grid grid-cols-2 lg:grid-cols-4 gap-3"}>
  {property.amenities.map((am)=> (
    <div key={am.id} className={"flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/10 hover:bg-[#46B1B1]/[0.12] transition-colors min-h-[118px] justify-center"}>
      <span className={"w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"}>
        <Icon name={amenityIcon(am.name)} className="material-symbols-outlined text-[#157375] text-[21px]" />
      </span>
      <p className={"text-[13px] font-bold text-[#1E293B] leading-snug"}>{am.name}</p>
      {(am.description || am.category) && (
        <p className={"text-[11.5px] text-[#64748B] leading-snug line-clamp-2"}>{am.description || am.category}</p>
      )}
    </div>
  ))}
  </div>
  ) : <p className="text-sm text-[#64748B]">No amenities listed.</p>}
  </section>

  <section className={"p-6 sm:p-7 rounded-[20px] bg-white border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-5"}>
  <div>
  <h2 className={"text-[19px] font-extrabold tracking-tight text-[#1E293B]"}>Chalet Policies & House Rules</h2>
  <p className={"text-[12.5px] text-[#64748B] mt-0.5"}>Please respect the house guidelines during your stay</p>
  </div>
  {property.property_rules && property.property_rules.length ? (
  <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
  {property.property_rules.map((pr) => (
    <div key={pr.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${pr.allowed ? "bg-[#157375]/[0.05] border-[#157375]/15" : "bg-[#FFF1F2] border-[#FECDD3]"}`}>
      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${pr.allowed ? "bg-[#157375]/10" : "bg-white"}`}>
        <Icon name={pr.allowed ? "check_circle" : "block"} className={`material-symbols-outlined text-[20px] ${pr.allowed ? "text-[#157375]" : "text-[#E11D48]"}`} />
      </span>
      <div className="min-w-0">
        <p className={"text-[13.5px] font-bold text-[#1E293B]"}>{pr.rule?.name || `Rule #${pr.rule_id}`}</p>
        <p className={"text-[12.5px] mt-0.5 " + (pr.allowed ? "text-[#157375] font-medium" : "text-[#64748B]")}>{pr.value || pr.rule?.description || (pr.allowed ? "Allowed" : "Not allowed")}</p>
      </div>
    </div>
  ))}
  </div>
  ) : <p className="text-sm text-[#64748B]">No specific house rules.</p>}
  </section>

  <section className={"p-6 sm:p-7 rounded-[20px] bg-white border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-5"}>
  <div className={"flex items-start gap-3"}>
  <span className={"w-11 h-11 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center shrink-0"}>
    <Icon name="calendar_month" className="material-symbols-outlined text-[24px] text-[#157375]" />
  </span>
  <div>
  <h2 className={"text-[19px] font-extrabold tracking-tight text-[#1E293B]"}>Seasonal Pricing Structure</h2>
  <p className={"text-[12.5px] text-[#64748B] mt-0.5"}>Prices may vary depending on the season. The final price will be calculated based on your selected dates.</p>
  </div>
  </div>
  <div className={"grid grid-cols-2 lg:grid-cols-4 gap-3"}>
  <div className={"p-4 rounded-2xl bg-gradient-to-br from-[#157375] to-[#0E4E50] text-white shadow-[0_6px_18px_rgba(21,115,117,0.30)]"}>
    <p className={"flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white/85"}><Icon name="home" className="material-symbols-outlined text-[15px]" />Base Season</p>
    <p className={"mt-2 text-[20px] font-extrabold"}>{formatPrice(property.price_per_night)}<span className={"text-[12px] font-semibold text-white/75"}> /night</span></p>
    <p className={"mt-1 text-[11.5px] text-white/75"}>Year-round base rate</p>
  </div>
  {property.seasonal_prices && property.seasonal_prices.map(s => (
    <div key={s.id} className={"p-4 rounded-2xl bg-[#46B1B1]/[0.07] border border-[#46B1B1]/15"}>
      <p className={"flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#157375] truncate"}><Icon name="event" className="material-symbols-outlined text-[15px] shrink-0" /><span className="truncate">{s.season_name}</span></p>
      <p className={"mt-2 text-[20px] font-extrabold text-[#1E293B]"}>{formatPrice(s.price_per_night)}<span className={"text-[12px] font-semibold text-[#64748B]"}> /night</span></p>
      <p className={"mt-1 text-[11.5px] font-medium text-[#64748B]"}>{formatSeasonDate(s.start_date)} – {formatSeasonDate(s.end_date)}</p>
    </div>
  ))}
  </div>
  </section>

  <section className={"p-6 sm:p-7 rounded-[20px] bg-white border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-5"}>
  <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
  <div>
  <h2 className={"text-[19px] font-extrabold tracking-tight text-[#1E293B]"}>Availability</h2>
  <p className={"text-[12.5px] text-[#64748B] mt-0.5"}>Select your check-in and check-out dates (Minimum {property.min_nights} night{property.min_nights === 1 ? '' : 's'})</p>
  </div>
  <div className={"flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] font-semibold text-[#475569]"}>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-white border border-[#CBD5E1] shadow-sm"}></span> Available</span>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-[#157375] shadow-sm"}></span> Selected</span>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-[#FFE4E6] border border-[#FECDD3]"}></span> Booked</span>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-[#E2E8F0] border border-[#CBD5E1]"}></span> Blocked</span>
  </div>
  </div>

  <div className={"bg-[#F8FAFC] rounded-2xl border border-[#E3ECF3] p-4 sm:p-5"}>
  <div className={"flex items-center justify-between mb-4"}>
  <button type="button" onClick={()=>setCalMonth(d=> new Date(d.getFullYear(), d.getMonth()-1, 1))} aria-label="Previous month" className={"w-9 h-9 rounded-full bg-white border border-[#E3ECF3] text-[#157375] flex items-center justify-center hover:bg-[#46B1B1]/10 hover:text-[#157375] transition-colors shadow-sm"}><Icon name="chevron_left" className="material-symbols-outlined text-[18px]" /></button>
  <div className={"text-sm font-extrabold tracking-tight text-[#1E293B]"}>{calMonth.toLocaleString('en-US', {month:'long', year:'numeric'})} <span className={"text-[#94A3B8] font-normal mx-2"}>—</span> {new Date(calMonth.getFullYear(), calMonth.getMonth()+1, 1).toLocaleString('en-US', {month:'long', year:'numeric'})}</div>
  <button type="button" onClick={()=>setCalMonth(d=> new Date(d.getFullYear(), d.getMonth()+1, 1))} aria-label="Next month" className={"w-9 h-9 rounded-full bg-white border border-[#E3ECF3] text-[#157375] flex items-center justify-center hover:bg-[#46B1B1]/10 hover:text-[#157375] transition-colors shadow-sm"}><Icon name="chevron_right" className="material-symbols-outlined text-[18px]" /></button>
  </div>
  <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-md"}>
  {[0,1].map(offset=>{
    const d = new Date(calMonth.getFullYear(), calMonth.getMonth()+offset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = d.toLocaleString('en-US', {month:'long'});
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const startWeekday = new Date(year, month, 1).getDay();
    const todayIso = new Date().toISOString().slice(0,10);
    const days: (number|null)[] = [...Array(startWeekday).fill(null), ...Array.from({length: daysInMonth}, (_,i)=> i+1) as number[]];
    while(days.length % 7 !== 0) days.push(null);
    return (
      <div key={offset}>
        <div className={"text-center font-semibold text-sm text-[#157375] mb-3"}>{monthName} {year}</div>
        <div className={"grid grid-cols-7 text-center text-[11px] font-semibold text-on-surface-variant/60 mb-2"}>
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div className={"grid grid-cols-7 gap-1"}>
          {days.map((day, idx)=>{
            if(day===null) return <span key={`e-${idx}`} className={"w-8 h-8 sm:w-9 sm:h-9"} />;
            const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const blocked = isBlockedDay(iso);
            const booked = isBookedDay(iso);
            const unavailable = blocked || booked;
            const past = iso < todayIso;
            const isUnavail = unavailable || past;
            const selected = iso === checkIn || iso === checkOut;
            const inRange = !!(checkIn && checkOut && iso > checkIn && iso < checkOut);
            const isToday = iso === todayIso;
            let cls = "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm transition-all ";
            if(isUnavail){
              if(booked) cls += "bg-red-50 text-red-600 border border-red-200 line-through decoration-red-300 cursor-not-allowed ";
              else if(blocked) cls += "bg-surface-container-low text-[#64748B] border border-surface-container-low line-through cursor-not-allowed ";
              else cls += "bg-surface-container-low text-surface-container-high cursor-not-allowed ";
            } else if(selected){
              cls += "bg-[#157375] text-white font-bold shadow-[0_4px_12px_rgba(21,115,117,0.3)] scale-[1.05] ";
            } else if(inRange){
              cls += "bg-[#157375]/15 text-[#157375] font-semibold ";
            } else {
              cls += "bg-white hover:bg-surface-container-low text-[#157375] hover:shadow-sm active:scale-95 ";
              if(isToday) cls += "ring-1 ring-[#157375]/30 ring-offset-1 ";
            }
            return (
              <button key={iso} type="button" disabled={isUnavail} onClick={()=>handleDayClick(iso)} className={cls} aria-label={iso}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  })}
  </div>
  {availability && (availability.blocked_dates.length>0 || availability.booked_dates.length>0) && (
    <div className={"mt-5 flex flex-wrap gap-2 pt-4 border-t border-surface-container-low"}>
      {availability.booked_dates.slice(0,4).map(b=> (
        <span key={`bk-${b.id}`} className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-medium text-red-700"}>
          <span className={"w-1.5 h-1.5 rounded-full bg-red-500"}></span>{b.check_in} → {b.check_out} · {b.status}
        </span>
      ))}
      {availability.blocked_dates.slice(0,3).map(b=> (
        <span key={`b-${b.id}`} className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-surface-container-low text-[11px] font-medium text-[#64748B]"}>
          <span className={"w-1.5 h-1.5 rounded-full bg-slate-400"}></span>{b.start_date} → {b.end_date}
        </span>
      ))}
      {(availability.booked_dates.length>4 || availability.blocked_dates.length>3) && <span className={"text-[11px] text-on-surface-variant px-2 py-1"}>+ {Math.max(0,availability.booked_dates.length-4 + availability.blocked_dates.length-3)} more</span>}
    </div>
  )}
  </div>

  <div className={"grid sm:grid-cols-2 gap-4"}>
    <label className={"flex flex-col gap-1.5"}>
      <span className={"font-label-sm text-label-sm font-semibold text-[#157375]"}>Check-in</span>
      <div className={"relative"}>
        <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} min={new Date().toISOString().slice(0,10)} className={"w-full h-11 pl-3 pr-10 rounded-xl bg-white border border-surface-container-low text-[#157375] font-medium focus:outline-none focus:ring-2 focus:ring-[#157375]/20 focus:border-[#157375] transition-all"} />
        <Icon name="calendar_today" className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#157375]/60 pointer-events-none" />
      </div>
      {checkIn && isUnavailable(checkIn) && <span className={"text-xs font-medium text-red-600 flex items-center gap-1"}><Icon name="block" className="material-symbols-outlined text-[14px]" /> This date is unavailable</span>}
    </label>
    <label className={"flex flex-col gap-1.5"}>
      <span className={"font-label-sm text-label-sm font-semibold text-[#157375]"}>Check-out</span>
      <div className={"relative"}>
        <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().slice(0,10)} className={"w-full h-11 pl-3 pr-10 rounded-xl bg-white border border-surface-container-low text-[#157375] font-medium focus:outline-none focus:ring-2 focus:ring-[#157375]/20 focus:border-[#157375] transition-all"} />
        <Icon name="event" className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#157375]/60 pointer-events-none" />
      </div>
      {checkOut && isUnavailable(checkOut) && <span className={"text-xs font-medium text-red-600"}>Check-out overlaps blocked date</span>}
    </label>
  </div>
  {checkIn && checkOut && (
    <div className={"flex items-center gap-2 p-3 rounded-xl bg-[#157375]/10 border border-[#157375]/15 text-sm text-[#157375]"}>
      <Icon name="check_circle" className="material-symbols-outlined text-[18px]" />
      <span className={"font-medium"}>{Math.round((Date.parse(checkOut)-Date.parse(checkIn))/86400000)} night(s) selected — {checkIn} → {checkOut}</span>
      <button type="button" onClick={()=>{setCheckIn(""); setCheckOut("");}} className={"ml-auto text-xs font-semibold underline hover:no-underline"}>Clear</button>
    </div>
  )}
  </section>

  <section className="relative overflow-hidden p-6 sm:p-7 rounded-[20px] bg-white border border-[#E3ECF3] shadow-[0_2px_14px_rgba(21,115,117,0.06)] space-y-5">
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-10 w-[320px] sm:w-[420px] opacity-70">
      <img src="/images/view_details_footer.png" alt="" className="w-full h-auto object-contain" />
    </div>
    <div className="relative">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-extrabold tracking-tight text-[#1E293B]">Guest Reviews</h2>
        <p className="text-[12.5px] text-[#64748B] mt-0.5">Verified stays only</p>
      </div>
      {reviewStats && reviewStats.total_reviews > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#157375] text-white text-[12.5px] font-bold shadow-sm shrink-0">
          <Icon name="star" className="material-symbols-outlined text-[15px]" />
          {Number(reviewStats.overall_rating).toFixed(1)} · {reviewStats.total_reviews} review{reviewStats.total_reviews === 1 ? '' : 's'}
        </span>
      )}
    </div>
    </div>
    <div className="relative">
    {reviewsLoading ? (
      <div className="py-8 flex flex-col items-center gap-2">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#64748B]">Loading reviews…</span>
      </div>
    ) : reviewsError ? (
      <p className="text-sm text-rose-600">{reviewsError}</p>
    ) : !reviewStats || reviewStats.total_reviews === 0 ? (
      <div className="py-10 text-center">
        <span className="mx-auto w-14 h-14 rounded-2xl bg-[#46B1B1]/10 flex items-center justify-center mb-3">
          <Icon name="rate_review" className="material-symbols-outlined text-[28px] text-[#157375]" />
        </span>
        <p className="text-[15px] font-extrabold text-[#1E293B]">No reviews yet.</p>
        <p className="text-sm text-[#64748B] mt-1">Be the first to share your verified stay.</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF3]">
          {[
            { label: "Overall", value: reviewStats.overall_rating },
            { label: "Cleanliness", value: reviewStats.cleanliness_rating },
            { label: "Privacy", value: reviewStats.privacy_rating },
            { label: "Wi-Fi", value: reviewStats.wifi_rating },
            { label: "Hot Water", value: reviewStats.hot_water_rating },
            { label: "Location", value: reviewStats.location_rating },
            { label: "Value", value: reviewStats.value_rating },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="text-[#475569]">{r.label}</span>
              <span className="font-bold text-[#1E293B] flex items-center gap-1">
                {Number(r.value).toFixed(1)} <Icon name="star" className="text-amber-500 text-[14px]" />
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-3 mt-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3ECF3] shadow-[0_1px_8px_rgba(21,115,117,0.05)]">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="inline-flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#157375] to-[#46B1B1] text-white flex items-center justify-center shrink-0">
                    <Icon name="person" className="material-symbols-outlined text-[19px]" />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-bold text-[#1E293B] leading-tight">StayLeb Guest</span>
                    <span className="flex items-center gap-1 text-[11.5px] text-[#157375] font-semibold">
                      <Icon name="verified" className="material-symbols-outlined text-[13px]" />Verified stay
                    </span>
                  </span>
                </span>
                <span className="text-xs text-[#64748B] shrink-0">{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${rev.overall_rating} out of 5`}>
                {[1,2,3,4,5].map((s) => (
                  <Icon key={s} name="star" className={`material-symbols-outlined text-[16px] ${s <= Math.round(Number(rev.overall_rating)) ? "text-amber-500" : "text-[#E2E8F0]"}`} />
                ))}
                <span className="ml-1 text-[12px] font-bold text-[#1E293B]">{Number(rev.overall_rating).toFixed(1)}/5</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  { k: "Clean", v: rev.cleanliness_rating },
                  { k: "Privacy", v: rev.privacy_rating },
                  { k: "Wi-Fi", v: rev.wifi_rating },
                  { k: "Hot Water", v: rev.hot_water_rating },
                  { k: "Location", v: rev.location_rating },
                  { k: "Value", v: rev.value_rating },
                ].map((x) => (
                  <span key={x.k} className="px-2 py-0.5 rounded-full bg-[#46B1B1]/[0.08] text-[11.5px] font-semibold text-[#157375]">
                    {x.k}: {x.v}/5
                  </span>
                ))}
              </div>
              {rev.comment ? (
                <p className="text-[13.5px] text-[#475569] leading-relaxed italic">“{rev.comment}”</p>
              ) : (
                <p className="text-xs text-[#64748B] italic">No comment.</p>
              )}
            </div>
          ))}
        </div>
      </>
    )}
    </div>
  </section>

  </main>

  <aside className={"lg:col-span-4 lg:sticky lg:top-24 space-y-4 min-w-0"}>

  <div className={"bg-white rounded-[22px] border border-[#E3ECF3] shadow-[0_8px_30px_rgba(21,115,117,0.10)] p-6 space-y-5"}>

  <div className={"flex items-center justify-between gap-3"}>
  <div className={"flex items-baseline gap-1.5"}>
  <span className={"text-[26px] font-extrabold text-[#157375] tracking-tight"}>{formatPrice(property.price_per_night)}</span>
  <span className={"text-[13.5px] text-[#64748B] font-semibold"}>/ night</span>
  </div>
  <div className={"flex items-center gap-1 text-[13px] text-[#1E293B] font-bold shrink-0"}>
  <Icon name="star" className="material-symbols-outlined text-[17px] text-amber-500" />
  <span>{reviewStats && reviewStats.total_reviews > 0 ? Number(reviewStats.overall_rating).toFixed(1) : "—"}</span>
  {reviewStats && reviewStats.total_reviews > 0 && (
    <span className="font-medium text-[#64748B]">({reviewStats.total_reviews})</span>
  )}
  </div>
  </div>

  <div className={"rounded-2xl bg-[#F8FAFC] border border-[#E3ECF3] p-1.5 space-y-1.5"}>
  <div className={"grid grid-cols-2 gap-1.5"}>
  <div className={"p-3 bg-white rounded-xl border border-[#E3ECF3]"}>
  <label className={"block text-[10.5px] text-[#64748B] uppercase tracking-wider font-bold"}>Check-in</label>
  <div className={"flex items-center gap-1.5 mt-1"}>
  <Icon name="calendar_today" className="material-symbols-outlined text-[#46B1B1] text-[18px]" />
  <span className={"text-[13.5px] font-bold text-[#1E293B] truncate"}>{checkIn || 'Select dates'}</span>
  </div>
  </div>
  <div className={"p-3 bg-white rounded-xl border border-[#E3ECF3]"}>
  <label className={"block text-[10.5px] text-[#64748B] uppercase tracking-wider font-bold"}>Check-out</label>
  <div className={"flex items-center gap-1.5 mt-1"}>
  <Icon name="event" className="material-symbols-outlined text-[#46B1B1] text-[18px]" />
  <span className={"text-[13.5px] font-bold text-[#1E293B] truncate"}>{checkOut || 'Select dates'}</span>
  </div>
  </div>
  </div>

  <div className={"p-3 bg-white rounded-xl border border-[#E3ECF3] flex items-center justify-between"}>
  <div>
  <label className={"block text-[10.5px] text-[#64748B] uppercase tracking-wider font-bold"}>Guests</label>
  <span className={"text-[13.5px] font-bold text-[#1E293B]"}>{guests} Guest{guests === 1 ? '' : 's'}</span>
  </div>
  <div className="flex items-center gap-2">
    <button type="button" aria-label="Remove a guest" onClick={()=> setGuests(Math.max(1, guests-1))} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#157375] hover:bg-[#46B1B1]/15 hover:text-[#157375] flex items-center justify-center font-bold transition-colors">−</button>
    <span className="font-bold text-[#1E293B] min-w-[1.25rem] text-center">{guests}</span>
    <button type="button" aria-label="Add a guest" onClick={()=> setGuests(Math.min(property.max_guests, guests+1))} className="w-8 h-8 rounded-full bg-[#157375] text-white hover:bg-[#0E4E50] hover:text-white flex items-center justify-center font-bold transition-colors">+</button>
  </div>
  </div>
  </div>

  <div className={"flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#46B1B1]/[0.08] border border-[#46B1B1]/20"}>
  <Icon name="info" className="material-symbols-outlined text-[20px] text-[#157375] shrink-0 mt-px" />
  <p className={"text-[12.5px] leading-relaxed text-[#0E4E50]"}>
  <span className={"font-bold"}>Minimum {property.min_nights} night{property.min_nights === 1 ? '' : 's'} stay.</span> {nights ? (nights >= property.min_nights ? `Satisfied (${nights} nights selected).` : `Need ${property.min_nights - nights} more night(s).`) : 'Select dates to check availability and total price.'}
  </p>
  </div>

  <div className={"space-y-2.5 text-[13.5px]"}>
  {previewLoading ? (
    <div className="py-2 text-sm text-[#64748B] animate-pulse">Calculating seasonal pricing…</div>
  ) : previewLocal ? (
    <>
      <div className={"flex items-center justify-between text-[#475569]"}>
        <span>{formatPrice(previewLocal.price_per_night)} × {previewLocal.number_of_nights} night{previewLocal.number_of_nights === 1 ? '' : 's'}</span>
        <span className={"font-semibold text-[#1E293B]"}>{formatPrice(previewLocal.total_price)}</span>
      </div>
      <div className={"pt-3 mt-1 border-t border-[#E3ECF3] flex items-center justify-between text-[15px] font-extrabold text-[#1E293B]"}>
        <span>Total</span>
        <span className={"text-[#157375] text-[19px]"}>{formatPrice(previewLocal.total_price)}</span>
      </div>
      <p className="text-xs text-[#64748B]">Calculated with seasonal rates. No hidden markup.</p>
    </>
  ) : (
    <>
      <div className={"flex items-center justify-between text-[#475569]"}>
        <span>{formatPrice(property.price_per_night)} × {nights || 0} night{(nights || 0) === 1 ? '' : 's'}</span>
        <span className={"font-semibold text-[#1E293B]"}>{formatPrice(subtotal)}</span>
      </div>
      <div className={"flex items-center justify-between text-[#475569]"}>
        <span className={"flex items-center gap-1"}>Cleaning & Firewood fee<Icon name="info" className="material-symbols-outlined text-[16px] text-[#94A3B8] cursor-pointer" /></span>
        <span className={"font-semibold text-[#1E293B]"}>{formatPrice(0)}</span>
      </div>
      <div className={"pt-3 mt-1 border-t border-[#E3ECF3] flex items-center justify-between text-[15px] font-extrabold text-[#1E293B]"}>
        <span>Total before taxes</span>
        <span className={"text-[#157375] text-[19px]"}>{formatPrice(subtotal)}</span>
      </div>
      <p className="text-xs text-[#64748B]">Final total includes seasonal pricing. No hidden markup.</p>
    </>
  )}
  </div>

  <button type="button" onClick={handleBooking} className={"w-full py-4 px-6 rounded-2xl bg-[#157375] hover:bg-[#0E4E50] text-white font-bold text-[15px] shadow-[0_10px_24px_rgba(21,115,117,0.35)] hover:shadow-[0_12px_28px_rgba(21,115,117,0.45)] transition-all flex items-center justify-center gap-2 group"}>
  <span>Continue to Booking</span>
  <Icon name="arrow_forward" className="material-symbols-outlined text-white text-[20px] transition-transform group-hover:translate-x-1" />
  </button>
  <p className={"text-center text-[12px] text-[#64748B] -mt-2"}>You won’t be charged yet. Dates are held upon confirmation.</p>

  <div className={"pt-4 border-t border-[#E3ECF3] space-y-2.5 text-[12.5px] font-medium text-[#475569]"}>
  <div className={"flex items-center gap-2.5"}>
  <Icon name="verified" className="material-symbols-outlined text-[#157375] text-[18px]" />
  <span>Verified host & generator assurance</span>
  </div>
  <div className={"flex items-center gap-2.5"}>
  <Icon name="calendar_month" className="material-symbols-outlined text-[#157375] text-[18px]" />
  <span>Free cancellation per policy before check-in</span>
  </div>
  <div className={"flex items-center gap-2.5"}>
  <Icon name="lock" className="material-symbols-outlined text-[#157375] text-[18px]" />
  <span>Secure and trusted booking</span>
  </div>
  </div>
  </div>

  </aside>
  </div>
  </div>



  </div></main>
  </>;
}
