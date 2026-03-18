import { useEffect, useRef, useState } from 'react';

import { buildSortEvents, type AlgorithmSlug, type SortEvent } from './sorting';

interface PlaybackState {
  array: number[];
  cursor: number;
  logs: string[];
  comparisons: number;
  swaps: number;
  overwrites: number;
  steps: number;
  simulatedDurationMs: number;
  sortedIndices: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  overwrittenIndices: number[];
  pivotIndex: number | null;
  completed: boolean;
}

function createInitialState(sourceArray: number[]): PlaybackState {
  return {
    array: [...sourceArray],
    cursor: 0,
    logs: ['Визуализация готова к запуску.'],
    comparisons: 0,
    swaps: 0,
    overwrites: 0,
    steps: 0,
    simulatedDurationMs: 0,
    sortedIndices: [],
    comparingIndices: [],
    swappingIndices: [],
    overwrittenIndices: [],
    pivotIndex: null,
    completed: false,
  };
}

function describeEvent(event: SortEvent) {
  switch (event.type) {
    case 'compare':
      return `Сравнение элементов ${event.indices[0] + 1} и ${event.indices[1] + 1}.`;
    case 'swap':
      return `Обмен элементов ${event.indices[0] + 1} и ${event.indices[1] + 1}.`;
    case 'markSorted':
      return `Позиция ${event.index + 1} помечена как отсортированная.`;
    case 'setPivot':
      return `Выбран опорный элемент на позиции ${event.index + 1}.`;
    case 'overwrite':
      return `Перезапись позиции ${event.index + 1} значением ${event.value}.`;
    case 'done':
      return 'Сортировка завершена.';
  }
}

export function useSortPlayback({
  algorithm,
  sourceArray,
  speedMs,
}: {
  algorithm: AlgorithmSlug;
  sourceArray: number[];
  speedMs: number;
}) {
  const [events, setEvents] = useState(() => buildSortEvents(algorithm, sourceArray));
  const [state, setState] = useState<PlaybackState>(() => createInitialState(sourceArray));
  const [isPlaying, setIsPlaying] = useState(false);
  const speedRef = useRef(speedMs);

  useEffect(() => {
    speedRef.current = speedMs;
  }, [speedMs]);

  useEffect(() => {
    const nextEvents = buildSortEvents(algorithm, sourceArray);
    setEvents(nextEvents);
    setState(createInitialState(sourceArray));
    setIsPlaying(false);
  }, [algorithm, sourceArray]);

  const advanceRef = useRef<() => void>(() => undefined);

  advanceRef.current = () => {
    setState((previous) => {
      if (previous.cursor >= events.length) {
        return previous;
      }

      const event = events[previous.cursor];
      const nextArray = [...previous.array];
      const nextSorted = new Set(previous.sortedIndices);
      let comparisons = previous.comparisons;
      let swaps = previous.swaps;
      let overwrites = previous.overwrites;
      let pivotIndex = previous.pivotIndex;
      let comparingIndices: number[] = [];
      let swappingIndices: number[] = [];
      let overwrittenIndices: number[] = [];
      let completed = previous.completed;

      if (event.type === 'compare') {
        comparisons += 1;
        comparingIndices = [...event.indices];
      }

      if (event.type === 'swap') {
        swaps += 1;
        swappingIndices = [...event.indices];
        [nextArray[event.indices[0]], nextArray[event.indices[1]]] = [
          nextArray[event.indices[1]],
          nextArray[event.indices[0]],
        ];
      }

      if (event.type === 'overwrite') {
        overwrites += 1;
        overwrittenIndices = [event.index];
        nextArray[event.index] = event.value;
      }

      if (event.type === 'markSorted') {
        nextSorted.add(event.index);
      }

      if (event.type === 'setPivot') {
        pivotIndex = event.index;
      }

      if (event.type === 'done') {
        completed = true;
        pivotIndex = null;
        comparingIndices = [];
        swappingIndices = [];
        overwrittenIndices = [];
        nextArray.forEach((_, index) => nextSorted.add(index));
      }

      return {
        array: nextArray,
        cursor: previous.cursor + 1,
        logs: [describeEvent(event), ...previous.logs].slice(0, 5),
        comparisons,
        swaps,
        overwrites,
        steps: previous.steps + 1,
        simulatedDurationMs: previous.simulatedDurationMs + speedRef.current,
        sortedIndices: Array.from(nextSorted).sort((left, right) => left - right),
        comparingIndices,
        swappingIndices,
        overwrittenIndices,
        pivotIndex,
        completed,
      };
    });
  };

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (state.completed || state.cursor >= events.length) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      advanceRef.current();
    }, speedMs);

    return () => window.clearTimeout(timer);
  }, [events.length, isPlaying, speedMs, state.completed, state.cursor]);

  useEffect(() => {
    if (state.completed) {
      setIsPlaying(false);
    }
  }, [state.completed]);

  function start() {
    if (!state.completed) {
      setIsPlaying(true);
    }
  }

  function pause() {
    setIsPlaying(false);
  }

  function stepForward() {
    setIsPlaying(false);
    advanceRef.current();
  }

  function reset() {
    setIsPlaying(false);
    setState(createInitialState(sourceArray));
  }

  return {
    ...state,
    totalSteps: events.length,
    isPlaying,
    start,
    pause,
    stepForward,
    reset,
  };
}
