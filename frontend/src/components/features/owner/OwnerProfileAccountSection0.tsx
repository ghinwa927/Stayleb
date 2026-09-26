"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { apiFetch, logoutRequest, changePasswordRequest } from "@/services/api";
import { getMyProperties, type PropertyResponse } from "@/services/owner";

export function OwnerProfileAccountSection0() {
  const [user, setUser] = useState<{ full_name: string; email: string; phone: string | null; role: string; is_active?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg, setPassMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [ownerProperties, setOwnerProperties] = useState<PropertyResponse[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  useEffect(() => {
    apiFetch("/users/me")
      .then((data) => {
        setUser(data);
        setEditName(data.full_name || "");
        setEditEmail(data.email || "");
        setEditPhone(data.phone ? data.phone.replace(/^\+961\s*/, "") : "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getMyProperties()
      .then(setOwnerProperties)
      .catch(() => setOwnerProperties([]))
      .finally(() => setPropertiesLoading(false));
  }, []);

  async function handleProfileUpdate() {
    setProfileMsg(null);
    const trimmedName = editName.trim();
    if (!trimmedName) { setProfileMsg({ text: "Full name cannot be empty.", ok: false }); return; }
    if (trimmedName.length < 2) { setProfileMsg({ text: "Full name must be at least 2 characters.", ok: false }); return; }
    const trimmedEmail = editEmail.trim().toLowerCase();
    if (!trimmedEmail) { setProfileMsg({ text: "Email cannot be empty.", ok: false }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { setProfileMsg({ text: "Please enter a valid email address.", ok: false }); return; }
    setProfileBusy(true);
    try {
      const phoneToSend = editPhone.trim() ? `+961 ${editPhone.trim()}` : "";
      const data = await apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ full_name: trimmedName, email: trimmedEmail, phone: phoneToSend.trim() || "" }) });
      setUser(data);
      setEditName(data.full_name || "");
      setEditEmail(data.email || "");
      setEditPhone(data.phone ? data.phone.replace(/^\+961\s*/, "") : "");
      setProfileMsg({ text: "Profile updated successfully.", ok: true });
      if (data.full_name) localStorage.setItem("stayleb_full_name", data.full_name);
      if (data.email) localStorage.setItem("stayleb_email", data.email);
      window.dispatchEvent(new Event("stayleb-auth"));
    } catch (e) {
      setProfileMsg({ text: e instanceof Error ? e.message : "Update failed", ok: false });
    } finally {
      setProfileBusy(false);
    }
  }

  function handleCancel() {
    if (user) {
      setEditName(user.full_name || "");
      setEditEmail(user.email || "");
      setEditPhone(user.phone ? user.phone.replace(/^\+961\s*/, "") : "");
    }
    setProfileMsg(null);
  }

  async function handlePasswordUpdate() {
    setPassMsg(null);
    if (!currPass || !newPass || !confirmPass) { setPassMsg({ text: "Please fill all password fields.", ok: false }); return; }
    if (newPass !== confirmPass) { setPassMsg({ text: "New passwords do not match.", ok: false }); return; }
    setPassBusy(true);
    try {
      const { changePasswordRequest } = await import("@/services/api");
      await changePasswordRequest(currPass, newPass);
      setPassMsg({ text: "Password updated successfully. Please log in again.", ok: true });
      setCurrPass(""); setNewPass(""); setConfirmPass("");
    } catch (e) {
      setPassMsg({ text: e instanceof Error ? e.message : "Update failed", ok: false });
    } finally {
      setPassBusy(false);
    }
  }

  const displayName = user?.full_name || "";
  const displayEmail = user?.email || "";
  const hasIdentity = !!displayName;
  const initials = hasIdentity ? displayName.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "—";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleOwnerLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutRequest();
    } catch {
      // logoutRequest already swallows fetch errors and clears local state;
      // this catch is a safety net for unexpected throws
    } finally {
      window.dispatchEvent(new Event("stayleb-auth"));
      router.push("/auth/login");
      setLoggingOut(false);
    }
  }

  return <>
  <main className={"w-full pt-6 min-h-screen bg-background"}><div className={"flex flex-col w-full px-space-md sm:px-space-lg lg:px-space-xl py-space-md max-w-7xl mx-auto"}>

  {profileMsg && (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm rounded-xl shadow-xl transition-all duration-300 ${profileMsg.ok ? "bg-[#ECFDF5] border border-[#059669]/20 text-[#065F46]" : "bg-[#FFF1F2] border border-[#E11D48]/20 text-[#E11D48]"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${profileMsg.ok ? "bg-[#059669] text-white" : "bg-[#E11D48] text-white"}`}>
        <Icon name={profileMsg.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
      </div>
      <div className={"flex flex-col pr-space-sm"}>
        <span className={"font-label-md text-label-md font-semibold"}>{profileMsg.ok ? "Changes Saved" : "Update Failed"}</span>
        <span className={"font-caption text-caption"}>{profileMsg.text}</span>
      </div>
      <button onClick={() => setProfileMsg(null)} className={"p-1 rounded hover:bg-black/5 ml-auto"}><Icon name="close" className="material-symbols-outlined text-[18px]" /></button>
    </div>
  )}

  <div className={"flex flex-col gap-space-xs mb-space-lg"}>
  <nav className={"flex items-center gap-space-xxs text-on-surface-variant font-label-sm text-label-sm"}>
  <Link className={"hover:text-primary transition-colors flex items-center gap-1"} href={"/owner"}>
  <Icon name="grid_view" className="material-symbols-outlined text-[16px]" />
  <span>{"Dashboard"}</span>
  </Link>
  <Icon name="chevron_right" className="material-symbols-outlined text-outline text-[14px]" />
  <span className={"text-[#157375] font-semibold"}>{"Profile / Account"}</span>
  </nav>
  <div className={"flex flex-col md:flex-row md:items-end justify-between gap-space-sm mt-space-xxs"}>
  <div>
  <h1 className={"font-headline-lg text-headline-lg text-[#157375] tracking-tight"}>{"Host Profile & Account Settings"}</h1>
  <p className={"font-body-md text-body-md text-[#157375]/70 mt-1 max-w-2xl"}>{"Manage your personal account credentials, verified host profile information, and security preferences."}</p>
  </div>
  <div className={"flex items-center gap-space-xs self-start md:self-auto bg-surface-container-low px-space-sm py-1.5 rounded-full"}>
  <span className={"w-2.5 h-2.5 rounded-full bg-primary animate-pulse"}></span>
  <span className={"font-caption text-caption font-semibold text-[#157375] uppercase tracking-wider"}>{"Host Node Operational"}</span>
  </div>
  </div>
  </div>

  <div className={"grid grid-cols-1 lg:grid-cols-12 gap-space-lg"}>

  <div className={"lg:col-span-7 flex flex-col gap-space-lg"}>

  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col sm:flex-row items-center gap-space-md relative overflow-hidden"}>
  <div className={"relative flex-shrink-0"}>
  <div className={"w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm"}>{initials}</div>
  <div className={"absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm"}>
  <Icon name="verified" className="material-symbols-outlined text-primary text-[16px]" />
  </div>
  </div>
  <div className={"flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0"}>
  <div className={"flex flex-wrap items-center justify-center sm:justify-start gap-space-xs mb-1"}>
  <h2 className={"font-title-md text-title-md text-[#157375] font-bold truncate"}>{loading ? "—" : hasIdentity ? displayName : "—"}</h2>
  <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"}>
  <Icon name="verified" className="material-symbols-outlined text-[14px]" />{"Verified Owner / Host"}</span>
  </div>
  </div>
  </div>

  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md"}>
  <div className={"flex items-center justify-between pb-space-xs"}>
  <div className={"flex flex-col"}>
  <h3 className={"font-title-md text-title-md text-[#157375] font-bold"}>{"Personal & Contact Details"}</h3>
  <span className={"font-caption text-caption text-[#157375]/60"}>{"Used for guest correspondence and verified StayLeb receipts. Data retrieved from database."}</span>
  </div>
  <Icon name="badge" className="material-symbols-outlined text-outline text-[22px]" />
  </div>
  <div className={"flex flex-col gap-space-md"} id={"profileForm"}>

  <div className={"flex flex-col gap-1.5"}>
  <label className={"font-label-md text-label-md text-[#157375] font-semibold flex items-center justify-between"}>{"Full Legal Name"}<span className={"font-caption text-caption text-[#157375]/60 font-normal"}>{"Matches official civil registry"}</span>
  </label>
  <div className={"relative flex items-center"}>
  <Icon name="person" className="material-symbols-outlined absolute left-3 text-outline text-[20px]" />
  <input value={loading ? "" : editName} onChange={(e) => setEditName(e.target.value)} disabled={loading || profileBusy} className={"w-full h-11 pl-10 pr-space-md bg-surface-container-lowest rounded-xl text-[#157375] font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-low transition-all border border-transparent focus:border-primary/20 placeholder:text-[#157375]/40"} type={"text"} placeholder={loading ? "—" : "Enter full legal name"} />
  </div>
  </div>

  <div className={"flex flex-col gap-1.5"}>
  <div className={"flex items-center justify-between"}>
  <label className={"font-label-md text-label-md text-[#157375] font-semibold"}>{"Email Address"}</label>
  <span className={"inline-flex items-center gap-1 text-primary font-caption text-caption font-semibold"}>
  <Icon name="check_circle" className="material-symbols-outlined text-[14px]" />{"Verified"}</span>
  </div>
  <div className={"relative flex items-center"}>
  <Icon name="mail" className="material-symbols-outlined absolute left-3 text-outline text-[20px]" />
  <input value={loading ? "" : editEmail} onChange={(e) => setEditEmail(e.target.value)} disabled={loading || profileBusy} className={"w-full h-11 pl-10 pr-space-md bg-surface-container-lowest rounded-xl text-[#157375] font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-low transition-all border border-transparent focus:border-primary/20 placeholder:text-[#157375]/40"} type={"email"} placeholder={loading ? "—" : "name@example.com"} />
  </div>
  <span className={"font-caption text-caption text-[#157375]/60"}>{"Used for login and StayLeb notifications. Retrieved from users table."}</span>
  </div>

  <div className={"flex flex-col gap-1.5"}>
  <label className={"font-label-md text-label-md text-[#157375] font-semibold"}>{"Phone Number"}</label>
  <div className={"grid grid-cols-12 gap-space-xs"}>
  <div className={"col-span-4 sm:col-span-3 flex items-center justify-center gap-1.5 h-11 bg-surface-container-low rounded-xl px-2 font-label-md text-label-md text-[#157375] font-medium select-none shadow-sm"}>
  <span className={"text-base leading-none"}>{"\ud83c\uddf1\ud83c\udde7"}</span>
  <span>{"+961"}</span>
  </div>
  <div className={"col-span-8 sm:col-span-9 relative flex items-center"}>
  <input value={loading ? "" : editPhone} onChange={(e) => setEditPhone(e.target.value)} disabled={loading || profileBusy} className={"w-full h-11 px-space-md bg-surface-container-lowest rounded-xl text-[#157375] font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-low transition-all tracking-wide font-mono border border-transparent focus:border-primary/20 placeholder:text-[#157375]/40"} type={"tel"} placeholder={loading ? "—" : "70 987 654"} />
  </div>
  </div>
  <span className={"font-caption text-caption text-[#157375]/60"}>{"Used for high-priority SMS notifications and emergency guest assistance. Retrieved from users table."}</span>
  </div>

  <div className={"flex items-center justify-end gap-space-sm pt-space-xs mt-space-xs"}>
  <button onClick={handleCancel} disabled={profileBusy || loading} className={"px-space-md py-2.5 rounded-xl bg-surface-container text-[#157375] font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-50"} type={"button"}>{"Cancel"}</button>
  <button onClick={handleProfileUpdate} disabled={profileBusy || loading} className={"inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold shadow-md hover:bg-[#0f5a5c] active:scale-[0.98] transition-all disabled:opacity-50"} type={"button"}>
  <Icon name="save" className="material-symbols-outlined text-[18px]" />{profileBusy ? "Saving…" : "Save Profile Changes"}</button>
  </div>
  </div>
  </div>
  </div>

  <div className={"lg:col-span-5 flex flex-col gap-space-lg"}>

  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md"}>
  <div className={"flex items-center justify-between pb-space-xs"}>
  <div className={"flex flex-col"}>
  <h3 className={"font-title-md text-title-md text-[#157375] font-bold"}>{"Password & Security"}</h3>
  <span className={"font-caption text-caption text-[#157375]/60"}>{"Ensure your host account is protected."}</span>
  </div>
  <Icon name="lock_reset" className="material-symbols-outlined text-outline text-[22px]" />
  </div>
  <div className={"flex flex-col gap-space-sm"}>

  <div className={"flex flex-col gap-1"}>
  <label className={"font-label-sm text-label-sm text-[#157375] font-semibold"}>{"Current Password"}</label>
  <div className={"relative flex items-center"}>
  <input value={currPass} onChange={(e) => setCurrPass(e.target.value)} className={"w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl text-[#157375] font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-low transition-all font-mono border border-transparent focus:border-primary/20 placeholder:text-[#157375]/40"} placeholder={"Enter current password"} type={"password"} />
  </div>
  </div>

  <div className={"flex flex-col gap-1"}>
  <label className={"font-label-sm text-label-sm text-[#157375] font-semibold"}>{"New Password"}</label>
  <div className={"relative flex items-center"}>
  <input value={newPass} onChange={(e) => setNewPass(e.target.value)} className={"w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl text-[#157375] font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-low transition-all font-mono border border-transparent focus:border-primary/20 placeholder:text-[#157375]/40"} placeholder={"Create new password"} type={"password"} />
  </div>

  <div className={"flex flex-col gap-1 mt-1"}>
  <div className={"flex items-center justify-between font-caption text-caption"}>
  <span className={"text-[#157375]/60"}>{"Password Strength:"}</span>
  <span className={"font-semibold text-primary"}>{newPass.length >= 8 && /[A-Z]/.test(newPass) && /\d/.test(newPass) ? "Strong" : newPass ? "Weak" : ""}</span>
  </div>
  <div className={"w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden flex gap-1"}>
  <div className={`h-full w-1/4 rounded-full transition-all ${newPass.length >= 2 ? "bg-primary" : "bg-surface-container-high"}`}></div>
  <div className={`h-full w-1/4 rounded-full transition-all ${newPass.length >= 4 ? "bg-primary" : "bg-surface-container-high"}`}></div>
  <div className={`h-full w-1/4 rounded-full transition-all ${/[A-Z]/.test(newPass) && /\d/.test(newPass) ? "bg-primary" : "bg-surface-container-high"}`}></div>
  <div className={`h-full w-1/4 rounded-full transition-all ${newPass.length >= 8 && /[A-Z]/.test(newPass) && /\d/.test(newPass) && /[^A-Za-z0-9]/.test(newPass) ? "bg-secondary" : "bg-surface-container-high"}`}></div>
  </div>
  </div>
  </div>

  <div className={"flex flex-col gap-1"}>
  <label className={"font-label-sm text-label-sm text-[#157375] font-semibold"}>{"Confirm New Password"}</label>
  <div className={"relative flex items-center"}>
  <input value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={"w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl text-[#157375] font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-low transition-all font-mono border border-transparent focus:border-primary/20 placeholder:text-[#157375]/40"} placeholder={"Re-enter new password"} type={"password"} />
  </div>
  </div>
  {passMsg && (
    <div className={`p-2 rounded-lg text-sm flex items-center gap-2 ${passMsg.ok ? "bg-[#ECFDF5] text-[#065F46] border border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/20"}`}>
      <Icon name={passMsg.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />
      <span>{passMsg.text}</span>
    </div>
  )}
  <div className={"pt-space-xs"}>
  <button onClick={handlePasswordUpdate} disabled={passBusy} className={"w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-container-highest text-[#157375] font-label-md text-label-md font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50"} type={"button"}>
  <Icon name="key" className="material-symbols-outlined text-[18px]" />{passBusy ? "Updating…" : "Update Password"}</button>
  </div>
  </div>
  </div>

  <div className={"bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md"}>
  <div className={"flex items-center justify-between pb-space-xs"}>
  <div className={"flex flex-col"}>
  <h3 className={"font-title-md text-title-md text-[#157375] font-bold"}>{"Hosting Standing"}</h3>
  <span className={"font-caption text-caption text-[#157375]/60"}>{"StayLeb system verification & status."}</span>
  </div>
  <div className={"w-2.5 h-2.5 rounded-full bg-secondary"}></div>
  </div>

  <div className={"flex flex-col gap-space-sm"}>
  <div className={"p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between"}>
  <div className={"flex items-center gap-space-xs"}>
  <div className={"w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary"}>
  <Icon name="villa" className="material-symbols-outlined text-[20px]" />
  </div>
  <div className={"flex flex-col"}>
  <span className={"font-label-md text-label-md text-[#157375] font-semibold"}>{propertiesLoading ? "—" : `${ownerProperties.length} Total ${ownerProperties.length === 1 ? "Property" : "Properties"}`}</span>
  {(() => {
    const approvedCount = ownerProperties.filter((p) => p.status === "approved").length;
    const pendingCount = ownerProperties.filter((p) => p.status === "pending").length;
    const rejectedCount = ownerProperties.filter((p) => p.status === "rejected").length;
    const parts: string[] = [];
    if (approvedCount > 0) parts.push(`${approvedCount} Approved`);
    if (pendingCount > 0) parts.push(`${pendingCount} Pending`);
    if (rejectedCount > 0) parts.push(`${rejectedCount} Rejected`);
    const locationLabel = ownerProperties.length === 0 ? "No properties yet" : `${ownerProperties.length} ${ownerProperties.length === 1 ? "property" : "properties"} in portfolio`;
    return <span className={"font-caption text-caption text-[#157375]/60"}>{propertiesLoading ? "—" : locationLabel}</span>;
  })()}
  </div>
  </div>
  <div className={"flex flex-col items-end"}>
  {(() => {
    const approvedCount = ownerProperties.filter((p) => p.status === "approved").length;
    const pendingCount = ownerProperties.filter((p) => p.status === "pending").length;
    const rejectedCount = ownerProperties.filter((p) => p.status === "rejected").length;
    if (propertiesLoading) return <span className={"font-caption text-caption text-[#157375]/60"}>—</span>;
    return (
      <>
        <span className={"font-caption text-caption font-semibold text-primary"}>{`${approvedCount} Approved`}</span>
        <span className={"font-caption text-caption text-tertiary"}>{`${pendingCount} Pending`}</span>
        {rejectedCount > 0 && <span className={"font-caption text-caption text-[#E11D48]"}>{`${rejectedCount} Rejected`}</span>}
      </>
    );
  })()}
  </div>
  </div>

  <div className={"p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-xs"}>
  <Icon name="verified_user" className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5" />
  <div className={"flex flex-col"}>
  <span className={"font-label-md text-label-md text-[#157375] font-semibold"}>{"Active & In Good Standing"}</span>
  <p className={"font-caption text-caption text-[#157375]/60 mt-0.5"}>{"Compliant with StayLeb host code of conduct."}</p>
  </div>
  </div>
  </div>

  <div className={"pt-space-xs"}>
  <button onClick={handleOwnerLogout} disabled={loggingOut} className={"w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"} type="button">
  <Icon name="logout" className="material-symbols-outlined text-[18px]" />{loggingOut ? "Signing out…" : "Sign Out of StayLeb Host Portal"}</button>
  </div>
  </div>
  </div>
  </div>

  <div className={"mt-space-lg p-space-md sm:p-space-lg rounded-2xl bg-surface-container-low shadow-sm flex items-start gap-space-md"}>
  <div className={"w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0 mt-0.5"}>
  <Icon name="policy" className="material-symbols-outlined text-[22px]" />
  </div>
  <div className={"flex flex-col"}>
  <h4 className={"font-label-md text-label-md text-[#157375] font-bold tracking-tight"}>{"StayLeb Account Security & Ownership Verification"}</h4>
  <p className={"font-body-md text-body-md text-[#157375]/70 mt-1 leading-relaxed"}>{"StayLeb Account Security: Identity and property deed checks are maintained securely by StayLeb Admin operations. For ownership deed modifications or business entity name updates, contact StayLeb Operations via verified support line."}</p>
  <div className={"mt-space-xs flex items-center gap-space-md"}>
  <a className={"font-label-sm text-label-sm text-primary font-semibold hover:underline inline-flex items-center gap-1"} href={"mailto:operations@stayleb.com"}>
  <span>{"Contact StayLeb Operations"}</span>
  <Icon name="arrow_forward" className="material-symbols-outlined text-[14px]" />
  </a>
  </div>
  </div>
  </div>
  </div>
  </main>
  </>; }
