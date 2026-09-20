"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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
      setTimeout(() => {
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
    <div className="auth-inner login-inner">
      <Logo />
      <h1>Welcome back</h1>
      <p className="auth-description">Log in to your StayLeb account.</p>
      <FormMessage message={errors.form || ""} />
      <FormMessage success message={success ? "You’re logged in. Redirecting…" : ""} />
      <form noValidate onSubmit={submit} className="auth-form login-form">
        <Field
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Field
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          action={<Link href="/auth/forgot-password">Forgot password?</Link>}
        />
        <label className="checkbox-label">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me on this device
        </label>
        <SubmitButton busy={busy}>Log In</SubmitButton>
      </form>
      {success && (
        <Link href="/" className="back-link centered mt-4">
          Explore Stays <ArrowRight size={16} />
        </Link>
      )}
      <p className="auth-bottom">
        Don&apos;t have an account? <Link href="/auth/register">Sign up</Link>
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
  function update(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSuccess(false);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Enter your full name.";
    if (!emailIsValid(values.email)) next.email = "Enter a valid email address.";
    if (!/^\d{7,8}$/.test(values.phone.replace(/[\s-]/g, ""))) next.phone = "Enter a valid Lebanese phone number (7–8 digits).";
    if (!passwordRules(values.password, values.confirm).filter((_, i) => i !== 1 && i !== 4).every(Boolean))
      next.password = "Use 8 or more characters, a number, and a special character.";
    if (!values.confirm || values.password !== values.confirm) next.confirm = "Passwords must match.";
    if (!terms) next.terms = "Please agree to the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;
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
  return (
    <div className="auth-inner register-inner">
      <Logo variant="registration" />
      <h1>Create your account</h1>
      <p className="auth-description">Join StayLeb to discover stays or host your property.</p>
      <div className="account-options">
        <p>I want to</p>
        <div>
          <button type="button" aria-pressed={role === "client"} className={role === "client" ? "selected" : ""} onClick={() => setRole("client")}>
            <Search size={21} />
            <span>
              <strong>Book stays</strong>
              <small>Client</small>
            </span>
          </button>
          <button type="button" aria-pressed={role === "owner"} className={role === "owner" ? "selected" : ""} onClick={() => setRole("owner")}>
            <KeyRound size={21} />
            <span>
              <strong>Host a property</strong>
              <small>Owner</small>
            </span>
          </button>
        </div>
      </div>
      <FormMessage success message={success ? "Account created! Redirecting to login…" : ""} />
      <FormMessage message={errors.form || ""} />
      <form noValidate onSubmit={submit} className="auth-form register-form">
        <Field
          id="full-name"
          label="Full name *"
          autoComplete="name"
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
          icon={<Mail size={18} />}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />
        <div className="phone-row">
          <span className="country-code" aria-label="Lebanon country code">
            LB +961
          </span>
          <Field
            id="phone"
            label="Phone number *"
            type="tel"
            autoComplete="tel-national"
            icon={<Phone size={18} />}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
          />
        </div>
        <Field
          id="register-password"
          label="Password *"
          type="password"
          autoComplete="new-password"
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
        <SubmitButton busy={busy}>
          Create Account <ArrowRight size={18} />
        </SubmitButton>
      </form>
      <p className="register-bottom">
        Already have an account? <Link href="/auth/login">Log in</Link>
      </p>
      <p className="encryption">
        <LockKeyhole size={14} />
        Secured with 256-bit encryption
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
    <>
      <div className="auth-inner forgot-inner">
        <div className="auth-top">
          <Logo />
          <BackToLogin />
        </div>
        <div className="section-icon">
          <LockKeyhole size={23} />
        </div>
        <h1>Forgot your password?</h1>
        <p className="auth-description">Enter your verified email address to request a secure password reset code.</p>
        <form noValidate onSubmit={submit} className="auth-form">
          <Field
            id="reset-email"
            label="Email address *"
            type="email"
            autoComplete="email"
            icon={<Mail size={19} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <div className="notice">
            <Shield size={20} />
            <p>
              <strong>Privacy Notice:</strong> If an active StayLeb account exists for this address, a reset code has been generated.
            </p>
          </div>
          <SubmitButton busy={busy}>
            Send Reset Code <Send size={17} />
          </SubmitButton>
        </form>
        <BackToLogin className="centered mt-6" />
      </div>
      <div className="auth-small-footer">
        <span>
          <i />
          Beirut Server v2.4
        </span>
        <span>
          <LocalAction>Host Guidelines</LocalAction> • <LocalAction message="For this demo, check your email for the 6-digit code.">Support</LocalAction>
        </span>
      </div>
    </>
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
  // try to get reset_token from storage (set by VerifyForm) or query param
  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("reset_token") || sessionStorage.getItem("stayleb_reset_token") || localStorage.getItem("stayleb_reset_token") || "";
      setToken(t);
      if (!t) {
        // Check old session expiry logic
        const until = Number(sessionStorage.getItem("stayleb-reset-until"));
        if (sessionStorage.getItem("stayleb-reset-complete") === "true" || (until > 0 && Date.now() > until)) setExpired(true);
      }
    }
  });
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
    <div className="auth-inner reset-inner">
      <div className="auth-top">
        <Logo variant="partner" />
        <span className="pill">● 15m Session Active</span>
      </div>
      <span className="verified-pill">
        <CheckCircle2 size={16} />
        Code Verified • 15-Minute Reset Session Active
      </span>
      <h1>Create a new password</h1>
      <p className="auth-description">Enter and confirm your new password to restore account access.</p>
      {expired ? (
        <div className="form-message" role="alert">
          <strong>Session Expired</strong>
          <p>Your reset session is unavailable or has expired. Request a new code to continue.</p>
          <Link href="/auth/forgot-password" className="back-link mt-3">
            Restart Password Reset
          </Link>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="auth-form">
          <Field
            id="new-password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            icon={<KeyRound size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <div className="password-rules">
            <strong>Password Requirements</strong>
            <ul>
              {["At least 8 characters", "At least one uppercase letter (A-Z)", "At least one number (0-9)", "At least one special character (!@#$%^&*)", "Passwords must match"].map((label, i) => (
                <li key={label} className={rules[i] ? "met" : ""}>
                  {rules[i] ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <FormMessage message={error} />
          <SubmitButton busy={busy}>Reset Password <ArrowRight size={17} /></SubmitButton>
        </form>
      )}
      <BackToLogin className="centered mt-6" />
    </div>
  );
}
