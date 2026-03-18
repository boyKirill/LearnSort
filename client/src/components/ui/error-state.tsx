import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from './button';
import { Card } from './card';

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold">{title}</h3>
        <p className="max-w-xl text-sm text-muted">{description}</p>
      </div>
      {action ?? <Button variant="outline">Повторить попытку</Button>}
    </Card>
  );
}
