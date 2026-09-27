"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, LocalForm } from "@/components/ui/Interactions";
import { getMyProfile, updateMyProfile, type UserProfile, type UpdateProfilePayload } from "@/services/user";
import { changePasswordRequest } from "@/services/api";
import Swal from "sweetalert2";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch { return dateStr; }
}

function phoneDisplay(phone: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return phone;
}

export function ClientProfileAccountSection0() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProfilePayload>({});
  const [initialData, setInitialData] = useState<UpdateProfilePayload>({});
  const [passOpen, setPassOpen] = useState(false);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passErrors, setPassErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile();
      setProfile(data);
      const initial: UpdateProfilePayload = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone ?? "",
      };
      setFormData(initial);
      setInitialData(initial);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const hasChanges = () => {
    return (
      formData.full_name !== initialData.full_name ||
      formData.email !== initialData.email ||
      formData.phone !== initialData.phone
    );
  };

  const handleChange = (field: keyof UpdateProfilePayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCancel = () => {
    setFormData({ ...initialData });
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges() || saving) return;

    setSaving(true);
    setError(null);

    try {
      // Only send fields that changed
      const payload: UpdateProfilePayload = {};
      if (formData.full_name !== initialData.full_name) payload.full_name = formData.full_name;
      if (formData.email !== initialData.email) payload.email = formData.email;
      if (formData.phone !== initialData.phone) payload.phone = formData.phone || undefined;

      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setInitialData({
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.phone ?? "",
      });
      setFormData({
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.phone ?? "",
      });

      // Update shared user state for cross-page sync
      if (typeof window !== "undefined") {
        localStorage.setItem("stayleb_full_name", updated.full_name);
        window.dispatchEvent(new Event("stayleb-auth"));
      }

      await Swal.fire({
        title: "Profile updated",
        text: "Your profile has been saved successfully.",
        icon: "success",
        confirmButtonColor: "#157375",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      setError(msg);
      await Swal.fire({
        title: "Update failed",
        text: msg.includes("Email already in use") ? "This email is already in use. Please choose another." : msg,
        icon: "error",
        confirmButtonColor: "#157375",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearPassFields = () => {
    setCurrPass("");
    setNewPass("");
    setConfirmPass("");
    setPassErrors({});
    setPassMsg(null);
    setShowCurr(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handlePassCancel = () => {
    clearPassFields();
    setPassOpen(false);
  };

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (passBusy) return;
    setPassMsg(null);
    const errors: { current?: string; next?: string; confirm?: string } = {};
    if (!currPass) errors.current = "Please enter your current password.";
    if (!newPass) errors.next = "Please enter a new password.";
    if (!confirmPass) errors.confirm = "Please confirm your new password.";
    if (!errors.next && !errors.confirm && newPass !== confirmPass) {
      errors.confirm = "New passwords do not match.";
    }
    setPassErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPassBusy(true);
    try {
      await changePasswordRequest(currPass, newPass);
      clearPassFields();
      setPassOpen(false);
      await Swal.fire({
        title: "Password updated",
        text: "Your password has been changed successfully.",
        icon: "success",
        confirmButtonColor: "#157375",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      setPassMsg(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPassBusy(false);
    }
  }

  const passStrong = newPass.length >= 8 && /[A-Z]/.test(newPass) && /\d/.test(newPass);

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[#157375] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748B]">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="w-full min-h-screen bg-[#F2F5FA] flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6">
          <Icon name="error" className="material-symbols-outlined text-[36px] text-[#64748B] mb-3" />
          <h2 className="text-[18px] text-[#0F2432] font-semibold mb-2">Failed to load profile</h2>
          <p className="text-sm text-[#64748B] mb-4">{error}</p>
          <Link href="/account" className="px-5 py-2 rounded-lg bg-[#157375] hover:bg-[#0f5f61] text-white text-[13px] font-semibold">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const nameInitials = profile.full_name
    .split(" ")
    .filter(Boolean)
    .map(s => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <main className="w-full min-h-screen bg-[#F2F5FA] flex flex-col">
        <div className="flex flex-col w-full">
          <div className="w-full py-5 sm:py-6">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              {/* Hero */}
              <section className="relative overflow-hidden rounded-[22px] border border-[#E9EEF3] bg-gradient-to-r from-white via-[#F4F9FA] to-[#E8F3F3] shadow-[0_4px_20px_rgba(15,40,50,0.06)] px-6 sm:px-8 py-7 sm:py-8">
                <div className="absolute inset-y-0 right-0 w-[48%] hidden md:block pointer-events-none" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/setting_header.png" alt="" className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F4F9FA] via-[#F4F9FA]/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent" />
                </div>
                <div className="absolute inset-y-0 right-0 w-full md:hidden pointer-events-none opacity-[0.12]" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/setting_header.png" alt="" className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40" />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#64748B] text-[11px] uppercase tracking-[0.12em] mb-2">
                      <span>Account</span>
                      <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                      <span className="text-[#157375] font-bold">Settings & Identity</span>
                    </div>
                    <h1 className="text-[30px] sm:text-[40px] leading-[1.1] font-extrabold text-[#0F2432] tracking-tight">Account Settings</h1>
                    <p className="text-[13.5px] sm:text-[15px] text-[#64748B] mt-2">
                      Manage your personal profile, contact information, and security preferences.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-[16px] shadow-[0_4px_20px_rgba(15,40,50,0.08)] border border-[#E9EEF3] shrink-0 w-fit">
                    <span className="p-2.5 rounded-[12px] bg-[#E6F4F4] text-[#157375]">
                      <Icon name="luggage" className="material-symbols-outlined text-[22px]" />
                    </span>
                    <div>
                      <div className="text-[12px] text-[#64748B]">StayLeb Traveler</div>
                      <div className="text-[15px] font-bold text-[#0F2432] flex items-center gap-1.5">Verified Guest<Icon name="verified" className="material-symbols-outlined text-[17px] text-[#059669]" /></div>
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <div className="p-4 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-1 rounded-full bg-[#B91C1C]/10 text-[#B91C1C]">
                      <Icon name="error" className="material-symbols-outlined text-[20px]" />
                    </span>
                    <p className="text-[13.5px] font-medium">{error}</p>
                  </div>
                  <ActionButton className="text-[#B91C1C] hover:opacity-70 transition-opacity" actionLabel="close" aria-label="close" onClick={() => setError(null)}>
                    <Icon name="close" className="material-symbols-outlined text-[18px]" />
                  </ActionButton>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Client Profile */}
                  <div className="bg-white rounded-[22px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3]">
                    <div className="flex items-start justify-between gap-3 pb-6">
                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-[12px] bg-[#E6F4F4] text-[#157375] shrink-0">
                          <Icon name="person" className="material-symbols-outlined text-[22px]" />
                        </span>
                        <div>
                          <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0F2432] tracking-tight">Client Profile</h2>
                          <p className="text-[13px] text-[#64748B] mt-0.5">Update your public identity and direct host contact points.</p>
                        </div>
                      </div>
                      <span className="text-[11.5px] font-semibold bg-[#F1F5F9] border border-[#E9EEF3] px-3 py-1.5 rounded-full text-[#475569] whitespace-nowrap">
                        ID: SL-{String(profile.id).padStart(5, "0")}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-[16px] bg-[#F2F7FA] border border-[#E9EEF3] mb-7">
                      <div className="relative shrink-0">
                        <div className="w-[72px] h-[72px] rounded-full overflow-hidden shadow-md ring-4 ring-white">
                          <div className="w-full h-full bg-gradient-to-br from-[#46B1B1] to-[#157375] flex items-center justify-center text-white font-extrabold text-[22px]">
                            {nameInitials}
                          </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white p-[3px] rounded-full shadow">
                          <span className="w-5 h-5 rounded-full bg-[#157375] text-white flex items-center justify-center">
                            <Icon name="verified" className="material-symbols-outlined text-[13px] text-white" />
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-[18px] font-bold text-[#0F2432]">{profile.full_name}</h3>
                          <span className="text-[11.5px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <Icon name="verified" className="material-symbols-outlined text-[14px]" />
                            Verified Guest
                          </span>
                        </div>
                        <p className="text-[13px] text-[#64748B] mt-1">StayLeb Traveler • Member since {formatDate(profile.created_at)}</p>
                      </div>
                    </div>

                    <LocalForm onSubmit={handleSave} className="space-y-5" id="profileForm">
                      <div>
                        <label className="block text-[14px] font-bold text-[#0F2432] mb-1" htmlFor="fullName">
                          Full Legal Name
                        </label>
                        <p className="text-[12.5px] text-[#94A3B8] mb-2">
                          Displayed on verified booking confirmations to Lebanese hosts.
                        </p>
                        <div className="relative">
                          <input
                            className="w-full h-[52px] px-4 pl-11 rounded-[14px] bg-white border border-[#E2E8F0] text-[#0F2432] text-[14px] focus:outline-none shadow-sm transition-all focus:border-[#46B1B1] focus:ring-[3px] focus:ring-[#46B1B1]/20 placeholder:text-[#94A3B8]"
                            id="fullName"
                            placeholder="Your full name"
                            type="text"
                            name="fullName"
                            value={formData.full_name}
                            onChange={e => handleChange("full_name", e.target.value)}
                            aria-label="Your full name"
                            disabled={saving}
                          />
                          <Icon name="person" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px] pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[14px] font-bold text-[#0F2432]" htmlFor="emailAddr">Email Address</label>
                          <span className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold">
                            <Icon name="check" className="material-symbols-outlined text-[14px]" />
                            <span>Verified</span>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            className="w-full h-[52px] px-4 pl-11 rounded-[14px] bg-white border border-[#E2E8F0] text-[#0F2432] text-[14px] focus:outline-none shadow-sm transition-all focus:border-[#46B1B1] focus:ring-[3px] focus:ring-[#46B1B1]/20 placeholder:text-[#94A3B8]"
                            id="emailAddr"
                            placeholder="name@example.com"
                            type="email"
                            name="emailAddr"
                            value={formData.email}
                            onChange={e => handleChange("email", e.target.value)}
                            aria-label="name@example.com"
                            disabled={saving}
                          />
                          <Icon name="mail" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[20px] pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[14px] font-bold text-[#0F2432]" htmlFor="phoneNumber">Phone Number (Lebanon)</label>
                          <span className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold">
                            <Icon name="chat" className="material-symbols-outlined text-[14px]" />
                            <span>WhatsApp Ready</span>
                          </span>
                        </div>
                        <div className="flex items-stretch rounded-[14px] bg-white border border-[#E2E8F0] shadow-sm transition-all focus-within:border-[#46B1B1] focus-within:ring-[3px] focus-within:ring-[#46B1B1]/20 overflow-hidden">
                          <span className="flex items-center gap-2 pl-4 pr-3 border-r border-[#E9EEF3] text-[14px] font-semibold text-[#0F2432] shrink-0">
                            <Icon name="call" className="material-symbols-outlined text-[19px] text-[#94A3B8]" />
                            LB&nbsp;&nbsp;+961
                          </span>
                          <input
                            className="flex-1 min-w-0 h-[52px] px-4 bg-transparent text-[#0F2432] text-[14px] focus:outline-none placeholder:text-[#94A3B8]"
                            id="phoneNumber"
                            placeholder="XX XXXXXX"
                            type="tel"
                            name="phoneNumber"
                            value={formData.phone}
                            onChange={e => handleChange("phone", e.target.value)}
                            aria-label="XX XXXXXX"
                            disabled={saving}
                          />
                        </div>
                        <p className="text-[12.5px] text-[#94A3B8] mt-2">
                          Hosts coordinate chalet key deliveries and gate pins via this number.
                        </p>
                      </div>

                      <div className="pt-5 mt-1 border-t border-[#EEF2F6] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                        <ActionButton
                          className="px-6 py-3 rounded-xl bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#334155] text-[14px] font-semibold transition-all"
                          type="button"
                          actionLabel="Cancel"
                          aria-label="Cancel"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancel
                        </ActionButton>
                        <ActionButton
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#46B1B1] to-[#157375] hover:brightness-[1.05] text-white text-[14px] font-bold shadow-[0_8px_20px_rgba(21,115,117,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                          type="submit"
                          actionLabel="save Save Changes"
                          aria-label="save Save Changes"
                          disabled={saving || !hasChanges()}
                        >
                          <Icon name={saving ? "hourglass_top" : "save"} className="material-symbols-outlined text-[18px] text-white" />
                          <span>{saving ? "Saving…" : "Save Changes"}</span>
                        </ActionButton>
                      </div>
                    </LocalForm>
                  </div>

                  {/* Account Status */}
                  <div className="bg-white rounded-[22px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3]">
                    <div className="flex items-start gap-3 pb-5">
                      <span className="p-2.5 rounded-[12px] bg-[#E6F4F4] text-[#157375] shrink-0">
                        <Icon name="equalizer" className="material-symbols-outlined text-[22px]" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#157375]">Credentials</p>
                        <h2 className="text-[20px] font-extrabold text-[#0F2432] tracking-tight mt-0.5">Account Status</h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      <div className="bg-[#F6F9FC] border border-[#E9EEF3] p-4 rounded-[14px] flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#E6F4F4] text-[#157375] flex items-center justify-center shrink-0">
                          <Icon name="person" className="material-symbols-outlined text-[20px]" />
                        </span>
                        <span>
                          <span className="text-[11.5px] text-[#64748B] block">Account Role</span>
                          <span className="text-[13.5px] text-[#157375] font-bold mt-0.5 block">
                            {profile.role === "client" ? "Client Account" : profile.role}
                          </span>
                        </span>
                      </div>
                      <div className="bg-[#F6F9FC] border border-[#E9EEF3] p-4 rounded-[14px] flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#E6F4F4] text-[#157375] flex items-center justify-center shrink-0">
                          <Icon name="calendar_month" className="material-symbols-outlined text-[20px]" />
                        </span>
                        <span>
                          <span className="text-[11.5px] text-[#64748B] block">Member Since</span>
                          <span className="text-[13.5px] text-[#0F2432] font-bold mt-0.5 block">
                            {formatDate(profile.created_at)}
                          </span>
                        </span>
                      </div>
                      <div className="bg-[#F6F9FC] border border-[#E9EEF3] p-4 rounded-[14px] flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0">
                          <Icon name="check_circle" className="material-symbols-outlined text-[20px]" />
                        </span>
                        <span>
                          <RecordStatus className="text-[11.5px] text-[#64748B] block" initial="Completed"></RecordStatus>
                          <span className="text-[13.5px] text-[#047857] font-bold mt-0.5 block">Verified Guest</span>
                        </span>
                      </div>
                    </div>

                    <Link className="w-full py-3.5 px-4 rounded-xl bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F2432] text-[14px] font-semibold transition-all flex items-center justify-center gap-2" href="/auth/login">
                      <Icon name="logout" className="material-symbols-outlined text-[19px]" />
                      <span>Sign Out of StayLeb</span>
                    </Link>
                  </div>

                  <div className="px-1 flex items-start gap-2.5">
                    <Icon name="verified_user" className="material-symbols-outlined text-[#157375] text-[19px] mt-0.5 shrink-0" />
                    <p className="text-[12px] text-[#64748B] leading-relaxed">
                      StayLeb is a dedicated Lebanese marketplace. Identity data is only shared with authorized hosts once a reservation is accepted.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Account Security */}
                  <div className="bg-white rounded-[22px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(15,40,50,0.06)] border border-[#E9EEF3]">
                    <div className="flex items-start gap-3 pb-4">
                      <span className="p-2.5 rounded-[12px] bg-[#E6F4F4] text-[#157375] shrink-0">
                        <Icon name="lock" className="material-symbols-outlined text-[22px]" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#157375]">Security</p>
                        <h2 className="text-[20px] font-extrabold text-[#0F2432] tracking-tight mt-0.5">Account Security</h2>
                      </div>
                    </div>
                    <p className="text-[13.5px] text-[#64748B] mb-5 leading-relaxed">
                      Manage your password and account access. For security, use your current password to set a new one.
                    </p>
                    {!passOpen && (
                      <button
                        type="button"
                        onClick={() => setPassOpen(true)}
                        aria-expanded={passOpen}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#46B1B1] to-[#157375] hover:brightness-[1.05] text-white text-[14px] font-bold shadow-[0_8px_20px_rgba(21,115,117,0.3)] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <Icon name="key" className="material-symbols-outlined text-[19px] text-white" />
                        <span className="flex-1 text-center">Change Password</span>
                        <Icon name="arrow_forward" className="material-symbols-outlined text-[19px] text-white" />
                      </button>
                    )}
                    <div className={`grid transition-all duration-300 ease-in-out ${passOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        {passOpen && (
                          <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-1">
                            <div>
                              <label className="block text-[13.5px] font-bold text-[#0F2432] mb-1.5" htmlFor="currentPassword">Current Password</label>
                              <div className="relative">
                                <Icon name="lock" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[19px] pointer-events-none" />
                                <input
                                  id="currentPassword"
                                  type={showCurr ? "text" : "password"}
                                  autoComplete="current-password"
                                  placeholder="Enter current password"
                                  value={currPass}
                                  onChange={e => { setCurrPass(e.target.value); setPassErrors(p => ({ ...p, current: undefined })); }}
                                  disabled={passBusy}
                                  aria-invalid={!!passErrors.current}
                                  className="w-full h-[50px] pl-11 pr-11 rounded-[13px] bg-white border border-[#E2E8F0] text-[#0F2432] text-[14px] focus:outline-none shadow-sm transition-all focus:border-[#46B1B1] focus:ring-[3px] focus:ring-[#46B1B1]/20 placeholder:text-[#94A3B8]"
                                />
                                <button type="button" onClick={() => setShowCurr(v => !v)} aria-label={showCurr ? "Hide current password" : "Show current password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94A3B8] hover:text-[#157375] transition-colors">
                                  <Icon name={showCurr ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                                </button>
                              </div>
                              {passErrors.current && <p role="alert" className="text-[12px] text-[#B91C1C] mt-1.5">{passErrors.current}</p>}
                            </div>

                            <div>
                              <label className="block text-[13.5px] font-bold text-[#0F2432] mb-1.5" htmlFor="newPassword">New Password</label>
                              <div className="relative">
                                <Icon name="lock" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[19px] pointer-events-none" />
                                <input
                                  id="newPassword"
                                  type={showNew ? "text" : "password"}
                                  autoComplete="new-password"
                                  placeholder="Create new password"
                                  value={newPass}
                                  onChange={e => { setNewPass(e.target.value); setPassErrors(p => ({ ...p, next: undefined, confirm: undefined })); }}
                                  disabled={passBusy}
                                  aria-invalid={!!passErrors.next}
                                  className="w-full h-[50px] pl-11 pr-11 rounded-[13px] bg-white border border-[#E2E8F0] text-[#0F2432] text-[14px] focus:outline-none shadow-sm transition-all focus:border-[#46B1B1] focus:ring-[3px] focus:ring-[#46B1B1]/20 placeholder:text-[#94A3B8]"
                                />
                                <button type="button" onClick={() => setShowNew(v => !v)} aria-label={showNew ? "Hide new password" : "Show new password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94A3B8] hover:text-[#157375] transition-colors">
                                  <Icon name={showNew ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                                </button>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-[11.5px]">
                                  <span className="text-[#94A3B8]">Password Strength:</span>
                                  <span className="font-bold text-[#157375]">{passStrong ? "Strong" : newPass ? "Weak" : ""}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#EEF2F6] rounded-full overflow-hidden flex gap-1 mt-1.5">
                                  <div className={`h-full w-1/4 rounded-full transition-all ${newPass.length >= 2 ? "bg-[#46B1B1]" : "bg-[#EEF2F6]"}`} />
                                  <div className={`h-full w-1/4 rounded-full transition-all ${newPass.length >= 4 ? "bg-[#46B1B1]" : "bg-[#EEF2F6]"}`} />
                                  <div className={`h-full w-1/4 rounded-full transition-all ${/[A-Z]/.test(newPass) && /\d/.test(newPass) ? "bg-[#46B1B1]" : "bg-[#EEF2F6]"}`} />
                                  <div className={`h-full w-1/4 rounded-full transition-all ${newPass.length >= 8 && /[A-Z]/.test(newPass) && /\d/.test(newPass) && /[^A-Za-z0-9]/.test(newPass) ? "bg-[#157375]" : "bg-[#EEF2F6]"}`} />
                                </div>
                                <p className="text-[11.5px] text-[#94A3B8] mt-1.5">Use 8+ characters with an uppercase letter, a number and a special character.</p>
                              </div>
                              {passErrors.next && <p role="alert" className="text-[12px] text-[#B91C1C] mt-1.5">{passErrors.next}</p>}
                            </div>

                            <div>
                              <label className="block text-[13.5px] font-bold text-[#0F2432] mb-1.5" htmlFor="confirmPassword">Confirm New Password</label>
                              <div className="relative">
                                <Icon name="lock" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[19px] pointer-events-none" />
                                <input
                                  id="confirmPassword"
                                  type={showConfirm ? "text" : "password"}
                                  autoComplete="new-password"
                                  placeholder="Re-enter new password"
                                  value={confirmPass}
                                  onChange={e => { setConfirmPass(e.target.value); setPassErrors(p => ({ ...p, confirm: undefined })); }}
                                  disabled={passBusy}
                                  aria-invalid={!!passErrors.confirm}
                                  className="w-full h-[50px] pl-11 pr-11 rounded-[13px] bg-white border border-[#E2E8F0] text-[#0F2432] text-[14px] focus:outline-none shadow-sm transition-all focus:border-[#46B1B1] focus:ring-[3px] focus:ring-[#46B1B1]/20 placeholder:text-[#94A3B8]"
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94A3B8] hover:text-[#157375] transition-colors">
                                  <Icon name={showConfirm ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                                </button>
                              </div>
                              {passErrors.confirm && <p role="alert" className="text-[12px] text-[#B91C1C] mt-1.5">{passErrors.confirm}</p>}
                            </div>

                            {passMsg && (
                              <div role="alert" className="p-3 rounded-[12px] text-[13px] font-medium flex items-center gap-2 bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                                <Icon name="error" className="material-symbols-outlined text-[18px] shrink-0" />
                                <span>{passMsg}</span>
                              </div>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                              <button
                                type="button"
                                onClick={handlePassCancel}
                                disabled={passBusy}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#334155] text-[13.5px] font-semibold transition-all disabled:opacity-60"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={passBusy}
                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#46B1B1] to-[#157375] hover:brightness-[1.05] text-white text-[13.5px] font-bold shadow-[0_8px_20px_rgba(21,115,117,0.3)] transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                              >
                                <Icon name="key" className="material-symbols-outlined text-[18px] text-white" />
                                {passBusy ? "Updating…" : "Update Password"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 rounded-[20px] bg-[#EFF6F6] border border-[#D9EBEB] flex items-start gap-3.5">
                    <Icon name="shield" className="material-symbols-outlined text-[#157375] text-[26px] mt-0.5 shrink-0" />
                    <p className="text-[13px] leading-relaxed">
                      <strong className="block text-[#0F2432] font-bold">StayLeb is a dedicated Lebanese marketplace.</strong>
                      <span className="text-[#64748B]">Identity data is only shared with authorized hosts once a reservation is accepted.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}