import { cn } from '../../lib/cn';

type BadgeTone = 'not-started' | 'in-progress' | 'completed' | 'error';

const toneClasses: Record<BadgeTone, string> = {
  'not-started': 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  error: 'bg-destructive/15 text-destructive',
};

export function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}
