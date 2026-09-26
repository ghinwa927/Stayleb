"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
}
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    if (!open && ref.current?.open) ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
