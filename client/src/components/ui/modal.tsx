import type { PropsWithChildren, ReactNode } from 'react';
import { X } from 'lucide-react';

import { cn } from '../../lib/cn';

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-[18px] border border-white/70 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold">{title}</h3>
            {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-muted hover:bg-slate-100 hover:text-ink"
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mt-5 flex flex-wrap justify-end gap-3', className)}>{children}</div>;
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
