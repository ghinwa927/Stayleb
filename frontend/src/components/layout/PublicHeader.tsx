"use client";
import Link from "next/link";
import { Banknote, Globe } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LocalAction } from "@/components/ui/Feedback";
export function PublicHeader() {
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
        </div>
      </div>
    </header>
  );
}
