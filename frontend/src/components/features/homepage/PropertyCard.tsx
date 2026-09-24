"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import type { PropertyPreview } from "@/lib/mock-data/homepage";
interface PropertyCardProps {
  readonly property: PropertyPreview;
}
export function PropertyCard({ property: p }: PropertyCardProps) {
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
        <Link href={`/properties/${p.id}`}>
          Details
        </Link>
      </div>
    </article>
  );
}
