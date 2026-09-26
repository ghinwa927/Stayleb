"use client";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly icon?: ReactNode;
  readonly error?: string;
  readonly action?: ReactNode;
  readonly hint?: string;
}
export function Field({
  label,
  icon,
  error,
  action,
  hint,
  id,
  type,
  ...props
}: FieldProps) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {action}
      </div>
      <div className="input-wrap">
        <span className="input-icon">
          {icon ?? (password ? <LockKeyhole size={18} /> : null)}
        </span>
        <input
          {...props}
          id={id}
          type={password && visible ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />
        {password && (
          <button
            type="button"
            className="password-toggle"
            aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase().replace(" *", "")}`}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
