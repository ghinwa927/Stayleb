"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { registerRequest } from "@/services/api";

export function ClientRegistrationAuthFlowSection0() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    const terms = (document.getElementById("termsCheckbox") as HTMLInputElement)?.checked;
    if (!terms) {
      setError("You must agree to Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const phoneFormatted = phone.trim() ? `+961${phone.replace(/\D/g, "")}` : undefined;
      await registerRequest({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phoneFormatted,
        role: "client",
      });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/auth/login?registered=1"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="w-full min-h-screen bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-col lg:flex-row min-h-screen">
            <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-12 md:px-16 lg:px-20 py-8 lg:py-12 bg-surface-container-lowest z-10">
              <div className="flex items-center justify-between w-full mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-sm">
                    <Icon name="cabin" className="material-symbols-outlined text-on-primary text-[24px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">StayLeb</span>
                    <span className="font-caption text-caption text-outline tracking-wider uppercase">Authentic Escapes</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-white font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>Client Account
                </span>
              </div>

              <div className="w-full max-w-xl mx-auto my-auto flex flex-col">
                <div className="mb-8">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-bold tracking-tight">Create Your Client Account</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Join StayLeb to reserve authentic stays, save your favorite chalets, and manage your trips across Lebanon.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-error-container text-white flex items-start gap-2">
                    <Icon name="error" className="material-symbols-outlined text-[20px] text-error shrink-0" />
                    <p className="font-label-sm text-label-sm flex-1">{error}</p>
                    <button type="button" onClick={() => setError(null)} className="p-1"><Icon name="close" className="material-symbols-outlined text-[16px]" /></button>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-2">
                    <Icon name="check_circle" className="material-symbols-outlined text-[20px] shrink-0" />
                    <p className="font-label-sm text-label-sm flex-1">{success}</p>
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="client-fullName">Full Name</label>
                    <div className="relative flex items-center">
                      <Icon name="person" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="client-fullName" className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" placeholder="e.g., Maya Haddad" required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="client-email">Email Address</label>
                    <div className="relative flex items-center">
                      <Icon name="mail" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="client-email" className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" placeholder="maya@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="client-phone">Phone Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none select-none">
                        <span aria-label="Lebanon" className="text-base" role="img">🇱🇧</span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">+961</span>
                        <span className="w-[1px] h-4 bg-outline-variant ml-1"></span>
                      </div>
                      <input id="client-phone" className="w-full h-11 pl-24 pr-4 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" placeholder="70 123 456" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="client-password">Password</label>
                      <Link className="font-label-sm text-label-sm text-white hover:underline font-semibold focus:outline-none" href="/auth/forgot-password">Forgot Password?</Link>
                    </div>
                    <div className="relative flex items-center">
                      <Icon name="lock" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="client-password" className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" placeholder="••••••••" required type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 text-outline hover:text-on-surface focus:outline-none" aria-label="Toggle password">
                        <Icon name={showPass ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden flex gap-1">
                        <div className={`h-full w-1/4 rounded-full transition-colors duration-300 ${password.length >= 1 ? "bg-error" : "bg-surface-variant"}`}></div>
                        <div className={`h-full w-1/4 rounded-full transition-colors duration-300 ${password.length >= 4 ? "bg-amber-500" : "bg-surface-variant"}`}></div>
                        <div className={`h-full w-1/4 rounded-full transition-colors duration-300 ${password.length >= 8 ? "bg-secondary" : "bg-surface-variant"}`}></div>
                        <div className={`h-full w-1/4 rounded-full transition-colors duration-300 ${/[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8 ? "bg-primary" : "bg-surface-variant"}`}></div>
                      </div>
                      <div className="flex justify-between items-center text-caption font-caption text-outline">
                        <span>{!password ? "Enter minimum 8 characters" : password.length < 8 ? "Weak — add uppercase & number" : "Strong password"}</span>
                        <span className="text-tertiary font-semibold flex items-center gap-1"><Icon name="shield" className="material-symbols-outlined text-[13px]" /> Protected</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="client-confirm">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Icon name="verified_user" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="client-confirm" className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" placeholder="••••••••" required type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 text-outline hover:text-on-surface focus:outline-none" aria-label="Toggle confirm password">
                        <Icon name={showConfirm ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input className="mt-1 w-5 h-5 rounded-md text-white accent-primary bg-surface-container-low focus:ring-0 cursor-pointer" id="termsCheckbox" required type="checkbox" />
                    <label className="font-body-md text-body-md text-on-surface-variant leading-tight select-none" htmlFor="termsCheckbox">
                      I agree to StayLeb <span className="text-primary font-semibold">Terms of Service</span> and <span className="text-primary font-semibold">Privacy Policy</span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="w-full h-12 mt-3 rounded-xl bg-primary-container text-white font-title-md text-title-md font-semibold shadow-md hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed">
                    <span>{loading ? "Creating Account..." : "Create Client Account"}</span>
                    {!loading && <Icon name="arrow_forward" className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1" />}
                  </button>
                </form>

                <div className="w-full text-center py-4 mt-6">
                  <p className="font-body-md text-body-md text-on-surface-variant">Already have an account? <Link className="text-white font-label-md text-label-md font-semibold hover:underline ml-1" href="/auth/login">Sign In</Link></p>
                  <p className="mt-2 text-caption font-caption text-outline">Looking to host? <Link className="text-white font-semibold hover:underline ml-0.5" href="/auth/register/owner">List your property</Link></p>
                </div>
              </div>
              <div className="hidden">
                <button type="button" className="hidden" id="resetFlowDrawer" />
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative flex flex-col justify-between p-8 sm:p-12 md:p-16 overflow-hidden min-h-[500px] lg:min-h-screen">
              <div className="absolute inset-0 bg-cover bg-center" data-alt="Inviting Lebanese mountain chalet living room interior, stone fireplace with burning cedar wood, artisanal textiles, warm lighting, cozy armchair and mountain vista through windows" style={{ backgroundImage: 'url("/images/d6e9d06bca80e2c8.jpg")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-inverse-surface/30"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
                  <Icon name="landscape" className="material-symbols-outlined text-primary text-[18px]" />
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">Faqra &amp; Mount Lebanon</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
                  <Icon name="star" className="material-symbols-outlined text-amber-500 text-[18px]" />
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">4.96 Host Rating</span>
                </div>
              </div>
              <div className="relative z-10 max-w-md my-auto">
                <div className="p-6 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-xl flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                      <Icon name="coffee" className="material-symbols-outlined text-on-secondary-container text-[26px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md text-on-surface font-semibold">Curated Hospitality</span>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-snug">Fresh mountain air, artisanal cedar craftsmanship, and traditional Lebanese breakfast prepared upon sunrise.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-surface-container-high flex items-center justify-center text-xs font-bold text-white">KL</div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-primary-fixed-dim flex items-center justify-center text-xs font-bold text-on-primary-fixed">RN</div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-xs font-bold text-on-secondary-fixed">ZB</div>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant font-medium">3,400+ authentic stays reserved</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex flex-col gap-3">
                <blockquote className="font-headline-md text-headline-md text-surface-container-lowest font-semibold tracking-tight max-w-lg drop-shadow-md">&quot;From snow-capped peaks in Cedars to tranquil coastal retreats in Batroun, find Lebanon&apos;s best hideaways.&quot;</blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-primary-fixed rounded-full"></div>
                  <p className="font-label-md text-label-md text-surface-variant font-medium">StayLeb Verified Chalet Collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
