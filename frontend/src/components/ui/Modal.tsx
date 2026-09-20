"use client";
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('button, input, select, textarea, a')?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const fields = panel.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex="0"]');
        if (!fields?.length) return;
        const first = fields[0], last = fields[fields.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  return <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className="dialog-panel">
      <div className="flex items-center justify-between gap-4 mb-6"><h2 className="text-xl font-semibold">{title}</h2><button type="button" aria-label="Close dialog" className="p-2 rounded-lg hover:bg-slate-100" onClick={onClose}><Icon name="close" /></button></div>
      {children}
    </div>
  </div>;
}
