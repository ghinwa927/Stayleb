"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, updateProperty, getAmenities, getRules, uploadPropertyImage, type Amenity, type Rule, type PropertyImageCreate, type SeasonalPriceCreate, type PropertyRuleCreate } from "@/services/owner";

export function EditPropertySection0() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<"chalet" | "furnished_house">("chalet");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("150");
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [maxGuests, setMaxGuests] = useState(4);
  const [minNights, setMinNights] = useState(1);
  const [images, setImages] = useState<PropertyImageCreate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<number>>(new Set());
  const [ruleStates, setRuleStates] = useState<Record<number, { allowed: boolean; value: string }>>({});
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPriceCreate[]>([]);
  const [seasonForm, setSeasonForm] = useState({ season_name: "", start_date: "", end_date: "", price_per_night: "" });
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getOwnerProperty(id).catch((e) => { throw e; }), getAmenities().catch(() => [] as Amenity[]), getRules().catch(() => [] as Rule[])])
      .then(([prop, ams, rs]) => {
        setTitle(prop.title);
        setPropertyType(prop.property_type as any);
        setLocation(prop.location);
        setAddress(prop.address || "");
        setDescription(prop.description);
        setPrice(String(prop.price_per_night));
        setBedrooms(prop.bedrooms);
        setBeds(prop.beds);
        setBathrooms(prop.bathrooms);
        setMaxGuests(prop.max_guests);
        setMinNights(prop.min_nights);
        setImages(prop.images.map((img, idx) => ({ image_url: img.image_url, imagekit_file_id: img.imagekit_file_id, is_primary: img.is_primary, display_order: img.display_order ?? idx })));
        setSelectedAmenities(new Set(prop.amenities.map((a) => a.id)));
        setAmenities(ams);
        setRules(rs);
        const init: Record<number, { allowed: boolean; value: string }> = {};
        rs.forEach((r) => {
          const existing = prop.property_rules.find((pr) => pr.rule_id === r.id);
          init[r.id] = { allowed: existing ? existing.allowed : true, value: existing?.value || "" };
        });
        // include rules not in master? keep existing
        prop.property_rules.forEach((pr) => {
          if (!init[pr.rule_id]) init[pr.rule_id] = { allowed: pr.allowed, value: pr.value || "" };
        });
        setRuleStates(init);
        setSeasonalPrices(prop.seasonal_prices.map((s) => ({ season_name: s.season_name, start_date: s.start_date, end_date: s.end_date, price_per_night: String(s.price_per_night) })));
        setStatus(prop.status);
        setRejectionReason(prop.rejection_reason);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load property"))
      .finally(() => setLoading(false));
  }, [id]);

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

  function toggleAmenity(aid: number) {
    setSelectedAmenities((prev) => {
      const n = new Set(prev);
      if (n.has(aid)) n.delete(aid);
      else n.add(aid);
      return n;
    });
  }

  function setPrimary(idx: number) {
    setImages((prev) => prev.map((im, i) => ({ ...im, is_primary: i === idx })));
  }
  function removeImage(idx: number) {
    setImages((prev) => {
      const f = prev.filter((_, i) => i !== idx);
      if (f.length && !f.some((im) => im.is_primary)) f[0].is_primary = true;
      return f.map((im, i) => ({ ...im, display_order: i }));
    });
  }
  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error(`${file.name}: Only JPG, PNG, WEBP`);
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
    if (!start_date || !end_date) { setSeasonError("Start and end required"); return; }
    if (new Date(end_date) < new Date(start_date)) { setSeasonError("End must be on/after start"); return; }
    const p = Number(price_per_night);
    if (!p || p <= 0) { setSeasonError("Price must be >0"); return; }
    for (const s of seasonalPrices) {
      if (new Date(s.start_date) <= new Date(end_date) && new Date(start_date) <= new Date(s.end_date)) { setSeasonError(`Overlaps with "${s.season_name}"`); return; }
    }
    setSeasonalPrices((prev) => [...prev, { season_name: season_name.trim(), start_date, end_date, price_per_night: Number(price_per_night).toFixed(2) }]);
    setSeasonForm({ season_name: "", start_date: "", end_date: "", price_per_night: "" });
  }

  async function handleSave() {
    if (!id) return;
    setSaveMsg(null);
    if (title.trim().length < 3) { setSaveMsg({ text: "Title must be at least 3 characters", ok: false }); return; }
    if (location.trim().length < 2) { setSaveMsg({ text: "Location must be at least 2 characters", ok: false }); return; }
    if (description.trim().length < 10) { setSaveMsg({ text: "Description must be at least 10 characters", ok: false }); return; }
    const p = Number(price);
    if (!p || p <= 0) { setSaveMsg({ text: "Base price must be >0", ok: false }); return; }
    setSaving(true);
    try {
      const payload: any = {
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
        rules: Object.entries(ruleStates).map(([rid, v]) => ({ rule_id: Number(rid), allowed: v.allowed, value: v.value?.trim() || null })),
        seasonal_prices: seasonalPrices,
      };
      const updated = await updateProperty(id, payload);
      setStatus(updated.status);
      setRejectionReason(updated.rejection_reason);
      setSaveMsg({ text: updated.status === "pending" ? "Saved — status reset to Pending for Admin review" : "Saved successfully", ok: true });
      setTimeout(() => router.push("/owner/properties"), 1200);
    } catch (e) {
      setSaveMsg({ text: e instanceof Error ? e.message : "Save failed", ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><span className="text-sm text-primary">Loading property…</span></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-error/20 text-center">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-error mb-2" />
          <h2 className="font-title-md text-title-md font-bold text-[#157375]">Failed to load property</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error}</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => router.push("/owner/properties")} className="px-4 py-2 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white text-sm font-medium">Back to properties</button>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white text-sm font-medium">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-lg w-full max-w-[1240px] mx-auto py-space-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex flex-col gap-space-xxs">
                  <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                    <Link href="/owner" className="hover:text-primary transition-colors">Dashboard</Link>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <Link href="/owner/properties" className="hover:text-primary transition-colors">My Properties</Link>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <span className="text-[#157375] font-medium truncate max-w-[160px]">{title}</span>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <span className="text-primary font-semibold">Edit</span>
                  </nav>
                  <div className="flex items-center gap-space-sm flex-wrap pt-space-xxs">
                    <h1 className="font-headline-lg text-headline-lg text-[#157375] tracking-tight">Edit Property — {title}</h1>
                    <span className={`inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full shadow-sm font-label-sm text-label-sm font-semibold ${status === "approved" ? "bg-[#ECFDF5] text-[#059669] border border-[#059669]/10" : status === "pending" ? "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/10" : "bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/10"}`}>
                      <span className={`w-2 h-2 rounded-full ${status === "approved" ? "bg-[#059669]" : status === "pending" ? "bg-[#D97706] animate-pulse" : "bg-[#E11D48]"}`} />
                      Status: {status} {status === "approved" ? "· Live on StayLeb" : status === "pending" ? "· Awaiting review" : ""}
                    </span>
                  </div>
                  {rejectionReason && status === "rejected" && (
                    <div className="mt-2 p-3 rounded-xl bg-[#FFF1F2] border border-[#E11D48]/20 flex items-start gap-2">
                      <Icon name="error" className="material-symbols-outlined text-[#E11D48] text-[20px] mt-0.5" />
                      <div><p className="font-label-sm text-label-sm font-semibold text-[#E11D48]">Rejection reason</p><p className="font-body-sm text-body-sm text-[#881337] mt-0.5">{rejectionReason}</p></div>
                    </div>
                  )}
                  <p className="font-body-md text-body-md text-on-surface-variant">Update listing details, pricing, seasonal overrides, amenities, rules, and imagery.</p>
                  {saveMsg && (
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${saveMsg.ok ? "bg-[#ECFDF5] text-[#065F46] border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20"}`}>
                      <Icon name={saveMsg.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
                      {saveMsg.text}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-space-xs shrink-0 self-start md:self-center">
                  <Link href={`/owner/properties/${id}/preview`} className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-[#157375] hover:bg-[#0f4a4c] text-white font-label-md text-label-md transition-all">
                    <Icon name="visibility" className="material-symbols-outlined text-[18px]" /> Preview
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                <div className="lg:col-span-8 flex flex-col gap-space-lg">
                  {/* Basic */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-xs"><span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="info" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">1. Basic Information</h2><p className="font-caption text-caption text-on-surface-variant">Identify your listing.</p></div></div>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container font-caption text-caption text-secondary">Step 1 of 7</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div className="flex flex-col gap-space-xxs md:col-span-2">
                        <label className="font-label-md text-label-md text-[#157375] font-semibold">Listing Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-[#157375] font-body-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Cedar Peak Stone Chalet" />
                      </div>
                      <div className="flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-[#157375] font-semibold">Property Type *</label>
                        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as any)} className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-[#157375] font-body-md focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="chalet">Chalet</option>
                          <option value="furnished_house">Furnished House</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-space-xxs">
                        <label className="font-label-md text-label-md text-[#157375] font-semibold">Location / District *</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-[#157375] font-body-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Faraya Mzaar, Mount Lebanon" />
                      </div>
                      <div className="flex flex-col gap-space-xxs md:col-span-2">
                        <label className="font-label-md text-label-md text-[#157375] font-semibold">Street Address</label>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-[#157375] font-body-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Junction Slope Way, Plot 402" />
                      </div>
                      <div className="flex flex-col gap-space-xxs md:col-span-2">
                        <label className="font-label-md text-label-md text-[#157375] font-semibold">Property Description *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full p-space-md rounded-lg bg-surface-container-low text-[#157375] font-body-md focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed" placeholder="Perched on the prime snowy slopes..." />
                        <span className="font-caption text-caption text-on-surface-variant">{description.length}/10 min</span>
                      </div>
                    </div>
                  </section>

                  {/* Details */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-xs"><span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="tune" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">2. Property Details & Capacity</h2><p className="font-caption text-caption text-on-surface-variant">Guest allowances and room inventory.</p></div></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                      {[
                        { label: "Bedrooms", icon: "bedroom_parent", val: bedrooms, set: setBedrooms, min: 0 },
                        { label: "Total Beds", icon: "bed", val: beds, set: setBeds, min: 1 },
                        { label: "Bathrooms", icon: "bathtub", val: bathrooms, set: setBathrooms, min: 1 },
                        { label: "Max Guests", icon: "group", val: maxGuests, set: setMaxGuests, min: 1 },
                        { label: "Min Nights", icon: "night_shelter", val: minNights, set: setMinNights, min: 1 },
                      ].map((c) => (
                        <div key={c.label} className="p-5 sm:p-6 rounded-xl bg-white border border-[#157375]/10 flex flex-col gap-4 shadow-sm hover:border-[#157375]/20 hover:shadow-md transition-all min-h-[140px] items-center text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-8 h-8 rounded-lg bg-[#157375]/10 flex items-center justify-center text-[#157375] shrink-0">
                              <Icon name={c.icon} className="material-symbols-outlined text-[20px]" />
                            </div>
                            <span className="font-caption text-caption text-[#157375]/70 uppercase tracking-wider font-bold tracking-widest">{c.label}</span>
                          </div>
                          <div className="flex items-center gap-3 justify-center">
                            <button type="button" aria-label={`Decrease ${c.label}`} onClick={() => c.set(Math.max(c.min, c.val - 1))} className="w-10 h-10 rounded-full bg-[#157375] text-white flex items-center justify-center font-bold text-xl leading-none hover:bg-[#0f4a4c] active:scale-95 shadow-sm transition-all border border-[#157375]">−</button>
                            <span className="w-10 text-center font-bold text-[#157375] text-2xl tabular-nums">{c.val}</span>
                            <button type="button" aria-label={`Increase ${c.label}`} onClick={() => c.set(c.val + 1)} className="w-10 h-10 rounded-full bg-[#157375] text-white flex items-center justify-center font-bold text-xl leading-none hover:bg-[#0f4a4c] active:scale-95 shadow-sm transition-all border border-[#157375]">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Pricing */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-xs"><span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="payments" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">3. Standard Pricing</h2><p className="font-caption text-caption text-on-surface-variant">Default nightly rate in USD.</p></div></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center">
                      <div className="p-space-md rounded-xl bg-surface-container-high/40 flex flex-col gap-space-xxs">
                        <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">Base Nightly Rate *</label>
                        <div className="flex items-baseline gap-1"><span className="font-headline-lg text-headline-lg text-primary font-bold">$</span><input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="w-32 bg-transparent font-headline-lg text-headline-lg text-primary font-bold focus:outline-none border-b border-primary/30" /></div>
                      </div>
                      <div className="md:col-span-2 p-space-md rounded-xl bg-surface-container-low/60 flex flex-col gap-2">
                        <div className="flex items-center justify-between"><span className="font-label-md text-label-md font-semibold text-black">StayLeb Host Commission</span><span className="font-label-md text-secondary font-bold">12% Fixed</span></div>
                        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden"><div className="bg-primary-container h-full" style={{ width: "88%" }} /></div>
                        <div className="flex justify-between font-caption text-caption text-on-surface-variant"><span>You receive net: <strong className="text-[#157375]">${(Number(price || 0) * 0.88).toFixed(2)}/night</strong></span></div>
                      </div>
                    </div>
                  </section>

                  {/* Photos */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-xs"><span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="photo_library" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">4. Photos & Visual Showcase</h2><p className="font-caption text-caption text-on-surface-variant">High-res authentic photography.</p></div></div>
                    </div>
                    <label className="p-space-lg rounded-xl bg-surface-container-low/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors group border border-dashed border-outline-variant">
                      <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm mb-space-xs group-hover:scale-110 transition-transform"><Icon name="cloud_upload" className="material-symbols-outlined text-[26px]" /></div>
                      <p className="font-label-md text-label-md text-[#157375] font-semibold">Drop high-res photos here or <span className="text-primary underline">browse</span></p>
                      <p className="font-caption text-caption text-on-surface-variant mt-1">JPG, PNG, WEBP up to 5MB each</p>
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                      <span className="mt-2 text-xs text-on-surface-variant">{uploading ? "Uploading…" : "Click to select"}</span>
                    </label>
                    {uploadError && <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{uploadError}</div>}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm aspect-[16/10] group bg-surface-container">
                            <img src={img.image_url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                            {img.is_primary && <div className="absolute top-2 left-2 bg-primary text-on-primary font-caption text-caption px-2 py-0.5 rounded-md font-semibold flex items-center gap-1"><Icon name="star" className="material-symbols-outlined text-[12px]" /> Primary</div>}
                            <div className="absolute inset-0 bg-inverse-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!img.is_primary && <button type="button" onClick={() => setPrimary(idx)} className="px-2 py-1 bg-[#157375] text-white hover:bg-[#0f4a4c] font-caption text-caption rounded-md shadow">Make Primary</button>}
                              <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-error-container text-on-error-container rounded-md shadow"><Icon name="delete" className="material-symbols-outlined text-[16px]" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Amenities */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-xs"><span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="checklist" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">5. Amenities & Mountain Utilities</h2><p className="font-caption text-caption text-on-surface-variant">Lebanon-specific reliability features.</p></div></div>
                    </div>
                    {Object.entries(groupedAmenities).map(([cat, list]) => (
                      <div key={cat} className="space-y-2">
                        <h4 className="font-caption text-caption font-semibold text-primary uppercase tracking-wider">{cat}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-xs">
                          {list.map((a) => (
                            <label key={a.id} className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer border ${selectedAmenities.has(a.id) ? "bg-[#ECFDF5] border-[#059669]/20" : "bg-surface-container-low/70 border-transparent hover:bg-surface-container-high"}`}>
                              <input type="checkbox" checked={selectedAmenities.has(a.id)} onChange={() => toggleAmenity(a.id)} className="w-5 h-5 rounded accent-primary" />
                              <span className="font-label-md text-label-md text-[#157375] truncate" title={a.description || a.name}>{a.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>

                  {/* Rules */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs pb-space-xs">
                      <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="gavel" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">6. House Rules</h2><p className="font-caption text-caption text-on-surface-variant">Enforced during booking confirmation.</p></div>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(groupedRules).map(([cat, list]) => (
                        <div key={cat} className="space-y-2">
                          <h4 className="font-caption text-caption font-semibold text-primary uppercase tracking-wider">{cat}</h4>
                          {list.map((r) => {
                            const st = ruleStates[r.id];
                            if (!st) return null;
                            return (
                              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm bg-surface-container-low rounded-xl gap-2">
                                <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-[#157375]">{r.name}</span></div>
                                <div className="flex items-center gap-2">
                                  <div className="inline-flex bg-white border border-[#157375]/10 p-1 rounded-lg shadow-sm">
                                    <button type="button" onClick={() => setRuleStates((p) => ({ ...p, [r.id]: { ...p[r.id], allowed: true } }))} className={`px-3 py-1 rounded-md font-label-sm transition-colors ${st.allowed ? "bg-[#ECFDF5] text-[#059669] font-bold" : "text-[#157375] hover:bg-[#157375]/5 font-medium"}`}>Allowed</button>
                                    <button type="button" onClick={() => setRuleStates((p) => ({ ...p, [r.id]: { ...p[r.id], allowed: false } }))} className={`px-3 py-1 rounded-md font-label-sm transition-colors ${!st.allowed ? "bg-[#FFF1F2] text-[#E11D48] font-bold" : "text-[#157375] hover:bg-[#157375]/5 font-medium"}`}>Not Allowed</button>
                                  </div>
                                  <input value={st.value} onChange={(e) => setRuleStates((p) => ({ ...p, [r.id]: { ...p[r.id], value: e.target.value } }))} placeholder="value (optional)" maxLength={100} className="w-32 h-8 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] placeholder:text-[#157375]/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Seasonal */}
                  <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-xs"><span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Icon name="date_range" className="material-symbols-outlined text-[20px]" /></span><div><h2 className="font-title-md text-title-md text-[#157375]">7. Seasonal & Peak Pricing Overrides</h2><p className="font-caption text-caption text-on-surface-variant">Automatically adjusts rates during ski holidays.</p></div></div>
                    </div>
                    {seasonalPrices.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {seasonalPrices.map((s, idx) => (
                          <div key={idx} className="p-space-md rounded-xl bg-white border border-[#157375]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-sm">
                            <div className="flex items-start gap-space-sm">
                              <div className="w-10 h-10 rounded-lg bg-[#157375]/10 flex items-center justify-center text-[#157375] shrink-0 mt-0.5"><Icon name="ac_unit" className="material-symbols-outlined text-[22px]" /></div>
                              <div className="flex flex-col"><h3 className="font-label-md text-label-md font-bold text-[#157375]">{s.season_name}</h3><span className="font-body-md text-body-md text-[#157375]/70 mt-0.5">{s.start_date} — {s.end_date}</span></div>
                            </div>
                            <div className="flex items-center gap-space-md self-end md:self-center">
                              <span className="font-headline-sm text-headline-sm text-[#157375] font-bold">${Number(s.price_per_night).toFixed(2)}<span className="text-body-md font-normal text-[#157375]/70">/night</span></span>
                              <button type="button" onClick={() => setSeasonalPrices((prev) => prev.filter((_, i) => i !== idx))} className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] hover:bg-error-container/30 hover:text-error border border-[#E11D48]/10"><Icon name="delete" className="material-symbols-outlined text-[18px]" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm bg-white border border-[#157375]/10 p-space-sm rounded-xl items-end">
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-[#157375]">Season Name *</label><input value={seasonForm.season_name} onChange={(e) => setSeasonForm({ ...seasonForm, season_name: e.target.value })} placeholder="Winter Ski Peak" className="h-9 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] placeholder:text-[#157375]/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20 w-full" /></div>
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-[#157375]">Start *</label><input type="date" value={seasonForm.start_date} onChange={(e) => setSeasonForm({ ...seasonForm, start_date: e.target.value })} className="h-9 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20 w-full" /></div>
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-[#157375]">End *</label><input type="date" value={seasonForm.end_date} onChange={(e) => setSeasonForm({ ...seasonForm, end_date: e.target.value })} className="h-9 px-2 bg-white border border-[#157375]/10 rounded-lg text-sm text-[#157375] focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20 w-full" /></div>
                      <div className="flex flex-col gap-1 min-w-0"><label className="font-caption text-caption font-semibold text-white">Price *</label><div className="flex gap-2 items-center min-w-0"><input type="number" step="0.01" value={seasonForm.price_per_night} onChange={(e) => setSeasonForm({ ...seasonForm, price_per_night: e.target.value })} placeholder="290" className="flex-1 min-w-0 h-9 px-2 bg-[#157375] border border-[#157375]/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-[#157375]/20" /><button type="button" onClick={addSeason} className="shrink-0 whitespace-nowrap px-4 h-9 rounded-lg bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-sm font-semibold shadow-sm flex items-center justify-center">Add</button></div></div>
                    </div>
                    {seasonError && <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{seasonError}</div>}
                  </section>
                </div>

                <aside className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-20">
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between border-b-0 pb-space-xxs">
                      <h3 className="font-title-md text-title-md text-[#157375] font-bold">Listing Controls</h3>
                      <span className="font-caption text-caption text-secondary font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Auto-save on update</span>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <button onClick={handleSave} disabled={saving} className="w-full h-11 px-space-md rounded-xl bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-sm disabled:opacity-60">
                        {saving ? <span className="w-4 h-4 border-2 border-[#157375]/30 border-t-[#157375] rounded-full animate-spin" /> : <Icon name="save" className="material-symbols-outlined text-[18px]" />}
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                      <Link href="/owner/properties" className="w-full h-11 px-space-md rounded-xl bg-[#157375] hover:bg-[#0f4a4c] text-white border border-[#157375] font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-sm">Cancel</Link>
                    </div>
                    <div className="p-space-sm rounded-xl bg-surface-container-low/70 flex items-start gap-space-xs text-on-surface-variant">
                      <Icon name="verified_user" className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5" />
                      <div className="flex flex-col font-caption text-caption leading-relaxed">
                        <span className="font-semibold text-[#157375]">StayLeb Quality Assurance</span>
                        <span>Approved properties become pending after edit for Admin review.</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between"><h4 className="font-label-md text-label-md font-bold">Listing Quality Score</h4><span className="font-headline-sm text-headline-sm text-primary font-bold">96%</span></div>
                    <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden"><div className="bg-primary h-full" style={{ width: "96%" }} /></div>
                    <p className="font-caption text-caption text-on-surface-variant">Professional photos, seasonal pricing, and host verification boost visibility.</p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
