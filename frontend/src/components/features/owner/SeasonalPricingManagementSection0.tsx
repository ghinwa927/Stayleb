"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, updateProperty } from "@/services/owner";

type Season = { season_name: string; start_date: string; end_date: string; price_per_night: string };

export function SeasonalPricingManagementSection0() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [basePrice, setBasePrice] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ season_name: "", start_date: "", end_date: "", price_per_night: "" });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOwnerProperty(id)
      .then((prop) => {
        setProperty(prop);
        setBasePrice(String(prop.price_per_night));
        setSeasons(prop.seasonal_prices.map((s: any) => ({ season_name: s.season_name, start_date: s.start_date, end_date: s.end_date, price_per_night: String(s.price_per_night) })));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  function addSeason() {
    setFormError(null);
    const { season_name, start_date, end_date, price_per_night } = form;
    if (!season_name.trim() || season_name.trim().length < 2) { setFormError("Season name must be at least 2 characters"); return; }
    if (!start_date || !end_date) { setFormError("Start and end dates required"); return; }
    if (new Date(end_date) < new Date(start_date)) { setFormError("End must be on or after start"); return; }
    const p = Number(price_per_night);
    if (!p || p <= 0) { setFormError("Price must be >0"); return; }
    for (const s of seasons) {
      if (new Date(s.start_date) <= new Date(end_date) && new Date(start_date) <= new Date(s.end_date)) { setFormError(`Overlaps with "${s.season_name}"`); return; }
    }
    setSeasons((prev) => [...prev, { season_name: season_name.trim(), start_date, end_date, price_per_night: Number(price_per_night).toFixed(2) }]);
    setForm({ season_name: "", start_date: "", end_date: "", price_per_night: "" });
  }

  async function save() {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProperty(id, { seasonal_prices: seasons as any });
      setSeasons(updated.seasonal_prices.map((s: any) => ({ season_name: s.season_name, start_date: s.start_date, end_date: s.end_date, price_per_night: String(s.price_per_night) })));
      setToast({ text: updated.status === "pending" ? "Seasonal pricing saved — status reset to Pending" : "Seasonal pricing saved", ok: true });
      setTimeout(() => setToast(null), 3500);
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : "Save failed", ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><span className="text-sm text-primary">Loading pricing…</span></div>
      </div>
    );
  }
  if (error && !property) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-error/20 text-center">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-error mb-2" />
          <h2 className="font-title-md text-title-md font-bold">Failed to load pricing</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error}</p>
          <button onClick={() => router.push("/owner/properties")} className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-medium">Back to properties</button>
        </div>
      </div>
    );
  }

  const coverage = seasons.reduce((acc, s) => {
    const start = new Date(s.start_date), end = new Date(s.end_date);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return acc + Math.max(0, diff);
  }, 0);

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="relative w-full overflow-hidden">
              <div className="flex flex-col gap-space-sm pt-space-md pb-space-lg">
                <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                  <Link href="/owner" className="hover:text-primary transition-colors">Dashboard</Link>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <Link href="/owner/properties" className="hover:text-primary transition-colors">My Properties</Link>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-on-surface font-medium truncate max-w-[160px]">{property?.title || `Property #${id}`}</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-semibold">Seasonal Pricing</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                  <div className="flex flex-col gap-1 max-w-2xl">
                    <div className="flex items-center gap-space-xs"><span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">{property?.location || ""}</span><span className="w-1 h-1 rounded-full bg-outline-variant" /><span className="font-caption text-caption text-on-surface-variant">Listing #{property?.id}</span></div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Seasonal Pricing Management</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Set custom nightly rates for high seasons, holidays, and peak periods. Rates apply night-by-night and automatically prioritize higher holiday tiers.</p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <Link href={`/owner/properties/${id}/edit`} className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md">Edit Property</Link>
                    <button onClick={save} disabled={saving} className="flex items-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-xl shadow-sm disabled:opacity-50">
                      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="save" className="material-symbols-outlined text-[20px]" />}
                      {saving ? "Saving…" : "Save Pricing"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div><div className="flex items-center gap-space-xxs text-primary font-label-sm text-label-sm font-medium"><Icon name="price_change" className="material-symbols-outlined text-[16px]" /> Default Baseline Rate</div><div className="flex items-baseline gap-2 mt-1"><span className="font-display text-display text-primary tracking-tight font-bold">${Number(basePrice).toFixed(2)}</span><span className="font-body-md text-body-md text-on-surface-variant">USD / night</span></div></div>
                  <div className="mt-space-sm pt-space-xs bg-surface-container-low rounded-lg p-space-xs text-on-surface-variant font-caption text-caption flex items-start gap-space-xs"><Icon name="info" className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5" /><span>Standard rate applied when no seasonal dates are scheduled.</span></div>
                </div>
                <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between">
                  <div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Seasonal Coverage</span><div className="flex items-center gap-space-xs"><span className="font-headline-md text-headline-md font-bold">{coverage}</span><span className="font-caption text-caption text-on-surface-variant">nights scheduled</span></div></div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden my-space-xs"><div className="bg-primary-container h-full" style={{ width: `${Math.min(100, Math.round((coverage / 365) * 100))}%` }} /></div>
                  <div className="flex justify-between font-caption text-caption text-on-surface-variant"><span>{seasons.length} {seasons.length === 1 ? "season" : "seasons"}</span><span className="text-secondary font-semibold">{Math.round((coverage / 365) * 100)}% year</span></div>
                </div>
                <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                  <h3 className="font-title-sm text-title-sm font-bold">How pricing works</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Backend validates no overlaps. Each night picks seasonal price if date falls within a season, otherwise base price. Higher-rate holiday seasons should be separate entries (they will not overlap if validated).</p>
                  {toast && <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 text-sm border ${toast.ok ? "bg-[#ECFDF5] text-[#065F46] border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20"}`}><Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />{toast.text}</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
                <div className="xl:col-span-8 flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-title-md text-title-md font-bold">Active & Upcoming Seasonal Tiers</h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">{seasons.length} Configured</span>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low/70 text-on-surface-variant font-label-sm text-label-sm">
                            <th className="py-space-sm px-space-md font-semibold">Season Name</th>
                            <th className="py-space-sm px-space-md font-semibold">Dates</th>
                            <th className="py-space-sm px-space-md font-semibold">Duration</th>
                            <th className="py-space-sm px-space-md font-semibold">Nightly Rate</th>
                            <th className="py-space-sm px-space-md font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                          {seasons.length === 0 ? (
                            <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">No seasonal pricing configured. Add your first season to enable peak pricing.</td></tr>
                          ) : (
                            seasons.map((s, idx) => {
                              const start = new Date(s.start_date), end = new Date(s.end_date);
                              const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              const pct = ((Number(s.price_per_night) - Number(basePrice)) / Number(basePrice)) * 100;
                              return (
                                <tr key={idx} className="hover:bg-surface-container-low/40">
                                  <td className="py-space-md px-space-md"><div className="flex items-center gap-space-xs"><div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"><Icon name="ac_unit" className="material-symbols-outlined text-[18px]" /></div><span className="font-label-md font-semibold">{s.season_name}</span></div></td>
                                  <td className="py-space-md px-space-md whitespace-nowrap"><div className="flex flex-col"><span className="font-medium">{s.start_date}</span><span className="font-caption text-caption text-on-surface-variant">to {s.end_date}</span></div></td>
                                  <td className="py-space-md px-space-md"><span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-caption text-caption font-medium">{nights} nights</span></td>
                                  <td className="py-space-md px-space-md"><div className="flex flex-col"><span className="font-title-md font-bold text-primary">${Number(s.price_per_night).toFixed(2)} USD</span><span className={`font-caption text-caption font-medium ${pct > 0 ? "text-secondary" : pct < 0 ? "text-error" : "text-on-surface-variant"}`}>{pct > 0 ? `+${pct.toFixed(1)}% vs base` : pct < 0 ? `${pct.toFixed(1)}% vs base` : "same as base"}</span></div></td>
                                  <td className="py-space-md px-space-md text-right"><button onClick={() => setSeasons((prev) => prev.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40"><Icon name="delete" className="material-symbols-outlined text-[18px]" /></button></td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-space-sm bg-surface-container-low/40 flex items-center justify-between text-on-surface-variant font-caption text-caption">
                      <span>All rates in USD, exclusive of tax.</span>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-xs"><div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary"><Icon name="tune" className="material-symbols-outlined text-[20px]" /></div><div className="flex flex-col"><h3 className="font-title-md text-title-md font-bold">Add New Season</h3><span className="font-caption text-caption text-on-surface-variant">Define rate period for {property?.title || "property"}</span></div></div>
                  <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md font-semibold">Season Name *</label><input value={form.season_name} onChange={(e) => setForm({ ...form, season_name: e.target.value })} placeholder="e.g. Winter Ski Peak" className="h-11 px-space-sm bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md font-semibold">Start Date *</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full h-11 px-space-sm bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
                    <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md font-semibold">End Date *</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full h-11 px-space-sm bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between"><label className="font-label-md text-label-md font-semibold">Price per Night (USD) *</label><span className="font-caption text-caption text-secondary">Base: ${Number(basePrice).toFixed(2)}</span></div>
                    <div className="relative"><span className="absolute left-3 top-2.5 text-on-surface-variant font-semibold">$</span><input type="number" step="0.01" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: e.target.value })} placeholder="280.00" className="w-full h-11 pl-8 pr-space-sm bg-surface-container-low rounded-xl text-on-surface font-title-md font-bold focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
                  </div>
                  {formError && <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{formError}</div>}
                  <button onClick={addSeason} className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-sm flex items-center justify-center gap-1.5"><Icon name="add" className="material-symbols-outlined text-[18px]" /> Add Season to List</button>
                  <p className="font-caption text-caption text-on-surface-variant">Season added locally. Click Save Pricing to persist to backend (PATCH /properties/{id} with seasonal_prices).</p>
                  <div className="pt-space-sm flex flex-col gap-2">
                    <span className="font-caption text-caption uppercase tracking-wider font-semibold text-on-surface-variant">Faraya Seasonal Insights</span>
                    <div className="flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-low"><Icon name="ac_unit" className="material-symbols-outlined text-[16px] text-tertiary" /><span className="font-caption text-caption">Ski Chalets in Faraya typically charge <strong>$280 - $340</strong> in winter weekends.</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
