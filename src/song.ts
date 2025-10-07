import { times } from './utils/utils';

export interface Song {
  tempo: number;
  stepsPerBeat: number;
  patternLength: number;
  patterns: Pattern[];
  instruments: string[];
}

export interface Pattern {
  steps: PatternStep[];
}

export type Note = number;

export interface PatternStep {
  notes: Note[];
}

export function createEmptyPatternStep(): PatternStep {
  return { notes: [] };
}

export function createEmptySong(): Song {
  const patternLength = 16;
  return {
    tempo: 120,
    stepsPerBeat: 4,
    patternLength: patternLength,
    instruments: ['marimba'],
    patterns: [createEmptyPattern(patternLength)],
  };
}

export function createEmptyPattern(length: number): Pattern {
  return { steps: times(length, () => createEmptyPatternStep()) };
}
