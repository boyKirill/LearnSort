import { Pause, Play, RotateCcw, SkipForward, Sparkles } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Slider } from '../../../components/ui/slider';
import { cn } from '../../../lib/cn';

export function SortingControls({
  isPlaying,
  speed,
  size,
  className,
  onStart,
  onPause,
  onStep,
  onReset,
  onNewArray,
  onSpeedChange,
  onSizeChange,
}: {
  isPlaying: boolean;
  speed: number;
  size: number;
  className?: string;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onNewArray: () => void;
  onSpeedChange: (value: number) => void;
  onSizeChange: (value: number) => void;
}) {
  return (
    <Card className={cn('space-y-5', className)}>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onStart}>
          <Play className="h-4 w-4" />
          Старт
        </Button>
        <Button variant="secondary" onClick={onPause} disabled={!isPlaying}>
          <Pause className="h-4 w-4" />
          Пауза
        </Button>
        <Button variant="outline" onClick={onStep}>
          <SkipForward className="h-4 w-4" />
          Следующий шаг
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Сброс
        </Button>
        <Button variant="ghost" onClick={onNewArray}>
          <Sparkles className="h-4 w-4" />
          Новый массив
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Slider label="Скорость (мс)" value={speed} min={80} max={1200} step={20} onChange={onSpeedChange} />
        <Slider label="Размер массива" value={size} min={8} max={40} onChange={onSizeChange} />
      </div>
    </Card>
  );
}
