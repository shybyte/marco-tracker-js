import { F0 } from './notes';
import { times } from './utils';

export interface Song {
  pattern: Pattern[];
}

export interface Pattern {
  steps: PatternStep[];
}

export type Note = number;

export interface PatternStep {
  note?: Note;
}

export function createEmptySong(): Song {
  return {
    pattern: [createEmptyPattern(16)],
  };
}

export function createEmptyPattern(length: number): Pattern {
  return { steps: times(length, () => ({ note: undefined })) };
}
