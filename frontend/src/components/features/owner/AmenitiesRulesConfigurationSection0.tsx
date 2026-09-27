"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, updateProperty, getAmenities, getRules, type Amenity, type Rule } from "@/services/owner";

export function AmenitiesRulesConfigurationSection0() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [ruleStates, setRuleStates] = useState<Record<number, { allowed: boolean; value: string }>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getOwnerProperty(id), getAmenities().catch(() => [] as Amenity[]), getRules().catch(() => [] as Rule[])])
      .then(([prop, ams, rs]) => {
        setProperty(prop);
        setAmenities(ams);
        setRules(rs);
        setSelected(new Set(prop.amenities.map((a: any) => a.id)));
        const init: Record<number, { allowed: boolean; value: string }> = {};
        rs.forEach((r) => {
          const ex = prop.property_rules.find((pr: any) => pr.rule_id === r.id);
          init[r.id] = { allowed: ex ? ex.allowed : true, value: ex?.value || "" };
        });
        setRuleStates(init);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
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
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(aid)) n.delete(aid);
      else n.add(aid);
      return n;
    });
  }

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    try {
      const payload: any = {
        amenity_ids: Array.from(selected),
        rules: Object.entries(ruleStates).map(([rid, v]) => ({ rule_id: Number(rid), allowed: v.allowed, value: v.value?.trim() || null })),
      };
      const updated = await updateProperty(id, payload);
      setToast({ text: updated.status === "pending" ? "Amenities & Rules saved — status reset to Pending" : "Saved successfully", ok: true });
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
        <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><span className="text-sm text-primary">Loading amenities & rules…</span></div>
      </div>
    );
  }
  if (error && !property) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-error/20 text-center">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-error mb-2" />
          <h2 className="font-title-md text-title-md font-bold">Failed to load</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error}</p>
          <button onClick={() => router.push("/owner/properties")} className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-medium">Back to properties</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
            <div className="flex flex-col gap-space-xxs">
              <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                <Link href="/owner" className="hover:text-primary">Dashboard</Link>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <Link href="/owner/properties" className="hover:text-primary">My Properties</Link>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <span className="text-on-surface font-semibold truncate max-w-[160px]">{property?.title || `Property #${id}`}</span>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <span className="text-primary font-bold">Amenities & Rules</span>
              </nav>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Amenities & Rules Configuration</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Configure amenities and house rules for your property. Master records belong to Admin; Owners only select/configure.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm disabled:opacity-50">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="save" className="material-symbols-outlined text-[18px]" />}
                  {saving ? "Saving…" : "Save Amenities & Rules"}
                </button>
              </div>
              {toast && <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${toast.ok ? "bg-[#ECFDF5] text-[#065F46] border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20"}`}><Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />{toast.text}</div>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-title-md text-title-md font-bold">Master Amenities</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">{selected.size} Selected</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Select amenities that apply to your property. Retrieved from <code className="px-1 py-0.5 rounded bg-surface-container text-xs">GET /amenities</code>.</p>
                {Object.entries(groupedAmenities).length === 0 ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No amenities available.</p>
                ) : (
                  Object.entries(groupedAmenities).map(([cat, list]) => (
                    <div key={cat} className="space-y-2">
                      <h4 className="font-caption text-caption font-semibold text-primary uppercase tracking-wider">{cat}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                        {list.map((a) => (
                          <label key={a.id} className={`flex items-center gap-space-xs p-space-sm rounded-xl cursor-pointer border ${selected.has(a.id) ? "bg-[#ECFDF5] border-[#059669]/20" : "bg-surface-container-low/70 border-transparent hover:bg-surface-container-high"}`}>
                            <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleAmenity(a.id)} className="w-5 h-5 rounded accent-primary" />
                            <span className="font-label-md text-label-md text-on-surface truncate" title={a.description || a.name}>{a.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-title-md text-title-md font-bold">Master Property Rules</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">{rules.length} Rules</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Configure Allowed / Not Allowed and optional value (e.g., “only small pets”). Retrieved from <code className="px-1 py-0.5 rounded bg-surface-container text-xs">GET /rules</code>.</p>
                {Object.entries(groupedRules).map(([cat, list]) => (
                  <div key={cat} className="space-y-2">
                    <h4 className="font-caption text-caption font-semibold text-primary uppercase tracking-wider">{cat}</h4>
                    <div className="flex flex-col gap-2">
                      {list.map((r) => {
                        const st = ruleStates[r.id];
                        if (!st) return null;
                        return (
                          <div key={r.id} className="flex flex-col gap-2 p-space-sm bg-surface-container-low/50 rounded-xl">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold">{r.name}</span>{r.description && <span className="font-caption text-caption text-on-surface-variant">{r.description}</span>}</div>
                              <div className="inline-flex bg-surface-container-lowest p-1 rounded-lg shadow-sm shrink-0">
                                <button type="button" onClick={() => setRuleStates((p) => ({ ...p, [r.id]: { ...p[r.id], allowed: true } }))} className={`px-3 py-1 rounded-md font-label-sm text-label-sm ${st.allowed ? "bg-[#ECFDF5] text-[#059669] font-bold" : "text-on-surface-variant"}`}>Allowed</button>
                                <button type="button" onClick={() => setRuleStates((p) => ({ ...p, [r.id]: { ...p[r.id], allowed: false } }))} className={`px-3 py-1 rounded-md font-label-sm text-label-sm ${!st.allowed ? "bg-[#FFF1F2] text-[#E11D48] font-bold" : "text-on-surface-variant"}`}>Not Allowed</button>
                              </div>
                            </div>
                            <input value={st.value} onChange={(e) => setRuleStates((p) => ({ ...p, [r.id]: { ...p[r.id], value: e.target.value } }))} placeholder="value (optional, max 100 chars)" maxLength={100} className="w-full h-9 px-3 bg-surface-container-lowest rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant">Changes directly affect search filters after Admin re-approval. Master records are read-only for Owners.</span>
              <div className="flex items-center gap-2">
                <button onClick={() => router.push("/owner/properties")} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
