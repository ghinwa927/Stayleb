"use client";
import { LocalImage } from "@/components/ui/LocalImage";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ActionButton } from '@/components/ui/Interactions';
import { logoutRequest } from '@/services/api';

type Area = 'market' | 'account' | 'owner' | 'admin';
const navigation: Record<Exclude<Area,'market'>, [string,string,string][]> = {
  account: [['Dashboard','/account','dashboard'],['My Bookings','/account/bookings','calendar_month'],['Favorites','/account/favorites','favorite'],['Profile / Account','/account/profile','manage_accounts']],
  owner: [['Dashboard','/owner','dashboard'],['My Properties','/owner/properties','cottage'],['Availability','/owner/availability','calendar_month'],['Bookings','/owner/bookings','receipt_long'],['Earnings & Commission','/owner/earnings','payments'],['Guest Reviews','/owner/reviews','reviews'],['Profile / Account','/owner/profile','manage_accounts']],
  admin: [['Dashboard','/admin','dashboard'],['Users','/admin/users','group'],['Property Approvals','/admin/properties','domain_verification'],['Amenities','/admin/amenities','pool'],['Rules','/admin/rules','gavel'],['Commission','/admin/commission','percent'],['Settlements','/admin/settlements','payments'],['Bookings / Financial','/admin/bookings','receipt_long'],['Reviews','/admin/reviews','rate_review'],['Profile / Account','/admin/profile','manage_accounts']],
};
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3 shrink-0 select-none" aria-label="StayLeb">
      <LocalImage src="/images/stayleb-icon.png" alt="" className="h-11 w-11 object-contain shrink-0" />
      <span className="flex flex-col leading-none justify-center">
        <span className={`font-display font-extrabold text-[24px] tracking-tight leading-none antialiased ${light ? "text-white" : "text-[#157375]"}`}>StayLeb</span>
        <span className={`text-[11px] font-bold tracking-[0.2em] uppercase leading-none mt-[1px] ${light ? "text-white/70" : "text-[#157375]/70"}`}>Lebanon Stays</span>
      </span>
    </div>
  );
}
export function AppShell({ area, children }: { area: Area; children: ReactNode }) {
  const path = usePathname(); const router = useRouter(); const [open,setOpen] = useState(false); const [profile,setProfile] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [realName, setRealName] = useState<string | null>(null);
  useEffect(()=>{
    const update = () => {
      setAuthed(!!localStorage.getItem("stayleb_access_token"));
      setRealName(localStorage.getItem("stayleb_full_name"));
    };
    update();
    const h=()=>update();
    window.addEventListener("storage",h); window.addEventListener("stayleb-auth",h);
    // also try to fetch fresh profile if token exists but name not yet stored
    const token = localStorage.getItem("stayleb_access_token");
    const storedName = localStorage.getItem("stayleb_full_name");
    if (token && !storedName) {
      import("@/services/api").then(({ apiFetch }) => {
        apiFetch("/users/me").then((me: { full_name: string }) => {
          if (me?.full_name) {
            localStorage.setItem("stayleb_full_name", me.full_name);
            setRealName(me.full_name);
          }
        }).catch(()=>{});
      });
    }
    return()=>{window.removeEventListener("storage",h); window.removeEventListener("stayleb-auth",h);}
  },[]);
  const workspace = area !== 'market';
  const fallbackName = area==='owner'?'Tony Karam':area==='admin'?'Karim Boustany':'Maya Haddad';
  const name = realName || fallbackName;
  const nav = workspace ? navigation[area] : [['Discover','/','explore'],['Search','/search','search'],['AI Smart Search','/ai-search','auto_awesome']];
  async function handleLogout(){ await logoutRequest(); setAuthed(false); setProfile(false); setRealName(null); window.dispatchEvent(new Event("stayleb-auth")); router.push("/"); }
  return <div className={workspace?'workspace':'marketplace'}>
    {open && <button aria-label="Close navigation" className="fixed inset-0 bg-slate-900/40 z-40 md:hidden" onClick={()=>setOpen(false)} />}
    {workspace && <aside className={`workspace-sidebar fixed left-0 top-0 h-dvh z-50 bg-white flex flex-col border-r border-slate-200 shadow-sm ${open?'open':''}`}>
      <div className="h-[72px] flex items-center px-5 border-b border-slate-100"><Brand /></div><p className="workspace-label px-6 pt-5 pb-2 text-[10px] uppercase tracking-widest text-[#157375]/40 font-semibold">{area==='owner'?'Host Workspace':area==='admin'?'Workspace Navigation':'Your StayLeb'}</p>
      <nav aria-label="Workspace navigation" className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar overscroll-contain">{nav.map(([label,url,icon])=>{const active=path===url || (url!==`/${area}` && path.startsWith(url+'/')); return <Link key={url} href={url} title={label} onClick={()=>setOpen(false)} aria-current={active?'page':undefined} className={`group flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${active?'bg-primary text-white font-semibold shadow-sm':'text-primary hover:bg-primary hover:text-white'}`}><Icon name={icon} className={`text-[20px] ${active?'text-white':'text-primary group-hover:text-white'}`} /><span className={`nav-label ${active?'text-white':'text-primary group-hover:text-white'}`}>{label}</span></Link>})}</nav>
      <div className="p-4 bg-white flex gap-3 items-center border-t border-slate-100"><span className="w-8 h-8 rounded-full bg-[#157375] text-white grid place-items-center shrink-0 font-bold">{name.slice(0,1)}</span><div className="nav-label"><strong className="block text-sm text-[#157375]">{name}</strong><span className="text-xs text-[#157375]/70">{area==='owner'?'Verified Host':area==='admin'?'StayLeb Admin':'Verified Traveler'}</span></div></div>
    </aside>}
    <header className={`fixed top-0 right-0 z-40 border-b ${workspace?'bg-white border-slate-200 text-[#157375] workspace-header h-16 shadow-sm':'bg-white/95 backdrop-blur-md border-slate-100 left-0 h-20'}`}>
      <div className={`${workspace?'':'max-w-7xl mx-auto'} px-4 md:px-6 h-full flex items-center justify-between gap-4`}>
        <div className="flex gap-4 items-center"><button className={`md:hidden p-2 ${workspace?'text-[#157375] hover:bg-slate-100':'text-on-surface'}`} aria-label="Open navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><Icon name="menu" /></button>{!workspace && <Brand />}
          {!workspace && <nav aria-label="Main navigation" className="hidden lg:flex gap-1">{nav.map(([label,url])=><Link key={url} href={url} aria-current={path===url?'page':undefined} className={`px-3 py-2 text-xs rounded-lg hover:bg-slate-100 ${path===url?'text-[#157375] font-semibold':'text-[#157375]/70'}`}>{label}</Link>)}</nav>}
        </div>
        <div className="flex items-center gap-3">{!workspace && !authed && <><Link href="/auth/login" className="hidden sm:block text-xs text-[#157375]/70 hover:text-[#157375]">Log In</Link><Link href="/auth/role" className="bg-[#157375] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#157375]">Sign Up</Link></>}{!workspace && authed && <><Link href="/" className="hidden sm:block text-xs text-[#157375] hover:underline">Explore stays</Link><button onClick={handleLogout} className="hidden sm:block text-xs text-[#157375]/70 hover:text-[#157375]">Log Out</button></>}{workspace && <><ActionButton actionLabel="notifications" aria-label="Notifications" className="p-2 text-[#157375] bg-transparent hover:bg-transparent"><Icon name="notifications" /></ActionButton></>}
          <div className="relative"><button aria-label="Account and workspace menu" aria-expanded={profile} className="w-9 h-9 rounded-full bg-[#157375] text-white text-xs font-bold hover:bg-[#157375]" onClick={()=>setProfile(!profile)}>{workspace?name.split(' ').map(s=>s[0]).join('').toUpperCase():<Icon name="person" className="text-lg" />}</button>{profile && <div className="absolute right-0 top-12 w-56 p-2 rounded-xl border bg-white shadow-xl text-sm">{authed ? <button onClick={handleLogout} className="w-full text-left block p-3 rounded-lg hover:bg-slate-100 text-[#157375]">Log Out</button> : <Link href="/auth/login" onClick={()=>setProfile(false)} className="block p-3 rounded-lg hover:bg-slate-100 text-[#157375]">Sign in</Link>}</div>}</div>
        </div>
      </div>
      {!workspace && open && <nav className="lg:hidden bg-white shadow-lg p-4 grid">{nav.map(([label,url])=><Link className="p-3" key={url} href={url} onClick={()=>setOpen(false)}>{label}</Link>)}</nav>}
    </header>
    <div id="main-content" className="shell-main">{children}</div>
  </div>;
}
