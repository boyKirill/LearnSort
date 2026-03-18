import { LoaderCircle } from 'lucide-react';

export function LoadingScreen({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
