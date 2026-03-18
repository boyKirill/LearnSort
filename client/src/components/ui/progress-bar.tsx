import { cn } from '../../lib/cn';

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn('h-3 overflow-hidden rounded-full bg-slate-200/80', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-cyan transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
