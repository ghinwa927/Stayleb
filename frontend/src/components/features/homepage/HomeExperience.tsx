"use client";
import Image from "next/image";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Zap,
  MapPin,
  CalendarDays,
  Users,
  SlidersHorizontal,
  ArrowRight,
  Waves,
  Mountain,
  Castle,
  Trees,
  LoaderCircle,
} from "lucide-react";
import {
  destinations,
  properties as mockProperties,
  prompts,
  regionOptions,
  type Region,
} from "@/lib/mock-data/homepage";
import { PropertyCard } from "./PropertyCard";
import { Dialog } from "@/components/ui/Dialog";
import { pause } from "@/lib/auth";
import { useEffect } from "react";
import { searchProperties } from "@/services/properties";
import type { PropertyResponse } from "@/services/owner";
interface HomeExperienceProps {
  readonly children: ReactNode;
}
export function HomeExperience({ children }: HomeExperienceProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"standard" | "ai">("standard"),
    [region, setRegion] = useState<Region>("faraya"),
    [filter, setFilter] = useState<Region>("all"),
    [selectedFilters, setSelectedFilters] = useState<string[]>([]),
    [guestOpen, setGuestOpen] = useState(false),
    [dateOpen, setDateOpen] = useState(false),
    [adults, setAdults] = useState(3),
    [kids, setKids] = useState(1),
    [arrival, setArrival] = useState("2026-10-11"),
    [departure, setDeparture] = useState("2026-10-13"),
    [query, setQuery] = useState("A chalet in Faraya with heated jacuzzi"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [dateError, setDateError] = useState(""),
    [clarify, setClarify] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLInputElement>(null);
  const staysRef = useRef<HTMLElement>(null);
  const [backendProps, setBackendProps] = useState<PropertyResponse[] | null>(null);
  const [loadingProps, setLoadingProps] = useState(true);
  const [propsError, setPropsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingProps(true);
      setPropsError(null);
      try {
        const locMap: Record<string, string | undefined> = { faraya: "Faraya", batroun: "Batroun", all: undefined };
        const loc = locMap[filter];
        const res = await searchProperties({ location: loc, page: 1, page_size: 12, sort: "newest" });
        if (!cancelled) setBackendProps(res.items as PropertyResponse[]);
      } catch (e) {
        if (!cancelled) setPropsError(e instanceof Error ? e.message : "Failed to load properties");
      } finally {
        if (!cancelled) setLoadingProps(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [filter]);

  const filtered = mockProperties.filter(
    (p) => filter === "all" || p.region === filter,
  );
  // Prefer backend data when available
  const displayProperties = backendProps !== null && backendProps.length > 0
    ? backendProps.map((p) => ({
        id: String(p.id),
        title: p.title,
        location: p.location,
        price: Number(p.price_per_night),
        guests: p.max_guests,
        beds: p.beds,
        baths: p.bathrooms,
        feature: p.property_type === "chalet" ? "Chalet" : "Furnished House",
        amenities: p.amenities?.map((a: { name: string }) => a.name).slice(0, 3) ?? [],
        rating: 4.92,
        reviews: 12,
        host: "Verified Host",
        badge: p.status === "approved" ? "Approved & Published" : p.status,
        isNew: false,
        region: p.location.toLowerCase().includes("batroun") ? "batroun" as Region : p.location.toLowerCase().includes("faraya") ? "faraya" as Region : "all" as Region,
        image: p.images?.find((im) => im.is_primary)?.image_url || p.images?.[0]?.image_url || "/images/e8899428208cea05.jpg",
      }))
    : filtered;

  const dateText = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  async function search(e?: FormEvent<HTMLFormElement>, preset?: string) {
    e?.preventDefault();
    if (
      mode === "standard" &&
      (!arrival || !departure || departure <= arrival)
    ) {
      setMessage("Please choose a check-out date after check-in.");
      setDateOpen(true);
      return;
    }
    if (mode === "ai" && !(preset ?? query).trim()) {
      setMessage("Describe the stay you’re looking for.");
      aiRef.current?.focus();
      return;
    }
    if (mode === "standard") {
      const params = new URLSearchParams();
      const regionLabelMap: Record<string, string> = { faraya: "Faraya", batroun: "Batroun", zaarour: "Zaarour", bcharre: "Bcharre", faqra: "Faqra" };
      const loc = regionLabelMap[region];
      if (loc) params.set("location", loc);
      if (arrival) params.set("check_in", arrival);
      if (departure) params.set("check_out", departure);
      const totalGuests = adults + kids;
      if (totalGuests) params.set("guests", String(totalGuests));
      router.push(`/search?${params.toString()}`);
      return;
    }
    router.push("/search");
  }
  function chooseRegion(value: Region) {
    setFilter(value);
    setRegion(value);
    staysRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function activateAi() {
    setMode("ai");
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => aiRef.current?.focus(), 100);
  }
  function applyDates() {
    if (!arrival || !departure || departure <= arrival) {
      setDateError("Check-out must be after check-in.");
      return;
    }
    setDateError("");
    setDateOpen(false);
  }
  return (
    <>
      <section className="home-hero">
        <Image
          src="/images/stayleb-07.jpg"
          alt="Mountain chalet above the clouds in Mount Lebanon"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-scrim" />
        <div className="page-container hero-content">
          <div className="hero-eyebrow">
            <span />
            CURATED LEBANESE CHALET ESCAPES <b>•</b>
            <span className="hero-eyebrow-subtitle">
              Faraya Slopes to Batroun Coast
            </span>
          </div>
          <h1>Authentic Lebanese Chalets &amp; Mountain Getaways</h1>
          <p className="hero-description">
            Handpicked private chalets from snowy Faraya peaks to sunlit Batroun
            shores.
            <br className="hidden sm:block" /> Guaranteed 24/7 power, verified
            water reserves, and dedicated on-ground caretakers.
          </p>
          <div className="search-widget" ref={searchRef}>
            <div className="search-top">
              <div
                className="search-tabs"
                role="tablist"
                aria-label="Search method"
              >
                <button
                  type="button"
                  role="tab"
                  id="standard-tab"
                  aria-selected={mode === "standard"}
                  aria-controls="standard-panel"
                  onClick={() => setMode("standard")}
                >
                  <Search size={18} />
                  Standard Search
                </button>
                <button
                  type="button"
                  role="tab"
                  id="ai-tab"
                  aria-selected={mode === "ai"}
                  aria-controls="ai-panel"
                  onClick={() => setMode("ai")}
                >
                  <Sparkles size={18} />
                  AI Natural-Language Search <span>New</span>
                </button>
              </div>
              <small>
                <Zap size={15} />
                Power &amp; water reserves auto-checked
              </small>
            </div>
            <form onSubmit={search}>
              <div
                role="tabpanel"
                id="standard-panel"
                aria-labelledby="standard-tab"
                hidden={mode !== "standard"}
              >
                <div className="search-fields">
                  <div className="search-field destination-field">
                    <label htmlFor="destination">DESTINATION</label>
                    <div>
                      <MapPin size={20} />
                      <select
                        id="destination"
                        value={region}
                        onChange={(e) => setRegion(e.target.value as Region)}
                      >
                        {regionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="search-field date-field"
                    onClick={() => setDateOpen(true)}
                  >
                    <span>CHECK-IN / OUT</span>
                    <strong>
                      <CalendarDays size={20} />
                      {dateText(arrival)} → {dateText(departure)},{" "}
                      {departure.slice(0, 4)}
                    </strong>
                  </button>
                  <button
                    type="button"
                    className="search-field"
                    onClick={() => setGuestOpen(true)}
                  >
                    <span>TRAVELERS</span>
                    <strong>
                      <Users size={20} />
                      {adults + kids} Guests, 1 Chalet{" "}
                      <SlidersHorizontal size={17} />
                    </strong>
                  </button>
                  <button
                    type="submit"
                    className="search-button"
                    disabled={busy}
                  >
                    {busy ? (
                      <LoaderCircle className="animate-spin" size={20} />
                    ) : (
                      <Search size={20} />
                    )}
                    Search Stays
                  </button>
                </div>
                <div className="popular-filters">
                  <span>POPULAR FILTERS:</span>
                  {[
                    "Private Generator",
                    "Heated Jacuzzi",
                    "Seafront Pool",
                    "Starlink Internet",
                  ].map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selectedFilters.includes(label)}
                      onClick={() =>
                        setSelectedFilters((old) =>
                          old.includes(label)
                            ? old.filter((v) => v !== label)
                            : [...old, label],
                        )
                      }
                    >
                      {i === 0 ? (
                        <Zap size={13} />
                      ) : i === 2 ? (
                        <Waves size={13} />
                      ) : (
                        <Sparkles size={13} />
                      )}{" "}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                role="tabpanel"
                id="ai-panel"
                aria-labelledby="ai-tab"
                hidden={mode !== "ai"}
              >
                <div className="ai-input">
                  <Sparkles size={24} />
                  <label htmlFor="ai-query" className="sr-only">
                    Describe your ideal stay
                  </label>
                  <input
                    ref={aiRef}
                    id="ai-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="A chalet in Faraya for 6 guests with a pool..."
                  />
                  <button
                    className="search-button"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? (
                      <LoaderCircle size={19} className="animate-spin" />
                    ) : (
                      <Sparkles size={19} />
                    )}
                    Find Matches
                  </button>
                </div>
                <div className="prompt-examples">
                  <span>TRY PROMPTS:</span>
                  {prompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => {
                        setQuery(prompt);
                        void search(undefined, prompt);
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                {clarify && (
                  <div className="ai-clarification">
                    <strong>How many guests are joining your escape?</strong>
                    <div>
                      {[2, 4, 6, 8].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => {
                            setAdults(n);
                            setKids(0);
                            setQuery(
                              query.replace(/ for \d+ guests$/, "") +
                                ` for ${n} guests`,
                            );
                            setClarify(false);
                            setMessage(
                              `Your preferences are updated for ${n} guests. Explore the featured stays below.`,
                            );
                          }}
                        >
                          {n} guests
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
            {message && (
              <p className="search-feedback" role="status">
                {message}
                {selectedFilters.length > 0 &&
                  ` Selected preferences: ${selectedFilters.join(", ")}.`}
              </p>
            )}
          </div>
        </div>
      </section>
      {children}
      <section
        id="stays"
        className="page-container stays-section"
        ref={staysRef}
      >
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">
              <span>HANDPICKED STAYS</span> • 100% Verified Hosts
            </p>
            <h2>Curated Lebanese Chalet Escapes</h2>
          </div>
          <div className="region-tabs">
            <button
              aria-pressed={filter === "faraya"}
              onClick={() => setFilter("faraya")}
            >
              Faraya Ski
            </button>
            <button
              aria-pressed={filter === "batroun"}
              onClick={() => setFilter("batroun")}
            >
              Batroun Coast
            </button>
            <button
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              View All (118)
            </button>
          </div>
        </div>
        <div className="property-grid">
          {loadingProps ? (
            <div className="col-span-full py-10 text-center text-sm text-slate-500 flex flex-col items-center gap-2"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading stays…</div>
          ) : propsError ? (
            <div className="col-span-full py-10 text-center text-sm text-red-600">{propsError} — showing featured stays.</div>
          ) : null}
          {!loadingProps && displayProperties.map((property) => (
            <PropertyCard key={property.id} property={property as unknown as import("@/lib/mock-data/homepage").PropertyPreview} />
          ))}
          {!loadingProps && displayProperties.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-slate-500">No stays found for this region.</div>
          )}
        </div>
        {filter !== "all" && (
          <p className="filter-caption" role="status">
            {displayProperties.length} featured stay in this region.{" "}
            <button onClick={() => setFilter("all")}>
              Show all featured stays
            </button>
          </p>
        )}
      </section>
      <section
        id="destinations"
        className="page-container destinations-section"
      >
        <p className="section-eyebrow">
          <span>TOP DESTINATIONS</span>
        </p>
        <h2>Explore Premier Lebanese Regions</h2>
        <p className="section-description">
          From sun-drenched Phoenician coastlines to pristine high-altitude
          mountain peaks.
        </p>
        <div className="destination-grid">
          {destinations.map((d, i) => {
            const Icon = [Waves, Mountain, Castle, Trees][i];
            return (
              <button
                className="destination-card"
                key={d.region}
                onClick={() => chooseRegion(d.region)}
              >
                <Image
                  src={d.image}
                  alt={d.title + " landscape in Lebanon"}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 25vw"
                />
                <div className="destination-scrim" />
                <div className="destination-copy">
                  <span>
                    <Icon size={15} />
                    {d.eyebrow}
                  </span>
                  <h3>{d.title}</h3>
                  <p>{d.description}</p>
                  <strong>
                    {d.count} Chalets Available <ArrowRight size={15} />
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <aside className="ai-concierge">
        <button onClick={activateAi}>
          <span>
            <Sparkles size={20} />
          </span>
          <span>
            <strong>StayLeb AI Concierge</strong>
            <small>Find your ideal Lebanese chalet...</small>
          </span>
        </button>
      </aside>
      <Dialog
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        title="Select Guests"
      >
        {[
          {
            label: "Adults",
            description: "Ages 13 or above",
            value: adults,
            set: setAdults,
            min: 1,
          },
          {
            label: "Children",
            description: "Ages 2–12",
            value: kids,
            set: setKids,
            min: 0,
          },
        ].map(({ label, description, value, set, min }) => (
          <div className="guest-stepper" key={label}>
            <div>
              <strong>{label}</strong>
              <small>{description}</small>
            </div>
            <div>
              <button
                type="button"
                aria-label={`Decrease ${label.toLowerCase()}`}
                disabled={value <= min}
                onClick={() => set(value - 1)}
              >
                −
              </button>
              <output aria-live="polite">{value}</output>
              <button
                type="button"
                aria-label={`Increase ${label.toLowerCase()}`}
                disabled={value >= 16}
                onClick={() => set(value + 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
        <button
          className="primary-button mt-4"
          onClick={() => setGuestOpen(false)}
        >
          Apply Selection
        </button>
      </Dialog>
      <Dialog
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        title="Choose your dates"
      >
        <div className="date-inputs">
          <label>
            Check-in
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
            />
          </label>
          <label>
            Check-out
            <input
              type="date"
              min={arrival}
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
          </label>
        </div>
        {dateError && (
          <p className="field-error" role="alert">
            {dateError}
          </p>
        )}
        <button className="primary-button mt-4" onClick={applyDates}>
          Apply Dates
        </button>
      </Dialog>
    </>
  );
}
