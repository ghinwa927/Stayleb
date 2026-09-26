"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, LocalForm } from "@/components/ui/Interactions";
import { getMyProfile, updateMyProfile, type UserProfile, type UpdateProfilePayload } from "@/services/user";
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

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center max-w-md px-6">
          <Icon name="error" className="material-symbols-outlined text-[36px] text-slate-400 mb-3" />
          <h2 className="font-title-md text-title-md text-on-surface font-semibold mb-2">Failed to load profile</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <Link href="/account" className="px-5 py-2 rounded-lg bg-primary text-white font-label-sm text-label-sm">Back to Dashboard</Link>
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
      <main className="w-full min-h-screen bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full bg-[#E4ECEE] min-h-[calc(100vh-72px)] py-8 md:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-on-surface-variant font-caption text-caption uppercase tracking-wider mb-2">
                    <span>Account</span>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <span className="text-primary font-semibold">Settings & Identity</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">Account Settings</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                    Manage your personal profile, contact information, and security preferences.
                  </p>
                </div>
                <div className="flex items-center space-x-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm">
                  <div className="p-2 rounded-lg bg-surface-container text-primary">
                    <Icon name="villa" className="material-symbols-outlined text-[20px]" />
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">StayLeb History</div>
                    <div className="font-title-md text-title-md text-on-surface">3 Mountain & Coastal Stays</div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-error-container/60 text-error flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 rounded-full bg-error/10 text-error">
                      <Icon name="error" className="material-symbols-outlined text-[20px]" />
                    </div>
                    <p className="font-label-md text-label-md">{error}</p>
                  </div>
                  <ActionButton className="text-error hover:opacity-70 transition-opacity" actionLabel="close" aria-label="close" onClick={() => setError(null)}>
                    <Icon name="close" className="material-symbols-outlined text-[18px]" />
                  </ActionButton>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col space-y-8">
                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between pb-6 mb-6">
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">Client Profile</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Update your public identity and direct host contact points.</p>
                      </div>
                      <span className="font-caption text-caption bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
                        ID: SL-{String(profile.id).padStart(5, "0")}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-4 rounded-xl bg-surface-container-low mb-6">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-4 ring-surface-container-lowest">
                          <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                            {nameInitials}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-surface-container-lowest p-1 rounded-full shadow">
                          <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                            <Icon name="verified" className="material-symbols-outlined text-[13px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="font-title-md text-title-md text-on-surface">{profile.full_name}</h3>
                          <span className="font-caption text-caption bg-[#ECFDF5] text-[#059669] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                            Verified Guest
                          </span>
                        </div>
                      </div>
                    </div>

                    <LocalForm onSubmit={handleSave} className="space-y-5" id="profileForm">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="fullName">
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <input
                            className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none shadow-sm transition-all placeholder:text-outline"
                            id="fullName"
                            placeholder="Your full name"
                            type="text"
                            name="fullName"
                            value={formData.full_name}
                            onChange={e => handleChange("full_name", e.target.value)}
                            aria-label="Your full name"
                            disabled={saving}
                          />
                          <Icon name="badge" className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]" />
                        </div>
                        <span className="font-caption text-caption text-on-surface-variant mt-1 block">
                          Displayed on verified booking confirmations to Lebanese hosts.
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block font-label-md text-label-md text-on-surface" htmlFor="emailAddr">Email Address</label>
                          <span className="inline-flex items-center space-x-1 font-caption text-caption px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium">
                            <Icon name="check" className="material-symbols-outlined text-[14px]" />
                            <span>Verified</span>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all"
                            id="emailAddr"
                            placeholder="name@example.com"
                            type="email"
                            name="emailAddr"
                            value={formData.email}
                            onChange={e => handleChange("email", e.target.value)}
                            aria-label="name@example.com"
                            disabled={saving}
                          />
                          <Icon name="mail" className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block font-label-md text-label-md text-on-surface" htmlFor="phoneNumber">Phone Number (Lebanon)</label>
                          <span className="inline-flex items-center space-x-1 font-caption text-caption px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium">
                            <Icon name="call" className="material-symbols-outlined text-[14px]" />
                            <span>WhatsApp Ready</span>
                          </span>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3 top-2.5 flex items-center space-x-1.5 pr-2">
                            <span className="text-[18px]">🇱🇧</span>
                            <span className="font-label-md text-label-md text-on-surface-variant font-mono">+961</span>
                          </div>
                          <input
                            className="w-full h-11 pl-24 pr-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all"
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
                        <span className="font-caption text-caption text-on-surface-variant mt-1 block">
                          Hosts coordinate chalet key deliveries and gate pins via this number.
                        </span>
                      </div>

                      <div className="pt-4 flex items-center justify-end space-x-3">
                        <ActionButton
                          className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all"
                          type="button"
                          actionLabel="Cancel"
                          aria-label="Cancel"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancel
                        </ActionButton>
                        <ActionButton
                          className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-[#115E60] text-on-primary font-label-md text-label-md shadow-sm active:scale-[0.98] transition-all flex items-center space-x-2"
                          type="submit"
                          actionLabel="save Save Changes"
                          aria-label="save Save Changes"
                          disabled={saving || !hasChanges()}
                        >
                          <Icon name={saving ? "hourglass_top" : "save"} className="material-symbols-outlined text-[18px]" />
                          <span>{saving ? "Saving…" : "Save Changes"}</span>
                        </ActionButton>
                      </div>
                    </LocalForm>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="pb-4 mb-4">
                      <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">Credentials</span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Account Status</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="bg-surface-container-low p-3.5 rounded-xl">
                        <span className="font-caption text-caption text-on-surface-variant block">Account Role</span>
                        <span className="font-label-md text-label-md text-primary font-semibold mt-0.5 block">
                          {profile.role === "client" ? "Client Account" : profile.role}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-3.5 rounded-xl">
                        <span className="font-caption text-caption text-on-surface-variant block">Member Since</span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold mt-0.5 block">
                          {formatDate(profile.created_at)}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-3.5 rounded-xl">
                        <RecordStatus className="font-caption text-caption text-on-surface-variant block" initial="Completed"></RecordStatus>
                        <span className="font-label-md text-label-md text-[#059669] font-semibold mt-0.5 block">3 Verified Stays</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link className="w-full h-11 px-4 rounded-xl bg-surface-container hover:bg-error-container/40 text-on-surface hover:text-error font-label-md text-label-md transition-all flex items-center justify-center space-x-2" href="/auth/login">
                        <Icon name="logout" className="material-symbols-outlined text-[18px]" />
                        <span>Sign Out of StayLeb</span>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low/70 flex items-start space-x-3">
                    <Icon name="verified_user" className="material-symbols-outlined text-primary text-[20px] mt-0.5" />
                    <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                      StayLeb is a dedicated Lebanese marketplace. Identity data is only shared with authorized hosts once a reservation is accepted.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col space-y-8">
                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="pb-4 mb-4">
                      <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">Security</span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Account Security</h2>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                      Manage your password and account access. For security, password changes are handled separately.
                    </p>
                    <Link href="/auth/change-password" className="w-full h-11 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2">
                      <Icon name="key" className="material-symbols-outlined text-[18px]" />
                      <span>Change Password</span>
                    </Link>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low/70 flex items-start space-x-3">
                    <Icon name="verified_user" className="material-symbols-outlined text-primary text-[20px] mt-0.5" />
                    <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                      StayLeb is a dedicated Lebanese marketplace. Identity data is only shared with authorized hosts once a reservation is accepted.
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