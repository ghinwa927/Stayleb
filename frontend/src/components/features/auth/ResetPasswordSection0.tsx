"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { resetPasswordRequest } from "@/services/api";

export function ResetPasswordSection0() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qToken = searchParams.get("reset_token");
    const qEmail = searchParams.get("email");
    const storedToken = sessionStorage.getItem("stayleb_reset_token") || localStorage.getItem("stayleb_reset_token");
    const storedEmail = sessionStorage.getItem("stayleb_reset_email") || localStorage.getItem("stayleb_reset_email");
    setResetToken(qToken || storedToken || "");
    setEmail(qEmail || storedEmail || "");
  }, [searchParams]);

  function strengthScore(pw: string) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }
  const score = strengthScore(newPass);
  const labels = ["Too short", "Weak", "Good", "Strong"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPass !== confirmPass) {
      setError("Passwords must match exactly");
      return;
    }
    if (!resetToken) {
      setError("Missing reset token. Please restart recovery from Forgot Password.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordRequest(resetToken, newPass);
      sessionStorage.removeItem("stayleb_reset_token");
      localStorage.removeItem("stayleb_reset_token");
      router.push("/auth/reset-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="w-full min-h-screen bg-surface flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
            <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-16 xl:p-20 bg-surface-container-lowest z-10">
              <div>
                <div className="flex items-center justify-between gap-4 pb-8 lg:pb-12">
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                      <Icon name="cottage" className="material-symbols-outlined text-title-md font-title-md" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm tracking-tight text-primary leading-none">StayLeb</span>
                      <span className="font-caption text-caption text-on-surface-variant uppercase tracking-widest mt-0.5">Authentic Stays</span>
                    </div>
                  </Link>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-white font-label-sm text-label-sm shadow-sm truncate max-w-[160px]">
                    <Icon name="verified_user" className="material-symbols-outlined text-caption font-caption" />
                    <span className="truncate text-on-surface">{email || "account@domain.lb"}</span>
                  </div>
                </div>

                <div className="space-y-3 max-w-lg mb-8">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-caption text-caption">
                    <Icon name="lock_reset" className="material-symbols-outlined text-caption" />
                    <span>Credential Recovery Step 2 of 2</span>
                  </div>
                  <h1 className="font-display text-display text-on-surface tracking-tight">Create a new password</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    Your new password must be at least 8 characters and include a mixture of numbers and symbols for account protection.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-error-container text-white flex items-start gap-2 max-w-lg">
                    <Icon name="error" className="material-symbols-outlined text-[20px] text-error shrink-0" />
                    <p className="font-label-sm text-label-sm flex-1">{error}</p>
                    <button type="button" onClick={() => setError(null)} className="p-1"><Icon name="close" className="material-symbols-outlined text-[16px]" /></button>
                  </div>
                )}

                <form className="space-y-6 max-w-lg" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface" htmlFor="new-pass">New Password</label>
                    <div className="relative flex items-center">
                      <input className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container-low text-white font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200" id="new-pass" placeholder="Enter strong password" required type={showNew ? "text" : "password"} value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                      <button type="button" onClick={() => setShowNew(!showNew)} aria-label="Toggle password visibility" className="absolute right-3.5 p-1 rounded-lg text-outline hover:text-on-surface transition-colors">
                        <Icon name={showNew ? "visibility_off" : "visibility"} className="material-symbols-outlined text-title-md font-title-md" />
                      </button>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-caption text-caption text-on-surface-variant">Security meter</span>
                        <span className="font-caption text-caption font-semibold text-outline">{labels[score] || labels[0]}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`h-1.5 rounded-full transition-colors duration-300 ${score >= 1 ? "bg-amber-500" : "bg-surface-variant"}`}></div>
                        <div className={`h-1.5 rounded-full transition-colors duration-300 ${score >= 2 ? "bg-secondary" : "bg-surface-variant"}`}></div>
                        <div className={`h-1.5 rounded-full transition-colors duration-300 ${score >= 3 ? "bg-primary" : "bg-surface-variant"}`}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      <div className={`flex items-center gap-1.5 font-caption text-caption transition-colors ${newPass.length >= 8 ? "text-secondary" : "text-outline"}`}>
                        <Icon name={newPass.length >= 8 ? "check_circle" : "radio_button_unchecked"} className="material-symbols-outlined text-label-sm font-label-sm" />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-caption text-caption transition-colors ${/\d/.test(newPass) ? "text-secondary" : "text-outline"}`}>
                        <Icon name={/\d/.test(newPass) ? "check_circle" : "radio_button_unchecked"} className="material-symbols-outlined text-label-sm font-label-sm" />
                        <span>Contains a number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-caption text-caption transition-colors ${/[^A-Za-z0-9]/.test(newPass) ? "text-secondary" : "text-outline"}`}>
                        <Icon name={/[^A-Za-z0-9]/.test(newPass) ? "check_circle" : "radio_button_unchecked"} className="material-symbols-outlined text-label-sm font-label-sm" />
                        <span>Contains special symbol</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-caption text-caption transition-colors ${/[A-Z]/.test(newPass) && /[a-z]/.test(newPass) ? "text-secondary" : "text-outline"}`}>
                        <Icon name={/[A-Z]/.test(newPass) && /[a-z]/.test(newPass) ? "check_circle" : "radio_button_unchecked"} className="material-symbols-outlined text-label-sm font-label-sm" />
                        <span>Mixed upper & lower case</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block font-label-md text-label-md text-on-surface" htmlFor="confirm-pass">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <input className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container-low text-white font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200" id="confirm-pass" placeholder="Repeat password" required type={showConfirm ? "text" : "password"} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm visibility" className="absolute right-3.5 p-1 rounded-lg text-outline hover:text-on-surface transition-colors">
                        <Icon name={showConfirm ? "visibility_off" : "visibility"} className="material-symbols-outlined text-title-md font-title-md" />
                      </button>
                    </div>
                    <div className={`flex items-center gap-1.5 font-caption text-caption pt-1 min-h-[20px] ${confirmPass && newPass === confirmPass ? "text-secondary" : "text-outline"}`}>
                      <Icon name={confirmPass && newPass === confirmPass ? "check_circle" : "shield"} className="material-symbols-outlined text-label-sm font-label-sm" />
                      <span>{confirmPass ? (newPass === confirmPass ? "Passwords match" : "Passwords must match exactly") : "Passwords must match exactly"}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.98] text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      <span>{loading ? "Resetting..." : "Reset Password"}</span>
                      {!loading && <Icon name="arrow_forward" className="material-symbols-outlined text-title-md font-title-md" />}
                    </button>
                    <Link href="/auth/login" className="w-full h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-white font-label-md text-label-md flex items-center justify-center gap-2 transition-colors cursor-pointer">
                      <Icon name="arrow_back" className="material-symbols-outlined text-body-lg font-body-lg" />
                      <span>Back to Login</span>
                    </Link>
                  </div>
                </form>
              </div>

              <div className="pt-8 border-t-0 flex items-center justify-between text-on-surface-variant font-caption text-caption">
                <div className="flex items-center gap-1.5">
                  <Icon name="lock" className="material-symbols-outlined text-sm text-secondary" />
                  <span>SSL 256-bit Encrypted Session</span>
                </div>
                <span>Beirut, Mount Lebanon</span>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-6 relative bg-surface-container">
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <LocalImage alt="Peaceful sunlit Lebanese courtyard in Deir el Qamar with historical yellow limestone arches, potted flowering geraniums, and sweeping views of the Chouf mountains under Mediterranean sky" className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out" src="/images/4dde1c26ea426da9.jpg" />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
