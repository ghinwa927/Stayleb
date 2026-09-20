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
import { useStoredValue } from "@/hooks/useStoredValue";
import { Logo } from "@/components/ui/Logo";
import { BackToLogin, SubmitButton, FormMessage } from "./AuthForms";
import { verifyOtpRequest, forgotPasswordRequest } from "@/services/api";

export function VerifyForm() {
  const storedEmailHyphen = useStoredValue("stayleb-reset-email", "", "session");
  const storedEmailUnderscore = useStoredValue("stayleb_reset_email", "", "session");
  const emailFromStore = storedEmailUnderscore || storedEmailHyphen;
  // also check URL query param
  const searchEmail = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") || "" : "";
  const email = emailFromStore || searchEmail;
  const router = useRouter();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]),
    [remaining, setRemaining] = useState(600),
    [cooldown, setCooldown] = useState(0),
    [attempts, setAttempts] = useState(0),
    [error, setError] = useState(""),
    [sent, setSent] = useState(true),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let until = Number(sessionStorage.getItem("stayleb-code-until"));
    if (!until) {
      until = Date.now() + 600000;
      sessionStorage.setItem("stayleb-code-until", String(until));
    }
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (Number(sessionStorage.getItem("stayleb-code-until")) -
              Date.now()) /
              1000,
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
    <div className="auth-inner verify-inner">
      <div className="auth-top">
        <Logo />
        <BackToLogin />
      </div>
      <h1>Check your email</h1>
      <p className="auth-description">
        Enter the 6-digit confirmation PIN sent to verify your identity.
      </p>
      <div className="notice email-notice">
        <MailCheck size={20} />
        <div>
          <p>
            If an account exists for this email, a reset code has been sent to{" "}
            <strong>{email}</strong>.
          </p>
          <Link href="/auth/forgot-password" className="change-email">
            Change Email <Pencil size={12} />
          </Link>
        </div>
      </div>
      {sent && (
        <div className="sent-message" role="status">
          <CheckCircle2 size={20} />
          <span>New 6-digit verification code sent successfully.</span>
          <button
            aria-label="Dismiss code sent message"
            onClick={() => setSent(false)}
          >
            <X size={17} />
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
      <form noValidate onSubmit={verify} className="auth-form">
        <fieldset disabled={attempts >= 5}>
          <legend className="otp-label">
            <span>Verification Code (6-digits)</span>
            <span>
              <Timer size={15} />
              Expires in{" "}
              <strong>
                {Math.floor(remaining / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(remaining % 60).toString().padStart(2, "0")}
              </strong>
            </span>
          </legend>
          <div className="otp-inputs">
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
              />
            ))}
          </div>
          <div className="otp-tip">
            <span>Tip: You can paste the full 6-digit code anywhere.</span>
            <span>Supports leading zeroes</span>
          </div>
        </fieldset>
        <SubmitButton busy={busy} disabled={attempts >= 5 || !remaining}>
          <ShieldCheck size={19} />
          Verify Code
        </SubmitButton>
        <div className="resend-row">
          <button
            type="button"
            disabled={cooldown > 0 || attempts >= 5}
            onClick={resend}
          >
            <RotateCw size={16} />
            {cooldown ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
          <span>Requests fresh code • Invalidates prior codes</span>
        </div>
        {attempts >= 5 && (
          <Link href="/auth/forgot-password" className="back-link">
            Start a new password reset <ArrowIcon />
          </Link>
        )}
      </form>
    </div>
  );
}
function ArrowIcon() {
  return <span aria-hidden="true">→</span>;
}
