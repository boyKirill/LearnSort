import { Card } from '../../../components/ui/card';
import { ProgressBar } from '../../../components/ui/progress-bar';
import { cn } from '../../../lib/cn';

interface VisualizerPaneProps {
  title: string;
  description?: string;
  values: number[];
  totalSteps: number;
  currentStep: number;
  comparisons: number;
  swaps: number;
  overwrites: number;
  simulatedDurationMs: number;
  completed: boolean;
  comparingIndices: number[];
  swappingIndices: number[];
  overwrittenIndices: number[];
  sortedIndices: number[];
  pivotIndex: number | null;
  logs: string[];
}

function metricLabel(label: string, value: string | number) {
  return (
    <div className="rounded-[16px] border border-border bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}

const legendItems = [
  { label: 'Базовое состояние', colorClass: 'bg-gradient-to-r from-slate-500 to-slate-300' },
  { label: 'Сравнение', colorClass: 'bg-amber-400' },
  { label: 'Обмен', colorClass: 'bg-rose-500' },
  { label: 'Перезапись', colorClass: 'bg-teal-500' },
  { label: 'Опорный элемент', colorClass: 'bg-blue-600' },
  { label: 'Отсортировано', colorClass: 'bg-emerald-500' },
] as const;

export function VisualizerPane({
  title,
  description,
  values,
  totalSteps,
  currentStep,
  comparisons,
  swaps,
  overwrites,
  simulatedDurationMs,
  completed,
  comparingIndices,
  swappingIndices,
  overwrittenIndices,
  sortedIndices,
  pivotIndex,
  logs,
}: VisualizerPaneProps) {
  const maxValue = Math.max(...values, 1);
  const progressValue = (currentStep / Math.max(totalSteps, 1)) * 100;
  const showValueLabels = values.length <= 24;
  const columnGap = values.length <= 24 ? 8 : values.length <= 32 ? 6 : 4;

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      </div>

      <div
        className="grid min-h-[320px] items-end overflow-hidden rounded-[18px] border border-border bg-white px-2 pb-3 pt-6 sm:px-3"
        style={{
          gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`,
          columnGap: `${columnGap}px`,
        }}
      >
        {values.map((value, index) => {
          const isComparing = comparingIndices.includes(index);
          const isSwapping = swappingIndices.includes(index);
          const isOverwritten = overwrittenIndices.includes(index);
          const isSorted = sortedIndices.includes(index);
          const isPivot = pivotIndex === index;

          return (
            <div key={`${index}-${value}`} className="flex min-w-0 flex-col items-center justify-end gap-1">
              {showValueLabels ? (
                <span className="w-full truncate text-center text-[10px] font-semibold text-muted sm:text-xs">
                  {value}
                </span>
              ) : null}
              <div
                className={cn(
                  'w-full rounded-t-[12px] transition-all duration-200',
                  isSorted
                    ? 'bg-emerald-500'
                    : isSwapping
                      ? 'bg-rose-500'
                      : isOverwritten
                        ? 'bg-teal-500'
                        : isComparing
                          ? 'bg-amber-400'
                          : isPivot
                            ? 'bg-blue-600'
                            : 'bg-gradient-to-t from-slate-500 to-slate-300',
                )}
                style={{ height: `${Math.max(18, (value / maxValue) * 236)}px` }}
                aria-label={`Значение ${value} на позиции ${index + 1}`}
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-[18px] border border-border bg-slate-50/80 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Легенда</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-ink"
            >
              <span className={cn('h-3 w-3 rounded-full', item.colorClass)} aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-[18px] border border-border bg-slate-50/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold">Прогресс визуализации</h4>
          <span className="text-sm text-muted">{Math.round(progressValue)}%</span>
        </div>
        <ProgressBar value={progressValue} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricLabel('Сравнения', comparisons)}
        {metricLabel('Обмены', swaps)}
        {metricLabel('Перезаписи', overwrites)}
        {metricLabel('Шаги', `${currentStep}/${totalSteps}`)}
        {metricLabel('Смоделированное время', `${(simulatedDurationMs / 1000).toFixed(1)} c`)}
        {metricLabel('Статус', completed ? 'Завершено' : 'В процессе')}
      </div>

      <div className="rounded-[18px] border border-border bg-slate-50 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Последние 5 действий
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-ink">
          {logs.map((log, index) => (
            <li key={`${index}-${log}`} className="rounded-[14px] bg-white px-3 py-2">
              {log}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
