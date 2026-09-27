"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { getMyProperties, getBlockedDates, createBlockedDate, deleteBlockedDate, type PropertyResponse, type PropertyBlockedDate } from "@/services/owner";
import { getAvailability, type AvailabilityResponse } from "@/services/properties";

export function OwnerAvailabilitySection0() {
  const searchParams = useSearchParams();
  const initialProp = searchParams.get("property");
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialProp || "");
  const [blocked, setBlocked] = useState<PropertyBlockedDate[]>([]);
  const [bookedDates, setBookedDates] = useState<AvailabilityResponse["booked_dates"]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ start_date: "", end_date: "", reason: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

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
    Promise.all([
      getBlockedDates(selectedId),
      getAvailability(selectedId).catch(() => ({ blocked_dates: [], booked_dates: [] } as unknown as AvailabilityResponse)),
    ])
      .then(([blockedData, availData]) => {
        setBlocked(blockedData);
        setBookedDates(availData.booked_dates || []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load availability data"))
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

  function openDeleteModal(bid: number) {
    setPendingDeleteId(bid);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!selectedId || pendingDeleteId === null) return;
    try {
      await deleteBlockedDate(selectedId, pendingDeleteId);
      setBlocked((prev) => prev.filter((b) => b.id !== pendingDeleteId));
      setToast({ text: "Blocked period removed", ok: true });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : "Failed to delete", ok: false });
    } finally {
      setDeleteModalOpen(false);
      setPendingDeleteId(null);
    }
  }

  const today = new Date();
  const months = [0, 1].map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return d;
  });

  function isBlocked(date: Date): PropertyBlockedDate | undefined {
    const ds = date.toISOString().slice(0, 10);
    return blocked.find((b) => ds >= b.start_date && ds <= b.end_date);
  }

  type BookingStatus = "pending" | "confirmed" | null;
  function getBookingStatus(date: Date): BookingStatus {
    const ds = date.toISOString().slice(0, 10);
    const booking = bookedDates.find((b) => ds >= b.check_in && ds <= b.check_out);
    if (!booking) return null;
    const s = booking.status.toLowerCase();
    if (s === "pending") return "pending";
    if (s === "confirmed" || s === "approved") return "confirmed";
    return null;
  }

  return (
    <>
      <div className="">
        <main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}>
          <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
              <div className="flex flex-col gap-space-xxs">
                <nav className="flex items-center gap-space-xs font-caption text-caption text-[#46B1B1]/70 uppercase tracking-wider">
                  <Link href="/owner" className="hover:text-primary">Dashboard</Link>
                  <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                  <span className="text-primary font-semibold">Availability & Calendar</span>
                </nav>
                <div className="flex flex-col gap-space-xxs mt-2">
                  <div className="flex items-center gap-space-xs text-[#46B1B1] font-label-sm text-label-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-primary font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      Live Calendar
                    </span>
                    <span>•</span>
                    <span>Owner blocks take priority over bookings</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight mt-1">Availability & Calendar Management</h1>
                  <p className="font-body-md text-body-md text-[#46B1B1]/70 max-w-2xl">Manage owner-blocked periods and view booking status for your properties.</p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
              </div>
            </div>
            {toast && <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${toast.ok ? "bg-secondary-container text-on-secondary-container border border-secondary/20" : "bg-error-container text-on-error-container border border-error/20"}`}><Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />{toast.text}</div>}
            {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{error}</div>}

            <div className="flex flex-col lg:flex-row gap-space-md items-start">
              <div className="flex-1 flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-primary/5 flex flex-col gap-space-sm">
                  <label className="font-label-md text-label-md font-semibold text-[#46B1B1]">Select Property</label>
                  {loadingProps ? (
                    <div className="h-11 bg-surface-container rounded-lg animate-pulse" />
                  ) : properties.length === 0 ? (
                    <div className="text-sm text-[#46B1B1]/70">No properties found. <Link href="/owner/properties/new" className="text-primary hover:underline">Add a property first</Link></div>
                  ) : (
                    <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full h-11 px-space-sm bg-white border border-primary/10 text-[#46B1B1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/20">
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.title} · {p.location} · {p.status}</option>
                      ))}
                    </select>
                  )}
                  {selectedProperty && (
                    <div className="flex items-center gap-2 text-sm text-[#46B1B1]/70"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedProperty.status === "approved" ? "bg-emerald-50 text-emerald-700" : selectedProperty.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{selectedProperty.status}</span><span>${Number(selectedProperty.price_per_night).toFixed(0)}/night · {selectedProperty.bedrooms}BR · {selectedProperty.max_guests} guests</span></div>
                  )}
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-primary/5">
                  <h3 className="font-label-md text-label-md font-semibold mb-2 text-[#46B1B1]">Calendar Legend</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-primary">
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white border border-slate-200" /> Available</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-rose-50 border border-rose-200 border-dashed" /> Owner Blocked</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-50 border border-amber-200" /> Pending Booking</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" /> Confirmed Booking</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-primary/10 border border-primary/20" /> Selected Range (in form)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {months.map((monthDate) => {
                    const year = monthDate.getFullYear();
                    const month = monthDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const monthName = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                    return (
                      <div key={monthName} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-primary/5">
                        <h4 className="font-title-sm text-title-sm font-bold mb-3 text-[#46B1B1]">{monthName}</h4>
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
                            const bookingStatus = !isBlockedDay ? getBookingStatus(date) : null;
                            const inSelected = form.start_date && form.end_date && ds >= form.start_date && ds <= form.end_date;
                            let dayClass = "bg-white border border-slate-100 hover:bg-surface-container-low text-[#1E293B]";
                            let dayTitle = ds;
                            if (isBlockedDay) {
                              dayClass = "bg-rose-50 text-rose-700 border border-dashed border-rose-200";
                              dayTitle = blockedMatch?.reason || "Owner blocked";
                            } else if (bookingStatus === "pending") {
                              dayClass = "bg-amber-50 text-amber-700 border border-amber-200";
                              dayTitle = "Pending Booking";
                            } else if (bookingStatus === "confirmed") {
                              dayClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                              dayTitle = "Confirmed Booking";
                            }
                            if (inSelected) {
                              dayClass = "bg-primary/10 text-primary border border-primary/30 font-semibold";
                            }
                            return (
                              <div key={day} title={dayTitle} className={`h-8 flex items-center justify-center rounded-lg text-sm relative ${dayClass} ${isToday ? "ring-2 ring-primary" : ""}`}>
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

                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-title-sm text-title-sm font-bold text-[#46B1B1]">Owner Blocked Periods</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">{blocked.length} periods</span>
                  </div>
{loadingBlocked ? (
                      <div className="py-8 flex items-center justify-center"><div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                    ) : blocked.length === 0 ? (
                      <div className="text-center py-8 text-[#46B1B1]/70">
                        <Icon name="event_available" className="material-symbols-outlined text-[32px] mb-2 text-primary" />
                        <p className="font-label-md text-label-md font-medium text-[#46B1B1]">No blocked periods</p>
                        <p className="font-body-sm text-body-sm text-[#46B1B1]/70">Your calendar is fully available. Block dates for private use or maintenance.</p>
                      </div>
                    ) : (
                    <div className="flex flex-col gap-3">
                      {blocked.map((b) => {
                        const nights = Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86400000) + 1;
                        return (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-primary/10 shadow-sm hover:border-[#E11D48]/20 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#FFF1F2] border border-[#E11D48]/10 flex items-center justify-center text-[#E11D48] shrink-0">
                              <Icon name="event_busy" className="material-symbols-outlined text-[20px]" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-label-md text-[#46B1B1] font-bold">{b.start_date}</span>
                                <Icon name="arrow_forward" className="material-symbols-outlined text-[14px] text-[#46B1B1]/40" />
                                <span className="font-label-md text-[#46B1B1] font-bold">{b.end_date}</span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">{nights} nights</span>
                              </div>
                              {b.reason ? (
                                <span className="font-body-sm text-[#46B1B1] flex items-center gap-1"><Icon name="notes" className="material-symbols-outlined text-[14px] text-[#46B1B1]/60" />{b.reason}</span>
                              ) : (
                                <span className="font-caption text-[#46B1B1]/40 italic">No reason provided</span>
                              )}
                              <span className="font-caption text-[#46B1B1]/50">Blocked on {new Date(b.created_at).toLocaleDateString()} · ID #{b.id}</span>
                            </div>
                          </div>
                          <button onClick={() => openDeleteModal(b.id)} title="Unblock dates" className="p-2.5 rounded-full bg-white border border-[#E11D48]/20 text-[#E11D48] hover:bg-[#E11D48] hover:text-white hover:border-[#E11D48] shadow-sm transition-all shrink-0"><Icon name="delete" className="material-symbols-outlined text-[20px]" /></button>
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-[360px] flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-primary/5 flex flex-col gap-space-md sticky top-20">
                  <h3 className="font-title-md text-title-md font-bold text-[#46B1B1]">Block Dates for Private Use</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Select a property, choose start and end dates.</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">Start Date *</label>
                      <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-11 px-space-sm bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">End Date *</label>
                      <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="h-11 px-space-sm bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">Reason (optional)</label>
                      <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} maxLength={255} placeholder="e.g. Private family stay, maintenance, chimney cleaning" className="w-full p-3 bg-surface-container-low rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none text-primary" />
                      <span className="font-caption text-caption text-primary text-right">{form.reason.length}/255</span>
                    </div>
                    {formError && <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{formError}</div>}
                    <button onClick={handleAdd} disabled={saving || !selectedId} className="w-full h-11 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-label-md text-label-md font-semibold rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Icon name="block" className="material-symbols-outlined text-[18px] text-primary" />}
                      {saving ? "Blocking…" : "Block Selected Dates"}
                    </button>
                    <button onClick={() => setForm({ start_date: "", end_date: "", reason: "" })} className="w-full h-10 bg-surface-container hover:bg-surface-container-high text-[#46B1B1] font-label-md text-label-md rounded-xl">Clear Range Selection</button>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-md flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0"><Icon name="local_police" className="material-symbols-outlined text-[20px]" /></div>
                  <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-[#46B1B1]">Owner Calendar Policy</span><span className="font-caption text-caption text-[#46B1B1]/70">Owner-blocked dates are immediate and do not require Admin approval.</span></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {deleteModalOpen && (
        <Modal title="Remove Blocked Date?" onClose={() => { setDeleteModalOpen(false); setPendingDeleteId(null); }}>
          <div className="space-y-5">
            <p className="font-body-md text-body-md text-on-surface-variant">This will make the dates available again for bookings.</p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-[#46B1B1] font-label-md text-label-md transition-colors" onClick={() => { setDeleteModalOpen(false); setPendingDeleteId(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-label-md text-label-md shadow-sm transition-colors" onClick={confirmDelete}>Remove Block</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
