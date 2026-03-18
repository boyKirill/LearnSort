import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label;
  const descriptionId = `${inputId}-description`;

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-ink" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? descriptionId : undefined}
        className={cn(
          'rounded-[16px] border bg-white px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-slate-400',
          error ? 'border-destructive focus-visible:ring-destructive/20' : 'border-border',
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={descriptionId} className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
      {!error && helperText ? (
        <span id={descriptionId} className="text-xs text-muted">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
