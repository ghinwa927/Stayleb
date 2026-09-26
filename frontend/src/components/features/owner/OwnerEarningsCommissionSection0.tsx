"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getMyProperties, type PropertyResponse } from "@/services/owner";
import {
  getOwnerEarnings,
  getOwnerEarningsLedger,
  type OwnerEarningsLedgerResponse,
  type OwnerEarningsResponse,
  type OwnerDecimal,
} from "@/services/ownerEarnings";
import {
  getOwnerSettlements,
  getOwnerSettlementStats,
  type OwnerSettlementListResponse,
  type OwnerSettlementStatsResponse,
} from "@/services/ownerSettlements";

type OwnerTab = "overview" | "ledger" | "settlements";
type SettlementFilter = "all" | "unpaid" | "paid";

const LEDGER_PAGE_SIZE = 20;
const SETTLEMENT_PAGE_SIZE = 20;
const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatMoney(value: OwnerDecimal | null | undefined) {
  const numericValue = Number(value ?? 0);
  return moneyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

function parseDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const parsed = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: string | null | undefined) {
  if (typeof value !== "string" || !value.trim()) return "—";
  const parsed = parseDate(value);
  if (!parsed) return "—";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPeriod(value: string) {
  if (typeof value !== "string" || !value.trim()) return "—";
  if (/^\d{4}-\d{2}$/.test(value)) {
    const parsed = parseDate(`${value}-01`);
    if (parsed) return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return formatDate(value);
}

function formatNullable(value: string | null | undefined) {
  if (typeof value !== "string" || !value.trim()) return "—";
  return value.trim();
}

function formatStatus(value: string) {
  if (typeof value !== "string" || !value.trim()) return "—";
  const normalized = value.trim().replaceAll("_", " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function formatCount(value: number) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? String(numericValue) : "0";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function bookingStatusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "confirmed" || normalized === "completed" || normalized === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (normalized === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  if (normalized === "rejected") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function paymentStatusClass(status: string | null) {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (normalized === "failed" || normalized === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  if (normalized === "refunded" || normalized === "partially_refunded") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function settlementStatusClass(status: "unpaid" | "paid") {
  return status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200";
}

function KpiCard({
  label,
  value,
  detail,
  icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone?: "teal" | "amber" | "slate";
}) {
  const iconClass = tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "slate" ? "bg-surface-container-high text-on-surface-variant" : "bg-surface-container-high text-primary";
  const valueClass = tone === "amber" ? "text-amber-700" : tone === "slate" ? "text-on-surface" : "text-primary";
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[150px] border border-primary/5">
      <div className="flex items-start justify-between gap-space-xs">
        <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon name={icon} className="material-symbols-outlined text-[18px]" />
        </span>
      </div>
      <div className="mt-space-md">
        <div className={`font-headline-lg text-headline-lg tracking-tight font-bold ${valueClass}`}>{value}</div>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{detail}</p>
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="p-12 flex flex-col items-center gap-3">
      <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-8 text-center">
      <Icon name="error" className="material-symbols-outlined text-rose-400 text-[28px] mb-2" />
      <p className="text-sm text-rose-600">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Retry</button>
    </div>
  );
}

function EmptyState({ title, description, icon = "inbox" }: { title: string; description: string; icon?: string }) {
  return (
    <div className="p-10 text-center">
      <Icon name={icon} className="material-symbols-outlined text-[34px] text-primary/50 mb-2" />
      <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>
      <p className="text-sm text-on-surface-variant mt-1">{description}</p>
    </div>
  );
}

function StatusBadge({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>{label}</span>;
}

function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  recordLabel,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  recordLabel: string;
}) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 1;
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safeTotalPages = Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 0;
  const firstRecord = safeTotal > 0 ? (safePage - 1) * safePageSize + 1 : 0;
  const lastRecord = safeTotal > 0 ? Math.min(safePage * safePageSize, safeTotal) : 0;
  const lastPage = safeTotalPages > 0 ? safeTotalPages : 1;
  return (
    <div className="bg-surface-container-low px-space-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t">
      <div className="text-xs text-on-surface-variant">
        {safeTotal > 0 ? <>Showing <strong>{firstRecord}</strong> to <strong>{lastRecord}</strong> of <strong>{safeTotal}</strong> {recordLabel} · Page <strong>{safePage}</strong> of <strong>{lastPage}</strong></> : <>No {recordLabel}</>}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={safePage <= 1} onClick={() => onPageChange(Math.max(1, safePage - 1))} className="h-9 px-3 rounded-lg border border-[#46B1B1]/20 bg-white text-sm text-primary hover:bg-surface-container disabled:bg-slate-100 disabled:text-on-surface-variant">
          Previous
        </button>
        <span className="text-xs text-on-surface-variant">Page {safePage} / {lastPage}</span>
        <button type="button" disabled={safeTotalPages === 0 || safePage >= safeTotalPages} onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))} className="h-9 px-3 rounded-lg border border-[#46B1B1]/20 bg-white text-sm text-primary hover:bg-surface-container disabled:bg-slate-100 disabled:text-on-surface-variant">
          Next
        </button>
      </div>
    </div>
  );
}

