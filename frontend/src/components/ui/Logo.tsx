import Image from "next/image";
import Link from "next/link";
import { House } from "lucide-react";

interface LogoProps {
  readonly variant?:
    "mark" | "wordmark" | "registration" | "partner" | "success";
}
export function Logo({ variant = "mark" }: LogoProps) {
  return (
    <Link href="/" aria-label="StayLeb home" className={`logo logo-${variant}`}>
      {variant === "registration" ? (
        <span className="logo-house">
          <House size={23} />
        </span>
      ) : (
        <Image
          src="/images/stayleb-icon.png"
          alt="StayLeb"
          width={48}
          height={48}
          className="logo-image"
        />
      )}
      {variant !== "mark" && (
        <span>
          <strong>
            Stay<span>Leb</span>
          </strong>
          {variant === "partner" && <small>Partner Portal</small>}
          {variant === "success" && (
            <small>Boutique Chalets &amp; Escapes</small>
          )}
        </span>
      )}
    </Link>
  );
}
