"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";
import { amenitySchema } from "@/lib/validations/admin";

type Amenity = { id: number; name: string; description: string | null; category?: string | null; is_active?: boolean; created_at?: string };

export function AmenitiesManagementSection0() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "Heating & Comfort", is_active: true });
  const [busy, setBusy] = useState(false);
  const [confirmAmenity, setConfirmAmenity] = useState<Amenity | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/admin/amenities");
      setAmenities(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = amenities.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [a.name, a.description || ""].join(" ").toLowerCase().includes(q);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = amenitySchema.safeParse({ name: form.name, description: form.description, category: form.category, is_active: form.is_active });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const key = String(iss.path[0] || "form");
        if (!errs[key]) errs[key] = iss.message;
      });
      setFieldErrors(errs);
      setAlertMsg(Object.values(errs).join(" "));
      return;
    }
    setFieldErrors({});
    setBusy(true);
    try {
      if (editing) {
        await apiFetch(`/admin/amenities/${editing.id}`, { method: "PATCH", body: JSON.stringify({ name: form.name.trim(), description: form.description?.trim() || null, category: form.category, is_active: form.is_active }) });
      } else {
        await apiFetch("/admin/amenities", { method: "POST", body: JSON.stringify({ name: form.name.trim(), description: form.description?.trim() || null, category: form.category }) });
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", description: "", category: "Heating & Comfort", is_active: true });
      setFieldErrors({});
      await load();
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Save failed. Please check your inputs and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmToggle() {
    if (!confirmAmenity) return;
    const a = confirmAmenity;
    setBusy(true);
    try {
      if (a.is_active === false) {
        await apiFetch(`/admin/amenities/${a.id}`, { method: "PATCH", body: JSON.stringify({ is_active: true }) });
      } else {
        await apiFetch(`/admin/amenities/${a.id}`, { method: "DELETE" });
      }
      setConfirmAmenity(null);
      await load();
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs font-caption text-caption uppercase tracking-wider text-outline mb-space-xxs">
                  <span>Administration</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-semibold">Amenities Management</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Master Amenities Directory</h1>
                <p className="font-body-md text-body-md text-[#46B1B1]">Configure reusable platform amenities available to property owners across Lebanon.</p>
              </div>
              <div className="flex items-center gap-space-sm self-start md:self-auto">
                <button onClick={() => { setEditing(null); setForm({ name: "", description: "", category: "Heating & Comfort", is_active: true }); setShowModal(true); }} className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-primary text-white rounded-lg font-label-md text-label-md shadow-sm hover:opacity-95">
                  <Icon name="add_circle" className="material-symbols-outlined text-[18px]" />
                  <span>+ Add New Amenity</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs flex-1 max-w-md bg-surface-container-low px-space-sm py-space-xs rounded-lg">
                  <Icon name="search" className="material-symbols-outlined text-outline text-[20px]" />
                  <input className="bg-transparent text-[#46B1B1] placeholder:text-outline w-full focus:outline-none" placeholder="Search amenities..." type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-[#46B1B1]">Loading…</div>
                ) : error ? (
                  <div className="p-8 text-center text-error">{error}</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-[#46B1B1]">No amenities found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider">
                        <th className="py-space-sm px-space-md">Amenity Name</th>
                        <th className="py-space-sm px-space-md">Description</th>
                        <th className="py-space-sm px-space-md">Status</th>
                        <th className="py-space-sm px-space-md text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-0">
                      {filtered.map((a) => (
                        <tr key={a.id} className="hover:bg-surface-container-low">
                          <td className="py-space-sm px-space-md font-semibold text-[#46B1B1]">
                            <div className="flex items-center gap-space-xs">
                              <Icon name="pool" className="material-symbols-outlined text-primary text-[20px]" />
                              <span className="text-[#46B1B1]">{a.name}</span>
                            </div>
                          </td>
                          <td className="py-space-sm px-space-md max-w-xs text-[#46B1B1] line-clamp-2">{a.description || "—"}</td>
                          <td className="py-space-sm px-space-md">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${a.is_active === false ? "bg-surface-container text-[#46B1B1]" : "bg-secondary-container text-on-secondary-container"}`}>
                              {a.is_active === false ? "Inactive" : "Active"}
                            </span>
                          </td>
                          <td className="py-space-sm px-space-md text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditing(a);
                                  // backend uses category enum, keep existing or default to valid
                                  const validCats = ["Heating & Comfort", "Wellness & Leisure", "Atmosphere & Views", "Dining & Outdoor", "Coastal Stays", "Other"];
                                  const cat = a.category && validCats.includes(a.category as string) ? (a.category as string) : "Other";
                                  setForm({ name: a.name, description: a.description || "", category: cat, is_active: a.is_active !== false });
                                  setShowModal(true);
                                }}
                                className="p-1 text-[#46B1B1] hover:text-primary"
                              >
                                <Icon name="edit" className="material-symbols-outlined text-[18px]" />
                              </button>
                              <button onClick={() => setConfirmAmenity(a)} className="p-1 text-[#46B1B1] hover:text-error">
                                <Icon name={a.is_active === false ? "toggle_off" : "toggle_on"} className="material-symbols-outlined text-[18px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 bg-gradient-to-r from-[#46B1B1] to-[#3A9E9E] flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-[18px] tracking-tight text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-white text-[#46B1B1] grid place-items-center text-sm font-bold shadow-sm">+</span>
                  {editing ? "Edit Amenity" : "Add Amenity"}
                </h2>
                <p className="text-[13px] text-white/80 mt-1">Create a reusable amenity for property listings</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0" aria-label="Close">
                <Icon name="close" className="material-symbols-outlined text-[20px]" />
              </button>
            </div>
            <form noValidate onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#46B1B1]">Amenity Name *</label>
                <input
                  className={`h-11 px-3.5 rounded-xl border bg-white text-[#46B1B1] placeholder:text-[#46B1B1]/60 focus:outline-none focus:ring-2 transition-all ${fieldErrors.name ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-200 focus:ring-[#0f3d3e]/20 focus:border-[#0f3d3e]"}`}
                  placeholder="Swimming Pool"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#46B1B1]">Category *</label>
                <div className="relative">
                  <select
                    className={`h-11 w-full px-3.5 pr-10 rounded-xl border bg-white text-[#46B1B1] focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${fieldErrors.category ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-200 focus:ring-[#0f3d3e]/20 focus:border-[#0f3d3e]"}`}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Heating & Comfort">Heating & Comfort</option>
                    <option value="Wellness & Leisure">Wellness & Leisure</option>
                    <option value="Atmosphere & Views">Atmosphere & Views</option>
                    <option value="Dining & Outdoor">Dining & Outdoor</option>
                    <option value="Coastal Stays">Coastal Stays</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#46B1B1]/60">▼</span>
                </div>
                {fieldErrors.category && <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#46B1B1]">Description</label>
                <textarea
                  className={`p-3.5 rounded-xl border bg-white text-[#46B1B1] placeholder:text-[#46B1B1]/60 focus:outline-none focus:ring-2 transition-all resize-none ${fieldErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-200 focus:ring-[#0f3d3e]/20 focus:border-[#0f3d3e]"}`}
                  placeholder="Private swimming pool available for guests. Suitable for family and group stays."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#46B1B1]">Status</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="amenity_active" checked={form.is_active} onChange={() => setForm({ ...form, is_active: true })} className="w-4 h-4 accent-[#0f3d3e]" />
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#46B1B1]">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="amenity_active" checked={!form.is_active} onChange={() => setForm({ ...form, is_active: false })} className="w-4 h-4 accent-slate-400" />
                    <span className="flex items-center gap-1.5 text-sm text-[#46B1B1]/70">
                      <span className="w-2 h-2 rounded-full border border-slate-400"></span> Inactive
                    </span>
                  </label>
                </div>
                <p className="flex items-start gap-1.5 text-xs text-[#46B1B1]/70 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <span className="text-[#46B1B1] mt-0.5">ⓘ</span>
                  <span>Active amenities are available for owners to assign to their properties.</span>
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[#46B1B1] hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm disabled:opacity-50 transition-colors">
                  {busy ? "Saving…" : editing ? "Update Amenity" : "Add Amenity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmAmenity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4" onClick={() => setConfirmAmenity(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmAmenity.is_active === false ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                <Icon name={confirmAmenity.is_active === false ? "check_circle" : "warning"} className="material-symbols-outlined text-[36px]" />
              </div>
              <h3 className="font-display font-bold text-[19px] tracking-tight text-[#46B1B1]">{confirmAmenity.is_active === false ? "Activate Amenity?" : "Deactivate Amenity?"}</h3>
              <p className="text-sm text-[#46B1B1]/70 mt-2 leading-relaxed">
                Are you sure you want to <span className="font-semibold text-[#46B1B1]">{confirmAmenity.is_active === false ? "activate" : "deactivate"}</span> <span className="font-semibold text-[#46B1B1]">"{confirmAmenity.name}"</span>?
                <br />
                {confirmAmenity.is_active === false ? "It will become available for owners to assign to their properties." : "It will be hidden from new listings. Existing assignments remain."}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
              <button onClick={() => setConfirmAmenity(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[#46B1B1] hover:bg-slate-50 font-medium min-w-[110px] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                disabled={busy}
                className={`px-6 py-2.5 rounded-xl text-white font-semibold shadow-sm min-w-[130px] transition-colors disabled:opacity-50 ${confirmAmenity.is_active === false ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}
              >
                {busy ? "Please wait…" : confirmAmenity.is_active === false ? "Yes, Activate" : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMsg && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4" onClick={() => setAlertMsg(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <Icon name="error" className="material-symbols-outlined text-[28px]" />
              </div>
              <h3 className="font-display font-bold text-[17px] text-[#46B1B1]">Heads up</h3>
              <p className="text-sm text-[#46B1B1] mt-2 leading-relaxed">{alertMsg}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button onClick={() => setAlertMsg(null)} className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold min-w-[120px]">OK, got it</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
