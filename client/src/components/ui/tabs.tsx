import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  const activeItem = items.find((item) => item.id === value) ?? items[0];

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap gap-2 rounded-[18px] border border-border bg-white/80 p-2 shadow-sm">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={value === item.id}
            className={cn(
              'rounded-[14px] px-4 py-2 text-sm font-semibold transition',
              value === item.id
                ? 'bg-primary text-white shadow-soft'
                : 'text-muted hover:bg-slate-100 hover:text-ink',
            )}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div>{activeItem.content}</div>
    </div>
  );
}
