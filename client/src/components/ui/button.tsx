import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { LoaderCircle } from 'lucide-react';

import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:-translate-y-0.5 hover:bg-primary/95 active:translate-y-0',
  secondary: 'bg-accent text-white hover:bg-accent/95',
  outline: 'border border-border bg-white text-ink hover:bg-slate-50',
  ghost: 'bg-transparent text-muted hover:bg-slate-100 hover:text-ink',
  destructive: 'bg-destructive text-white hover:bg-destructive/95',
};

export function Button({
  children,
  className,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-semibold transition duration-200',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
