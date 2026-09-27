"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { apiFetch } from "@/services/api";
import { commissionSchema } from "@/lib/validations/admin";

export function CommissionSettingsSection0() {
  const [settings, setSettings] = useState<{ commission_percentage: string; currency: string } | null>(null);
  const [rate, setRate] = useState("10.0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/settings");
      setSettings(data);
      setRate(String(data.commission_percentage));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const val = parseFloat(rate);
    const parsed = commissionSchema.safeParse({ commission_percentage: val, justification: "admin update via dashboard" });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid commission value";
      setError(msg);
      return;
    }
    if (isNaN(val) || val < 0 || val > 100) {
      setError("Commission must be between 0 and 100");
      return;
    }
    setSaving(true);
    try {
      const data = await apiFetch("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ commission_percentage: parsed.data.commission_percentage }),
      });
      setSettings(data);
      setSuccess(`Commission updated to ${parsed.data.commission_percentage}%`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const previewRate = parseFloat(rate) || 0;
  const examplePrice = 200;
  const commission = (examplePrice * previewRate) / 100;
  const owner = examplePrice - commission;

  return (
    <>
      <div className="">
        <main className="w-full pt-6 px-gutter-lg py-space-lg min-h-screen bg-surface-container-low">
          <div className="flex flex-col w-full">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
              <div className="flex flex-col max-w-2xl">
                <div className="flex items-center gap-space-xs font-caption text-caption uppercase text-primary font-semibold tracking-wider mb-space-xxs">
                  <span>Fiscal Architecture</span>
                  <span>•</span>
                  <span>Global Engine</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-[#46B1B1] tracking-tight">Platform Commission Configuration</h1>
                <p className="font-body-md text-body-md text-[#46B1B1] mt-space-xxs">Configure standard marketplace commission rates captured on future bookings. Historical rates remain permanently fixed.</p>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">Loading…</div>
            ) : error && !settings ? (
              <div className="p-8 text-center text-error">{error}</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg items-start">
                <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center justify-between gap-space-sm mb-space-md">
                      <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span>Active · Live on All New Checkouts</span>
                      </div>
                      <span className="font-caption text-caption text-outline uppercase tracking-wider font-semibold">Standard Model</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline gap-space-xs md:gap-space-md mt-space-xs mb-space-lg">
                      <span className="font-display text-[64px] leading-none text-primary font-bold tracking-tight">{settings ? `${Number(settings.commission_percentage).toFixed(1)}%` : `${previewRate.toFixed(1)}%`}</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-[#46B1B1] font-semibold">Platform Commission Standard</span>
                        <span className="font-body-md text-body-md text-[#46B1B1]">Applied automatically at payment authorization</span>
                      </div>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-space-md mb-space-lg">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="font-label-md text-label-md text-[#46B1B1] font-semibold">Effective Split Demonstration</span>
                        <span className="font-caption text-caption text-[#46B1B1]">Ref. $200.00 Nightly Base</span>
                      </div>
                      <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden flex mb-space-xs">
                        <div className="h-full bg-primary-container transition-all duration-500 rounded-l-full" style={{ width: `${previewRate}%` }}></div>
                        <div className="h-full bg-surface-dim transition-all duration-500 rounded-r-full" style={{ width: `${100 - previewRate}%` }}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-space-md pt-space-xxs">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-3 h-3 rounded bg-primary-container shrink-0"></div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-caption text-caption text-[#46B1B1]">StayLeb Platform Revenue</span>
                            <span className="font-label-md text-label-md font-bold text-primary">${commission.toFixed(2)} ({previewRate.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <div className="w-3 h-3 rounded bg-surface-dim shrink-0"></div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-caption text-caption text-[#46B1B1]">Chalet Host Retained</span>
                            <span className="font-label-md text-label-md font-bold text-[#46B1B1]">${owner.toFixed(2)} ({(100 - previewRate).toFixed(1)}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-md bg-surface-container-lowest flex items-center justify-between text-[#46B1B1]">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="history_edu" className="material-symbols-outlined text-[18px] text-outline" />
                      <span className="font-caption text-caption">Currency: <strong className="text-[#46B1B1]">{settings?.currency || "USD"}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <Icon name="tune" className="material-symbols-outlined text-primary text-[22px]" />
                      <h2 className="font-headline-sm text-headline-sm text-[#46B1B1] font-semibold">Update Commission Rate</h2>
                    </div>
                    <p className="font-body-md text-body-md text-[#46B1B1] mb-space-md">Adjust the baseline marketplace percentage. Changes activate immediately for all checkout attempts.</p>
                    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                      <div className="flex flex-col">
                        <label className="font-label-md text-label-md font-medium text-[#46B1B1] mb-space-xxs flex justify-between" htmlFor="rateInput">
                          <span>New Commission Rate Percentage (%)</span>
                          <span className="text-outline font-normal">Min 0 · Max 100</span>
                        </label>
                        <div className="flex items-center bg-surface-container-low rounded-lg p-1">
                          <button type="button" onClick={() => setRate((v) => String(Math.max(0, parseFloat(v) - 0.5)))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest text-[#46B1B1] hover:bg-primary hover:text-white shadow-sm transition-colors">
                            <Icon name="remove" className="material-symbols-outlined text-[18px]" />
                          </button>
                          <input className="w-full text-center bg-transparent font-headline-sm text-headline-sm text-primary font-semibold focus:outline-none" id="rateInput" max="100" min="0" step="0.1" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                          <button type="button" onClick={() => setRate((v) => String(Math.min(100, parseFloat(v) + 0.5)))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest text-[#46B1B1] hover:bg-primary hover:text-white shadow-sm transition-colors">
                            <Icon name="add" className="material-symbols-outlined text-[18px]" />
                          </button>
                        </div>
                      </div>
                      {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">{error}</div>}
                      {success && <div className="p-3 rounded-lg bg-secondary-container text-on-secondary-container text-sm">{success}</div>}
                      <button type="submit" disabled={saving} className="w-full min-h-[44px] bg-primary hover:bg-primary/90 text-white font-label-md font-medium rounded-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                        <Icon name="save" className="material-symbols-outlined text-[20px]" />
                        <span>{saving ? "Saving…" : "Update Commission Rate"}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
