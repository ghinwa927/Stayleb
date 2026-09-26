export const DEMO_CODE = "849201";
export const DEMO_EMAIL = "rami.khoury@beirutmail.com";
export const DEMO_PASSWORD = "ChaletSummer2025!";
export const emailIsValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const passwordRules = (password: string, confirm: string) => [
  password.length >= 8,
  /[A-Z]/.test(password),
  /[0-9]/.test(password),
  /[^A-Za-z0-9\s]/.test(password),
  password.length > 0 && password === confirm,
];
export const pause = (ms = 550) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
export function saveResetEmail(email: string) {
  sessionStorage.setItem("stayleb-reset-email", email);
  sessionStorage.setItem("stayleb-code-until", String(Date.now() + 600000));
  sessionStorage.removeItem("stayleb-reset-complete");
}
export function getResetEmail() {
  return (
    sessionStorage.getItem("stayleb-reset-email") || "rami.khoury@k-tech.lb"
  );
}

// Demo credentials live only in this browser tab. Never persist a raw password.
interface DemoAccount {
  email: string;
  passwordDigest: string;
}
async function digest(password: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function saveDemoAccount(email: string, password: string) {
  const account: DemoAccount = {
    email: email.trim().toLowerCase(),
    passwordDigest: await digest(password),
  };
  sessionStorage.setItem("stayleb-demo-account", JSON.stringify(account));
}
export async function checkDemoAccount(email: string, password: string) {
  const raw = sessionStorage.getItem("stayleb-demo-account");
  if (raw) {
    try {
      const account: DemoAccount = JSON.parse(raw);
      if (account.email === email.trim().toLowerCase())
        return account.passwordDigest === (await digest(password));
    } catch {
      sessionStorage.removeItem("stayleb-demo-account");
    }
  }
  return (
    email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
  );
}
