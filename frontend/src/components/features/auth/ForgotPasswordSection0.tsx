"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { forgotPasswordRequest } from "@/services/api";

export function ForgotPasswordSection0() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordRequest(email.trim());
      // Store email for OTP step
      sessionStorage.setItem("stayleb_reset_email", email.trim());
      localStorage.setItem("stayleb_reset_email", email.trim());
      router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}&recovery=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="w-full min-h-screen bg-surface flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full min-h-[calc(100vh-2rem)] flex items-center justify-center p-0 md:p-6 lg:p-8">
            <div className="w-full max-w-7xl bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
              <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 bg-surface-container-lowest">
                <div className="flex items-center justify-between w-full">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                      <Icon name="cottage" className="material-symbols-outlined text-[20px]" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary leading-none">StayLeb</span>
                      <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider text-[9px] mt-0.5">Lebanon Stays &amp; Chalets</span>
                    </div>
                  </Link>
                  <Link href="/auth/login" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-white hover:bg-surface-container hover:text-white transition-all duration-200 font-label-md text-label-md group">
                    <Icon name="arrow_back" className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Login</span>
                  </Link>
                </div>

                <div className="w-full max-w-md mx-auto my-10 flex flex-col">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm mb-4">
                      <Icon name="lock_reset" className="material-symbols-outlined text-[15px]" />
                      <span>Account Recovery</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-3">Forgot your password?</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Enter the email address associated with your StayLeb account. We&apos;ll send a 6-digit verification code to reset your password.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-1.5 pt-1 text-error font-label-sm text-label-sm mb-2">
                      <Icon name="error" className="material-symbols-outlined text-[16px]" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                      <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="recovery-email">Registered Email</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-on-surface-variant/70 flex items-center pointer-events-none">
                          <Icon name="mail" className="material-symbols-outlined text-[20px]" />
                        </span>
                        <input autoFocus className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-low text-white placeholder:text-white/50 font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#46B1B1] transition-all" id="recovery-email" name="email" placeholder="name@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full h-12 bg-primary-container hover:bg-primary active:scale-[0.99] text-white font-headline-sm text-label-md font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      <span>{loading ? "Sending..." : "Send Verification Code"}</span>
                      {!loading && <Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 flex flex-col items-center justify-center gap-2 text-center bg-surface-container-low/50 rounded-xl p-4">
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Remember your password? <Link className="font-label-md text-label-md font-semibold text-white hover:text-primary-container underline underline-offset-4 ml-1" href="/auth/login">Log In</Link>
                    </p>
                    <div className="flex items-center gap-2 font-caption text-caption text-on-surface-variant/75 mt-1">
                      <Icon name="shield" className="material-symbols-outlined text-[14px]" />
                      <span>Zero KYC required · Quick recovery guaranteed</span>
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between font-caption text-caption text-on-surface-variant/80 pt-4">
                  <span>© StayLeb Lebanon Ltd.</span>
                  <div className="flex items-center gap-4">
                    <span className="hover:text-primary transition-colors">Privacy</span>
                    <span>•</span>
                    <span className="hover:text-primary transition-colors">Terms of Service</span>
                    <span>•</span>
                    <span className="hover:text-primary transition-colors">Support Desk</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-6 relative bg-inverse-surface overflow-hidden min-h-[720px]">
                <LocalImage alt="Warm Lebanese mountain chalet living room corner with rustic stone fireplace, stacked bookshelf, vintage copper decor, and cozy leather reading chair" className="absolute inset-0 w-full h-full object-cover object-center" src="/images/1eea7d0eb4001c16.jpg" />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface/40 to-transparent"></div>
                <div className="absolute top-8 right-8 z-10">
                  <div className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                    <span className="font-label-sm text-label-sm font-medium text-on-surface">Faraya, Mount Lebanon</span>
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 right-8 z-10">
                  <div className="p-6 rounded-xl bg-surface-container-lowest/85 backdrop-blur-md shadow-xl text-white max-w-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-container text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon name="verified_user" className="material-symbols-outlined text-[24px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-headline-sm text-title-md font-bold text-on-surface">StayLeb Account Security</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-container text-on-secondary-container uppercase">Verified</span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-snug">256-bit encryption protecting client reservations and host listings across Lebanon.</p>
                        <div className="mt-3 flex items-center gap-4 text-on-surface-variant/80 font-caption text-caption">
                          <span className="flex items-center gap-1"><Icon name="check" className="material-symbols-outlined text-[14px] text-secondary" /> Instant SMS/Email token</span>
                          <span className="flex items-center gap-1"><Icon name="check" className="material-symbols-outlined text-[14px] text-secondary" /> No phone number required</span>
                        </div>
                      </div>
                    </div>
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
