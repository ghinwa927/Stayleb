import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SearchResultsGrid, SearchFilters, SortSelect } from "@/components/features/market/ListingSearch";
import { ActionButton } from "@/components/ui/Interactions";

export function SearchResultsSection0() {
  return (
    <div className="w-full min-h-screen bg-[#f8f9ff]">
      {/* Smooth floating search capsule */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#f8f9ff]/80 border-b border-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 md:py-4">
          <div className="bg-white rounded-[999px] shadow-[0_8px_32px_rgba(17,28,45,0.08),0_1px_2px_rgba(17,28,45,0.06)] border border-surface-container-low p-1.5 md:p-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-0">
            <div className="flex-1 flex items-center gap-3 pl-2 pr-4 py-2 md:py-2.5 hover:bg-surface-container-low/70 rounded-full transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Icon name="near_me" className="text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-on-surface-variant">Where</span>
                <span className="text-[14px] font-semibold tracking-tight text-on-surface truncate">Batroun Coast, Lebanon</span>
              </div>
            </div>

            <div className="hidden md:block w-px h-9 bg-surface-container-low shrink-0" />

            <div className="flex-1 flex items-center gap-3 pl-2 pr-4 py-2 md:py-2.5 hover:bg-surface-container-low/70 rounded-full transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0">
                <Icon name="date_range" className="text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-on-surface-variant">When</span>
                <span className="text-[14px] font-semibold text-on-surface truncate">Sep 25 – Sep 28 · 3 nts</span>
              </div>
            </div>

            <div className="hidden md:block w-px h-9 bg-surface-container-low shrink-0" />

            <div className="flex-1 flex items-center gap-3 pl-2 pr-4 py-2 md:py-2.5 hover:bg-surface-container-low/70 rounded-full transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0">
                <Icon name="group" className="text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-on-surface-variant">Who</span>
                <span className="text-[14px] font-semibold text-on-surface truncate">4 Guests · 1 Pet</span>
              </div>
            </div>

            <div className="px-1 pb-1 md:pb-0 md:pr-1 flex">
              <Link
                href="/search"
                className="w-full md:w-auto h-11 md:h-[48px] px-7 rounded-full bg-primary hover:bg-[#277a7c] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(58,154,158,0.35)] hover:shadow-[0_8px_24px_rgba(58,154,158,0.4)] active:scale-[0.98] transition-all duration-300"
              >
                <Icon name="search" className="text-[18px]" />
                Update Search
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header + content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 md:gap-6 pb-6 md:pb-8 border-b border-surface-container-low">
          <div className="space-y-3">
            <nav className="inline-flex items-center gap-1.5 rounded-full bg-white border border-surface-container-low px-2 py-1 text-[12px] shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-surface-container-low font-medium">Lebanon</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant px-1">North Governorate</span>
              <span className="text-outline-variant">/</span>
              <span className="px-2.5 py-1 rounded-full bg-primary text-white font-semibold shadow-sm">Batroun District</span>
            </nav>

            <div>
              <h1 className="text-[26px] md:text-[32px] font-bold tracking-[-0.02em] leading-none text-on-surface">Stays in Batroun Coast</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[13px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-surface-container-low px-3 py-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-on-surface" id="activeCountDisplay">
                    18 properties
                  </span>
                  <span className="text-on-surface-variant">found</span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface-variant">Sep 25 – Sep 28 · 4 guests</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <Icon name="verified" className="text-[14px]" /> Verified Local Hosts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <ActionButton
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-surface-container-low px-3.5 py-2 text-[13px] font-medium text-on-surface-variant hover:bg-surface-container-low shadow-sm transition-colors"
              actionLabel="tune Simulate No Results"
              aria-label="tune Simulate No Results"
            >
              <Icon name="tune" className="text-[16px]" />
              Filters
            </ActionButton>
            <div className="flex items-center gap-2 rounded-full bg-white border border-surface-container-low px-1.5 py-1 shadow-sm">
              <span className="text-[12px] font-medium text-on-surface-variant pl-2.5 hidden sm:inline">Sort</span>
              <SortSelect aria-label="Sort properties" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 pt-6 md:pt-8">
          <SearchFilters />

          <section className="flex-1 w-full min-w-0">
            <SearchResultsGrid />
          </section>
        </div>
      </div>

      {/* Auth gate - smoother frosted modal */}
      <div className="hidden fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-md p-4" id="authGateModal">
        <div className="bg-white rounded-[24px] max-w-md w-full p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)] relative border border-white/60">
          <ActionButton
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            id="closeAuthModalBtn"
            actionLabel="close"
            aria-label="close"
          >
            <Icon name="close" className="text-[18px]" />
          </ActionButton>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md shrink-0">
              <Icon name="favorite" className="text-[22px]" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-primary">StayLeb Wishlist</span>
              <h3 className="text-[16px] font-semibold tracking-tight leading-none mt-0.5">Sign in to save this property</h3>
            </div>
          </div>
          <p className="text-[13px] leading-5 text-on-surface-variant mt-4">
            Create an account or sign in to save your favorite Lebanese chalets and stone retreats to your StayLeb wishlist, track price drops, and share collections.
          </p>

          <div className="mt-6 space-y-2.5">
            <Link
              className="w-full py-3 rounded-full bg-primary text-white text-[14px] font-semibold hover:bg-[#277a7c] transition-colors shadow-[0_8px_20px_rgba(58,154,158,0.35)] flex items-center justify-center gap-2"
              id="modalLoginAction"
              href="/auth/login"
            >
              <Icon name="login" className="text-[18px]" />
              Log In
            </Link>
            <Link
              className="w-full py-3 rounded-full bg-surface-container-low text-on-surface text-[14px] font-semibold hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              id="modalCreateAction"
              href="/auth/register"
            >
              Create Client Account
            </Link>
            <ActionButton
              className="w-full py-2 text-center text-[12px] font-medium text-on-surface-variant hover:text-primary transition-colors"
              id="modalDismissAction"
              actionLabel="Continue Browsing as Guest"
            >
              Continue Browsing as Guest
            </ActionButton>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-container-low text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5">
            <Icon name="lock" className="text-[14px]" /> 256-bit encrypted marketplace authentication
          </div>
        </div>
      </div>
    </div>
  );
}
