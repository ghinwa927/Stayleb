'use client';
import { createContext, useContext, useState, useRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type FormHTMLAttributes } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Modal } from './Modal';
import { useFeedback } from './AppProvider';

type ScopeState = { query: string; filter: string; page: number; setQuery: (v: string) => void; setFilter: (v: string) => void; setPage: (v: number) => void };
const Scope = createContext<ScopeState>({ query: '', filter: '', page: 1, setQuery: () => {}, setFilter: () => {}, setPage: () => {} });
export const useDataScope = () => useContext(Scope);
export function DataScope({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState(''); const [page, setPage] = useState(1);
  return <Scope.Provider value={{ query, filter, page, setQuery: v => { setQuery(v); setPage(1); }, setFilter: v => { setFilter(v); setPage(1); }, setPage }}>{children}</Scope.Provider>;
}
export function RecordRow({ children, searchText, className, index = 0 }: { children: ReactNode; searchText: string; className?: string; index?: number }) {
  const { query, filter, page } = useContext(Scope); const text = searchText.toLowerCase();
  const visible = (!query || text.includes(query.toLowerCase())) && (!filter || text.includes(filter.toLowerCase()));
  return visible && (page === 1 || index % 2 === page % 2) ? <tr className={className}>{children}</tr> : null;
}
export function SearchField(props: InputHTMLAttributes<HTMLInputElement>) { const scope = useContext(Scope); return <input {...props} value={scope.query} onChange={e => scope.setQuery(e.target.value)} aria-label={props['aria-label'] || props.placeholder || 'Search records'}/>; }

export function Form({ children, destination, storageKey, className, ...props }: FormHTMLAttributes<HTMLFormElement> & { destination?: string; storageKey?: string }) {
  const router = useRouter(); const { notify } = useFeedback();
  return <form {...props} className={className} onSubmit={e => {
    e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return;
    const passwords = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="password"]'));
    if (passwords.length > 1 && passwords.at(-1)?.value !== passwords.at(-2)?.value) { notify('The passwords do not match. Please try again.'); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    if (storageKey) { for (const key of Object.keys(data)) if (/password|otp|code/i.test(key)) delete data[key]; localStorage.setItem(storageKey, JSON.stringify(data)); }
    notify(destination ? 'Details saved. You can continue.' : 'Your changes have been saved on this device.');
    if (destination) router.push(destination);
  }}>{children}</form>;
}

export function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) { const [visible, setVisible] = useState(false); return <div className="relative"><input {...props} type={visible ? 'text' : 'password'} minLength={8} autoComplete={props.autoComplete || 'current-password'}/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button></div>; }

export function Counter({ label = 'Guests', initial = 1, min = 0, max = 20 }: { label?: string; initial?: number; min?: number; max?: number }) { const [value, setValue] = useState(initial); return <div className="inline-flex items-center gap-4"><button className="counter-button" type="button" disabled={value <= min} onClick={() => setValue(value - 1)} aria-label={`Decrease ${label}`}>−</button><input className="w-10 text-center bg-transparent" aria-label={label} type="number" min={min} max={max} value={value} onChange={e => setValue(Math.min(max, Math.max(min, Number(e.target.value))))}/><button className="counter-button" type="button" disabled={value >= max} onClick={() => setValue(value + 1)} aria-label={`Increase ${label}`}>+</button></div>; }

