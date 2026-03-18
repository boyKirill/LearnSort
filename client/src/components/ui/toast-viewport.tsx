import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

import { cn } from '../../lib/cn';
import { useToastStore } from '../../lib/toast-store';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastViewport() {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        remove(toast.id);
      }, 3200),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, remove]);

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-40 flex w-[calc(100%-2rem)] max-w-xs flex-col gap-2 sm:right-6">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone];

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-[16px] border bg-white/96 p-3 shadow-lg shadow-slate-900/10 backdrop-blur',
              toast.tone === 'error'
                ? 'border-destructive/20'
                : toast.tone === 'success'
                  ? 'border-success/20'
                  : 'border-primary/20',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 rounded-full p-1.5',
                  toast.tone === 'error'
                    ? 'bg-destructive/10 text-destructive'
                    : toast.tone === 'success'
                      ? 'bg-success/10 text-success'
                      : 'bg-primary/10 text-primary',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold leading-5 text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-5 text-muted">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-muted transition hover:bg-slate-100 hover:text-ink"
                onClick={() => remove(toast.id)}
                aria-label="Закрыть уведомление"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
