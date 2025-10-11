export function times<T>(length: number, callback: (i: number) => T): T[] {
  return Array.from({ length }, (_el, i) => callback(i));
}

export function range(start: number, end: number): number[] {
  if (start > end) {
    throw new Error(`Start value (${start}) must be less than or equal to the value (${end}).`);
  }

  return times(end - start + 1, (i) => start + i);
}

export function focusElement(e: HTMLDivElement) {
  setTimeout(() => e.focus());
}

export function getStepTimeInSecondsForBmp(bpm: number, stepsPerBeat: number) {
  return 60 / bpm / stepsPerBeat;
}

export function ensureArrayLength<T>(arrayMut: T[], length: number, fillElement: T) {
  while (arrayMut.length < length) {
    arrayMut.push(structuredClone(fillElement));
  }
}

export function maxBy<T>(items: readonly T[], getValue: (item: T) => number): number {
  let maxValue = Number.NEGATIVE_INFINITY;

  for (const item of items) {
    maxValue = Math.max(maxValue, getValue(item));
  }

  return maxValue === Number.NEGATIVE_INFINITY ? 0 : maxValue;
}

export function setter<Obj extends object, Key extends keyof Obj>(object: Obj, key: Key) {
  return (value: Obj[Key]) => {
    object[key] = value;
  };
}
