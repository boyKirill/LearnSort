export type AlgorithmSlug =
  | 'bubble-sort'
  | 'selection-sort'
  | 'insertion-sort'
  | 'merge-sort'
  | 'quick-sort';

export type SortEvent =
  | { type: 'compare'; indices: [number, number] }
  | { type: 'swap'; indices: [number, number] }
  | { type: 'markSorted'; index: number }
  | { type: 'setPivot'; index: number }
  | { type: 'overwrite'; index: number; value: number }
  | { type: 'done' };

export function createRandomArray(size: number) {
  const values = Array.from({ length: Math.max(5, size) }, (_, index) => index + 10);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values.slice(0, size).map((value) => value + Math.floor(Math.random() * 20));
}

function bubbleSortEvents(source: number[]) {
  const array = [...source];
  const events: SortEvent[] = [];

  for (let outer = 0; outer < array.length; outer += 1) {
    let swapped = false;

    for (let inner = 0; inner < array.length - 1 - outer; inner += 1) {
      events.push({ type: 'compare', indices: [inner, inner + 1] });

      if (array[inner] > array[inner + 1]) {
        [array[inner], array[inner + 1]] = [array[inner + 1], array[inner]];
        events.push({ type: 'swap', indices: [inner, inner + 1] });
        swapped = true;
      }
    }

    events.push({ type: 'markSorted', index: array.length - 1 - outer });

    if (!swapped) {
      for (let index = 0; index < array.length - 1 - outer; index += 1) {
        events.push({ type: 'markSorted', index });
      }
      break;
    }
  }

  events.push({ type: 'done' });
  return events;
}

function selectionSortEvents(source: number[]) {
  const array = [...source];
  const events: SortEvent[] = [];

  for (let start = 0; start < array.length; start += 1) {
    let minIndex = start;

    for (let current = start + 1; current < array.length; current += 1) {
      events.push({ type: 'compare', indices: [minIndex, current] });
      if (array[current] < array[minIndex]) {
        minIndex = current;
      }
    }

    if (minIndex !== start) {
      [array[start], array[minIndex]] = [array[minIndex], array[start]];
      events.push({ type: 'swap', indices: [start, minIndex] });
    }

    events.push({ type: 'markSorted', index: start });
  }

  events.push({ type: 'done' });
  return events;
}

function insertionSortEvents(source: number[]) {
  const array = [...source];
  const events: SortEvent[] = [];

  for (let index = 1; index < array.length; index += 1) {
    const key = array[index];
    let cursor = index - 1;

    while (cursor >= 0) {
      events.push({ type: 'compare', indices: [cursor, cursor + 1] });

      if (array[cursor] > key) {
        array[cursor + 1] = array[cursor];
        events.push({ type: 'overwrite', index: cursor + 1, value: array[cursor] });
        cursor -= 1;
      } else {
        break;
      }
    }

    array[cursor + 1] = key;
    events.push({ type: 'overwrite', index: cursor + 1, value: key });
  }

  for (let index = 0; index < array.length; index += 1) {
    events.push({ type: 'markSorted', index });
  }

  events.push({ type: 'done' });
  return events;
}

function mergeSortEvents(source: number[]) {
  const array = [...source];
  const events: SortEvent[] = [];

  function merge(left: number, middle: number, right: number) {
    const leftPart = array.slice(left, middle + 1);
    const rightPart = array.slice(middle + 1, right + 1);
    let leftIndex = 0;
    let rightIndex = 0;
    let target = left;

    while (leftIndex < leftPart.length && rightIndex < rightPart.length) {
      events.push({
        type: 'compare',
        indices: [left + leftIndex, middle + 1 + rightIndex],
      });

      if (leftPart[leftIndex] <= rightPart[rightIndex]) {
        array[target] = leftPart[leftIndex];
        events.push({ type: 'overwrite', index: target, value: leftPart[leftIndex] });
        leftIndex += 1;
      } else {
        array[target] = rightPart[rightIndex];
        events.push({ type: 'overwrite', index: target, value: rightPart[rightIndex] });
        rightIndex += 1;
      }

      target += 1;
    }

    while (leftIndex < leftPart.length) {
      array[target] = leftPart[leftIndex];
      events.push({ type: 'overwrite', index: target, value: leftPart[leftIndex] });
      leftIndex += 1;
      target += 1;
    }

    while (rightIndex < rightPart.length) {
      array[target] = rightPart[rightIndex];
      events.push({ type: 'overwrite', index: target, value: rightPart[rightIndex] });
      rightIndex += 1;
      target += 1;
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) {
      return;
    }

    const middle = Math.floor((left + right) / 2);
    sort(left, middle);
    sort(middle + 1, right);
    merge(left, middle, right);
  }

  sort(0, array.length - 1);

  for (let index = 0; index < array.length; index += 1) {
    events.push({ type: 'markSorted', index });
  }

  events.push({ type: 'done' });
  return events;
}

function quickSortEvents(source: number[]) {
  const array = [...source];
  const events: SortEvent[] = [];

  function partition(low: number, high: number) {
    const pivot = array[high];
    let smallerIndex = low;
    events.push({ type: 'setPivot', index: high });

    for (let current = low; current < high; current += 1) {
      events.push({ type: 'compare', indices: [current, high] });
      if (array[current] < pivot) {
        if (smallerIndex !== current) {
          [array[smallerIndex], array[current]] = [array[current], array[smallerIndex]];
          events.push({ type: 'swap', indices: [smallerIndex, current] });
        }
        smallerIndex += 1;
      }
    }

    if (smallerIndex !== high) {
      [array[smallerIndex], array[high]] = [array[high], array[smallerIndex]];
      events.push({ type: 'swap', indices: [smallerIndex, high] });
    }

    events.push({ type: 'setPivot', index: smallerIndex });
    events.push({ type: 'markSorted', index: smallerIndex });

    return smallerIndex;
  }

  function sort(low: number, high: number) {
    if (low > high) {
      return;
    }

    if (low === high) {
      events.push({ type: 'markSorted', index: low });
      return;
    }

    const pivotIndex = partition(low, high);
    sort(low, pivotIndex - 1);
    sort(pivotIndex + 1, high);
  }

  sort(0, array.length - 1);
  events.push({ type: 'done' });
  return events;
}

export function buildSortEvents(algorithm: AlgorithmSlug, source: number[]) {
  switch (algorithm) {
    case 'bubble-sort':
      return bubbleSortEvents(source);
    case 'selection-sort':
      return selectionSortEvents(source);
    case 'insertion-sort':
      return insertionSortEvents(source);
    case 'merge-sort':
      return mergeSortEvents(source);
    case 'quick-sort':
      return quickSortEvents(source);
    default:
      return [];
  }
}

export function algorithmLabel(slug: AlgorithmSlug) {
  switch (slug) {
    case 'bubble-sort':
      return 'Bubble Sort';
    case 'selection-sort':
      return 'Selection Sort';
    case 'insertion-sort':
      return 'Insertion Sort';
    case 'merge-sort':
      return 'Merge Sort';
    case 'quick-sort':
      return 'Quick Sort';
  }
}
