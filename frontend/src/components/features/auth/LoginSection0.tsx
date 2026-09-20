"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LocalImage } from "@/components/ui/LocalImage";
import { Icon } from "@/components/ui/Icon";
import { loginRequest, parseJwt } from "@/services/api";

export function LoginSection0() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(email.trim(), password);
      let payload = parseJwt(data.access_token) as { role?: string; sub?: string };
      let role = (payload.role as string) || "";

      // verify role via backend profile (source of truth) — fallback to JWT
      try {
        const { apiFetch } = await import("@/services/api");
        const me = await apiFetch("/users/me") as { role: string; id: number; full_name: string; email: string };
        if (me?.role) role = me.role;
        if (me?.id) payload.sub = String(me.id);
        if (me?.full_name) localStorage.setItem("stayleb_full_name", me.full_name);
        if (me?.email) localStorage.setItem("stayleb_email", me.email);
      } catch {
        // keep JWT role if /users/me fails (e.g. token propagation delay)
      }

      // persist role for quick UI decisions
      if (role) localStorage.setItem("stayleb_role", role.toLowerCase());
      if (payload.sub) localStorage.setItem("stayleb_user_id", String(payload.sub));

      // also keep demo flag for legacy guards
      sessionStorage.setItem("stayleb-demo-session", "true");
      window.dispatchEvent(new Event("stayleb-auth"));

      const r = role.toLowerCase();
      if (r === "admin") router.push("/admin");
      else if (r === "owner") router.push("/owner");
      else router.push("/account");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="w-full min-h-screen bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full min-h-[calc(100vh-2rem)] flex flex-col lg:flex-row items-stretch bg-surface-container-lowest overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-surface-container-lowest z-10">
              <div className="flex items-center justify-between w-full mb-8">
                <Link href="/" className="inline-flex items-center gap-2 focus:outline-none focus-visible:opacity-80 transition-opacity" aria-label="StayLeb home">
                  <LocalImage alt="StayLeb Logo" className="h-10 w-auto object-contain" src="/images/stayleb_brand_logo.png" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-white hover:text-white transition-colors py-1.5 px-3 rounded-full bg-surface-container hover:bg-surface-container-high">
                  <Icon name="arrow_back" className="material-symbols-outlined text-[16px]" />
                  <span>Back to Explore</span>
                </Link>
              </div>

              <div className="w-full max-w-md mx-auto my-auto flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container text-white font-label-sm text-label-sm mb-4">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>Welcome Back to StayLeb</span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">Sign in to StayLeb</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                  Enter your email and password to access your bookings, favorites, or property management.
                </p>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-error-container text-white flex items-start gap-3 shadow-sm">
                    <Icon name="error" className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-label-md text-label-md font-semibold text-error">Login failed</p>
                      <p className="font-caption text-caption text-on-error-container mt-0.5">{error}</p>
                    </div>
                    <button type="button" className="text-on-error-container hover:text-white p-0.5" onClick={() => setError(null)} aria-label="Dismiss error">
                      <Icon name="close" className="material-symbols-outlined text-[16px]" />
                    </button>
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="email">
                      <span>Email Address</span>
                    </label>
                    <div className="relative flex items-center">
                      <Icon name="mail" className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant pointer-events-none" />
                      <input
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="email"
                        name="email"
                        placeholder="name@example.com"
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                        Password
                      </label>
                      <Link className="font-label-sm text-label-sm text-white hover:text-primary-container font-semibold transition-colors" href="/auth/forgot-password">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <Icon name="lock" className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant pointer-events-none" />
                      <input
                        className="w-full h-11 pl-11 pr-11 rounded-xl bg-surface-container-low text-white placeholder:text-white font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                        id="password"
                        name="password"
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 text-white hover:text-white p-1 rounded-lg focus:outline-none"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        <Icon name={showPassword ? "visibility_off" : "visibility"} className="material-symbols-outlined text-[20px]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input className="w-4 h-4 rounded text-white focus:ring-primary focus:ring-offset-0 bg-surface-container-high cursor-pointer" id="remember" name="remember" type="checkbox" />
                      <span className="font-body-md text-body-md text-on-surface-variant">Remember this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-primary-container hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white font-label-md text-label-md font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{loading ? "Signing in..." : "Sign In"}</span>
                    {!loading && <Icon name="login" className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform" />}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Don&apos;t have an account? <Link className="font-semibold text-white hover:underline ml-1" href="/auth/role">Sign Up</Link>
                  </p>
                </div>
              </div>

              <div className="w-full pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-caption text-caption text-on-surface-variant">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="lock" className="material-symbols-outlined text-[14px] text-secondary" />
                    256-Bit SSL Encrypted
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="verified" className="material-symbols-outlined text-[14px] text-secondary" />
                    Lebanon Verified Escrow
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hover:text-on-surface transition-colors">Terms</span>
                  <span>•</span>
                  <span className="hover:text-on-surface transition-colors">Privacy</span>
                  <span>•</span>
                  <span className="hover:text-on-surface transition-colors">Help</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative min-h-[480px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                data-alt="Sunny Mediterranean stone coastal villa in Batroun Lebanon with a lush sea-view olive terrace, clear turquoise sea, authentic traditional Lebanese arches and limestone, high-end vacation rental photography"
                style={{ backgroundImage: 'url("/images/f27f13ff2e5685c8.jpg")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface/30 to-transparent"></div>

              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-white font-label-sm text-label-sm shadow-sm">
                  <Icon name="location_on" className="material-symbols-outlined text-[16px] text-primary" />
                  <span>Batroun Coastal Chalets, Lebanon</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-inverse-surface/60 backdrop-blur-md text-inverse-on-surface font-caption text-caption">
                  <Icon name="wb_sunny" className="material-symbols-outlined text-[14px] text-secondary-fixed" />
                  <span>27°C Golden Hour</span>
                </div>
              </div>

              <div className="relative z-10 self-end my-auto hidden lg:flex items-center gap-3 p-3 px-4 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md shadow-xl max-w-xs -mr-4 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white">
                  <Icon name="cabin" className="material-symbols-outlined text-[20px]" />
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface font-semibold">1,240+ Getaways</p>
                  <p className="font-caption text-caption text-on-surface-variant">From Batroun shorelines to Faraya peaks</p>
                </div>
              </div>

              <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl shadow-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-tertiary-container">
                    <Icon name="star" className="material-symbols-outlined text-[18px]" />
                    <Icon name="star" className="material-symbols-outlined text-[18px]" />
                    <Icon name="star" className="material-symbols-outlined text-[18px]" />
                    <Icon name="star" className="material-symbols-outlined text-[18px]" />
                    <Icon name="star" className="material-symbols-outlined text-[18px]" />
                  </div>
                  <span className="font-caption text-caption text-white bg-surface-container px-2.5 py-0.5 rounded-full">Verified Guest</span>
                </div>
                <blockquote className="font-title-md text-title-md text-on-surface font-medium italic leading-snug">
                  &ldquo;StayLeb made finding our summer mountain retreat in Faraya effortless and authentic.&rdquo;
                </blockquote>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-semibold text-label-sm">KF</div>
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-on-surface">The Khoury Family</p>
                      <p className="font-caption text-caption text-on-surface-variant">Beirut &amp; Mount Lebanon</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-caption text-caption font-semibold">
                    <Icon name="check_circle" className="material-symbols-outlined text-[16px]" />
                    <span>Chalet Reserved</span>
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
