"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RatingInput } from "@/components/ui/RatingInput";
import Swal from "sweetalert2";
import { getBooking } from "@/services/bookings";
import type { BookingResponse } from "@/services/bookings";
import { getPublicProperty } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
import { createReview, getReviewByBooking, type Review } from "@/services/reviews";

export function WriteReviewSection0() {
  const params = useParams() as { id?: string };
  const bookingId = params.id;
  const router = useRouter();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    privacy: 0,
    wifi: 0,
    hotWater: 0,
    location: 0,
    value: 0,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Missing booking ID");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const b = await getBooking(bookingId as string);
        if (cancelled) return;
        // Only completed bookings can be reviewed — check early
        if (b.status !== "completed") {
          setBooking(b);
          setError(`This booking cannot be reviewed. Only completed bookings can be reviewed. Current status: ${b.status}`);
          // Still fetch property for display
          try {
            const p = await getPublicProperty(b.property_id);
            if (!cancelled) setProperty(p);
          } catch {}
          return;
        }
        setBooking(b);
        try {
          const p = await getPublicProperty(b.property_id);
          if (!cancelled) setProperty(p);
        } catch {}
        // Check if review already exists — 404 means not reviewed yet (expected)
        try {
          const r = await getReviewByBooking(bookingId as string);
          if (!cancelled) setExistingReview(r);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (/404|not found/i.test(msg)) {
            if (!cancelled) setExistingReview(null);
          } else {
            // Other error — treat as not reviewed but log
            if (!cancelled) setExistingReview(null);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load booking");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const canSubmit = ratings.overall >= 1 && ratings.cleanliness >= 1 && ratings.privacy >= 1 && ratings.wifi >= 1 && ratings.hotWater >= 1 && ratings.location >= 1 && ratings.value >= 1 && !submitting;

  async function handleSubmit() {
    if (!bookingId || !booking) return;
    if (!canSubmit) {
      Swal.fire({ title: "Please rate all criteria", text: "All seven ratings must be 1–5.", icon: "warning", confirmButtonColor: "#157375" });
      return;
    }
    if (comment.length > 1000) {
      Swal.fire({ title: "Comment too long", text: "Comment must be 1000 characters or less.", icon: "warning", confirmButtonColor: "#157375" });
      return;
    }
    setSubmitting(true);
    try {
      const review = await createReview({
        booking_id: Number(bookingId),
        overall_rating: ratings.overall,
        cleanliness_rating: ratings.cleanliness,
        privacy_rating: ratings.privacy,
        wifi_rating: ratings.wifi,
        hot_water_rating: ratings.hotWater,
        location_rating: ratings.location,
        value_rating: ratings.value,
        comment: comment.trim() ? comment.trim() : null,
      });
      setExistingReview(review);
      await Swal.fire({
        title: "Thanks for sharing your experience!",
        html: `<div style="text-align:left;font-size:13px;color:#1E293B">Your verified review for <strong>${property?.title || "this property"}</strong> has been submitted and is now visible on the property page.</div>`,
        icon: "success",
        confirmButtonColor: "#157375",
        confirmButtonText: "Back to My Bookings",
      });
      router.push("/account/bookings");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit review";
      let title = "Failed to submit review";
      let text = msg;
      if (/409|already reviewed/i.test(msg)) {
        title = "Already reviewed";
        text = "This booking has already been reviewed. Only one review per completed booking is allowed.";
        // Refresh existing review
        try {
          const r = await getReviewByBooking(bookingId as string);
          setExistingReview(r);
        } catch {}
      } else if (/400|not eligible|completed/i.test(msg)) {
        title = "Not eligible";
        text = msg;
      } else if (/403|not belong|forbidden/i.test(msg)) {
        title = "Not authorized";
        text = "This booking does not belong to you.";
      } else if (/422|invalid/i.test(msg)) {
        title = "Invalid data";
        text = msg;
      }
      await Swal.fire({ title, text, icon: "error", confirmButtonColor: "#157375" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading booking…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6">
          <Icon name="error" className="material-symbols-outlined text-[36px] text-amber-600 mb-3" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">{/not eligible|completed/i.test(error) ? "Cannot review" : "Failed to load"}</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/account/bookings" className="px-5 py-2 rounded-lg bg-primary text-white text-sm">Back to My Bookings</Link>
            {booking?.status === "completed" && existingReview && (
              <span className="text-xs text-slate-500">Already reviewed</span>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <p className="text-sm text-slate-500">No booking found</p>
      </main>
    );
  }

  // If already reviewed, show read-only view
  if (existingReview) {
    return (
      <main className="w-full min-h-screen bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-on-surface-variant font-label-sm mb-6">
              <Link className="hover:text-primary transition-colors" href="/account/bookings">My Bookings</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-xs text-outline" />
              <span className="text-on-surface font-semibold">Already Reviewed</span>
            </nav>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Icon name="check" className="material-symbols-outlined text-3xl font-bold" />
              </div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">You have already reviewed this stay</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Booking #SL-{String(booking.id).padStart(4, "0")} · {property?.title || `Property #${booking.property_id}`} has been reviewed. One review per completed booking.</p>
              <div className="bg-white rounded-xl p-4 text-left space-y-2 max-w-lg mx-auto">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Overall: <strong>{existingReview.overall_rating}/5</strong></div>
                  <div>Cleanliness: <strong>{existingReview.cleanliness_rating}/5</strong></div>
                  <div>Privacy: <strong>{existingReview.privacy_rating}/5</strong></div>
                  <div>Wi-Fi: <strong>{existingReview.wifi_rating}/5</strong></div>
                  <div>Hot Water: <strong>{existingReview.hot_water_rating}/5</strong></div>
                  <div>Location: <strong>{existingReview.location_rating}/5</strong></div>
                  <div>Value: <strong>{existingReview.value_rating}/5</strong></div>
                </div>
                {existingReview.comment && <p className="text-sm italic text-slate-600 mt-3">“{existingReview.comment}”</p>}
                <p className="text-xs text-slate-500">Submitted {new Date(existingReview.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-6">
                <Link href="/account/bookings" className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-container">Back to My Bookings</Link>
                {property && <Link href={`/properties/${property.id}`} className="px-6 py-3 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high">View Property</Link>}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not yet reviewed — show form
  const propertyTitle = property?.title || `Property #${booking.property_id}`;
  const propertyLocation = property?.location || "Lebanon";
  const nights = booking.number_of_nights;
  const cover = property?.images?.find((i) => i.is_primary)?.image_url || property?.images?.[0]?.image_url || "/images/3fc149349e4ccf50.jpg";

  return (
    <>
      <main className="w-full min-h-screen bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-on-surface-variant font-label-sm mb-6">
              <Link className="hover:text-primary transition-colors" href="/account/bookings">My Bookings</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-xs text-outline" />
              <Link className="hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-none" href={`/properties/${booking.property_id}`}>{propertyTitle}</Link>
              <Icon name="chevron_right" className="material-symbols-outlined text-xs text-outline" />
              <span className="text-on-surface font-semibold">Write Review</span>
            </nav>

            <div className="mb-8">
              <h1 className="font-display text-on-surface text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2">How was your stay at {propertyTitle}?</h1>
              <p className="font-body-lg text-on-surface-variant max-w-3xl">Your verified feedback helps fellow travelers choose authentic Lebanese chalets and rewards dedicated local hosts.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-44 h-28 sm:h-28 rounded-lg overflow-hidden shrink-0 relative">
                <LocalImage className="w-full h-full object-cover" src={cover} alt={propertyTitle} />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-caption text-[10px] backdrop-blur-sm">{propertyLocation}</span>
              </div>
              <div className="flex-1 w-full flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-xs bg-surface-container text-secondary font-medium">
                        <Icon name="verified" className="material-symbols-outlined text-[14px]" /> Verified Stay
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-xs bg-surface-container-high text-primary font-semibold">Completed Stay</span>
                    </div>
                    <h2 className="font-headline-sm text-on-surface text-lg sm:text-xl font-bold">{propertyTitle}</h2>
                    <p className="font-body-md text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Icon name="location_on" className="material-symbols-outlined text-base text-outline" /> {propertyLocation}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-caption text-outline block uppercase tracking-wider">Stay Reference</span>
                    <span className="font-label-md text-on-surface font-mono font-bold">#SL-{String(booking.id).padStart(4, "0")}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-label-md bg-surface-container-low px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Icon name="calendar_month" className="material-symbols-outlined text-sm text-primary" />
                    <span>{new Date(booking.check_in).toLocaleDateString()} – {new Date(booking.check_out).toLocaleDateString()}</span>
                  </div>
                  <span className="text-outline-variant hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <Icon name="bedtime" className="material-symbols-outlined text-sm text-primary" />
                    <span>{nights} nights</span>
                  </div>
                  <span className="text-outline-variant hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <Icon name="group" className="material-symbols-outlined text-sm text-primary" />
                    <span>{booking.guests} guests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm" id="reviewFormSection">
              <div className="mb-6 pb-4 border-b-0">
                <h3 className="font-headline-md text-on-surface mb-1">StayLeb Seven Evaluation Criteria</h3>
                <p className="font-body-md text-on-surface-variant">Please rate each verified amenity strictly based on your actual stay experience.</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">1</span>
                      <h4 className="font-title-md text-on-surface">Overall Experience</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Rate your general impression of the property and stay.</p>
                  </div>
                  <RatingInput criterion="Overall" value={ratings.overall} onChange={(v) => setRatings((s) => ({ ...s, overall: v }))} />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">2</span>
                      <h4 className="font-title-md text-on-surface">Cleanliness</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Fresh bedding, immaculate bathrooms, clean kitchenware.</p>
                  </div>
                  <RatingInput criterion="Cleanliness" value={ratings.cleanliness} onChange={(v) => setRatings((s) => ({ ...s, cleanliness: v }))} />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">3</span>
                      <h4 className="font-title-md text-on-surface">Privacy</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Seclusion, noise isolation, and private outdoor spaces.</p>
                  </div>
                  <RatingInput criterion="Privacy" value={ratings.privacy} onChange={(v) => setRatings((s) => ({ ...s, privacy: v }))} />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">4</span>
                      <h4 className="font-title-md text-on-surface">Wi-Fi Reliability</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Internet speed and connection stability.</p>
                  </div>
                  <RatingInput criterion="Wi-Fi" value={ratings.wifi} onChange={(v) => setRatings((s) => ({ ...s, wifi: v }))} />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">5</span>
                      <h4 className="font-title-md text-on-surface">Hot Water & 24/7 Power</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Uninterrupted electricity, solar backup, hot water on demand.</p>
                  </div>
                  <RatingInput criterion="Hot Water" value={ratings.hotWater} onChange={(v) => setRatings((s) => ({ ...s, hotWater: v }))} />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">6</span>
                      <h4 className="font-title-md text-on-surface">Location & Views</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Sea or mountain vistas, accessibility, and neighborhood.</p>
                  </div>
                  <RatingInput criterion="Location" value={ratings.location} onChange={(v) => setRatings((s) => ({ ...s, location: v }))} />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-xs flex items-center justify-center font-bold">7</span>
                      <h4 className="font-title-md text-on-surface">Value for Money</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant text-sm mt-1 ml-8">Fairness of pricing relative to amenities provided.</p>
                  </div>
                  <RatingInput criterion="Value" value={ratings.value} onChange={(v) => setRatings((s) => ({ ...s, value: v }))} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-0">
                <label className="block font-title-md text-on-surface mb-1" htmlFor="reviewComment">Tell us more about your stay <span className="text-outline font-normal text-sm">(optional)</span></label>
                <p className="font-body-md text-on-surface-variant text-sm mb-3">What did you love most? Mention specific details like the sunset deck, pool, host hospitality, or solar reliability...</p>
                <div className="relative">
                  <textarea
                    className="w-full p-4 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:bg-surface-container transition-all resize-none shadow-inner"
                    id="reviewComment"
                    placeholder="What did you love most? Mention specific details like the sunset deck, pool, host hospitality, or solar reliability..."
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                    aria-label="Review comment"
                  />
                  <div className="flex justify-between items-center mt-2 px-1 text-outline font-caption">
                    <span>Up to 1000 characters</span>
                    <span>{comment.length} / 1,000 characters</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-surface-container flex items-start gap-3.5">
                <Icon name="policy" className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5" />
                <div className="font-body-md text-on-surface text-sm">
                  <span className="font-semibold text-primary">Important:</span> In accordance with StayLeb marketplace rules, once submitted, reviews cannot be edited or deleted by the client. Exactly one review is permitted per completed stay.
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/account/bookings")}
                  className="w-full sm:w-auto text-center px-6 py-3 rounded-lg font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg font-label-md font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 ${canSubmit ? "bg-primary-container text-on-primary hover:bg-primary active:scale-95" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                >
                  <span>{submitting ? "Submitting…" : "Submit Review"}</span>
                  <Icon name="arrow_forward" className="material-symbols-outlined text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
