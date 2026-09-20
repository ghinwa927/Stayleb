"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { verifyOtpRequest } from "@/services/api";

export function OTPVerificationSection0() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    const stored = sessionStorage.getItem("stayleb_reset_email") || localStorage.getItem("stayleb_reset_email");
    setEmail(qEmail || stored || "");
  }, [searchParams]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(idx: number, val: string) {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (pasted.length) {
      const next = [...digits];
      pasted.forEach((c, i) => (next[i] = c));
      setDigits(next);
      e.preventDefault();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    if (!email) {
      setError("Missing email. Please go back to Forgot Password.");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpRequest(email, otp);
      sessionStorage.setItem("stayleb_reset_token", data.reset_token);
      localStorage.setItem("stayleb_reset_token", data.reset_token);
      router.push(`/auth/reset-password?reset_token=${encodeURIComponent(data.reset_token)}&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    try {
      const { forgotPasswordRequest } = await import("@/services/api");
      await forgotPasswordRequest(email);
      setCountdown(45);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    }
  }

  return (
    <>
      <main className="w-full min-h-screen bg-surface flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="min-h-screen w-full flex flex-col lg:flex-row bg-surface">
            <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-20 py-8 lg:py-12 bg-surface-container-lowest shadow-sm z-10">
              <div className="flex items-center justify-between w-full mb-8 lg:mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
                    <Icon name="cottage" className="material-symbols-outlined text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">StayLeb</span>
                    <span className="font-caption text-caption text-outline uppercase tracking-widest mt-0.5">Lebanon Stays</span>
                  </div>
                </div>
                <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-1.5 font-label-md text-label-md text-white hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-surface-container-low">
                  <Icon name="arrow_back" className="material-symbols-outlined text-[18px]" />
                  <span>Back</span>
                </button>
              </div>

              <div className="max-w-md w-full mx-auto my-auto flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container w-fit mb-6">
                  <Icon name="verified_user" className="material-symbols-outlined text-[16px]" />
                  <span className="font-label-sm text-label-sm font-semibold tracking-wide">Two-Step Security</span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-3">Enter verification code</h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
                  We&apos;ve sent a 6-digit code to your email address <span className="font-semibold text-on-surface">{email || "your email"}</span>. Please enter it below to confirm your identity.
                </p>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error-container rounded-xl text-white mb-4">
                    <Icon name="error" className="material-symbols-outlined text-[20px] text-error" />
                    <span className="font-body-md text-body-md">{error}</span>
                  </div>
                )}

                <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">6-Digit Security PIN</label>
                    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                          key={idx}
                          ref={(el) => { inputsRef.current[idx] = el; }}
                          className="otp-digit w-12 h-14 sm:w-14 sm:h-14 text-center font-headline-md text-headline-md font-semibold text-white bg-surface-container-low rounded-xl focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#157375] transition-all"
                          inputMode="numeric"
                          maxLength={1}
                          pattern="[0-9]*"
                          type="text"
                          required
                          value={digits[idx]}
                          onChange={(e) => handleChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          aria-label={`Digit ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="font-body-md text-body-md text-on-surface-variant">Didn&apos;t receive code?</span>
                    <button type="button" onClick={handleResend} disabled={countdown > 0} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-on-surface font-label-sm text-label-sm ${countdown > 0 ? "bg-surface-container cursor-not-allowed" : "bg-surface-container-low hover:bg-surface-container cursor-pointer"}`}>
                      <Icon name="timer" className="material-symbols-outlined text-[16px] text-outline" />
                      <span>{countdown > 0 ? `Resend in 00:${String(countdown).padStart(2, "0")}` : "Resend code"}</span>
                    </button>
                  </div>

                  <button type="submit" disabled={loading} className="w-full h-12 bg-primary-container hover:bg-primary text-white font-headline-sm text-[16px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    <span>{loading ? "Verifying..." : "Verify Code"}</span>
                    {!loading && <Icon name="arrow_forward" className="material-symbols-outlined text-[20px]" />}
                  </button>
                </form>

                <div className="mt-8 pt-6 flex items-center justify-center gap-2 text-on-surface-variant font-label-md text-label-md">
                  <span>Having trouble?</span>
                  <button type="button" onClick={() => router.push("/auth/forgot-password")} className="text-primary font-semibold hover:underline bg-transparent p-0 m-0">Try another verification way</button>
                </div>
              </div>

              <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-outline font-caption text-caption gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon name="lock" className="material-symbols-outlined text-[15px] text-primary" />
                  <span>End-to-end encrypted protocol</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hover:text-on-surface transition-colors">Privacy Policy</span>
                  <span>·</span>
                  <span className="hover:text-on-surface transition-colors">Terms of Service</span>
                  <span>·</span>
                  <span>StayLeb Inc. © 2025</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden min-h-screen">
              <LocalImage alt="Sunlit Lebanese mountain stone chalet bedroom in Chouf with rustic vaulted wood ceiling beams, crisp linen bed, and scenic valley view through wooden arched windows" className="absolute inset-0 w-full h-full object-cover object-center" src="/images/eb00a81ba37214ca.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/30 via-transparent to-transparent"></div>
              <div className="absolute top-10 right-10 z-20">
                <div className="flex items-center gap-2 bg-inverse-surface/60 backdrop-blur-md px-4 py-2 rounded-full text-surface-container-lowest shadow-md">
                  <Icon name="pin_drop" className="material-symbols-outlined text-[18px] text-secondary-fixed" />
                  <span className="font-label-sm text-label-sm font-medium tracking-wide">Beit el Qamar · Deir el Qamar</span>
                </div>
              </div>
              <div className="absolute bottom-12 left-12 right-12 z-20">
                <div className="bg-surface/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name="shield_person" className="material-symbols-outlined text-[26px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface">Verified Identity Protocol</span>
                        <span className="bg-surface-container-highest text-white font-caption text-caption px-2 py-0.5 rounded-full uppercase tracking-wider">Fast-Track</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-snug">Instant access restoration for travelers and hosts across 450+ Lebanese boutique properties and heritage guesthouses.</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="inline-block h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-caption text-[11px] font-bold">LB</div>
                      <div className="inline-block h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center font-caption text-[11px] font-bold">99%</div>
                    </div>
                    <span className="font-label-sm text-label-sm font-medium text-on-surface pl-1">Safe Host Guarantee</span>
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
