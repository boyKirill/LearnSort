import type { PropsWithChildren, TableHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export function Table({ children, className, ...props }: PropsWithChildren<TableHTMLAttributes<HTMLTableElement>>) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-white">
      <div className="overflow-x-auto">
        <table className={cn('min-w-full divide-y divide-border text-sm', className)} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}
