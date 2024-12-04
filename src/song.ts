import { F0 } from './notes';
import { times } from './utils/utils';

export interface Song {
  tempo: number;
  stepsPerBeat: number;
  patternLength: number;
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
  const patternLength = 16;
  return {
    tempo: 120,
    stepsPerBeat: 4,
    patternLength: patternLength,
    pattern: [createEmptyPattern(patternLength)],
  };
}

export function createEmptyPattern(length: number): Pattern {
  return { steps: times(length, () => ({ note: undefined })) };
}
