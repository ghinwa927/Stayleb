"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getMyProperties, getBlockedDates, createBlockedDate, deleteBlockedDate, type PropertyResponse, type PropertyBlockedDate } from "@/services/owner";

export function OwnerAvailabilitySection0() {
  const searchParams = useSearchParams();
  const initialProp = searchParams.get("property");
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialProp || "");
  const [blocked, setBlocked] = useState<PropertyBlockedDate[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ start_date: "", end_date: "", reason: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingProps(true);
    getMyProperties()
      .then((list) => {
        setProperties(list);
        if (!selectedId && list.length) setSelectedId(String(list[0].id));
        else if (initialProp && list.some((p) => String(p.id) === initialProp)) setSelectedId(initialProp);
      })
      .catch(() => setError("Failed to load properties"))
      .finally(() => setLoadingProps(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingBlocked(true);
    setError(null);
    getBlockedDates(selectedId)
      .then(setBlocked)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load blocked dates"))
      .finally(() => setLoadingBlocked(false));
  }, [selectedId]);

  const selectedProperty = useMemo(() => properties.find((p) => String(p.id) === selectedId), [properties, selectedId]);

  async function handleAdd() {
    setFormError(null);
    if (!selectedId) { setFormError("Select a property"); return; }
    if (!form.start_date || !form.end_date) { setFormError("Start and end dates required"); return; }
    if (new Date(form.end_date) < new Date(form.start_date)) { setFormError("End must be on or after start"); return; }
    if (form.reason && form.reason.length > 255) { setFormError("Reason must be ≤255 characters"); return; }
    setSaving(true);
    try {
      const created = await createBlockedDate(selectedId, { start_date: form.start_date, end_date: form.end_date, reason: form.reason || null });
      setBlocked((prev) => [...prev, created].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()));
      setForm({ start_date: "", end_date: "", reason: "" });
      setToast({ text: "Blocked period added", ok: true });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to add blocked dates");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(bid: number) {
    if (!selectedId) return;
    if (!confirm("Unblock this period? This will make the dates available again.")) return;
    try {
      await deleteBlockedDate(selectedId, bid);
      setBlocked((prev) => prev.filter((b) => b.id !== bid));
      setToast({ text: "Blocked period removed", ok: true });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : "Failed to delete", ok: false });
    }
  }

  // Calendar helpers - show current month and next month
  const today = new Date();
  const months = [0, 1].map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return d;
  });

  function isBlocked(date: Date): PropertyBlockedDate | undefined {
    const ds = date.toISOString().slice(0, 10);
    return blocked.find((b) => ds >= b.start_date && ds <= b.end_date);
  }

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-white min-h-screen">
          <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
            <div className="flex flex-col gap-space-xxs">
              <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                <Link href="/owner" className="hover:text-primary">Dashboard</Link>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                <span className="text-primary font-semibold">Availability & Calendar</span>
              </nav>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-[#157375] tracking-tight">Availability & Calendar Management</h1>
                  <p className="font-body-md text-body-md text-[#157375]/70 max-w-2xl mt-1">Manage owner-blocked periods for your properties.</p>
                </div>
              </div>
              {toast && <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${toast.ok ? "bg-[#ECFDF5] text-[#065F46] border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20"}`}><Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />{toast.text}</div>}
              {error && <div className="p-3 rounded-xl bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{error}</div>}
            </div>

            <div className="flex flex-col lg:flex-row gap-space-md items-start">
              <div className="flex-1 flex flex-col gap-space-md">
                {/* Property selector */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-[#157375]/5 flex flex-col gap-space-sm">
                  <label className="font-label-md text-label-md font-semibold text-[#157375]">Select Property</label>
                  {loadingProps ? (
                    <div className="h-11 bg-surface-container rounded-lg animate-pulse" />
                  ) : properties.length === 0 ? (
                    <div className="text-sm text-on-surface-variant">No properties found. <Link href="/owner/properties/new" className="text-primary hover:underline">Add a property first</Link></div>
                  ) : (
                    <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full h-11 px-space-sm bg-white border border-[#157375]/10 text-[#157375] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-[#157375]/20">
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.title} · {p.location} · {p.status}</option>
                      ))}
                    </select>
                  )}
                  {selectedProperty && (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedProperty.status === "approved" ? "bg-[#ECFDF5] text-[#059669]" : selectedProperty.status === "pending" ? "bg-[#FFFBEB] text-[#D97706]" : "bg-[#FFF1F2] text-[#E11D48]"}`}>{selectedProperty.status}</span><span>${Number(selectedProperty.price_per_night).toFixed(0)}/night · {selectedProperty.bedrooms}BR · {selectedProperty.max_guests} guests</span></div>
                  )}
                </div>

                {/* Legend */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-[#157375]/5">
                  <h3 className="font-label-md text-label-md font-semibold mb-2 text-[#157375]">Calendar Legend</h3>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white border border-slate-200" /> Available</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-[#FFF1F2] border border-[#E11D48]/30 border-dashed" /> Owner Blocked</span>
                    <span className="inline-flex items-center gap-1.5 opacity-50"><span className="w-4 h-4 rounded bg-[#FFFBEB] border border-[#D97706]/30" /> Pending Booking (future)</span>
                    <span className="inline-flex items-center gap-1.5 opacity-50"><span className="w-4 h-4 rounded bg-[#ECFDF5] border border-[#059669]/30" /> Confirmed Booking (future)</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-secondary-container border border-secondary" /> Selected Range (in form)</span>
                  </div>
                </div>

                {/* Calendar grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {months.map((monthDate) => {
                    const year = monthDate.getFullYear();
                    const month = monthDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay(); // 0 Sun
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const monthName = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                    return (
                      <div key={monthName} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-[#157375]/5">
                        <h4 className="font-title-sm text-title-sm font-bold mb-3">{monthName}</h4>
                        <div className="grid grid-cols-7 gap-1 text-center font-caption text-caption text-on-surface-variant mb-1">
                          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <span key={d} className="py-1">{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {Array.from({ length: firstDay }).map((_, i) => <span key={`empty-${i}`} />)}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(year, month, day);
                            const ds = date.toISOString().slice(0, 10);
                            const isToday = ds === new Date().toISOString().slice(0, 10);
                            const blockedMatch = isBlocked(date);
                            const isBlockedDay = !!blockedMatch;
                            // Check if in form selected range (preview)
                            const inSelected = form.start_date && form.end_date && ds >= form.start_date && ds <= form.end_date;
                            return (
                              <div key={day} title={isBlockedDay ? blockedMatch?.reason || "Owner blocked" : ds} className={`h-8 flex items-center justify-center rounded-lg text-sm relative ${isBlockedDay ? "bg-[#FFF1F2] text-[#E11D48] border border-dashed border-[#E11D48]/30" : inSelected ? "bg-secondary-container text-on-secondary-container border border-secondary font-semibold" : "bg-white border border-slate-100 hover:bg-surface-container-low"} ${isToday ? "ring-1 ring-primary" : ""}`}>
                                {day}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 text-center font-caption text-caption text-on-surface-variant">{blocked.filter((b) => { const m = new Date(b.start_date); return m.getFullYear() === year && m.getMonth() === month; }).length} blocked periods starting this month</div>
                      </div>
                    );
                  })}
                </div>

                {/* Blocked periods list */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-[#157375]/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-title-sm text-title-sm font-bold text-[#157375]">Owner Blocked Periods</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">{blocked.length} periods</span>
                  </div>
                  {loadingBlocked ? (
                    <div className="py-8 flex items-center justify-center"><div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                  ) : blocked.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant">
                      <Icon name="event_available" className="material-symbols-outlined text-[32px] mb-2" />
                      <p className="font-label-md text-label-md font-medium">No blocked periods</p>
                      <p className="font-body-sm text-body-sm">Your calendar is fully available. Block dates for private use or maintenance.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {blocked.map((b) => {
                        const nights = Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86400000) + 1;
                        return (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#157375]/10 shadow-sm hover:border-[#E11D48]/20 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#FFF1F2] border border-[#E11D48]/10 flex items-center justify-center text-[#E11D48] shrink-0">
                              <Icon name="event_busy" className="material-symbols-outlined text-[20px]" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-label-md text-[#157375] font-bold">{b.start_date}</span>
                                <Icon name="arrow_forward" className="material-symbols-outlined text-[14px] text-[#157375]/40" />
                                <span className="font-label-md text-[#157375] font-bold">{b.end_date}</span>
                                <span className="px-2 py-0.5 rounded-full bg-[#157375] text-white font-caption text-caption font-semibold">{nights} nights</span>
                              </div>
                              {b.reason ? (
                                <span className="font-body-sm text-[#157375] flex items-center gap-1"><Icon name="notes" className="material-symbols-outlined text-[14px] text-[#157375]/60" />{b.reason}</span>
                              ) : (
                                <span className="font-caption text-[#157375]/40 italic">No reason provided</span>
                              )}
                              <span className="font-caption text-[#157375]/50">Blocked on {new Date(b.created_at).toLocaleDateString()} · ID #{b.id}</span>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(b.id)} title="Unblock dates" className="p-2.5 rounded-full bg-white border border-[#E11D48]/20 text-[#E11D48] hover:bg-[#E11D48] hover:text-white hover:border-[#E11D48] shadow-sm transition-all shrink-0"><Icon name="delete" className="material-symbols-outlined text-[20px]" /></button>
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-[360px] flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-[#157375]/5 flex flex-col gap-space-md sticky top-20">
                  <h3 className="font-title-md text-title-md font-bold text-[#157375]">Block Dates for Private Use</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Select a property, choose start and end dates.</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-[#157375]">Start Date *</label>
                      <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-11 px-space-sm bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-[#157375]">End Date *</label>
                      <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="h-11 px-space-sm bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-[#157375]">Reason (optional)</label>
                      <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} maxLength={255} placeholder="e.g. Private family stay, maintenance, chimney cleaning" className="w-full p-3 bg-surface-container-low rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" />
                      <span className="font-caption text-caption text-on-surface-variant text-right">{form.reason.length}/255</span>
                    </div>
                    {formError && <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{formError}</div>}
                    <button onClick={handleAdd} disabled={saving || !selectedId} className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="block" className="material-symbols-outlined text-[18px]" />}
                      {saving ? "Blocking…" : "Block Selected Dates"}
                    </button>
                    <button onClick={() => setForm({ start_date: "", end_date: "", reason: "" })} className="w-full h-10 bg-surface-container hover:bg-surface-container-high text-[#157375] font-label-md text-label-md rounded-xl">Clear Range Selection</button>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-2 text-on-surface-variant">
                    <Icon name="info" className="material-symbols-outlined text-primary text-[18px] mt-0.5" />
                    <p className="font-caption text-caption leading-relaxed">Blocked dates prevent new bookings for those nights. Existing blocked periods cannot overlap (inclusive check). Bookings validation is separate and will be connected later.</p>
                  </div>
                </div>

                <div className="bg-surface-container-low/70 rounded-xl p-space-md flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0"><Icon name="local_police" className="material-symbols-outlined text-[20px]" /></div>
                  <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold">Owner Calendar Policy</span><span className="font-caption text-caption text-on-surface-variant">Owner-blocked dates are immediate and do not require Admin approval.</span></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
