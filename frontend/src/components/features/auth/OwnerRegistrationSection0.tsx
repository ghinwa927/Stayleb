"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { registerRequest } from "@/services/api";

export function OwnerRegistrationSection0() {
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
      setError("Passwords do not match.");
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
        role: "owner",
      });
      setSuccess("Owner account created! Redirecting to login...");
      setTimeout(() => router.push("/auth/login?registered=1"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="w-full min-h-screen bg-surface flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surface">
            <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 max-w-2xl mx-auto w-full">
              <div className="w-full">
                <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                      <Icon name="villa" className="material-symbols-outlined text-[24px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">StayLeb</span>
                      <span className="font-caption text-caption text-outline uppercase tracking-wider">Host Portal</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm">
                    <Icon name="shield" className="material-symbols-outlined text-[15px]" />Host &amp; Owner Account
                  </span>
                </div>

                <div className="space-y-2 mb-8">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Create Your Owner Account</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
                    Join StayLeb to list your chalet or furnished house, set seasonal rates, and welcome travelers from around the world.
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

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="owner-fullName">Full Legal Name</label>
                    <div className="relative flex items-center">
                      <Icon name="person" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="owner-fullName" className="w-full h-12 pl-11 pr-4 bg-surface-container-lowest rounded-xl font-body-md text-body-md text-white placeholder:text-white focus:outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-sm" placeholder="e.g. Tony Karam" required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="owner-email">Email Address</label>
                    <div className="relative flex items-center">
                      <Icon name="mail" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="owner-email" className="w-full h-12 pl-11 pr-4 bg-surface-container-lowest rounded-xl font-body-md text-body-md text-white placeholder:text-white focus:outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-sm" placeholder="tony@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="owner-phone">Telephone Number</label>
                    <div className="flex items-center gap-2">
                      <div className="h-12 px-3.5 bg-surface-container-lowest rounded-xl flex items-center gap-2 shadow-sm shrink-0">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">+961</span>
                      </div>
                      <div className="relative flex-1">
                        <input id="owner-phone" className="w-full h-12 px-4 bg-surface-container-lowest rounded-xl font-body-md text-body-md text-white placeholder:text-white focus:outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-sm" placeholder="70 987 654" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="owner-password">Password</label>
                      <span className="font-caption text-caption text-outline">Min. 8 characters</span>
                    </div>
                    <div className="relative flex items-center">
                      <Icon name="lock" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="owner-password" className="w-full h-12 pl-11 pr-11 bg-surface-container-lowest rounded-xl font-body-md text-body-md text-white placeholder:text-white focus:outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-sm" placeholder="Create strong password" required type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility" className="absolute right-3.5 text-outline hover:text-on-surface transition-colors p-1">
                        <Icon name={showPass ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="owner-confirm">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Icon name="lock_reset" className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                      <input id="owner-confirm" className="w-full h-12 pl-11 pr-11 bg-surface-container-lowest rounded-xl font-body-md text-body-md text-white placeholder:text-white focus:outline-none focus:bg-surface-container-low focus:ring-2 focus:ring-primary transition-colors shadow-sm" placeholder="Confirm your password" required type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password visibility" className="absolute right-3.5 text-outline hover:text-on-surface transition-colors p-1">
                        <Icon name={showConfirm ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input className="mt-1 w-4 h-4 rounded text-primary focus:ring-0 accent-primary" required type="checkbox" />
                      <span className="font-body-md text-body-md text-on-surface-variant select-none">I agree to the <span className="text-primary font-label-md hover:underline">StayLeb Host Terms of Service</span> and <span className="text-primary font-label-md hover:underline">Marketplace Conduct Standards</span>.</span>
                    </label>
                  </div>

                  <div className="pt-3">
                    <button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary-container active:scale-[0.99] text-white font-label-md text-label-md font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed">
                      <span>{loading ? "Creating Account..." : "Create Owner Account"}</span>
                      {!loading && <Icon name="arrow_forward" className="material-symbols-outlined text-[18px]" />}
                    </button>
                  </div>
                </form>

                <div className="mt-6 p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
                  <Icon name="info" className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-label-md text-label-md text-on-surface font-semibold">Immediate Setup</p>
                    <p className="font-caption text-caption text-on-surface-variant">After registration, access your Owner Dashboard to add properties. Financial details and identity records are managed securely only when payouts commence.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-transparent text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="font-body-md text-body-md text-on-surface-variant">Already have an account? <Link className="text-white font-semibold hover:underline ml-1" href="/auth/login">Log In</Link></p>
                <span className="font-caption text-caption text-outline">© StayLeb Technologies</span>
              </div>
            </div>

            <div className="hidden lg:relative lg:col-span-6 lg:flex flex-col justify-end p-10 xl:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" data-alt="Authentic traditional boutique Lebanese mountain stone guesthouse entrance at dusk with carved cedar wooden double doors, warm glowing ambient lanterns on weathered limestone, potted geraniums and olive trees, scenic view of Mount Lebanon terraces under twilight crescent moon" style={{ backgroundImage: "url('/images/81024e8176b5012f.jpg')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent"></div>
              <div className="relative z-10 self-start mb-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-md text-white font-label-sm text-label-sm">
                  <Icon name="location_on" className="material-symbols-outlined text-primary text-[18px]" />Faraya Mountain Heights, Lebanon
                </div>
              </div>
              <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white">
                      <Icon name="verified_user" className="material-symbols-outlined text-[18px]" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Host Standing &amp; Protection</p>
                      <p className="font-caption text-caption text-on-surface-variant">StayLeb Host Guarantee Covered</p>
                    </div>
                  </div>
                  <div className="flex items-center text-tertiary">
                    <Icon name="star" className="material-symbols-outlined text-[16px]" />
                    <Icon name="star" className="material-symbols-outlined text-[16px]" />
                    <Icon name="star" className="material-symbols-outlined text-[16px]" />
                    <Icon name="star" className="material-symbols-outlined text-[16px]" />
                    <Icon name="star" className="material-symbols-outlined text-[16px]" />
                  </div>
                </div>
                <blockquote className="font-body-md text-body-md text-on-surface italic mb-4 leading-relaxed">&ldquo;Listing our mountain retreat on StayLeb was seamless. Fair seasonal rates and verified guests gave us complete peace of mind.&rdquo;</blockquote>
                <div className="flex items-center justify-between pt-3 border-t border-transparent bg-surface-container-low/50 px-3.5 py-2.5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-white font-semibold flex items-center justify-center text-[13px]">TK</div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Tony K.</p>
                      <p className="font-caption text-caption text-on-surface-variant">Faraya Superhost • 4 Chalets</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-primary font-label-sm text-label-sm font-semibold">99.4% Occupancy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
