"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Globe2,
  Menu,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LocalAction } from "@/components/ui/Feedback";
import { logoutRequest } from "@/services/api";

const sceneLinks = [
  ["Explore Stays", "#stays", 1],
  ["Destinations", "#destinations", 2],
  ["AI Search", "#search", 3],
  ["How It Works", "#plan", 4],
] as const;

/**
 * Source-styled homepage navbar (homepage scope only; other routes keep
 * PublicHeader). Brand uses the original destination Logo asset at its own
 * proportions; auth actions link the real routes and follow the existing
 * session (same stayleb-auth/storage signals as the account shell).
 */
export function CinemaNav({ onNavigate }: { onNavigate: (scene: number) => void }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    const sync = () => setAuthed(!!localStorage.getItem("stayleb_access_token"));
    sync();
    window.addEventListener("stayleb-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("stayleb-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  async function handleLogout() {
    setMenu(false);
    await logoutRequest();
    window.dispatchEvent(new Event("stayleb-auth"));
    router.push("/");
  }
  return (
    <>
      <div className="assurance">
        <ShieldCheck size={12} />
        <span>LB Verified Lebanese Chalets</span>
        <i />
        24/7 Power Assurance{" "}
        <span className="assurance-extra">& Local Caretaker Handover</span>
      </div>
      <header className="header">
        <Logo variant="wordmark" />
        <nav className={menu ? "nav open" : "nav"} aria-label="Main navigation">
          {sceneLinks.map(([label, href, scene]) => (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                setMenu(false);
                e.preventDefault();
                onNavigate(scene);
              }}
            >
              {label}
            </a>
          ))}
          <a href="#about" onClick={() => setMenu(false)}>
            About Lebanon Chalets
          </a>
        </nav>
        <div className="header-actions">
          <span className="currency">USD ($)</span>
          <span className="language">
            <Globe2 size={14} />
            EN
          </span>
          {authed ? (
            <>
              <Link className="login" href="/account">
                My Account
              </Link>
              <button className="signup" type="button" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link className="login" href="/auth/login">
                Log In
              </Link>
              <Link className="signup" href="/auth/register">
                Sign Up <ArrowUpRight size={15} />
              </Link>
            </>
          )}
          <button
            className="menu-toggle"
            type="button"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}

const discoveryLinks = [
  "Batroun Coastal Villas",
  "Faraya Ski Chalets",
  "Jbeil Historic Lodges",
  "Chouf Cedar Retreats",
  "Bcharreh Pine Cabins",
];

const supportLinks = [
  "Booking Protection",
  "Caretaker Handover",
  "Cancellation Policies",
  "24/7 Power Assurance",
  "Concierge & Transfers",
];

const legalLinks = [
  "List Your Chalet",
  "Host Code of Ethics",
  "Terms of Service",
  "Privacy Policy",
  "Decree 4123 Compliance",
];

/**
 * Source-styled homepage footer with the destination's real content and
 * link behaviors (regional links jump to #destinations; support/legal open
 * the existing info popups). Other routes keep the shared Footer.
 */
export function CinemaFooter({ onNavigate }: { onNavigate: (scene: number) => void }) {
  return (
    <footer id="about">
      <div className="footer-main section-shell">
        <div className="footer-brand">
          <Logo variant="wordmark" />
          <p>
            Handpicked private chalets, seaside stone residences, and alpine
            lodges across Mount Lebanon and the Mediterranean coastline.
            Guaranteed electricity and verified hosts.
          </p>
          <div className="trust-badges">
            <span>
              <BadgeCheck size={13} />
              Verified Properties
            </span>
            <span>
              <Zap size={13} />
              Generator Backed
            </span>
          </div>
        </div>
        <div>
          <h4>REGIONAL DISCOVERY</h4>
          {discoveryLinks.map((label) => (
            <a key={label} href="#destinations">
              {label}
            </a>
          ))}
        </div>
        <div>
          <h4>GUEST SUPPORT</h4>
          {supportLinks.map((label) => (
            <LocalAction key={label} message={`${label} information is not available in this preview.`}>
              {label}
            </LocalAction>
          ))}
        </div>
        <div>
          <h4>HOSTS &amp; LEGAL</h4>
          {legalLinks.map((label) => (
            <LocalAction key={label} message={`${label} information is not available in this preview.`}>
              {label}
            </LocalAction>
          ))}
        </div>
      </div>
      <div className="footer-bottom section-shell">
        <span>
          © 2025 StayLeb Hospitality Technologies SAL. Regulated under
          Lebanese Ministry of Tourism Decree No. 4123 for Tourist Residences.
        </span>
        <span>
          Beirut, Lebanon <i /> All Prices in Fresh USD
        </span>
        <a
          href="#hero"
          aria-label="Back to top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(0);
          }}
        >
          <ArrowUpRight size={18} />
        </a>
      </div>
    </footer>
  );
}
