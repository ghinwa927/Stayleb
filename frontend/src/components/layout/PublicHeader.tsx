"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Banknote, Globe, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LocalAction } from "@/components/ui/Feedback";
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="announcement">
        🇱🇧 Verified Lebanese Chalets • 24/7 Power Assurance &amp; Local
        Caretaker Handover
      </div>
      <div className="header-inner">
        <div className="header-left">
          <Logo variant="wordmark" />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#stays" className="active">
              Explore Stays
            </a>
            <a href="#destinations">Destinations</a>
            <a href="#guarantee">How It Works</a>
            <a href="#about">About Lebanon Chalets</a>
          </nav>
        </div>
        <div className="header-actions">
          <div className="locale-actions">
            <LocalAction message="All prices are displayed in Fresh USD.">
              <Banknote size={17} />
              USD ($)
            </LocalAction>
            <LocalAction message="English is the available language for this preview.">
              <Globe size={17} />
              EN
            </LocalAction>
          </div>
          <Link href="/auth/login" className="header-login">
            Log In
          </Link>
          <Link href="/auth/register" className="header-signup">
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            aria-label="Log in to your account"
            className="header-avatar"
          >
            <Image src="/images/stayleb-06.jpg" alt="" width={32} height={32} />
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[
            ["#stays", "Explore Stays"],
            ["#destinations", "Destinations"],
            ["#guarantee", "How It Works"],
            ["#about", "About Lebanon Chalets"],
          ].map(([href, label]) => (
            <a href={href} key={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
