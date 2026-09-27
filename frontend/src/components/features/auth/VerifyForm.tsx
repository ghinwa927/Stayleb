"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MailCheck,
  Pencil,
  CheckCircle2,
  X,
  Timer,
  ShieldCheck,
  RotateCw,
} from "lucide-react";
import Image from "next/image";
import { BackToLogin, FormMessage } from "./AuthForms";
import { verifyOtpRequest, forgotPasswordRequest } from "@/services/api";

export function VerifyForm() {
  // Email lives in browser-only sources (sessionStorage / URL query string),
  // which don't exist during SSR. Keep the initial render stable ("" on both
  // server and first client render) and hydrate it inside useEffect so the
  // server HTML and the first client render always match.
  const [email, setEmail] = useState("");
  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("stayleb_reset_email") ||
        sessionStorage.getItem("stayleb-reset-email") ||
        "";
      const query = new URLSearchParams(window.location.search).get("email") || "";
      setEmail(stored || query);
    } catch {
      // storage unavailable (e.g. private mode) — keep the stable fallback
    }
  }, []);
  const router = useRouter();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [remaining, setRemaining] = useState(600);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The 10-minute window mirrors the backend OTP expiry. A timestamp left
    // over from a previous visit would be in the past and would wrongly block
    // a fresh code, so treat a missing OR stale value as a fresh window.
    // The backend remains the source of truth for real expiry.
    let until = Number(sessionStorage.getItem("stayleb-code-until"));
    if (!until || until <= Date.now()) {
      until = Date.now() + 600000;
      sessionStorage.setItem("stayleb-code-until", String(until));
    }
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (Number(sessionStorage.getItem("stayleb-code-until")) - Date.now()) / 1000,
          ),
        ),
      );
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function enter(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const numeric = value.slice(-1);
    setDigits((old) => old.map((v, i) => (i === index ? numeric : v)));
    setError("");
    if (numeric && index < 5) inputs.current[index + 1]?.focus();
  }

  function paste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const value = e.clipboardData.getData("text").replace(/\s/g, "");
    if (!/^\d{6}$/.test(value)) {
      setError("Paste a complete 6-digit numeric code.");
      return;
    }
    setDigits(value.split(""));
    setError("");
    inputs.current[5]?.focus();
  }

  function keyboard(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((old) => old.map((v, i) => (i === index - 1 ? "" : v)));
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!remaining) {
      setError("Code expired. Request a new code below.");
      return;
    }
    if (attempts >= 5) return;
    if (digits.join("").length !== 6) {
      setError("Enter all six digits.");
      inputs.current[digits.findIndex((v) => !v)]?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await verifyOtpRequest(email, digits.join(""));
      sessionStorage.setItem("stayleb_reset_token", res.reset_token);
      localStorage.setItem("stayleb_reset_token", res.reset_token);
      sessionStorage.setItem("stayleb-reset-until", String(Date.now() + 900000));
      sessionStorage.removeItem("stayleb-reset-complete");
      router.push(`/auth/reset-password?reset_token=${encodeURIComponent(res.reset_token)}`);
    } catch (err) {
      setAttempts((a) => a + 1);
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    try {
      await forgotPasswordRequest(email);
      sessionStorage.setItem("stayleb-code-until", String(Date.now() + 600000));
      setRemaining(600);
      setCooldown(30);
      setDigits(["", "", "", "", "", ""]);
      setSent(true);
      setError("");
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
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
      <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight">Check your email</h1>
      <p className="font-body-md text-body-md text-[#64B1B1] mt-2 mb-7">
        Enter the 6-digit confirmation PIN sent to verify your identity.
      </p>
      <div className="notice email-notice mb-6">
        <MailCheck size={20} className="text-[#157375]" />
        <div className="flex-1">
          <p className="font-body-md text-body-md text-[#64748B]">
            If an account exists for this email, a reset code has been sent to{" "}
            <strong className="text-[#1E293B]">{email}</strong>.
          </p>
          <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#157375] hover:underline inline-flex items-center gap-1 mt-2">
            Change Email <Pencil size={12} />
          </Link>
        </div>
      </div>
      {sent && (
        <div className="sent-message mb-6 flex items-center gap-2 p-3 bg-[#ECFDF5] text-[#065F46] rounded-xl" role="status">
          <CheckCircle2 size={18} />
          <span className="font-body-md text-body-md">New 6-digit verification code sent successfully.</span>
          <button
            aria-label="Dismiss code sent message"
            onClick={() => setSent(false)}
            className="ml-auto p-1 rounded hover:bg-[#D1FAE5]"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <FormMessage
        message={
          error ||
          (!remaining
            ? "Code expired (10-minute window elapsed). Request a new code below."
            : "")
        }
      />
      <form noValidate onSubmit={verify} className="flex flex-col gap-5">
        <fieldset disabled={attempts >= 5}>
          <legend className="text-sm font-semibold text-[#1E293B] mb-3">
            Verification Code (6-digits)
          </legend>
          <div className="flex gap-2 mb-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                aria-label={`Verification code digit ${index + 1}`}
                aria-invalid={!!error}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                value={digit}
                onChange={(e) => enter(index, e.target.value)}
                onPaste={paste}
                onKeyDown={(e) => keyboard(e, index)}
                onFocus={(e) => e.target.select()}
                className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-xl transition-all ${
                  error
                    ? "border-red-400 bg-red-50"
                    : digit
                    ? "border-[#157375] bg-[#157375]/5"
                    : "border-[#E2E8F0] hover:border-[#46B1B1]/50"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-[#64748B] mb-4">
            <span>Tip: You can paste the full 6-digit code anywhere. Supports leading zeroes.</span>
            <div className="flex items-center gap-1.5 text-[#157375]">
              <Timer size={14} />
              <strong>
                {Math.floor(remaining / 60).toString().padStart(2, "0")}:{(remaining % 60).toString().padStart(2, "0")}
              </strong>
            </div>
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={busy || attempts >= 5 || !remaining}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="animate-spin" style={{ animation: "spin 1s linear infinite" }}>
                <ShieldCheck size={19} />
              </span>
              Verifying…
            </>
          ) : (
            <>
              <ShieldCheck size={19} />
              Verify Code
            </>
          )}
        </button>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={cooldown > 0 || attempts >= 5 || busy}
            onClick={resend}
            className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white font-label-md text-label-md font-semibold text-[#157375] shadow-sm transition-all hover:bg-[#F8FAFC] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCw size={16} />
            {cooldown ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
          <span className="text-sm text-[#94a3b8] text-center">Requests fresh code • Invalidates prior codes</span>
        </div>
        {attempts >= 5 && (
          <Link href="/auth/forgot-password" className="text-center inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
            Start a new password reset <span aria-hidden="true">→</span>
          </Link>
        )}
      </form>
      <div className="mt-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        <span className="text-sm font-medium tracking-widest text-[#94a3b8]">OR</span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      </div>
      <p className="mt-5 text-center font-body-md text-body-md text-[#64748B]">
        Remember your password?{" "}
        <Link href="/auth/login" className="inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
          Log in <span aria-hidden="true">→</span>
        </Link>
      </p>
      <p className="mt-6 text-center flex items-center justify-center gap-1.5 text-[12px] text-[#94a3b8]">
        <span style={{ width: 13, height: 13, display: "inline-block" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        Secured with 256-bit encryption
      </p>
    </div>
  );
}