export function Rating({ label = 'Overall experience' }: { label?: string }) { const [rating, setRating] = useState(0); return <fieldset className="inline-flex gap-1" aria-label={label}>{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" className={`text-3xl ${n <= rating ? 'text-amber-500' : 'text-outline-variant'}`} onClick={() => setRating(n)} aria-label={`${label}: ${n} stars`} aria-pressed={n <= rating}>★</button>)}<input type="hidden" name={label} value={rating}/></fieldset>; }

export function UploadPhotos({ className }: { className?: string }) {
  const input = useRef<HTMLInputElement>(null); const [photos, setPhotos] = useState<string[]>([]); const { notify } = useFeedback();
  return <div className={className}><button type="button" className="button-primary" onClick={() => input.current?.click()}>Browse files</button><input ref={input} type="file" multiple accept="image/*" className="sr-only" aria-label="Upload property photos" onChange={e => { const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024); setPhotos(old => [...old, ...files.map(f => URL.createObjectURL(f))]); notify(`${files.length} photos added to your draft.`); }}/><div className="grid grid-cols-3 gap-2 mt-3">{photos.map(src => <div key={src} className="relative"><img src={src} alt="Uploaded property photograph" className="h-24 w-full object-cover rounded-lg"/><button type="button" aria-label="Remove uploaded photo" onClick={() => { URL.revokeObjectURL(src); setPhotos(photos.filter(p => p !== src)); }} className="absolute top-1 right-1 bg-white rounded-full px-2">×</button></div>)}</div></div>;
}

type Intent = 'notify' | 'confirm' | 'favorite' | 'filter' | 'reset' | 'page' | 'print' | 'export' | 'copy' | 'share' | 'dismiss' | 'generate' | 'toggle' | 'dialog';
export function ContinueButton({ href, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { href: string }) {
  const router = useRouter(); const { notify } = useFeedback(); const path = usePathname();
  return <button {...props} type="button" onClick={e => {
    const root = e.currentTarget.closest('main') || document.body;
    const inputs = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select'));
    if (inputs.some(input => !input.reportValidity())) return;
    const passwords = inputs.filter((input): input is HTMLInputElement => input instanceof HTMLInputElement && input.type === 'password');
    if (passwords.length > 1 && passwords.at(-1)?.value !== passwords.at(-2)?.value) { notify('The passwords do not match.'); return; }
    const data: Record<string,string> = {};
    inputs.forEach(input => { if (!/password|code|otp/i.test(input.name || input.id) && input.type !== 'password') data[input.name || input.id] = input.value; });
    localStorage.setItem(`stayleb:draft:${path}`,JSON.stringify(data));
    if (path === '/login') { const email = inputs.find(i => i.type === 'email')?.value || ''; router.push(email.includes('admin') ? '/admin' : email.includes('owner') ? '/owner' : '/'); notify('Signed in to your local demo account.'); return; }
    if (path === '/booking/payment' && root.querySelector<HTMLInputElement>('input[value="cash"]:checked')) { router.push('/booking/cash-confirmation'); return; }
    router.push(href);
  }}>{children}</button>;
}
export function Action({ intent = 'notify', value = '', destination, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { intent?: Intent; value?: string; destination?: string }) {
  const [selected, setSelected] = useState(false); const [open, setOpen] = useState(false); const [hidden, setHidden] = useState(false);
  const scope = useContext(Scope); const router = useRouter(); const path = usePathname(); const { notify } = useFeedback();
  if (hidden) return null;
  const label = value || 'Update';
  function commit() { setOpen(false); setSelected(true); localStorage.setItem(`stayleb:${path}:${label}`, 'confirmed'); notify(`${label} completed.`); if (destination) router.push(destination); }
  function act(e: React.MouseEvent<HTMLButtonElement>) {
    switch (intent) {
      case 'confirm': case 'dialog': setOpen(true); break;
      case 'favorite': { const next = !selected; setSelected(next); localStorage.setItem(`stayleb:favorite:${value}`, String(next)); notify(next ? 'Property saved to favorites.' : 'Property removed from favorites.'); break; }
      case 'filter': scope.setFilter(value); setSelected(!selected); break;
      case 'reset': scope.setQuery(''); scope.setFilter(''); e.currentTarget.closest('form')?.reset(); notify('Filters cleared.'); break;
      case 'page': scope.setPage(value === 'next' ? scope.page + 1 : value === 'previous' ? Math.max(1, scope.page - 1) : Number(value) || 1); break;
      case 'print': window.print(); break;
      case 'copy': case 'share': navigator.clipboard?.writeText(intent === 'share' ? window.location.href : value || 'STL-2026-0925').then(() => notify('Copied to clipboard.')).catch(() => notify('Clipboard is unavailable in this browser.')); break;
      case 'export': { const rows = Array.from(document.querySelectorAll('tr')).map(row => Array.from(row.querySelectorAll('th,td')).map(cell => `"${(cell.textContent || '').replaceAll('"', '""')}"`).join(',')); const url = URL.createObjectURL(new Blob([rows.join('\n') || 'StayLeb report\nNo records'], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = 'stayleb-report.csv'; a.click(); URL.revokeObjectURL(url); notify('Report downloaded.'); break; }
      case 'dismiss': { const alert = e.currentTarget.closest<HTMLElement>('[id*="alert"],[role="alert"]'); if (alert) alert.hidden = true; else setHidden(true); break; }
      case 'generate': { const field = document.querySelector<HTMLTextAreaElement>('textarea'); if (field) { field.value = 'Discover a peaceful Lebanese escape at Azure Coast Chalet in Sour. Enjoy uninterrupted sea views, a private pool, reliable solar power, and fast Wi-Fi. Two spacious bedrooms welcome families and friends, with the historic souks and golden beaches just minutes away.'; field.dispatchEvent(new Event('input', { bubbles: true })); } notify('A sample description has been added. Review it before saving.'); break; }
      case 'toggle': setSelected(!selected); notify(selected ? 'Setting disabled.' : 'Setting enabled.'); break;
      default: if (destination) router.push(destination); else notify(`${label} saved on this device.`);
    }
  }
  return <><button {...props} type={props.type || 'button'} onClick={act} aria-pressed={['favorite', 'toggle', 'filter'].includes(intent) ? selected : undefined} data-selected={selected || undefined}>{children}</button>{open && <Modal title={label} onClose={() => setOpen(false)}><p className="text-sm text-on-surface-variant mb-5">{intent === 'confirm' ? 'Please confirm this change. It will be saved to your local demo workspace.' : 'Review the details below to continue.'}</p>{intent === 'dialog' && <label className="block text-sm mb-5">Notes<textarea className="form-input mt-2 w-full" rows={3} placeholder="Add your details here"/></label>}<div className="flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="button-primary" onClick={commit}>Confirm</button></div></Modal>}</>;
}
