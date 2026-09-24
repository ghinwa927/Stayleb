"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { usePropertyWizard, WizardStep } from "@/components/features/owner/PropertyWizard";
import { getAmenities, getRules, uploadPropertyImage, createProperty, type Amenity, type Rule, type PropertyImageCreate, type SeasonalPriceCreate, type PropertyRuleCreate } from "@/services/owner";

export function AddPropertySection0() {
  const router = useRouter();
  const wizard = usePropertyWizard();
  const step = wizard?.step ?? 1;
  const go = wizard?.go ?? (() => {});
  const next = wizard?.next ?? (() => {});
  const back = wizard?.back ?? (() => {});

  // Step 1
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<"chalet" | "furnished_house">("chalet");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [maxGuests, setMaxGuests] = useState(4);
  const [minNights, setMinNights] = useState(1);

  // Step 3
  const [price, setPrice] = useState("150");

  // Step 4 images
  const [images, setImages] = useState<PropertyImageCreate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 5 amenities/rules
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<number>>(new Set());
  const [ruleStates, setRuleStates] = useState<Record<number, { allowed: boolean; value: string }>>({});
  const [catLoading, setCatLoading] = useState(true);

  // Step 6 seasonal
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPriceCreate[]>([]);
  const [seasonForm, setSeasonForm] = useState({ season_name: "", start_date: "", end_date: "", price_per_night: "" });
  const [seasonError, setSeasonError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCatLoading(true);
    Promise.all([getAmenities().catch(() => [] as Amenity[]), getRules().catch(() => [] as Rule[])])
      .then(([a, r]) => {
        setAmenities(a);
        setRules(r);
        const init: Record<number, { allowed: boolean; value: string }> = {};
        r.forEach((rule) => (init[rule.id] = { allowed: true, value: "" }));
        setRuleStates(init);
      })
      .finally(() => setCatLoading(false));
  }, []);

  const groupedAmenities = useMemo(() => {
    const g: Record<string, Amenity[]> = {};
    amenities.forEach((a) => {
      const cat = a.category || "Other";
      if (!g[cat]) g[cat] = [];
      g[cat].push(a);
    });
    return g;
  }, [amenities]);

  const groupedRules = useMemo(() => {
    const g: Record<string, Rule[]> = {};
    rules.forEach((r) => {
      const cat = r.category || "Others";
      if (!g[cat]) g[cat] = [];
      g[cat].push(r);
    });
    return g;
  }, [rules]);

  function toggleAmenity(id: number) {
    setSelectedAmenities((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function setPrimary(idx: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      // ensure one primary if needed
      if (filtered.length && !filtered.some((im) => im.is_primary)) filtered[0].is_primary = true;
      return filtered.map((im, i) => ({ ...im, display_order: i }));
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error(`${file.name}: Only JPG, PNG, WEBP allowed`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: Max 5MB`);
        const res = await uploadPropertyImage(file);
        setImages((prev) => {
          const isFirst = prev.length === 0;
          return [...prev, { image_url: res.image_url, imagekit_file_id: res.imagekit_file_id, is_primary: isFirst, display_order: prev.length }];
        });
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addSeason() {
    setSeasonError(null);
    const { season_name, start_date, end_date, price_per_night } = seasonForm;
    if (!season_name.trim() || season_name.trim().length < 2) { setSeasonError("Season name must be at least 2 characters"); return; }
    if (!start_date || !end_date) { setSeasonError("Start and end dates required"); return; }
    if (new Date(end_date) < new Date(start_date)) { setSeasonError("End date must be on or after start date"); return; }
    const p = Number(price_per_night);
    if (!p || p <= 0) { setSeasonError("Price must be greater than 0"); return; }
    // overlap check
    for (const s of seasonalPrices) {
      const aStart = new Date(s.start_date), aEnd = new Date(s.end_date);
      const bStart = new Date(start_date), bEnd = new Date(end_date);
      if (aStart <= bEnd && bStart <= aEnd) { setSeasonError(`Overlaps with "${s.season_name}"`); return; }
    }
    setSeasonalPrices((prev) => [...prev, { season_name: season_name.trim(), start_date, end_date, price_per_night: Number(price_per_night).toFixed(2) }]);
    setSeasonForm({ season_name: "", start_date: "", end_date: "", price_per_night: "" });
  }

  async function handleGenerateAI() {
    if (aiLoading) return;
    setAiLoading(true);
    // Simulate StayLeb AI generation using current form context
    await new Promise((r) => setTimeout(r, 900));
    const typeLabel = propertyType === "chalet" ? "chalet" : "furnished house";
    const loc = location.trim() || "the tranquil terraces of Qartaba overlooking the Adonis River valley";
    const ttl = title.trim() || "this hand-hewn natural stone chalet";
    const base = `Perched on the tranquil terraces of ${loc} overlooking the Adonis River valley, ${ttl} blends authentic Lebanese mountain architecture with modern conveniences. Features uninterrupted solar backup power, an artisanal wood fireplace, and panoramic sunset decks.`;
    const capacity = `Accommodates ${maxGuests} guests across ${bedrooms} bedrooms and ${beds} beds, with ${bathrooms} ${bathrooms === 1 ? "bathroom" : "bathrooms"}, perfect for ${maxGuests > 4 ? "families and groups" : "couples and small families"} seeking a serene mountain retreat.`;
    const extra = address.trim() ? ` Located at ${address.trim()}, with easy access to nearby trails and village amenities.` : "";
    setDescription(`${base} ${capacity}${extra}`);
    setAiLoading(false);
  }

  function validateStep(s: number): string | null {
    if (s === 1) {
      if (title.trim().length < 3) return "Title must be at least 3 characters";
      if (location.trim().length < 2) return "Location must be at least 2 characters";
      if (description.trim().length < 10) return "Description must be at least 10 characters";
    }
    if (s === 3) {
      const p = Number(price);
      if (!p || p <= 0) return "Base price must be greater than 0";
    }
    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) { setSubmitError(err); return; }
    setSubmitError(null);
    if (step === 7) {
      handleSubmit();
      return;
    }
    next();
  }

  async function handleSubmit() {
    setSubmitError(null);
    const err1 = validateStep(1);
    if (err1) { setSubmitError(err1); go(1); return; }
    const err3 = validateStep(3);
    if (err3) { setSubmitError(err3); go(3); return; }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        property_type: propertyType,
        location: location.trim(),
        address: address.trim() || null,
        price_per_night: Number(price).toFixed(2),
        bedrooms,
        beds,
        bathrooms,
        max_guests: maxGuests,
        min_nights: minNights,
        images,
        amenity_ids: Array.from(selectedAmenities),
        rules: Object.entries(ruleStates)
          .filter(([id]) => selectedAmenities.size >= 0) // keep all rules where user touched? send all with allowed
          .map(([id, v]) => ({ rule_id: Number(id), allowed: v.allowed, value: v.value?.trim() || null } as PropertyRuleCreate))
          .filter((r) => rules.some((rr) => rr.id === r.rule_id)),
        seasonal_prices: seasonalPrices,
      };
      // Only send rules that exist and have been configured - send all
      await createProperty(payload as any);
      router.push("/owner/properties");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = Math.round((step / 7) * 100);

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-xs pt-space-md mb-space-md">
              <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                <Link href="/owner" className="hover:text-primary transition-colors">Dashboard</Link>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <Link href="/owner/properties" className="hover:text-primary transition-colors">My Properties</Link>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <span className="text-primary font-semibold">Add New Listing (7 Steps)</span>
              </nav>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm mt-space-xxs">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Add New Property</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Step-by-step guided onboarding to list your home or chalet for StayLeb guest reservations.</p>
                </div>
                <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1.5 rounded-full self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">Step {step} of 7: {["Basic Info","Details","Pricing","Photos","Amenities & Rules","Seasonal","Review"][step-1]}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg overflow-x-auto">
              <div className="flex items-center justify-between min-w-[760px] gap-2">
                {["Basic Info","Details","Pricing","Photos","Amenities & Rules","Seasonal","Review"].map((label, idx) => {
                  const n = idx + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <div key={n} className="flex items-center gap-2 flex-1">
                      <button type="button" onClick={() => go(n)} className={`step-tab flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${active ? "bg-primary-container text-on-primary" : done ? "bg-[#ECFDF5] text-[#059669] border border-[#059669]/10" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[12px] ${active ? "bg-surface-container-lowest text-primary" : done ? "bg-[#059669] text-white" : "bg-surface-container text-on-surface-variant"}`}>{done ? "✓" : n}</span>
                        <span className="font-label-sm text-label-sm font-semibold whitespace-nowrap">{label}</span>
                      </button>
                      {n < 7 && <div className={`flex-1 h-[2px] ${done ? "bg-[#059669]" : "bg-surface-container"}`} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                <div id="wizard-form" className="flex flex-col gap-space-lg">
                  {/* Step 1 */}
                  <WizardStep id="step-panel-1" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" number={1}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">01</span><h2 className="font-title-md text-title-md text-on-surface font-bold">Basic Information</h2></div>
                      <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">Step 1 of 7</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div className="md:col-span-2 flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Property Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={255} className="w-full h-11 px-space-sm bg-surface-container-low text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body-md" placeholder="e.g. Qartaba High Valley Stone Chalet" />
                      </div>
                      <div className="flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Property Type *</label>
                        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as any)} className="w-full h-11 px-space-sm bg-surface-container-low text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body-md cursor-pointer">
                          <option value="chalet">Chalet</option>
                          <option value="furnished_house">Furnished House</option>
                        </select>
                        <span className="font-caption text-caption text-on-surface-variant">Backend accepts chalet / furnished_house</span>
                      </div>
                      <div className="flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Region / District *</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} required minLength={2} maxLength={150} className="w-full h-11 px-space-sm bg-surface-container-low text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body-md" placeholder="e.g. Qartaba, Jbeil District" />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Street Address & Landmarks</label>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={255} className="w-full h-11 px-space-sm bg-surface-container-low text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body-md" placeholder="Enter road name and arrival landmarks" />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-space-xxs">
                        <div className="flex items-center justify-between gap-2">
                          <label className="font-label-md text-label-md text-[#157375] font-semibold">Detailed Listing Description</label>
                          <button type="button" onClick={handleGenerateAI} disabled={aiLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFE8CC] hover:bg-[#FFDCC2] text-[#7A3E1A] font-label-sm text-label-sm font-semibold shadow-sm border border-[#FFDCC2] transition-colors disabled:opacity-60 shrink-0">
                            <Icon name="auto_awesome" className="material-symbols-outlined text-[18px] text-[#7A3E1A]" />
                            {aiLoading ? "Generating…" : "Generate with StayLeb AI"}
                          </button>
                        </div>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} rows={4} className="w-full p-3 bg-[#EEF0FF] border border-[#157375]/10 rounded-xl text-[#1E293B] font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-[#157375]/20 placeholder:text-[#64748B] resize-y shadow-sm" placeholder="Perched on the tranquil terraces of Qartaba overlooking the Adonis River valley, this hand-hewn natural stone chalet blends authentic Lebanese mountain architecture with modern conveniences. Features uninterrupted solar backup power, an artisanal wood fireplace, and panoramic sunset decks." />
                        <p className="font-caption text-caption text-[#157375]/60">{description.length}/10 min characters • StayLeb AI uses your title, location and capacity to craft authentic tone</p>
                      </div>
                    </div>
                  </WizardStep>

                  <WizardStep id="step-panel-2" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" number={2}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">02</span><h2 className="font-title-md text-title-md text-on-surface font-bold">Capacity & Space Details</h2></div>
                      <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">Step 2 of 7</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">Configure guest capacity and layout specifications.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                      {[
                        { label: "Bedrooms", sub: "Private rooms", val: bedrooms, set: setBedrooms, min: 0 },
                        { label: "Beds", sub: "Total sleeping units", val: beds, set: setBeds, min: 1 },
                        { label: "Bathrooms", sub: "With hot water", val: bathrooms, set: setBathrooms, min: 1 },
                        { label: "Max Guests", sub: "Occupancy limit", val: maxGuests, set: setMaxGuests, min: 1 },
                        { label: "Min Nights", sub: "Stay requirement", val: minNights, set: setMinNights, min: 1 },
                      ].map((c) => (
                        <div key={c.label} className="p-5 sm:p-6 rounded-xl bg-white border border-[#157375]/10 flex flex-col gap-4 shadow-sm hover:border-[#157375]/20 hover:shadow-md transition-all min-h-[160px] items-center text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-8 h-8 rounded-lg bg-[#157375]/10 flex items-center justify-center text-[#157375] shrink-0">
                              <Icon name={c.label === "Bedrooms" ? "bedroom_parent" : c.label === "Beds" ? "bed" : c.label === "Bathrooms" ? "bathtub" : c.label === "Max Guests" ? "group" : "night_shelter"} className="material-symbols-outlined text-[20px]" />
                            </div>
                            <span className="font-caption text-caption text-[#157375]/70 uppercase tracking-wider font-bold tracking-widest">{c.label}</span>
                          </div>
                          <div className="flex items-center gap-3 justify-center">
                            <button type="button" aria-label={`Decrease ${c.label}`} onClick={() => c.set(Math.max(c.min, c.val - 1))} className="w-10 h-10 rounded-full bg-[#157375] text-white flex items-center justify-center font-bold text-xl leading-none hover:bg-[#0f4a4c] active:scale-95 shadow-sm transition-all border border-[#157375]">−</button>
                            <span className="w-10 text-center font-bold text-[#157375] text-2xl tabular-nums">{c.val}</span>
                            <button type="button" aria-label={`Increase ${c.label}`} onClick={() => c.set(c.val + 1)} className="w-10 h-10 rounded-full bg-[#157375] text-white flex items-center justify-center font-bold text-xl leading-none hover:bg-[#0f4a4c] active:scale-95 shadow-sm transition-all border border-[#157375]">+</button>
                          </div>
                          <span className="font-caption text-caption text-[#157375]/60 text-center">{c.sub}</span>
                        </div>
                      ))}
                    </div>
                  </WizardStep>

                  <WizardStep id="step-panel-3" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" number={3}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">03</span><h2 className="font-title-md text-title-md text-on-surface font-bold">Base Pricing (USD)</h2></div>
                      <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">Step 3 of 7</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                      <div className="md:col-span-6 flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Base Price per Night *</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 font-headline-sm text-headline-sm text-primary font-bold">$</span>
                          <input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" step="0.01" min="0.01" className="w-full h-12 pl-10 pr-space-sm bg-surface-container-low text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-headline-sm text-headline-sm text-primary font-bold" placeholder="150" />
                          <span className="absolute right-4 font-label-md text-label-md text-on-surface-variant">USD / night</span>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-1">Standard regular season rate.</p>
                      </div>
                      <div className="md:col-span-6 p-space-sm bg-surface-container-low rounded-xl flex items-start gap-space-xs border border-surface-container">
                        <Icon name="info" className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5"><span className="font-label-sm text-label-sm font-semibold text-on-surface">Seasonal Multipliers in Step 6</span><p className="font-body-md text-body-md text-on-surface-variant">Customize peak ski weeks and holidays without overriding base quote.</p></div>
                      </div>
                    </div>
                  </WizardStep>

                  <WizardStep id="step-panel-4" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" number={4}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">04</span><h2 className="font-title-md text-title-md text-on-surface font-bold">Property Photography</h2></div>
                      <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">{images.length} Photos</span>
                    </div>
                    <label className="p-space-lg rounded-xl bg-surface-container-low/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors group border border-dashed border-outline-variant">
                      <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm mb-space-xs group-hover:scale-110 transition-transform"><Icon name="cloud_upload" className="material-symbols-outlined text-[26px]" /></div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Drop high-res photos here or <span className="text-primary underline">browse</span></p>
                      <p className="font-caption text-caption text-on-surface-variant mt-1">JPG, PNG or WEBP up to 5MB each (ImageKit). First image becomes primary.</p>
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                      <div className="mt-2 text-xs text-on-surface-variant">{uploading ? "Uploading…" : "Click to select files"}</div>
                    </label>
                    {uploadError && <div className="p-3 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{uploadError}</div>}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm aspect-[16/10] group bg-surface-container">
                            <img src={img.image_url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                            {img.is_primary && <div className="absolute top-2 left-2 bg-primary-container text-on-primary font-caption text-caption px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 shadow-sm"><Icon name="star" className="material-symbols-outlined text-[12px]" /> Primary</div>}
                            <div className="absolute inset-0 bg-inverse-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!img.is_primary && <button type="button" onClick={() => setPrimary(idx)} className="px-2 py-1 bg-surface-container-lowest text-primary font-caption text-caption rounded-md shadow font-medium hover:bg-surface">Make Primary</button>}
                              <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-error-container text-on-error-container rounded-md shadow"><Icon name="delete" className="material-symbols-outlined text-[16px]" /></button>
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">#{img.display_order + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </WizardStep>

                  <WizardStep id="step-panel-5" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg" number={5}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">05</span><h2 className="font-title-md text-title-md text-on-surface font-bold">Amenities & Master Rules</h2></div>
                      <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">Step 5 of 7</span>
                    </div>
                    {catLoading ? (
                      <div className="py-8 flex items-center justify-center"><div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-center justify-between"><h3 className="font-label-md text-label-md text-on-surface font-bold">Included Master Amenities</h3><span className="font-caption text-caption text-on-surface-variant">StayLeb Master Catalog · {selectedAmenities.size} selected</span></div>
                          {Object.entries(groupedAmenities).map(([cat, list]) => (
                            <div key={cat} className="space-y-2">
                              <h4 className="font-caption text-caption font-semibold text-primary uppercase tracking-wider mt-2">{cat}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">
                                {list.map((a) => (
                                  <label key={a.id} className={`flex items-center gap-space-xs p-space-sm rounded-xl cursor-pointer transition-colors border ${selectedAmenities.has(a.id) ? "bg-[#ECFDF5] border-[#059669]/20" : "bg-surface-container-low/70 border-transparent hover:bg-surface-container-high"}`}>
                                    <input type="checkbox" checked={selectedAmenities.has(a.id)} onChange={() => toggleAmenity(a.id)} className="w-5 h-5 rounded accent-primary" />
                                    <span className="font-label-md text-label-md text-on-surface truncate" title={a.description || a.name}>{a.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          {amenities.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant">No amenities available.</p>}
                        </div>
                        <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container">
                          <div className="flex items-center justify-between"><h3 className="font-label-md text-label-md text-on-surface font-bold">House Rules & Protocols</h3><span className="font-caption text-caption text-on-surface-variant">Guest Protocol Policy</span></div>
                          <div className="flex flex-col gap-space-sm">
                            {Object.entries(groupedRules).map(([cat, list]) => (
                              <div key={cat} className="space-y-2">
                                <h4 className="font-caption text-caption font-semibold text-primary uppercase tracking-wider">{cat}</h4>
                                {list.map((r) => {
                                  const state = ruleStates[r.id];
                                  if (!state) return null;
                                  return (
                                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm bg-surface-container-low/50 rounded-xl gap-2">
                                      <div className="flex flex-col">
                                        <span className="font-label-md text-label-md font-semibold text-[#157375]">{r.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="inline-flex bg-white border border-[#157375]/10 p-1 rounded-lg shadow-sm">
                                          <button type="button" onClick={() => setRuleStates((prev) => ({ ...prev, [r.id]: { ...prev[r.id], allowed: true } }))} className={`px-3 py-1 rounded-md font-label-sm text-label-sm transition-colors ${state.allowed ? "bg-[#ECFDF5] text-[#059669] font-bold" : "text-[#157375] hover:bg-[#157375]/5 font-medium"}`}>Allowed</button>
                                          <button type="button" onClick={() => setRuleStates((prev) => ({ ...prev, [r.id]: { ...prev[r.id], allowed: false } }))} className={`px-3 py-1 rounded-md font-label-sm text-label-sm transition-colors ${!state.allowed ? "bg-[#FFF1F2] text-[#E11D48] font-bold" : "text-[#157375] hover:bg-[#157375]/5 font-medium"}`}>Not Allowed</button>
                                        </div>
                                        <input value={state.value} onChange={(e) => setRuleStates((prev) => ({ ...prev, [r.id]: { ...prev[r.id], value: e.target.value } }))} placeholder="value (optional)" maxLength={100} className="w-32 h-8 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] placeholder:text-[#157375]/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </WizardStep>

                  <WizardStep id="step-panel-6" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" number={6}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">06</span><div><h2 className="font-title-md text-title-md text-[#157375] font-bold">Seasonal Pricing</h2><p className="font-caption text-caption text-[#157375]/70">Optional peak intervals</p></div></div>
                      <span className="font-caption text-caption text-[#157375]/70 bg-white border border-[#157375]/10 px-2.5 py-0.5 rounded-full">Optional</span>
                    </div>
                    {seasonalPrices.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {seasonalPrices.map((s, idx) => (
                          <div key={idx} className="p-space-sm bg-white border border-[#157375]/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs shadow-sm">
                            <div className="flex items-center gap-space-xs">
                              <div className="w-8 h-8 rounded-lg bg-[#157375]/10 text-[#157375] flex items-center justify-center"><Icon name="ac_unit" className="material-symbols-outlined text-[18px]" /></div>
                              <div><p className="font-label-md text-label-md font-semibold text-[#157375]">{s.season_name}</p><p className="font-caption text-caption text-[#157375]/70">{s.start_date} → {s.end_date}</p></div>
                            </div>
                            <div className="flex items-center gap-space-sm"><span className="font-title-md text-title-md text-[#157375] font-bold">${Number(s.price_per_night).toFixed(2)}<span className="text-body-md font-normal text-[#157375]/70">/night</span></span><button type="button" onClick={() => setSeasonalPrices((prev) => prev.filter((_, i) => i !== idx))} className="p-1 rounded-full bg-[#FFF1F2] text-[#E11D48] hover:bg-error-container/30 border border-[#E11D48]/10"><Icon name="close" className="material-symbols-outlined text-[18px]" /></button></div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm bg-white border border-[#157375]/10 p-space-sm rounded-xl items-end">
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-[#157375]">Season Name *</label><input value={seasonForm.season_name} onChange={(e) => setSeasonForm({ ...seasonForm, season_name: e.target.value })} placeholder="Winter Ski Peak" className="h-9 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] placeholder:text-[#157375]/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20 w-full" /></div>
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-[#157375]">Start *</label><input type="date" value={seasonForm.start_date} onChange={(e) => setSeasonForm({ ...seasonForm, start_date: e.target.value })} className="h-9 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20 w-full" /></div>
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-[#157375]">End *</label><input type="date" value={seasonForm.end_date} onChange={(e) => setSeasonForm({ ...seasonForm, end_date: e.target.value })} className="h-9 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20 w-full" /></div>
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-white">Price *</label><div className="flex gap-2 items-center min-w-0"><input type="number" step="0.01" value={seasonForm.price_per_night} onChange={(e) => setSeasonForm({ ...seasonForm, price_per_night: e.target.value })} placeholder="280" className="flex-1 min-w-0 h-9 px-2 bg-[#157375] border border-[#157375]/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20" /><button type="button" onClick={addSeason} className="shrink-0 whitespace-nowrap px-4 h-9 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white font-label-sm font-semibold shadow-sm border border-[#157375] flex items-center justify-center">Add</button></div></div>
                    </div>
                    {seasonError && <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{seasonError}</div>}
                    <p className="font-caption text-caption text-on-surface-variant">Validate: start ≤ end, no overlaps. Backend will reject overlaps.</p>
                  </WizardStep>

                  <WizardStep id="step-panel-7" className="wizard-panel bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" number={7}>
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                      <div className="flex items-center gap-space-xs"><span className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-label-sm">07</span><h2 className="font-title-md text-title-md text-on-surface font-bold">Review & Final Submission</h2></div>
                      <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2.5 py-0.5 rounded-full">Ready for Admin Review</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">Please verify all parameters. You can jump back via Edit buttons.</p>
                    <div className="flex flex-col gap-space-sm">
                      <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Basic Info</span><span className="font-label-md text-label-md text-on-surface font-bold">{title || "—"} · {propertyType} · {location || "—"}</span></div><button type="button" onClick={() => go(1)} className="font-label-sm text-label-sm text-primary hover:underline font-semibold">Edit</button></div>
                      <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Capacity</span><span className="font-label-md text-label-md text-on-surface font-semibold">{bedrooms} BR · {beds} Beds · {bathrooms} Baths · Max {maxGuests} · Min {minNights} Nights</span></div><button type="button" onClick={() => go(2)} className="font-label-sm text-label-sm text-primary hover:underline font-semibold">Edit</button></div>
                      <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Pricing</span><span className="font-label-md text-label-md text-on-surface font-semibold">${Number(price || 0).toFixed(2)} / night · {seasonalPrices.length} seasonal {seasonalPrices.length === 1 ? "tier" : "tiers"}</span></div><button type="button" onClick={() => go(3)} className="font-label-sm text-label-sm text-primary hover:underline font-semibold">Edit</button></div>
                      <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption text-on-surface-variant">Photography & Amenities</span><span className="font-label-md text-label-md text-on-surface font-semibold">{images.length} photos · {selectedAmenities.size} amenities · {rules.length} rules</span></div><button type="button" onClick={() => go(4)} className="font-label-sm text-label-sm text-primary hover:underline font-semibold">Edit</button></div>
                    </div>
                    <div className="p-space-sm bg-surface-container-low rounded-xl flex items-start gap-space-xs border border-surface-container">
                      <Icon name="verified_user" className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" />
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">By clicking <strong>Submit Property for Review</strong>, your listing becomes <strong className="text-on-surface">Pending</strong>. Admin inspects location and photography. Avg 3.5h approval.</p>
                    </div>
                    {submitError && <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#E11D48]/20 text-sm text-[#E11D48] flex items-start gap-2"><Icon name="error" className="material-symbols-outlined text-[18px] mt-0.5" /><span>{submitError}</span></div>}
                  </WizardStep>

                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
                    <button type="button" onClick={back} className={`h-11 px-space-md rounded-lg border border-surface-container hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors ${step === 1 ? "invisible" : ""}`}>
                      <Icon name="arrow_back" className="material-symbols-outlined text-[18px]" /> Back
                    </button>
                    <div className="flex items-center gap-space-xs">
                      {step < 7 ? (
                        <button type="button" onClick={handleNext} className="h-11 px-space-lg rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.99]">
                          <span>Continue</span><Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />
                        </button>
                      ) : (
                        <button type="button" onClick={handleSubmit} disabled={submitting} className="h-11 px-space-lg rounded-lg bg-[#157375] hover:bg-[#0f5a5c] disabled:opacity-60 text-white font-label-md text-label-md font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.99]">
                          {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="verified" className="material-symbols-outlined text-[18px]" />}
                          {submitting ? "Submitting…" : "Submit Property for Review"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-4 flex flex-col gap-space-md sticky top-20">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs overflow-hidden">
                  <div className="relative rounded-lg overflow-hidden aspect-[16/10] bg-surface-container">
                    {images[0] ? <img src={images[0].image_url} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><Icon name="image" className="material-symbols-outlined text-[32px]" /></div>}
                    <span className="absolute top-2 left-2 bg-primary-container text-on-primary font-caption text-caption px-2 py-0.5 rounded-md font-semibold">Draft Preview</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <div className="flex items-center justify-between"><span className="font-label-md text-label-md text-on-surface font-bold truncate">{title || "Untitled Property"}</span><span className="font-title-md text-title-md text-primary font-bold">${Number(price || 0).toFixed(0)}<span className="font-caption text-caption text-on-surface-variant font-normal">/nt</span></span></div>
                    <span className="font-caption text-caption text-on-surface-variant">{location || "Select location"} · {propertyType}</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between"><h3 className="font-title-md text-title-md text-on-surface font-bold">Listing Readiness</h3><span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full">Step {step} of 7</span></div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden"><div className="bg-primary-container h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                  <div className="flex flex-col gap-space-xs font-label-sm text-label-sm">
                    {[
                      { n: 1, label: "Basic Information" },
                      { n: 2, label: "Capacity Details" },
                      { n: 3, label: "Base Pricing" },
                      { n: 4, label: `Photography (${images.length} photos)` },
                      { n: 5, label: "Amenities & Rules" },
                      { n: 6, label: "Seasonal Pricing" },
                      { n: 7, label: "Review & Submit" },
                    ].map((item) => (
                      <div key={item.n} className={`flex items-center justify-between ${step === item.n ? "text-primary font-semibold" : step > item.n ? "text-[#059669]" : "text-on-surface-variant"}`}>
                        <span className="flex items-center gap-1.5"><Icon name={step > item.n ? "check_circle" : step === item.n ? "radio_button_checked" : "radio_button_unchecked"} className="material-symbols-outlined text-[16px]" /> {item.n}. {item.label}</span>
                        <span className="text-xs">{step > item.n ? "Done" : step === item.n ? "In Progress" : "Upcoming"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-container-low/70 rounded-xl p-space-md flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0"><Icon name="local_police" className="material-symbols-outlined text-[20px]" /></div>
                  <div className="flex flex-col"><span className="font-label-md text-label-md text-on-surface font-semibold">Priority Host Fast-Track</span><span className="font-caption text-caption text-on-surface-variant">Avg turnaround is 3.5h.</span></div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
