"use client";
import Image from "next/image";
import { useState } from "react";
import { Heart, Star, BadgeCheck } from "lucide-react";
import type { PropertyPreview } from "@/lib/mock-data/homepage";
import { useFeedback } from "@/components/ui/Feedback";
interface PropertyCardProps {
  readonly property: PropertyPreview;
}
export function PropertyCard({ property: p }: PropertyCardProps) {
  const [saved, setSaved] = useState(false);
  const notify = useFeedback();
  return (
    <article className="property-card">
      <div className="property-image">
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 25vw"
        />
        <div className="property-tags">
          <span>{p.location}</span>
          <span>{p.badge}</span>
        </div>
        <button
          className={`favorite ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${p.title}`}
          aria-pressed={saved}
          onClick={() => {
            setSaved(!saved);
            notify(
              saved
                ? "Stay removed from your saved selection."
                : "Stay saved for this visit.",
            );
          }}
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className={`property-status ${p.isNew ? "new" : ""}`}>
          <BadgeCheck size={12} />
          {p.isNew ? "New Listing" : "Approved & Published"}
        </span>
      </div>
      <div className="property-body">
        <div className="property-rating">
          <span>
            {p.isNew ? (
              <b>Brand New</b>
            ) : (
              <>
                <Star size={13} />
                <strong>{p.rating}</strong> ({p.reviews})
              </>
            )}
          </span>
          <small>{p.host}</small>
        </div>
        <h3 title={p.title}>{p.title}</h3>
        <p>
          {p.guests} guests • {p.beds} {p.beds === 1 ? "bed" : "beds"} •{" "}
          {p.baths} {p.baths === 1 ? "bath" : "baths"} • {p.feature}
        </p>
        <div className="amenities">
          {p.amenities.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
      <div className="property-bottom">
        <span>
          <strong>${p.price}</strong> / night
        </span>
        <button
          onClick={() =>
            notify(
              `${p.title}: $${p.price} per night, up to ${p.guests} guests. Detailed listings are not available in this preview.`,
            )
          }
        >
          Details
        </button>
      </div>
    </article>
  );
}
