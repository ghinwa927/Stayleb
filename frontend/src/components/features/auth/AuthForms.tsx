"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  User,
  Phone,
  Search,
  KeyRound,
  Shield,
  Send,
  CheckCircle2,
  Circle,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { LocalAction, useFeedback } from "@/components/ui/Feedback";
import {
  loginRequest,
  registerRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  parseJwt,
  apiFetch,
} from "@/services/api";

function emailIsValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function passwordRules(password: string, confirm: string) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password && password === confirm,
  ];
}

interface SubmitButtonProps {
  readonly busy: boolean;
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
}
export function SubmitButton({ busy, children, disabled }: SubmitButtonProps) {
  return (
    <button type="submit" className="primary-button" disabled={busy || disabled}>
      {busy ? (
        <>
          <LoaderCircle size={18} className="animate-spin" /> Please wait…
        </>
      ) : (
        children
      )}
    </button>
  );
}
export function BackToLogin({ className = "" }: { readonly className?: string }) {
  return (
    <Link className={`back-link ${className}`} href="/auth/login">
      <ArrowLeft size={16} />
      Back to Login
    </Link>
  );
}
export function FormMessage({ message, success }: { readonly message: string; readonly success?: boolean }) {
  return message ? (
    <div className={`form-message ${success ? "is-success" : ""}`} role={success ? "status" : "alert"}>
      {message}
    </div>
  ) : null;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    const next: Record<string, string> = {};
    if (!emailIsValid(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const data = await loginRequest(email.trim(), password);
      let payload = parseJwt(data.access_token) as { role?: string; sub?: string };
      let role = (payload.role as string) || "";
      try {
        const me = (await apiFetch("/users/me")) as { role: string; id: number; full_name: string; email: string };
        if (me?.role) role = me.role;
        if (me?.full_name) localStorage.setItem("stayleb_full_name", me.full_name);
      } catch {}
      if (role) localStorage.setItem("stayleb_role", role.toLowerCase());
      if (payload.sub) localStorage.setItem("stayleb_user_id", String(payload.sub));
      sessionStorage.setItem("stayleb-demo-session", "true");
      window.dispatchEvent(new Event("stayleb-auth"));
      setSuccess(true);
      const r = role.toLowerCase();
      const nextPath = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      setTimeout(() => {
        if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
          router.push(nextPath);
          return;
        }
        if (r === "admin") router.push("/admin");
        else if (r === "owner") router.push("/owner");
        else router.push("/account");
      }, 400);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Invalid email or password." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-split relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <Link href="/" aria-label="StayLeb home" className="mb-10 inline-block">
        <Image
          src="/images/stayleb_brand_logo.png"
          alt="StayLeb — Stays · People · Lebanon"
          width={220}
          height={120}
          className="h-20 w-auto object-contain"
          priority
        />
        <span className="mt-3 block text-[11px] font-semibold tracking-[0.32em] text-[#64748B]">
          STAYS · PEOPLE · LEBANON
        </span>
      </Link>
      <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Welcome back</h1>
      <p className="font-body-md text-body-md text-[#64748B] mt-2 mb-7">
        Log in to your StayLeb account and continue your next escape.
      </p>
      <FormMessage message={errors.form || ""} />
      <FormMessage success message={success ? "You’re logged in. Redirecting…" : ""} />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Field
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-semibold text-[#1E293B]">
              Password
            </label>
          </div>
        <div className="hide-field-label">
          <Field
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
        </div>
          <div className="forgot-row">
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#157375] transition-colors hover:text-[#46B1B1] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <label className="checkbox-label">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me on this device
        </label>
        <button
          type="submit"
          disabled={busy}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <LoaderCircle size={18} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Log In <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      {success && (
        <Link href="/" className="back-link centered mt-4">
          Explore Stays <ArrowRight size={16} />
        </Link>
      )}
      <div className="mt-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        <span className="text-sm font-medium tracking-widest text-[#94a3b8]">OR</span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      </div>
      <p className="mt-5 text-center font-body-md text-body-md text-[#64748B]">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
          Sign up <ArrowRight size={16} />
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ initialRole = "client" }: { readonly initialRole?: "client" | "owner" }) {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "owner">(initialRole);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [terms, setTerms] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  function update(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSuccess(false);
  }

  function validateStep1() {
    const next: Record<string, string> = {};
    if (!role) next.role = "Please select an account type.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2() {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Enter your full name.";
    if (!emailIsValid(values.email)) next.email = "Enter a valid email address.";
    if (!/^\d{7,8}$/.test(values.phone.replace(/[\s-]/g, ""))) next.phone = "Enter a valid Lebanese phone number (7–8 digits).";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep3() {
    const next: Record<string, string> = {};
    if (!passwordRules(values.password, values.confirm).filter((_, i) => i !== 1 && i !== 4).every(Boolean))
      next.password = "Use 8 or more characters, a number, and a special character.";
    if (!values.confirm || values.password !== values.confirm) next.confirm = "Passwords must match.";
    if (!terms) next.terms = "Please agree to the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateStep3()) return;
    setBusy(true);
    try {
      await registerRequest({
        full_name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim() ? `+961${values.phone.replace(/\D/g, "")}` : undefined,
        role,
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login?registered=1"), 1000);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Registration failed" });
    } finally {
      setBusy(false);
    }
  }

  function goToStep(nextStep: number) {
    if (nextStep === 2 && !validateStep1()) return;
    if (nextStep === 3 && !validateStep2()) return;
    setStep(nextStep);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  const stepLabels = [
    { num: 1, label: "Account Type", short: "Type" },
    { num: 2, label: "Personal Details", short: "Details" },
    { num: 3, label: "Security", short: "Security" },
  ];

  return (
    <div className="login-split relative z-10 mx-auto flex w-full max-w-[520px] flex-col h-full">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {stepLabels.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step > s.num
                    ? "bg-[#157375] text-white"
                    : step === s.num
                    ? "bg-[#157375] text-white ring-4 ring-[#157375]/20"
                    : "bg-white text-[#94a3b8] border border-[#E2E8F0]"
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 size={18} />
                ) : (
                  s.num
                )}
              </div>
              <span className={`text-[11px] font-semibold tracking-[0.15em] uppercase ${step >= s.num ? "text-[#157375]" : "text-[#94a3b8]"}`}>
                {s.short}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`hidden lg:block w-16 h-px mx-2 ${step > i + 1 ? "bg-[#157375]" : "bg-[#E2E8F0]"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="mb-6 text-center text-sm text-[#94a3b8]">Step {step} of 3</p>

      <Link href="/" aria-label="StayLeb home" className="mb-6 inline-block">
        <Image
          src="/images/stayleb_brand_logo.png"
          alt="StayLeb — Stays · People · Lebanon"
          width={220}
          height={120}
          className="h-16 w-auto object-contain"
          priority
        />
        <span className="mt-2 block text-[10px] font-semibold tracking-[0.32em] text-[#64748B]">
          STAYS · PEOPLE · LEBANON
        </span>
      </Link>

      {/* Step 1: Account Type */}
      {step === 1 && (
        <div className="flex flex-col flex-1">
          <div className="mb-6">
            <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">How will you use StayLeb?</h1>
            <p className="font-body-md text-body-md text-[#64748B] mt-2">Choose how you want to get started.</p>
          </div>
          <div className="role-selector mb-6 flex-1 flex flex-col justify-center">
            <div className="flex gap-3 h-full">
              <button
                type="button"
                aria-pressed={role === "client"}
                onClick={() => setRole("client")}
                className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 transition-all ${
                  role === "client"
                    ? "border-[#157375] bg-[#157375]/10 text-[#157375]"
                    : "border-[#E2E8F0] bg-white hover:border-[#46B1B1]/50 hover:bg-[#46B1B1]/[0.04]"
                }`}
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-[#157375]/10">
                  <Search size={28} className={role === "client" ? "text-[#157375]" : "text-[#64748B]" } />
                  {role === "client" && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#157375] text-white">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <strong className="block font-label-md text-label-md">Book stays</strong>
                  <small className="font-body-md text-body-md opacity-70">Client</small>
                </div>
              </button>
              <button
                type="button"
                aria-pressed={role === "owner"}
                onClick={() => setRole("owner")}
                className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 transition-all ${
                  role === "owner"
                    ? "border-[#157375] bg-[#157375]/10 text-[#157375]"
                    : "border-[#E2E8F0] bg-white hover:border-[#46B1B1]/50 hover:bg-[#46B1B1]/[0.04]"
                }`}
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-[#157375]/10">
                  <KeyRound size={28} className={role === "owner" ? "text-[#157375]" : "text-[#64748B]" } />
                  {role === "owner" && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#157375] text-white">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <strong className="block font-label-md text-label-md">Host a property</strong>
                  <small className="font-body-md text-body-md opacity-70">Owner</small>
                </div>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={!role || busy}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Step 2: Personal Details */}
      {step === 2 && (
        <form noValidate onSubmit={(e) => { e.preventDefault(); goToStep(3); }} className="flex flex-col flex-1">
          <div className="mb-6">
            <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Tell us about yourself</h1>
            <p className="font-body-md text-body-md text-[#64748B] mt-2">We'll use these details to set up your StayLeb account.</p>
          </div>
          <FormMessage message={errors.form || ""} />
          <div className="flex flex-col gap-4 flex-1">
            <Field
              id="full-name"
              label="Full name *"
              autoComplete="name"
              placeholder="e.g. Maya Haddad"
              icon={<User size={18} />}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name}
            />
            <Field
              id="register-email"
              label="Email address *"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              icon={<Mail size={18} />}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
            />
            <Field
              id="phone"
              label="Phone number *"
              type="tel"
              autoComplete="tel-national"
              placeholder="70 123 456"
              icon={<Phone size={18} />}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              error={errors.phone}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white font-label-md text-label-md font-semibold text-[#157375] shadow-sm transition-all hover:bg-[#F8FAFC] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Security */}
      {step === 3 && (
        <form noValidate onSubmit={submit} className="flex flex-col flex-1">
          <div className="mb-6">
            <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Secure your account</h1>
            <p className="font-body-md text-body-md text-[#64748B] mt-2">Create a password to finish setting up your account.</p>
          </div>
          <FormMessage success message={success ? "Account created! Redirecting to login…" : ""} />
          <FormMessage message={errors.form || ""} />
          <div className="flex flex-col gap-4 flex-1">
            <Field
              id="register-password"
              label="Password *"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              error={errors.password}
              hint="Must be at least 8 characters with 1 number & 1 special character."
            />
            <Field
              id="confirm-password"
              label="Confirm password *"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={values.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              error={errors.confirm}
            />
            <div>
              <label className="checkbox-label terms">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                <span>
                  I agree to the StayLeb <LocalAction message="Terms of Service are not available in this preview.">Terms of Service</LocalAction> and{" "}
                  <LocalAction message="This preview stores only local demo preferences; no data is sent to a server.">Privacy Policy</LocalAction>.
                </span>
              </label>
              {errors.terms && (
                <p className="field-error" role="alert">
                  {errors.terms}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white font-label-md text-label-md font-semibold text-[#157375] shadow-sm transition-all hover:bg-[#F8FAFC] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" /> Creating Account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-[#94a3b8]">
        <LockKeyhole size={13} />
        Secured with 256-bit encryption
      </div>
      <p className="mt-4 text-center font-body-md text-body-md text-[#64748B]">
        Already have an account?{" "}
        <Link href="/auth/login" className="inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
          Log in <ArrowRight size={16} />
        </Link>
      </p>
    </div>
  );
}

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailIsValid(email)) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await forgotPasswordRequest(email.trim());
      sessionStorage.setItem("stayleb_reset_email", email.trim());
      localStorage.setItem("stayleb_reset_email", email.trim());
      router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-split relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <Link href="/" aria-label="StayLeb home" className="mb-10 inline-block">
        <Image
          src="/images/stayleb_brand_logo.png"
          alt="StayLeb — Stays · People · Lebanon"
          width={220}
          height={120}
          className="h-20 w-auto object-contain"
          priority
        />
        <span className="mt-3 block text-[11px] font-semibold tracking-[0.32em] text-[#64748B]">
          STAYS · PEOPLE · LEBANON
        </span>
      </Link>
      <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Forgot your password?</h1>
      <p className="font-body-md text-body-md text-[#64748B] mt-2 mb-7">
        Enter your email and we'll send you a reset code.
      </p>
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Field
          id="reset-email"
          label="Email address *"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <div className="notice">
          <Shield size={18} />
          <p>
            <strong>Privacy Notice:</strong> If an active StayLeb account exists for this address, a reset code has been generated.
          </p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <LoaderCircle size={18} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send Reset Code <Send size={17} />
            </>
          )}
        </button>
      </form>
      <div className="mt-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        <span className="text-sm font-medium tracking-widest text-[#94a3b8]">OR</span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      </div>
      <p className="mt-5 text-center font-body-md text-body-md text-[#64748B]">
        Remember your password?{" "}
        <Link href="/auth/login" className="inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
          Log in <ArrowRight size={16} />
        </Link>
      </p>
      <p className="mt-6 text-center flex items-center justify-center gap-1.5 text-[12px] text-[#94a3b8]">
        <LockKeyhole size={13} />
        Secured with 256-bit encryption
      </p>
    </div>
  );
}

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [expired, setExpired] = useState(false);
  const rules = passwordRules(password, confirm);

  // Get reset_token from storage or query param. These are browser-only
  // sources, so read them after mount: server and first client render both
  // see the stable "" initial state (no hydration mismatch), and calling
  // setState here — rather than during render — avoids an infinite loop.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("reset_token") || sessionStorage.getItem("stayleb_reset_token") || localStorage.getItem("stayleb_reset_token") || "";
      setToken(t);
      if (!t) {
        const until = Number(sessionStorage.getItem("stayleb-reset-until"));
        if (sessionStorage.getItem("stayleb-reset-complete") === "true" || (until > 0 && Date.now() > until)) setExpired(true);
      }
    } catch {
      // storage unavailable — keep the stable fallback state
    }
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (expired) return;
    if (!token) {
      setError("Missing reset token. Please restart from Forgot Password.");
      return;
    }
    if (!rules.every(Boolean)) {
      setError("Please meet all password requirements before continuing.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await resetPasswordRequest(token, password);
      sessionStorage.setItem("stayleb-reset-complete", "true");
      sessionStorage.removeItem("stayleb_reset_token");
      localStorage.removeItem("stayleb_reset_token");
      router.push("/auth/reset-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-split relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <Link href="/" aria-label="StayLeb home" className="mb-10 inline-block">
        <Image
          src="/images/stayleb_brand_logo.png"
          alt="StayLeb — Stays · People · Lebanon"
          width={220}
          height={120}
          className="h-20 w-auto object-contain"
          priority
        />
        <span className="mt-3 block text-[11px] font-semibold tracking-[0.32em] text-[#64748B]">
          STAYS · PEOPLE · LEBANON
        </span>
      </Link>
      {expired ? (
        <>
          <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Session Expired</h1>
          <p className="font-body-md text-body-md text-[#64748B] mt-2 mb-7">
            Your reset session is unavailable or has expired. Request a new code to continue.
          </p>
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99]"
          >
            Restart Password Reset <ArrowRight size={18} />
          </button>
        </>
      ) : (
        <>
          <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Create a new password</h1>
          <p className="font-body-md text-body-md text-[#64748B] mt-2 mb-7">
            Enter and confirm your new password to restore account access.
          </p>
          <form noValidate onSubmit={submit} className="flex flex-col gap-5">
            <Field
              id="new-password"
              label="New Password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              icon={<KeyRound size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error && rules[0] === false ? "Password does not meet requirements" : undefined}
            />
            <Field
              id="new-confirm-password"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={confirm && password !== confirm ? "Passwords do not match. Please re-enter." : undefined}
            />
            <div className="password-rules bg-[#F2FAFA] border border-[#157375]/20 rounded-xl p-4">
              <strong className="block font-label-md text-label-md text-[#1E293B] mb-3">Password Requirements</strong>
              <ul className="space-y-2">
                {["At least 8 characters", "At least one uppercase letter (A-Z)", "At least one number (0-9)", "At least one special character (!@#$%^&*)", "Passwords must match"].map((label, i) => (
                  <li key={label} className={`flex items-center gap-2 text-sm font-body-md text-body-md ${rules[i] ? "text-[#157375]" : "text-[#64748B]"}`}>
                    {rules[i] ? (
                      <CheckCircle2 size={16} className="text-[#157375]" />
                    ) : (
                      <Circle size={16} className="text-[#94a3b8]" />
                    )}
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <FormMessage message={error} />
            <button
              type="submit"
              disabled={busy}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="animate-spin" style={{ animation: "spin 1s linear infinite" }}>
                    <LoaderCircle size={18} />
                  </span>
                  Resetting…
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </>
      )}
      <div className="mt-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        <span className="text-sm font-medium tracking-widest text-[#94a3b8]">OR</span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      </div>
      <p className="mt-5 text-center font-body-md text-body-md text-[#64748B]">
        Remember your password?{" "}
        <Link href="/auth/login" className="inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
          Log in <ArrowRight size={16} />
        </Link>
      </p>
      <p className="mt-6 text-center flex items-center justify-center gap-1.5 text-[12px] text-[#94a3b8]">
        <LockKeyhole size={13} />
        Secured with 256-bit encryption
      </p>
    </div>
  );
}
