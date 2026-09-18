'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Menu, X, Bell, ChevronDown, House, LayoutDashboard, Building2, CalendarDays, Wallet, Star, UserRound, Users, ShieldCheck, Waves, ListChecks, SlidersHorizontal, Receipt, Sparkles, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
type Role = 'guest' | 'owner' | 'admin';
const ownerNav = [
  { href: '/owner', label: 'Dashboard', icon: LayoutDashboard }, { href: '/owner/properties', label: 'Properties', icon: Building2 },
  { href: '/owner/bookings', label: 'Bookings', icon: CalendarDays }, { href: '/owner/calendar', label: 'Availability', icon: CalendarDays },
  { href: '/owner/earnings', label: 'Earnings & Commissions', icon: Wallet }, { href: '/owner/reviews', label: 'Reviews', icon: Star }, { href: '/account', label: 'Profile', icon: UserRound },
];
const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard }, { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Property Approvals', icon: ShieldCheck }, { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/amenities', label: 'Amenities', icon: Waves }, { href: '/admin/rules', label: 'Rules', icon: ListChecks },
  { href: '/admin/finances', label: 'Financial Overview', icon: Wallet }, { href: '/admin/settlements', label: 'Commission Settlements', icon: Receipt },
  { href: '/admin/reviews', label: 'Reviews', icon: Star }, { href: '/admin/settings', label: 'Commission Settings', icon: SlidersHorizontal },
];
function Brand({ role }: { role: Role }) { return <Link href={role === 'guest' ? '/' : `/${role}`} className="flex items-center gap-2.5 text-primary"><House size={27}/><span className="font-semibold text-xl tracking-tight">StayLeb{role !== 'guest' && <small className="block text-[9px] tracking-widest uppercase text-on-surface-variant">{role} portal</small>}</span></Link>; }
export function Shell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname(); const [menu, setMenu] = useState(false); const [profile, setProfile] = useState(false); const [notice, setNotice] = useState(false);
  const nav = role === 'admin' ? adminNav : ownerNav;
  const name = role === 'admin' ? 'Nour Mansour' : role === 'owner' ? 'Tarek Haddad' : 'Rami Khoury';
  return <div className={`app-shell ${role}-shell`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {role !== 'guest' && <><button aria-label="Close navigation" className={`mobile-backdrop ${menu ? 'open' : ''}`} onClick={() => setMenu(false)}/><aside className={`app-sidebar ${menu ? 'open' : ''}`}>
      <div className="p-6 flex justify-between items-center"><Brand role={role}/><button className="lg:hidden icon-button" onClick={() => setMenu(false)} aria-label="Close navigation"><X/></button></div>
      <p className="px-6 pb-3 uppercase text-[10px] tracking-widest text-outline">{role === 'owner' ? 'Host management' : 'Management console'}</p>
      <nav className="flex-1 px-3 space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenu(false)} aria-current={pathname === href ? 'page' : undefined} className={`nav-item ${pathname === href || (href.split('/').length > 2 && pathname.startsWith(href + '/')) ? 'active' : ''}`}><Icon size={19}/>{label}</Link>)}</nav>
      <div className="p-5 text-xs text-on-surface-variant"><ShieldCheck size={19} className="text-primary mb-2"/>Host Concierge<br/><Link href="/support" className="text-primary underline">Get support →</Link></div>
    </aside></>}
    <header className="app-header">
      <div className="flex items-center gap-5 min-w-0"><button className="lg:hidden icon-button" aria-label="Open navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu/></button>
      {role === 'guest' ? <><Brand role={role}/><nav className="hidden lg:flex items-center gap-6 text-sm">{[['/', 'Discover'], ['/favorites', 'Favorites'], ['/bookings', 'My Bookings']].map(([href, label]) => <Link key={href} href={href} className={pathname === href ? 'font-semibold text-primary' : ''}>{label}</Link>)}</nav></> : <span className="text-xs text-on-surface-variant hidden sm:block">{role === 'admin' ? 'Admin Portal / Operations' : 'Owner Portal / Overview'}</span>}</div>
      <div className="flex items-center gap-3 sm:gap-5">
        {role === 'guest' && <Link href="/ai-search" className="flex gap-1 items-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1.5 text-xs font-semibold"><Sparkles size={14}/>AI Search</Link>}
        {role !== 'guest' && <span className="hidden xl:flex items-center text-[10px] rounded-full bg-surface-container px-2 py-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"/>{role === 'admin' ? 'Platform Operations Active' : 'Calendar Sync Active'}</span>}
        <Link href="/search" className="hidden md:block" aria-label="Search properties"><Search size={20}/></Link><span className="hidden md:block text-xs font-semibold text-primary">$ USD</span>
        <button className="icon-button relative" onClick={() => setNotice(true)} aria-label="Notifications"><Bell size={20}/><span className="absolute right-1 top-1 w-1.5 h-1.5 bg-error rounded-full"/></button>
        <div className="relative"><button className="flex gap-2 items-center" onClick={() => setProfile(!profile)} aria-label="Account menu" aria-expanded={profile}><span className="rounded-full bg-primary-container text-white text-xs font-semibold w-8 h-8 grid place-items-center">{name.split(' ').map(n => n[0]).join('')}</span><span className="hidden xl:block text-left text-xs font-semibold">{name}<small className="block text-secondary font-normal">{role === 'owner' ? 'Superhost Partner' : role === 'admin' ? 'Platform Administrator' : 'Verified guest'}</small></span><ChevronDown size={15}/></button>
        {profile && <div className="account-menu" role="menu">{[['/account', 'Profile & account'], ['/', 'Explore as guest'], ['/owner', 'Owner portal'], ['/admin', 'Admin portal'], ['/login', 'Sign out']].map(([href, label]) => <Link key={href} href={href} role="menuitem" onClick={() => setProfile(false)}>{label}</Link>)}</div>}</div>
      </div>
    </header>
    {role === 'guest' && menu && <nav className="guest-mobile-nav">{[['/', 'Discover'], ['/favorites', 'Favorites'], ['/bookings', 'My Bookings'], ['/account', 'Profile'], ['/owner', 'Owner portal'], ['/admin', 'Admin portal']].map(([href, label]) => <Link href={href} key={href} onClick={() => setMenu(false)}>{label}</Link>)}</nav>}
    <div className="app-content">{children}</div>
    {role === 'guest' && <footer className="app-footer"><div><strong className="text-primary mr-5">StayLeb</strong>© {new Date().getFullYear()} StayLeb. Lebanese coastal & mountain retreats.</div><nav className="flex gap-5"><Link href="/terms">Terms & Privacy</Link><Link href="/register/owner">Host Your Chalet</Link><Link href="/support">Support Center</Link></nav></footer>}
    {notice && <Modal title="Your notifications" onClose={() => setNotice(false)}><div className="space-y-4 text-sm"><p className="rounded-xl bg-surface-container-low p-4"><strong className="block text-primary mb-1">Welcome to StayLeb</strong>Your profile is ready. Discover your next Lebanese retreat.</p><Link className="button-primary" href={role === 'owner' ? '/owner/bookings' : role === 'admin' ? '/admin/properties' : '/bookings'} onClick={() => setNotice(false)}>View recent activity</Link></div></Modal>}
  </div>;
}
