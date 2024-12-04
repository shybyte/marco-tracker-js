import { F0 } from './notes';
import { times } from './utils/utils';

export interface Song {
  tempo: number;
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
    tempo: 120,
    pattern: [createEmptyPattern(16)],
  };
}

export function createEmptyPattern(length: number): Pattern {
  return { steps: times(length, () => ({ note: undefined })) };
}
