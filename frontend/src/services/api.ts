const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stayleb_access_token");
}

let refreshPromise: Promise<string> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function getExpiryMs(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = parseJwt(token) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000 - Date.now();
  } catch { return null; }
}

function clearRefreshTimer() { if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; } }

export function scheduleAutoRefresh() {
  clearRefreshTimer();
  if (typeof window === "undefined") return;
  const token = getAccessToken();
  const ms = getExpiryMs(token);
  if (ms == null) return;
  if (ms <= 0) {
    // already expired -> try refresh now
    doRefresh().catch(() => {}).finally(() => scheduleAutoRefresh());
    return;
  }
  const delay = Math.max(ms - 2 * 60 * 1000, 30 * 1000);
  refreshTimer = setTimeout(async () => {
    try { await doRefresh(); } catch { /* will logout on next api call if fails */ }
    scheduleAutoRefresh();
  }, delay);
}

async function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.detail || "Session expired. Please log in again.";
      throw new Error(msg);
    }
    if (data.access_token) {
      localStorage.setItem("stayleb_access_token", data.access_token);
      if (data.token_type) localStorage.setItem("stayleb_token_type", data.token_type);
      try {
        const payload = parseJwt(data.access_token) as { role?: string };
        if (payload.role) localStorage.setItem("stayleb_role", String(payload.role).toLowerCase());
      } catch {}
      window.dispatchEvent(new Event("stayleb-auth"));
      return data.access_token as string;
    }
    throw new Error("Refresh failed");
  })();
  try {
    const token = await refreshPromise;
    // schedule next refresh after successful refresh
    if (typeof window !== "undefined") setTimeout(() => scheduleAutoRefresh(), 0);
    return token;
  } finally {
    refreshPromise = null;
  }
}

// auto-schedule on load / visibility change
if (typeof window !== "undefined") {
  // initial schedule after a tick
  setTimeout(() => scheduleAutoRefresh(), 1000);
  window.addEventListener("stayleb-auth", scheduleAutoRefresh);
  window.addEventListener("storage", scheduleAutoRefresh);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const ms = getExpiryMs(getAccessToken());
      if (ms != null && ms < 5 * 60 * 1000) scheduleAutoRefresh();
      // if token expired while hidden, refresh immediately
      if (ms != null && ms <= 0) doRefresh().catch(() => {});
    }
  });
  window.addEventListener("online", scheduleAutoRefresh);
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const isAuthEndpoint = endpoint.startsWith("/auth/");
  const makeRequest = async (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });
  };

  let token = getAccessToken();
  let response = await makeRequest(token);

  // If 401 and not an auth endpoint, try to refresh once and retry
  if (response.status === 401 && !isAuthEndpoint && token) {
    try {
      const newToken = await doRefresh();
      response = await makeRequest(newToken);
    } catch (e) {
      // refresh failed -> force logout to homepage
      const msg = e instanceof Error ? e.message : "Session expired";
      // only auto-redirect if not already on auth pages to avoid loop
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
        logoutLocal();
        sessionStorage.removeItem("stayleb-demo-session");
        window.dispatchEvent(new Event("stayleb-auth"));
        // Use location to avoid Next router dependency inside service
        window.location.href = "/auth/login?expired=1";
      }
      let detail = msg;
      try {
        const data = await response.clone().json();
        detail = data.detail || detail;
      } catch {}
      throw new Error(detail);
    }
  }

  if (!response.ok) {
    let detail = `API request failed: ${response.status}`;
    try {
      const data = await response.clone().json();
      // Handle FastAPI validation array
      const d = data.detail;
      if (Array.isArray(d)) detail = d.map((x: { msg?: string }) => x.msg || JSON.stringify(x)).join(", ");
      else detail = d || data.message || detail;
    } catch {}
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const d = data.detail;
    const msg = Array.isArray(d) ? d.map((x: { msg?: string; message?: string }) => x.msg || x.message || JSON.stringify(x)).join(", ") : typeof d === "string" ? d : JSON.stringify(d) || data.message || "Invalid email or password";
    throw new Error(msg);
  }

  if (data.access_token) {
    localStorage.setItem("stayleb_access_token", data.access_token);
    localStorage.setItem("stayleb_token_type", data.token_type || "bearer");
    // schedule proactive refresh 2 minutes before expiry
    setTimeout(() => scheduleAutoRefresh(), 0);
  }

  return data as { access_token: string; token_type: string };
}

export function parseJwt(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return {};
  }
}

export function logoutLocal() {
  clearRefreshTimer();
  localStorage.removeItem("stayleb_access_token");
  localStorage.removeItem("stayleb_token_type");
  localStorage.removeItem("stayleb_role");
  localStorage.removeItem("stayleb_user_id");
}

export async function registerRequest(data: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: "client" | "owner";
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    // handle FastAPI validation array
    const detail = body.detail;
    const msg = Array.isArray(detail) ? detail.map((d: { msg: string }) => d.msg).join(", ") : detail || body.message || "Registration failed";
    throw new Error(msg);
  }
  return body;
}

export async function forgotPasswordRequest(email: string) {
  const clean = email.trim().toLowerCase();
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: clean }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const d = body.detail;
    const msg = Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg || JSON.stringify(x)).join(", ") : typeof d === "string" ? d : JSON.stringify(d) || "Failed to send reset code";
    // 422 is almost always invalid email format
    if (response.status === 422 && msg.includes("{}")) throw new Error("Please enter a valid email address (e.g. name@example.com)");
    throw new Error(msg);
  }
  return body;
}

export async function verifyOtpRequest(email: string, otp: string) {
  const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const d = body.detail;
    const msg = Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg || JSON.stringify(x)).join(", ") : typeof d === "string" ? d : JSON.stringify(d) || "Invalid OTP";
    throw new Error(msg);
  }
  return body as { message: string; reset_token: string };
}

export async function resetPasswordRequest(reset_token: string, new_password: string) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token, new_password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.detail;
    const msg = Array.isArray(detail) ? detail.map((d: { msg: string }) => d.msg).join(", ") : detail || body.message || "Reset failed";
    throw new Error(msg);
  }
  return body;
}

export async function changePasswordRequest(current_password: string, new_password: string) {
  const res = await apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });
  return res;
}

export async function logoutRequest() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  logoutLocal();
  sessionStorage.removeItem("stayleb-demo-session");
}

export async function refreshRequest() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || "Refresh failed");
  if (body.access_token) {
    localStorage.setItem("stayleb_access_token", body.access_token);
  }
  return body;
}