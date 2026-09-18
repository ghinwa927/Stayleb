'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className="app-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="modal-title">
    <div className="flex items-start justify-between gap-4 mb-5"><h2 id="modal-title" className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="icon-button"><X size={20}/></button></div>{children}
  </dialog>;
}
