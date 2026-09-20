"use client";
import { LocalImage } from "@/components/ui/LocalImage";
import { Children, createContext, isValidElement, useContext, useState, useRef, useEffect, useCallback, type ButtonHTMLAttributes, type FormHTMLAttributes, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactElement } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { usePropertyWizard } from '@/components/features/owner/PropertyWizard';
import { useRecord } from './RecordRow';

type Feedback = { notify: (message: string) => void; query: string; setQuery: (value: string) => void; status: string; setStatus: (value: string) => void };
const Context = createContext<Feedback>({ notify: () => {}, query: '', setQuery: () => {}, status: '', setStatus: () => {} });
export function useSearchState() { return useContext(Context); }
export function InteractionProvider({ children }: { children: ReactNode }) {
  const pathname=usePathname();
  return <InteractionState key={pathname}>{children}</InteractionState>;
}
function InteractionState({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string) => { setMessage(text); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setMessage(''), 4500); }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <Context.Provider value={{ notify, query, setQuery, status, setStatus }}>{children}{message && <div role="status" className="toast">{message}</div>}</Context.Provider>;
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { setQuery } = useContext(Context);
  return <input {...props} onChange={event => setQuery(event.target.value)} />;
}
export function FilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { setStatus } = useContext(Context);
  return <select {...props} onChange={event => setStatus(event.target.value === 'all' ? '' : event.target.selectedOptions[0].text.replace(/ Only|All /g, ''))} />;
}
function contentText(value: ReactNode): string {
  return Children.toArray(value).map(child => typeof child === 'string' || typeof child === 'number' ? String(child) : isValidElement<{ children?: ReactNode; initial?: string }>(child) ? child.props.initial || contentText(child.props.children) : '').join(' ');
}
export function DataTable({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  const { query, status } = useContext(Context);
  const [sort, setSort] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [page, setPage] = useState(1);
  const body = Children.toArray(children).find(child => isValidElement(child) && child.type === 'tbody') as ReactElement<{ children?: ReactNode }> | undefined;
  const count = Children.toArray(body?.props.children).filter(row => { const text = contentText(row).toLowerCase(); return isValidElement(row) && text.includes(query.toLowerCase()) && (!status || text.includes(status.toLowerCase().replace(/s$/, ''))); }).length;
  const sections = Children.map(children, section => {
    if (!isValidElement<{ children?: ReactNode }>(section)) return section;
    if (section.type === 'thead') return <thead>{Children.map(section.props.children, row => {
      if (!isValidElement<{ children?: ReactNode }>(row)) return row;
      return <tr>{Children.map(row.props.children, (cell, index) => {
        if (!isValidElement<{ children?: ReactNode; className?: string }>(cell)) return cell;
        return <th className={cell.props.className} aria-sort={sort === index ? direction === 1 ? 'ascending' : 'descending' : 'none'}><button className="text-left w-full" onClick={() => { setSort(index); setDirection(sort === index ? -direction : 1); }}>{cell.props.children}{sort === index && (direction === 1 ? ' ↑' : ' ↓')}</button></th>;
      })}</tr>;
    })}</thead>;
    if (section.type !== 'tbody') return section;
    let rows = Children.toArray(section.props.children).filter(isValidElement) as ReactElement<{ children?: ReactNode }>[];
    rows = rows.filter(row => { const text = contentText(row).toLowerCase(); return text.includes(query.toLowerCase()) && (!status || text.includes(status.toLowerCase().replace(/s$/, ''))); });
    if (sort >= 0) rows.sort((a,b) => contentText(Children.toArray(a.props.children)[sort]).localeCompare(contentText(Children.toArray(b.props.children)[sort]), undefined, { numeric: true }) * direction);
    const current = Math.min(page, Math.max(1, Math.ceil(count / 8)));
    return <tbody>{rows.slice((current - 1) * 8, current * 8)}{!count && <tr><td colSpan={12} className="p-10 text-center text-slate-500">No records match your search. Try another name or clear your filters.</td></tr>}</tbody>;
  });
  return <><div className="table-scroll"><table {...props}>{sections}</table></div>{count > 8 && <div className="flex gap-4 items-center justify-end p-4"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {Math.min(page, Math.ceil(count / 8))} of {Math.ceil(count / 8)}</span><button className="secondary-button" disabled={page >= Math.ceil(count / 8)} onClick={() => setPage(page + 1)}>Next</button></div>}</>;
}

export function SearchableCard({ children, text, ...props }: React.HTMLAttributes<HTMLDivElement> & { text: string }) {
  const { query, status } = useContext(Context);
  if (!text.toLowerCase().includes(query.toLowerCase()) || (status && !text.toLowerCase().includes(status.toLowerCase().replace(/s$/, '')))) return null;
  return <div {...props}>{children}</div>;
}

export function LocalForm({ children, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  const router = useRouter(); const path = usePathname(); const { notify } = useContext(Context);
  return <form {...props} onSubmit={event => {
    event.preventDefault();
    const form = event.currentTarget;
    const passwords = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="password"]'));
    if (passwords.length > 1 && passwords[passwords.length-1].value !== passwords[passwords.length-2].value) { notify('Your passwords do not match. Please try again.'); return; }
    if (path.includes('forgot-password')) router.push('/auth/verify?recovery=1');
    else if (path.includes('reset-password')) router.push('/auth/reset-success');
    else if (path.includes('/auth/register')) { sessionStorage.setItem('stayleb-role', path.includes('owner') ? 'owner' : 'account'); router.push('/auth/verify'); }
    else if (path.includes('/auth/verify')) router.push(new URLSearchParams(location.search).has('recovery') ? '/auth/reset-password' : '/' + (sessionStorage.getItem('stayleb-role') || 'account'));
    else if (path.includes('/auth/login')) { sessionStorage.setItem('stayleb-demo-session', 'true'); router.push('/account'); }
    else { const values = Object.fromEntries(Array.from(new FormData(form)).filter(([key])=>!/password|card|cvc/i.test(key))); localStorage.setItem('stayleb-form:' + path, JSON.stringify(values)); notify('Your changes have been saved on this device.'); }
  }}>{children}</form>;
}

interface ActionProps extends ButtonHTMLAttributes<HTMLButtonElement> { actionLabel: string; hint?: string }
export function ActionButton({ actionLabel, hint = '', children, onClick, ...props }: ActionProps) {
  const { notify, setQuery, setStatus } = useContext(Context); const path = usePathname(); const router = useRouter();
  const [active, setActive] = useState(false); const [removed, setRemoved] = useState(false); const [dialog, setDialog] = useState(''); const [value, setValue] = useState(''); const [count, setCount] = useState(4);
  const ref = useRef<HTMLButtonElement>(null);
  const wizard = usePropertyWizard();
  const record = useRecord();
  const close = useCallback(() => setDialog(''), []);
  if (removed) return null;
  const label = actionLabel.toLowerCase();
  function perform() {
    if (wizard) {
      const step = hint.match(/goToStep\((\d+)\)/);
      if(step){wizard.go(Number(step[1]));return;}
      if(props.id==='btn-wizard-next'){wizard.next();return;}
      if(props.id==='btn-wizard-prev'){wizard.back();return;}
    }
    if (props.type === 'submit') return;
    const form = ref.current?.closest('form');
    if (/sign in|create (client|owner) account|verify code|send verification|reset password/.test(label) && form) { form.requestSubmit(); return; }
    if (label.includes('visibility')) { const input = ref.current?.parentElement?.querySelector('input'); if (input) { input.type = input.type === 'password' ? 'text' : 'password'; setActive(!active); } return; }
    if (/favorite/.test(label)) { setActive(!active); const saved: string[] = JSON.parse(localStorage.getItem('stayleb-favorites') || '[]'); const key = ref.current?.closest('article, [data-property], .group')?.textContent?.slice(0,80) || path; localStorage.setItem('stayleb-favorites', JSON.stringify(active ? saved.filter(id => id !== key) : [...new Set([...saved,key])])); notify(active ? 'Removed from favorites.' : 'Saved to your favorites.'); return; }
    if (/^close$|^cancel$|^dismiss$|continue browsing|keep booking|keep review|go back/.test(label)) { const overlay = ref.current?.closest('[role="dialog"], [id*="modal"], [id*="overlay"]') as HTMLElement | null; if (overlay) overlay.hidden = true; else setRemoved(true); return; }
    if (/^all\b|^upcoming|^pending approval|^completed|^cancelled|^flagged|^published|^clients|^owners|^active\b|^blocked|^outstanding|^settled|mountain chalets|coastal stays/.test(label)) { setStatus(label.startsWith('all') ? '' : actionLabel.replace(/[\d()]/g,'').trim().replace('Pending Approval','Pending')); setActive(true); return; }
    if (/clear|reset|restart_alt/.test(label)) { setQuery(''); setStatus(''); form?.reset(); notify('Filters and selections reset.'); return; }
    if (/download|export|print|receipt/.test(label)) { const rows = Array.from(document.querySelectorAll('table tr')).map(row => Array.from(row.querySelectorAll('th,td')).map(cell => '"'+(cell.textContent || '').trim().replaceAll('"','""')+'"').join(',')); if (!rows.length) { window.print(); return; } const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href=url; anchor.download='stayleb-export.csv'; anchor.click(); URL.revokeObjectURL(url); notify('Export downloaded.'); return; }
    if (/share|content_copy/.test(label)) { navigator.clipboard?.writeText(location.href).then(() => notify('Link copied.')).catch(() => notify('Copy the page address to share this stay.')); return; }
    if (/notifications/.test(label)) { setDialog('Notifications'); return; }
    if (/help|support|concierge|ask host/.test(label)) { setDialog('StayLeb Support'); return; }
    if (/view all|view.*photos|photo_library|grid_view/.test(label)) { setDialog('Property photos'); return; }
    if (/date|calendar_today/.test(label) && !/block|unblock|update/.test(label)) { setDialog('Choose your dates'); return; }
    if (/^group|^guests/.test(label)) { setDialog('Guests'); return; }
    if (/^[-+]$|^remove$|^add$/.test(label)) { const parent = ref.current?.parentElement; const input = parent?.querySelector<HTMLInputElement>('input'); if (input) { input.value = String(Math.max(Number(input.min || 0), Number(input.value || 0) + (label === '-' || label === 'remove' ? -1 : 1))); input.dispatchEvent(new Event('input',{ bubbles:true })); } else { const sibling = parent?.querySelector<HTMLElement>('span:not(.material-symbols-outlined)'); if (sibling && /^\d+$/.test(sibling.textContent || '')) sibling.textContent=String(Math.max(0,Number(sibling.textContent)+(label==='-'?-1:1))); } return; }
    if (/^star$/.test(label)) { setActive(!active); return; }
    if (/toggle_|allowed|not allowed|enforced|flexible|activate|deactivate/.test(label)) { setActive(!active); record?.setStatus(record.status==='Active'?'Inactive':'Active'); notify('Preference updated. Save your changes to keep it.'); return; }
    if (/delete|remove review|block account|reject|cancel booking|cancel request/.test(label)) { setDialog('Confirm '+actionLabel.replace(/delete_forever|delete|cancel|block/g,'').trim()); return; }
    if (/submit review/.test(label)) { const ratings=Array.from(document.querySelectorAll<HTMLInputElement>('input[name^=rating-]')); if(ratings.some(input=>Number(input.value)<1)){notify('Please rate all seven criteria before submitting.');return;}localStorage.setItem('stayleb-review',JSON.stringify({ratings:ratings.map(input=>({criterion:input.name,rating:Number(input.value)})),comment:document.querySelector('textarea')?.value || ''}));notify('Thank you! Your review has been submitted.');router.push('/account/bookings');return; }
    if (/approve|confirm approval|publish|submit review|submit.*review/.test(label)) { setDialog('Confirm '+actionLabel.replace(/check_circle|check/g,'').trim()); return; }
    if (/save|update password|update commission/.test(label)) { if(form) form.requestSubmit(); else { const inputs = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:not([type=password]), textarea, select')); if(inputs.some(input=>!input.reportValidity())) return; localStorage.setItem('stayleb-draft:'+path,JSON.stringify(inputs.map(input=>({name:input.name || input.id, value:input.value})))); notify('Changes saved on this device.'); } return; }
    if (/upload|change photo|photo_camera/.test(label)) { setDialog('Upload property photos'); return; }
    if (/add.*amenity|create master|provision user|add.*season|edit|manual reconcile|mark as settled/.test(label)) { setDialog(actionLabel.replace(/add_circle|person_add|edit|done_all/g,'').trim()); return; }
    if (/^continue|^1 basic|^2 details|^3 pricing|^4 photos|^5 amenities|^6 seasonal|^7 review/.test(label) && path.includes('/properties/new')) { const sections=Array.from(document.querySelectorAll<HTMLElement>('main section, main [id^="step"]')); const next=sections.findIndex(s=>s.getBoundingClientRect().top>100); sections[Math.max(0,next)]?.scrollIntoView({behavior:'smooth'}); notify('Draft saved. Complete the next section to continue.'); return; }
    if (/filter|sort|tune/.test(label)) { setDialog('Refine your search'); return; }
    if (/map|satellite|near_me/.test(label)) { setDialog('Explore Lebanon'); return; }
    if (/mountain|stone villa|secluded|beachfront/.test(label) && path==='/ai-search') { const input=document.querySelector<HTMLTextAreaElement>('textarea'); if(input) input.value=actionLabel; return; }
    if (/ai|generate|refine/.test(label)) { setDialog('StayLeb AI writing assistant'); return; }
    if (/set as primary/.test(label)) { setActive(true); notify('Primary photo updated.'); return; }
    if (/block.*dates|unblock/.test(label)) { setActive(!active); notify(label.includes('unblock') ? 'Selected dates are available again.' : 'Selected dates blocked for private use.'); return; }
    if (/logout|sign out/.test(label)) { fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/auth/logout`, { method: "POST", credentials: "include" }).catch(()=>{}); localStorage.removeItem("stayleb_access_token"); localStorage.removeItem("stayleb_token_type"); localStorage.removeItem("stayleb_role"); sessionStorage.removeItem('stayleb-demo-session'); window.dispatchEvent(new Event("stayleb-auth")); router.push('/auth/login'); return; }
    if (/^\d+$|chevron_left|chevron_right|^previous$|^next$|^west$|^east$/.test(label)) { setActive(!active); const scroll = ref.current?.closest('section')?.querySelector<HTMLElement>('.overflow-x-auto'); scroll?.scrollBy({left:label.includes('left')?-320:320,behavior:'smooth'}); return; }
    setActive(!active);
  }
  return <><button {...props} ref={ref} aria-pressed={active} style={{...props.style, ...(active ? {outline:'2px solid #46b1b1',outlineOffset:2} : {})}} onClick={event => { onClick?.(event); perform(); }}>{children}</button>
  {dialog && <Modal title={dialog} onClose={close}>
    {dialog === 'Notifications' ? <div className="space-y-4"><p className="p-4 rounded-lg bg-slate-50">Your Cedar Peak stay is confirmed. Check-in instructions are ready in My Bookings.</p><p className="p-4 rounded-lg bg-slate-50">New seasonal stays are available in Batroun.</p></div> : dialog === 'Property photos' ? <div className="grid gap-3">{Array.from(document.querySelectorAll<HTMLImageElement>('main img')).slice(0,8).map((img,i)=><LocalImage key={i} src={img.src} alt={img.alt} className="rounded-xl w-full" />)}</div> : dialog==='Guests' ? <div className="flex items-center justify-between"><span>Guests</span><button className="secondary-button" onClick={()=>setCount(Math.max(1,count-1))}>−</button><strong>{count}</strong><button className="secondary-button" onClick={()=>setCount(Math.min(12,count+1))}>+</button></div> : dialog==='Choose your dates' ? <div className="grid gap-4"><label className="field">Check-in<input type="date" min={new Date().toISOString().slice(0,10)} /></label><label className="field">Check-out<input type="date" min={new Date().toISOString().slice(0,10)} /></label><button className="primary-button" onClick={()=>{notify('Stay dates updated.');close();}}>Apply dates</button></div> : dialog==='Upload property photos' ? <label className="field">Choose images<input type="file" accept="image/*" multiple onChange={event=>{ const files=Array.from(event.target.files || []); notify(`${files.length} photo${files.length===1?'':'s'} selected for your listing.`); close();}} /></label> : dialog==='StayLeb Support' ? <div className="space-y-4"><p>Send a message about your stay. This frontend demo keeps your message on this device.</p><textarea aria-label="Support message" className="border rounded-lg w-full p-3" rows={4} value={value} onChange={e=>setValue(e.target.value)} /><button className="primary-button" disabled={!value.trim()} onClick={()=>{localStorage.setItem('stayleb-support-draft',value);notify('Support message saved as a draft.');close();}}>Save message draft</button></div> : dialog==='Explore Lebanon' ? <div className="space-y-3"><p>Explore mountain and coastal destinations.</p>{['Faraya','Faqra','Batroun','Byblos','Chouf','Sour'].map(place=><button key={place} className="secondary-button mr-2" onClick={()=>router.push('/search?location='+place)}>{place}</button>)}</div> : dialog==='Refine your search' ? <form className="space-y-4" onSubmit={e=>{e.preventDefault();setQuery(value);close();}}><label className="field">Location, property, or amenity<input value={value} onChange={e=>setValue(e.target.value)} placeholder="Batroun, pool, chalet..." /></label><button className="primary-button">Apply filters</button></form> : dialog.startsWith('Confirm') ? <div className="space-y-5"><p>This updates the selected record in this local demonstration.</p><label className="field">Reason or note<textarea value={value} onChange={e=>setValue(e.target.value)} rows={3} /></label><div className="flex gap-3"><button className="secondary-button" onClick={close}>Cancel</button><button className="primary-button" onClick={()=>{setActive(true); if(/delete|remove review/.test(label)) record?.remove(); else record?.setStatus(/unblock/.test(label)?'Active':/block account/.test(label)?'Blocked':/reject|cancel/.test(label)?'Cancelled':'Confirmed'); localStorage.setItem('stayleb-action:'+path,JSON.stringify({action:actionLabel,note:value}));notify('Record updated successfully.');close();}}>Confirm</button></div></div> : <form className="space-y-4" onSubmit={e=>{e.preventDefault();localStorage.setItem('stayleb-record:'+dialog, value); record?.setName(value); if(/settled/i.test(label))record?.setStatus('Settled'); notify('Saved successfully.');close();}}><label className="field">{dialog.includes('AI')?'Describe the property':'Name or reference'}<input required value={value} onChange={e=>setValue(e.target.value)} /></label><label className="field">Description<textarea rows={3} /></label>{/Season/.test(dialog)&&<div className="grid grid-cols-2 gap-3"><label className="field">Start date<input required type="date" /></label><label className="field">End date<input required type="date" /></label><label className="field">Nightly rate<input required type="number" min="1" /></label></div>}<button className="primary-button">Save changes</button></form>}
  </Modal>}</>;
}
