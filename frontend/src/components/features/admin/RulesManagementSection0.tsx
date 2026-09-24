"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";
import { ruleSchema } from "@/lib/validations/admin";

type Rule = { id: number; name: string; description: string | null; category: string | null; is_active?: boolean };

export function RulesManagementSection0() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "Nighttime Serenity", is_active: true });
  const [busy, setBusy] = useState(false);
  const [confirmRule, setConfirmRule] = useState<Rule | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/admin/rules");
      setRules(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = rules.filter((r) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [r.name, r.description || "", r.category || ""].join(" ").toLowerCase().includes(q);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ruleSchema.safeParse({ name: form.name, description: form.description, category: form.category, is_active: form.is_active });
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
      const payload: Record<string, unknown> = { name: form.name.trim(), description: form.description?.trim() || null, category: form.category };
      if (editing) (payload as Record<string, unknown>).is_active = form.is_active;
      if (editing) {
        await apiFetch(`/admin/rules/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/admin/rules", { method: "POST", body: JSON.stringify({ name: form.name.trim(), description: form.description?.trim() || null, category: form.category }) });
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", description: "", category: "Nighttime Serenity", is_active: true });
      setFieldErrors({});
      await load();
    } catch (e) {
      setAlertMsg(e instanceof Error ? e.message : "Save failed. Please check your inputs and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmToggle() {
    if (!confirmRule) return;
    const r = confirmRule;
    setBusy(true);
    try {
      if (r.is_active === false) {
        await apiFetch(`/admin/rules/${r.id}`, { method: "PATCH", body: JSON.stringify({ is_active: true }) });
      } else {
        await apiFetch(`/admin/rules/${r.id}`, { method: "DELETE" });
      }
      setConfirmRule(null);
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
              <div className="flex flex-col gap-space-xxs">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-[#46B1B1]">
                  <span>Administration</span>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-semibold">Rules Management</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Master Property Rules Directory</h1>
                <p className="font-body-md text-body-md text-[#46B1B1] max-w-3xl">Define and manage reusable conduct policies and rental constraints enforced across StayLeb listings.</p>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                <button onClick={() => { setEditing(null); setForm({ name: "", description: "", category: "Nighttime Serenity", is_active: true }); setShowModal(true); }} className="flex items-center gap-space-xs px-space-md py-2.5 bg-primary text-white rounded-xl font-label-md text-label-md shadow-sm hover:opacity-95">
                  <Icon name="add_circle" className="material-symbols-outlined text-[18px]" />
                  <span>+ Create Master Rule</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs flex-1 max-w-md bg-surface-container-low px-space-sm py-2 rounded-lg">
                  <Icon name="search" className="material-symbols-outlined text-outline text-[18px]" />
                  <input className="bg-transparent w-full focus:outline-none" placeholder="Search rules..." type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-[#46B1B1]">Loading…</div>
                ) : error ? (
                  <div className="p-8 text-center text-error">{error}</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-[#46B1B1]">No rules found.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-low text-[#46B1B1] font-caption text-caption uppercase tracking-wider">
                        <th className="py-space-sm px-space-md">Rule Policy Name</th>
                        <th className="py-space-sm px-space-md">Category</th>
                        <th className="py-space-sm px-space-md">Description</th>
                        <th className="py-space-sm px-space-md">Status</th>
                        <th className="py-space-sm px-space-md text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.id} className="hover:bg-teal-50/50">
                          <td className="py-space-sm px-space-md font-semibold text-[#46B1B1]">{r.name}</td>
                          <td className="py-space-sm px-space-md">
                            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-[#46B1B1] text-xs font-semibold border border-[#157375]/20">{r.category || "General"}</span>
                          </td>
                          <td className="py-space-sm px-space-md max-w-xs text-[#46B1B1]/80 line-clamp-2">{r.description || "—"}</td>
                          <td className="py-space-sm px-space-md">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${r.is_active === false ? "bg-slate-100 text-[#46B1B1]/70 border border-slate-200" : "bg-primary/10 text-[#46B1B1] border border-[#157375]/20"}`}>
                              {r.is_active === false ? "Inactive" : "Active"}
                            </span>
                          </td>
                          <td className="py-space-sm px-space-md text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditing(r);
                                  const validCats = ["Nighttime Serenity", "Animal & Pet stays", "Clean Air & Safety", "Noise & Community", "Fire Safety & Capacity", "Media Licensing", "Others"];
                                  const cat = r.category && validCats.includes(r.category) ? r.category : "Others";
                                  setForm({ name: r.name, description: r.description || "", category: cat, is_active: r.is_active !== false });
                                  setShowModal(true);
                                }}
                                className="p-2 rounded-lg bg-primary/10 text-[#46B1B1] hover:bg-primary hover:text-white transition-colors"
                                title="Edit rule"
                              >
                                <Icon name="edit" className="material-symbols-outlined text-[18px]" />
                              </button>
                              <button onClick={() => setConfirmRule(r)} className={`p-2 rounded-lg transition-colors ${r.is_active === false ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"}`} title={r.is_active === false ? "Activate" : "Deactivate"}>
                                <Icon name={r.is_active === false ? "toggle_off" : "toggle_on"} className="material-symbols-outlined text-[18px]" />
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
                  {editing ? "Edit Master Rule" : "Create Master Rule"}
                </h2>
                <p className="text-[13px] text-white/80 mt-1">Define a reusable property rule for StayLeb</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0" aria-label="Close">
                <Icon name="close" className="material-symbols-outlined text-[20px]" />
              </button>
            </div>
            <form noValidate onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#46B1B1]">Rule Name *</label>
                <input
                  className={`h-11 px-3.5 rounded-xl border bg-white text-[#46B1B1] placeholder:text-[#46B1B1]/60 focus:outline-none focus:ring-2 transition-all ${fieldErrors.name ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-200 focus:ring-[#0f3d3e]/20 focus:border-[#0f3d3e]"}`}
                  placeholder="Quiet Hours"
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
                    <option value="Nighttime Serenity">Nighttime Serenity</option>
                    <option value="Animal & Pet stays">Animal & Pet stays</option>
                    <option value="Clean Air & Safety">Clean Air & Safety</option>
                    <option value="Noise & Community">Noise & Community</option>
                    <option value="Fire Safety & Capacity">Fire Safety & Capacity</option>
                    <option value="Media Licensing">Media Licensing</option>
                    <option value="Others">Others</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#46B1B1]/60">▼</span>
                </div>
                {fieldErrors.category && <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#46B1B1]">Description</label>
                <textarea
                  className={`p-3.5 rounded-xl border bg-white text-[#46B1B1] placeholder:text-[#46B1B1]/60 focus:outline-none focus:ring-2 transition-all resize-none ${fieldErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30" : "border-slate-200 focus:ring-[#0f3d3e]/20 focus:border-[#0f3d3e]"}`}
                  placeholder="Guests should keep noise levels low during designated quiet hours to respect neighbors."
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
                    <input type="radio" name="is_active" checked={form.is_active} onChange={() => setForm({ ...form, is_active: true })} className="w-4 h-4 accent-[#0f3d3e]" />
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#46B1B1]">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" checked={!form.is_active} onChange={() => setForm({ ...form, is_active: false })} className="w-4 h-4 accent-slate-400" />
                    <span className="flex items-center gap-1.5 text-sm text-[#46B1B1]/70">
                      <span className="w-2 h-2 rounded-full border border-slate-400"></span> Inactive
                    </span>
                  </label>
                </div>
                <p className="flex items-start gap-1.5 text-xs text-[#46B1B1]/70 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <span className="text-[#46B1B1] mt-0.5">ⓘ</span>
                  <span>Active rules are available for owners to assign when creating or editing their properties.</span>
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[#46B1B1] hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm disabled:opacity-50 transition-colors">
                  {busy ? "Saving…" : editing ? "Update Rule" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmRule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4" onClick={() => setConfirmRule(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmRule.is_active === false ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                <Icon name={confirmRule.is_active === false ? "check_circle" : "warning"} className="material-symbols-outlined text-[36px]" />
              </div>
              <h3 className="font-display font-bold text-[19px] tracking-tight text-[#46B1B1]">{confirmRule.is_active === false ? "Activate Rule?" : "Deactivate Rule?"}</h3>
              <p className="text-sm text-[#46B1B1]/70 mt-2 leading-relaxed">
                Are you sure you want to <span className="font-semibold text-[#46B1B1]">{confirmRule.is_active === false ? "activate" : "deactivate"}</span> <span className="font-semibold text-[#46B1B1]">"{confirmRule.name}"</span>?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
              <button onClick={() => setConfirmRule(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[#46B1B1] hover:bg-slate-50 font-medium min-w-[110px]">Cancel</button>
              <button onClick={confirmToggle} disabled={busy} className={`px-6 py-2.5 rounded-xl text-white font-semibold shadow-sm min-w-[130px] ${confirmRule.is_active === false ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"} disabled:opacity-50`}>
                {busy ? "Please wait…" : confirmRule.is_active === false ? "Yes, Activate" : "Yes, Deactivate"}
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
