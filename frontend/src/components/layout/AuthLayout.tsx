import Image from "next/image";
import { MapPin, ShieldCheck, LockKeyhole, House } from "lucide-react";
import type { ReactNode } from "react";
export type AuthVariant =
  "login" | "register" | "forgot" | "verify" | "reset" | "success";
interface AuthLayoutProps {
  readonly variant: AuthVariant;
  readonly children: ReactNode;
}
const panels = {
  login: {
    image: "04",
    title: "Your next escape starts here.",
    description: "Discover memorable stays across Lebanon.",
    badge: "Batroun Coastal Strip",
  },
  register: { image: "18", title: "", description: "", badge: "" },
  forgot: {
    image: "03",
    title: "Your next escape starts here.",
    description:
      "Discover memorable stays across Lebanon. From historic stone seaside estates to snowy cedar retreats.",
    badge: "Batroun Coast & Faraya Heights",
  },
  verify: {
    image: "17",
    title: "Protecting your private Mediterranean retreat.",
    description:
      "Verified keycard access, secure Chalet host portals, and authenticated booking management across Mount Lebanon and the coastline.",
    badge: "Secure Authenticator",
  },
  reset: {
    image: "01",
    title: "Safe, effortless chalet hosting across Lebanon.",
    description:
      "From Batroun’s coastal sanctuaries to the snowscapes of Faraya, keep your account protected with our bank-grade credential security.",
    badge: "StayLeb Chalets",
  },
  success: {
    image: "16",
    title: "Your next escape starts here.",
    description:
      "Discover exclusive mountain chalets in Faraya, historic hillside estates in Chouf, and sun-soaked private havens across the Mediterranean coast.",
    badge: "Batroun Coastal Retraite",
  },
};
export function AuthLayout({ variant, children }: AuthLayoutProps) {
  const panel = panels[variant];
  return (
    <main id="main-content" className={`auth-layout auth-${variant}`}>
      <aside className="auth-photo" aria-label="Lebanese chalet escape">
        <Image
          fill
          priority
          sizes="50vw"
          src={`/images/stayleb-${panel.image}.jpg`}
          alt={
            variant === "reset"
              ? "Luxury mountain chalet in Faraya, Mount Lebanon"
              : "Stone chalet overlooking the Mediterranean coast in Lebanon"
          }
          className="object-cover"
        />
        {variant !== "register" && (
          <>
            <div className="photo-overlay" />
            <div className="photo-badges">
              <span>
                <MapPin size={14} />
                {panel.badge}
              </span>
              {variant !== "login" && (
                <span className="secondary-badge">
                  <ShieldCheck size={14} />
                  {variant === "reset"
                    ? "Secure Auth 2.0"
                    : variant === "verify"
                      ? "Batroun, Lebanon"
                      : variant === "success"
                        ? "Safe & Verified Platform"
                        : "Verified Chalet Host Network"}
                </span>
              )}
            </div>
            <div className="photo-copy">
              {variant === "forgot" && (
                <span className="photo-eyebrow">
                  <House size={15} /> Boutique Hospitality Portal
                </span>
              )}
              {variant === "success" && (
                <p className="photo-eyebrow">Authentication Protocol</p>
              )}
              {(variant === "reset" || variant === "verify") && (
                <div className="photo-line" />
              )}
              <h2>{panel.title}</h2>
              <p>{panel.description}</p>
              {variant === "forgot" && (
                <div className="photo-footer">
                  <MapPin size={16} /> Byblos Citadel Seafront • Lebanon{" "}
                  <LockKeyhole size={16} /> 256-bit Encrypted Portal
                </div>
              )}
              {variant === "reset" && (
                <div className="photo-footer">
                  <LockKeyhole size={15} /> 256-Bit Encrypted <span>•</span>
                  <ShieldCheck size={15} /> Identity Protected
                </div>
              )}
              {variant === "success" && (
                <div className="security-stats">
                  {[
                    ["100%", "Encrypted Auth"],
                    ["256-bit", "AES Standard"],
                    ["24/7", "Identity Shield"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <strong>{value}</strong>
                      <small>{label}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {variant === "verify" && (
              <div className="photo-bottom">
                <span>● Encrypted Session</span>
                <span>StayLeb Identity v2.4</span>
              </div>
            )}
          </>
        )}
      </aside>
      <section className="auth-content">{children}</section>
    </main>
  );
}
