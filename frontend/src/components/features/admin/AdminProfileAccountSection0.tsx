"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";

export function AdminProfileAccountSection0() {
  const [user, setUser] = useState<{ full_name: string; email: string; phone: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg, setPassMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    apiFetch("/users/me")
      .then((data) => {
        setUser(data);
        setEditName(data.full_name || "");
        setEditPhone(data.phone || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handlePasswordUpdate() {
    setPassMsg(null);
    if (!currPass || !newPass || !confirmPass) {
      setPassMsg({ text: "Please fill all password fields.", ok: false });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    setPassBusy(true);
    try {
      const { changePasswordRequest } = await import("@/services/api");
      await changePasswordRequest(currPass, newPass);
      setPassMsg({ text: "Password updated successfully. Please log in again.", ok: true });
      setCurrPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (e) {
      setPassMsg({ text: e instanceof Error ? e.message : "Update failed", ok: false });
    } finally {
      setPassBusy(false);
    }
  }

  async function handleProfileUpdate() {
    setProfileMsg(null);
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setProfileMsg({ text: "Full name cannot be empty.", ok: false });
      return;
    }
    if (trimmedName.length < 2) {
      setProfileMsg({ text: "Full name must be at least 2 characters.", ok: false });
      return;
    }
    setProfileBusy(true);
    try {
      const data = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: trimmedName, phone: editPhone.trim() }),
      });
      setUser(data);
      setEditName(data.full_name || "");
      setEditPhone(data.phone || "");
      setProfileMsg({ text: "Profile updated successfully.", ok: true });
    } catch (e) {
      setProfileMsg({ text: e instanceof Error ? e.message : "Update failed", ok: false });
    } finally {
      setProfileBusy(false);
    }
  }

  function handleCancel() {
    if (user) {
      setEditName(user.full_name || "");
      setEditPhone(user.phone || "");
    }
    setProfileMsg(null);
  }

  const displayName = user?.full_name || "";
  const displayEmail = user?.email || "";
  const hasIdentity = !!displayName;
  const initials = (displayName || "—")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "—";
  return <>
<div className={""}><main className={"w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low"}><div className={"flex flex-col w-full gap-space-lg"}>

<div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-md"}>
<div className={"flex flex-col gap-space-xxs"}>
<div className={"flex items-center gap-space-xs text-[#46B1B1] font-caption text-caption uppercase tracking-wider"}>
<span>{"Administration"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<span className={"text-primary font-semibold"}>{"Profile & Account"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight"}>{"Administrator Profile & Security"}</h1>
<p className={"font-body-md text-body-md text-[#46B1B1] max-w-3xl"}>{"Manage your administrator account credentials, verification standing, and administrative access settings."}</p>
</div>

<div className={"flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface-container shadow-sm self-start md:self-auto"}>
<span className={"w-2 h-2 rounded-full bg-primary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-[#46B1B1]"}>{"Active Session: "}<strong className={"text-[#46B1B1] font-semibold"}>{"Active session"}</strong></span>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start"}>

<div className={"relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md"}>

<div className={"absolute -right-12 -top-12 w-48 h-48 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"}></div>
<div className={"relative flex flex-col sm:flex-row items-start sm:items-center gap-space-md justify-between"}>
<div className={"flex items-center gap-space-md"}>

<div className={"relative flex-shrink-0"}>
<div className={"w-20 h-20 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm"}>{initials}</div>
<div className={"absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm"}>
<Icon name="verified" className="material-symbols-outlined text-primary text-[16px]" />
</div>
</div>
<div className={"flex flex-col gap-space-xxs"}>
<div className={"flex flex-wrap items-center gap-space-xs"}>
<h2 className={"font-title-md text-title-md font-bold text-[#46B1B1]"}>{loading ? "—" : displayName || "—"}</h2>
<span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold tracking-wide"}>
<Icon name="shield" className="material-symbols-outlined text-[14px]" /> Super Administrator
</span>
</div>
<span className={"font-label-sm text-label-sm text-[#46B1B1] flex items-center gap-1"}>
<Icon name="lan" className="material-symbols-outlined text-[16px] text-outline" /> Account type: Administrator
</span>
</div>
</div>

<div className={"px-space-sm py-space-xs rounded-lg bg-surface-container-low flex flex-col items-start sm:items-end"}>
<span className={"font-caption text-caption text-[#46B1B1] uppercase"}>Access level</span>
<span className={"font-label-sm text-label-sm font-semibold text-primary"}>Full platform access</span>
</div>
</div>

<div className={"pt-2 grid grid-cols-1 sm:grid-cols-2 gap-space-md bg-surface-container-low p-space-md rounded-lg"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm"}>
<Icon name="mark_email_read" className="material-symbols-outlined text-[20px]" />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-caption text-caption text-[#46B1B1] uppercase tracking-wider"}>Registered Admin Email</span>
<span className={"font-label-md text-label-md font-medium text-[#46B1B1] truncate"}>{loading ? "—" : displayEmail || "—"}</span>
<span className={"font-caption text-caption text-primary font-semibold flex items-center gap-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-primary"}></span> Verified Internal
</span>
</div>
</div>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm"}>
<Icon name="call" className="material-symbols-outlined text-[20px]" />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-caption text-caption text-[#46B1B1] uppercase tracking-wider"}>Lebanese Telephone</span>
<span className={"font-label-md text-label-md font-medium text-[#46B1B1] truncate"}>{loading ? "—" : user?.phone ? user.phone : "— Not set"}</span>
<span className={"font-caption text-caption text-[#46B1B1]"}>Primary contact number</span>
</div>
</div>
</div>
</div>

<div className={"rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="badge" className="material-symbols-outlined text-primary text-[22px]" />
<h3 className={"font-headline-sm text-headline-sm text-[#46B1B1]"}>{"Personal Information"}</h3>
</div>
<span className={"font-caption text-caption text-outline"} aria-hidden="true"></span>
</div>
  <div className="flex flex-col gap-space-md" id="adminProfileForm">
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="flex flex-col gap-space-xxs">
<label className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">Full Legal Name</label>
<div className="relative">
<input className="w-full h-11 px-space-sm bg-surface-container-low text-[#46B1B1] rounded-lg font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-sm placeholder:text-outline border border-transparent focus:border-[#157375]/20" type="text" value={loading ? "" : editName} onChange={(e) => setEditName(e.target.value)} placeholder={loading ? "—" : "Enter full name"} disabled={loading || profileBusy} />
</div>
</div>

<div className="flex flex-col gap-space-xxs">
<div className="flex items-center justify-between">
<label className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">Email Address</label>
<span className="font-caption text-caption text-outline flex items-center gap-0.5">
<Icon name="lock" className="material-symbols-outlined text-[13px]" />
Super Admin Locked
</span>
</div>
<div className="relative flex items-center">
<input className="w-full h-11 px-space-sm bg-surface-container-low text-[#46B1B1] rounded-lg font-body-md text-body-md opacity-90 select-none shadow-sm border border-transparent" disabled type="email" value={loading ? "" : displayEmail} placeholder={loading ? "—" : ""} />
<Icon name="verified_user" className="absolute right-3 material-symbols-outlined text-outline text-[18px]" />
</div>
</div>

<div className="flex flex-col gap-space-xxs md:col-span-2">
<label className="font-label-sm text-label-sm font-semibold text-[#46B1B1]">Mobile Telephone (SMS 2FA)</label>
<div className="relative flex items-center">
<span className="absolute left-3 font-label-md text-label-md text-[#46B1B1] font-medium">🇱🇧</span>
<input className="w-full h-11 pl-10 pr-space-sm bg-surface-container-low text-[#46B1B1] rounded-lg font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-sm border border-transparent focus:border-[#157375]/20 placeholder:text-outline" type="tel" value={loading ? "" : editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder={loading ? "—" : "+961 70 000 000"} disabled={loading || profileBusy} />
</div>
<span className="font-caption text-caption text-outline mt-1">Editable — saved to your profile</span>
</div>

</div>

{profileMsg && (
  <div className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${profileMsg.ok ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
    <Icon name={profileMsg.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
    <span>{profileMsg.text}</span>
  </div>
)}

<div className={"flex items-center justify-end gap-space-xs pt-space-xs"}>
<button onClick={handleCancel} disabled={profileBusy} className={"px-space-md h-11 rounded-lg bg-surface-container-high text-[#46B1B1] font-label-md text-label-md hover:bg-surface-container transition-colors disabled:opacity-50"} type={"button"}>
Cancel
</button>
<button onClick={handleProfileUpdate} disabled={profileBusy || loading} className={"px-space-lg h-11 rounded-lg bg-primary text-white font-label-md text-label-md font-semibold shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-space-xs disabled:opacity-50"} type={"button"}>
<Icon name="save" className="material-symbols-outlined text-[18px]" />
{profileBusy ? "Saving…" : "Save Profile Changes"}
</button>
</div>
</div>
</div>

<div className={"rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="lock_reset" className="material-symbols-outlined text-primary text-[22px]" />
<h3 className={"font-headline-sm text-headline-sm text-[#46B1B1]"}>{"Security & Authentication"}</h3>
</div>
<span className={"hidden"} aria-hidden="true"></span>
</div>
<p className={"font-caption text-caption text-[#46B1B1]"}>{"Manage your administrator password securely."}</p>
<div className="flex flex-col gap-space-sm" id="passwordForm">

<div className={"flex flex-col gap-space-xxs"}>
<label className={"font-label-sm text-label-sm font-semibold text-[#46B1B1]"}>{"Current Password"}</label>
<div className={"relative flex items-center"}>
<input className={"w-full h-11 pl-space-sm pr-11 bg-surface-container-lowest text-[#46B1B1] rounded-lg font-body-md text-body-md focus:outline-none shadow-sm"} id={"currPassInput"} placeholder={"Enter current password"} type={"password"} value={currPass} onChange={(e) => setCurrPass(e.target.value)} aria-label={"Enter current password"} />
</div>
</div>

<div className={"flex flex-col gap-space-xxs"}>
<label className={"font-label-sm text-label-sm font-semibold text-[#46B1B1]"}>{"New Password"}</label>
<div className={"relative flex items-center"}>
<input className={"w-full h-11 pl-space-sm pr-11 bg-surface-container-lowest text-[#46B1B1] rounded-lg font-body-md text-body-md focus:outline-none shadow-sm"} id={"newPassInput"} placeholder={"8+ chars, uppercase, number, symbol"} type={"password"} value={newPass} onChange={(e) => setNewPass(e.target.value)} aria-label={"New password"} />
</div>
<div className={"flex flex-col gap-1 mt-1"}>
<div className={"flex items-center justify-between text-caption font-caption"}>
<span className={"text-[#46B1B1]"}>{"Password Strength"}</span>
<span className={"font-semibold text-secondary"}>{newPass.length >= 8 && /[A-Z]/.test(newPass) && /\d/.test(newPass) ? "Strong" : newPass ? "Weak" : ""}</span>
</div>
<div className={"h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden flex gap-1"}>
<div className={`h-full w-1/4 transition-all ${newPass.length >= 2 ? "bg-secondary" : "bg-surface-container-high"}`}></div>
<div className={`h-full w-1/4 transition-all ${newPass.length >= 4 ? "bg-secondary" : "bg-surface-container-high"}`}></div>
<div className={`h-full w-1/4 transition-all ${/[A-Z]/.test(newPass) && /\d/.test(newPass) ? "bg-secondary" : "bg-surface-container-high"}`}></div>
<div className={`h-full w-1/4 transition-all ${newPass.length >= 8 && /[A-Z]/.test(newPass) && /\d/.test(newPass) && /[^A-Za-z0-9]/.test(newPass) ? "bg-secondary" : "bg-surface-container-high"}`}></div>
</div>
</div>
</div>

<div className={"flex flex-col gap-space-xxs"}>
<label className={"font-label-sm text-label-sm font-semibold text-[#46B1B1]"}>{"Confirm New Password"}</label>
<div className={"relative flex items-center"}>
<input className={"w-full h-11 pl-space-sm pr-11 bg-surface-container-lowest text-[#46B1B1] rounded-lg font-body-md text-body-md focus:outline-none shadow-sm"} id={"confirmPassInput"} placeholder={"Re-enter new password"} type={"password"} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} aria-label={"Confirm new password"} />
</div>
</div>
{passMsg && (
  <div className={`p-2 rounded-lg text-sm flex items-center gap-2 ${passMsg.ok ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
    <Icon name={passMsg.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
    <span>{passMsg.text}</span>
  </div>
)}

<button onClick={handlePasswordUpdate} disabled={passBusy} className={"w-full mt-space-xs h-11 rounded-lg bg-primary text-white hover:bg-primary transition-all font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-sm active:scale-[0.99] disabled:opacity-50"} type={"button"}>
<Icon name="key" className="material-symbols-outlined text-[18px]" /> {passBusy ? "Updating…" : "Update Password"}
</button>
</div>
</div>

<div className={"flex flex-col gap-space-lg"}>
<div className={"rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<Icon name="policy" className="material-symbols-outlined text-primary text-[22px]" />
<h3 className={"font-headline-sm text-headline-sm text-[#46B1B1]"}>{"Administrative System Standing"}</h3>
</div>
<span className={"px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold"}>{"Admin"}</span>
</div>
<div className={"flex flex-col gap-space-sm"}>

<div className={"flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low"}>
<div className={"flex items-center justify-between"}>
<span className={"font-caption text-caption text-[#46B1B1] uppercase tracking-wider"}>{"Access Level"}</span>
<span className={"font-label-sm text-label-sm font-semibold text-primary"}>{"Root Super Admin"}</span>
</div>
<p className={"font-body-md text-body-md font-medium text-[#46B1B1]"}>{"Full Platform Super Admin"}</p>
</div>

<div className={"flex flex-col gap-space-xxs"}>
<span className={"font-caption text-caption text-[#46B1B1] uppercase tracking-wider font-semibold"}>{"Active Portal Privileges"}</span>
<div className={"grid grid-cols-1 sm:grid-cols-2 gap-space-xxs"}>
<div className={"flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-low/70"}>
<Icon name="group" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-[#46B1B1]"}>{"User Management"}</span>
</div>
<div className={"flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-low/70"}>
<Icon name="domain_verification" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-[#46B1B1]"}>{"Listing Approval"}</span>
</div>
<div className={"flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-low/70"}>
<Icon name="payments" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-[#46B1B1]"}>{"Commission & Settlements"}</span>
</div>
<div className={"flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-low/70"}>
<Icon name="database" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-[#46B1B1]"}>{"Amenities & Rules"}</span>
</div>
<div className={"flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-low/70 sm:col-span-2"}>
<Icon name="rate_review" className="material-symbols-outlined text-primary text-[18px]" />
<span className={"font-label-sm text-label-sm text-[#46B1B1]"}>{"Review Moderation & Disputes"}</span>
</div>
</div>
</div>


</div>
</div>

<div className={"pt-2"}>
<Link className={"w-full h-12 rounded-xl bg-primary text-white hover:bg-primary font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"} href={"/auth/login"}>
<Icon name="logout" className="material-symbols-outlined text-[20px] text-white" /> Sign Out of Admin Portal
</Link>
<p className="text-xs text-center text-[#46B1B1]/60 mt-2">Securely ends your admin session and returns to login</p>
</div>
</div>

</div>
</div>
</main>
</div>
</>; }
