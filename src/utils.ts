export function times<T>(length: number, callback: (i: number) => T): T[] {
  return Array.from({ length }, (_el, i) => callback(i));
}

export function range(start: number, end: number): number[] {
  if (start > end) {
    throw new Error(`Start value (${start}) must be less than or equal to the value (${end}).`);
  }

  return times(end - start + 1, (i) => start + i);
}
