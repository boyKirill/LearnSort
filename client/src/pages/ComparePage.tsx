import { useEffect, useState } from 'react';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorState } from '../components/ui/error-state';
import { LoadingScreen } from '../components/ui/loading-screen';
import { api, handleApiError } from '../lib/api';
import type { CompareAlgorithm } from '../types/api';
import { SortingControls } from '../features/modules/components/sorting-controls';
import { VisualizerPane } from '../features/modules/components/visualizer-pane';
import { createRandomArray, type AlgorithmSlug } from '../features/modules/lib/sorting';
import { useSortPlayback } from '../features/modules/lib/use-sort-playback';

const DEFAULT_A = 'bubble-sort';
const DEFAULT_B = 'quick-sort';

export function ComparePage() {
  const [algorithms, setAlgorithms] = useState<CompareAlgorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [algorithmA, setAlgorithmA] = useState<AlgorithmSlug>(DEFAULT_A);
  const [algorithmB, setAlgorithmB] = useState<AlgorithmSlug>(DEFAULT_B);
  const [speed, setSpeed] = useState(260);
  const [arraySize, setArraySize] = useState(18);
  const [sharedArray, setSharedArray] = useState(() => createRandomArray(18));

  const left = useSortPlayback({
    algorithm: algorithmA,
    sourceArray: sharedArray,
    speedMs: speed,
  });

  const right = useSortPlayback({
    algorithm: algorithmB,
    sourceArray: sharedArray,
    speedMs: speed,
  });

  useEffect(() => {
    setSharedArray(createRandomArray(arraySize));
  }, [arraySize]);

  useEffect(() => {
    async function loadAlgorithms() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/compare/algorithms');
        setAlgorithms(response.data);
      } catch (requestError) {
        const message = handleApiError(requestError, 'Не удалось загрузить список алгоритмов.');
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadAlgorithms();
  }, []);

  if (loading) {
    return (
      <div className="page-shell py-10">
        <LoadingScreen text="Подготавливаем режим сравнения..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell py-10">
        <ErrorState
          title="Не удалось открыть compare mode"
          description={error}
          action={<Button onClick={() => window.location.reload()}>Повторить</Button>}
        />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6 py-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Compare Mode</p>
        <h1 className="text-4xl font-extrabold">Сравнение двух алгоритмов на одном и том же массиве</h1>
        <p className="max-w-3xl text-sm text-muted">
          Выберите два алгоритма, запустите их синхронно и сравните количество сравнений, обменов, перезаписей, шагов и общее смоделированное время.
        </p>
      </div>

      <Card className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Алгоритм A</span>
            <select
              className="rounded-[16px] border border-border bg-white px-4 py-3"
              value={algorithmA}
              onChange={(event) => setAlgorithmA(event.target.value as AlgorithmSlug)}
            >
              {algorithms.map((algorithm) => (
                <option key={algorithm.slug} value={algorithm.slug}>
                  {algorithm.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Алгоритм B</span>
            <select
              className="rounded-[16px] border border-border bg-white px-4 py-3"
              value={algorithmB}
              onChange={(event) => setAlgorithmB(event.target.value as AlgorithmSlug)}
            >
              {algorithms.map((algorithm) => (
                <option key={algorithm.slug} value={algorithm.slug}>
                  {algorithm.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {algorithmA === algorithmB ? (
          <div className="rounded-[18px] border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
            Вы выбрали один и тот же алгоритм дважды. Это допустимо: страница не ломается и показывает одинаковое поведение в обеих панелях.
          </div>
        ) : null}
      </Card>

      <SortingControls
        className="sticky top-24 z-20 border border-white/70 bg-white/95 shadow-soft"
        isPlaying={left.isPlaying || right.isPlaying}
        speed={speed}
        size={arraySize}
        onStart={() => {
          left.start();
          right.start();
        }}
        onPause={() => {
          left.pause();
          right.pause();
        }}
        onStep={() => {
          left.stepForward();
          right.stepForward();
        }}
        onReset={() => {
          left.reset();
          right.reset();
        }}
        onNewArray={() => setSharedArray(createRandomArray(arraySize))}
        onSpeedChange={setSpeed}
        onSizeChange={setArraySize}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <VisualizerPane
          title={algorithms.find((item) => item.slug === algorithmA)?.title ?? algorithmA}
          description={algorithms.find((item) => item.slug === algorithmA)?.description}
          values={left.array}
          totalSteps={left.totalSteps}
          currentStep={left.steps}
          comparisons={left.comparisons}
          swaps={left.swaps}
          overwrites={left.overwrites}
          simulatedDurationMs={left.simulatedDurationMs}
          completed={left.completed}
          comparingIndices={left.comparingIndices}
          swappingIndices={left.swappingIndices}
          overwrittenIndices={left.overwrittenIndices}
          sortedIndices={left.sortedIndices}
          pivotIndex={left.pivotIndex}
          logs={left.logs}
        />
        <VisualizerPane
          title={algorithms.find((item) => item.slug === algorithmB)?.title ?? algorithmB}
          description={algorithms.find((item) => item.slug === algorithmB)?.description}
          values={right.array}
          totalSteps={right.totalSteps}
          currentStep={right.steps}
          comparisons={right.comparisons}
          swaps={right.swaps}
          overwrites={right.overwrites}
          simulatedDurationMs={right.simulatedDurationMs}
          completed={right.completed}
          comparingIndices={right.comparingIndices}
          swappingIndices={right.swappingIndices}
          overwrittenIndices={right.overwrittenIndices}
          sortedIndices={right.sortedIndices}
          pivotIndex={right.pivotIndex}
          logs={right.logs}
        />
      </div>
    </div>
  );
}
