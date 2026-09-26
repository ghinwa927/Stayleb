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
    return <main className="w-full min-h-screen bg-background flex items-center justify-center py-16"><div className="flex flex-col items-center gap-3"><span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /><p className="text-sm text-slate-500">Loading property…</p></div></main>;
  }
  if (error || !property) {
    return <main className="w-full min-h-screen bg-background flex items-center justify-center py-16"><div className="text-center"><p className="text-red-600 text-sm">{error || 'Property not found'}</p><Link href="/search" className="mt-4 inline-block text-primary underline">Back to search</Link></div></main>;
  }

  const primaryImage = property.images?.find(i=>i.is_primary)?.image_url || property.images?.[0]?.image_url || '/images/9c28520e8f40ad66.jpg';
  const gallery = property.images?.slice(0,5) || [];
  const nights = checkIn && checkOut && checkOut > checkIn ? Math.round((Date.parse(checkOut)-Date.parse(checkIn))/86400000) : 0;
  const displayPrice = Number(property.price_per_night);
  const subtotal = nights ? nights * displayPrice : 0;

  return <>
  <main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>



  <div className={"max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"}>

  

  <div className={"flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6"}>
  <div className={"space-y-2"}>
  <h1 className={"font-headline-lg text-headline-lg text-[#157375] tracking-tight"}>{property.title}</h1>
  <div className={"flex flex-wrap items-center gap-y-2 gap-x-4 font-body-md text-body-md"}>
  <div className={"flex items-center gap-1 text-[#157375] font-semibold"}>
  <Icon name="star" className="material-symbols-outlined text-[18px] text-amber-500" />
  <span>{reviewStats && reviewStats.total_reviews > 0 ? Number(reviewStats.overall_rating).toFixed(2) : "—"}</span>
  <span className={"font-normal text-on-surface-variant"}>{reviewStats && reviewStats.total_reviews > 0 ? `(${reviewStats.total_reviews} reviews)` : "(No reviews yet)"}</span>
  </div>
  <span className={"text-outline-variant font-caption hidden sm:inline"}>{"\u2022"}</span>
  <a className={"flex items-center gap-1 text-primary hover:underline font-medium"} href={"#locationSection"}>
  <Icon name="pin_drop" className="material-symbols-outlined text-[18px]" />{property.location} {property.address ? `· ${property.address}` : ''}
  </a>
  </div>
  </div>

  <div className={"flex items-center gap-3"}>
  <button onClick={()=>{ if(navigator.share) navigator.share({title:property.title, url: window.location.href}); else { navigator.clipboard.writeText(window.location.href); Swal.fire({title:'Link copied', icon:'success', timer:1200, showConfirmButton:false}); } }} className={"flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container shadow-sm font-label-md text-label-md text-[#157375] transition-all"}>
  <Icon name="share" className="material-symbols-outlined text-[18px]" />Share
  </button>
  <button type="button" onClick={handleFavorite} className={"relative group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container shadow-sm font-label-md text-label-md text-[#157375] transition-all"}>
  <Icon name="favorite" className="material-symbols-outlined text-[20px] text-error transition-transform group-hover:scale-110" />
  <span className={"font-medium"}>Save</span>
  </button>
  </div>
  </div>

  <section className={"relative rounded-2xl overflow-hidden shadow-md mb-10 bg-surface-container-low"}>
  <div className={"grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[340px] sm:h-[440px] lg:h-[500px]"}>
  <div className={"md:col-span-2 md:row-span-2 relative group overflow-hidden cursor-pointer"}>
  <LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} src={primaryImage} alt={property.title} />
  <div className={"absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none"}></div>
  <span className={"absolute bottom-4 left-4 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-[#157375] font-label-sm text-label-sm font-medium shadow-sm"}>{property.property_type === 'chalet' ? 'Chalet' : 'Furnished House'} · {property.location}</span>
  </div>
  {gallery.slice(1,5).map((img, idx) => (
    <div key={img.id ?? idx} className={"hidden md:block relative group overflow-hidden cursor-pointer"}>
      <LocalImage className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} src={img.image_url} alt={property.title} />
      <div className={"absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"}></div>
    </div>
  ))}
  {gallery.length < 2 && (
    <>
      <div className={"hidden md:block relative group overflow-hidden cursor-pointer bg-surface-container"} />
      <div className={"hidden md:block relative group overflow-hidden cursor-pointer bg-surface-container"} />
      <div className={"hidden md:block relative group overflow-hidden cursor-pointer bg-surface-container"} />
    </>
  )}
  </div>
  </section>

  <div className={"grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>

  <main className={"lg:col-span-8 flex flex-col gap-10"}>

  <div className={"bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4"}>
  <div className={"flex items-center gap-6 sm:gap-8 flex-wrap"}>
  <div className={"flex items-center gap-2.5"}>
  <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary"}>
  <Icon name="group" className="material-symbols-outlined text-[22px]" />
  </div>
  <div>
  <p className={"font-label-md text-label-md font-bold text-[#157375]"}>{property.max_guests} Guests</p>
  <p className={"font-caption text-caption text-on-surface-variant"}>Maximum capacity</p>
  </div>
  </div>
  <div className={"flex items-center gap-2.5"}>
  <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary"}>
  <Icon name="bed" className="material-symbols-outlined text-[22px]" />
  </div>
  <div>
  <p className={"font-label-md text-label-md font-bold text-[#157375]"}>{property.bedrooms} Bedrooms</p>
  <p className={"font-caption text-caption text-on-surface-variant"}>{property.beds} Beds total</p>
  </div>
  </div>
  <div className={"flex items-center gap-2.5"}>
  <div className={"w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary"}>
  <Icon name="bathtub" className="material-symbols-outlined text-[22px]" />
  </div>
  <div>
  <p className={"font-label-md text-label-md font-bold text-[#157375]"}>{property.bathrooms} Bathrooms</p>
  <p className={"font-caption text-caption text-on-surface-variant"}>Heated floorings</p>
  </div>
  </div>
  </div>

  <div className={"flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-sm text-label-sm font-semibold"}>
  <Icon name="hourglass_top" className="material-symbols-outlined text-[18px]" />Min. {property.min_nights} nights stay
  </div>
  </div>



  <section className={"p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm space-y-4"}>
  <div className={"flex items-center justify-between"}>
  <h2 className={"font-headline-sm text-headline-sm text-[#157375]"}>About This Sanctuary</h2>
  </div>
  <div className={"prose font-body-lg text-body-lg text-on-surface-variant space-y-4 leading-relaxed"}>
  <p>{property.description}</p>
  </div>
  </section>

  <section className={"p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm space-y-6"}>
  <div className={"flex items-center justify-between"}>
  <div>
  <h2 className={"font-headline-sm text-headline-sm text-[#157375]"}>Amenities & Facilities</h2>
  <p className={"font-caption text-caption text-on-surface-variant mt-0.5"}>Engineered for comfort</p>
  </div>
  <span className={"font-label-sm text-label-sm text-primary font-semibold"}>{property.amenities?.length ?? 0} Featured</span>
  </div>
  {property.amenities && property.amenities.length ? (
  <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
  {property.amenities.map((am)=> (
    <div key={am.id} className={"flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"}>
      <Icon name="check_circle" className="material-symbols-outlined text-primary text-[22px]" />
      <div>
        <p className={"font-label-md text-label-md font-semibold text-[#157375]"}>{am.name}</p>
        <p className={"font-caption text-caption text-on-surface-variant"}>{am.description || am.category}</p>
      </div>
    </div>
  ))}
  </div>
  ) : <p className="text-sm text-slate-500">No amenities listed.</p>}
  </section>

  <section className={"p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm space-y-4"}>
  <h2 className={"font-headline-sm text-headline-sm text-[#157375]"}>Chalet Policies & House Rules</h2>
  {property.property_rules && property.property_rules.length ? (
  <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
  {property.property_rules.map((pr) => (
    <div key={pr.id} className={"flex items-start gap-3 p-4 rounded-xl bg-surface-container-low"}>
      <Icon name={pr.allowed ? "check_circle" : "block"} className={`material-symbols-outlined text-[20px] mt-0.5 ${pr.allowed ? "text-primary" : "text-error"}`} />
      <div>
        <p className={"font-label-md text-label-md font-semibold text-[#157375]"}>{pr.rule?.name || `Rule #${pr.rule_id}`} {pr.allowed ? "(Allowed)" : "(Not allowed)"}</p>
        <p className={"font-body-md text-body-md text-on-surface-variant"}>{pr.value || pr.rule?.description || (pr.allowed ? "Allowed" : "Not allowed")}</p>
      </div>
    </div>
  ))}
  </div>
  ) : <p className="text-sm text-slate-500">No specific house rules.</p>}
  </section>

  <div className={"p-5 rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low shadow-sm flex items-start sm:items-center gap-4"}>
  <div className={"w-12 h-12 rounded-xl bg-primary flex-shrink-0 flex items-center justify-center text-on-primary shadow-sm"}>
  <Icon name="ac_unit" className="material-symbols-outlined text-[26px]" />
  </div>
  <div className={"space-y-1"}>
  <p className={"font-label-md text-label-md font-bold text-[#157375]"}>Transparent Seasonal Pricing Structure</p>
  <p className={"font-body-md text-body-md text-on-surface-variant"}>
  <span className={"font-semibold text-primary"}>Base Rate: {formatPrice(property.price_per_night)} / night</span>
  {property.seasonal_prices && property.seasonal_prices.length > 0 && property.seasonal_prices.map(s => (
    <span key={s.id}> · {s.season_name} ({s.start_date} – {s.end_date}): {formatPrice(s.price_per_night)}/night</span>
  ))}
  . Dynamically calculated night-by-night in your booking summary.
  </p>
  </div>
  </div>

  <section className={"p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm space-y-6"}>
  <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
  <div>
  <h2 className={"font-headline-sm text-headline-sm text-[#157375]"}>Availability</h2>
  <p className={"font-caption text-caption text-on-surface-variant mt-0.5"}>Select your check-in & check-out dates (Minimum {property.min_nights} nights)</p>
  </div>
  <div className={"flex flex-wrap items-center gap-3 text-[11px] font-medium"}>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-[#157375] shadow-sm"}></span> Selected</span>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-red-500/15 border border-red-500/30"}></span> Booked</span>
  <span className={"flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300"}></span> Blocked</span>
  <span className={"hidden sm:flex items-center gap-1.5"}><span className={"w-2.5 h-2.5 rounded-full bg-[#157375]/15 border border-[#157375]/20"}></span> In range</span>
  </div>
  </div>

  <div className={"bg-white rounded-2xl border border-surface-container-low p-4 sm:p-5 shadow-sm"}>
  <div className={"flex items-center justify-between mb-4"}>
  <button type="button" onClick={()=>setCalMonth(d=> new Date(d.getFullYear(), d.getMonth()-1, 1))} className={"w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"}><Icon name="chevron_left" className="material-symbols-outlined text-[18px]" /></button>
  <div className={"text-sm font-bold tracking-tight text-[#157375]"}>{calMonth.toLocaleString('en-US', {month:'long', year:'numeric'})} <span className={"text-slate-400 font-normal mx-2"}>—</span> {new Date(calMonth.getFullYear(), calMonth.getMonth()+1, 1).toLocaleString('en-US', {month:'long', year:'numeric'})}</div>
  <button type="button" onClick={()=>setCalMonth(d=> new Date(d.getFullYear(), d.getMonth()+1, 1))} className={"w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"}><Icon name="chevron_right" className="material-symbols-outlined text-[18px]" /></button>
  </div>
  <div className={"grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"}>
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
              else if(blocked) cls += "bg-slate-100 text-slate-400 border border-slate-200 line-through cursor-not-allowed ";
              else cls += "bg-slate-50 text-slate-300 cursor-not-allowed ";
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
        <span key={`b-${b.id}`} className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600"}>
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

  <section className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-[#157375]">Guest Reviews</h2>
        <p className="font-caption text-caption text-on-surface-variant mt-0.5">Verified stays only</p>
      </div>
      {reviewStats && reviewStats.total_reviews > 0 && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
          <Icon name="star" className="material-symbols-outlined text-[14px]" />
          {Number(reviewStats.overall_rating).toFixed(2)} · {reviewStats.total_reviews} reviews
        </span>
      )}
    </div>
    {reviewsLoading ? (
      <div className="py-8 flex flex-col items-center gap-2">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading reviews…</span>
      </div>
    ) : reviewsError ? (
      <p className="text-sm text-rose-600">{reviewsError}</p>
    ) : !reviewStats || reviewStats.total_reviews === 0 ? (
      <div className="py-8 text-center">
        <Icon name="rate_review" className="material-symbols-outlined text-[32px] text-slate-400 mb-2" />
        <p className="font-title-sm text-title-sm font-semibold text-on-surface">No reviews yet.</p>
        <p className="text-sm text-slate-500 mt-1">Be the first to share your verified stay.</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-low">
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
              <span className="text-on-surface-variant">{r.label}</span>
              <span className="font-semibold text-[#157375] flex items-center gap-1">
                {Number(r.value).toFixed(2)} <Icon name="star" className="text-amber-500 text-[14px]" />
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-xl bg-surface-container-low">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-2 font-label-sm text-label-sm font-semibold text-primary">
                  <Icon name="verified" className="material-symbols-outlined text-[16px]" />
                  StayLeb Guest
                </span>
                <span className="text-xs text-slate-500">{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  { k: "Overall", v: rev.overall_rating },
                  { k: "Clean", v: rev.cleanliness_rating },
                  { k: "Privacy", v: rev.privacy_rating },
                  { k: "Wi-Fi", v: rev.wifi_rating },
                  { k: "Hot Water", v: rev.hot_water_rating },
                  { k: "Location", v: rev.location_rating },
                  { k: "Value", v: rev.value_rating },
                ].map((x) => (
                  <span key={x.k} className="px-2 py-0.5 rounded-full bg-white text-xs font-medium text-[#157375] border">
                    {x.k}: {x.v}/5
                  </span>
                ))}
              </div>
              {rev.comment ? (
                <p className="font-body-md text-body-md text-on-surface-variant italic">“{rev.comment}”</p>
              ) : (
                <p className="text-xs text-slate-400 italic">No comment.</p>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </section>

  </main>

  <aside className={"lg:col-span-4 sticky top-24 space-y-4"}>

  <div className={"bg-surface-container-lowest rounded-2xl shadow-xl p-6 space-y-6"}>

  <div className={"flex items-baseline justify-between"}>
  <div className={"flex items-baseline gap-1.5"}>
  <span className={"font-headline-lg text-headline-lg font-bold text-primary tracking-tight"}>{formatPrice(property.price_per_night)}</span>
  <span className={"font-body-md text-body-md text-on-surface-variant font-medium"}>/ night</span>
  </div>
  <div className={"flex items-center gap-1 font-label-sm text-label-sm text-[#157375] font-semibold"}>
  <Icon name="star" className="material-symbols-outlined text-[16px] text-amber-500" />
  <span>{reviewStats && reviewStats.total_reviews > 0 ? Number(reviewStats.overall_rating).toFixed(1) : "—"}</span>
  </div>
  </div>

  <div className={"rounded-xl bg-surface-container-low p-1 space-y-1"}>
  <div className={"grid grid-cols-2 gap-1"}>
  <div className={"p-3 bg-surface-container-lowest rounded-lg"}>
  <label className={"block font-caption text-caption text-on-surface-variant uppercase font-semibold"}>Check-In</label>
  <div className={"flex items-center gap-1.5 mt-0.5"}>
  <Icon name="calendar_today" className="material-symbols-outlined text-primary text-[18px]" />
  <span className={"font-label-md text-label-md font-bold text-[#157375]"}>{checkIn || 'Select'}</span>
  </div>
  </div>
  <div className={"p-3 bg-surface-container-lowest rounded-lg"}>
  <label className={"block font-caption text-caption text-on-surface-variant uppercase font-semibold"}>Check-Out</label>
  <div className={"flex items-center gap-1.5 mt-0.5"}>
  <Icon name="event" className="material-symbols-outlined text-primary text-[18px]" />
  <span className={"font-label-md text-label-md font-bold text-[#157375]"}>{checkOut || 'Select'}</span>
  </div>
  </div>
  </div>

  <div className={"p-3 bg-surface-container-lowest rounded-lg flex items-center justify-between"}>
  <div>
  <label className={"block font-caption text-caption text-on-surface-variant uppercase font-semibold"}>Guests</label>
  <span className={"font-label-md text-label-md font-bold text-[#157375]"}>{guests} Guests</span>
  </div>
  <div className="flex items-center gap-2">
    <button type="button" onClick={()=> setGuests(Math.max(1, guests-1))} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center">−</button>
    <span className="font-semibold">{guests}</span>
    <button type="button" onClick={()=> setGuests(Math.min(property.max_guests, guests+1))} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">+</button>
  </div>
  </div>
  </div>

  <div className={"flex items-center gap-2 p-3 rounded-xl bg-secondary-container/50 text-on-secondary-container"}>
  <Icon name="check_circle" className="material-symbols-outlined text-[20px] text-secondary" />
  <p className={"font-label-sm text-label-sm"}>
  <span className={"font-bold"}>Minimum {property.min_nights} nights stay:</span> {nights ? (nights >= property.min_nights ? `Satisfied (${nights} nights selected).` : `Need ${property.min_nights - nights} more night(s).`) : 'Select dates to check.'}
  </p>
  </div>

  <div className={"space-y-3 pt-2 font-body-md text-body-md"}>
  {previewLoading ? (
    <div className="py-2 text-sm text-slate-500 animate-pulse">Calculating server pricing…</div>
  ) : previewLocal ? (
    <>
      <div className={"flex items-center justify-between text-on-surface-variant"}>
        <span>{formatPrice(previewLocal.price_per_night)} × {previewLocal.number_of_nights} nights</span>
        <span className={"font-medium text-[#157375]"}>{formatPrice(previewLocal.total_price)}</span>
      </div>
      <div className={"pt-3 flex items-center justify-between font-title-md text-title-md font-bold text-[#157375]"}>
        <span>Total</span>
        <span className={"text-primary text-headline-sm"}>{formatPrice(previewLocal.total_price)}</span>
      </div>
      <p className="text-xs text-slate-500">Server-calculated with seasonal rates. No hidden markup.</p>
    </>
  ) : (
    <>
      <div className={"flex items-center justify-between text-on-surface-variant"}>
        <span>{formatPrice(property.price_per_night)} × {nights || 0} nights</span>
        <span className={"font-medium text-[#157375]"}>{formatPrice(subtotal)}</span>
      </div>
      <div className={"flex items-center justify-between text-on-surface-variant"}>
        <span className={"flex items-center gap-1"}>Cleaning & Firewood fee<Icon name="info" className="material-symbols-outlined text-[16px] text-outline cursor-pointer" /></span>
        <span className={"font-medium text-[#157375]"}>{formatPrice(0)}</span>
      </div>
      <div className={"pt-3 flex items-center justify-between font-title-md text-title-md font-bold text-[#157375]"}>
        <span>Total before taxes</span>
        <span className={"text-primary text-headline-sm"}>{formatPrice(subtotal)}</span>
      </div>
      <p className="text-xs text-slate-500">Final total will be calculated server-side with seasonal pricing. No hidden markup.</p>
    </>
  )}
  </div>

  <button type="button" onClick={handleBooking} className={"w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-60"}>
  <span>Continue to Booking</span>
  <Icon name="arrow_forward" className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1" />
  </button>
  <p className={"text-center font-caption text-caption text-on-surface-variant"}>You won’t be charged yet. Dates are held upon confirmation.</p>

  <div className={"pt-4 space-y-3 font-caption text-caption text-on-surface-variant"}>
  <div className={"flex items-center gap-2.5"}>
  <Icon name="verified" className="material-symbols-outlined text-primary text-[18px]" />
  <span>Verified host & generator assurance</span>
  </div>
  <div className={"flex items-center gap-2.5"}>
  <Icon name="cancel" className="material-symbols-outlined text-secondary text-[18px]" />
  <span>Free cancellation per policy before check-in</span>
  </div>
  </div>
  </div>

  </aside>
  </div>
  </div>



  </div></main>
  </>;
}
