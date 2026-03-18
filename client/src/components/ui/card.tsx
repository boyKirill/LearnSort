import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../lib/cn';

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'glass-card rounded-[18px] border border-white/70 bg-white/90 p-5 shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
