import type { ReactNode } from 'react';

import { Card } from './card';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-primary/10 p-3 text-primary">•</div>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <p className="max-w-xl text-sm text-muted">{description}</p>
      {action}
    </Card>
  );
}