export function OwnerEarningsCommissionSection0() {
  const [activeTab, setActiveTab] = useState<OwnerTab>("overview");
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  const [overview, setOverview] = useState<OwnerEarningsResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewFromDate, setOverviewFromDate] = useState("");
  const [overviewToDate, setOverviewToDate] = useState("");
  const [overviewPropertyId, setOverviewPropertyId] = useState("");
  const [overviewGroupBy, setOverviewGroupBy] = useState<"" | "day" | "month">("month");
  const [overviewRefresh, setOverviewRefresh] = useState(0);

  const [ledger, setLedger] = useState<OwnerEarningsLedgerResponse | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerFromDate, setLedgerFromDate] = useState("");
  const [ledgerToDate, setLedgerToDate] = useState("");
  const [ledgerPropertyId, setLedgerPropertyId] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerRefresh, setLedgerRefresh] = useState(0);

  const [settlementStats, setSettlementStats] = useState<OwnerSettlementStatsResponse | null>(null);
  const [settlementStatsLoading, setSettlementStatsLoading] = useState(false);
  const [settlementStatsError, setSettlementStatsError] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<OwnerSettlementListResponse | null>(null);
  const [settlementsLoading, setSettlementsLoading] = useState(false);
  const [settlementsError, setSettlementsError] = useState<string | null>(null);
  const [settlementStatus, setSettlementStatus] = useState<SettlementFilter>("all");
  const [settlementSearchInput, setSettlementSearchInput] = useState("");
  const [settlementSearch, setSettlementSearch] = useState("");
  const [settlementPage, setSettlementPage] = useState(1);
  const [settlementRefresh, setSettlementRefresh] = useState(0);

  const overviewDateError = overviewFromDate && overviewToDate && overviewFromDate > overviewToDate ? "From date cannot be after To date." : null;
  const ledgerDateError = ledgerFromDate && ledgerToDate && ledgerFromDate > ledgerToDate ? "From date cannot be after To date." : null;
  const overviewFiltersActive = Boolean(overviewFromDate || overviewToDate || overviewPropertyId);
  const ledgerFiltersActive = Boolean(ledgerFromDate || ledgerToDate || ledgerPropertyId);
  const settlementFiltersActive = Boolean(settlementSearch || settlementStatus !== "all");

  useEffect(() => {
    let cancelled = false;
    async function loadProperties() {
      setPropertiesLoading(true);
      setPropertiesError(null);
      try {
        const result = await getMyProperties();
        if (!cancelled) setProperties(result);
      } catch (error) {
        if (!cancelled) {
          setProperties([]);
          setPropertiesError(getErrorMessage(error, "Failed to load properties"));
        }
      } finally {
        if (!cancelled) setPropertiesLoading(false);
      }
    }
    void loadProperties();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadOverview() {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const result = await getOwnerEarnings({
          from_date: overviewFromDate || undefined,
          to_date: overviewToDate || undefined,
          property_id: overviewPropertyId ? Number(overviewPropertyId) : undefined,
          group_by: overviewGroupBy || undefined,
        });
        if (!cancelled) setOverview(result);
      } catch (error) {
        if (!cancelled) {
          setOverview(null);
          setOverviewError(getErrorMessage(error, "Failed to load owner earnings"));
        }
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    }
    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [overviewFromDate, overviewToDate, overviewPropertyId, overviewGroupBy, overviewRefresh]);

  useEffect(() => {
    if (activeTab !== "ledger") return;
    let cancelled = false;
    async function loadLedger() {
      setLedgerLoading(true);
      setLedgerError(null);
      try {
        const result = await getOwnerEarningsLedger({
          from_date: ledgerFromDate || undefined,
          to_date: ledgerToDate || undefined,
          property_id: ledgerPropertyId ? Number(ledgerPropertyId) : undefined,
          page: ledgerPage,
          page_size: LEDGER_PAGE_SIZE,
        });
        if (!cancelled) {
          setLedger(result);
          setLedgerPage(result.page);
        }
      } catch (error) {
        if (!cancelled) {
          setLedger(null);
          setLedgerError(getErrorMessage(error, "Failed to load earnings ledger"));
        }
      } finally {
        if (!cancelled) setLedgerLoading(false);
      }
    }
    void loadLedger();
    return () => {
      cancelled = true;
    };
  }, [activeTab, ledgerFromDate, ledgerToDate, ledgerPropertyId, ledgerPage, ledgerRefresh]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSettlementSearch(settlementSearchInput.trim());
      setSettlementPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [settlementSearchInput]);

  useEffect(() => {
    if (activeTab !== "settlements") return;
    let cancelled = false;
    async function loadSettlementStats() {
      setSettlementStatsLoading(true);
      setSettlementStatsError(null);
      try {
        const result = await getOwnerSettlementStats();
        if (!cancelled) setSettlementStats(result);
      } catch (error) {
        if (!cancelled) {
          setSettlementStats(null);
          setSettlementStatsError(getErrorMessage(error, "Failed to load settlement statistics"));
        }
      } finally {
        if (!cancelled) setSettlementStatsLoading(false);
      }
    }
    void loadSettlementStats();
    return () => {
      cancelled = true;
    };
  }, [activeTab, settlementRefresh]);

  useEffect(() => {
    if (activeTab !== "settlements") return;
    let cancelled = false;
    async function loadSettlements() {
      setSettlementsLoading(true);
      setSettlementsError(null);
      try {
        const result = await getOwnerSettlements({
          status: settlementStatus === "all" ? undefined : settlementStatus,
          search: settlementSearch || undefined,
          page: settlementPage,
          page_size: SETTLEMENT_PAGE_SIZE,
        });
        if (!cancelled) {
          setSettlements(result);
          setSettlementPage(result.page);
        }
      } catch (error) {
        if (!cancelled) {
          setSettlements(null);
          setSettlementsError(getErrorMessage(error, "Failed to load settlements"));
        }
      } finally {
        if (!cancelled) setSettlementsLoading(false);
      }
    }
    void loadSettlements();
    return () => {
      cancelled = true;
    };
  }, [activeTab, settlementStatus, settlementSearch, settlementPage, settlementRefresh]);

  function refreshActiveTab() {
    if (activeTab === "overview") setOverviewRefresh((value) => value + 1);
    if (activeTab === "ledger") setLedgerRefresh((value) => value + 1);
    if (activeTab === "settlements") {
      setSettlementRefresh((value) => value + 1);
      setSettlementPage(1);
    }
  }

  function clearOverviewFilters() {
    setOverviewFromDate("");
    setOverviewToDate("");
    setOverviewPropertyId("");
    setOverviewGroupBy("month");
  }

  function clearLedgerFilters() {
    setLedgerFromDate("");
    setLedgerToDate("");
    setLedgerPropertyId("");
    setLedgerPage(1);
  }

  function clearSettlementFilters() {
    setSettlementSearchInput("");
    setSettlementSearch("");
    setSettlementStatus("all");
    setSettlementPage(1);
  }

  const settlementEmptyTitle = settlementSearch
    ? "No search results"
    : settlementStatus === "unpaid"
      ? "No unpaid settlements"
      : settlementStatus === "paid"
        ? "No paid settlements"
        : "No settlements";

  const settlementEmptyDescription = settlementFiltersActive
    ? "Try changing the status or clearing your search to see more results."
    : "Commission settlement records will appear here when they are available.";

  return (
    <main className="w-full pt-6 min-h-screen bg-background">
      <div className="flex flex-col w-full">
        <div className="px-space-md sm:px-space-lg lg:px-margin-lg py-space-lg max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex flex-col gap-space-xxs">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <Link className="hover:text-primary transition-colors" href="/owner">Dashboard</Link>
                <Icon name="chevron_right" className="material-symbols-outlined text-[14px] text-outline" />
                <span className="text-on-surface font-semibold">Earnings / Commission</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">Earnings & Platform Commission</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">Review your earnings, booking-level financial activity, and commission settlement history.</p>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button type="button" onClick={refreshActiveTab} className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md hover:shadow-md transition-all">
                <Icon name="refresh" className="material-symbols-outlined text-[18px] text-primary" />
                <span>Refresh</span>
              </button>
              <button type="button" onClick={() => window.print()} className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md hover:shadow-md transition-all">
                <Icon name="download" className="material-symbols-outlined text-[18px] text-primary" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[16px] shadow-sm p-1 flex flex-col sm:flex-row gap-1" role="tablist" aria-label="Owner financial areas">
            {([
              { key: "overview", label: "Overview", icon: "analytics" },
              { key: "ledger", label: "Earnings Ledger", icon: "table_rows" },
              { key: "settlements", label: "Commission Settlements", icon: "account_balance_wallet" },
            ] as const).map((tab) => (
              <button
                type="button"
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`owner-${tab.key}-panel`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-xl font-label-md text-label-md transition-all ${activeTab === tab.key ? "bg-primary text-white font-semibold shadow-sm" : "text-primary hover:bg-surface-container"}`}
              >
                <Icon name={tab.icon} className="material-symbols-outlined text-[19px]" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <section id="owner-overview-panel" role="tabpanel" className="flex flex-col gap-space-lg">
              <div className="rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-title-md text-title-md text-on-surface">Earnings filters</h2>
                    <p className="text-sm text-on-surface-variant">Filter your financial summary by date range or property.</p>
                  </div>
                  <button type="button" onClick={clearOverviewFilters} className="self-start px-3 py-2 rounded-lg bg-surface-container text-primary text-sm font-medium hover:bg-surface-container-high">Clear filters</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label htmlFor="overview-from-date" className="text-xs font-semibold text-on-surface uppercase tracking-wider">From date</label>
                    <input id="overview-from-date" type="date" value={overviewFromDate} onChange={(event) => setOverviewFromDate(event.target.value)} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="md:col-span-3">
                    <label htmlFor="overview-to-date" className="text-xs font-semibold text-on-surface uppercase tracking-wider">To date</label>
                    <input id="overview-to-date" type="date" value={overviewToDate} onChange={(event) => setOverviewToDate(event.target.value)} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="md:col-span-4">
                    <label htmlFor="overview-property" className="text-xs font-semibold text-on-surface uppercase tracking-wider">Property</label>
                    <select id="overview-property" value={overviewPropertyId} disabled={propertiesLoading} onChange={(event) => setOverviewPropertyId(event.target.value)} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface-container">
                      <option value="">All Properties</option>
                      {properties.map((property) => <option key={property.id} value={String(property.id)}>{property.title} · {property.location}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="overview-group-by" className="text-xs font-semibold text-on-surface uppercase tracking-wider">Breakdown by</label>
                    <select id="overview-group-by" value={overviewGroupBy} onChange={(event) => setOverviewGroupBy(event.target.value as "" | "day" | "month")} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">No grouping</option>
                      <option value="day">Day</option>
                      <option value="month">Month</option>
                    </select>
                  </div>
                </div>
                {propertiesError && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Property options could not be loaded: {propertiesError}</p>}
                {overviewDateError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{overviewDateError}</p>}
              </div>

              {overviewError ? (
                <div className="rounded-[16px] bg-surface-container-lowest shadow-sm"><ErrorState message={overviewError} onRetry={() => setOverviewRefresh((value) => value + 1)} /></div>
              ) : overviewLoading ? (
                <div className="rounded-[16px] bg-surface-container-lowest shadow-sm"><LoadingState label="Loading owner earnings…" /></div>
              ) : overview ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                    <KpiCard label="Total Bookings" value={formatCount(overview.total_bookings)} detail="Booking Count" icon="receipt_long" tone="slate" />
                    <KpiCard label="Gross Revenue" value={formatMoney(overview.gross_revenue)} detail="Gross booking volume" icon="payments" />
                    <KpiCard label="StayLeb / Platform Commission" value={formatMoney(overview.platform_commission)} detail="Platform commission" icon="percent" />
                    <KpiCard label="Your Earnings" value={formatMoney(overview.owner_earnings)} detail="Owner earnings after commission" icon="savings" />
                    <KpiCard label="Stripe Revenue" value={formatMoney(overview.stripe_revenue)} detail="Stripe-collected revenue" icon="credit_card" tone="slate" />
                    <KpiCard label="Cash Revenue" value={formatMoney(overview.cash_revenue)} detail="Cash-collected revenue" icon="payments" tone="slate" />
                    <KpiCard label="Outstanding Cash Commission" value={formatMoney(overview.outstanding_cash_commission)} detail={`${formatCount(overview.pending_cash_commission_bookings)} pending cash commission bookings`} icon="pending_actions" tone="amber" />
                    <KpiCard label="Pending Cash Commission" value={formatCount(overview.pending_cash_commission_bookings)} detail="Bookings awaiting settlement" icon="hourglass_top" tone="amber" />
                  </div>

                  {overview.total_bookings === 0 && <div className="rounded-[16px] bg-surface-container-lowest shadow-sm"><EmptyState title={overviewFiltersActive ? "No earnings match these filters" : "No earnings yet"} description={overviewFiltersActive ? "Try a different date range or property to see backend results." : "Earnings will appear after clients book your properties."} icon="savings" /></div>}

                  <div className="rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-md">
                      <div>
                        <h2 className="font-title-md text-title-md text-on-surface">Booking status counts</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { label: "Pending", value: overview.booking_statuses.pending, className: "text-amber-700" },
                        { label: "Confirmed", value: overview.booking_statuses.confirmed, className: "text-emerald-700" },
                        { label: "Cancelled", value: overview.booking_statuses.cancelled, className: "text-rose-700" },
                        { label: "Rejected", value: overview.booking_statuses.rejected, className: "text-slate-600" },
                        { label: "Completed", value: overview.booking_statuses.completed, className: "text-primary" },
                      ].map((status) => <div key={status.label} className="rounded-xl bg-surface-container-low border border-primary/5 p-3 text-center"><div className={`font-headline-sm text-headline-sm font-bold ${status.className}`}>{formatCount(status.value)}</div><div className="text-xs text-on-surface-variant mt-1">{status.label}</div></div>)}
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-surface-container-lowest shadow-sm overflow-hidden">
                    <div className="p-space-md sm:p-space-lg pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h2 className="font-title-md text-title-md text-on-surface">Earnings breakdown</h2>
                          <p className="text-sm text-on-surface-variant">Historical breakdown of your earnings over time.</p>
                        </div>
                        <span className="text-xs text-on-surface-variant">{overview.breakdown.length} periods</span>
                      </div>
                    </div>
                    {overview.breakdown.length === 0 ? (
                      <EmptyState title="No breakdown data" description="No grouped earnings periods are available for the selected filters." icon="bar_chart" />
                    ) : (
                      <div className="overflow-x-auto mt-space-md">
                        <table className="w-full min-w-[720px] text-left border-collapse">
                          <thead><tr className="bg-surface-container text-on-surface-variant font-caption text-caption uppercase tracking-wider"><th className="py-3 px-4 font-semibold">Period</th><th className="py-3 px-4 font-semibold text-right">Bookings</th><th className="py-3 px-4 font-semibold text-right">Gross booking volume</th><th className="py-3 px-4 font-semibold text-right">Platform commission</th><th className="py-3 px-4 font-semibold text-right">Owner earnings</th></tr></thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {overview.breakdown.map((row, index) => <tr key={`${row.period}-${index}`} className="hover:bg-surface-container-low/50"><td className="py-3 px-4 font-medium text-primary">{formatPeriod(row.period)}</td><td className="py-3 px-4 text-right text-on-surface">{formatCount(row.total_bookings)}</td><td className="py-3 px-4 text-right font-medium text-on-surface">{formatMoney(row.gross_booking_volume)}</td><td className="py-3 px-4 text-right text-primary">{formatMoney(row.platform_commission)}</td><td className="py-3 px-4 text-right font-semibold text-emerald-700">{formatMoney(row.owner_earnings)}</td></tr>)}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </section>
          )}

          {activeTab === "ledger" && (
            <section id="owner-ledger-panel" role="tabpanel" className="flex flex-col gap-space-lg">
              <div className="rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-title-md text-title-md text-on-surface">Earnings ledger filters</h2>
                    <p className="text-sm text-on-surface-variant">View your detailed transaction history. All figures are final.</p>
                  </div>
                  <button type="button" onClick={clearLedgerFilters} className="self-start px-3 py-2 rounded-lg bg-surface-container text-primary text-sm font-medium hover:bg-surface-container-high">Clear filters</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3"><label htmlFor="ledger-from-date" className="text-xs font-semibold text-on-surface uppercase tracking-wider">From date</label><input id="ledger-from-date" type="date" value={ledgerFromDate} onChange={(event) => { setLedgerFromDate(event.target.value); setLedgerPage(1); }} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div className="md:col-span-3"><label htmlFor="ledger-to-date" className="text-xs font-semibold text-on-surface uppercase tracking-wider">To date</label><input id="ledger-to-date" type="date" value={ledgerToDate} onChange={(event) => { setLedgerToDate(event.target.value); setLedgerPage(1); }} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div className="md:col-span-6"><label htmlFor="ledger-property" className="text-xs font-semibold text-on-surface uppercase tracking-wider">Property</label><select id="ledger-property" value={ledgerPropertyId} disabled={propertiesLoading} onChange={(event) => { setLedgerPropertyId(event.target.value); setLedgerPage(1); }} className="w-full mt-1 h-11 px-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface-container"><option value="">All Properties</option>{properties.map((property) => <option key={property.id} value={String(property.id)}>{property.title} · {property.location}</option>)}</select></div>
                </div>
                {propertiesError && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Property options could not be loaded: {propertiesError}</p>}
                {ledgerDateError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{ledgerDateError}</p>}
              </div>

              <div className="rounded-[16px] bg-surface-container-lowest shadow-sm overflow-hidden">
                {ledgerError ? <ErrorState message={ledgerError} onRetry={() => setLedgerRefresh((value) => value + 1)} /> : ledgerLoading || !ledger ? <LoadingState label="Loading earnings ledger…" /> : ledger.items.length === 0 ? <EmptyState title={ledgerFiltersActive ? "No ledger entries match these filters" : "No ledger entries"} description={ledgerFiltersActive ? "Try changing the date range or property to see more backend records." : "Ledger entries will appear when booking financial data is available."} /> : (
                  <>
                    <div className="p-space-md sm:p-space-lg pb-0"><div className="flex items-center justify-between gap-3"><div><h2 className="font-title-md text-title-md text-on-surface">Earnings ledger</h2><p className="text-sm text-on-surface-variant">Booking-level revenue, commission, and owner earnings returned by the backend.</p></div><span className="text-xs text-on-surface-variant">{formatCount(ledger.total)} records</span></div></div>
                    <div className="overflow-x-auto mt-space-md"><table className="w-full min-w-[1180px] text-left border-collapse"><thead><tr className="bg-surface-container text-on-surface-variant font-caption text-caption uppercase tracking-wider"><th className="py-3 px-4 font-semibold">Booking</th><th className="py-3 px-4 font-semibold">Property</th><th className="py-3 px-4 font-semibold">Stay dates</th><th className="py-3 px-4 font-semibold text-center">Nights</th><th className="py-3 px-4 font-semibold">Booking status</th><th className="py-3 px-4 font-semibold">Payment method</th><th className="py-3 px-4 font-semibold">Payment status</th><th className="py-3 px-4 font-semibold text-right">Gross revenue</th><th className="py-3 px-4 font-semibold text-right">StayLeb commission</th><th className="py-3 px-4 font-semibold text-right">Your earnings</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{ledger.items.map((item) => <tr key={item.booking_id} className="hover:bg-surface-container-low/50"><td className="py-3 px-4"><Link href={`/owner/bookings/${item.booking_id}`} className="font-mono font-semibold text-primary hover:underline">#SL-{String(item.booking_id).padStart(4, "0")}</Link></td><td className="py-3 px-4"><div className="font-medium text-on-surface">{formatNullable(item.property_title)}</div><div className="text-xs text-on-surface-variant">Property #{formatCount(item.property_id)}</div></td><td className="py-3 px-4 whitespace-nowrap text-on-surface">{formatDate(item.check_in)} <span className="text-on-surface-variant">→</span> {formatDate(item.check_out)}</td><td className="py-3 px-4 text-center text-on-surface">{formatCount(item.number_of_nights)}</td><td className="py-3 px-4"><StatusBadge label={formatStatus(item.booking_status)} className={bookingStatusClass(item.booking_status)} /></td><td className="py-3 px-4"><StatusBadge label={formatNullable(item.payment_method)} className={paymentStatusClass(item.payment_status)} /></td><td className="py-3 px-4"><StatusBadge label={formatNullable(item.payment_status)} className={paymentStatusClass(item.payment_status)} /></td><td className="py-3 px-4 text-right font-medium text-on-surface">{formatMoney(item.gross_booking_volume)}</td><td className="py-3 px-4 text-right text-primary">{formatMoney(item.platform_commission)}</td><td className="py-3 px-4 text-right font-semibold text-emerald-700">{formatMoney(item.owner_earnings)}</td></tr>)}</tbody></table></div>
                    <Pagination page={ledger.page} pageSize={ledger.page_size} total={ledger.total} totalPages={ledger.total_pages} onPageChange={setLedgerPage} recordLabel="ledger entries" />
                  </>
                )}
              </div>
            </section>
          )}

          {activeTab === "settlements" && (
            <section id="owner-settlements-panel" role="tabpanel" className="flex flex-col gap-space-lg">
              <div className="rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg flex flex-col gap-3">
                <div className="flex items-center gap-space-xs"><Icon name="lock" className="material-symbols-outlined text-primary text-[20px]" /><div><h2 className="font-title-md text-title-md text-on-surface">Settlement history</h2><p className="text-sm text-on-surface-variant">Settlements are processed by StayLeb Admin. Owner accounts can only view settlement information.</p></div></div>
                {settlementStatsError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{settlementStatsError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <KpiCard label="Total Settlements" value={settlementStatsLoading ? "…" : settlementStats ? formatCount(settlementStats.total_settlements) : "Unavailable"} detail="All settlement records" icon="receipt_long" tone="slate" />
                  <KpiCard label="Outstanding Commission" value={settlementStatsLoading ? "…" : settlementStats ? formatMoney(settlementStats.outstanding_commission) : "Unavailable"} detail="Unpaid commission" icon="pending_actions" tone="amber" />
                  <KpiCard label="Settled Commission" value={settlementStatsLoading ? "…" : settlementStats ? formatMoney(settlementStats.settled_commission) : "Unavailable"} detail="Paid commission" icon="task_alt" />
                  <KpiCard label="Unpaid Settlements" value={settlementStatsLoading ? "…" : settlementStats ? formatCount(settlementStats.unpaid_count) : "Unavailable"} detail="Awaiting processing" icon="hourglass_top" tone="amber" />
                  <KpiCard label="Paid Settlements" value={settlementStatsLoading ? "…" : settlementStats ? formatCount(settlementStats.paid_count) : "Unavailable"} detail="Processed by Admin" icon="verified" tone="slate" />
                </div>
              </div>

              <div className="rounded-[16px] bg-surface-container-lowest shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                  <div>
                    <h2 className="font-title-md text-title-md text-on-surface">Settlement records</h2>
                    <p className="text-sm text-on-surface-variant">Filter your commission settlement records by status or search.</p>
                  </div>
                  <button type="button" onClick={clearSettlementFilters} className="self-start px-3 py-2 rounded-lg bg-surface-container text-primary text-sm font-medium hover:bg-surface-container-high">Clear filters</button>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:items-end">
                  <div className="flex items-center bg-surface-container p-1 rounded-xl self-start">
                    {(["all", "unpaid", "paid"] as const).map((status) => <button type="button" key={status} onClick={() => { setSettlementStatus(status); setSettlementPage(1); }} className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${settlementStatus === status ? "bg-white text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}>{formatStatus(status)}</button>)}
                  </div>
                  <div className="flex-1 relative">
                    <label htmlFor="settlement-search" className="text-xs font-semibold text-on-surface uppercase tracking-wider">Search</label>
                    <div className="relative mt-1"><Icon name="search" className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-outline" /><input id="settlement-search" type="search" value={settlementSearchInput} onChange={(event) => setSettlementSearchInput(event.target.value)} placeholder="Property, booking, or settlement ID" className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#46B1B1]/20 bg-white text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] bg-surface-container-lowest shadow-sm overflow-hidden">
                {settlementsError ? <ErrorState message={settlementsError} onRetry={() => setSettlementRefresh((value) => value + 1)} /> : settlementsLoading || !settlements ? <LoadingState label="Loading commission settlements…" /> : settlements.items.length === 0 ? <EmptyState title={settlementEmptyTitle} description={settlementEmptyDescription} /> : (
                  <>
                    <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left border-collapse"><thead><tr className="bg-surface-container text-on-surface-variant font-caption text-caption uppercase tracking-wider"><th className="py-3 px-4 font-semibold">Settlement ID</th><th className="py-3 px-4 font-semibold">Booking</th><th className="py-3 px-4 font-semibold">Property</th><th className="py-3 px-4 font-semibold text-right">Commission amount</th><th className="py-3 px-4 font-semibold">Status</th><th className="py-3 px-4 font-semibold">Created date</th><th className="py-3 px-4 font-semibold">Paid date</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{settlements.items.map((settlement) => <tr key={settlement.id} className="hover:bg-surface-container-low/50"><td className="py-3 px-4 font-mono font-semibold text-primary">#{formatCount(settlement.id)}</td><td className="py-3 px-4"><Link href={`/owner/bookings/${settlement.booking_id}`} className="font-mono font-semibold text-primary hover:underline">#SL-{String(settlement.booking_id).padStart(4, "0")}</Link></td><td className="py-3 px-4"><div className="font-medium text-on-surface">{formatNullable(settlement.property.title)}</div><div className="text-xs text-on-surface-variant">{formatNullable(settlement.property.location)}</div></td><td className="py-3 px-4 text-right font-semibold text-primary">{formatMoney(settlement.commission_amount)}</td><td className="py-3 px-4"><StatusBadge label={formatStatus(settlement.status)} className={settlementStatusClass(settlement.status)} /></td><td className="py-3 px-4 text-xs text-on-surface-variant">{formatDate(settlement.created_at)}</td><td className="py-3 px-4 text-xs text-on-surface-variant">{settlement.paid_at ? formatDate(settlement.paid_at) : "—"}</td></tr>)}</tbody></table></div>
                    <Pagination page={settlements.page} pageSize={settlements.page_size} total={settlements.total} totalPages={settlements.total_pages} onPageChange={setSettlementPage} recordLabel="settlements" />
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
